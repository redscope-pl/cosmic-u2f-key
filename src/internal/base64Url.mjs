import { asBytes } from "./asBytes.mjs";

export function base64Url(bytes) {
	const binary = Array.from(asBytes(bytes), (byte) =>
		String.fromCharCode(byte),
	).join("");
	return btoa(binary)
		.replaceAll("+", "-")
		.replaceAll("/", "_")
		.replaceAll("=", "");
}
