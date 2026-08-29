# ui-design-engineer

A portable Agent Skill (V1.2.1) that turns a coding agent into a design-system-aware
UI/UX design engineer. See [`README.md`](README.md) for installation and
[`CHANGELOG.md`](CHANGELOG.md) for version history. The skill body lives in
`skills/ui-design-engineer/` (SKILL.md + references/ + templates/ + checklists/ +
scripts/).

## Structure

- `skills/ui-design-engineer/` — the installable skill (copy this dir, not the repo root)
- `tests/` — skill self-test suite
- `evals/` — paired A–L evaluation runs and the v1.2.1 retest
- `.claude-plugin/` — Claude Code plugin marketplace manifest

## Memory — OpenViking (PRIMARY)

**OpenViking** (`viking://`) is the primary long-term context database. Run locally at
`http://127.0.0.1:1933/mcp` and registered in `~/.omp/agent/mcp.json`. **ALWAYS use the
OpenViking MCP for memory** — recall before answering, retain after learning.

- Recall: `find` / `search` (semantic; `search mode=context` = injection-ready)
- Retain: `write` / `remember`; read/browse: `read` / `list` / `tree` / `glob`; edit: `edit`
- This project's docs: `viking://resources/ui-design-engineer/` (README/CHANGELOG, `skills/`, `evals/`, `.claude-plugin/`)
- Durable memories: `viking://user/default/memories/ui-design-engineer/`
- Use canonical `viking://user/default/...` (the `viking://~/` alias is rejected by `write`).

omp `memory.backend` stays `mnemopi` for auto-injected session history (dual-run);
OpenViking is the store you actively search and write to.
