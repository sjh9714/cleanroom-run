# Cleanroom Run

[![CI](https://github.com/sjh9714/cleanroom-run/actions/workflows/ci.yml/badge.svg)](https://github.com/sjh9714/cleanroom-run/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**Command exited 0. The repo was still wrong.**

Cleanroom Run checks agent-generated changes from a temporary Git worktree before CI catches dirty local state.

```bash
npm exec --yes --package github:sjh9714/cleanroom-run#v0.1.1 -- cleanroom-run run --strict -- sh -lc "npm ci && npm test"
```

It creates a temporary Git worktree from `HEAD`, applies your intended tracked changes, runs your command, and reports files that were generated or modified unexpectedly.

Not a sandbox. Not a GitHub Actions emulator. A local clean-state proof runner.

```text
$ cleanroom-run run --strict -- npm test
Cleanroom check failed

Command: npm test
Exit: 0
Duration: 1.24s
Input untracked files: 0
Generated untracked files: 1
Modified tracked files: 1
Failure reasons: generated-untracked-files, modified-tracked-files
Report: /tmp/cleanroom-run-reports/2026-06-25T12-00-00-000Z-inline.md

Generated files:
  + generated/schema.json

Tracked files changed during command:
  ~ package-lock.json
```

## Why

AI coding agents made it cheap to generate code. They did not make it cheap to know whether the code works outside your laptop's dirty state.

Cleanroom Run catches:

- generated files that were never committed
- tests that pass only when untracked local files are copied in
- commands that rely on stale build output
- commands that silently modify tracked files
- "works on my machine" checks before you push to CI

Use it before you trust:

- AI-agent generated code
- local test results
- codegen-heavy changes
- "works on my machine" verification

## 3-Minute Quickstart

Run from any Git repo with at least one commit:

```bash
npm exec --yes --package github:sjh9714/cleanroom-run#v0.1.1 -- cleanroom-run run --strict -- sh -lc "npm ci && npm test"
```

When the npm package is published, the shorter form is:

```bash
npx cleanroom-run run --strict -- sh -lc "npm ci && npm test"
```

For a faster command that does not need dependency install:

```bash
npm exec --yes --package github:sjh9714/cleanroom-run#v0.1.1 -- cleanroom-run run --strict -- npm test
```

Cleanroom Run writes Markdown reports to your OS temp directory by default and exits non-zero when:

- the command exits non-zero
- the command times out
- strict mode sees pre-existing untracked input files
- the command leaves new untracked files behind
- the command modifies tracked files unexpectedly

## Install

From this GitHub release candidate:

```bash
npm install --save-dev github:sjh9714/cleanroom-run#v0.1.1
```

After npm publication:

```bash
npm install --save-dev cleanroom-run
```

From source:

```bash
git clone https://github.com/sjh9714/cleanroom-run.git
cd cleanroom-run
npm ci
npm test
npm run build
npm link
```

## Usage

Run an inline command:

```bash
cleanroom-run run --strict -- sh -lc "npm ci && npm test"
```

Create a config:

```bash
cleanroom-run init
```

Edit `.cleanroom-run.yml`:

```yaml
checks:
  verify:
    command: npm ci && npm run verify
    timeoutMs: 180000
    strict: true
```

Run the named check:

```bash
cleanroom-run run verify
```

Keep the temporary worktree for debugging:

```bash
cleanroom-run run --strict --keep -- sh -lc "npm ci && npm test"
```

Emit JSON for automation:

```bash
cleanroom-run run --strict --json -- sh -lc "npm ci && npm test"
```

Keep Markdown reports inside the repo:

```bash
cleanroom-run run --strict --report-dir .cleanroom-run/reports -- sh -lc "npm ci && npm test"
```

Check whether the repo is ready:

```bash
cleanroom-run doctor
```

## GitHub Actions

```yaml
name: Cleanroom

on:
  pull_request:

permissions:
  contents: read

jobs:
  cleanroom:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm exec --yes --package github:sjh9714/cleanroom-run#v0.1.1 -- cleanroom-run run --strict -- sh -lc "npm ci && npm test"
```

## Input Modes

Cleanroom Run has three input modes:

```text
default:
  apply tracked changes only
  pre-existing untracked files are reported but not copied

--include-untracked:
  also copy untracked, non-ignored files into the cleanroom
  use this when you have new files that are not git-added yet

--strict:
  fail before running the command if pre-existing untracked files exist
  use this before pushing agent-generated or codegen-heavy changes
```

## How It Works

1. Finds the Git repository root.
2. Creates a temporary detached worktree at `HEAD`.
3. Applies tracked local changes with `git diff --binary HEAD`.
4. Copies untracked, non-ignored files only when `--include-untracked` is set.
5. Runs your command in the temp worktree.
6. Reports command output, exit status, generated untracked files, and tracked files changed during the command.
7. Removes the temporary worktree unless `--keep` is set.

Your original working tree is not cleaned, reset, or modified by default. Passing `--report-dir` with a repo-relative path intentionally writes the report there.

## Example Failure

The fixture in `fixtures/generated-file-demo` has a command that writes `generated/schema.json` without committing it.

```bash
npm run build
node dist/index.js run --strict -- npm run check
```

Cleanroom Run reports the generated file and exits with status 1 even though the command itself exits 0.

## Limitations

- Requires Git and at least one commit.
- macOS and Linux are the v0.1 target platforms.
- Commands run with your normal environment. This is not a security sandbox.
- Dependency installation is your responsibility. Use `sh -lc "npm ci && npm test"` or a named config check when a clean worktree needs dependencies.
- Ignored files are not treated as generated-file failures.
- `--strict` and `--include-untracked` are mutually exclusive by design.

## Roadmap

- JUnit and SARIF report output.
- First-class `cleanroom-run action` wrapper for GitHub Actions summaries.
- Optional Docker backend for stronger isolation.
- Policy mode for max generated files, changed-file allowlists, and required report artifacts.
