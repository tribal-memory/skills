---
name: installing-tribal
description: Proactively use this skill when the user mentions installing, setting up, wiring, or configuring Tribal (a memory store for tacit engineering knowledge, the why, ways of working, breakthroughs). Also activates when `tribal check` reports failures the user wants to resolve, when switching transports, when re-wiring after a harness change, or when the user asks how to get started with Tribal. Walks through binary install, `tribal bootstrap`, `tribal check`, and MCP config wire-up.
license: CC-BY-4.0
user-invocable: true
allowed-tools: Bash(tribal *), Bash(brew *), Bash(curl *), Bash(docker *), Bash(npx skills *), Bash(jq *), Bash(uname *), Bash(claude mcp *), Bash(codex mcp *), Bash(gemini mcp *), Bash(opencode mcp *), Read, Write
---

# Installing Tribal

## Configuring Tribal

This skill walks through the five steps that configure Tribal: install the binary, run `tribal bootstrap`, run `tribal check`, wire the MCP config into your harness, and verify provider readiness. The first ingest fails until that last step passes, so it is part of setup, not an optional extra. Follow the steps in order.

If `using-tribal` should activate after configuration is complete, this skill hands off at the end.

## Before you start

**IMPORTANT:** Load [`references/consent.md`](references/consent.md) before doing anything else. It is the ask-first protocol for credential-bearing files. This skill touches several of those during wire-up, and skipping the protocol risks reading or writing user secrets without consent.

Also load [`references/platforms.md`](references/platforms.md). It carries the detection one-liner (`uname -sm`) and the single source for what varies across macOS Intel, macOS Apple Silicon, and Linux. The steps below assume the active platform is known.

## Step 1: Install the binary

Three install paths, below. Which one fits is the user's call, because the consequences land on them: the binary (Homebrew on macOS, the shell installer on Linux) is the lightest to run, upgrade, and remove, but needs a Postgres they supply; Docker Compose bundles its own Postgres but leaves a long-running container, HTTP transport, and secrets in a `.env` to manage. The binary is the simpler default for most, but it is a trade-off to put to the user, not a choice to make for them, so confirm the path before installing.

### Homebrew (macOS)

```bash
brew install tribal-memory/homebrew-tap/tribal
```

Installs a `tribal` binary on PATH. Homebrew resolves the architecture. The harness can spawn the binary per session, or run it as a long-running server (Step 2).

### Shell installer (macOS and Linux)

```bash
curl --proto '=https' --tlsv1.2 -LsSf \
  https://github.com/tribal-memory/tribal/releases/latest/download/tribal-installer.sh | sh
```

Targets macOS and Linux. Same end state as Homebrew: a single binary on PATH.

### Docker Compose (containerised)

Runs Tribal as a long-running server in a container, alongside a bundled Postgres. The harness wires to the container over the network. Requires HTTP transport (Step 2 explains why).

The only file the user needs is `docker-compose.yml`; the entrypoint is baked into the published image. The image tag is pinned inside that file, so the compose file and the image must come from the same release. **Take the compose file from the latest release, into a fresh directory.**

**IMPORTANT:** reusing an existing local checkout is a trap. A stale checkout pins an old image tag in its compose file, so `docker compose up` silently runs that old version; that is why the steps fetch into a fresh directory. If a checkout is reused, bringing it to the latest release tag first (`git fetch --tags`, then check out that tag) avoids the stale pin.

One way to fetch the release compose into a fresh directory in the current working directory (not `$HOME` or an absolute path):

```bash
tag=$(curl -fsSL https://api.github.com/repos/tribal-memory/tribal/releases/latest | jq -r .tag_name)
mkdir tribal-docker && cd tribal-docker
curl -fsSL "https://raw.githubusercontent.com/tribal-memory/tribal/$tag/docker-compose.yml" -o docker-compose.yml
curl -fsSL "https://raw.githubusercontent.com/tribal-memory/tribal/$tag/.env.example" -o .env.example
# Cloud provider? Create .env from .env.example and set its key first (see below).
docker compose up
```

#### Configure `.env` before the first `docker compose up`

`docker compose` reads `.env`, not `.env.example`. The `.env` written here decides which providers Tribal calls, and there is no prompt for it later, so it must be right before the first `docker compose up`. This is the step most easily skipped, and skipping it is why a healthy-looking stack then fails its first ingest.

**IMPORTANT:** make the provider decision explicitly, in this order, before bringing the stack up:

