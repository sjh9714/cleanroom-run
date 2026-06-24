# Idea Scorecard

Research date: 2026-06-25

Scoring uses 1-10 where higher is better. For "maintenance burden", higher means lower expected maintenance burden.

| # | Idea | Star potential | Novelty | Pain urgency | Demoability | Build feasibility | Distribution | README virality | Useful w/o setup | Maintenance | Differentiation | Total |
| ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | Cleanroom Run: run commands against a clean temp worktree/clone and prove the diff works outside the dirty local tree | 9 | 8 | 9 | 9 | 9 | 8 | 9 | 9 | 8 | 8 | 86 |
| 2 | DocSmoke: run explicitly marked README quickstart shell blocks in temp dirs | 8 | 6 | 8 | 9 | 9 | 8 | 9 | 8 | 8 | 6 | 79 |
| 3 | Agent Contract CI: mechanical guardrails for agent-made PRs | 8 | 8 | 8 | 8 | 8 | 8 | 8 | 8 | 8 | 8 | 80 |
| 4 | MCP Doctor: smoke-test stdio MCP servers and explain local setup failures | 8 | 7 | 8 | 8 | 8 | 8 | 8 | 7 | 7 | 7 | 76 |
| 5 | LintLane: split lint output into copy-pasteable parallel-agent task packets | 8 | 7 | 8 | 9 | 9 | 8 | 8 | 9 | 8 | 8 | 82 |
| 6 | Dep Cooldown: block newly introduced packages that are too fresh or lack provenance | 8 | 7 | 10 | 7 | 7 | 8 | 7 | 7 | 6 | 7 | 74 |
| 7 | Publish Doctor: maintainer release hardening for npm/PyPI/Cargo | 7 | 7 | 9 | 7 | 7 | 7 | 7 | 8 | 7 | 7 | 73 |
| 8 | Agent Flight Recorder: record commands, files changed, tests, and diffs from agent runs | 9 | 7 | 8 | 9 | 6 | 8 | 9 | 7 | 5 | 6 | 74 |
| 9 | Sandbox Yolo: disposable agent workspace with network and secret controls | 9 | 8 | 9 | 8 | 4 | 8 | 9 | 5 | 4 | 8 | 72 |
| 10 | MCP Permission Auditor: scan installed MCP configs and risky tool scopes | 8 | 5 | 9 | 8 | 8 | 8 | 8 | 8 | 6 | 4 | 72 |
| 11 | MCP Cassette: record/replay MCP tool fixtures for CI | 7 | 8 | 7 | 8 | 7 | 7 | 7 | 7 | 6 | 8 | 72 |
| 12 | GHA Semantic Diff: explain workflow permission, runner, cache, and secret changes in PRs | 7 | 7 | 8 | 8 | 7 | 7 | 7 | 8 | 7 | 7 | 73 |
| 13 | Env Contract: keep env reads, docs, and `.env.example` aligned | 7 | 5 | 8 | 8 | 8 | 7 | 7 | 8 | 8 | 6 | 72 |
| 14 | API Freeze Lite: snapshot exported APIs for TS/Python packages | 7 | 5 | 7 | 8 | 7 | 7 | 7 | 8 | 7 | 5 | 68 |
| 15 | GHA Flake Doctor: group flaky test failures from JUnit and recent workflow runs | 8 | 6 | 9 | 8 | 5 | 7 | 7 | 5 | 5 | 6 | 66 |
| 16 | Maintainer Receipt: PR evidence/proof-of-work gate for AI-generated contributions | 7 | 8 | 8 | 7 | 7 | 7 | 8 | 7 | 7 | 8 | 74 |
| 17 | PR Risk Radar: local pre-review of changed contracts and missing tests | 8 | 6 | 8 | 8 | 6 | 8 | 8 | 7 | 5 | 5 | 69 |
| 18 | Local API Contract Sniffer: generate OpenAPI by observing local app traffic | 8 | 7 | 7 | 9 | 4 | 8 | 8 | 5 | 4 | 7 | 67 |
| 19 | Prompt Eval Snapshotter: turn prompt/agent runs into regression fixtures | 8 | 6 | 7 | 8 | 6 | 7 | 8 | 6 | 5 | 5 | 66 |
| 20 | Dependency Upgrade Simulator: sandbox upgrade, run tests, summarize breakage | 8 | 6 | 8 | 8 | 5 | 8 | 8 | 6 | 4 | 5 | 66 |
| 21 | Agent Context Lint: check AGENTS.md/SKILL.md/rules for stale commands and bloat | 7 | 5 | 7 | 8 | 8 | 7 | 7 | 8 | 7 | 5 | 69 |
| 22 | Agent Trace Redactor: convert Langfuse/Phoenix/OTel traces to safe issue bundles | 7 | 8 | 7 | 7 | 6 | 6 | 7 | 5 | 6 | 8 | 67 |
| 23 | Lockfile PR Risk Explainer: summarize new package risk deltas only | 8 | 6 | 9 | 8 | 6 | 8 | 7 | 7 | 5 | 6 | 70 |
| 24 | Schema-to-Edge Fixtures: generate deterministic edge-case fixtures from OpenAPI/JSON Schema | 7 | 6 | 7 | 8 | 7 | 7 | 7 | 8 | 6 | 6 | 69 |

## Top 5 Candidates

1. **Cleanroom Run** — selected. It is narrow, immediately useful, easy to demo, and directly addresses the agent-era verification gap: a change that passes only in a dirty local tree is not launch-ready.
2. **LintLane** — strong and buildable, but narrower than Cleanroom Run and partly adjacent to existing Sweeper-style multi-agent lint orchestration.
3. **Agent Contract CI** — strong fit for agent-made PRs, but policy checks can become subjective. Better as a future companion command after Cleanroom Run proves the core verification loop.
4. **DocSmoke** — high demo value, but executable Markdown is crowded and parsing arbitrary docs creates scope traps.
5. **MCP Doctor** — timely, but MCP tooling is already crowded; winning requires deeper protocol support than a v0.1 should attempt.

## Rejected Themes

- Generic AI coding agent: too crowded, expensive to maintain, weak v0.1 comparison against Claude Code, Codex, Gemini CLI, Cline, Aider, and Copilot.
- Generic MCP security scanner: urgent pain, but many `mcp-audit`, `mcp-shield`, and `mcp-guard` variants already exist.
- Full agent observability dashboard: crowded by Langfuse, Opik, Phoenix, Helicone, AgentOps, and OpenTelemetry integrations.
- Broad launch-readiness linter: close to existing repo-readiness/readme-doctor tools and less concrete than executing a clean proof.
- Hosted SaaS: violates the 3-minute, no-account quickstart requirement.

