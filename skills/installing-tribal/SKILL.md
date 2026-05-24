---
name: installing-tribal
description: Proactively use this skill when the user mentions installing, setting up, wiring, or configuring Tribal (a memory store for tacit engineering knowledge — the why, ways of working, breakthroughs). Also activates when `tribal check` reports failures the user wants to resolve, when switching transports, when re-wiring after a harness change, or when the user asks how to get started with Tribal. Walks through binary install, `tribal bootstrap`, `tribal check`, and MCP config wire-up.
license: CC-BY-4.0
user-invocable: true
allowed-tools: Bash
---

# Installing Tribal

## Configuring Tribal

This skill walks through the four steps that configure Tribal: install the binary, run `tribal bootstrap`, run `tribal check`, and wire the MCP config into your harness. An optional fifth step extends the check suite with provider readiness probes before the user's first ingest. Follow the steps in order.

If `using-tribal` should activate after configuration is complete, this skill hands off at the end.

## Before you start

**IMPORTANT:** Load [`references/consent.md`](../../references/consent.md) before doing anything else. It is the ask-first protocol for credential-bearing files. This skill touches several of those during wire-up, and skipping the protocol risks reading or writing user secrets without consent.

Also load [`references/platforms.md`](../../references/platforms.md). It carries the detection one-liner (`uname -sm`) and the single source for what varies across macOS Intel, macOS Apple Silicon, and Linux. The steps below assume the active platform is known.

## Step 1: Install the binary

Three install paths. They produce different process lifecycles for Tribal.

### Homebrew (macOS)

```bash
brew install samfolo/homebrew-tap/tribal
```

Installs a `tribal` binary on PATH. Homebrew resolves the architecture. The harness can spawn the binary per session, or run it as a long-running server (Step 2).

### Shell installer (macOS and Linux)

```bash
curl --proto '=https' --tlsv1.2 -LsSf \
  https://github.com/samfolo/tribal/releases/latest/download/tribal-installer.sh | sh
```

Targets macOS and Linux. Same end state as Homebrew: a single binary on PATH.

### Docker Compose (containerised)

```bash
git clone https://github.com/samfolo/tribal && cd tribal && docker compose up
```

Runs Tribal as a long-running server in a container. The harness wires to the container over the network. Requires HTTP transport (Step 2 explains why).

### Verify the install

For the direct install paths (Homebrew, shell installer), success is a version string from a fresh shell:

```bash
tribal --version
```

If the command is not found, the installer wrote a PATH update to the shell's rc file that the current session has not re-read. Resolution depends on the active shell; see [`references/platforms.md`](../../references/platforms.md).

For the Docker Compose path, success is the `tribal` service reporting `Up`:

```bash
docker compose ps
```

The binary lives inside the container; the host does not need it on PATH.

## Step 2: Run `tribal bootstrap`

`tribal bootstrap` composes setup, project registration, credential persistence, and MCP config emission into one run. Invoke it from inside the git repository the user wants Tribal to know about; bootstrap registers that repository as the project.

```bash
tribal bootstrap
```

The stderr output enumerates the next steps with concrete commands appropriate to the chosen transport, the install state, and whether credentials were written successfully. Treat it as the canonical run-book. The rest of this skill is the meta-frame around that output: what to configure before running bootstrap, what the trade-offs mean, and what to do when the output cannot anticipate the user's environment.

For scripted consumers, `--json` emits the same data as a structured object on stdout (no next-steps prose). The shape is documented in [`references/bootstrap-output.md`](../../references/bootstrap-output.md).

```bash
tribal bootstrap --json
```

### The database URL

Bootstrap needs a Postgres database with the `pgvector` extension. The connection URL has three resolution channels, in order of precedence: the `--database-url` flag, the `TRIBAL_DATABASE__URL` environment variable, and the `database.url` field in the resolved config file.

A local Postgres URL looks like `postgresql://user:pass@localhost:5432/tribal`. The Docker Compose path provides a local Postgres out of the box.

