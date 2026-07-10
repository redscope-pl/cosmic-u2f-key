import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";

/** Creates a fresh Cosmos Hub wallet. Cosmos Hub addresses use the `cosmos` prefix. */
export async function createCosmosHubWallet() {
  return DirectSecp256k1HdWallet.generate(24, { prefix: "cosmos" });
}
