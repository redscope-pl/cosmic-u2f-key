import { stableJson } from "./internal/stableJson.mjs";

const utf8 = new TextEncoder();

/**
 * Step 1 — make transaction intent into bytes that can be challenged.
 *
 * A WebAuthn authenticator signs a challenge, not a JavaScript object. The
 * same transaction must therefore always become the same byte sequence. This
 * default encoder sorts object keys before UTF-8 encoding them. For a real
 * Cosmos transaction pass CosmJS' protobuf SignDoc encoder instead: the
 * resulting proof then binds to the exact bytes the wallet signs.
 */
export function encodeSignDoc(signDoc) {
	return utf8.encode(stableJson(signDoc));
}
