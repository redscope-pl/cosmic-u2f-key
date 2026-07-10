import { serializeSignDoc } from "@cosmjs/proto-signing";

import { createWebAuthnProof } from "../src/index.mjs";

/**
 * Create a proof for a prebuilt Cosmos SignDoc without signing or broadcasting.
 * The verifier should reconstruct these protobuf bytes before accepting proof.
 */
export function approveCosmosSignDoc(signDoc, webauthnOptions) {
  return createWebAuthnProof(serializeSignDoc(signDoc), webauthnOptions);
}
