import { createWebAuthnProof } from "./createWebAuthnProof.mjs";
import { encodeSignDoc } from "./encodeSignDoc.mjs";
import { asBytes } from "./internal/asBytes.mjs";

/**
 * Combine the proof with a normal Cosmos signing wallet.
 *
 * Transaction lifecycle:
 * 1. The app asks this wrapper to sign a Cosmos SignDoc.
 * 2. It encodes that SignDoc and requests a WebAuthn/YubiKey assertion over it.
 * 3. `onProof` receives the proof. Use it to send the proof and transaction to
 *    your verifier. The verifier must accept it before your application
 *    broadcasts the signed transaction.
 * 4. Only after proof creation/reporting, the original signer creates the
 *    usual secp256k1 Cosmos signature. Its return value stays compatible with
 *    CosmJS and InterchainJS clients.
 *
 * Important: `onProof` must reject if remote verification fails. A resolved
 * callback permits the delegate signer to run; this module has no server-side
 * credential database and cannot verify a WebAuthn assertion on its own.
 */
export function createWebAuthnCosmosSigner({
	signer,
	credentialId,
	rpId,
	encode = encodeSignDoc,
	createProof = createWebAuthnProof,
	onProof,
	...proofOptions
} = {}) {
	if (!signer?.getAccounts || !signer?.signDirect) {
		throw new TypeError("signer must implement getAccounts() and signDirect()");
	}
	if (typeof encode !== "function" || typeof createProof !== "function") {
		throw new TypeError("encode and createProof must be functions");
	}

	return {
		getAccounts: () => signer.getAccounts(),
		async signDirect(signerAddress, signDoc) {
			// (1) Turn the exact wallet request into challengeable bytes.
			const bytes = asBytes(await encode(signDoc));
			// (2) Require human/authenticator presence before Cosmos signing begins.
			const proof = await createProof(bytes, {
				credentialId,
				rpId,
				...proofOptions,
			});
			// (3) A thrown verification error stops here, before wallet signing.
			await onProof?.({ signerAddress, signDoc, proof });
			// (4) Produce the actual chain signature using the caller's wallet.
			return signer.signDirect(signerAddress, signDoc);
		},
	};
}
