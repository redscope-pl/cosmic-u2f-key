import { base64Url } from "./internal/base64Url.mjs";

/** Convert an assertion to JSON-safe base64url fields for server-side verification. */
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
