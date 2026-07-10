import { createWebAuthnProof } from "./createWebAuthnProof.mjs";
import { encodeSignDoc } from "./encodeSignDoc.mjs";
import { asBytes } from "./internal/asBytes.mjs";

/** Wrap a CosmJS/InterchainJS-compatible OfflineDirectSigner with WebAuthn authorization. */
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
			const bytes = asBytes(await encode(signDoc));
			const proof = await createProof(bytes, {
				credentialId,
				rpId,
				...proofOptions,
			});
			await onProof?.({ signerAddress, signDoc, proof });
			return signer.signDirect(signerAddress, signDoc);
		},
	};
}
