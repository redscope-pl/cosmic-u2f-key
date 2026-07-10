# GitHub Actions workflows

## Location and purpose

This file applies to `.github/workflows/`. GitHub Actions discovers workflow YAML files in this directory to automate checks, releases, and other repository events.

## Contents at this level

- `AGENTS.md` — this contextual note; there are currently no workflow definitions.

## Current state and next reflections

This workflow area is an intentional or unfilled placeholder. When the package has a working test command, begin with a small pull-request workflow that uses the supported Node.js version, installs from the lockfile, and runs formatting plus tests. Add release automation only after the public entry point and package contents are stable.
