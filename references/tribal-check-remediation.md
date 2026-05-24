# Consuming `tribal check --json`

`tribal check` is the binary's diagnostic surface. The `--json` flag emits a structured form the agent can parse and act on.

## What the JSON contains

A top-level object with two fields:

- `ok`: boolean. `true` if no check has status `fail`. A `warn` does not flip `ok` to `false`.
- `checks`: array of check results. Each result has:
  - `status`: one of `pass`, `warn`, `fail`, `skip`. (`skip` means a prerequisite check failed, so this one could not run.)
  - `name`: a short check identifier in snake_case.
  - `detail`: the state observed, in plain prose.
  - `remediation`: present only on `warn` and `fail`. Absent on `pass` and `skip`. The exact next step to resolve the issue, in plain prose.

Run `tribal check --json` to see the current set of checks and their statuses; the shape above is stable across releases.

## Walkthrough pattern

For each diagnostic request:

1. Run `tribal check --json`. Add `--providers` if the user is preparing for their first ingest.
2. For each check with status `warn` or `fail`, read the `remediation`. Then:
   - **If the remediation is programmatic and does not touch sensitive state** (running a script, restarting a service, installing a missing package, creating a database, applying a migration), perform it autonomously. Tell the user what you did after the fact.
   - **If the remediation touches sensitive state** (adding API keys to the environment, editing shell rc files, writing credentials), surface the remediation verbatim and let the user proceed. Do not paraphrase. Do not invent steps. Do not summarise.
3. After applying or relaying a fix, re-run `tribal check --json` and confirm the previously-failed check now reports `pass`.

The principle: take the work off the user's hands wherever the action is safe to automate; hand off only when secrets or persistent state are in play.

## Iteration

Apply step 3 once per failed check. The check ordering is intentional: earlier failures often cause later checks to skip, so re-running after a fix can unblock additional checks that then fail with their own remediation. Continue iterating until `ok` becomes `true` or the user opts out.

## When `ok` is `true` but something still looks wrong

A `tribal check ok: true` means the configuration surface Tribal can introspect is healthy. If the user still reports problems after that, the issue is most likely runtime or network-level rather than a configuration fault.
