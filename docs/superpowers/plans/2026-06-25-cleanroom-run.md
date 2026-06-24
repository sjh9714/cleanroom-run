# Cleanroom Run Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and launch a v0.1 release candidate for `cleanroom-run`, a CLI that verifies commands in a clean Git worktree and reports generated/untracked files.

**Architecture:** A small TypeScript Node CLI with focused modules for CLI parsing, Git operations, cleanroom execution, config loading, and report formatting. Integration tests create real temporary Git repos so the core value is proven end-to-end.

**Tech Stack:** TypeScript, Node.js 20+, npm, `tsx` for tests/dev, `vitest`, `eslint`, `yaml`, Git CLI.

---

### Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `eslint.config.js`
- Create: `.gitignore`
- Create: `src/index.ts`

- [ ] Create npm metadata with bin entry `cleanroom-run`.
- [ ] Add scripts: `build`, `lint`, `typecheck`, `test`, `test:smoke`, `prepack`.
- [ ] Configure TypeScript ESM output to `dist/`.

### Task 2: CLI and Config

**Files:**
- Create: `src/cli.ts`
- Create: `src/config.ts`
- Create: `src/errors.ts`
- Test: `tests/config.test.ts`

- [ ] Implement minimal argument parser for `init`, `doctor`, and `run`.
- [ ] Implement `.cleanroom-run.yml` loading with named checks.
- [ ] Write tests for config defaults and invalid YAML handling.

### Task 3: Git Utilities

**Files:**
- Create: `src/git.ts`
- Test: `tests/git.test.ts`

- [ ] Implement `git()` subprocess helper.
- [ ] Implement repo root detection.
- [ ] Implement worktree add/remove.
- [ ] Implement changed/untracked file detection.
- [ ] Implement patch creation and application.

### Task 4: Cleanroom Runner

**Files:**
- Create: `src/runner.ts`
- Create: `src/report.ts`
- Test: `tests/runner.test.ts`

- [ ] Create temp worktree.
- [ ] Apply current tracked changes and copy untracked files.
- [ ] Run command with timeout.
- [ ] Capture output, exit code, duration, changed files, and untracked files.
- [ ] Clean up by default and support `--keep`.

### Task 5: Reports

**Files:**
- Modify: `src/report.ts`
- Test: `tests/report.test.ts`

- [ ] Implement human terminal summary.
- [ ] Implement JSON report output.
- [ ] Implement Markdown report file under `.cleanroom-run/reports/`.

### Task 6: Fixtures and Smoke Test

**Files:**
- Create: `fixtures/generated-file-demo/README.md`
- Create: `fixtures/generated-file-demo/package.json`
- Create: `fixtures/generated-file-demo/scripts/check.mjs`
- Create: `scripts/smoke-test.mjs`

- [ ] Build a fixture where a command creates a generated file.
- [ ] Smoke test initializes the fixture as a Git repo, runs local CLI, and verifies the generated-file report.

### Task 7: Launch Docs and CI

**Files:**
- Create: `README.md`
- Create: `LICENSE`
- Create: `CHANGELOG.md`
- Create: `CONTRIBUTING.md`
- Create: `SECURITY.md`
- Create: `.github/workflows/ci.yml`
- Create: `.cleanroom-run.yml`

- [ ] Write README as the launch page with 3-minute quickstart, install, usage, example output, config, CI, and limitations.
- [ ] Add MIT license and v0.1 changelog.
- [ ] Add CI workflow for lint/typecheck/test/build/smoke.
- [ ] Add project config that runs the repo's own verification command.

### Task 8: Verify, Commit, and Push

**Files:**
- Modify: `docs/RELEASE_STATUS.md`
- Modify: `docs/WORKLOG.md`

- [ ] Run `npm install`.
- [ ] Run `npm run lint`.
- [ ] Run `npm run typecheck`.
- [ ] Run `npm test`.
- [ ] Run `npm run build`.
- [ ] Run `npm run test:smoke`.
- [ ] Run `npm pack --dry-run`.
- [ ] Initialize git repository if needed.
- [ ] Commit release candidate.
- [ ] Create GitHub public repo with `gh repo create` and push. If blocked, record exact command and error.

