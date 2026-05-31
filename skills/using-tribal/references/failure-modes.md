# Non-check failure modes

`tribal check` covers the configurable surface. Everything else lives here: the disambiguation when something looks broken, and the failure shapes the binary cannot introspect.

## "Tribal looks down": check the network first

Always start with `tribal check`. The output decides what is broken.

**If the database-reachability check fails**, the issue is the network path to Postgres, not Tribal. The most common cause is a corporate VPN blocking the route to a managed Postgres provider (Neon, Supabase, AWS RDS, similar). DNS flakes and intermittent network blips fall in the same family. Toggle the VPN or check the route table for that host, then re-run `tribal check`.

**If the database-reachability check fails and the network path is fine**, a managed Postgres provider may have suspended or throttled the database on an exhausted usage allowance (compute hours, storage, a connection cap). The symptom is identical to a blocked route: Tribal is healthy, the database is simply unreachable. Check the provider's dashboard for a suspended or over-quota state before assuming a routing problem.

**If every check passes but MCP tool calls are still failing**, the issue lives outside the surface Tribal can introspect. See the sections below.

## The graph looks empty or sparse

Tribal is reachable and every check passes, but `discover` returns little or nothing, or returns knowledge that belongs to a different project. The connection is fine; the target is wrong. Two causes account for almost every instance.

**Tribal is pointed at a different database than you expect.** A higher-precedence channel can override the config file's `database.url` and silently point Tribal at a different database: a leftover `TRIBAL_DATABASE__URL` in the environment, or a stale `--database-url` in a wrapper script. A fresh or unrelated database then reads as an empty graph. Confirm the target with `tribal config show` (the database URL itself is redacted, but the rest of the resolved configuration is visible) and `tribal project list` (does it list the projects you expect to see?); if the project list is wrong, the URL channel is wrong. The full precedence order is covered where the database URL is configured during setup.

**The repository's remote changed.** A project is resolved by matching the repository's git remote against the value stored at registration. Renaming, moving, or transferring a repository (for example into an organisation) changes that remote, so resolution no longer matches the existing project and Tribal behaves as though the project is brand new. The knowledge is not lost: it stays keyed to the old remote in the same database. Reconciling the stored remote to the new one is a database-administration task outside Tribal's surface; the binary has no rename or re-key command. Until it is reconciled, reach the existing project by pinning its id rather than relying on automatic resolution: the served MCP config carries it as `serve --project <id>`, and the knowledge tools accept a `project_id` override. `tribal project list` shows the id still keyed to the old remote.

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

### The wired server fails to start after the database or project changed

The harness stores the MCP server invocation produced at wiring time, project id included (`serve --project <id>`). A stdio server reads that invocation when the harness spawns it; an HTTP or SSE server is launched with it. If the targeted database or the resolved project id has since changed (a re-point to a different database, a project re-registered under a fresh id), the stored id no longer exists in the current database and the server refuses to start. Over MCP this tends to surface as a connection-level failure rather than a clean message (for example a `-32000`), which can read as Tribal being down when the cause is a stale wired id.

Regenerate the invocation with `tribal mcp-config` (it reflects the currently-resolved project), re-wire the harness with the new snippet, then reload or restart so the harness respawns the server against it. A running stdio server does not pick up a config change on its own: reloading skills or plugins is not enough, because the server captured its arguments at spawn time. Whether the harness reloads in-session or needs a session restart is harness-specific; the installation flow covers the step for each.

### Persistent transport errors

Repeated stdio crashes or HTTP/SSE connection drops after the binary self-reports `ok: true` indicate environmental issues outside Tribal's control. Restart Tribal first.

If the symptom persists across restarts, switching transport is worth trying as a diagnostic. Re-bootstrap with `tribal bootstrap --transport <stdio|http|sse>`. Note that re-bootstrap mints a fresh bearer token and re-emits the MCP config snippet; the user then needs to re-wire the harness with the new credentials, so the action is heavier than it looks.

### Manual `curl` probes to the MCP endpoint return 401 or 406

The MCP endpoint is not a plain REST URL, so a hand-rolled `curl` is a poor readiness probe. Unauthenticated, it returns `401`. Authenticated with the bearer token but sending an ordinary HTTP request, it returns `406`: the server is up and the token is accepted, but the request is not a valid MCP protocol exchange. Neither response means Tribal is broken, and a `406` in particular confirms the server is reachable and authenticating. Readiness is `tribal check --providers` passing plus a real MCP tool call from the wired harness, not a `2xx` from `curl`.

### Sandboxed harness: `docker` or PATH permission errors

Some harnesses run shell commands in a sandbox (Codex, for example). Under one, a `docker` command can fail to reach the daemon (`permission denied while trying to connect to the Docker daemon socket`), and an installer can warn that it `could not update PATH: Operation not permitted`. These come from the harness's sandbox, not from Tribal: approve the escalation the harness offers, or run the affected command in an unsandboxed context. Neither is a sign of a broken install.

### Prompt loading failure

Tribal supports two modes for loading prompt templates. The default is **embedded**: prompts ship inside the binary and load from memory. The opt-in is **on-disk**, configured via the YAML config; Tribal then reads the prompts from a user-specified directory. `tribal config show` displays the resolved mode and path.

If the user has chosen on-disk and the loader fails (the directory is missing, the files are unreadable, the watcher fails), Tribal falls back to the embedded defaults silently. The symptom is that the user's custom prompts stop taking effect, not a hard error. The agent cannot detect this from a tool call. If a user reports it, run `tribal config show` to confirm the mode and path, then verify the directory's contents and permissions with them.

## When nothing matches

If the failure fits no pattern above and `tribal check` reports `ok: true`, file a GitHub issue against the Tribal repository. Useful detail: the symptom and how to reproduce it, the transport, the install method (Homebrew, shell installer, Docker Compose), the OS and architecture, and `tribal --version` output.

## Known real-world footguns

This list is curated from actual user reports, not speculation.

- **VPN blocking the managed-Postgres path** (covered above).
- **Managed-Postgres usage suspension** stopping the database on an exhausted allowance (covered above).
- **A wrong or stale `database.url`** silently targeting a different database, so the graph reads as empty (covered above).
- **A repository rename or transfer** breaking project resolution until the stored remote is reconciled (covered above).
