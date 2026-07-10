import { describe, expect, it } from "vitest";

import { createWebAuthnCosmosSigner } from "../src/index.mjs";

describe("createWebAuthnCosmosSigner", () => {
  it("obtains and reports proof before delegating the direct signature", async () => {
    const calls = [];
    const signer = {
      getAccounts: () => [{ address: "cosmos1test" }],
      signDirect: async (address, document) => {
        calls.push(["sign", address, document]);
        return { signed: document, signature: { signature: "cosmos-signature" } };
      },
    };
    const proof = { challenge: "challenge", assertion: { id: "credential" } };
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
    await expect(protectedSigner.signDirect("cosmos1test", signDoc)).resolves.toMatchObject({
      signature: { signature: "cosmos-signature" },
    });
    expect(calls.map(([name]) => name)).toEqual(["proof", "report", "sign"]);
    expect(calls[0][2]).toMatchObject({ credentialId: "AQID", rpId: "wallet.example" });
  });
});