1. **Decide: local Ollama, or a cloud provider?** With no `.env` (or the shipped defaults), every stage targets a local Ollama at `http://host.docker.internal:11434`. Ollama is **not** part of the compose stack: the default assumes one already running on the host with the required models pulled. If there is no host Ollama, the choice is a cloud provider, or the first ingest fails on an unreachable provider.
2. **Keep the `.env` out of git.** If the directory is inside a git repository, a `.env` is one `git add` away from being committed, so ignore it before it exists: run `git check-ignore .env`, and if it is not already ignored, add `.env` to a `.gitignore`. Editing `.gitignore` or `.env` is sensitive, so the consent protocol in [`references/consent.md`](references/consent.md) applies.
3. **Copy the template:** `cp .env.example .env`. Edit `.env`, never `.env.example`.
4. **For a cloud provider,** set the provider, model, and base URL for the embedding stage and all three inference stages, plus the API key. Changing a stage's provider without also setting its base URL misroutes that request to the local Ollama address. The shipped `.env.example` carries a ready-to-paste block; the channels and the model IDs that actually work are in [`references/providers.md`](references/providers.md).
5. **Only then** run `docker compose up`.

A cloud provider missing its key fails to boot the container, because Tribal validates provider config at startup. A cloud provider with an unsupported model boots but fails the first ingest, so confirm each model against [`references/providers.md`](references/providers.md) rather than uncommenting the example blind.

By default this path registers a generic placeholder project (`tribal-docker-local`, with a placeholder remote), so ingests attach to that rather than the repository the user cares about. To bind Tribal to the real repo, either set `TRIBAL_PROJECT_NAME` and `TRIBAL_PROJECT_REMOTE` in `.env` before the first `docker compose up`, or, after wiring, have the agent run `tribal project register --remote <repo-url>`.

### Verify the install

For the direct install paths (Homebrew, shell installer), success is a version string from a fresh shell:

```bash
tribal --version
```

If the command is not found, the installer wrote a PATH update to the shell's rc file that the current session has not re-read. Resolution depends on the active shell; see [`references/platforms.md`](references/platforms.md).

For the Docker Compose path, success is the `tribal` service reporting `Up`:

```bash
docker compose ps
```

The binary lives inside the container; the host does not need it on PATH.

If the `tribal` service is not `Up` while Postgres reports healthy, a likely cause is **host port 8725 already in use** by a previous Tribal stack or another process. Identify what holds it before retrying: a stale Tribal stack can be torn down with the user's agreement; anything else, flag rather than stop. Mapping a free host port is also an option, remembering that the port mapping and `TRIBAL_PUBLIC_MCP_URL` move together.

## Step 2: Run `tribal bootstrap`

`tribal bootstrap` composes setup, project registration, credential persistence, and MCP config emission into one run. Invoke it from inside the git repository the user wants Tribal to know about; bootstrap registers that repository as the project.

```bash
tribal bootstrap
```

The stderr output enumerates the next steps with concrete commands appropriate to the chosen transport, the install state, and whether credentials were written successfully. Treat it as the canonical run-book. The rest of this skill is the meta-frame around that output: what to configure before running bootstrap, what the trade-offs mean, and what to do when the output cannot anticipate the user's environment.

For scripted consumers, `--json` emits the same data as a structured object on stdout (no next-steps prose). The shape is documented in [`references/bootstrap-output.md`](references/bootstrap-output.md).

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

### Choosing providers and models

By default Tribal uses a local Ollama. To use a cloud provider, or a non-default local model, set the provider and model for the embedding stage and for each inference stage. `tribal bootstrap` accepts these as flags (`--embedding-provider`, `--embedding-model`, and `--inference-<stage>-provider` / `--inference-<stage>-model`); they can equally be set by environment variable or in the config file. The full set of channels, the per-install-path specifics (the Docker Compose path configures providers through `.env`, not the config file), and current model IDs live in [`references/providers.md`](references/providers.md).

### Re-running bootstrap

Re-running `tribal bootstrap` against the same git repository is safe. It reuses the existing project, mints a fresh bearer token, and re-emits the MCP config. Useful when the user wants new credentials, a different transport, or a clean MCP config snippet.

## Step 3: Run `tribal check`

Bootstrap's stderr output directs the user to run `tribal check`. The check command is the canonical diagnostic: it surfaces every configurable failure with a `remediation` field that names the next action.

```bash
tribal check
```

For programmatic consumption, use `--json`. The shape and the walkthrough pattern (act on programmatic remediations, hand off on sensitive ones) live in [`references/tribal-check-remediation.md`](references/tribal-check-remediation.md).

```bash
tribal check --json
```

### On the Docker Compose path

Run `tribal check` inside the container:

```bash
docker compose exec tribal tribal check
```

Without a project id in scope the check reports a `project_resolution` warning, which is harmless: the server serves the bootstrapped project regardless. To silence it (and scope ad-hoc container commands to the project), set `TRIBAL_PROJECT_ID` in `.env` to the bootstrapped project id and run `docker compose up -d` again; compose then passes it into the container for the healthcheck and every `docker compose exec`.

