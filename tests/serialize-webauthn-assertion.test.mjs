import { describe, expect, it } from "vitest";

import { serializeWebAuthnAssertion } from "../src/index.mjs";

	describe("serializeWebAuthnAssertion", () => {
	it("serializes an assertion into JSON-safe base64url data", () => {
		// Arrange the shape returned by navigator.credentials.get(). A real
		// authenticator provides ArrayBuffers, not JSON strings.
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

		// Assert every binary value is ready to send to a server as JSON.
		expect(serializeWebAuthnAssertion(assertion)).toEqual({
      id: "credential-id",
      rawId: "AQID",
      type: "public-key",
      response: { authenticatorData: "BAU", clientDataJSON: "Bgc", signature: "CAk", userHandle: undefined },
      clientExtensionResults: { credProps: { rk: true } },
    });
  });
});
