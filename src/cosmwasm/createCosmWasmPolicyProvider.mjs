import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";

/**
 * Read an application's authorization policy from a CosmWasm contract.
 *
 * This is policy discovery, not transaction enforcement. To enforce approvals
 * on-chain, a contract-controlled vault/account must reject execution unless it
 * receives a verifier-authorized, nonce-bound request.
 */
export function createCosmWasmPolicyProvider({
	rpcEndpoint,
	contractAddress,
	queryForAddress = (address) => ({ authorization_policy: { address } }),
	connect = CosmWasmClient.connect,
} = {}) {
	if (!rpcEndpoint || !contractAddress) throw new TypeError("rpcEndpoint and contractAddress are required");
	let client;
	return {
		async getPolicy(address) {
			client ??= await connect(rpcEndpoint);
			return client.queryContractSmart(contractAddress, queryForAddress(address));
		},
		disconnect() {
			client?.disconnect();
			client = undefined;
		},
	};
}
