# Non-check failure modes

`tribal check` covers the configurable surface. Everything else lives here: the disambiguation when something looks broken, and the failure shapes the binary cannot introspect.

## "Tribal looks down": check the network first

Always start with `tribal check`. The output decides what is broken.

**If the database-reachability check fails**, the issue is the network path to Postgres, not Tribal. The most common cause is a corporate VPN blocking the route to a managed Postgres provider (Neon, Supabase, AWS RDS, similar). DNS flakes and intermittent network blips fall in the same family. Toggle the VPN or check the route table for that host, then re-run `tribal check`.

**If every check passes but MCP tool calls are still failing**, the issue lives outside the surface Tribal can introspect. See the sections below.

## Restarting Tribal

Several patterns below recommend "restart Tribal". The mechanism depends on the transport.

- **Stdio.** The harness owns the Tribal subprocess. Restarting the harness session restarts Tribal automatically as part of the new session's set-up.
- **HTTP and SSE.** The Tribal process is owned by the user, in a separate terminal pane, a backgrounded subprocess, a service manager, or a Docker container. The agent cannot reach across to kill or start it. Surface the situation to the user and let them restart Tribal in its own context.

After any restart, Tribal's reclaim sweep picks up jobs stuck mid-pipeline and continues processing them.

## Failures `tribal check` does not classify

### Git remote detection failure during bootstrap

If Tribal cannot determine the project's origin from the current working directory, bootstrap surfaces an error naming that condition. Pass `--remote <url>` to bootstrap explicitly to override the detection. See [`bootstrap-output.md`](./bootstrap-output.md) for the canonical bootstrap shape.

### Stuck or failed ingest jobs

Tribal's ingest pipeline has retries and a dead-letter queue, and runs a reclaim sweep at startup. The job-status tool surfaces the current state.

- **Failed jobs** carry error context in the response. Surface it to the user. The most common cause is a provider configuration issue (provider unreachable, model misconfigured) that `tribal check --providers` would also flag.
- **Stuck jobs** show as not progressing across several status checks over a meaningful interval. Restart Tribal (see above); the reclaim sweep at the next startup picks up stuck rows.

Do not blindly re-submit ingests on failure. The retry path and reclaim sweep handle the recovery; manual re-submits create duplicates.

### Persistent transport errors

Repeated stdio crashes or HTTP/SSE connection drops after the binary self-reports `ok: true` indicate environmental issues outside Tribal's control. Restart Tribal first.

If the symptom persists across restarts, switching transport is worth trying as a diagnostic. Re-bootstrap with `tribal bootstrap --transport <stdio|http|sse>`. Note that re-bootstrap mints a fresh bearer token and re-emits the MCP config snippet; the user then needs to re-wire the harness with the new credentials, so the action is heavier than it looks.

### Manual `curl` probes to the MCP endpoint return 401 or 406

The MCP endpoint is not a plain REST URL, so a hand-rolled `curl` is a poor readiness probe. Unauthenticated, it returns `401`. Authenticated with the bearer token but sending an ordinary HTTP request, it returns `406`: the server is up and the token is accepted, but the request is not a valid MCP protocol exchange. Neither response means Tribal is broken, and a `406` in particular confirms the server is reachable and authenticating. Readiness is `tribal check --providers` passing plus a real MCP tool call from the wired harness, not a `2xx` from `curl`.

### Prompt loading failure

Tribal supports two modes for loading prompt templates. The default is **embedded**: prompts ship inside the binary and load from memory. The opt-in is **on-disk**, configured via the YAML config; Tribal then reads the prompts from a user-specified directory. `tribal config show` displays the resolved mode and path.

If the user has chosen on-disk and the loader fails (the directory is missing, the files are unreadable, the watcher fails), Tribal falls back to the embedded defaults silently. The symptom is that the user's custom prompts stop taking effect, not a hard error. The agent cannot detect this from a tool call. If a user reports it, run `tribal config show` to confirm the mode and path, then verify the directory's contents and permissions with them.

## When nothing matches

If the failure fits no pattern above and `tribal check` reports `ok: true`, file a GitHub issue against the Tribal repository. Useful detail: the symptom and how to reproduce it, the transport, the install method (Homebrew, shell installer, Docker Compose), the OS and architecture, and `tribal --version` output.

## Known real-world footguns

This list is curated from actual user reports, not speculation.

- **VPN blocking the managed-Postgres path** (covered above).
