# Changelog

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
