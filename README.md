# Cleanroom Run

[![CI](https://github.com/sjh9714/cleanroom-run/actions/workflows/ci.yml/badge.svg)](https://github.com/sjh9714/cleanroom-run/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Run a command in a temporary Git worktree before CI catches the local-state bug.

Cleanroom Run is for the moment after a human or coding agent says "tests pass." It proves the command from a clean checkout, reports generated files, and leaves your working tree untouched.

```text
$ cleanroom-run run -- sh -lc "npm ci && npm test"
Cleanroom check failed

Command: sh -lc 'npm ci && npm test'
Exit: 0
Duration: 3.21s
Generated untracked files: 1
Modified tracked files: 0
Report: /tmp/cleanroom-run-reports/2026-06-25T12-00-00-000Z-inline.md

Generated files:
  + generated/schema.json
```

## Why

AI coding agents made it cheap to generate code. They did not make it cheap to know whether the code works outside your laptop's dirty state.

Cleanroom Run catches:

- generated files that were never committed
- tests that pass because of untracked local files
- commands that rely on stale build output
- "works on my machine" checks before you push to CI

It is not a Docker sandbox and it is not a GitHub Actions emulator. It is a small local proof: apply this diff to a clean worktree, run this command, show me what happened.

## 3-Minute Quickstart

Run from any Git repo with at least one commit:

```bash
npm exec --yes --package github:sjh9714/cleanroom-run -- cleanroom-run run -- sh -lc "npm ci && npm test"
```

When the npm package is published, the shorter form is:

```bash
npx cleanroom-run run -- sh -lc "npm ci && npm test"
```

For a faster command that does not need dependency install:

```bash
npx cleanroom-run run -- npm test
```

Cleanroom Run writes Markdown reports to your OS temp directory by default and exits non-zero when:

- the command exits non-zero
- the command times out
- the command leaves new untracked files behind

## Install

As a project dev dependency:

```bash
npm install --save-dev cleanroom-run
```

From this GitHub release candidate:

```bash
npm install --save-dev github:sjh9714/cleanroom-run
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
cleanroom-run run -- sh -lc "npm ci && npm test"
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
```

Run the named check:

```bash
cleanroom-run run verify
```

Keep the temporary worktree for debugging:

```bash
cleanroom-run run --keep -- sh -lc "npm ci && npm test"
```

Emit JSON for automation:

```bash
cleanroom-run run --json -- sh -lc "npm ci && npm test"
```

Keep Markdown reports inside the repo:

```bash
cleanroom-run run --report-dir .cleanroom-run/reports -- sh -lc "npm ci && npm test"
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
      - run: npx cleanroom-run run -- sh -lc "npm ci && npm test"
```

## How It Works

1. Finds the Git repository root.
2. Creates a temporary detached worktree at `HEAD`.
3. Applies tracked local changes with `git diff --binary HEAD`.
4. Copies untracked, non-ignored files into the cleanroom.
5. Runs your command in the temp worktree.
6. Reports command output, exit status, generated untracked files, and tracked files changed during the command.
7. Removes the temporary worktree unless `--keep` is set.

Your original working tree is not cleaned, reset, or modified by default. Passing `--report-dir` with a repo-relative path intentionally writes the report there.

## Example Failure

The fixture in `fixtures/generated-file-demo` has a command that writes `generated/schema.json` without committing it.

```bash
npm run build
node dist/index.js run -- npm run check
```

Cleanroom Run reports the generated file and exits with status 1 even though the command itself exits 0.

## Limitations

- Requires Git and at least one commit.
- macOS and Linux are the v0.1 target platforms.
- Commands run with your normal environment. This is not a security sandbox.
- Dependency installation is your responsibility. Use `sh -lc "npm ci && npm test"` or a named config check when a clean worktree needs dependencies.
- Ignored files are not treated as generated-file failures.

## Roadmap

- JUnit and SARIF report output.
- First-class `cleanroom-run action` wrapper for GitHub Actions summaries.
- Optional Docker backend for stronger isolation.
- Policy mode for max generated files, changed-file allowlists, and required report artifacts.
