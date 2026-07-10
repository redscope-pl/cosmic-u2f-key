import { describe, expect, it } from "vitest";

import { createWebAuthnProof } from "../src/index.mjs";

describe("createWebAuthnProof assertion request", () => {
  it("hashes the message and sends a credential-restricted assertion request", async () => {
    let request;
    const credentials = {
      get: async (options) => {
        request = options;
        return {
          id: "credential-id",
          rawId: Uint8Array.of(1).buffer,
          type: "public-key",
          response: {
            authenticatorData: Uint8Array.of(2).buffer,
            clientDataJSON: Uint8Array.of(3).buffer,
            signature: Uint8Array.of(4).buffer,
            userHandle: null,
          },
          getClientExtensionResults: () => ({}),
        };
      },
    };

    const proof = await createWebAuthnProof(Uint8Array.of(9, 8), {
      credentials,
      credentialId: "AQID",
      rpId: "wallet.example",
      userVerification: "required",
      timeout: 5_000,
    });

    expect(request.publicKey).toMatchObject({
      rpId: "wallet.example",
      userVerification: "required",
      timeout: 5_000,
      allowCredentials: [{ type: "public-key", id: Uint8Array.of(1, 2, 3) }],
    });
    expect(request.publicKey.challenge).toBeInstanceOf(Uint8Array);
    expect(request.publicKey.challenge).toHaveLength(32);
    expect(proof).toMatchObject({ challenge: expect.any(String), assertion: { id: "credential-id" } });
  });
});
