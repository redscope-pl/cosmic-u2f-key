import { base64Url } from "./internal/base64Url.mjs";
import { fromBase64Url } from "./internal/fromBase64Url.mjs";
import { serializeWebAuthnAssertion } from "./serializeWebAuthnAssertion.mjs";

/**
 * Step 2 — ask the selected WebAuthn authenticator (such as a YubiKey) to
 * approve the transaction bytes.
 *
 * 1. Receive the opaque, random, one-time challenge issued by the server for
 *    this transaction. The server record binds it to the transaction digest.
 *    The browser must not derive this from transaction order or wallet data.
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
		challenge,
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
	// `message` stays in the API to make callers keep the proof next to the
	// bytes that the server challenge record commits to. The opaque challenge is
	// deliberately not derived here: deterministic challenges are replayable.
	void message;
	if (typeof challenge !== "string") {
		throw new TypeError("challenge must be the server-issued base64url challenge string");
	}
	const challengeBytes = fromBase64Url(challenge, "challenge");
	const assertion = await credentials.get({
		publicKey: {
			// The browser will include this challenge in the signed assertion data.
			challenge: challengeBytes,
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
		challenge: base64Url(challengeBytes),
		assertion: serializeWebAuthnAssertion(assertion),
	};
}
