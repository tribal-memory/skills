# Tribal Skills

Cross-harness skills for [Tribal](https://github.com/tribal-memory/tribal), semantic compression for project knowledge.

## Install

```bash
npx skills add tribal-memory/skills
```

The [skills CLI](https://github.com/vercel-labs/skills) wires these into your harness. Both skills register without further configuration; each one activates when its triggers fire.

## Skills

| Skill | When it activates | What it teaches |
|---|---|---|
| [`installing-tribal`](./skills/installing-tribal/SKILL.md) | First setup, switching transports, re-wiring after a harness change | Binary install paths, `tribal bootstrap`, `tribal check`, MCP config wire-up |
| [`using-tribal`](./skills/using-tribal/SKILL.md) | Day-to-day ingest, query, traverse, diagnose | What Tribal is for, how ingests are phrased, discover and explore patterns, the diagnostic primitive |

Per-harness wire-up references cover Claude Code, Codex, Gemini CLI, Antigravity, and OpenCode. Other harnesses supported by the skills CLI consume Tribal's canonical `tribal mcp-config` output directly.

## Layout

```
skills/
├── installing-tribal/SKILL.md   # First setup
└── using-tribal/SKILL.md        # Day-to-day use
references/
├── tacit-knowledge.md           # How to phrase ingests
├── mcp-tools.md                 # Workflow nuance for the MCP tools
├── bootstrap-output.md          # CLI JSON output shapes
├── tribal-check-remediation.md  # Diagnostic walkthrough
├── consent.md                   # Credential-bearing files
├── platforms.md                 # OS and architecture variance
├── failure-modes.md             # Non-check failure modes
└── harnesses/                   # Per-harness wire-up references
```

The skill bodies are the entry points; the reference files carry the depth and are loaded on demand.

## About Tribal

Tribal stores tacit, semantic, and procedural knowledge: the why behind decisions, the ways of working a team has converged on, and the breakthroughs that surface during real engineering work. The kind of context that walks out the door when a teammate leaves.

For the binary, install paths, and the full project surface, see [`tribal-memory/tribal`](https://github.com/tribal-memory/tribal).

## Contributing

Contributions are welcome for:

- New harness wire-up references under `references/harnesses/<harness>.md`.
- Real-world footgun additions to `references/failure-modes.md`.
- Phrasing patterns and worked transformations in `references/tacit-knowledge.md`.

Open a pull request; the structure and editorial conventions live in the existing files.

## License

[CC-BY-4.0](./LICENSE). Use, modify, and redistribute with attribution.
