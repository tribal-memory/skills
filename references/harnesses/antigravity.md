<!-- PLACEHOLDER (CHECKPOINT 1 scaffold): authored at CHECKPOINT 5.

Antigravity CLI wire-up.

  - Primary doc URLs + `fetched: <date>`:
      * https://antigravity.google/docs/mcp
      * https://developers.googleblog.com/an-important-update-transitioning-gemini-cli-to-antigravity-cli/

  - Binary: `agy` (verify at authoring time).

  - Config file: ~/.gemini/antigravity-cli/mcp_config.json (CLI form).
    Desktop editor uses ~/.gemini/antigravity/mcp_config.json. Skill body
    should describe the CLI form first and note the editor variant only as
    a brief aside.

  - Workspace config: .agents/mcp_config.json.

  - HTTP transport key: `serverUrl` (NOT `url`). The jq translation must
    rename `url` → `serverUrl` for Antigravity.

  - jq translation from canonical `tribal mcp-config --json` output →
    the Antigravity shape.

  - Wire-up one-liner (verify at authoring time; the product docs are the
    source of truth).

  - Ask-first consent reminder → references/consent.md.

Target: ~70 lines (slightly larger than other harnesses to cover the
serverUrl divergence and the CLI-vs-editor path split).

(Internal author note, not user-visible: Antigravity is newer than the other
harnesses; maintain alongside Gemini CLI without positioning one over the
other in user-visible content.)
-->
