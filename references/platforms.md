<!-- PLACEHOLDER (CHECKPOINT 1 scaffold): authored at CHECKPOINT 4.

Single source of OS / arch variance. SKILL.md bodies never branch — they delegate
here, and the agent runs `uname -sm` as a tool call to know which row applies.

Coverage:
  - macOS arm64 (Apple Silicon).
  - macOS x86_64 (Intel).
  - Linux x86_64.
  - Linux aarch64.

Includes:
  - Detection one-liner: `uname -sm`.
  - "What actually varies" table: shell rc path (zsh on macOS default, often bash on
    Linux), Ollama install differences. Homebrew handles macOS arch transparently;
    the Tribal binary is arch-aware; Docker is host-arch-agnostic.
  - "What doesn't vary" — explicit list, prevents the agent from over-branching.

Future-Linux work edits this file only.

Target: ~70 lines.
-->
