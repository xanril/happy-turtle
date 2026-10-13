# Angular styles demo

This standalone Angular app consumes `@pkmitra_amadeus/happy-turtle-styles` from GitHub Packages and demonstrates its light and dark color and typography tokens.

## Run locally

Authenticate GitHub CLI with `read:packages`, expose its token only for the install, then start Angular:

```sh
export NODE_AUTH_TOKEN="$(gh auth token)"
npm ci
npm start
```

Open `http://localhost:4200`.

The committed `.npmrc` contains the package registry mapping and an environment-variable placeholder; it does not contain credentials. On networks that intercept TLS, Node may also need the organization's CA bundle through `NODE_EXTRA_CA_CERTS`.
