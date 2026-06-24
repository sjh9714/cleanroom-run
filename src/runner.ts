import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  addWorktree,
  applyPatch,
  changedHashes,
  copyUntrackedFiles,
  currentDiff,
  ensureHeadExists,
  fileHashes,
  removeWorktree,
  repoRoot,
  trackedFiles,
  untrackedFiles
} from "./git.js";
import { runProcess } from "./process.js";
import { tail, writeMarkdownReport } from "./report.js";
import type { RunOptions, RunReport } from "./types.js";

export async function runCleanroom(cwd: string, options: RunOptions): Promise<RunReport> {
  const root = await repoRoot(cwd);
  await ensureHeadExists(root);

  const started = new Date();
  const tempBase = await mkdtemp(join(tmpdir(), "cleanroom-run-"));
  const worktreePath = join(tempBase, "worktree");
  let worktreeAdded = false;

  try {
    await addWorktree(root, worktreePath);
    worktreeAdded = true;

    const patch = await currentDiff(root);
    await applyPatch(worktreePath, patch);

    const inputUntracked = await untrackedFiles(root);
    await copyUntrackedFiles(root, worktreePath, inputUntracked);

    const beforeTracked = await trackedFiles(worktreePath);
    const beforeHashes = await fileHashes(worktreePath, beforeTracked);
    const beforeUntracked = new Set(await untrackedFiles(worktreePath));

    const startMs = Date.now();
    const processResult = await runProcess(options.command, worktreePath, options.timeoutMs);
    const durationMs = Date.now() - startMs;

    const afterTracked = await trackedFiles(worktreePath);
    const afterHashes = await fileHashes(worktreePath, afterTracked);
    const afterUntracked = await untrackedFiles(worktreePath);

    const generatedUntrackedFiles = afterUntracked.filter((file) => !beforeUntracked.has(file)).sort();
    const modifiedTrackedFiles = changedHashes(beforeHashes, afterHashes);
    const completed = new Date();
    const ok = processResult.exitCode === 0 && !processResult.timedOut && generatedUntrackedFiles.length === 0;

    const report: RunReport = {
      ok,
      checkName: options.checkName,
      command: options.command.display,
      repoRoot: root,
      worktreePath,
      keptWorktree: options.keep,
      exitCode: processResult.exitCode,
      signal: processResult.signal,
      timedOut: processResult.timedOut,
      durationMs,
      generatedUntrackedFiles,
      modifiedTrackedFiles,
      stdoutTail: tail(processResult.stdout),
      stderrTail: tail(processResult.stderr),
      startedAt: started.toISOString(),
      completedAt: completed.toISOString()
    };

    report.markdownReportPath = await writeMarkdownReport(root, options.reportDir, report);
    return report;
  } finally {
    if (!options.keep && worktreeAdded) {
      await removeWorktree(root, worktreePath);
      await rm(tempBase, { recursive: true, force: true });
    }
  }
}

