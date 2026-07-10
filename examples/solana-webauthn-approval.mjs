import { Keypair } from "@solana/web3.js";

import { createWebAuthnProof } from "../src/index.mjs";

/** Create a new Solana keypair. Store `secretKey` using secure wallet storage. */
export function createSolanaWallet() {
  return Keypair.generate();
}

/**
 * Bind WebAuthn approval to Solana's exact compiled message, verify it, then
 * apply the Solana signature. Set feePayer and recentBlockhash before calling.
 */
export async function approveAndSignSolanaTransaction({ transaction, signer, webauthnOptions, verifyProof }) {
  const message = transaction.serializeMessage();
  const proof = await createWebAuthnProof(message, webauthnOptions);
  if (!(await verifyProof({ message, proof }))) throw new Error("The server rejected the WebAuthn proof");
  transaction.sign(signer);
  return transaction;
}
