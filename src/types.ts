export type CommandSpec =
  | {
      kind: "argv";
      argv: string[];
      display: string;
    }
  | {
      kind: "shell";
      command: string;
      display: string;
    };

export interface CheckConfig {
  command: string;
  timeoutMs?: number;
  strict?: boolean;
  includeUntracked?: boolean;
  allowModifiedTracked?: boolean;
}

export interface CleanroomConfig {
  checks: Record<string, CheckConfig>;
}

export interface RunOptions {
  checkName?: string;
  command: CommandSpec;
  configPath?: string;
  json: boolean;
  keep: boolean;
  reportDir?: string;
  timeoutMs: number;
  strict?: boolean;
  includeUntracked?: boolean;
  allowModifiedTracked?: boolean;
}

export interface DoctorResult {
  ok: boolean;
  repoRoot?: string;
  gitVersion?: string;
  configPath?: string;
  checks: string[];
  problems: string[];
}

export interface RunReport {
  ok: boolean;
  checkName?: string;
  command: string;
  repoRoot: string;
  worktreePath: string;
  keptWorktree: boolean;
  exitCode: number | null;
  signal: NodeJS.Signals | null;
  timedOut: boolean;
  durationMs: number;
  inputUntrackedFiles: string[];
  generatedUntrackedFiles: string[];
  modifiedTrackedFiles: string[];
  failureReasons: string[];
  stdoutTail: string;
  stderrTail: string;
  markdownReportPath?: string;
  startedAt: string;
  completedAt: string;
}
