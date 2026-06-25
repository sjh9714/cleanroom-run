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
    if (options.strict && inputUntracked.length > 0) {
      const completed = new Date();
      const report: RunReport = {
        ok: false,
        checkName: options.checkName,
        command: options.command.display,
        repoRoot: root,
        worktreePath,
        keptWorktree: options.keep,
        exitCode: null,
        signal: null,
        timedOut: false,
        durationMs: 0,
        inputUntrackedFiles: inputUntracked,
        generatedUntrackedFiles: [],
        modifiedTrackedFiles: [],
        failureReasons: ["input-untracked-files"],
        stdoutTail: "",
        stderrTail: "",
        startedAt: started.toISOString(),
        completedAt: completed.toISOString()
      };
      report.markdownReportPath = await writeMarkdownReport(root, options.reportDir, report);
      return report;
    }

    if (options.includeUntracked) {
      await copyUntrackedFiles(root, worktreePath, inputUntracked);
    }

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
    const failureReasons = buildFailureReasons({
      exitCode: processResult.exitCode,
      timedOut: processResult.timedOut,
      generatedUntrackedFiles,
      modifiedTrackedFiles,
      allowModifiedTracked: options.allowModifiedTracked ?? false
    });

    const report: RunReport = {
      ok: failureReasons.length === 0,
      checkName: options.checkName,
      command: options.command.display,
      repoRoot: root,
      worktreePath,
      keptWorktree: options.keep,
      exitCode: processResult.exitCode,
      signal: processResult.signal,
      timedOut: processResult.timedOut,
      durationMs,
      inputUntrackedFiles: inputUntracked,
      generatedUntrackedFiles,
      modifiedTrackedFiles,
      failureReasons,
      stdoutTail: tail(processResult.stdout),
      stderrTail: tail(processResult.stderr),
      startedAt: started.toISOString(),
      completedAt: completed.toISOString()
    };

    report.markdownReportPath = await writeMarkdownReport(root, options.reportDir, report);
    return report;
  } finally {
    if (!options.keep) {
      if (worktreeAdded) {
        await removeWorktree(root, worktreePath);
      }
      await rm(tempBase, { recursive: true, force: true });
    }
  }
}

function buildFailureReasons(input: {
  exitCode: number | null;
  timedOut: boolean;
  generatedUntrackedFiles: string[];
  modifiedTrackedFiles: string[];
  allowModifiedTracked: boolean;
}): string[] {
  const reasons: string[] = [];
  if (input.timedOut) {
    reasons.push("timeout");
  }
  if (input.exitCode !== 0) {
    reasons.push("command-failed");
  }
  if (input.generatedUntrackedFiles.length > 0) {
    reasons.push("generated-untracked-files");
  }
  if (!input.allowModifiedTracked && input.modifiedTrackedFiles.length > 0) {
    reasons.push("modified-tracked-files");
  }
  return reasons;
}
