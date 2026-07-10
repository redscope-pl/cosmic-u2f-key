import { createTransactionChallenge } from "../createTransactionChallenge.mjs";

/**
 * Development storage for one-time authorization records.
 *
 * Replace this with a database implementation in production. Its `consume`
 * operation must remain atomic across every running server instance.
 */
export function createInMemoryAuthorizationStore({
	createChallenge = createTransactionChallenge,
	now = Date.now,
} = {}) {
	const records = new Map();
	return {
		async issue(transactionBytes, options) {
			const record = await createChallenge(transactionBytes, options);
			records.set(record.authorizationId, record);
			return record;
		},
		async get(authorizationId) {
			const record = records.get(authorizationId);
			return record?.consumedAt ? undefined : record;
		},
		async consume(authorizationId) {
			const record = records.get(authorizationId);
			if (!record || record.consumedAt || now() >= Date.parse(record.expiresAt)) return false;
			record.consumedAt = new Date(now()).toISOString();
			return true;
		},
	};
}
