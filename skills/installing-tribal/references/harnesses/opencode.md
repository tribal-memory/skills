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

`type: "remote"` is the HTTP form. `type: "local"` is the stdio form, with `command` as a string array (for example `["tribal", "--config", "<path>", "serve", "--project", "<id>"]`) and an `environment` object (not `command`/`args`/`env`). Env-var interpolation uses `"{env:VAR_NAME}"` syntax. Omit the `headers` block for the DCR/OAuth path; include it only for a static bearer.

## Translating from `tribal mcp-config`

OpenCode performs DCR automatically (see Quirks), so the URL-only snippet needs no header:

```bash
tribal mcp-config | jq '{type: "remote", url: .url, enabled: true}'
```

For a static bearer instead, add the header from `--static-token`; OpenCode's `{env:VAR}` interpolation can keep the token out of the file:

```bash
tribal mcp-config --static-token | jq '{type: "remote", url: .url, headers: .headers, enabled: true}'
```

Produces the per-server entry the agent merges under the existing `mcp` key.

## Verification

```bash
opencode mcp list
opencode mcp debug tribal
```

## Quirks

- OpenCode handles OAuth automatically for remote MCP servers via Dynamic Client Registration (RFC 7591). To disable per-server: `"oauth": false`.
- Persistent OAuth tokens live at `~/.local/share/opencode/mcp-auth.json`.
- The `{env:VAR}` interpolation works in `headers` and OAuth credentials. Useful for keeping bearer tokens out of the config file itself.
- If `tribal check --providers` flags an env-var auth issue, the harness was launched before the variable came into scope: ask the user to quit, set the variable, and relaunch. Let the check failure be the signal; do not probe the environment directly.
- OpenCode has no in-session MCP reload; restart the TUI to pick up a newly-wired server.
