import { existsSync } from "node:fs";
import { repoRoot, gitVersion, ensureHeadExists } from "./git.js";
import { loadConfig, resolveConfigPath, writeDefaultConfig } from "./config.js";
import { CleanroomError, assertCleanroom } from "./errors.js";
import { renderArgv } from "./process.js";
import { formatDoctor, formatTerminalReport } from "./report.js";
import { runCleanroom } from "./runner.js";
import type { CommandSpec, DoctorResult, RunOptions } from "./types.js";

const DEFAULT_TIMEOUT_MS = 120000;

export async function main(args: string[]): Promise<void> {
  const command = args[0];

  if (!command || command === "--help" || command === "-h") {
    printHelp();
    return;
  }

  if (command === "--version" || command === "-v") {
    console.log("0.1.0");
    return;
  }

  if (command === "init") {
    await initCommand(args.slice(1));
    return;
  }

  if (command === "doctor") {
    await doctorCommand(args.slice(1));
    return;
  }

  if (command === "run") {
    await runCommand(args.slice(1));
    return;
  }

  throw new CleanroomError(`unknown command "${command}"`);
}

async function initCommand(args: string[]): Promise<void> {
  const force = args.includes("--force");
  const root = await repoRoot(process.cwd());
  const path = await writeDefaultConfig(root, force);
  console.log(`Wrote ${path}`);
}

async function doctorCommand(args: string[]): Promise<void> {
  const parsed = parseFlags(args, ["--json"]);
  const result = await doctor(parsed.flags.get("--config"));
  if (parsed.booleans.has("--json")) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    process.stdout.write(formatDoctor(result));
  }

  if (!result.ok) {
    process.exitCode = 1;
  }
}

export async function doctor(configPath?: string): Promise<DoctorResult> {
  const problems: string[] = [];
  let root: string | undefined;
  let version: string | undefined;
  let checks: string[] = [];
  let resolvedConfigPath: string | undefined;

  try {
    root = await repoRoot(process.cwd());
  } catch (error) {
    problems.push(error instanceof Error ? error.message : String(error));
  }

  try {
    version = await gitVersion(process.cwd());
  } catch (error) {
    problems.push(error instanceof Error ? error.message : String(error));
  }

  if (root) {
    try {
      await ensureHeadExists(root);
    } catch {
      problems.push("repository has no commits yet; commit at least once before running cleanroom checks");
    }

    resolvedConfigPath = resolveConfigPath(root, configPath);
    try {
      const config = await loadConfig(root, configPath);
      checks = Object.keys(config.checks).sort();
    } catch (error) {
      problems.push(error instanceof Error ? error.message : String(error));
    }
  }

  return {
    ok: problems.length === 0,
    repoRoot: root,
    gitVersion: version,
    configPath: resolvedConfigPath,
    checks,
    problems
  };
}

async function runCommand(args: string[]): Promise<void> {
  const separator = args.indexOf("--");
  const beforeSeparator = separator === -1 ? args : args.slice(0, separator);
  const afterSeparator = separator === -1 ? [] : args.slice(separator + 1);
  const parsed = parseFlags(beforeSeparator, ["--json", "--keep"]);
  const checkName = parsed.positionals[0];
  const root = await repoRoot(process.cwd());
  const config = await loadConfig(root, parsed.flags.get("--config"));
  let command: CommandSpec | undefined;
  let timeoutMs = parsed.flags.has("--timeout") ? parseTimeout(parsed.flags.get("--timeout")) : DEFAULT_TIMEOUT_MS;

  if (afterSeparator.length > 0) {
    command = {
      kind: "argv",
      argv: afterSeparator,
      display: renderArgv(afterSeparator)
    };
  } else if (checkName) {
    const check = config.checks[checkName];
    assertCleanroom(check, `unknown check "${checkName}" in ${resolveConfigPath(root, parsed.flags.get("--config"))}`);
    command = {
      kind: "shell",
      command: check.command,
      display: check.command
    };
    timeoutMs = check.timeoutMs ?? timeoutMs;
  }

  assertCleanroom(command, "missing command; use `cleanroom-run run -- npm test` or define a named check");

  const options: RunOptions = {
    checkName,
    command,
    configPath: parsed.flags.get("--config"),
    json: parsed.booleans.has("--json"),
    keep: parsed.booleans.has("--keep"),
    reportDir: parsed.flags.get("--report-dir"),
    timeoutMs
  };

  const report = await runCleanroom(process.cwd(), options);
  if (options.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    process.stdout.write(formatTerminalReport(report));
  }

  if (!report.ok) {
    process.exitCode = 1;
  }
}

function parseFlags(args: string[], booleanFlags: string[]): {
  booleans: Set<string>;
  flags: Map<string, string>;
  positionals: string[];
} {
  const booleans = new Set<string>();
  const flags = new Map<string, string>();
  const positionals: string[] = [];
  const booleanSet = new Set(booleanFlags);
  const valueFlags = new Set(["--config", "--timeout", "--report-dir"]);

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]!;
    if (booleanSet.has(arg)) {
      booleans.add(arg);
      continue;
    }

    if (valueFlags.has(arg)) {
      const value = args[index + 1];
      assertCleanroom(value, `${arg} requires a value`);
      flags.set(arg, value);
      index += 1;
      continue;
    }

    positionals.push(arg);
  }

  return { booleans, flags, positionals };
}

function parseTimeout(value: string | undefined): number {
  assertCleanroom(value, "--timeout requires a value");
  const timeoutMs = Number(value);
  assertCleanroom(Number.isInteger(timeoutMs) && timeoutMs > 0, "--timeout must be a positive integer in milliseconds");
  return timeoutMs;
}

function printHelp(): void {
  console.log(`cleanroom-run

Run repo checks in a clean Git worktree.

Usage:
  cleanroom-run init [--force]
  cleanroom-run doctor [--json] [--config path]
  cleanroom-run run [check] [--json] [--keep] [--timeout ms] [--report-dir dir] [-- command...]

Examples:
  cleanroom-run init
  cleanroom-run run -- npm test
  cleanroom-run run verify
  cleanroom-run run --json -- npm run build
`);
}

export function configExists(path: string): boolean {
  return existsSync(path);
}

