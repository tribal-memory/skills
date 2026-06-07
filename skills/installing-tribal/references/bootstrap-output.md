# CLI JSON outputs for binary integration

Reference for the two structured outputs the agent consumes during install and wire-up: `tribal bootstrap --json` and `tribal mcp-config`. To see the current shape, run the command and inspect the output; the field reference below describes what each field contains semantically.

## `tribal bootstrap --json`

Emits a single JSON object describing everything bootstrap did. Run bootstrap once per repository; capture the output to drive scripted wire-ups and to extract credentials for further processing.

### Field reference

- `bearer_token`: an opaque secret string, persisted to the credentials file automatically. It is the bearer a static-token wire-up embeds; the loopback `mcp_config` snippet is URL-only and omits it, so this top-level field is the reliable place to read the token.
- `principal_key`: the principal the token is bound to. Defaults to `principal:local`.
- `principal_id`: a UUID prefixed with `prin_`.
- `project_id`: a UUID prefixed with `proj_`.
- `project_name`: a human-friendly name derived from the git remote path.
- `git_remote`: the remote URL used for project resolution, in `host/owner/repo` form.
- `transport`: the transport chosen at bootstrap time. One of `stdio`, `http`, `sse`.
- `mcp_config`: the embedded MCP config snippet. Identical to what `tribal mcp-config` would emit for the same transport and topology. Shape varies by transport (see next section).
- `config_path`: the absolute path to the resolved configuration file.

## `tribal mcp-config`

Emits only the MCP config snippet (the `mcp_config` sub-object of bootstrap). Use this for re-emitting the snippet without re-running bootstrap. The command always writes JSON to stdout; there is no `--json` flag.

The shape depends on the `type` discriminator:

- **stdio** carries `type`, `command`, `args`, and never a token: the harness spawns it per session and authenticates as `principal:local`. The project id is in `args` (`serve --project <id>`).
- **http** and **sse** carry `type` and `url`, plus an optional `headers` object. The loopback default (including Docker) is URL-only with no `headers`: the harness authenticates over OAuth on first connect. A `headers.Authorization` Bearer entry appears only when a token is embedded, via `--static-token`, an explicit `--token`, or a routable deployment. The network snippet never carries a project.

The stdio and network shapes are disjoint: no field is shared beyond `type`.

`--static-token` embeds the persisted bearer (the one bootstrap wrote to the credentials file), so it needs a prior successful bootstrap; `--token <value>` embeds a token you supply instead, and the two are mutually exclusive. `mcp-config` does not validate the configuration, so it still works after the cloud API key has left the shell.

## jq snippets

Extract the MCP snippet alone:

```bash
tribal bootstrap --json | jq '.mcp_config'
```

Extract the URL from an HTTP/SSE snippet:

```bash
tribal mcp-config | jq -r '.url'
```

The bearer token lives at `.bearer_token` (bootstrap) or `.headers.Authorization` (an `mcp-config --static-token` snippet), but both are secrets: feed them into the wire-up by command substitution rather than printing them to the transcript. The `tribal mcp-config --static-token` form is the cleanest way to embed the token, since it never passes through a bare print.
