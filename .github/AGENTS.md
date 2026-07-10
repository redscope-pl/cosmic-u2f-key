# GitHub collaboration area

## Location and purpose

This file applies to `.github/`. This directory holds repository-facing collaboration material and CI-related configuration: contribution policies, Starship CI configuration, and workflow definitions.

## Contents at this level

- `AGENTS.md` — this contextual note.
- `CODE_OF_CONDUCT.md` — community conduct policy.
- `CONTRIBUTING.md` — contributor guidance.
- `starship/` — Starship CI configuration files.
- `workflows/` — GitHub Actions workflow definitions.

## Current state and next reflections

The social-project documents and CI configuration folders are present, but `workflows/` has no workflow files yet. The immediate opportunity is to make the contribution guidance and automated checks agree: add a focused CI workflow for install, formatting/linting, and tests once those commands are established.
