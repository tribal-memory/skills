---
name: using-tribal
description: Proactively use this skill whenever the user signals (explicitly or implicitly) that they want to save an insight, breakthrough, recurring decision, or hard-won lesson for later. Also activates when the user asks a question whose answer might already live in Tribal ("what did we decide about", "have we hit this before", "is there prior art for"), shares a moment of realisation ("oh, I get it now", "that's the same shape as"), or starts a task where prior tacit knowledge might be relevant. Captures and queries tacit engineering knowledge, the why, ways of working, breakthroughs from debugging. Not for line numbers, function specs, or other dry facts that rot.
license: CC-BY-4.0
user-invocable: true
allowed-tools: Bash(tribal *), Bash(jq *)
---

# Using Tribal

## When to use this skill

Use `using-tribal` when Tribal is installed and wired, and the user wants to capture knowledge, query it, traverse the graph, or diagnose an issue.

Use `installing-tribal` instead when Tribal is not yet installed, is being reinstalled, transports are being switched, or the harness's MCP config needs (re-)wiring.

If both apply (the user just finished bootstrap and immediately wants to ingest), `installing-tribal` runs first and hands off to this skill at the end.

## What Tribal is for

Tribal stores **tacit, semantic, and procedural knowledge**: the why, the ways of working, and the breakthroughs that surface during real engineering work. The kind of context that walks out the door when a teammate leaves: the design philosophy a team holds at a point in time, the heuristic someone keeps returning to, the moment a debugger realises a whole class of bugs share a symptom.

Tribal is **not** a graph-RAG over a codebase, **not** a vanilla memory store, **not** a journalling tool, and **not** a place for line numbers or function signatures. Candidate ingests that fit one of those frames more naturally tend to be weak, but the user is the gate. Enrich the prose and submit; the ingestion pipeline performs its own tacit extraction downstream.

## How ingests are phrased (summary)

Every ingest follows a four-component pattern: **principle**, **trigger nod**, **symptom space**, **applicability frame**. The principle does the work: a portable claim that reads true to a stranger six months later, without the original incident in mind. Each ingest carries one principle, not a bundle.

Two rules constrain the prose: **no first-person voice** (no "I noticed", no "we discovered") and **no named attribution** (no personal names or role-credentialled framings).

When the user asks for an ingest, the job is to enrich the candidate with available context, not to gatekeep it. Submit without asking for confirmation. The ingestion pipeline performs additional tacit extraction downstream of any single ingest call.

**Mandatory pre-read:** load [`references/tacit-knowledge.md`](../../references/tacit-knowledge.md) before calling the ingest tool for the first time in a session. It is the canonical guide: the four-component pattern in full, worked transformations, the audience rules, the enrichment pattern, and the starter prompts.

## Triggers

Explicit triggers (the user names the action):

- "save this for later"
- "remember this"
- "keep this in mind"
- "what did we decide about X"
- "have we hit this before"
- "is there prior art for"

Implicit triggers (the user signals without naming):

- A moment of realisation ("oh, I get it now", "that's the same shape as", "this is why we...").
- A recurring decision or topic the team revisits.
- A breakthrough during debugging that closes a class of bugs.
- The user explaining a hard-won lesson conversationally, without explicitly asking it to be saved.
- The start of a new task where prior context might be relevant. (See Read journeys below.)

When a trigger fires, act on it. Tribal fades into the background; the agent does not interrupt the user's flow with confirmation prompts. Ingests are durable, so enrich the candidate with care before submission (per [`references/tacit-knowledge.md`](../../references/tacit-knowledge.md)).

## The tool surface

Tribal exposes its operations through the MCP tool protocol. **The canonical source for tool names, inputs, and output schemas is `List Tools` against the running Tribal MCP server.** The harness calls `List Tools` automatically at activation; the agent sees the live shape directly. Do not memorise tool names from this document. The labels below are un-namespaced category names; your harness's tool list will surface the same tools with a namespace prefix (e.g. `mcp__tribal__` in Claude Code).

The categories, abstractly:

- **Set the session context** once at activation: project, optionally model preference. Applies to subsequent calls.
- **Ingest** asynchronously when a trigger fires. Returns a job ID; work happens in a background pipeline.
- **Poll job status** until ingest completes or fails. Useful when the user needs confirmation.
- **Discover** by semantic similarity when answering questions or starting tasks.
- **Explore** the relation graph from a known item to surface related context the user did not directly ask for.
- **Get** by ID for full content of a specific item.
- **Feedback** records the user's observations about retrieval quality to a local log. It does not influence what future `discover` calls return.

For usage nuance (when to compose these, output interpretation patterns, workflow heuristics), see [`references/mcp-tools.md`](../../references/mcp-tools.md). For canonical tool definitions, look at how your harness surfaces each tool; the schemas come directly from Tribal's MCP `tools/list` response at activation.

