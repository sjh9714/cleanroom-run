import { describe, expect, it } from "vitest";
import { resolvePolicy } from "../src/cli.js";

describe("resolvePolicy", () => {
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
