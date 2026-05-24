# Claude Code

Primary documentation: [docs.claude.com/en/docs/claude-code/mcp](https://docs.claude.com/en/docs/claude-code/mcp). This reference is a cached snapshot; consult the primary documentation as supplementary context when wiring or troubleshooting.

## Wire-up command (preferred)

Bootstrap's stderr output prints this directly:

```bash
claude mcp add-json tribal "$(tribal mcp-config)"
```

Claude Code accepts the canonical `tribal mcp-config` output as-is. No translation needed.

For the long-form `claude mcp add` variant (useful when the user wants to override specific fields):

```bash
# HTTP transport
claude mcp add --transport http tribal http://127.0.0.1:8725/mcp \
  --header "Authorization: Bearer <token>"

# Stdio transport
claude mcp add --transport stdio tribal -- /path/to/tribal serve
```

All flags must precede the server name; `--` separates the server name from the stdio spawn command.

## Manual config (file edit)

JSON at one of:

- User scope: `~/.claude.json` (server entries under `mcpServers` or `projects.<path>.mcpServers`).
- Project scope: `.mcp.json` at the repo root.

Per-server entry shape mirrors `tribal mcp-config --json` directly. For HTTP:

```json
{
  "mcpServers": {
    "tribal": {
      "type": "http",
      "url": "http://127.0.0.1:8725/mcp",
      "headers": { "Authorization": "Bearer ${TRIBAL_AUTH_TOKEN}" }
    }
  }
}
```

For stdio: `command`, `args`, `env`. Editing these files requires consent per [`consent.md`](../consent.md).

## Translating from `tribal mcp-config --json`

The canonical shape is accepted directly by `claude mcp add-json`. For manual merging into `~/.claude.json`:

```bash
tribal mcp-config --json | jq '{tribal: .}'
```

Produces the per-server entry the agent merges under the existing `mcpServers` key.

## Verification

```bash
claude mcp list
claude mcp get tribal
```

Inside a Claude Code session, `/mcp` opens the runtime status panel.

## Quirks

- The `type` field accepts `"streamable-http"` as an alias for `"http"`.
- `${VAR}` and `${VAR:-default}` env-var expansion works in `command`, `args`, `env`, `url`, `headers`.
- Server name `workspace` is reserved; do not use it.
- `CLAUDE_PROJECT_DIR` is injected into the spawned stdio process automatically.
- If `tribal check --providers` flags an env-var auth issue, the harness was launched before the variable came into scope: ask the user to quit, set the variable, and relaunch. Let the check failure be the signal; do not probe the environment directly.
