# Starship CI configuration

## Location and purpose

This file applies to `.github/starship/`. The directory appears to define Starship CI environments for multiple blockchain networks used to exercise or validate Cosmos-adjacent behavior.

## Contents at this level

- `AGENTS.md` — this contextual note.
- `cosmos-multiple-chains.config.yaml` — multi-chain Cosmos configuration.
- `ethereum-testnet.config.yaml` — Ethereum testnet configuration.
- `solana-testnet.config.yaml` — Solana testnet configuration.

## Current state and next reflections

Three network-focused configurations are present, suggesting an intended cross-chain testing surface, although no GitHub Actions workflow currently invokes them. Before relying on these environments, confirm which package behaviors each one covers, how credentials and fixtures are supplied, and whether the configurations remain compatible with the current Starship CLI version.
