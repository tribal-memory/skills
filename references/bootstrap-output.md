# CLI JSON outputs for binary integration

Reference for the two structured outputs the agent consumes during install and wire-up: `tribal bootstrap --json` and `tribal mcp-config --json`. Both shapes are stable across releases. To see the current shape, run the command and inspect the output; the field reference below describes what each field contains semantically.

## `tribal bootstrap --json`

Emits a single JSON object describing everything bootstrap did. Run bootstrap once per repository; capture the output to drive scripted wire-ups and to extract credentials for further processing.

### Field reference

- `bearer_token`: an opaque secret string. Persisted to the credentials file automatically; used as the bearer in HTTP and SSE transport headers.
- `principal_key`: the principal the token is bound to. Defaults to `principal:local`.
- `principal_id`: a UUID prefixed with `prin_`.
- `project_id`: a UUID prefixed with `proj_`.
- `project_name`: a human-friendly name derived from the git remote path.
- `git_remote`: the remote URL used for project resolution, in `host/owner/repo` form.
- `transport`: the transport chosen at bootstrap time. One of `stdio`, `http`, `sse`.
- `mcp_config`: the embedded MCP config snippet. Identical to what `tribal mcp-config --json` would emit for the same transport. Shape varies by transport (see next section).
- `config_path`: the absolute path to the resolved configuration file.

## `tribal mcp-config`

Emits only the MCP config snippet (the `mcp_config` sub-object of bootstrap). Use this for re-emitting the snippet without re-running bootstrap. The command always writes JSON to stdout; there is no `--json` flag.

The shape depends on the `type` discriminator:

- **stdio** carries `type`, `command`, `args`. The agent spawns this subprocess per session.
- **http** and **sse** carry `type`, `url`, `headers`. The agent connects to a long-running server; the bearer token appears in `headers.Authorization` as a Bearer credential.

The two shapes are disjoint: no field is shared beyond `type`.

## jq snippets

Extract the bearer token from a bootstrap run:

```bash
tribal bootstrap --json | jq -r '.bearer_token'
```

Extract the MCP snippet alone:

```bash
tribal bootstrap --json | jq '.mcp_config'
```

Extract the URL from an HTTP transport snippet:

```bash
tribal mcp-config | jq -r '.url'
```

Extract the Authorization header value:

```bash
tribal mcp-config | jq -r '.headers.Authorization'
```
