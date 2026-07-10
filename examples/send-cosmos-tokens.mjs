import { SigningStargateClient, coin } from "@cosmjs/stargate";

import { withWebAuthnApproval } from "./shared/webauthn.mjs";

/**
 * Request a WebAuthn approval, have the server validate it, then broadcast a
 * native Cosmos bank transfer. `signer` is a normal CosmJS direct signer.
 */
export async function sendCosmosTokens({
  rpcEndpoint,
  signer,
  fromAddress,
  toAddress,
  amount,
  denom,
  credentialId,
  rpId,
  verifyProof,
}) {
  const authorizedSigner = withWebAuthnApproval({ signer, credentialId, rpId, verifyProof });
  const client = await SigningStargateClient.connectWithSigner(rpcEndpoint, authorizedSigner);
  try {
    return await client.sendTokens(fromAddress, toAddress, [coin(amount, denom)], "auto");
  } finally {
    client.disconnect();
  }
}
