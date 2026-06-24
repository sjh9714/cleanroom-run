# Security Policy

## Supported Versions

Security fixes target the latest released version.

## Reporting a Vulnerability

Please open a private vulnerability report on GitHub if the issue should not be public. Include:

- affected version or commit
- operating system
- command used
- expected and actual behavior
- whether the issue can modify files outside the temporary cleanroom worktree

## Security Model

Cleanroom Run is not a sandbox. It runs user-supplied commands with the user's normal environment in a temporary Git worktree. It is designed to protect the user's source checkout from destructive cleanup, not to isolate untrusted code.

