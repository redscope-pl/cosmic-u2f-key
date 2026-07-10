import { fromBase64Url } from "../internal/fromBase64Url.mjs";
import { verifyWebAuthnAuthorization } from "../verifyWebAuthnAuthorization.mjs";

/**
 * Create portable Fetch-style endpoints for issue/verify authorization flows.
 *
 * POST /v1/authorizations accepts { transactionBytes: base64url } and returns
 * { authorizationId, challenge, expiresAt }. POST
 * /v1/authorizations/:id/verify accepts { transactionBytes, assertion }.
 * Mount this handler in any Node, edge, or serverless Fetch runtime.
 */
export function createAuthorizationHttpHandler({
	authorizationStore,
	credentialStore,
	origin,
	rpId,
	verifyAuthorization = verifyWebAuthnAuthorization,
} = {}) {
	if (!authorizationStore?.issue || !authorizationStore?.get || !authorizationStore?.consume) {
		throw new TypeError("authorizationStore must implement issue, get, and consume");
	}
	if (!credentialStore?.get || !credentialStore?.updateCounter) {
		throw new TypeError("credentialStore must implement get and updateCounter");
	}
	return async function handleAuthorizationRequest(request) {
		const url = new URL(request.url);
		if (request.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405 });
		let body;
		try {
			body = await request.json();
		} catch {
			return Response.json({ error: "Expected a JSON request body" }, { status: 400 });
		}
		let transactionBytes;
		try {
			transactionBytes = fromBase64Url(body.transactionBytes, "transactionBytes");
		} catch (error) {
			return Response.json({ error: error.message }, { status: 400 });
		}
		if (url.pathname === "/v1/authorizations") {
			const record = await authorizationStore.issue(transactionBytes);
			return Response.json({
				authorizationId: record.authorizationId,
				challenge: record.challenge,
				expiresAt: record.expiresAt,
			}, { status: 201 });
		}
		const match = url.pathname.match(/^\/v1\/authorizations\/([A-Za-z0-9_-]+)\/verify$/);
		if (!match) return Response.json({ error: "Not found" }, { status: 404 });
		const authorization = await authorizationStore.get(match[1]);
		if (!authorization) return Response.json({ error: "Authorization not found or already consumed" }, { status: 404 });
		const credentialRecord = credentialStore.get(body.assertion?.id);
		if (!credentialRecord) return Response.json({ error: "Credential not found" }, { status: 401 });
		try {
			const authentication = await verifyAuthorization({
				assertion: body.assertion,
				credential: credentialRecord.credential,
				authorization,
				transactionBytes,
				origin,
				rpId,
				previousCounter: credentialRecord.counter,
				consume: () => authorizationStore.consume(authorization.authorizationId),
			});
			if (!credentialStore.updateCounter(credentialRecord.credential.id, authentication.counter)) {
				throw new Error("Credential counter could not be persisted");
			}
			return Response.json({ authorized: true, counter: authentication.counter });
		} catch (error) {
			return Response.json({ error: error.message }, { status: 401 });
		}
	};
}
