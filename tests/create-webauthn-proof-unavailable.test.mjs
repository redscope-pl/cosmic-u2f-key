import { describe, expect, it } from "vitest";

import { createWebAuthnProof } from "../src/index.mjs";

	describe("createWebAuthnProof without WebAuthn", () => {
	it("fails clearly when the browser has no WebAuthn credential API", async () => {
		// Server-side Node.js and unsupported browsers must not silently sign.
		await expect(createWebAuthnProof(Uint8Array.of(1), { credentials: undefined })).rejects.toThrow(
      "WebAuthn is unavailable",
    );
  });
});
