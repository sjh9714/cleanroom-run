import { existsSync } from "node:fs";
import { rm } from "node:fs/promises";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { runCleanroom } from "../src/runner.js";
import { makeGitRepo, writeRepoFile, commitAll } from "./helpers.js";

const roots: string[] = [];

afterEach(async () => {
  await Promise.all(roots.map((root) => rm(root, { recursive: true, force: true })));
  roots.length = 0;
});

describe("runCleanroom", () => {
  it("passes a no-op command in a clean worktree", async () => {
    const root = await makeGitRepo();
    roots.push(root);
    await writeRepoFile(root, "README.md", "# demo\n");
    await commitAll(root);

    const report = await runCleanroom(root, {
      command: {
        kind: "argv",
        argv: ["node", "-e", "console.log('ok')"],
        display: "node -e console.log"
      },
      json: false,
      keep: false,
      timeoutMs: 10000
    });

    expect(report.ok).toBe(true);
    expect(report.exitCode).toBe(0);
    expect(report.generatedUntrackedFiles).toEqual([]);
    expect(report.markdownReportPath && existsSync(report.markdownReportPath)).toBe(true);
    expect(report.markdownReportPath?.startsWith(root)).toBe(false);
    expect(existsSync(join(root, ".cleanroom-run"))).toBe(false);
    expect(existsSync(report.worktreePath)).toBe(false);
  });

  it("fails when the command generates an untracked file", async () => {
    const root = await makeGitRepo();
    roots.push(root);
    await writeRepoFile(root, "generate.mjs", "import { writeFileSync } from 'node:fs';\nwriteFileSync('generated.txt', 'oops\\n');\n");
    await commitAll(root);

    const report = await runCleanroom(root, {
      command: {
        kind: "argv",
        argv: ["node", "generate.mjs"],
        display: "node generate.mjs"
      },
      json: false,
      keep: false,
      timeoutMs: 10000
    });

    expect(report.ok).toBe(false);
    expect(report.exitCode).toBe(0);
    expect(report.generatedUntrackedFiles).toEqual(["generated.txt"]);
    expect(report.failureReasons).toContain("generated-untracked-files");
  });

  it("does not copy untracked input files by default", async () => {
    const root = await makeGitRepo();
    roots.push(root);
    await writeRepoFile(root, "README.md", "# demo\n");
    await commitAll(root);
    await writeRepoFile(root, "new-input.txt", "hello\n");

    const report = await runCleanroom(root, {
      command: {
        kind: "argv",
        argv: ["node", "-e", "process.exit(require('node:fs').existsSync('new-input.txt') ? 0 : 2)"],
        display: "node -e exists"
      },
      json: false,
      keep: false,
      timeoutMs: 10000,
      reportDir: ".cleanroom-run/reports"
    });

    expect(report.ok).toBe(false);
    expect(report.exitCode).toBe(2);
    expect(report.inputUntrackedFiles).toEqual(["new-input.txt"]);
    expect(report.failureReasons).toContain("command-failed");
    expect(existsSync(join(root, "new-input.txt"))).toBe(true);
  });

  it("copies untracked input files when includeUntracked is enabled", async () => {
    const root = await makeGitRepo();
    roots.push(root);
    await writeRepoFile(root, "README.md", "# demo\n");
    await commitAll(root);
    await writeRepoFile(root, "new-input.txt", "hello\n");

    const report = await runCleanroom(root, {
      command: {
        kind: "argv",
        argv: ["node", "-e", "process.exit(require('node:fs').existsSync('new-input.txt') ? 0 : 2)"],
        display: "node -e exists"
      },
      includeUntracked: true,
      json: false,
      keep: false,
      timeoutMs: 10000,
      reportDir: ".cleanroom-run/reports"
    });

    expect(report.ok).toBe(true);
    expect(report.exitCode).toBe(0);
    expect(report.inputUntrackedFiles).toEqual(["new-input.txt"]);
    expect(existsSync(join(root, "new-input.txt"))).toBe(true);
  });

  it("fails in strict mode when untracked input files exist", async () => {
    const root = await makeGitRepo();
    roots.push(root);
    await writeRepoFile(root, "README.md", "# demo\n");
    await commitAll(root);
    await writeRepoFile(root, "local.env", "TOKEN=test\n");

    const report = await runCleanroom(root, {
      command: {
        kind: "argv",
        argv: ["node", "-e", "console.log('not reached')"],
        display: "node -e not-reached"
      },
      strict: true,
      json: false,
      keep: false,
      timeoutMs: 10000
    });

    expect(report.ok).toBe(false);
    expect(report.exitCode).toBe(null);
    expect(report.inputUntrackedFiles).toEqual(["local.env"]);
    expect(report.failureReasons).toContain("input-untracked-files");
    expect(report.stdoutTail).toBe("");
  });

  it("fails by default when the command modifies a tracked file", async () => {
    const root = await makeGitRepo();
    roots.push(root);
    await writeRepoFile(root, "tracked.txt", "before\n");
    await commitAll(root);

    const report = await runCleanroom(root, {
      command: {
        kind: "argv",
        argv: ["node", "-e", "require('node:fs').writeFileSync('tracked.txt', 'after\\n')"],
        display: "node -e modify"
      },
      json: false,
      keep: false,
      timeoutMs: 10000
    });

    expect(report.ok).toBe(false);
    expect(report.exitCode).toBe(0);
    expect(report.modifiedTrackedFiles).toEqual(["tracked.txt"]);
    expect(report.failureReasons).toContain("modified-tracked-files");
  });

  it("allows tracked file modifications when allowModifiedTracked is enabled", async () => {
    const root = await makeGitRepo();
    roots.push(root);
    await writeRepoFile(root, "tracked.txt", "before\n");
    await commitAll(root);

    const report = await runCleanroom(root, {
      command: {
        kind: "argv",
        argv: ["node", "-e", "require('node:fs').writeFileSync('tracked.txt', 'after\\n')"],
        display: "node -e modify"
      },
      allowModifiedTracked: true,
      json: false,
      keep: false,
      timeoutMs: 10000
    });

    expect(report.ok).toBe(true);
    expect(report.exitCode).toBe(0);
    expect(report.modifiedTrackedFiles).toEqual(["tracked.txt"]);
    expect(report.failureReasons).toEqual([]);
  });

  it("fails by default when the command deletes a tracked file", async () => {
    const root = await makeGitRepo();
    roots.push(root);
    await writeRepoFile(root, "tracked.txt", "before\n");
    await commitAll(root);

    const report = await runCleanroom(root, {
      command: {
        kind: "argv",
        argv: ["node", "-e", "require('node:fs').unlinkSync('tracked.txt')"],
        display: "node -e delete"
      },
      json: false,
      keep: false,
      timeoutMs: 10000
    });

    expect(report.ok).toBe(false);
    expect(report.exitCode).toBe(0);
    expect(report.modifiedTrackedFiles).toEqual(["tracked.txt"]);
    expect(report.failureReasons).toContain("modified-tracked-files");
  });
});
