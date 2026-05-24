# Codex

Primary documentation: [developers.openai.com/codex/mcp](https://developers.openai.com/codex/mcp) and [developers.openai.com/codex/cli/reference](https://developers.openai.com/codex/cli/reference) (fetched 2026-05-24).

## Wire-up command (preferred)

For HTTP (Streamable HTTP):

```bash
codex mcp add tribal --url http://127.0.0.1:8725/mcp \
  --bearer-token-env-var TRIBAL_AUTH_TOKEN
```

For stdio:

```bash
codex mcp add tribal --env TRIBAL_KEY=value -- tribal serve
```

## Manual config (file edit)

TOML at `~/.codex/config.toml` (user scope) or `.codex/config.toml` (project scope). Each server lives under `[mcp_servers.<name>]`. For HTTP:

```toml
[mcp_servers.tribal]
url = "http://127.0.0.1:8725/mcp"
bearer_token_env_var = "TRIBAL_AUTH_TOKEN"
```

For stdio, replace `url` and `bearer_token_env_var` with `command` (string), `args` (list), and `env_vars` (list of env-var names to pass through).

Editing this file requires consent per [`consent.md`](../consent.md).

## Translating from `tribal mcp-config --json`

Codex uses TOML; the canonical JSON does not pipe directly. The agent extracts what it needs:

```bash
tribal mcp-config --json | jq -r '.url'
```

Then constructs the TOML manually, using `bearer_token_env_var = "TRIBAL_AUTH_TOKEN"` (or whichever env var the user has exported the bearer token to). Codex builds the `Authorization: Bearer <token>` header at runtime from the named env var.

## Verification

```bash
codex mcp list
codex mcp list --json
codex mcp get tribal
```

Inside a Codex TUI session, `/mcp` lists active servers.

## Quirks

- `bearer_token_env_var` stores the *name* of the env var, not the token itself. Export the token in the shell that launches Codex (e.g. `export TRIBAL_AUTH_TOKEN="..."`).
- Top-level `mcp_oauth_callback_port` and `mcp_oauth_callback_url` keys override OAuth callback defaults; not relevant unless the MCP server advertises OAuth.
