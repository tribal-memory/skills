# Codex

Primary documentation: [developers.openai.com/codex/mcp](https://developers.openai.com/codex/mcp) and [developers.openai.com/codex/cli/reference](https://developers.openai.com/codex/cli/reference). This reference is a cached snapshot; consult the primary documentation as supplementary context when wiring or troubleshooting.

## Wire-up command (preferred)

For HTTP (Streamable HTTP):

```bash
codex mcp add tribal \
  --url "$(tribal mcp-config | jq -r '.url')" \
  --bearer-token-env-var TRIBAL_AUTH_TOKEN
```

For stdio, pass the full Tribal invocation (command + args) after `--`. The canonical command and args come from `tribal mcp-config`:

```bash
# Inspect what the stdio invocation should look like
tribal mcp-config
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

## Translating from `tribal mcp-config`

Codex uses TOML; the canonical JSON does not pipe directly. Extract the fields the agent needs:

```bash
# HTTP URL
tribal mcp-config | jq -r '.url'

# Stdio command and args
tribal mcp-config | jq -r '.command, (.args | tojson)'
```

Then construct the TOML block. For HTTP, set `bearer_token_env_var = "TRIBAL_AUTH_TOKEN"` (or whichever env var the user has exported the bearer token to). Codex builds the `Authorization: Bearer <token>` header at runtime from the named env var.

## Verification

```bash
codex mcp list
codex mcp list --json
codex mcp get tribal
```

Inside a Codex TUI session, `/mcp` lists active servers. Codex has no in-session MCP reload, so restart the session after wiring to pick up a newly-added server.

## Quirks

- `bearer_token_env_var` stores the *name* of the env var, not the token itself. The variable must be in the shell's environment at the moment Codex launches. If `tribal check --providers` flags an env-var auth issue, the harness was launched before the variable came into scope: ask the user to quit, set the variable, and relaunch. Let the check failure be the signal; do not probe the environment directly.
- Top-level `mcp_oauth_callback_port` and `mcp_oauth_callback_url` keys override OAuth callback defaults; not relevant for Tribal's static bearer-token setup.
