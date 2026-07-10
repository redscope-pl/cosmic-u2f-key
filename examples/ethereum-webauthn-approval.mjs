import { Transaction, Wallet, getBytes } from "ethers";

import { createWebAuthnProof } from "../src/index.mjs";

/** Create a new Ethereum wallet. Store its private key using secure wallet storage. */
export function createEthereumWallet() {
  return Wallet.createRandom();
}

/**
 * Ask for WebAuthn approval of already-populated unsigned transaction bytes,
 * verify the proof remotely, then use ethers to produce and send the ECDSA
 * transaction signature. Populate nonce, chainId, fees, and gas limit first.
 */
export async function approveAndSendEthereumTransaction({ wallet, transaction, webauthnOptions, verifyProof }) {
	const populated = await wallet.populateTransaction(transaction);
	const unsignedBytes = getBytes(Transaction.from(populated).unsignedSerialized);
  const proof = await createWebAuthnProof(unsignedBytes, webauthnOptions);
  if (!(await verifyProof({ transaction: populated, proof }))) throw new Error("The server rejected the WebAuthn proof");
  return wallet.sendTransaction(populated);
}
