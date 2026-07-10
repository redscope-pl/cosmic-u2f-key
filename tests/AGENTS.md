# Test suite

## Location and purpose

This file applies to `tests/`. This directory is intended for Vitest coverage of client-side and server-side package behavior.

## Contents at this level

- `AGENTS.md` — this contextual note.
- `general-client.test.mjs` — client-focused test file; currently empty.
- `general-server.test.mjs` — server-focused test file; currently empty.

## Current state and next reflections

The test layout anticipates an important client/server boundary, but no assertions have been written yet. Establish a first test around the package's public entry point, use fixtures or mocked WebAuthn data rather than physical-key dependencies in unit tests, and reserve any real-device or chain interaction for clearly labeled integration tests.
