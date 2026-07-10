import { asBytes } from "./internal/asBytes.mjs";
import { base64Url } from "./internal/base64Url.mjs";
import { randomBytes } from "./internal/randomBytes.mjs";
import { sha256 } from "./internal/sha256.mjs";

/**
 * Create the server-side record for one transaction authorization attempt.
 *
 * Persist this returned value before sending only `authorizationId` and
 * `challenge` to the browser. Later, recompute `transactionDigest` from the
 * transaction submitted for signing and atomically consume the record after a
 * successful WebAuthn verification. A new record is required for every retry.
 */
export async function createTransactionChallenge(transactionBytes, {
	expiresInMs = 120_000,
	now = Date.now,
	getRandomValues,
} = {}) {
	if (!Number.isSafeInteger(expiresInMs) || expiresInMs <= 0) {
		throw new TypeError("expiresInMs must be a positive integer");
	}
	const transactionDigest = await sha256(asBytes(transactionBytes));
	return {
		authorizationId: base64Url(randomBytes(18, getRandomValues)),
		challenge: base64Url(randomBytes(32, getRandomValues)),
		transactionDigest: base64Url(transactionDigest),
		expiresAt: new Date(now() + expiresInMs).toISOString(),
	};
}
