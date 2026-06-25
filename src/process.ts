import { spawn } from "node:child_process";
import { CleanroomError } from "./errors.js";
import type { CommandSpec } from "./types.js";

export interface ProcessResult {
  exitCode: number | null;
  signal: NodeJS.Signals | null;
  stdout: string;
  stderr: string;
  timedOut: boolean;
}

export function quoteArg(value: string): string {
  if (/^[A-Za-z0-9_./:=@+-]+$/.test(value)) {
    return value;
  }

  return `'${value.replaceAll("'", "'\\''")}'`;
}

export function renderArgv(argv: string[]): string {
  return argv.map(quoteArg).join(" ");
}

export async function runProcess(command: CommandSpec, cwd: string, timeoutMs: number): Promise<ProcessResult> {
  if (command.kind === "argv" && command.argv.length === 0) {
    throw new CleanroomError("missing command after --");
  }

  return new Promise((resolve, reject) => {
    const detached = process.platform !== "win32";
    const child =
      command.kind === "shell"
        ? spawn(command.command, {
            cwd,
            detached,
            env: { ...process.env, CI: process.env.CI ?? "true" },
            shell: true,
            stdio: ["ignore", "pipe", "pipe"]
          })
        : spawn(command.argv[0]!, command.argv.slice(1), {
            cwd,
            detached,
            env: { ...process.env, CI: process.env.CI ?? "true" },
            shell: false,
            stdio: ["ignore", "pipe", "pipe"]
          });

    let stdout = "";
    let stderr = "";
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      killProcessTree(child.pid, "SIGTERM");
      setTimeout(() => {
        killProcessTree(child.pid, "SIGKILL");
      }, 1000).unref();
    }, timeoutMs);

    child.stdout?.on("data", (chunk: Buffer) => {
      stdout += chunk.toString("utf8");
    });
    child.stderr?.on("data", (chunk: Buffer) => {
      stderr += chunk.toString("utf8");
    });
    child.on("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.on("close", (exitCode, signal) => {
      clearTimeout(timer);
      resolve({ exitCode, signal, stdout, stderr, timedOut });
    });
  });
}

function killProcessTree(pid: number | undefined, signal: NodeJS.Signals): void {
  if (pid === undefined) {
    return;
  }

  if (process.platform !== "win32") {
    try {
      process.kill(-pid, signal);
      return;
    } catch {
      // Fall back to killing the direct child below.
    }
  }

  try {
    process.kill(pid, signal);
  } catch {
    // Process already exited.
  }
}
