// Runs the Otter Figma Extractor with settings taken from the environment (FR-007).
// FIGMA_TOKEN is read by the extractor itself; FIGMA_FILE_ID is passed as the file key.
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';

const fileId = process.env.FIGMA_FILE_ID;
if (!fileId || !process.env.FIGMA_TOKEN) {
  console.error('FIGMA_TOKEN and FIGMA_FILE_ID must be set (see .env.example).');
  process.exit(1);
}

const cli = createRequire(import.meta.url).resolve('@ama-styling/figma-extractor/cli/figma-extract.js');
const { status } = spawnSync(process.execPath, [
  cli, 'extract-file', fileId,
  '--output', 'packages/design-tokens',
  '--generatePackage',
  '--packageName', '@happy-turtle/design-tokens'
], { stdio: 'inherit' });
process.exit(status ?? 1);