### When `tribal check` reports `ok: true` but something is still wrong

`tribal check` covers the configurable surface. Network-level issues (VPN blocking the database path, firewall rules, DNS flakes) can mean Tribal reports healthy while the user cannot do real work. [`references/failure-modes.md`](references/failure-modes.md) covers this disambiguation.

## Step 4: Wire Tribal into your harness's MCP config

Bootstrap's stderr output gives the wire-up command directly for Claude Code (`claude mcp add-json tribal "$(tribal mcp-config)"`). For other harnesses, the same canonical `tribal mcp-config` output is the source of truth; the translation to each harness's native shape lives in [`references/harnesses/`](references/harnesses/).

```bash
tribal mcp-config
```

The command always emits JSON to stdout (no `--json` flag); warnings, if any, go to stderr. The shape (transport discriminator, stdio vs HTTP fields, where the bearer token lives) is documented in [`references/bootstrap-output.md`](references/bootstrap-output.md). The agent should run the command and inspect the live output rather than relying on a memorised shape.

On the Docker Compose path, run it inside the container:

```bash
docker compose exec -T tribal tribal mcp-config
```

The HTTP snippet carries no project (the server binds it), so nothing has to be threaded in. Docker is a loopback deployment, so its snippet is URL-only over OAuth; the authentication section below covers the static-token alternative. See [`references/consent.md`](references/consent.md) for handling a token without printing it to the transcript.

**IMPORTANT:** the newly-wired server does not appear in the current session until the harness loads it; the Tribal MCP tools will be missing until then. Most harnesses need a session restart; some can reload in-session (Claude Code, via `/reload-plugins`). The per-harness reference notes which applies; tell the user as part of the handoff.

### HTTP and SSE: authentication

For HTTP or SSE, how the harness authenticates turns on the deployment topology. On a loopback deployment (the default, including Docker), `tribal mcp-config` emits a URL-only snippet: the server advertises an OAuth flow with Dynamic Client Registration, so any DCR-capable harness, well-known or custom, registers and obtains a token on first connect, with nothing to copy.

A harness that cannot perform that flow needs a static bearer: `tribal mcp-config --static-token` embeds the persisted token in the snippet's `Authorization` header (a routable deployment embeds it by default). The harness then presents it on every call, taking it either inline in the config or by the name of an environment variable read at launch (Codex's `bearer_token_env_var`).

**IMPORTANT (env-var style):** when a harness reads the token from a named environment variable, that variable must hold the token *and* be present in the shell at the moment the harness launches. Writing it to a shell rc file does not change an already-running shell or a running harness. The sequence is: set the variable, reload the shell (`source` the rc file, for example `source ~/.zshrc`; see [`references/platforms.md`](references/platforms.md) for the active shell), then restart the harness from that shell. The trap is silent: the config reads as correct, but calls fail to authenticate because the variable was empty when the harness started.

### Per-harness translations

The container around the MCP entry varies per harness: the primary configuration file, its format, the key name, and the wrapper field shape all differ. The translation from Tribal's canonical shape to a given harness's native shape lives in [`references/harnesses/`](references/harnesses/). Each file there names the harness, its primary config-file path, the field shape it expects, a `jq` snippet that produces that shape from `tribal mcp-config`, and how to verify the harness has loaded the server.

To wire Tribal into a specific harness, read the corresponding file under that directory.

### When there is no reference file for the user's harness

The files in [`references/harnesses/`](references/harnesses/) cover the named target harnesses. For any harness without a dedicated file, the canonical `tribal mcp-config` output is still the source of truth. Read the harness's own MCP configuration documentation, identify the field shape it expects, and produce the translation with the user. If the wire-up works and the user is willing to contribute it back, the path is a pull request against `tribal-memory/skills`.

### Scope: project by default

Most harnesses support per-project and per-user scope for MCP server entries. The recommended default is project scope: a config file at the repository root rather than in the user's home directory. This keeps each repository's Tribal project ID bound to its own MCP entry, so switching repositories switches Tribal projects automatically. User scope is a valid choice when the user wants Tribal available in repositories that have not been bootstrapped, or when they prefer a single global configuration. The per-harness reference files name the scope flags or file paths.

**IMPORTANT (entries that embed a static token):** an entry produced with `--static-token` (or on a routable deployment) carries the bearer in its config. At project scope that lands in a file commonly tracked in version control, so prefer a scope the harness keeps out of version control (user scope, or a local uncommitted file), or reference the token through an environment variable rather than inlining it. URL-only OAuth entries and stdio entries carry no token and are unaffected.

### Consent before writing

Wiring up the harness usually means editing the harness's primary configuration file (typically a JSON or TOML at a path under `~/.<harness>/`). Those files are covered by the consent protocol; the agent must ask the user before reading or writing them. See [`references/consent.md`](references/consent.md).

