import { createWebAuthnCosmosSigner } from "../../src/index.mjs";

/**
 * Turn a normal CosmJS OfflineDirectSigner into a signer gated by your
 * registered WebAuthn credential. `verifyProof` is deliberately supplied by
 * the application because only its server knows the credential public key.
 */
export function withWebAuthnApproval({ signer, credentialId, rpId, verifyProof, encode }) {
  return createWebAuthnCosmosSigner({
    signer,
    credentialId,
    rpId,
    encode,
    onProof: async (payload) => {
      // Rejecting here prevents Cosmos signing and therefore broadcasting.
      const accepted = await verifyProof(payload);
      if (!accepted) throw new Error("The server rejected the WebAuthn proof");
    },
  });
}
