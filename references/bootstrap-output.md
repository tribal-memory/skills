# CLI JSON outputs for binary integration

Reference for the two structured outputs the agent consumes during install and wire-up: `tribal bootstrap --json` and `tribal mcp-config --json`. Both shapes are snapshot-locked in the parent repository's test suite; any change to the schema breaks the snapshot and is caught in CI.

## `tribal bootstrap --json`

Emits a single JSON object describing everything bootstrap did. Use this output to drive scripted wire-ups and to extract per-component credentials for further processing.

### Shape

```json
{
  "bearer_token": "tk_...",
  "principal_key": "principal:local",
  "principal_id": "prin_00000000-0000-0000-0000-000000000001",
  "project_id": "proj_00000000-0000-0000-0000-000000000002",
  "project_name": "widgets",
  "git_remote": "github.com/acme/widgets",
  "transport": "stdio",
  "mcp_config": { },
  "config_path": "/etc/tribal/tribal.yaml"
}
```

### Field reference

- `bearer_token`: the freshly-minted bearer used in HTTP and SSE transports. Persisted to `credentials.json` automatically.
- `principal_key`: the principal the token is bound to. Defaults to `principal:local`.
- `principal_id`: the persisted UUID for the principal record.
- `project_id`: the UUID of the registered project.
- `project_name`: a human-friendly name derived from the git remote path.
- `git_remote`: the remote URL used for project resolution, in `host/owner/repo` form.
- `transport`: the transport chosen at bootstrap time. One of `stdio`, `http`, `sse`.
- `mcp_config`: the embedded MCP config snippet. Identical to what `tribal mcp-config --json` would emit for the same transport. See the next section for its shape.
- `config_path`: the absolute path to the resolved configuration file.

## `tribal mcp-config --json`

Emits only the MCP config snippet (the `mcp_config` sub-object of bootstrap). Use this for re-emitting the snippet without re-running bootstrap.

### Shape (stdio)

```json
{
  "type": "stdio",
  "command": "tribal",
  "args": ["--config", "/etc/tribal/tribal.yaml", "serve", "--project", "proj_..."]
}
```

### Shape (http or sse)

```json
{
  "type": "http",
  "url": "http://127.0.0.1:8725/mcp",
  "headers": { "Authorization": "Bearer tk_..." }
}
```

### Discriminator

The `type` field is the transport discriminator. For stdio, the shape carries `command` and `args` (the agent spawns this subprocess per session). For http and sse, the shape carries `url` and `headers` (the agent connects to a long-running server). The two shapes are disjoint; no field is shared beyond `type`.

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
tribal mcp-config --json | jq -r '.url'
```

Extract the Authorization header value:

```bash
tribal mcp-config --json | jq -r '.headers.Authorization'
```

The shape is stable across releases; downstream consumers can rely on field names and types.
