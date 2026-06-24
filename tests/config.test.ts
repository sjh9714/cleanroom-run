import { describe, expect, it } from "vitest";
import { normalizeConfig } from "../src/config.js";
import { CleanroomError } from "../src/errors.js";

describe("normalizeConfig", () => {
  it("accepts named checks", () => {
    const config = normalizeConfig({
      checks: {
        verify: {
          command: "npm test",
          timeoutMs: 1000
        }
      }
    });

    expect(config.checks.verify?.command).toBe("npm test");
    expect(config.checks.verify?.timeoutMs).toBe(1000);
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

