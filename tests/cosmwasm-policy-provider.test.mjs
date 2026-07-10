import { describe, expect, it } from "vitest";

import { createCosmWasmPolicyProvider } from "../src/index.mjs";

describe("CosmWasm policy provider", () => {
	it("queries policy once through a reusable CosmWasm client", async () => {
		const queryContractSmart = async (...parameters) => ({ parameters, requireUserVerification: true });
		const disconnect = () => undefined;
		const connect = async (endpoint) => {
			expect(endpoint).toBe("https://rpc.example");
			return { queryContractSmart, disconnect };
		};
		const provider = createCosmWasmPolicyProvider({
			rpcEndpoint: "https://rpc.example",
			contractAddress: "wasm1policy",
			connect,
		});

		await expect(provider.getPolicy("cosmos1user")).resolves.toMatchObject({ requireUserVerification: true });
		expect(await provider.getPolicy("cosmos1user")).toMatchObject({
			parameters: ["wasm1policy", { authorization_policy: { address: "cosmos1user" } }],
		});
		provider.disconnect();
	});
});
