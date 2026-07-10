/** Return cryptographically secure random bytes from the Web Crypto API. */
export function randomBytes(length, getRandomValues = globalThis.crypto?.getRandomValues?.bind(globalThis.crypto)) {
	if (!Number.isSafeInteger(length) || length <= 0) throw new TypeError("length must be a positive integer");
	if (!getRandomValues) throw new Error("Secure random values are unavailable in this environment");
	return getRandomValues(new Uint8Array(length));
}
