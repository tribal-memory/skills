---
name: installing-tribal
description: Proactively use this skill when the user mentions installing, setting up, wiring, or configuring Tribal (a memory store for tacit engineering knowledge — the why, ways of working, breakthroughs). Also activates when `tribal check` reports failures the user wants to resolve, when switching transports, when re-wiring after a harness change, or when the user asks how to get started with Tribal. Walks through binary install, `tribal bootstrap`, `tribal check`, and MCP config wire-up.
license: CC-BY-4.0
user-invocable: true
allowed-tools: Bash
---

<!-- PLACEHOLDER (CHECKPOINT 1 scaffold): body authored at CHECKPOINT 5.

Sections (per plan):
  1. When to use this skill (disambiguation vs `using-tribal`).
  2. Mandatory pre-reads: `references/consent.md`, `references/platforms.md`.
  3. Step 1 — Install the binary (Homebrew, curl|sh, Docker Compose) with trade-offs.
  4. Step 2 — Run `tribal bootstrap` with transport guidance.
  5. Step 3 — Run `tribal check`; surface structured remediation verbatim.
  6. Step 4 — Wire Tribal into your harness's MCP config. Describe the canonical
     `tribal mcp-config --json` shape FIRST (the universal contract); then
     point at `references/harnesses/` for known harness translations. Do NOT
     enumerate harness names in the prose — refer to "your harness" and
     "the MCP config your harness consumes". The agent navigates to the
     right per-harness reference based on what the user actually uses.
  7. Step 5 — (Optional) `tribal check --providers`.
  8. What can go wrong here — install-only failures; everything else delegated.
  9. You're done — handoff to `using-tribal`.

Cap: ≤500 lines. Target: ~400.
-->
