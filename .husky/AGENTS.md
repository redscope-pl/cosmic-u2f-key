# Local Git hooks

## Location and purpose

This file applies to `.husky/`. Husky stores versioned Git hook scripts here so contributors can run project checks before committing.

## Contents at this level

- `AGENTS.md` — this contextual note.
- `_ /` — Husky-managed helper files (shown as `_` in directory listings); treat as tooling-managed.
- `pre-commit` — the pre-commit hook script.

## Current state and next reflections

The `pre-commit` hook currently contains a commented-out `npm test`, so it performs no check. Once the test suite is meaningful, decide whether a fast formatter/linter and targeted tests belong here; keep hooks short and deterministic so they help rather than block everyday commits.

## 