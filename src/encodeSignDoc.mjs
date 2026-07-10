import { stableJson } from "./internal/stableJson.mjs";

const utf8 = new TextEncoder();

/** Deterministically encode a sign document when no protobuf encoder is supplied. */
export function encodeSignDoc(signDoc) {
	return utf8.encode(stableJson(signDoc));
}
