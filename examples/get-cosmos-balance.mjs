import { StargateClient } from "@cosmjs/stargate";

/** Read all balances for a Cosmos address. No WebAuthn proof is needed to read chain data. */
export async function getCosmosBalances(rpcEndpoint, address) {
  const client = await StargateClient.connect(rpcEndpoint);
  try {
    return await client.getAllBalances(address);
  } finally {
    client.disconnect();
  }
}
