/**
 * Development storage for a verified WebAuthn credential and its sign counter.
 * Only register credentials after a separate verified WebAuthn registration.
 */
export function createInMemoryCredentialStore() {
	const records = new Map();
	return {
		register(credential, counter = 0) {
			if (!credential?.id || !credential.publicKey || !credential.algorithm) {
				throw new TypeError("credential must contain id, publicKey, and algorithm");
			}
			if (!Number.isSafeInteger(counter) || counter < 0) throw new TypeError("counter must be a non-negative integer");
			records.set(credential.id, { credential, counter });
		},
		get(credentialId) {
			return records.get(credentialId);
		},
		updateCounter(credentialId, counter) {
			const record = records.get(credentialId);
			if (!record || !Number.isSafeInteger(counter) || counter < record.counter) return false;
			record.counter = counter;
			return true;
		},
	};
}
