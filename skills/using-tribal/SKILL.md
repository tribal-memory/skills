---
name: using-tribal
description: Proactively use this skill whenever the user signals — explicitly or implicitly — that they want to save an insight, breakthrough, recurring decision, or hard-won lesson for later. Also activates when the user asks a question whose answer might already live in Tribal ("what did we decide about", "have we hit this before", "is there prior art for"), shares a moment of realisation ("oh, I get it now", "that's the same shape as"), or starts a task where prior tacit knowledge might be relevant. Captures and queries tacit engineering knowledge — the why, ways of working, breakthroughs from debugging. Not for line numbers, function specs, or other dry facts that rot.
license: CC-BY-4.0
user-invocable: true
allowed-tools: Bash
---

# Using Tribal

## When to use this skill

Use `using-tribal` when Tribal is installed and wired, and the user wants to capture knowledge, query it, traverse the graph, or diagnose an issue.

Use `installing-tribal` instead when Tribal is not yet installed, is being reinstalled, transports are being switched, or the harness's MCP config needs (re-)wiring.

If both apply (the user just finished bootstrap and immediately wants to ingest), `installing-tribal` runs first and hands off to this skill at the end.

## What Tribal is for

Tribal stores **tacit, semantic, and procedural knowledge**: the why, the ways of working, and the breakthroughs that surface during real engineering work. The kind of context that walks out the door when a teammate leaves: the design philosophy a team holds at a point in time, the heuristic someone keeps returning to, the moment a debugger realises a whole class of bugs share a symptom.

Tribal is **not** a graph-RAG over a codebase, **not** a vanilla memory store, **not** a journalling tool, and **not** a place for line numbers or function signatures. If a candidate ingest fits one of those frames more naturally, the ingest will likely be weak, but the user is the gate. Enrich the prose and submit; the ingestion pipeline performs its own tacit extraction downstream.

## How ingests are phrased (summary)

Every ingest follows a four-component pattern: **principle**, **trigger nod**, **symptom space**, **applicability frame**. The principle does the work: a portable claim that reads true to a stranger six months later, without the original incident in mind. Each ingest carries one principle, not a bundle.

Two rules constrain the prose: **no first-person voice** (no "I noticed", no "we discovered") and **no named attribution** (no personal names or role-credentialled framings).

When the user asks for an ingest, the job is to enrich the candidate with available context, not to gatekeep it. Submit without asking for confirmation; Tribal must fade into the background. The ingestion pipeline performs additional tacit extraction downstream of any single ingest call.

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
- The start of a new task where prior context might be relevant. (For the read direction; see the read journeys section below.)

When a trigger fires, act on it. Tribal fades into the background; the agent does not interrupt the user's flow with confirmation prompts. Ingests are durable, so enrich the candidate with care before submission (per [`references/tacit-knowledge.md`](../../references/tacit-knowledge.md)).

## The tool surface

Tribal exposes its operations through the MCP tool protocol. **The canonical source for tool names, inputs, and output schemas is `List Tools` against the running Tribal MCP server.** The harness calls `List Tools` automatically at activation; the agent sees the live shape directly. Do not memorise tool names from this document. Names also carry harness-specific namespace prefixes, so the canonical un-namespaced categories below will look slightly different in the harness's tool list than they appear here.

The categories, abstractly:

- **Set the session context** once at activation: project, optionally model preference. Applies to subsequent calls.
- **Ingest** asynchronously when a trigger fires. Returns a job ID; work happens in a background pipeline.
- **Poll job status** until ingest completes or fails. Useful when the user needs confirmation.
- **Discover** by semantic similarity when answering questions or starting tasks.
- **Explore** the relation graph from a known item to surface related context the user did not directly ask for.
- **Get** by ID for full content of a specific item.
- **Feedback** on retrieval quality after a discover or explore session. Trains the system.

For usage nuance (when to compose these, output interpretation patterns, workflow heuristics), see [`references/mcp-tools.md`](../../references/mcp-tools.md). For canonical tool definitions, consult `List Tools` directly.

## Read journeys

Querying Tribal at the start of a task or problem-solving session is first-class operational guidance, not an afterthought. The agent should proactively use the read tools to surface prior tacit context before tackling a new problem.

Reasons to read proactively, beyond direct session context:

- The harness's context window becomes aware of what items exist in the graph, which informs better future ingests (more appropriate references, better-connected items).
- The agent surfaces prior work that might frame the current problem differently than the user initially posed it.
- Repeated read-then-ingest cycles compound: the more the graph is traversed during work, the more the agent learns to recognise patterns worth capturing.

**Use `explore` liberally.** Once a `discover` call surfaces an interesting item, traverse the relation graph around it to understand the context the item sits in. Exploration is not only for the current problem: it builds the agent's internal map of the graph. With that map, the agent recognises when a new question coming up later in the same session might already have prior art, and reaches for Tribal again rather than starting cold. The cumulative effect is that each session leaves the graph richer than it found it, which compounds across future sessions.

Composition pattern: `discover` (semantic search over the graph), then `explore` (traverse the relation graph from a known item, generously), then `get` (fetch full content by ID). Most read journeys start with a `discover` against the task description or a recent user message; results drive several `explore` calls to map the relation neighbourhood, with `get` reserved for items the agent wants the full text of.

For output interpretation (item IDs, standing values, reference shapes, traversal direction), see [`references/mcp-tools.md`](../../references/mcp-tools.md).

<!-- PLACEHOLDER (CHECKPOINT 6 — section-by-section authoring continues).

Remaining sections:

  - The diagnostic primitive ("run `tribal check --json`; surface
    remediation verbatim"). Pointer to references/tribal-check-remediation.md.
  - When things go wrong outside `tribal check`. Pointer to
    references/failure-modes.md. Includes VPN-vs-Tribal-down
    disambiguation.
  - Feedback loop — why the feedback tool matters and when to call it.
  - References index at end (HyperFrames pattern; read-when annotations).

Cap: ≤500 lines. Target: ~450.
-->
