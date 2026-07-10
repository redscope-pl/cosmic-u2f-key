import { base64Url } from "./internal/base64Url.mjs";

/**
 * Step 3 — prepare the YubiKey/browser response for transport.
 *
 * WebAuthn returns ArrayBuffers, which cannot be placed in JSON. This turns
 * every binary field into base64url text. Send the result to a relying-party
 * server together with the transaction. That server validates the credential
 * public key, RP ID, origin, challenge, flags, and signature before trusting
 * the proof. This function only serializes; it does not verify or trust it.
 */
export function serializeWebAuthnAssertion(assertion) {
	if (!assertion?.response)
		throw new TypeError("Expected a WebAuthn assertion");
	return {
		id: assertion.id,
		rawId: base64Url(assertion.rawId),
		type: assertion.type,
		response: {
			authenticatorData: base64Url(assertion.response.authenticatorData),
			clientDataJSON: base64Url(assertion.response.clientDataJSON),
			signature: base64Url(assertion.response.signature),
			userHandle: assertion.response.userHandle
				? base64Url(assertion.response.userHandle)
				: undefined,
		},
		clientExtensionResults: assertion.getClientExtensionResults?.() ?? {},
	};
}
