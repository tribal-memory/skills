# Operating system and architecture variance

Single source for what varies across the supported environments. SKILL.md bodies do not branch on platform; they delegate to this file and let the agent detect the active environment with a one-liner.

## Detect the active environment

```bash
uname -sm
```

Returns one of:

- `Darwin arm64` for macOS on Apple Silicon
- `Darwin x86_64` for macOS on Intel
- `Linux x86_64` for Linux on x86_64
- `Linux aarch64` for Linux on arm64

## What does not vary

Most of the install and bootstrap surface is platform-agnostic. The agent should not branch on platform unless one of the entries in the next section applies.

- **Tribal binary.** The binary itself is architecture-aware. Homebrew, the shell installer, and the Docker image all resolve the correct binary for the active architecture without user input.
- **Postgres with `pgvector`.** Same setup on macOS and Linux. Same on Intel and Apple Silicon.
- **Docker Compose.** Host architecture is irrelevant for the containerised path. The image is multi-arch and the host-side `docker compose` semantics are identical.
- **MCP wire-up.** The canonical `tribal mcp-config --json` output is identical across platforms.

## What does vary

The handful of real divergences:

- **Shell rc file.** macOS defaults to `~/.zshrc` (zsh has been the default shell since Catalina). Linux distributions vary; common defaults include `~/.bashrc` and `~/.zshrc`. The agent should detect the active shell from `$SHELL` rather than assuming.
- **Local Ollama install.** macOS uses Homebrew or the official installer; Linux uses the shell installer at `https://ollama.com/install.sh`. Both produce a binary the rest of the flow uses identically.
- **Container runtime on Linux.** Docker Desktop is macOS-specific; Linux users typically install `docker-ce` and `docker-compose-plugin` through their distribution's package manager. The Compose file itself is unaffected.

## Future-proofing

When a new platform becomes supported (Windows via WSL, or a fresh Linux distribution requiring different package paths), edit this file only. SKILL.md bodies remain unchanged; they continue to delegate platform detection to the agent and lookup of the divergence to this reference.