## Read journeys

Querying Tribal at the start of a task or problem-solving session is first-class operational guidance, not an afterthought. The agent should proactively use the read tools to surface prior tacit context before tackling a new problem.

Reasons to read proactively, beyond direct session context:

- The harness's context window becomes aware of what items exist in the graph, which informs better future ingests (more appropriate references, better-connected items).
- The agent surfaces prior work that might frame the current problem differently than the user initially posed it.
- Repeated read-then-ingest cycles compound: the more the graph is traversed during work, the more the agent learns to recognise patterns worth capturing.

**Use `explore` liberally.** Once a `discover` call surfaces an interesting item, traverse the relation graph around it to understand the context the item sits in. Exploration is not only for the current problem: it builds the agent's internal map of the graph. With that map, the agent recognises when a new question coming up later in the same session might already have prior art, and reaches for Tribal again rather than starting cold. The cumulative effect is that each session leaves the graph richer than it found it, which compounds across future sessions.

Composition pattern: `discover` (semantic search over the graph), then `explore` (traverse the relation graph from a known item, generously), then `get` (fetch full content by ID). Most read journeys start with a `discover` against the task description or a recent user message; results drive several `explore` calls to map the relation neighbourhood, with `get` reserved for items the agent wants the full text of.

For output interpretation (item IDs, standing values, reference shapes, traversal direction), see [`references/mcp-tools.md`](../../references/mcp-tools.md).

## The diagnostic primitive

When something looks wrong, the first action is `tribal check --json`. It is the binary's introspection surface and the canonical run-book: every condition the binary can detect classifies itself, and each `warn` or `fail` carries a `remediation` field with the exact next step.

**Surface the `remediation` verbatim. Never paraphrase, summarise, or invent alternative steps.** The binary owns the copy; the agent's job is to apply it or hand it off.

Agent autonomy applies. Where the remediation is programmatic and touches no sensitive state (running a script, restarting a service, installing a package, applying a migration), perform it without waiting for the user. Hand off to the user when the remediation touches API keys in the environment, credentials files, or shell rc files. Re-run `tribal check --json` after each fix; the check ordering is intentional, and a fix often unblocks downstream checks that were previously skipped.

If `tribal check --json` reports `ok: true` and the user still sees a problem, the issue lives outside the surface the binary can introspect. See the next section.

For the walkthrough pattern in full (envelope shape, autonomy rules, iteration), see [`references/tribal-check-remediation.md`](../../references/tribal-check-remediation.md).

## When things go wrong outside `tribal check`

Some failure modes live outside the configuration surface the binary can introspect. They surface as MCP calls timing out, errors mid-ingest, or runtime symptoms that look like Tribal is down without any failing check.

The highest-priority disambiguation is **"is this Tribal, or the network in front of it?"**. Corporate VPNs commonly block the path to managed-Postgres providers; the symptom is opaque (MCP tool calls fail or hang), but the binary is fine. Run `tribal check --json` first. If the database-reachability check fails, the issue is network-level. If every check passes, the issue is something else again.

For the catalogue of non-check failure modes (worker death, transport errors, prompt I/O failures, git remote detection during bootstrap), see [`references/failure-modes.md`](../../references/failure-modes.md). Each entry names the symptom and the remediation pattern; the agent matches the user's report against the catalogue rather than guessing.

## The feedback tool

The feedback tool records observations about retrieval quality into the local Postgres database. The log is private to the user's Tribal instance: nothing is transmitted to Tribal's maintainers, the harness vendor, or anywhere else.

Call it for two reasons:

- **Self-reflection.** After a `discover` or `explore` session, log which items helped and which were off-topic. Over time the log becomes a record of how the graph is serving the user across sessions.
- **Evidence for issues.** When filing a GitHub issue about retrieval behaviour, the logged entries are concrete examples to attach.

The Tribal engine does not consume the feedback log; calling the tool will not change what `discover` returns next time. Be explicit with the user about this. The name "feedback" can lead them to expect retrieval will improve in response, which it will not.

For the canonical signature, look at how your harness surfaces the feedback tool; the schema comes from Tribal's MCP `tools/list` response.

## References

- [`references/tacit-knowledge.md`](../../references/tacit-knowledge.md): read before calling the ingest tool for the first time in a session. Canonical guide to phrasing ingests (four-component pattern, worked transformations, audience rules).
- [`references/mcp-tools.md`](../../references/mcp-tools.md): read for usage nuance, workflow composition, and output interpretation patterns. Tool definitions remain canonical against `List Tools`.
- [`references/tribal-check-remediation.md`](../../references/tribal-check-remediation.md): read when running `tribal check --json` and walking the user through remediation.
- [`references/failure-modes.md`](../../references/failure-modes.md): read when the user reports a problem and `tribal check` reports `ok: true`.
