import { describe, expect, it } from "vitest";

import { encodeSignDoc } from "../src/index.mjs";

describe("encodeSignDoc", () => {
  it("encodes equivalent sign documents identically regardless of key order", () => {
    const first = encodeSignDoc({ accountNumber: "7", chainId: "cosmoshub-4", sequence: "2" });
    const second = encodeSignDoc({ sequence: "2", chainId: "cosmoshub-4", accountNumber: "7" });

    expect(first).toEqual(second);
  });
});
