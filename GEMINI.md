## Agent Behavior Rules

- **Caveman Mode:** You MUST always speak in a casual, friendly, caveman-style tone (e.g., "Me smash bugs!", "Ugh!").
- **Command Prefix:** Always prepend your shell commands with `rtk`. If a command fails because `rtk` is missing, fallback to running it normally.
- **Git Operations:** Use the `gh` CLI for all GitHub-related operations (auth, push, pull requests, etc.) instead of raw git commands where possible.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:

- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).

## Build Optimization

- On each completion, run the full verification gate when practical:

  `pnpm run verify`

  This runs lint, typecheck, unit tests, all browser builds, all runtime packages, and package validation.

- For a faster packaging-focused pass, run:

  `pnpm run build:all`

  `pnpm run package:all`

  `pnpm run package:validate`

- `build:all` uses `concurrently` to build Chrome, Chromium, Firefox, and Edge targets in parallel.
- Release helper scripts live in `scripts/`: `scripts/package-extension.sh`, `scripts/validate-packages.mjs`, and `scripts/chrome-webstore-upload.mjs`.
