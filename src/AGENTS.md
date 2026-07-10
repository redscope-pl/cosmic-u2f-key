# Package source

## Location and purpose

This file applies to `src/`. This directory contains the ESM implementation of the `cosmic-u2f-key` package and should remain the source of truth for its public behavior.

## Contents at this level

- `AGENTS.md` — this contextual note.
- `index.mjs` — the current, presently empty source-module entry point.

## Current state and next reflections

The implementation has not yet begun. Package metadata currently points to `src/index.js`, which does not exist, while this directory provides `index.mjs`; resolve that mismatch before publishing or consuming the package. From there, define a small explicit public API, validate inputs and WebAuthn assumptions at the boundary, and keep browser/client and server-sensitive behavior clearly separated.
