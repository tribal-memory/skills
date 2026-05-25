# Antigravity CLI

Primary documentation: [antigravity.google/docs/mcp](https://antigravity.google/docs/mcp). The primary page is JS-rendered, so this reference may diverge from the live shape; consult the primary documentation as supplementary context when wiring or troubleshooting.

## Wire-up

No dedicated `mcp add` subcommand is documented. Configuration is via file edit.

## Manual config (file edit)

JSON at `mcp_config.json`. Common paths: project-root `mcp_config.json` for project scope, or the editor's *Manage MCP Servers > View raw config* surface for user scope. Per-server entry under `mcpServers`:

```json
{
  "mcpServers": {
    "tribal": {
      "serverUrl": "http://127.0.0.1:8725/mcp",
      "headers": { "Authorization": "Bearer <token>" }
    }
  }
}
```

For stdio: `command` + `args`, mirroring Gemini CLI's shape.

## Translating from `tribal mcp-config`

The canonical `url` field maps to Antigravity's `serverUrl` (not `url`, not `httpUrl`). The `headers` block carries through.

```bash
tribal mcp-config | jq '{serverUrl: .url, headers: .headers}'
```

Produces the per-server entry the agent merges under the existing `mcpServers` key.

## Verification

The editor's *Manage MCP Servers* panel surfaces registered servers. Antigravity has no in-session MCP reload, so restart the session after wiring to pick up a newly-added server.

## Quirks

- **Do NOT** use `url` or `httpUrl` in an Antigravity config; both are silently ignored. Antigravity expects `serverUrl`. This is the single biggest copy-paste hazard from canonical `tribal mcp-config` output and from Gemini CLI snippets.
- If `tribal check --providers` flags an env-var auth issue, the harness was launched before the variable came into scope: ask the user to quit, set the variable, and relaunch. Let the check failure be the signal; do not probe the environment directly.
