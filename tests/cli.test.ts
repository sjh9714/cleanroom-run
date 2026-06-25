import { describe, expect, it } from "vitest";
import { resolvePolicy, validateCliPolicyFlags } from "../src/cli.js";

describe("resolvePolicy", () => {
  it("rejects direct CLI strict and includeUntracked flags together", () => {
    expect(() => validateCliPolicyFlags(new Set(["--strict", "--include-untracked"]))).toThrow(
      "`--strict` cannot be combined with `--include-untracked`"
    );
  });

  it("lets includeUntracked override config strict mode", () => {
    expect(resolvePolicy({ strict: true }, new Set(["--include-untracked"]))).toEqual({
      strict: false,
      includeUntracked: true,
      allowModifiedTracked: false
    });
  });

  it("lets strict override config includeUntracked mode", () => {
    expect(resolvePolicy({ includeUntracked: true, allowModifiedTracked: true }, new Set(["--strict"]))).toEqual({
      strict: true,
      includeUntracked: false,
      allowModifiedTracked: true
    });
  });
});
