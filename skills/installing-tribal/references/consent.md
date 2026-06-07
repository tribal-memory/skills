# Ask-first consent for credential-bearing files

A hard rule for any agent following the Tribal skills: do not read or write the files listed below without explicit per-file user confirmation in the current session.

## Files requiring consent

- The credentials file Tribal writes during bootstrap. Contains the bearer token. The path is OS-dependent and is named explicitly in the bootstrap output.
- Harness MCP configuration files. The path varies per harness; consult the corresponding file under [`harnesses/`](./harnesses/) for the location.
- Shell configuration files (`.zshrc`, `.bashrc`, `.profile`, `.zshenv`, and equivalents).
- Environment files (`.env`, `.envrc`, and equivalents). These commonly contain API keys and other secrets.

## The pattern

Before each read or write of any of the above:

1. State explicitly which file you intend to access and why.
2. Ask the user for confirmation in plain prose. Example: "I'd like to add Tribal's MCP config to `~/.codex/config.toml`. May I?"
3. Proceed only on an affirmative response. A non-response is not consent.
4. Confirm to the user after the action completes, naming the file again.

## Printing environment values

The same caution applies to printing environment variables that may contain secrets (API keys, bearer tokens, OAuth credentials). Commands like `env`, `printenv`, or `echo $VAR` expose values to the conversation transcript and any logs the harness keeps. Ask the user before running them, the same way you would ask before reading a credentials file.

This extends to commands whose purpose is not printing secrets but which resolve and emit them as a side effect. **`docker compose config` is the notable trap:** it interpolates the project's `.env` and prints the fully resolved configuration, API keys included, to stdout. Do not run it agentically without consent. To validate a compose file without emitting secrets, use `docker compose config --quiet`, which checks the configuration and returns a non-zero exit on error while printing nothing. The same caution covers `docker inspect` against a running container, which exposes its environment.

When you must *inspect* output that embeds a secret (for example, `tribal mcp-config --static-token` puts the bearer token in an `Authorization` header), do not print it raw. Confirm the field is present rather than echoing its value, or redact on the way through (`sed -E 's/(Bearer )[A-Za-z0-9_.-]+/\1***REDACTED***/g'`). An ad-hoc `jq` projection is not a reliable redactor: the surrounding object can still reach stdout. Two other Tribal commands emit secrets the same way: `tribal bootstrap --json` always includes the raw bearer token in its output (even on the URL-only OAuth path), and `tribal config show --show-secrets` prints the database URL and API keys unredacted. Treat all three as secret-bearing.

## Modifying without reading

You can change a credential-bearing file without reading its values into the transcript. When a file already holds a secret, prefer an in-place edit (`sed -i`) or an append over a read-then-write, and where possible let the user paste the secret themselves. The aim matches the read rule: keep secret values out of the conversation and its logs.

## Exception

Running `tribal mcp-config` (or any other Tribal binary command) is not subject to this rule. The binary is itself the authorisation surface: it reads no user state outside its own configured paths, and the user has already authorised invocation by running the agent.

The rule applies to file-level reads and writes the agent performs through tool calls, not to command invocations the agent shells out for.

## Why this exists

Credential-bearing files store secrets that should not leave the user's machine. Agents reading them risk transcripting secrets into conversation logs; agents writing them risk overwriting state the user depends on. Per-file consent is friction on purpose: the alternative is silent compromise.
