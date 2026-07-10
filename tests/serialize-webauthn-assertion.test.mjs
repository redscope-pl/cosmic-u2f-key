import { describe, expect, it } from "vitest";

import { serializeWebAuthnAssertion } from "../src/index.mjs";

describe("serializeWebAuthnAssertion", () => {
  it("serializes an assertion into JSON-safe base64url data", () => {
    const assertion = {
      id: "credential-id",
      rawId: Uint8Array.from([1, 2, 3]).buffer,
      type: "public-key",
      response: {
        authenticatorData: Uint8Array.from([4, 5]).buffer,
        clientDataJSON: Uint8Array.from([6, 7]).buffer,
        signature: Uint8Array.from([8, 9]).buffer,
        userHandle: null,
      },
      getClientExtensionResults: () => ({ credProps: { rk: true } }),
    };

    expect(serializeWebAuthnAssertion(assertion)).toEqual({
      id: "credential-id",
      rawId: "AQID",
      type: "public-key",
      response: { authenticatorData: "BAU", clientDataJSON: "Bgc", signature: "CAk", userHandle: undefined },
      clientExtensionResults: { credProps: { rk: true } },
    });
  });
});
