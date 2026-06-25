# Release Status

## Current State

Status: v0.1 release candidate ready.

Remote repository: https://github.com/sjh9714/cleanroom-run

## Launch Blockers

None known.

## Non-Blocking Follow-Ups

- npm package publication has not been performed. The package is ready for npm, and the README includes a working GitHub install command for the release candidate.
- Future report formats such as JUnit and SARIF are documented as roadmap items, not v0.1 requirements.
- Default Markdown reports now write to the OS temp directory so `cleanroom-run run` does not modify the user's repo unless `--report-dir` is explicit.
- npm auth was previously unavailable (`npm whoami` returned E401). The final launch pass will retry and either publish or record the blocked publish command.

## Verification Log

- `npm install` exited 0.
- `npm run typecheck` exited 0.
- `npm test` exited 0 with 8 tests passing.
- `npm run lint` exited 0 after ESLint Node globals fix.
- `npm run build` exited 0.
- `npm run test:smoke` exited 0.
- `npm run verify` exited 0:
  - lint passed
  - typecheck passed
  - 8 tests passed
  - build passed
  - smoke test passed
- `npm pack --dry-run` exited 0 and produced `cleanroom-run-0.1.0.tgz` metadata.
- `node dist/index.js doctor --json` exited 0 with no problems.
- `npm exec --yes --package github:sjh9714/cleanroom-run -- cleanroom-run --version` exited 0 and printed `0.1.0`.
- `node dist/index.js run --json -- sh -lc "npm ci && npm test"` exited 0 inside a temporary clean Git worktree.
- GitHub Actions run `28123679762` completed with conclusion `success`.
- Continuation audit patch:
  - `npm run lint` exited 0.
  - `npm run typecheck` exited 0.
  - `npm test` exited 0 with 8 tests passing.
  - `npm run build` exited 0.
  - `npm run test:smoke` exited 0.
  - A fresh temporary repo check confirmed default Markdown reports are written under the OS temp directory and no `.cleanroom-run` directory is created in the checked repo by default.
- Star-ready launch hardening targeted verification:
  - `npm test -- tests/cli.test.ts tests/config.test.ts tests/report.test.ts tests/runner.test.ts tests/process.test.ts` exited 0 with 16 tests passing.
  - `npm run typecheck:test` exited 0.
  - `npm test` exited 0 with 17 tests passing.
  - `npm run lint` exited 0.
  - `npm run verify` exited 0:
    - lint passed
    - production typecheck passed
    - test typecheck passed
    - 17 tests passed
    - build passed
    - smoke test passed
  - `npm pack --dry-run` exited 0 and produced `cleanroom-run-0.1.0.tgz` metadata with 40 packaged files.

## Launch Surface

- README launch page: complete.
- 3-minute quickstart: complete.
- Install instructions: complete, including GitHub release-candidate install path.
- Usage examples: complete.
- Example output: complete.
- Config example: complete.
- Unit tests: complete.
- Integration/smoke test: complete.
- Lint/typecheck/build/test scripts: complete.
- CI workflow: complete and passing remotely.
- CI matrix: updated to Ubuntu/macOS and Node 20/22; remote verification pending after push.
- License: MIT.
- Package metadata: complete.
- Changelog/release notes: complete.
- Public GitHub repository: complete and pushed.
