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
