import { server } from "@passwordless-id/webauthn";

import { asBytes } from "./internal/asBytes.mjs";
import { base64Url } from "./internal/base64Url.mjs";
import { sha256 } from "./internal/sha256.mjs";

/**
 * Verify and consume one stored transaction-authorization record on the server.
 *
 * `authorization` must come from storage, selected by the untrusted incoming
 * authorizationId; never accept it directly from the browser. `consume` must
 * atomically change that stored record from active to consumed and return true
 * only once. This prevents two concurrent requests from authorizing one proof.
 */
export async function verifyWebAuthnAuthorization({
	assertion,
	credential,
	authorization,
	transactionBytes,
	origin,
	rpId,
	consume,
	previousCounter,
	now = Date.now,
	verifyAuthentication = server.verifyAuthentication,
} = {}) {
	if (!authorization?.challenge || !authorization?.transactionDigest || !authorization?.expiresAt) {
		throw new TypeError("authorization must be a stored transaction challenge record");
	}
	if (typeof consume !== "function") throw new TypeError("consume must atomically consume authorizationId");
	if (typeof origin !== "string" || typeof rpId !== "string") {
		throw new TypeError("origin and rpId are required for WebAuthn verification");
	}
	const expiresAt = Date.parse(authorization.expiresAt);
	if (!Number.isFinite(expiresAt) || now() >= expiresAt) throw new Error("Authorization challenge has expired");
	const actualDigest = base64Url(await sha256(asBytes(transactionBytes)));
	if (actualDigest !== authorization.transactionDigest) {
		throw new Error("Transaction bytes do not match the authorization challenge");
	}

	const authentication = await verifyAuthentication(assertion, credential, {
		challenge: authorization.challenge,
		origin,
		domain: rpId,
		userVerified: true,
		counter: previousCounter,
	});
	if (!(await consume(authorization.authorizationId))) {
		throw new Error("Authorization challenge was already consumed");
	}
	return authentication;
}
