import { describe, expect, it } from "vitest";

import {
	createAuthorizationHttpHandler,
	createInMemoryAuthorizationStore,
	createInMemoryCredentialStore,
} from "../src/index.mjs";

describe("authorization HTTP endpoints", () => {
	it("issues a challenge, verifies it against stored state, then consumes it", async () => {
		const authorizationStore = createInMemoryAuthorizationStore({
			createChallenge: async () => ({
				authorizationId: "authorization-1",
				challenge: "challenge-1",
				transactionDigest: "digest-1",
				expiresAt: "2099-01-01T00:00:00.000Z",
			}),
		});
		const credentialStore = createInMemoryCredentialStore();
		credentialStore.register({ id: "credential-1", publicKey: "public-key", algorithm: "ES256" });
		const handler = createAuthorizationHttpHandler({
			authorizationStore,
			credentialStore,
			origin: "https://wallet.example",
			rpId: "wallet.example",
			verifyAuthorization: async ({ authorization, transactionBytes, consume }) => {
				expect(authorization.authorizationId).toBe("authorization-1");
				expect(transactionBytes).toEqual(Uint8Array.of(9, 8));
				expect(await consume()).toBe(true);
				return { counter: 3 };
			},
		});

		const issue = await handler(new Request("https://api.example/v1/authorizations", {
			method: "POST",
			body: JSON.stringify({ transactionBytes: "CQg" }),
		}));
		expect(issue.status).toBe(201);
		expect(await issue.json()).toMatchObject({ authorizationId: "authorization-1", challenge: "challenge-1" });

		const verify = await handler(new Request("https://api.example/v1/authorizations/authorization-1/verify", {
			method: "POST",
			body: JSON.stringify({ transactionBytes: "CQg", assertion: { id: "credential-1" } }),
		}));
		expect(verify.status).toBe(200);
		expect(await verify.json()).toEqual({ authorized: true, counter: 3 });
		expect(credentialStore.get("credential-1").counter).toBe(3);
	});
});
