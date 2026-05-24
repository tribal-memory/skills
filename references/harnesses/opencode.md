# OpenCode

Primary documentation: [opencode.ai/docs/mcp-servers/](https://opencode.ai/docs/mcp-servers/). This reference is a cached snapshot; consult the primary documentation as supplementary context when wiring or troubleshooting.

## Wire-up

No dedicated `opencode mcp add` subcommand exists. Configuration is via file edit.

## Manual config (file edit)

JSON (JSONC accepted) at `opencode.json` (project scope) or `~/.config/opencode/opencode.json` (user scope). Per-server entry under `mcp.<name>`:

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "tribal": {
      "type": "remote",
      "url": "http://127.0.0.1:8725/mcp",
      "enabled": true,
      "headers": { "Authorization": "Bearer {env:TRIBAL_AUTH_TOKEN}" }
    }
  }
}
```

`type: "remote"` is the HTTP form. `type: "local"` is the stdio form with `command` + `args`. Env-var interpolation uses `"{env:VAR_NAME}"` syntax.

Editing this file requires consent per [`consent.md`](../consent.md).

## Translating from `tribal mcp-config --json`

The canonical `url` field maps directly. The `headers` block carries through; OpenCode's `{env:VAR}` interpolation can substitute the bearer token from an env var rather than hard-coding it.

```bash
tribal mcp-config --json | jq '{type: "remote", url: .url, headers: .headers, enabled: true}'
```

Produces the per-server entry the agent merges under the existing `mcp` key.

## Verification

```bash
opencode mcp list
opencode mcp auth list
opencode mcp debug tribal
```

## Quirks

- OpenCode handles OAuth automatically for remote MCP servers via Dynamic Client Registration (RFC 7591). To disable per-server: `"oauth": false`.
- Persistent OAuth tokens live at `~/.local/share/opencode/mcp-auth.json`.
- The `{env:VAR}` interpolation works in `headers` and OAuth credentials. Useful for keeping bearer tokens out of the config file itself.
- If OpenCode is already running without a required variable in scope, ask the user to quit, export the variable, and relaunch.
