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

<!-- PLACEHOLDER (CHECKPOINT 5 — section-by-section authoring in progress).

Remaining sections (per plan):
  3. Step 1 — Install the binary (Homebrew, curl|sh, Docker Compose) with trade-offs.
  4. Step 2 — Run `tribal bootstrap`, including HTTP/SSE process management.
  5. Step 3 — Run `tribal check`; pointer to [references/tribal-check-remediation.md](../../references/tribal-check-remediation.md).
  6. Step 4 — Wire Tribal into your harness's MCP config (canonical shape +
     pointer to [references/harnesses/<harness>.md](../../references/harnesses/)).
  7. Step 5 — (Optional) `tribal check --providers`.
  8. What can go wrong here (install-only failures).
  9. You're done — handoff to `using-tribal`.

Cap: ≤500 lines. Target: ~400.
-->
