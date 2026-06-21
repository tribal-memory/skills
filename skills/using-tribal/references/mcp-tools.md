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

- **Ingest is eventually consistent.** The call returns a `job_id` immediately; the pipeline (extract, triage, relate) runs in the background. Carry on rather than polling; reach for job status only when a next step needs the item committed first. To block on that one follow-up, set `wait_seconds` (capped at 30) on the status call: it waits for the job to finish or the timeout to expire. Under the agentic loop executor (see `installing-tribal`) a stage investigates and verifies, so it runs longer and a `wait_seconds` call often returns before it finishes, which is expected.

- **Get expands ID references on items.** Standing fields carry IDs (`newest_supporting_id`, `newest_contradicting_id`) without inlining the full content. When the agent wants to see what one of those references actually says, fetch by ID. The same applies to any ID surfaced in a response or carried across sessions.

- **Standing is the reliability signal.** Opt in via `include_standing` on discover, explore, or get. Use it when weighing one item against alternatives: the support count, contradiction count, supporting-evidence diversity, and the IDs of the newest supporters and contradictors all surface there.

- **Feedback is a private local log.** It records observations into the user's own Postgres; nothing is transmitted anywhere. It rates the **session**, not individual items: item-level support and contradiction live in the `supports` and `contradicts` relations laid down at ingest time. Submit feedback when the signal is clear; session-end is a sensible default but not the only valid moment.

- **Reindex is an operator pathway, not part of the read or ingest loop.** The reindex tools are scope-gated (`tribal.embedding:execute`), single-flight, and have no status tool: progress is observed with `tribal check`, and the ingest job-status tool does not cover them. See [`reindexing.md`](./reindexing.md) for when and how.

- **Discover cursors are bound to the active embedding profile.** A `discover` response carries `next_cursor` and an `embedding_profile_id`. For the first page, omit the cursor; never pass an empty string (it is rejected as an invalid cursor, which some harnesses surface as a hard error). A reindex that completes mid-pagination changes the active profile and invalidates outstanding cursors, so re-query from the first page if that happens. The `exact` field is the completeness signal: `false` means the result was truncated to the limit (more matches exist), so paginate or raise the limit rather than treating the page as the whole answer.

## Phrasing

Ingest content is knowledge about work, not the artefacts themselves. The four-component pattern lives in [`tacit-knowledge.md`](./tacit-knowledge.md); load it before the first ingest call of a session.
