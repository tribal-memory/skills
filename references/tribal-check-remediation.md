<!-- PLACEHOLDER (CHECKPOINT 1 scaffold): authored at CHECKPOINT 4.

Leaner than originally planned (per CHECKPOINT 1 feedback): the binary owns
the remediation copy. The file does NOT enumerate check names or per-check
remediation — that's a drift surface AND a duplication of work the binary
already does.

The file covers:

  1. The JSON envelope shape — locked by snapshot tests in the parent repo,
     so safe to document. Top-level `ok: bool`, `checks: [{status, name,
     detail, remediation?}]`. Status values: pass / warn / fail / skip.
     `remediation` is present only for warn and fail.

  2. The walkthrough pattern — explicit, three steps:
       (a) Run `tribal check --json`. If `ok: true`, the user is ready.
       (b) For each check with status `warn` or `fail`, surface the
           `remediation` field to the user VERBATIM. Do not paraphrase. Do
           not invent steps. Do not summarise.
       (c) After the user applies the fix, re-run `tribal check --json` and
           verify the previously-failed check is now `pass`.

  3. Disambiguation: a `fail` from `tribal check` is a CONFIG issue Tribal
     can detect. If the user reports a problem and `tribal check` reports
     `ok: true`, the problem is likely runtime or network-level (see
     references/failure-modes.md, which covers VPN, transport errors,
     worker death, etc.).

Target: ~60 lines (down from ~100 — no per-check section).
-->
