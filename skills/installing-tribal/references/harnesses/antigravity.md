# Antigravity CLI

Primary documentation: [antigravity.google/docs/mcp](https://antigravity.google/docs/mcp). The page is JavaScript-rendered and hard to mirror, so this reference is deliberately thin: treat Antigravity's own docs as the source of truth, and lean on them (and the agent) when setting up or debugging.

Antigravity defines MCP servers in a standalone `mcp_config.json` (not nested in `settings.json`), under a top-level `mcpServers` key:

- Global scope: `~/.gemini/config/mcp_config.json`
- Workspace scope: `.agents/mcp_config.json`

## stdio (the supported path)

Stdio works out of the box: Antigravity spawns Tribal as a subprocess, authenticated as `principal:local` at runtime, so there is no URL, token, or header to manage. Take the `command` and `args` from the stdio `tribal mcp-config` output and place them under `mcpServers.tribal` in one of the files above (the `command` + `args` shape follows Gemini CLI's config lineage).

## HTTP and SSE

Not documented here. Antigravity's remote-MCP auth is its own scheme (a static token via `env`, with no OAuth flow) and is not verified against Tribal's bearer expectation, so consult Antigravity's MCP documentation for the current remote shape (it uses `serverUrl`, not `url` or `httpUrl`). Use `tribal mcp-config` output as the reference for the URL and token, and let the agent help debug the wire-up against it.

## Verification

The editor's *Manage MCP Servers* panel lists registered servers. Antigravity has no in-session MCP reload, so restart after wiring.
