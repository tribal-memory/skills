# Configuring providers

Tribal makes two kinds of model call: **embedding** (one provider) and **inference** (three independent stages: extraction, triage, relation). They are configured differently; the embedding configuration in particular has two parts, so read its section before setting either.

## Embedding: a genesis seed plus a credential

Embedding configuration is split in two.

- **`init.embedding`** is the *genesis seed*: `provider`, `model`, an optional `dimensions`, and an optional `base_url`. It has no `api_key` field. It seeds the corpus's first embedding profile on the very first boot and is **inert thereafter**. Editing it after that first boot does nothing to an existing graph; the live embedding identity is the active profile, not this section. Changing the embedding model or dimension later is a reindex (`tribal reindex run`), never an edit here.
- **`credentials`** is a catalogue of named provider credentials, and is where the embedding **API key** lives. Each entry has three fields: `provider_kind`, `base_url`, and `api_key`. Tribal resolves the credential for an embedding endpoint by matching the endpoint's normalised `(provider_kind, base_url)`, not by the entry's name, so the name is yours to choose (lowercase letters, digits, and underscores, starting with a letter; no hyphens). A cloud embedding endpoint with no matching entry, or a matching entry with an empty key, fails closed.

The dimension is a per-profile value (1 to 4000), stored as a `halfvec`. When `init.embedding.dimensions` is unset, the genesis profile takes the model's native dimension.

## Inference: per stage

Each inference stage (`extraction`, `triage`, `relation`) is configured independently with a `provider`, `model`, optional `base_url`, and optional `api_key`. Unlike embedding, the inference API key stays on the stage itself; it does not use the credentials catalogue.

## Where a setting can go

Each setting can be supplied in any of three channels. Most setups use one.

- **Config file** (`tribal.yaml`): `init.embedding.*`, the `credentials.<name>.*` entries, and `inference.<stage>.*`. Best for a binary you install and run yourself.
- **Environment variable**: a double underscore marks each step of the path.
  - embedding seed: `TRIBAL_INIT__EMBEDDING__PROVIDER`, `__MODEL`, `__DIMENSIONS`, `__BASE_URL` (no `__API_KEY`; the seed has no key field).
  - embedding credential: `TRIBAL_CREDENTIALS__<NAME>__PROVIDER_KIND`, `__BASE_URL`, `__API_KEY`, where `<NAME>` is the upper-cased connection name.
  - inference: `TRIBAL_INFERENCE__<STAGE>__PROVIDER`, `__MODEL`, `__BASE_URL`, `__API_KEY`, where `<STAGE>` is `EXTRACTION`, `TRIAGE`, or `RELATION`.

  This is the channel the Docker Compose path uses.
- **Bootstrap flag** (provider and model only): `--embedding-provider`, `--embedding-model`, and `--inference-<stage>-provider` / `--inference-<stage>-model`. There is no base-URL flag; set that by environment variable or in the config file. Run `tribal bootstrap --help` for the exact set. A flag is written into the config file only on the first run, when bootstrap creates the file; if the config already exists, bootstrap prints the matching `TRIBAL_*` variables to set instead.

The simplest key channel is the provider's **standard variable**, `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` (a local Ollama needs none). One value covers every stage that uses that provider, and fills the key on the embedding endpoint's catalogue entry (bootstrap synthesises that entry for a cloud embedding provider).

## Which one wins

At runtime, an environment variable wins over the config file. The bootstrap provider and model flags are not a separate runtime tier: on the first run bootstrap writes them into the config file, and if the config already exists it prints the matching `TRIBAL_*` variables to set instead.

## Base URL

`base_url` is optional; unset, each provider uses its own default endpoint (a local Ollama, or the provider's public API). Set it to reach a non-default endpoint, such as a remote Ollama or a gateway.

**IMPORTANT:** an unset `base_url` follows the provider, so switching a stage to a cloud provider is enough on a binary install. Where `base_url` is pinned to a local address, as the Docker Compose stack does, change it to the cloud endpoint too; left pointing at the local address, requests misroute.

**IMPORTANT (embedding endpoints):** for an OpenAI-style endpoint, use a **path-less** base URL: `https://api.openai.com`, not `https://api.openai.com/v1`. Tribal normalises an endpoint by keeping its path (the `:443` port is filled in for you), then matches the embedding seed's `base_url` against the credential's `base_url`. If one carries `/v1` and the other does not, they do not match, the credential does not resolve, and embedding fails closed with no obvious cause. Keep the seed's and the credential's `base_url` in the same, path-less form.

## API keys

Cloud providers need an API key; local providers do not. The embedding key lives in the credentials catalogue; each inference key lives on its stage. The standard `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` is the simplest channel for either: one value covers every stage and the embedding endpoint that uses that provider.

Editing the config file or an environment file is a sensitive operation; the ask-first protocol in [`consent.md`](consent.md) applies.

## By install path

**Direct binary (Homebrew, shell installer).** Any of the three channels work. The simplest persistent choice is the config file; `tribal config show` prints the fully resolved layout (keys redacted unless `--show-secrets`). To run one provider across the whole pipeline, set each stage's provider and model, and export the standard API key.

**Docker Compose.** Provider settings come from `.env`, not the config file: the stack passes a fixed set of `TRIBAL_*` variables into the container, and environment variables override the YAML, so editing `tribal.yaml` inside the container does not change routing. The shipped `.env.example` carries a ready-to-paste cloud block: set the `TRIBAL_INIT__EMBEDDING__*` and `TRIBAL_INFERENCE__<STAGE>__*` provider, model, and base-URL variables, plus your `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`. The catalogue-style `TRIBAL_CREDENTIALS__*` variables are not needed on this path; the standard provider variable fills the embedding credential for you.

## Choosing models

Model IDs change as providers release new versions. Consult the source of truth rather than a fixed list:

- **Local (Ollama):** the model library at https://ollama.com/library. Tribal ships with local defaults; `tribal config show` reveals the current ones.
- **OpenAI:** the models reference at https://platform.openai.com/docs/models.
- **Anthropic:** the models reference at https://docs.anthropic.com/en/docs/about-claude/models.

The shipped example environment file uses `gpt-5.4-mini` for the inference stages and `text-embedding-3-small` for OpenAI embedding. Tribal adapts the request shape per model, so reasoning and standard chat models both work. Anthropic has no embedding API, so embedding stays on Ollama or OpenAI; any Claude model works for the inference stages.

After configuring a cloud provider, gate the first ingest with `tribal check --providers`; the walkthrough is in [`tribal-check-remediation.md`](tribal-check-remediation.md).
