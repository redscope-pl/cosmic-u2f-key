import { describe, expect, it } from "vitest";

import { createWebAuthnProof } from "../src/index.mjs";

describe("createWebAuthnProof without WebAuthn", () => {
  it("fails clearly when the browser has no WebAuthn credential API", async () => {
    await expect(createWebAuthnProof(Uint8Array.of(1), { credentials: undefined })).rejects.toThrow(
      "WebAuthn is unavailable",
    );
  });
});
