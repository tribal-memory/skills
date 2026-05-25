# Tribal Skills

Cross-harness skills for [Tribal](https://github.com/tribal-memory/tribal), semantic compression for project knowledge.

## Install

Harnesses without native support for the skills specification (Claude Code among them) need their config directory to exist first; the CLI won't create it. Create it, then add the skills:

```bash
mkdir -p .claude/skills
npx skills add tribal-memory/skills
```

`.claude/skills` is project scope; use `~/.claude/skills` for a global install. The first `npx skills` run downloads the skills CLI; accept the prompt. After installing, restart your harness session so it loads the new skills.

The [skills CLI](https://github.com/vercel-labs/skills) wires the skills into your harness. Both register without further configuration; each activates when its triggers fire.

## Skills

| Skill | When it activates | What it teaches |
|---|---|---|
| [`installing-tribal`](./skills/installing-tribal/SKILL.md) | First setup, switching transports, re-wiring after a harness change | Binary install paths, `tribal bootstrap`, `tribal check`, MCP config wire-up |
| [`using-tribal`](./skills/using-tribal/SKILL.md) | Day-to-day ingest, query, traverse, diagnose | What Tribal is for, how ingests are phrased, discover and explore patterns, the diagnostic primitive |

Per-harness wire-up references cover Claude Code, Codex, Gemini CLI, Antigravity, and OpenCode. Other harnesses supported by the skills CLI consume Tribal's canonical `tribal mcp-config` output directly.

## Layout

```
skills/
├── installing-tribal/
│   ├── SKILL.md
│   └── references/   # bootstrap-output, consent, failure-modes, harnesses/, platforms, tribal-check-remediation
└── using-tribal/
    ├── SKILL.md
    └── references/   # bootstrap-output, failure-modes, mcp-tools, tacit-knowledge, tribal-check-remediation
```

Each skill is self-contained: its references live inside its own directory, so they travel with `npx skills add` (a skill installs its directory, not the whole repo). The skill bodies are the entry points; the reference files carry the depth and are loaded on demand. `tribal-check-remediation`, `failure-modes`, and `bootstrap-output` appear in both skills by design, since each must stand alone; a CI check keeps the shared copies in sync.

## About Tribal

Tribal stores tacit, semantic, and procedural knowledge: the why behind decisions, the ways of working a team has converged on, and the breakthroughs that surface during real engineering work. The kind of context that walks out the door when a teammate leaves.

For the binary, install paths, and the full project surface, see [`tribal-memory/tribal`](https://github.com/tribal-memory/tribal).

## Contributing

Contributions are welcome for:

- New harness wire-up references under `skills/installing-tribal/references/harnesses/<harness>.md`.
- Real-world footgun additions to `failure-modes.md` (it lives in both skills and must stay in sync; the CI check enforces this).
- Phrasing patterns and worked transformations in `skills/using-tribal/references/tacit-knowledge.md`.

Open a pull request; the structure and editorial conventions live in the existing files.

## License

[CC-BY-4.0](./LICENSE). Use, modify, and redistribute with attribution.
