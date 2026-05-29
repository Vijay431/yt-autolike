<a href="https://extension.js.org" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/badge/Powered%20by%20%7C%20Extension.js-0971fe" alt="Powered by Extension.js" align="right" /></a>

# my-extension

> React-based extension with a sidebar panel. Adds a sidebar with a simple page.


![screenshot](./public/screenshot.png)
## Commands

### dev

Run the extension in development mode. Target a browser with `--browser`:

```bash
pnpm run dev
pnpm run dev -- --browser=firefox
pnpm run dev -- --browser=edge
```

### build

Build for production. Convenience scripts target each browser:

```bash
pnpm run build           # Chrome (default)
pnpm run build:firefox
pnpm run build:edge
```

### preview

Preview the production build in the browser:

```bash
pnpm run preview
```

## Learn more

[Extension.js docs](https://extension.js.org).
