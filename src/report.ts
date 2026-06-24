import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { DoctorResult, RunReport } from "./types.js";

const TAIL_LIMIT = 8000;

export function tail(value: string, limit = TAIL_LIMIT): string {
  if (value.length <= limit) {
    return value;
  }

  return `${value.slice(0, 1000)}\n\n... [${value.length - limit} chars omitted] ...\n\n${value.slice(-limit)}`;
}

export function formatTerminalReport(report: RunReport): string {
  const lines = [
    report.ok ? "Cleanroom check passed" : "Cleanroom check failed",
    "",
    `Command: ${report.command}`,
    `Exit: ${report.exitCode ?? "signal"}${report.signal ? ` (${report.signal})` : ""}`,
    `Duration: ${formatDuration(report.durationMs)}`,
    `Generated untracked files: ${report.generatedUntrackedFiles.length}`,
    `Modified tracked files: ${report.modifiedTrackedFiles.length}`
  ];

  if (report.markdownReportPath) {
    lines.push(`Report: ${report.markdownReportPath}`);
  }

  if (report.generatedUntrackedFiles.length > 0) {
    lines.push("", "Generated files:", ...report.generatedUntrackedFiles.map((file) => `  + ${file}`));
  }

  if (report.modifiedTrackedFiles.length > 0) {
    lines.push("", "Tracked files changed during command:", ...report.modifiedTrackedFiles.map((file) => `  ~ ${file}`));
  }

  if (!report.ok && report.stderrTail.trim()) {
    lines.push("", "stderr tail:", indent(report.stderrTail.trim(), "  "));
  }

  return `${lines.join("\n")}\n`;
}

export function formatDoctor(result: DoctorResult): string {
  const lines = [result.ok ? "Cleanroom doctor passed" : "Cleanroom doctor found problems"];
  if (result.gitVersion) lines.push(`Git: ${result.gitVersion}`);
  if (result.repoRoot) lines.push(`Repo: ${result.repoRoot}`);
  if (result.configPath) lines.push(`Config: ${result.configPath}`);
  lines.push(`Checks: ${result.checks.length === 0 ? "(none)" : result.checks.join(", ")}`);
  if (result.problems.length > 0) {
    lines.push("", "Problems:", ...result.problems.map((problem) => `  - ${problem}`));
  }
  return `${lines.join("\n")}\n`;
}

export async function writeMarkdownReport(repoRoot: string, reportDir: string | undefined, report: RunReport): Promise<string> {
  const outputDir = reportDir ? join(repoRoot, reportDir) : join(repoRoot, ".cleanroom-run", "reports");
  await mkdir(outputDir, { recursive: true });
  const slug = (report.checkName ?? "inline").replace(/[^A-Za-z0-9_.-]+/g, "-");
  const fileName = `${report.startedAt.replace(/[:.]/g, "-")}-${slug}.md`;
  const path = join(outputDir, fileName);
  await writeFile(path, formatMarkdownReport(report), "utf8");
  return path;
}

export function formatMarkdownReport(report: RunReport): string {
  const generated =
    report.generatedUntrackedFiles.length === 0
      ? "None"
      : report.generatedUntrackedFiles.map((file) => `- \`${file}\``).join("\n");
  const modified =
    report.modifiedTrackedFiles.length === 0 ? "None" : report.modifiedTrackedFiles.map((file) => `- \`${file}\``).join("\n");

  return `# Cleanroom Run Report

Status: **${report.ok ? "passed" : "failed"}**

| Field | Value |
| --- | --- |
| Command | \`${report.command.replaceAll("|", "\\|")}\` |
| Exit code | ${report.exitCode ?? "null"} |
| Signal | ${report.signal ?? "none"} |
| Timed out | ${report.timedOut ? "yes" : "no"} |
| Duration | ${formatDuration(report.durationMs)} |
| Started | ${report.startedAt} |
| Completed | ${report.completedAt} |
| Worktree kept | ${report.keptWorktree ? "yes" : "no"} |

## Generated Untracked Files

${generated}

## Tracked Files Modified During Command

${modified}

## Stdout Tail

\`\`\`text
${report.stdoutTail}
\`\`\`

## Stderr Tail

\`\`\`text
${report.stderrTail}
\`\`\`
`;
}

function formatDuration(durationMs: number): string {
  if (durationMs < 1000) {
    return `${durationMs}ms`;
  }
  return `${(durationMs / 1000).toFixed(2)}s`;
}

function indent(value: string, prefix: string): string {
  return value
    .split("\n")
    .map((line) => `${prefix}${line}`)
    .join("\n");
}