Where the harness exposes a CLI for adding MCP servers (a `<harness> mcp add` style command), prefer it. The CLI is the authorisation surface: it edits the config file as part of the user's authorised invocation, with no separate consent step needed. Direct file edits do require consent.

## Step 5: Verify provider readiness (the gate before first use)

`tribal check --providers` extends the diagnostic suite with fatal probes against the embedding and inference providers. Running it is the gate for the user's first real ingest: bootstrap and the standard `tribal check` complete without touching providers, so a healthy install can still fail to do real work until the providers are configured. An ingest attempted before this probe passes fails on the provider itself, which the standard check never contacted, so the natural order is to clear `--providers` before the first ingest.

```bash
tribal check --providers
```

Bootstrap's stderr output prompts this step as part of the numbered next steps. Run it once the user has configured their provider (a local Ollama with the required models pulled, or API keys for a cloud provider set in the environment).

The remediation pattern is the same as for the core check suite: programmatic remediations the agent performs autonomously, sensitive ones (API keys, environment variables) relayed to the user. See [`references/tribal-check-remediation.md`](references/tribal-check-remediation.md).

### Getting API keys to Tribal

If the user has configured a cloud provider, the API key must reach the `tribal` process. The channels, and which applies to each install path, are in [`references/providers.md`](references/providers.md): a directly-installed binary reads it from the config file, a stage-specific `TRIBAL_..._API_KEY`, or the standard `OPENAI_API_KEY` / `ANTHROPIC_API_KEY`; the Docker Compose path takes it from `.env`, since the config file inside the container does not drive provider routing. Writing a config or environment file is sensitive; the consent protocol in [`references/consent.md`](references/consent.md) applies.

For a one-time check without persistence, prepend the key: `OPENAI_API_KEY=<key> tribal check --providers`.

When the key is supplied through the environment rather than a file Tribal reads on every invocation, the process that consumes it must be (re)started after the value is set: a harness-spawned stdio server needs the harness relaunched; an HTTP server or the Docker stack needs that process restarted. The agent cannot reload another process's environment for itself. The signal that a restart is needed is `tribal check --providers` failing on a provider auth check, not a direct inspection of the environment.

## What can go wrong here

Install-time failures fall into a small set of patterns, almost all of them with structured guidance built into the binary or the reference files:

- **Bootstrap itself fails.** The standard error names the failure inline. Common cases: database unreachable, git remote undetectable (pass `--remote <url>`), credentials write failure (the token is shown inline for manual save).
- **`tribal --version` returns "command not found"** after install. The installer wrote to a PATH the current shell has not re-read. Covered in Step 1's verification subsection.
- **`tribal check` fails on first run.** Surface the `remediation` field per the pattern in [`references/tribal-check-remediation.md`](references/tribal-check-remediation.md).
- **Runtime or network-level issues** (worker death, transport errors, VPN blocking the database, prompt I/O). [`references/failure-modes.md`](references/failure-modes.md) covers the patterns.

When in doubt: bootstrap's standard error is the first source of truth; `tribal check` is the next; the failure-modes reference handles the long tail.

## You're done

Configuration is complete: the harness has Tribal wired as an MCP server, and `tribal check --providers` passes, so the providers are reachable for the first ingest. If `--providers` has not passed yet, setup is not finished; return to Step 5.

Remember the reload step from Step 4: the Tribal tools appear only after the harness reloads (or restarts). Make sure the user has done this before relying on Tribal.

For day-to-day use (capturing knowledge, querying it, traversing the graph, diagnosing issues), the `using-tribal` skill takes over. It activates whenever the user signals they want to save an insight, recall prior context, or approach a problem where Tribal might already have relevant knowledge.

## References

The skill body is the entry point; the files below carry the depth.

- [`references/consent.md`](references/consent.md): **read first.** The ask-first protocol for credential-bearing files. Applies to every file write this skill might do.
- [`references/platforms.md`](references/platforms.md): read early. Detection one-liner and what varies across macOS Intel, macOS Apple Silicon, and Linux.
- [`references/bootstrap-output.md`](references/bootstrap-output.md): read when parsing `tribal bootstrap --json` or `tribal mcp-config` output.
- [`references/providers.md`](references/providers.md): read when selecting or configuring embedding or inference providers and models, including cloud-provider setup and current model IDs.
- [`references/tribal-check-remediation.md`](references/tribal-check-remediation.md): read when handling `tribal check` failures, including from `--providers`.
- [`references/harnesses/`](references/harnesses/): read when wiring Tribal into a specific harness. Each file under the directory covers one harness.
- [`references/failure-modes.md`](references/failure-modes.md): read when something fails outside the check suite (worker death, transport errors, VPN blocking the database, prompt I/O).
