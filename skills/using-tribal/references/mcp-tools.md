# Usage nuance for Tribal's MCP tools

Tool names, input schemas, and output schemas are canonical against `List Tools` against the running Tribal MCP server. The harness will already have them surfaced. This file covers the workflow assembly and the cross-cutting patterns the per-tool schemas do not name directly.

## Workflow assembly

```
session start  →  set context
work loop      →  discover → explore (zero or more) → get (as needed)
                  ingest (async) → poll job status if confirmation needed
later          →  feedback against a discover/explore session
```

Set context once after the harness connects: model and provider must be set explicitly (the server cannot infer them); project is resolved automatically from the git remote but can be overridden. Subsequent tool calls inherit these defaults.

## Cross-cutting patterns

- **Trace IDs flow through a retrieval session.** Every `discover` response carries a `trace_id`. Pass it as `session_trace_id` to follow-up `explore` calls; pass it again to `feedback`. Without a `trace_id`, feedback cannot be submitted, so do not fabricate one.

- **Project filter has three modes.** Omit it to use the session-context project. Pass an ID to scope to that project. **Pass null to search across every project.** The null mode is often the most valuable as the graph matures: relationships between work in different projects only surface when the filter is off.

- **Ingest is fire-and-forget by default.** The call returns a `job_id` immediately; the pipeline (extract, triage, relate) runs in the background. Poll job status only when the user explicitly wants confirmation or a downstream operation depends on the item being committed. The status tool supports a blocking mode (capped at 30 seconds) that folds ingest plus poll into a single round-trip for short ingests.

- **Get expands ID references on items.** Standing fields carry IDs (`newest_supporting_id`, `newest_contradicting_id`) without inlining the full content. When the agent wants to see what one of those references actually says, fetch by ID. The same applies to any ID surfaced in a response or carried across sessions.

- **Standing is the reliability signal.** Opt in via `include_standing` on discover, explore, or get. Use it when weighing one item against alternatives: the support count, contradiction count, supporting-evidence diversity, and the IDs of the newest supporters and contradictors all surface there.

- **Feedback is a private local log.** It records observations into the user's own Postgres; nothing is transmitted anywhere. It rates the **session**, not individual items: item-level support and contradiction live in the `supports` and `contradicts` relations laid down at ingest time. Submit feedback when the signal is clear; session-end is a sensible default but not the only valid moment.

## Composition with other MCP servers

Tribal's read tools accept item IDs as inputs. That makes them composable with other MCP servers in the same session: another tool can produce candidate item IDs (for example, a SQL-aware MCP server querying Tribal's Postgres by some structural criterion), and `get` or `explore` continues the journey from there.

## Phrasing

Ingest content is knowledge about work, not the artefacts themselves. The four-component pattern lives in [`tacit-knowledge.md`](./tacit-knowledge.md); load it before the first ingest call of a session.
