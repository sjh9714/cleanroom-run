import { describe, expect, it } from "vitest";
import { normalizeConfig } from "../src/config.js";
import { CleanroomError } from "../src/errors.js";

describe("normalizeConfig", () => {
  it("accepts named checks", () => {
    const config = normalizeConfig({
      checks: {
        verify: {
          command: "npm test",
          timeoutMs: 1000,
          strict: true,
          includeUntracked: false,
          allowModifiedTracked: true
        }
      }
    });

    expect(config.checks.verify?.command).toBe("npm test");
    expect(config.checks.verify?.timeoutMs).toBe(1000);
    expect(config.checks.verify?.strict).toBe(true);
    expect(config.checks.verify?.includeUntracked).toBe(false);
    expect(config.checks.verify?.allowModifiedTracked).toBe(true);
  });

  it("rejects checks that combine strict and includeUntracked", () => {
    expect(() =>
      normalizeConfig({
        checks: {
          verify: {
            command: "npm test",
            strict: true,
            includeUntracked: true
          }
        }
      })
    ).toThrow(CleanroomError);
  });

  it("rejects empty commands", () => {
    expect(() =>
      normalizeConfig({
        checks: {
          verify: {
            command: ""
          }
        }
      })
    ).toThrow(CleanroomError);
  });

  it("allows missing checks", () => {
    expect(normalizeConfig({}).checks).toEqual({});
  });
});
