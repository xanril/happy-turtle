# Angular styles demo

This standalone Angular app consumes `@xanril/happy-turtle-styles` from GitHub Packages and demonstrates its light and dark color and typography tokens.

The dependency and lockfile pin `0.0.0-test.20261019064041`, published from the personal `xanril/happy-turtle` repository. Angular copies both CSS files from the installed package into `themes/` during the build.

## Prerequisites

- Node.js `^22.22.3` or `^24.15.0` (Angular 22 refuses older versions; with nvm, run `nvm use 24`).
- A GitHub account. The package is public, but GitHub Packages requires an authenticated token for every npm install, even of public packages. Any account works; no access grant from the package owner is needed.

## Run locally

Authenticate GitHub CLI with `read:packages`, expose its token only for the install, then start Angular:

```sh
gh auth login --scopes read:packages
NODE_AUTH_TOKEN="$(gh auth token)" npm ci
npm start
```

Open `http://localhost:4200`.

Without GitHub CLI, create a classic personal access token with the `read:packages` scope (GitHub → Settings → Developer settings → Personal access tokens) and set `NODE_AUTH_TOKEN` to it for `npm ci`. A missing or unscoped token makes `npm ci` fail with `401 Unauthorized` for `@xanril/happy-turtle-styles`.

The token is only needed to install dependencies; `npm start` and `npm run build` do not use it.

The committed `.npmrc` contains the package registry mapping and an environment-variable placeholder; it does not contain credentials. On networks that intercept TLS, Node may also need the organization's CA bundle through `NODE_EXTRA_CA_CERTS`.

## Publish a new version

From the repository root, dispatch the existing workflow with a new, unused version (no interactive login or prompts):

```sh
GH_PROMPT_DISABLED=1 gh workflow run publish-angular-styles.yml --ref main \
  -f version=0.0.0-test.YYYYMMDDHHMMSS
```

After the workflow succeeds, update the sample from this directory:

```sh
NODE_AUTH_TOKEN="$(gh auth token)" npm install --save-exact \
  @xanril/happy-turtle-styles@0.0.0-test.YYYYMMDDHHMMSS
NODE_AUTH_TOKEN="$(gh auth token)" npm ci
npm run build
```

Use the same new version in both commands and commit the updated dependency and lockfile together. Never reuse a published version.
