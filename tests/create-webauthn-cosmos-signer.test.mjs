import { describe, expect, it } from "vitest";

import { createWebAuthnCosmosSigner } from "../src/index.mjs";

	describe("createWebAuthnCosmosSigner", () => {
	it("obtains and reports proof before delegating the direct signature", async () => {
		// These fakes model two distinct cryptographic systems: WebAuthn proves
		// user presence, while the wallet produces the Cosmos secp256k1 signature.
		const calls = [];
    const signer = {
      getAccounts: () => [{ address: "cosmos1test" }],
      signDirect: async (address, document) => {
        calls.push(["sign", address, document]);
        return { signed: document, signature: { signature: "cosmos-signature" } };
      },
    };
    const proof = { challenge: "challenge", assertion: { id: "credential" } };
		// Wrap the wallet so its signDirect call is gated by WebAuthn proof.
		const protectedSigner = createWebAuthnCosmosSigner({
      signer,
      encode: () => Uint8Array.of(1),
      createProof: async (bytes, options) => {
        calls.push(["proof", bytes, options]);
        return proof;
      },
      credentialId: "AQID",
      rpId: "wallet.example",
      onProof: ({ signerAddress, proof: receivedProof }) => calls.push(["report", signerAddress, receivedProof]),
    });

    const signDoc = { chainId: "cosmoshub-4" };
		// Execute the complete wrapper flow for one transaction.
		await expect(protectedSigner.signDirect("cosmos1test", signDoc)).resolves.toMatchObject({
      signature: { signature: "cosmos-signature" },
    });
		// This ordering is the security property: a wallet may sign only after
		// proof exists and onProof has had a chance to reject it.
		expect(calls.map(([name]) => name)).toEqual(["proof", "report", "sign"]);
    expect(calls[0][2]).toMatchObject({ credentialId: "AQID", rpId: "wallet.example" });
  });
});
