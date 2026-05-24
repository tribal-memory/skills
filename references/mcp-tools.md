<!-- PLACEHOLDER (CHECKPOINT 1 scaffold): authored at CHECKPOINT 6.

Renamed scope per CHECKPOINT 1 feedback (file may end up as
`tools-and-workflows.md` at CHECKPOINT 6 — name confirmed during authoring):

The file does NOT enumerate Tribal's MCP tools by name. Reasons:
  - Drift surface: if tools are added or removed, the list rots.
  - Harness namespacing: Claude Code prepends an MCP-server prefix to tool
    names (e.g. `mcp__tribal__tribal_set_context`); other harnesses may
    namespace differently. Enumerating without the prefix is wrong; with the
    prefix is harness-specific.
  - The MCP server already exposes its tools via the `List Tools` JSON-RPC
    method. The harness uses it natively at activation time. Re-listing here
    duplicates and risks contradicting that surface.

Instead, the file:

  1. Tells the agent: "your harness already knows Tribal's tools — it called
     `List Tools` against the Tribal MCP server at activation. Look at the
     tool list your harness surfaces; the names below are the canonical
     un-namespaced forms, but your harness may have prefixed them."

  2. Describes the workflow shape that the tools compose into, abstractly:
       - Set context once per session (project, model).
       - Ingest asynchronously; receive a job ID.
       - Poll job status until completion.
       - Discover by semantic similarity.
       - Explore the relation graph from a known item.
       - Get items by ID.
       - Provide feedback on retrieval quality.

  3. Per category (set-context / ingest / discover / explore / get / feedback /
     job-status), describes purpose and behaviour in 3-5 lines. The agent
     maps category to whatever specific tool name its harness presents.

  4. Tool-output interpretation patterns (item IDs, standing, references,
     traversal direction) — these are stable across versions and harnesses,
     so they CAN be documented here.

Target: ~120 lines (down from ~150 in original plan — no enumeration).
-->
