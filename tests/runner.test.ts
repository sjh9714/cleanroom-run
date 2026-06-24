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
  });

  it("copies untracked input files into the cleanroom before running", async () => {
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

    expect(report.ok).toBe(true);
    expect(report.exitCode).toBe(0);
    expect(existsSync(join(root, "new-input.txt"))).toBe(true);
  });
});

