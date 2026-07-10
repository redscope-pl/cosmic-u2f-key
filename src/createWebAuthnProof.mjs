import { base64Url } from "./internal/base64Url.mjs";
import { fromBase64Url } from "./internal/fromBase64Url.mjs";
import { sha256 } from "./internal/sha256.mjs";
import { serializeWebAuthnAssertion } from "./serializeWebAuthnAssertion.mjs";

/** Request a user-presence WebAuthn proof bound to a transaction message. */
export async function createWebAuthnProof(
	message,
	{
		credentialId,
		rpId,
		timeout = 60_000,
		userVerification = "preferred",
		extensions,
		credentials = globalThis.navigator?.credentials,
	} = {},
) {
	if (!credentials?.get)
		throw new Error("WebAuthn is unavailable in this environment");
	const challenge = await sha256(message);
	const assertion = await credentials.get({
		publicKey: {
			challenge,
			rpId,
			timeout,
			userVerification,
			allowCredentials: credentialId
				? [{ id: fromBase64Url(credentialId), type: "public-key" }]
				: undefined,
			extensions,
		},
	});
	if (!assertion) throw new Error("WebAuthn assertion was cancelled");
	return {
		challenge: base64Url(challenge),
		assertion: serializeWebAuthnAssertion(assertion),
	};
}
