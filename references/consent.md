<!-- PLACEHOLDER (CHECKPOINT 1 scaffold): authored at CHECKPOINT 4.

The ask-first protocol for credential-bearing files.

Hard rule: the agent must NEVER read or write any of the following without explicit,
per-file user consent in the current session:
  - credentials.json (XDG_CONFIG_HOME/tribal/credentials.json).
  - Harness MCP config files (~/.claude.json, ~/.codex/config.toml, ~/.gemini/*,
    ~/.config/opencode/*).
  - Shell rc files (.zshrc, .bashrc, .profile, etc.).

Pattern: "I'd like to add Tribal's MCP config to <path>. May I?" Proceed only on yes.

Exception: running `tribal mcp-config` itself is fine — the binary is the
authorisation surface; the command reads no user state.

Target: ~50 lines.
-->
