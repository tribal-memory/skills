# Antigravity CLI

Primary documentation: [antigravity.google/docs/mcp](https://antigravity.google/docs/mcp). The page is JavaScript-rendered and hard to mirror, so this reference is deliberately thin: treat Antigravity's own docs as the source of truth, and lean on them (and the agent) when setting up or debugging.

Antigravity defines MCP servers in a standalone `mcp_config.json` (not nested in `settings.json`), under a top-level `mcpServers` key:

- Global scope: `~/.gemini/config/mcp_config.json`
- Workspace scope: `.agents/mcp_config.json`

## stdio (the supported path)

Stdio works out of the box: Antigravity spawns Tribal as a subprocess, authenticated as `principal:local` at runtime, so there is no URL, token, or header to manage. Take the `command` and `args` from the stdio `tribal mcp-config` output and place them under `mcpServers.tribal` in one of the files above.

## HTTP and SSE

Antigravity's remote-MCP auth uses a static token, not OAuth, so the loopback default (URL-only) is not enough on its own. Take the URL and bearer from `tribal mcp-config --static-token`. Antigravity's remote config shape is its own (it uses `serverUrl`, not `url` or `httpUrl`) and is not verified against Tribal here, so consult Antigravity's MCP documentation for the current shape and map the URL and token onto it.

## Verification

The editor's *Manage MCP Servers* panel lists registered servers. Antigravity has no in-session MCP reload, so restart after wiring.
