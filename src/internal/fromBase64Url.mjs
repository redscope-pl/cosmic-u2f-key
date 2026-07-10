export function fromBase64Url(value) {
	if (typeof value !== "string" || !/^[A-Za-z0-9_-]+$/.test(value)) {
		throw new TypeError("credentialId must be a non-empty base64url string");
	}
	const padded =
		value.replaceAll("-", "+").replaceAll("_", "/") +
		"===".slice((value.length + 3) % 4);
	const binary = atob(padded);
	return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}
