import { base64Url } from "./internal/base64Url.mjs";
import { fromBase64Url } from "./internal/fromBase64Url.mjs";
import { sha256 } from "./internal/sha256.mjs";
import { serializeWebAuthnAssertion } from "./serializeWebAuthnAssertion.mjs";

/**
 * Step 2 — ask the selected WebAuthn authenticator (such as a YubiKey) to
 * approve the transaction bytes.
 *
 * 1. Hash `message` to a fixed 32-byte challenge. The challenge is recorded
 *    by the browser in clientDataJSON, so the returned assertion is tied to
 *    this particular transaction intent.
 * 2. Ask the browser for an assertion, optionally restricting the prompt to
 *    the registered `credentialId` and relying-party `rpId`.
 * 3. Serialize the browser response so it can be persisted or sent to a
 *    server for cryptographic verification.
 *
 * This is a second-factor authorization proof, not a Cosmos signature:
 * WebAuthn keys commonly use P-256/Ed25519 while Cosmos wallets use secp256k1.
 */
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
	// A digest prevents variable-size transaction data from being used directly
	// as a WebAuthn challenge and gives the verifier a stable value to compare.
	const challenge = await sha256(message);
	const assertion = await credentials.get({
		publicKey: {
			// The browser will include this challenge in the signed assertion data.
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
	// Return only JSON-safe data. The caller must have a server verify it.
	return {
		challenge: base64Url(challenge),
		assertion: serializeWebAuthnAssertion(assertion),
	};
}
