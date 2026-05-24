# Codex

Primary documentation: [developers.openai.com/codex/mcp](https://developers.openai.com/codex/mcp) and [developers.openai.com/codex/cli/reference](https://developers.openai.com/codex/cli/reference). This reference is a cached snapshot; consult the primary documentation as supplementary context when wiring or troubleshooting.

## Wire-up command (preferred)

For HTTP (Streamable HTTP):

```bash
codex mcp add tribal --url http://127.0.0.1:8725/mcp \
  --bearer-token-env-var TRIBAL_AUTH_TOKEN
```

For stdio, pass the full Tribal invocation (command + args) after `--`. The canonical command and args come from `tribal mcp-config --json`:

```bash
# Inspect what the stdio invocation should look like
tribal mcp-config --json
# Example output (paths and IDs vary):
# {
#   "type": "stdio",
#   "command": "tribal",
#   "args": ["--config", "<config-path>", "serve", "--project", "<project-id>"]
# }

# Then pass that command and args to codex:
codex mcp add tribal -- tribal --config <config-path> serve --project <project-id>
```

Stdio does not need a bearer token. The MCP server runs as a subprocess of the harness, authenticated implicitly.

## Manual config (file edit)

TOML at `~/.codex/config.toml` (user scope) or `.codex/config.toml` (project scope). Each server lives under `[mcp_servers.<name>]`. For HTTP:

```toml
[mcp_servers.tribal]
url = "http://127.0.0.1:8725/mcp"
bearer_token_env_var = "TRIBAL_AUTH_TOKEN"
```

For stdio, replace `url` and `bearer_token_env_var` with:

```toml
[mcp_servers.tribal]
command = "tribal"
args = ["--config", "<config-path>", "serve", "--project", "<project-id>"]
```

`env_vars` (list of env-var names) is supported for stdio entries that need values passed through to the subprocess.

Editing this file requires consent per [`consent.md`](../consent.md).

## Translating from `tribal mcp-config --json`

Codex uses TOML; the canonical JSON does not pipe directly. Extract the fields the agent needs:

```bash
# HTTP URL
tribal mcp-config --json | jq -r '.url'

# Stdio command and args
tribal mcp-config --json | jq -r '.command, (.args | tojson)'
```

Then construct the TOML block. For HTTP, set `bearer_token_env_var = "TRIBAL_AUTH_TOKEN"` (or whichever env var the user has exported the bearer token to). Codex builds the `Authorization: Bearer <token>` header at runtime from the named env var.

## Verification

```bash
codex mcp list
codex mcp list --json
codex mcp get tribal
```

Inside a Codex TUI session, `/mcp` lists active servers.

## Quirks

- `bearer_token_env_var` stores the *name* of the env var, not the token itself. The variable must be in the shell's environment at the moment Codex launches. If Codex is already running without the variable in scope, ask the user to quit, export the variable, and relaunch.
- Top-level `mcp_oauth_callback_port` and `mcp_oauth_callback_url` keys override OAuth callback defaults; not relevant for Tribal's static bearer-token setup.
