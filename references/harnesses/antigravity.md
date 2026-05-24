# Antigravity CLI

Primary documentation: [antigravity.google/docs/mcp](https://antigravity.google/docs/mcp) (fetched 2026-05-24; the primary page is JS-rendered, so the field-shape detail below is corroborated against secondary integration writeups and the Gemini-to-Antigravity migration guide cited at the same URL).

## Wire-up command

No dedicated `agy mcp add` subcommand is documented at the primary URL as of 2026-05-24. Configuration is via file edit.

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

Editing this file requires consent per [`consent.md`](../consent.md).

## Translating from `tribal mcp-config --json`

The canonical `url` field maps to Antigravity's `serverUrl` (not `url`, not `httpUrl`). The `headers` block carries through.

```bash
tribal mcp-config --json | jq '{serverUrl: .url, headers: .headers}'
```

Produces the per-server entry the agent merges under the existing `mcpServers` key.

## Verification

The editor's *Manage MCP Servers* panel surfaces registered servers. A CLI `agy mcp list` is not documented as of 2026-05-24.

## Quirks

- The `url` → `serverUrl` rename is the single biggest copy-paste hazard from Gemini CLI configs.
- Env-var injection and bearer-token handling are not documented at the primary URL as of 2026-05-24; secondary sources indicate `headers` carries `Authorization` directly.
