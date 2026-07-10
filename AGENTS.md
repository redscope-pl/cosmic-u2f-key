# Repository overview

## Location and purpose

This file applies to the repository root (`.`). The project is an ESM Node.js package named `cosmic-u2f-key`, intended to connect WebAuthn/U2F-capable physical keys with Cosmos-related workflows.

## Contents at this level

- `.agents/`, `.codex/`, `.github/`, `.husky/`, and `.git/` — local agent, automation, hook, and Git metadata.
- `.gitignore`, `README.md`, `Taskfile.yml`, `biome.json`, `package.json`, and `package-lock.json` — project configuration and top-level documentation.
- `docs/`, `scripts/`, `src/`, and `tests/` — documentation, helper scripts, implementation, and tests.
- `node_modules/` — installed dependencies; do not edit this generated directory.

## Current state and next reflections

The repository has package metadata and a lightweight tooling setup, but its visible README, source, and tests are currently empty. `package.json` declares `src/index.js` as the package entry point while the source directory currently contains `index.mjs`; aligning those paths is an early correctness check. A useful next step is to define the public API, add an executable test baseline, and turn the documentation outline into a supported getting-started flow.
