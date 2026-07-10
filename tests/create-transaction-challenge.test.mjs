import { describe, expect, it } from "vitest";

import { createTransactionChallenge } from "../src/index.mjs";

describe("createTransactionChallenge", () => {
	it("creates a fresh expiring server record bound to transaction bytes", async () => {
		let invocation = 0;
		const record = await createTransactionChallenge(Uint8Array.of(9, 8), {
			expiresInMs: 60_000,
			now: () => Date.UTC(2026, 0, 1),
			getRandomValues: (target) => {
				target.fill(++invocation);
				return target;
			},
		});

		// The application persists this record server-side, sends challenge and
		// authorizationId to its browser, then checks all fields on verification.
		expect(record).toMatchObject({
			authorizationId: expect.stringMatching(/^[A-Za-z0-9_-]+$/),
			challenge: expect.stringMatching(/^[A-Za-z0-9_-]+$/),
			transactionDigest: expect.stringMatching(/^[A-Za-z0-9_-]+$/),
			expiresAt: "2026-01-01T00:01:00.000Z",
		});
		expect(record.authorizationId).not.toBe(record.challenge);
	});
});
