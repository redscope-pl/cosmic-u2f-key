# Internal source helpers

This directory holds non-public helpers used by the modules in `src/`. Follow
the security model in `../AGENTS.md`: helpers may convert bytes, encode
base64url, hash values, or make deterministic representations, but they must
not generate predictable WebAuthn approval sequences, handle mnemonics, retain
private keys, or model TOTP shared secrets.

Keep helpers small, dependency-free where possible, and imported only by public
source modules. Applications must use the API re-exported by `src/index.mjs`.
