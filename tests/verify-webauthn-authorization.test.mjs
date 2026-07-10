import { describe, expect, it } from "vitest";

import { createTransactionChallenge, verifyWebAuthnAuthorization } from "../src/index.mjs";

describe("verifyWebAuthnAuthorization", () => {
	it("verifies the stored challenge before atomically consuming its authorization", async () => {
		let randomInvocation = 0;
		const transactionBytes = Uint8Array.of(9, 8);
		const authorization = await createTransactionChallenge(transactionBytes, {
			now: () => Date.UTC(2026, 0, 1),
			getRandomValues: (target) => {
				target.fill(++randomInvocation);
				return target;
			},
		});
		let expected;
		let consumed;

		await expect(verifyWebAuthnAuthorization({
			assertion: { id: "credential" },
			credential: { id: "credential" },
			authorization,
			transactionBytes,
			origin: "https://wallet.example",
			rpId: "wallet.example",
			now: () => Date.UTC(2026, 0, 1),
			verifyAuthentication: async (_assertion, _credential, checks) => {
				expected = checks;
				return { counter: 4, userVerified: true };
			},
			consume: async (authorizationId) => {
				consumed = authorizationId;
				return true;
			},
		})).resolves.toEqual({ counter: 4, userVerified: true });

		// The verifier receives the RP/origin constraints and only consumes the
		// record after its cryptographic check has accepted the assertion.
		expect(expected).toMatchObject({ challenge: authorization.challenge, origin: "https://wallet.example", domain: "wallet.example", userVerified: true });
		expect(consumed).toBe(authorization.authorizationId);
	});

	it("rejects transaction bytes that differ from the stored authorization record", async () => {
		const authorization = await createTransactionChallenge(Uint8Array.of(1), {
			getRandomValues: (target) => target.fill(1),
		});
		await expect(verifyWebAuthnAuthorization({
			authorization,
			transactionBytes: Uint8Array.of(2),
			origin: "https://wallet.example",
			rpId: "wallet.example",
			consume: async () => true,
		})).rejects.toThrow("Transaction bytes do not match");
	});
});
