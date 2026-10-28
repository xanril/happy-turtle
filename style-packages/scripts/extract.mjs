// Runs the Otter Figma Extractor with settings taken from the environment.
// FIGMA_TOKEN is read by the extractor itself; FIGMA_FILE_ID is passed as the file key.
// Values come from the process environment (e.g. GitHub Actions secrets/variables) first,
// falling back to `.env` for any variable that is unset or empty.
//
// After a successful extraction, the design-tokens package version is bumped (semver) when
// any token file changed. Choose the release type with `--bump patch|minor|major` or the
// VERSION_BUMP environment variable (default: patch). Pass `--force` or set FORCE_BUMP=true
// to bump the version even when no token file changed.
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { appendFileSync, existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs, parseEnv } from 'node:util';

const BUMP_TYPES = ['patch', 'minor', 'major'];
const OUTPUT_DIR = fileURLToPath(new URL('../packages/design-tokens/', import.meta.url));
const PACKAGE_JSON = join(OUTPUT_DIR, 'package.json');

const { values: args } = parseArgs({ options: { bump: { type: 'string' }, force: { type: 'boolean' } } });
const bump = args.bump || process.env.VERSION_BUMP || 'patch';
const force = args.force || process.env.FORCE_BUMP === 'true';
if (!BUMP_TYPES.includes(bump)) {
  console.error(`Invalid bump type "${bump}". Expected one of: ${BUMP_TYPES.join(', ')}.`);
  process.exit(1);
}

const REQUIRED = ['FIGMA_TOKEN', 'FIGMA_FILE_ID'];
const envFile = new URL('../.env', import.meta.url);
const fileEnv = existsSync(envFile) ? parseEnv(readFileSync(envFile, 'utf8')) : {};

for (const name of REQUIRED) {
  if (process.env[name]) {
    console.log(`${name}: using environment variable`);
  } else if (fileEnv[name]) {
    process.env[name] = fileEnv[name];
    console.log(`${name}: using .env file`);
  }
}

const missing = REQUIRED.filter((name) => !process.env[name]);
if (missing.length) {
  console.error(`${missing.join(' and ')} must be set as environment variables or in .env (see .env.example).`);
  process.exit(1);
}

const readPackage = () => JSON.parse(readFileSync(PACKAGE_JSON, 'utf8'));

// Hash of every generated token file except package.json, whose version the extractor resets.
const hashTokens = () => {
  const hash = createHash('sha256');
  if (!existsSync(OUTPUT_DIR)) return hash.digest('hex');
  for (const name of readdirSync(OUTPUT_DIR).filter((f) => f.endsWith('.json') && f !== 'package.json').sort()) {
    hash.update(name).update('\0').update(readFileSync(join(OUTPUT_DIR, name))).update('\0');
  }
  return hash.digest('hex');
};

const bumpVersion = (version, type) => {
  const match = /^(\d+)\.(\d+)\.(\d+)(?:[-+].*)?$/.exec(version);
  if (!match) throw new Error(`Current version "${version}" is not a valid semantic version.`);
  const [major, minor, patch] = match.slice(1).map(Number);
  if (type === 'major') return `${major + 1}.0.0`;
  if (type === 'minor') return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
};

const previousVersion = existsSync(PACKAGE_JSON) ? readPackage().version : '0.0.0';
const previousHash = hashTokens();

const cli = createRequire(import.meta.url).resolve('@ama-styling/figma-extractor/cli/figma-extract.js');
const { status } = spawnSync(process.execPath, [
  cli, 'extract-file', process.env.FIGMA_FILE_ID,
  '--output', OUTPUT_DIR,
  '--generatePackage',
  '--packageName', '@happy-turtle/design-tokens'
], { stdio: 'inherit' });

const writeVersion = (version) => {
  const pkg = readPackage();
  pkg.version = version;
  writeFileSync(PACKAGE_JSON, JSON.stringify(pkg, null, 2));
};

if (status !== 0) {
  if (existsSync(PACKAGE_JSON)) writeVersion(previousVersion);
  process.exit(status ?? 1);
}

const changed = hashTokens() !== previousHash;
const version = changed || force ? bumpVersion(previousVersion, bump) : previousVersion;
writeVersion(version);

console.log(changed || force
  ? `Design tokens ${changed ? 'changed' : 'unchanged (forced bump)'}: version ${previousVersion} -> ${version} (${bump}).`
  : `Design tokens unchanged: version kept at ${version}.`);

if (process.env.GITHUB_OUTPUT) {
  appendFileSync(process.env.GITHUB_OUTPUT, `version=${version}\nchanged=${changed}\n`);
}
