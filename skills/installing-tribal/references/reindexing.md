# Changing the embedding model (reindex)

Changing the embedding model, dimension, provider, or endpoint is a **reindex**: a full re-embed of the corpus, because vectors from different models live in incompatible spaces and cannot be compared. It is the one correct way to make that change. The `init.embedding` block in config is only a genesis seed; the server provisions the live embedding profile from it the first time it starts, and editing the seed afterwards does nothing.

This applies whether the change is a deliberate upgrade (a better embedding model) or a correction (the wrong model was chosen during setup, before the server first started).

## The commands

```bash
tribal reindex run --provider <provider> --model <model>            # --dimensions and --base-url optional
tribal reindex run --provider <provider> --model <model> --dry-run  # estimate the work first
tribal reindex cancel
tribal reindex prune
```

Run `tribal reindex --help` for the exact flags, and read the command's own output.

## Estimate the work before committing

`--dry-run` resolves the target and reports **how many items and tags would be re-embedded**. It does not return a price; it returns the counts, which you multiply by your provider's per-input rate to estimate spend (a local model has no per-call charge, but the counts still tell you the size and rough duration of the job). It creates no run, so it is safe to run freely.

## The lifecycle (the load-bearing part)

`tribal reindex run` does not embed anything itself. It **enqueues** a run; the database records it, and a live `tribal serve` worker drives it to completion. Because the database is the source of truth, a run survives a restart and resumes safely.

The consequence: a reindex only progresses while a server worker is alive to drive it. On a stdio install the only worker is the one the harness spawns for the session, so a large reindex may not finish before the session ends. For any real reindex, run a dedicated `tribal serve` and let it complete independent of any agent session. Tribal is built around a single serving process; running more than one server against the database still de-duplicates the work, but a single always-on server is the simple, intended shape.

## While it runs

A reindex is single-flight (one at a time). Reads and writes keep working against the existing embedding profile throughout, and the switch to the new profile is atomic when the rebuild finishes. There is no separate status command: observe progress with `tribal check`, which reports a live run and shows the active profile flipping to the new model on completion. (The ingest job-status tool covers ingest jobs only, not reindex runs.)

## Authorisation

Over HTTP or SSE, the reindex operations need a token minted with the `tribal.embedding:execute` scope (`tribal token create --scope tribal.embedding:execute`); an ordinary read-write token cannot reindex, and the reindex tools are not visible to it. Over stdio the local principal already holds the scope, and the CLI on the host always can, because it talks to the database directly.

## Cleaning up

`tribal reindex prune` reclaims storage from superseded profiles once they are no longer needed. Like every Tribal operation, it has no undo.

## Endpoint gotcha

For an OpenAI-style endpoint, `--base-url` must be path-less (`https://api.openai.com`, not `https://api.openai.com/v1`), and it must match the form the active profile uses, or the credential will not resolve and embedding fails closed.

## When a reindex will not progress or fails

See [`failure-modes.md`](failure-modes.md) for the reindex failure modes: a run that stays queued because no server worker is driving it, a missing or path-mismatched credential, and a run that fails mid-rebuild.
