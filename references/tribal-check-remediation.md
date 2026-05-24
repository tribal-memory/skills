# Consuming `tribal check --json`

`tribal check` is the binary's diagnostic surface. The `--json` flag emits a structured form the agent can parse and surface to the user. The remediation strings are owned by the binary; the agent's job is to relay them faithfully, not to rewrite them.

## JSON envelope

```json
{
  "ok": false,
  "checks": [
    {
      "status": "pass",
      "name": "config_parse",
      "detail": "config loaded from /etc/tribal/config.yaml"
    },
    {
      "status": "fail",
      "name": "database_reachable",
      "detail": "database unreachable: connection refused",
      "remediation": "run `pg_isready` against the configured database URL and verify the host, port, and credentials"
    }
  ]
}
```

- `ok` is `true` if no check has status `fail`. A `warn` does not flip `ok` to `false`.
- `status` values: `pass` (check succeeded), `warn` (non-blocking issue), `fail` (blocking issue), `skip` (the check could not run because a prerequisite check failed).
- `detail` describes the state observed, in plain prose.
- `remediation` is present only on `warn` and `fail`. Absent on `pass` and `skip`.

## Walkthrough pattern

Three steps, applied to every diagnostic request:

1. Run `tribal check --json` (add `--providers` if the user is preparing for their first ingest).
2. For each check with status `warn` or `fail`, surface the `remediation` field to the user verbatim. Do not paraphrase. Do not invent steps. Do not summarise.
3. After the user applies a fix, re-run `tribal check --json` and confirm the previously-failed check now reports `pass`.

## Iteration

Apply step 3 once per failed check. The check ordering is intentional: earlier failures often cause later checks to skip, so re-running after a fix can unblock additional checks that then fail with their own remediation. Continue iterating until `ok` becomes `true` or the user opts out.

## When `ok` is `true` but something still looks wrong

A `tribal check ok: true` means the configuration surface Tribal can introspect is healthy. If the user still reports problems after that, the issue is most likely runtime or network-level rather than a configuration fault. Consult `references/failure-modes.md` for the non-check patterns, with particular attention to the VPN and connectivity entries.
