import { asBytes } from "./asBytes.mjs";

export async function sha256(bytes) {
	const input = asBytes(bytes);
	if (globalThis.crypto?.subtle) {
		return new Uint8Array(
			await globalThis.crypto.subtle.digest("SHA-256", input),
		);
	}
	const { createHash } = await import("node:crypto");
	return new Uint8Array(createHash("sha256").update(input).digest());
}
