import { describe, expect, it } from "vitest";
import { formatMarkdownReport, formatTerminalReport } from "../src/report.js";
import type { RunReport } from "../src/types.js";

const baseReport: RunReport = {
  ok: false,
  checkName: "verify",
  command: "npm test",
  repoRoot: "/repo",
  worktreePath: "/tmp/worktree",
  keptWorktree: false,
  exitCode: 0,
  signal: null,
  timedOut: false,
  durationMs: 1500,
  inputUntrackedFiles: ["local.env"],
  generatedUntrackedFiles: ["generated.txt"],
  modifiedTrackedFiles: ["src/index.ts"],
  failureReasons: ["input-untracked-files", "modified-tracked-files"],
  stdoutTail: "ok",
  stderrTail: "",
  markdownReportPath: "/repo/.cleanroom-run/reports/report.md",
  startedAt: "2026-06-25T00:00:00.000Z",
  completedAt: "2026-06-25T00:00:01.500Z"
};

describe("report formatting", () => {
  it("formats terminal summaries with generated files", () => {
    const output = formatTerminalReport(baseReport);
    expect(output).toContain("Cleanroom check failed");
    expect(output).toContain("Input untracked files: 1");
    expect(output).toContain("Generated untracked files: 1");
    expect(output).toContain("Failure reasons:");
    expect(output).toContain("generated.txt");
  });

  it("formats markdown reports", () => {
    const output = formatMarkdownReport(baseReport);
    expect(output).toContain("# Cleanroom Run Report");
    expect(output).toContain("Status: **failed**");
    expect(output).toContain("input-untracked-files");
    expect(output).toContain("`local.env`");
    expect(output).toContain("`src/index.ts`");
  });
});
