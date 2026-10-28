# happy-turtle

## Style packages

The Figma extraction, CSS generation, and Angular npm package are isolated under
`style-packages/` for local use and future GitHub Actions execution.

```sh
cd style-packages
npm ci
npm run build:styles
npm run pack
```

### Extracting design tokens from Figma

`npm run extract` needs `FIGMA_TOKEN` and `FIGMA_FILE_ID`. Each value is read from
the environment first and falls back to `style-packages/.env` (see `.env.example`)
when unset or empty.

When any token file changes, `npm run extract` bumps the semantic version in
`packages/design-tokens/package.json` (patch by default). If nothing changed, the
version is left as is unless `--force` (or `FORCE_BUMP=true`) is passed. To bump minor
or major instead:

```sh
npm run extract:minor   # or: npm run extract -- --bump minor
npm run extract:major   # or: VERSION_BUMP=major npm run extract
npm run extract -- --force   # bump even if no token file changed
```

The **Extract design tokens** workflow (`.github/workflows/extract-design-tokens.yml`)
can be run at any time from **Actions → Extract design tokens → Run workflow**. It runs
`npm run extract` with the selected `bump` (and optionally `npm run build:styles`), then
opens or updates a pull request against `main` from the `automation/extract-design-tokens`
branch. The workflow always bumps the version (`FORCE_BUMP=true`), even when no token file
changed, so merging the pull request always publishes new npm and NuGet packages.

The publish workflows use the `packages/design-tokens` version for both the Angular npm
package and the MAUI NuGet package. They run automatically when a push to `main` (for
example, merging the extract pull request) changes that version, and can also be run
manually or by publishing a release. When triggered by a release, the release tag
(`v1.2.3` or `1.2.3`) must match that version, otherwise the workflow fails.

One-time repository setup:

- Add the secret `FIGMA_TOKEN` (**Settings → Secrets and variables → Actions**).
- Add `FIGMA_FILE_ID` as a variable or secret, or pass it as the workflow input.
- Enable **Settings → Actions → General → Allow GitHub Actions to create and approve
  pull requests**.
