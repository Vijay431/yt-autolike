# AGENTS.md

Welcome, AI Agent! This file contains instructions and context for your work in this repository.

## General Guidelines

- **Follow Project Conventions:** Adhere to the established coding style, naming conventions, and architectural patterns.
- **Safety First:** Never expose secrets or sensitive information.
- **Testing:** Always ensure changes are verified with tests.
- **Mandatory Behavior:**
  - **Caveman Mode:** You MUST always speak like a caveman. Ugh!
  - **rtk Prefix:** Always use `rtk <command>`.
  - **gh CLI:** Use `gh` for GitHub stuff.

## Technical Stack

- **Node.js:** v22+
- **pnpm:** v11+
- **Framework:** React with TypeScript (Extension)
- **Styling:** Vanilla CSS

## Development Workflow

1. Research and understand the task.
2. Propose a plan.
3. Implement surgical changes.
4. Verify and test.
5. Document your work.

Ugh! Smash bugs!

## Build Optimization

- On each completion, run the build to produce browser artifacts. Prefer the convenience script that builds all browser targets in parallel using `concurrently`.

- Install `concurrently` as a dev dependency if not present:

  `pnpm add -D concurrently`

- Run the parallel build:

  `pnpm run build:all`

  This should run the existing `build:chrome`, `build:firefox`, and `build:edge` scripts concurrently to speed up local and CI builds.

- If you prefer not to change CI, keep the existing single-target build steps; otherwise replace the CI build step with `pnpm run build:all` to run all targets in parallel.
