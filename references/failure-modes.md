<!-- PLACEHOLDER (CHECKPOINT 1 scaffold): authored at CHECKPOINT 6.

The runtime/operational failures that `tribal check` does NOT classify, plus
disambiguation patterns for symptoms that look like Tribal-down but aren't.

Sections:

  1. "Tribal looks down" but it isn't.
     ALWAYS check this first if MCP calls suddenly stop working:
       - VPN: corporate VPN can block the path to the database (especially
         cloud Postgres). Symptom: MCP calls time out or return errors that
         look like Tribal is broken; in fact the binary is fine, the DB is
         unreachable. Run `tribal check`; if `database_reachable` fails,
         the issue is the network, not Tribal. Toggle the VPN or check
         its route table.
       - Network blip / DNS flake: same family. `tribal check` surfaces it.

  2. Non-check-classified failures (small set; described as PATTERNS, not
     enumerated against the binary's internal AppError variants — those
     are a drift surface):
       - git remote detection failure during bootstrap (manual --remote
         workaround).
       - prompt I/O / loading / watcher failures (use embedded prompts as
         fallback).
       - worker death at runtime (restart Tribal; the worker is the async
         pipeline; ingest jobs may need re-submission).
       - shutdown deadline exceeded (previous process is stuck; force-kill
         then restart).
       - transport-level errors (restart, or switch transport).

  3. Known footguns reported by real users (curated):
       - VPN/DB confusion (above) — most common in practice.
       - (placeholder for future entries surfaced by real-world use.)

Target: ~90 lines.

Note: stdio pool contention was historically a failure mode but is now fixed
in the binary; deliberately omitted.
-->
