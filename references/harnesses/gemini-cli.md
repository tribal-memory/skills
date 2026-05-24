# Gemini CLI

Primary documentation: [github.com/google-gemini/gemini-cli/blob/main/docs/tools/mcp-server.md](https://github.com/google-gemini/gemini-cli/blob/main/docs/tools/mcp-server.md). This reference is a cached snapshot; consult the primary documentation as supplementary context when wiring or troubleshooting.

## Wire-up command (preferred)

For HTTP (Streamable HTTP):

```bash
gemini mcp add --transport http tribal http://127.0.0.1:8725/mcp \
  --header "Authorization: Bearer <token>"
```

For stdio:

```bash
gemini mcp add tribal -- tribal --config <config-path> serve --project <project-id>
```

The canonical stdio command and args come from `tribal mcp-config --json`.

## Manual config (file edit)

JSON at `~/.gemini/settings.json` (user scope) or `.gemini/settings.json` (project scope). Per-server entry under `mcpServers`:

```json
{
  "mcpServers": {
    "tribal": {
      "httpUrl": "http://127.0.0.1:8725/mcp",
      "headers": { "Authorization": "Bearer ${TRIBAL_AUTH_TOKEN}" }
    }
  }
}
```

For stdio: `command`, `args`, `env`. For SSE specifically, use `url` instead of `httpUrl`.

## Translating from `tribal mcp-config --json`

The canonical `url` field maps to Gemini's `httpUrl` (not `url`) for Streamable HTTP. The `headers` block carries through directly.

```bash
tribal mcp-config --json | jq '{httpUrl: .url, headers: .headers}'
```

Produces the per-server entry the agent merges under the existing `mcpServers` key.

## Verification

```bash
gemini mcp list
```

Inside a Gemini CLI session, `/mcp` lists active servers.

## Quirks

- Gemini CLI strips env vars matching `*TOKEN*`, `*SECRET*`, `*PASSWORD*`, `*KEY*`, `*AUTH*`, `*CREDENTIAL*` from the base environment by default. To pass any such var to a Tribal stdio subprocess, name it explicitly in the `env` block.
- Server names cannot contain underscores. Use `tribal`, not `tribal_mcp`.
- Env-var expansion in the `env` block uses `$VAR` syntax.
- If `tribal check --providers` flags an env-var auth issue, the harness was launched before the variable came into scope: ask the user to quit, set the variable, and relaunch. Let the check failure be the signal; do not probe the environment directly.
