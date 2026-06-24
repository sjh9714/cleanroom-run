import { execFile } from "node:child_process";
import { mkdtemp, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export async function makeGitRepo(prefix = "cleanroom-test-"): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), prefix));
  await git(root, ["init", "-b", "main"]);
  await git(root, ["config", "user.email", "cleanroom@example.com"]);
  await git(root, ["config", "user.name", "Cleanroom Test"]);
  return root;
}

export async function git(cwd: string, args: string[]): Promise<string> {
  const { stdout } = await execFileAsync("git", args, { cwd, encoding: "utf8" });
  return stdout;
}

export async function writeRepoFile(root: string, path: string, content: string): Promise<void> {
  const fullPath = join(root, path);
  await mkdir(dirname(fullPath), { recursive: true });
  await writeFile(fullPath, content, "utf8");
}

export async function commitAll(root: string, message = "test commit"): Promise<void> {
  await git(root, ["add", "."]);
  await git(root, ["commit", "-m", message]);
}
