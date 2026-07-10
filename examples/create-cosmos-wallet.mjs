import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";

/** Creates a fresh generic Cosmos-SDK wallet. Persist its mnemonic securely. */
export async function createCosmosWallet() {
  return DirectSecp256k1HdWallet.generate(24, { prefix: "cosmos" });
}
