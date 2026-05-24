<!-- PLACEHOLDER (CHECKPOINT 1 scaffold): authored at CHECKPOINT 2.

Single umbrella file covering the full ingestion philosophy. Consolidates the
former first-ideas.md content (deleted) so there is one place for ingestion
guidance, not two.

Sections (target ~200 lines total):

  1. What Tribal is for — positioning in full. Tacit / semantic / procedural
     knowledge. The why and the how. Bus-factor protection. Engineering
     philosophy at a point in time. NOT a graph rag. NOT a vanilla memory
     store. NOT a journalling tool. NOT for line numbers or function specs.

  2. The four-component phrasing pattern for ingests:
       (a) The principle — portable claim that ages well.
       (b) Brief trigger nod — one line, no dates, no "I was asked to ingest".
       (c) Symptom space — where this principle hides.
       (d) Applicability frame — when to apply to a new problem.
     Plus the "delta" framing: the gap between trigger and saved item is
     itself the active tacit signal.

  3. Worked transformation pairs (3-4 across distinct domains — transport,
     db, build, interpersonal-process). Each shows a dry-fact ✗ next to its
     tacit reframing ✓. Use ✓ (U+2713 CHECK) and ✗ (U+2717 BALLOT X) only —
     no emoji.

  4. Audience + attribution rules — load-bearing:
       - Ingest facts and principles, NOT first-person narratives.
       - No references to who ingested ("I", "we today", "$user said").
       - No agent self-reference ("the assistant noticed").
       - The audience is a future, unknown agent or person who has no context
         about who ingested or when. Knowledge must stand on its own merit.
       - Programmatic attribution (who created the item) is separate from
         the prose content; mixing them in the text introduces drift and a
         credibility-based weighting failure mode (a more senior-titled
         person's incorrect ingest takes precedence over a junior's correct
         ingest, because the prose includes the speaker's identity). Strip
         identity from the content; let the principle speak.

  5. Starter prompts — formerly references/first-ideas.md. A menu of 6-8
     ingestible categories, each phrased through the tacit lens. Each entry
     ~3 lines. Anti-pattern callout: "ingest a design doc" is too surface;
     ingest the philosophy underneath. Featured categories: why-X-over-Y
     rationale, recurring code-review heuristic, breakthrough symptom-space
     framing, decision we keep re-litigating, time-stamped philosophy
     snapshot, bus-factor knowledge converted to principle. Closes with the
     non-prescription line: "Pick one or none. Your first ingest is yours."

  6. Agent coaching instruction — when an ingest request reads as too
     surface-level (a function spec, a literal error, a dated journal
     entry), the agent must push back, ask "what about this surprised you?
     what would you want a teammate to take from it six months from now?",
     and rephrase into the four-component shape with user confirmation
     before submission.

  7. Distinction from adjacent tools — journalling (Day One, Notion daily
     logs) and graph-RAG (LangGraph, vector DBs over docs). Tribal is
     neither.
-->
