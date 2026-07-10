# Source architecture and security model

## Purpose and boundary

`src/` is the package implementation. It is **not** a blockchain wallet, a
mnemonic generator, a chain RPC client, or a replacement for Cosmos
secp256k1 signatures. It provides the WebAuthn/FIDO2 authorization layer that
an application can place in front of an existing Cosmos-compatible signer.

The package entry point is `src/index.mjs`, matching `package.json`'s `main`
field. Public functions live in dedicated top-level modules; reusable byte,
hashing, and encoding operations live under `src/internal/`.

## Cryptographic concepts

### Mnemonics and blockchain wallets

A BIP-39 mnemonic is a human-readable encoding of random entropy plus a
checksum. A wallet may combine that entropy with an optional passphrase and
use BIP-32/BIP-44 deterministic derivation paths to produce private keys and
addresses. This makes a recovered mnemonic reproduce the same wallet keys;
it does not make WebAuthn work and it is unrelated to a physical key unless a
separate product deliberately stores or unlocks the mnemonic with one.

The mnemonic is therefore a backup/import representation of wallet entropy,
not an OTP and not a transaction approval mechanism. Never expose it to this
package, WebAuthn APIs, logs, or a verifier endpoint.

### TOTP versus FIDO2/WebAuthn

TOTP starts from a **shared symmetric secret**. Both client and server derive
the same short code from that secret and the current time. It is deliberately
predictable to any party that knows the secret, within its time window.

FIDO2/WebAuthn creates a credential-specific **asymmetric key pair**. The
authenticator keeps the private key; the relying-party server stores only its
public key and credential metadata. For every assertion the authenticator
signs browser and authenticator data that includes a server-provided challenge.
No shared secret or future proof sequence is available to predict. Signature
counters can help detect cloned authenticators, but are not a source of
randomness or an ordering protocol.

Do not turn transaction order, a prior transaction hash, or deterministic
wallet derivation material into a predictable "next proof". That would remove
the freshness property WebAuthn is meant to provide.

## Correct authorization flow

```text
application prepares exact chain transaction bytes
        │
        ├─ server creates one-time, high-entropy challenge and records:
        │  credential ID, expiry, transaction digest, expected RP ID/origin
        │
browser calls navigator.credentials.get({ publicKey: challenge, ... })
        │
authenticator signs the WebAuthn assertion with its private credential key
        │
application sends assertion + transaction identifier to server
        │
server verifies signature, challenge, origin, RP ID, flags, expiry, and
single-use state; it consumes the challenge only on success
        │
application uses normal Cosmos signer to make its secp256k1 transaction
signature and broadcasts only after server authorization
```

The client API requires an opaque server-issued challenge. Use
`createTransactionChallenge` on the server to create a random authorization
record that commits to a transaction digest and expiry, persist it, then send
only its ID and challenge to the browser. Use `verifyWebAuthnAuthorization`
with the stored record and an atomic storage `consume` operation before signing
or broadcasting. The package intentionally leaves database persistence and
HTTP endpoints to the host application.

## Module responsibilities

- `encodeSignDoc.mjs` creates deterministic bytes for a proof. For real Cosmos
  direct signing, use the wallet library's canonical protobuf SignDoc bytes.
- `createWebAuthnProof.mjs` is browser-side: it asks an authenticator for an
  assertion. It cannot establish trust locally.
- `createTransactionChallenge.mjs` creates the server-persisted, one-time
  authorization record containing random challenge, transaction digest, and
  expiry.
- `serializeWebAuthnAssertion.mjs` turns browser `ArrayBuffer` values into
  JSON-safe base64url text for transport.
- `verifyWebAuthnAuthorization.mjs` is server-side: it checks a stored record
  against the exact transaction, delegates WebAuthn cryptographic validation,
  then requires an atomic single-use consume operation.
- `createWebAuthnCosmosSigner.mjs` orders the operations: encode → proof →
  application verifier callback → native `signDirect`. The callback must throw
  when server verification fails.
- `internal/` contains only non-public implementation helpers. Do not import
  it from applications.

## Implementation rules

1. Keep WebAuthn authorization and chain signing visibly separate. Never claim
   a P-256/Ed25519 WebAuthn assertion is a Cosmos secp256k1 signature.
2. Bind approval to canonical, exact transaction bytes—not a display string or
   unordered JavaScript object. Prefer protobuf serialization supplied by the
   chain SDK.
3. Require server-side validation of challenge, origin, RP ID, credential
   public key, signature, user-presence/user-verification flags, and one-time
   expiry. Consume challenges atomically to prevent replay.
4. Never derive WebAuthn challenges from a mnemonic, private key, TOTP secret,
   predictable transaction sequence, or timestamp alone.
5. Do not store private keys, mnemonic words, TOTP secrets, credential private
   material, or production verification records in `src/`. The package must be
   safe to import in browser applications.
6. Keep every exported declaration in its own file and re-export it from
   `index.mjs`; add focused tests for each authorization boundary and rejection
   path.

## Next source work

Before production use, add persistent storage and HTTP endpoints around the
server challenge/verification functions. Tests must cover replay, expired
challenges, wrong origin/RP ID, invalid signatures, counter regressions, and
rejection before the native wallet signer runs.
