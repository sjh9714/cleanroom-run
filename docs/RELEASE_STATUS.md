# Release Status

## Current State

Status: v0.1.1 released on GitHub; npm publication remains blocked by authentication.

Remote repository: https://github.com/sjh9714/cleanroom-run
Latest GitHub release: https://github.com/sjh9714/cleanroom-run/releases/tag/v0.1.1
Public README GitHub install commands are pinned to `github:sjh9714/cleanroom-run#v0.1.1`.

## Launch Blockers

None known for GitHub public launch.

npm publication is blocked by authentication, not by package readiness:

```bash
npm publish --access public
```

Current blocker evidence: `npm whoami` returned `E401 Unauthorized`.

## Non-Blocking Follow-Ups

- npm package publication has not been performed because npm auth is unavailable. The package is ready for npm, and the README includes a working GitHub install command for the current GitHub release.
- Future report formats such as JUnit and SARIF are documented as roadmap items, not v0.1 requirements.
- Default Markdown reports now write to the OS temp directory so `cleanroom-run run` does not modify the user's repo unless `--report-dir` is explicit.

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
- Remote launch hardening verification:
  - GitHub Actions run `28144777652` completed with conclusion `success` for commit `1356a05`.
  - GitHub Actions run `28144824993` completed with conclusion `success` for commit `20b29c7`.
  - GitHub release `v0.1.0` is published and not a draft/prerelease.
  - Repository description is `Catch dirty-local-state bugs in AI-generated code before CI does.`
  - Repository topics include `ai-agents`, `coding-agents`, `codex`, `ci`, `testing`, `git`, `worktree`, `developer-tools`, `cli`, `npm`, `typescript`, `cleanroom`, `pre-ci`, `automation`, and `codegen`.
  - Launch issues #1 through #6 are open.
- P0 launch fix verification:
  - Added tests for direct `--strict --include-untracked` rejection.
  - Added tests for strict preflight terminal output showing `Exit: not run`.
  - Bumped local package version to `0.1.1`.
  - README hero now uses the GitHub install command while npm is unpublished.
  - `npm test -- tests/cli.test.ts tests/report.test.ts` exited 0 with 6 tests passing.
  - `npm run typecheck && npm run typecheck:test` exited 0.
  - `npm run verify` exited 0:
    - lint passed
    - production typecheck passed
    - test typecheck passed
    - 19 tests passed
    - build passed
    - smoke test passed
  - `npm pack --dry-run` exited 0 and produced `cleanroom-run-0.1.1.tgz` metadata with 40 packaged files.
  - `npm whoami` returned `E401 Unauthorized`; npm publish is still blocked by authentication.
  - `npm exec --yes --package github:sjh9714/cleanroom-run -- cleanroom-run --version` exited 0 and printed `0.1.1`.
  - GitHub Actions run `28145426387` completed with conclusion `success` for commit `0aec0be`.
  - GitHub release `v0.1.1` is published and not a draft/prerelease: https://github.com/sjh9714/cleanroom-run/releases/tag/v0.1.1
- Launch-copy pinning verification:
  - README GitHub install commands now use `github:sjh9714/cleanroom-run#v0.1.1` so external launch readers install the release tag instead of `main`.
  - `rg "github:sjh9714/cleanroom-run(?!#v0\\.1\\.1)" README.md -P` returned no active unpinned README commands.
  - `npm exec --yes --package github:sjh9714/cleanroom-run#v0.1.1 -- cleanroom-run --version` exited 0 and printed `0.1.1`.
  - `npm run verify` exited 0 with 19 tests passing.

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
- CI matrix: updated to Ubuntu/macOS and Node 20/22; passing remotely.
- License: MIT.
- Package metadata: complete.
- Changelog/release notes: complete.
- Public GitHub repository: complete and pushed.
- GitHub topics/description: complete.
- GitHub releases: complete for `v0.1.0` and `v0.1.1`.
- Launch issues: complete.
- npm publish: blocked by authentication; exact blocked command recorded above.
