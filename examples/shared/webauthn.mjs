import { makeSignBytes } from "@cosmjs/proto-signing";

import { createWebAuthnCosmosSigner, createWebAuthnProof } from "../../src/index.mjs";

/**
 * Turn a normal CosmJS OfflineDirectSigner into a signer gated by your
 * registered WebAuthn credential. `verifyProof` is deliberately supplied by
 * the application because only its server knows the credential public key.
 */
export function withWebAuthnApproval({
	signer,
	credentialId,
	rpId,
	requestAuthorization,
	verifyProof,
	encode = makeSignBytes,
	...proofOptions
}) {
	if (typeof requestAuthorization !== "function") {
		throw new TypeError("requestAuthorization must obtain a server-issued challenge for the transaction bytes");
	}
	return createWebAuthnCosmosSigner({
    signer,
    credentialId,
		rpId,
		encode,
		createProof: async (transactionBytes) => {
			// Server persists { authorizationId, challenge, transactionDigest,
			// expiresAt } before returning this safe browser-facing subset.
			const authorization = await requestAuthorization({ transactionBytes });
			const proof = await createWebAuthnProof(transactionBytes, {
				credentialId,
				rpId,
				challenge: authorization.challenge,
				...proofOptions,
			});
			return { ...proof, authorizationId: authorization.authorizationId };
		},
		onProof: async (payload) => {
			// verifyProof must look up/verify/atomically consume authorizationId.
			// Rejecting here prevents Cosmos signing and therefore broadcasting.
      const accepted = await verifyProof(payload);
      if (!accepted) throw new Error("The server rejected the WebAuthn proof");
    },
  });
}
