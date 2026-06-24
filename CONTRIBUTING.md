# Contributing

Thanks for taking a look at Cleanroom Run.

## Development

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run build
npm run test:smoke
```

## Pull Requests

- Keep changes focused.
- Add or update tests for behavior changes.
- Update `README.md` when commands, flags, report fields, or limitations change.
- Run `npm run verify` before opening a PR.

## Design Principles

- Never modify the user's working tree.
- Prefer explicit command output over hidden magic.
- Keep the default path local-first and account-free.
- Treat this as a proof runner, not a security sandbox.

