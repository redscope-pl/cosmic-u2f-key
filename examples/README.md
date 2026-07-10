# Examples

These are browser-oriented application modules: WebAuthn needs a secure HTTPS
origin and a registered authenticator (for example, a YubiKey). Set your
credential ID, relying-party ID, verifier endpoint, RPC endpoint, and wallet
storage strategy before using them.

WebAuthn authorizes a transaction; it does not replace the chain's native
signature. Each example follows this sequence: prepare exact transaction
bytes, request WebAuthn approval, verify that proof on your server, then use
the chain wallet's normal signing method.

- `create-osmosis-wallet.mjs`, `create-cosmos-wallet.mjs`, and
  `create-cosmoshub-wallet.mjs` create new Cosmos-compatible wallets.
- `get-cosmos-balance.mjs` queries balances without signing.
- `send-cosmos-tokens.mjs` wraps a Cosmos signer with WebAuthn authorization.
- `vote-cosmos-governance.mjs` sends an authorized Cosmos governance vote.
- `approve-sign-doc.mjs` creates a proof for a prebuilt Cosmos SignDoc.
- `solana-webauthn-approval.mjs` and `ethereum-webauthn-approval.mjs` show the
  same approval pattern around non-Cosmos wallets.

Never hard-code mnemonics, private keys, credential IDs, or production RPC
credentials. The `verifyProof` callback must reject when server verification
fails; otherwise the code will proceed to native wallet signing.
