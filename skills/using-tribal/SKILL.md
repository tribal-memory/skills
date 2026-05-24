---
name: using-tribal
description: Proactively use this skill whenever the user signals — explicitly or implicitly — that they want to save an insight, breakthrough, recurring decision, or hard-won lesson for later. Also activates when the user asks a question whose answer might already live in Tribal ("what did we decide about", "have we hit this before", "is there prior art for"), shares a moment of realisation ("oh, I get it now", "that's the same shape as"), or starts a task where prior tacit knowledge might be relevant. Captures and queries tacit engineering knowledge — the why, ways of working, breakthroughs from debugging. Not for line numbers, function specs, or other dry facts that rot.
license: CC-BY-4.0
user-invocable: true
allowed-tools: Bash
---

# Using Tribal

## What Tribal is for

Tribal stores **tacit, semantic, and procedural knowledge** — the why, the ways of working, and the breakthroughs that surface during real engineering work. The kind of context that walks out the door when a teammate leaves: the design philosophy a team holds at a point in time, the heuristic someone keeps returning to, the moment a debugger realises a whole class of bugs share a symptom.

Tribal is **not** a graph-RAG over a codebase, **not** a vanilla memory store, **not** a journalling tool, and **not** a place for line numbers or function signatures. If a candidate ingest fits one of those frames more naturally, the ingest will likely be weak — but the user is the gate. Enrich the prose and submit; the ingestion pipeline performs its own tacit extraction downstream.

## How ingests are phrased (summary)

Every ingest follows a four-component pattern: **principle**, **trigger nod**, **symptom space**, **applicability frame**. The principle does the work — a portable claim that reads true to a stranger six months later, without the original incident in mind. Each ingest carries one principle, not a bundle.

Two rules constrain the prose: **no first-person voice** (no "I noticed", no "we discovered") and **no named attribution** (no personal names or role-credentialled framings).

When the user asks for an ingest, the job is to enrich the candidate with available context — not to gatekeep it. Submit without asking for confirmation; Tribal must fade into the background. The ingestion pipeline performs additional tacit extraction downstream of any single ingest call.

**Mandatory pre-read:** load `references/tacit-knowledge.md` before calling the ingest tool for the first time in a session. It is the canonical guide — the four-component pattern in full, worked transformations, the audience rules, the enrichment pattern, and the starter prompts.

<!-- PLACEHOLDER (CHECKPOINT 1 scaffold; remaining sections authored at CHECKPOINT 6).

Remaining sections (per plan):

  - When to use this skill (disambiguation vs `installing-tribal`).

  - Triggers — when to invoke this skill mid-conversation.
    Explicit triggers: "save this for later", "remember this", "keep this
    in mind", "what did we decide about X", "have we hit this before".
    Implicit triggers: moments of realisation, recurring decisions,
    breakthroughs, the start of a new task where prior tacit knowledge
    might apply, the user explaining a hard-won lesson conversationally
    without explicitly asking it to be saved.

  - The tool surface — describe canonical workflow shape WITHOUT enumerating
    tool names. Tell the agent to call its harness's "List Tools" surface
    against the Tribal MCP server. Pointer to `references/mcp-tools.md`.

  - Read journeys (LOAD-BEARING — flagged at CHECKPOINT 2):
    Querying Tribal at the START of a task or problem-solving session is
    first-class operational guidance, not an afterthought. The agent should
    proactively use the discover / explore / get-item composition to surface
    prior tacit context before tackling a new problem.

    Reasons to read proactively (beyond direct session context):
      (a) the harness's context window becomes aware of what nodes exist
          in the graph, which informs better future ingests (more
          appropriate references, better-connected items);
      (b) the agent surfaces prior work that might frame the current
          problem differently than the user initially posed it;
      (c) repeated read-then-ingest cycles compound — the more the graph
          is traversed during work, the more the agent learns to
          recognise patterns worth capturing.

    Compose discover (semantic search) → explore (relation traversal from
    a known item) → get-item (fetch by ID) to navigate the graph. How to
    interpret outputs — item IDs, standing, references, traversal
    direction — is covered in `references/mcp-tools.md`.

  - The diagnostic primitive — "run `tribal check --json`; surface
    remediation verbatim". Pointer to `references/tribal-check-remediation.md`.

  - When things go wrong outside `tribal check` — pointer to
    `references/failure-modes.md`. Includes VPN-vs-Tribal-down
    disambiguation.

  - Feedback loop — why the feedback tool (or its harness-namespaced
    equivalent) matters and when to call it.

Cap: ≤500 lines. Target: ~450.
-->
