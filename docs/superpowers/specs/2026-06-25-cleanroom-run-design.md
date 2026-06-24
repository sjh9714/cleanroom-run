# Cleanroom Run Design

## Context

This design was produced under the user's autonomous launch goal. The normal brainstorming approval gate is treated as approved because the user explicitly instructed not to stop at approval gates.

## Product Shape

Cleanroom Run is a TypeScript CLI distributed through npm. It runs repository verification commands in a temporary Git worktree so developers and coding agents can prove that a change works without relying on dirty local state.

The first release targets macOS/Linux and Git repositories. It does not require Docker, GitHub credentials, or hosted services.

## Commands

- `cleanroom-run init` writes `.cleanroom-run.yml` with an example check.
- `cleanroom-run doctor` validates Git availability, repo status, and config readability.
- `cleanroom-run run [check] -- <command>` runs either a named config check or an inline command.
- `cleanroom-run run --json -- <command>` emits a machine-readable report.

## Core Flow

1. Resolve the repository root with `git rev-parse --show-toplevel`.
2. Create a temp directory outside the repo.
3. Add a detached Git worktree at the current `HEAD`.
4. Export tracked and untracked user changes into a patch/copy layer:
   - tracked modifications are applied with `git diff --binary`.
   - staged changes are included.
   - untracked files are copied when they are not ignored by Git.
5. Run the requested command in the clean worktree with inherited environment and a timeout.
6. Capture stdout/stderr tail, exit code, duration, changed files, untracked files, and generated report paths.
7. Remove the temp worktree unless `--keep` is passed.

## Error Handling

Errors are explicit and actionable:

- Not a Git repo: ask user to run inside a repo.
- Dirty patch apply failure: show the patch command and suggest committing/stashing conflicting changes.
- Missing command: show usage with `--`.
- Timeout: terminate child process and mark report as timed out.
- Config parse failure: show file path and YAML parser message.

## Data Boundaries

Cleanroom Run is local-only. It does not send telemetry or read secrets intentionally. It inherits the user's environment because many build/test commands require it, and the README documents that this is not a security sandbox.

## Testing

- Unit tests for command parsing, config loading, report formatting, and Git status parsing.
- Integration smoke test creates a fixture Git repo, introduces untracked/generated state, runs `cleanroom-run`, and verifies report output.
- CI runs lint, typecheck, unit tests, build, and smoke test on Ubuntu.

