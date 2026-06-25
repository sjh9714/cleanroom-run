# Changelog

## 0.1.1 - 2026-06-25

### Fixed

- Reject direct CLI use of `--strict --include-untracked` instead of silently resolving both away.
- Show `Exit: not run` for strict preflight failures where the command was not executed.
- Make README hero and install commands accurate while npm publication is blocked by authentication.

## 0.1.0 - 2026-06-25

### Added

- `cleanroom-run run` to execute commands in a temporary Git worktree.
- `--strict` to fail on pre-existing untracked input files before running a command.
- `--include-untracked` to opt into copying untracked input files.
- `--allow-modified-tracked` to permit intentional tracked-file updates.
- Detection for generated untracked files after a command runs.
- Detection for tracked files modified or deleted by a command.
- `inputUntrackedFiles` and `failureReasons` in JSON and Markdown reports.
- Unix process-group cleanup for timed-out commands on macOS/Linux.
- Markdown and JSON reports.
- `cleanroom-run init` for starter config.
- `cleanroom-run doctor` for repo/config readiness checks.
- Fixture-based smoke test for generated-file detection.
- GitHub Actions CI workflow across Ubuntu/macOS and Node 20/22.
