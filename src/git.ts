import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { CleanroomError } from "./errors.js";

const execFileAsync = promisify(execFile);

export interface GitResult {
  stdout: string;
  stderr: string;
}

export async function git(args: string[], cwd: string, allowFailure = false): Promise<GitResult> {
  try {
    const { stdout, stderr } = await execFileAsync("git", args, {
      cwd,
      encoding: "utf8",
      maxBuffer: 20 * 1024 * 1024
    });
    return { stdout, stderr };
  } catch (error: any) {
    if (allowFailure) {
      return {
        stdout: typeof error.stdout === "string" ? error.stdout : "",
        stderr: typeof error.stderr === "string" ? error.stderr : error.message
      };
    }

    const detail = typeof error.stderr === "string" && error.stderr.trim() ? error.stderr.trim() : error.message;
    throw new CleanroomError(`git ${args.join(" ")} failed: ${detail}`);
  }
}

export async function gitVersion(cwd: string): Promise<string> {
  const { stdout } = await git(["--version"], cwd);
  return stdout.trim();
}

export async function repoRoot(cwd: string): Promise<string> {
  const { stdout } = await git(["rev-parse", "--show-toplevel"], cwd);
  return stdout.trim();
}

export async function ensureHeadExists(root: string): Promise<void> {
  await git(["rev-parse", "--verify", "HEAD"], root);
}

export async function addWorktree(root: string, worktreePath: string): Promise<void> {
  await git(["worktree", "add", "--detach", "--quiet", worktreePath, "HEAD"], root);
}

export async function removeWorktree(root: string, worktreePath: string): Promise<void> {
  await git(["worktree", "remove", "--force", worktreePath], root, true);
  await rm(worktreePath, { recursive: true, force: true });
}

export async function currentDiff(root: string): Promise<string> {
  const { stdout } = await git(["diff", "--binary", "HEAD"], root);
  return stdout;
}

export async function applyPatch(worktreePath: string, patch: string): Promise<void> {
  if (patch.trim().length === 0) {
    return;
  }

  const patchPath = join(worktreePath, ".cleanroom-run.patch");
  await writeFile(patchPath, patch, "utf8");
  await git(["apply", "--whitespace=nowarn", patchPath], worktreePath);
  await rm(patchPath, { force: true });
}

export async function untrackedFiles(root: string): Promise<string[]> {
  const { stdout } = await git(["ls-files", "--others", "--exclude-standard", "-z"], root);
  return splitNul(stdout).sort();
}

export async function trackedFiles(root: string): Promise<string[]> {
  const { stdout } = await git(["ls-files", "-z"], root);
  return splitNul(stdout).sort();
}

export async function copyUntrackedFiles(sourceRoot: string, worktreePath: string, files: string[]): Promise<void> {
  for (const file of files) {
    const source = join(sourceRoot, file);
    const destination = join(worktreePath, file);
    await mkdir(dirname(destination), { recursive: true });
    await cp(source, destination, { recursive: true, force: true, dereference: false });
  }
}

export async function fileHashes(root: string, files: string[]): Promise<Map<string, string>> {
  const hashes = new Map<string, string>();
  for (const file of files) {
    const path = join(root, file);
    if (!existsSync(path)) {
      hashes.set(file, "<missing>");
      continue;
    }

    const content = await readFile(path);
    hashes.set(file, createHash("sha256").update(content).digest("hex"));
  }
  return hashes;
}

export function changedHashes(before: Map<string, string>, after: Map<string, string>): string[] {
  const files = new Set([...before.keys(), ...after.keys()]);
  return [...files].filter((file) => before.get(file) !== after.get(file)).sort();
}

function splitNul(value: string): string[] {
  return value.split("\0").filter(Boolean);
}
