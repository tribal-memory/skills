# Gemini CLI

Primary documentation: [github.com/google-gemini/gemini-cli/blob/main/docs/tools/mcp-server.md](https://github.com/google-gemini/gemini-cli/blob/main/docs/tools/mcp-server.md). This reference is a cached snapshot; consult the primary documentation as supplementary context when wiring or troubleshooting.

## Wire-up command (preferred)

For HTTP (Streamable HTTP), embed a static bearer token; `--static-token` populates the header:

```bash
snippet=$(tribal mcp-config --static-token)
gemini mcp add --transport http tribal \
  "$(echo "$snippet" | jq -r '.url')" \
  --header "Authorization: $(echo "$snippet" | jq -r '.headers.Authorization')"
```

Caching the snippet means both `jq` reads operate on it rather than invoking the binary twice.

For stdio:

```bash
gemini mcp add tribal -- tribal --config <config-path> serve --project <project-id>
```

The canonical stdio command and args come from `tribal mcp-config`.

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

The `headers` line carries the static bearer; `${TRIBAL_AUTH_TOKEN}` reads the token from the environment, so the user must export it (retrieve it with `tribal mcp-config --static-token`). For stdio: `command`, `args`, `env`. For SSE specifically, use `url` instead of `httpUrl`.

## Translating from `tribal mcp-config`

The canonical `url` field maps to Gemini's `httpUrl` (not `url`) for Streamable HTTP; the `headers` block carries through directly.

```bash
tribal mcp-config --static-token | jq '{httpUrl: .url, headers: .headers}'
```

Produces the per-server entry the agent merges under the existing `mcpServers` key.

## Verification

```bash
gemini mcp list
```

Inside a Gemini CLI session, `/mcp` lists active servers. Gemini CLI has no in-session MCP reload, so restart the session after wiring to pick up a newly-added server.

## Quirks

- Gemini CLI strips env vars matching `*TOKEN*`, `*SECRET*`, `*PASSWORD*`, `*KEY*`, `*AUTH*`, `*CREDENTIAL*` from the base environment by default. To pass any such var to a Tribal stdio subprocess, name it explicitly in the `env` block.
- Server names cannot contain underscores. Use `tribal`, not `tribal_mcp`.
- Env-var expansion uses `$VAR` or `${VAR}` syntax, in the `env` block and `headers`.
- If Tribal's MCP tools fail to authenticate from within Gemini CLI, it was launched before the bearer-token env var was set: ask the user to quit, set it, and relaunch. The variable must be present at launch. Do not probe the environment directly.
