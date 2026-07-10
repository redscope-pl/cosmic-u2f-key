# Examples

These are browser-oriented application modules: WebAuthn needs a secure HTTPS
origin and a registered authenticator (for example, a YubiKey). Set your
credential ID, relying-party ID, verifier endpoint, RPC endpoint, and wallet
storage strategy before using them.

WebAuthn authorizes a transaction; it does not replace the chain's native
signature. Each example follows this sequence: prepare exact transaction
bytes, ask the server to create and persist a one-time authorization record,
request WebAuthn approval with its random challenge, verify and consume that
record on the server, then use the chain wallet's normal signing method.

- `create-osmosis-wallet.mjs`, `create-cosmos-wallet.mjs`, and
  `create-cosmoshub-wallet.mjs` create new Cosmos-compatible wallets.
- `get-cosmos-balance.mjs` queries balances without signing.
- `send-cosmos-tokens.mjs` wraps a Cosmos signer with WebAuthn authorization.
- `vote-cosmos-governance.mjs` sends an authorized Cosmos governance vote.
- `approve-sign-doc.mjs` creates a proof for a prebuilt Cosmos SignDoc.
- `solana-webauthn-approval.mjs` and `ethereum-webauthn-approval.mjs` show the
  same approval pattern around non-Cosmos wallets.

Never hard-code mnemonics, private keys, credential IDs, or production RPC
credentials. In the transfer and vote examples, `requestAuthorization` calls
your server with the exact transaction bytes; it returns `{ authorizationId,
challenge }` from a newly stored `createTransactionChallenge` record.
`verifyProof` must verify the WebAuthn assertion, check the matching transaction
digest and expiry, and atomically consume `authorizationId`. It must reject on
any failure; otherwise the code will proceed to native wallet signing.
