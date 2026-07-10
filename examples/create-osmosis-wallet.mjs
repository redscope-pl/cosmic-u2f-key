import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";

/** Creates a fresh Osmosis wallet. Persist its mnemonic in a secure wallet vault. */
export async function createOsmosisWallet() {
  return DirectSecp256k1HdWallet.generate(24, { prefix: "osmo" });
}
