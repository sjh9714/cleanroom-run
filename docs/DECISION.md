# Decision

## Chosen Project

**Cleanroom Run** — a local-first CLI that proves a repo change works from a clean Git worktree before a developer or coding agent claims the work is done.

Working package/repo name: `cleanroom-run`.

## Target User

Developers, maintainers, and AI coding-agent users who frequently have a dirty local checkout, generated files, cached dependencies, or hidden environment state that can make tests pass locally and fail in CI.

## Painful Problem

AI coding agents and humans both over-trust local verification. A test command may pass because the current checkout has untracked files, stale build artifacts, local environment variables, or generated files that were never committed. CI catches this later, after a push, a wait, and another review loop.

## Why Now

AI coding agents are mainstream in terminal and GitHub workflows. Research signals showed developers are not short on code generation; they are short on deterministic proof that a change actually works. GitHub Agent HQ, Codex/Claude/Gemini CLIs, AGENTS.md, MCP, and CI agent workflows all increase the number of changes that need fast local verification.

## Why Existing Tools Are Insufficient

- CI proves the change eventually, but only after a push and queue time.
- `git clean -xdf && npm test` is destructive and easy to run in the wrong place.
- `act` reproduces GitHub Actions but has a larger setup surface and is aimed at workflow emulation, not "does this diff work from a clean checkout?"
- Manual temp clones are tedious and easy to do inconsistently.
- Launch/readiness linters identify missing metadata; they do not execute the actual proof command in a clean tree.

## Smallest Lovable v0.1

- `cleanroom-run run -- <command>` creates a temporary Git worktree, copies or applies the current diff, runs the command, and reports:
  - command status and duration
  - files changed by the command
  - untracked files created by the command
  - a Markdown report path
  - a JSON report option for CI
- `.cleanroom-run.yml` lets users define named checks.
- `cleanroom-run init` writes a starter config.
- `cleanroom-run doctor` validates that the current repo can run cleanroom checks.
- A fixture repo demonstrates a hidden generated-file failure.
- CI runs lint, typecheck, tests, build, and the fixture smoke test.

## Why This Could Earn Stars

The README promise is obvious: "Catch the local-state bug before CI does." The demo is quick and visual: run a command, see a clean worktree report, discover generated/untracked files. It helps every coding agent without competing with any agent. It is local-first, no-account, and fits into pre-push hooks and GitHub Actions.

## What Will Not Be Built

- No hosted service.
- No full GitHub Actions emulator.
- No Docker/microVM sandbox in v0.1.
- No automatic dependency installation beyond user-supplied commands.
- No LLM integration or agent orchestration.
- No destructive cleanup of the user's working tree.
- No claim of supply-chain security isolation.