Managed Postgres providers (Neon, Supabase, AWS RDS, and similar) usually require an `sslmode=require` parameter and may need provider-specific additions. The Neon shape, for instance, is `postgresql://<user>:<password>@<host>.neon.tech/<database>?sslmode=require`. The provider's dashboard or documentation is the canonical source for the exact URL.

### Transport choice

The `--transport` flag picks the connection shape between the harness and the Tribal MCP server. Three values: `stdio`, `http`, `sse`. The choice has lifecycle consequences.

- **Stdio** is the default for direct binary installs. The harness spawns `tribal` as a subprocess per session and tears it down at session end. No long-lived process to manage.
- **HTTP** is required for the Docker Compose path (the harness on the host cannot reach into a container's stdio). It is also a valid choice for direct binary installs that want a persistent server reachable from multiple sessions.
- **SSE** behaves like HTTP for wire-up. Less commonly used.

```bash
tribal bootstrap --transport http
```

### HTTP and SSE: the server lifecycle is the user's

For HTTP or SSE transports, the wire-up assumes a `tribal serve` process is running and bound to the registered project ID. Bootstrap's stderr output gives the exact `tribal serve` invocation to run; it does not start the server itself.

How that process runs is for the user to decide. Options include a separate terminal window, a terminal pane (tmux, screen), a backgrounded subprocess, or a service manager (launchd, systemd). The user picks based on their environment.

For the Docker Compose path, the container already runs `tribal serve` as its entrypoint. Nothing additional to manage.

### Re-running bootstrap

Re-running `tribal bootstrap` against the same git repository is safe. It reuses the existing project, mints a fresh bearer token, and re-emits the MCP config. Useful when the user wants new credentials, a different transport, or a clean MCP config snippet.

## Step 3: Run `tribal check`

Bootstrap's stderr output directs the user to run `tribal check`. The check command is the canonical diagnostic: it surfaces every configurable failure with a `remediation` field that names the next action.

```bash
tribal check
```

For programmatic consumption, use `--json`. The shape and the walkthrough pattern (act on programmatic remediations, hand off on sensitive ones) live in [`references/tribal-check-remediation.md`](../../references/tribal-check-remediation.md).

```bash
tribal check --json
```

### When `tribal check` reports healthy but something is still wrong

`tribal check` covers the configurable surface. Network-level issues (VPN blocking the database path, firewall rules, DNS flakes) can mean Tribal reports healthy while the user cannot do real work. [`references/failure-modes.md`](../../references/failure-modes.md) covers this disambiguation.

## Step 4: Wire Tribal into your harness's MCP config

Bootstrap's stderr output gives the wire-up command directly for Claude Code (`claude mcp add-json tribal "$(tribal mcp-config)"`). For other harnesses, the same canonical `tribal mcp-config --json` output is the source of truth; the translation to each harness's native shape lives in [`references/harnesses/`](../../references/harnesses/).

```bash
tribal mcp-config --json
```

The shape (transport discriminator, stdio vs HTTP fields, where the bearer token lives) is documented in [`references/bootstrap-output.md`](../../references/bootstrap-output.md). The agent should run the command and inspect the live output rather than relying on a memorised shape.

### Per-harness translations

The container around the MCP entry varies per harness: the primary configuration file, its format, the key name, and the wrapper field shape all differ. The translation from Tribal's canonical shape to a given harness's native shape lives in [`references/harnesses/`](../../references/harnesses/). Each file there names the harness, its primary config-file path, the field shape it expects, a `jq` snippet that produces that shape from `tribal mcp-config --json`, and how to verify the harness has loaded the server.

To wire Tribal into a specific harness, read the corresponding file under that directory.

### When there is no reference file for the user's harness

The files in [`references/harnesses/`](../../references/harnesses/) cover the named target harnesses. For any harness without a dedicated file, the canonical `tribal mcp-config --json` output is still the source of truth. Read the harness's own MCP configuration documentation, identify the field shape it expects, and produce the translation with the user. If the wire-up works and the user is willing to contribute it back, the path is a pull request against `samfolo/tribal-skills`.

### Consent before writing

Wiring up the harness usually means editing the harness's primary configuration file (typically a JSON or TOML at a path under `~/.<harness>/`). Those files are covered by the consent protocol; the agent must ask the user before reading or writing them. See [`references/consent.md`](../../references/consent.md).

Where the harness exposes a CLI for adding MCP servers (a `<harness> mcp add` style command), prefer it. The CLI is the authorisation surface: it edits the config file as part of the user's authorised invocation, with no separate consent step needed. Direct file edits do require consent.

## Step 5: (Optional) Verify provider readiness

`tribal check --providers` extends the diagnostic suite with fatal probes against the embedding and inference providers. Running it is the gate for the user's first real ingest: bootstrap and the standard `tribal check` complete without touching providers, so a healthy install can still fail to do real work until the providers are configured.

```bash
tribal check --providers
```

Bootstrap's stderr output prompts this step as part of the numbered next steps. Run it once the user has configured their provider (a local Ollama with the required models pulled, or API keys for a cloud provider set in the environment).

The remediation pattern is the same as for the core check suite: programmatic remediations the agent performs autonomously, sensitive ones (API keys, environment variables) relayed to the user. See [`references/tribal-check-remediation.md`](../../references/tribal-check-remediation.md).

### Getting API keys to Tribal

If the user has configured a cloud provider, the API key must reach the `tribal` process. The simplest persistent path is to add the key directly to the Tribal config file at the path bootstrap printed (typically `~/.config/tribal/tribal.yaml`); `api_key` is a first-class field on each provider stage. The agent can inspect the current layout with `tribal config show` to identify the right field. Writing the file is a sensitive operation; the consent protocol in [`references/consent.md`](../../references/consent.md) applies, and the user may prefer to edit it themselves.

For one-time verification without persistence, prepending the key to the command works: `OPENAI_API_KEY=<key> tribal check --providers`. Other persistence paths (shell rc, `.env` files, MCP-config env blocks) are valid alternatives the agent can offer based on the user's preference; the YAML config is the recommended default.

## What can go wrong here

Install-time failures fall into a small set of patterns, almost all of them with structured guidance built into the binary or the reference files:

- **Bootstrap itself fails.** The standard error names the failure inline. Common cases: database unreachable, git remote undetectable (pass `--remote <url>`), credentials write failure (the token is shown inline for manual save).
- **`tribal --version` returns "command not found"** after install. The installer wrote to a PATH the current shell has not re-read. Covered in Step 1's verification subsection.
- **`tribal check` fails on first run.** Surface the `remediation` field per the pattern in [`references/tribal-check-remediation.md`](../../references/tribal-check-remediation.md).
- **Runtime or network-level issues** (worker death, transport errors, VPN blocking the database, prompt I/O). [`references/failure-modes.md`](../../references/failure-modes.md) covers the patterns.

When in doubt: bootstrap's standard error is the first source of truth; `tribal check` is the next; the failure-modes reference handles the long tail.

## You're done

Configuration is complete. The user's harness now has Tribal wired as an MCP server, and the providers (if configured) are verified.

For day-to-day use, capturing knowledge, querying it, traversing the graph, diagnosing issues — the `using-tribal` skill takes over. It activates whenever the user signals they want to save an insight, recall prior context, or approach a problem where Tribal might already have relevant knowledge.

## References

The skill body is the entry point; the files below carry the depth.

- [`references/consent.md`](../../references/consent.md) — **read first.** The ask-first protocol for credential-bearing files. Applies to every file write this skill might do.
- [`references/platforms.md`](../../references/platforms.md) — read early. Detection one-liner and what varies across macOS Intel, macOS Apple Silicon, and Linux.
- [`references/bootstrap-output.md`](../../references/bootstrap-output.md) — read when parsing `tribal bootstrap --json` or `tribal mcp-config --json` output.
- [`references/tribal-check-remediation.md`](../../references/tribal-check-remediation.md) — read when handling `tribal check` failures, including from `--providers`.
- [`references/harnesses/`](../../references/harnesses/) — read when wiring Tribal into a specific harness. Each file under the directory covers one harness.
- [`references/failure-modes.md`](../../references/failure-modes.md) — read when something fails outside the check suite: worker death, transport errors, VPN blocking the database, prompt I/O.
