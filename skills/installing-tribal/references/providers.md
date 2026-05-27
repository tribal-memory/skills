# Configuring providers

Tribal makes two kinds of model call: **embedding** (one provider) and **inference** (three independent stages: extraction, triage, relation). Each is configured with a provider, a model, and an optional base URL. This file covers how to set them across the install paths, and where to find current model IDs.

## Where a provider setting can go

Each setting (provider, model, base URL) can be supplied in any of three ways. Most setups use just one.

- **Config file** (`tribal.yaml`): the `provider`, `model`, `base_url`, and `api_key` fields under `embedding` and under each `inference.<stage>`. Best for a binary you install and run yourself.
- **Environment variable**: `TRIBAL_EMBEDDING__PROVIDER`, `TRIBAL_INFERENCE__EXTRACTION__MODEL`, and so on. The double underscore marks each step of the path, so `TRIBAL_INFERENCE__EXTRACTION__PROVIDER` means `inference`, then `extraction`, then `provider`. The stage segment is `EXTRACTION`, `TRIAGE`, or `RELATION`. This is the channel the Docker Compose path uses.
- **Bootstrap flag** (provider and model only): `--embedding-provider`, `--embedding-model`, and `--inference-<stage>-provider` / `--inference-<stage>-model`. There is no flag for the base URL; set that through an environment variable or the config file. A flag passed to `tribal bootstrap` is written into the config file on the first run.

## Which one wins

If the same setting is supplied in more than one place, Tribal applies this order: a bootstrap flag first, then an environment variable, then the config file. So an environment variable overrides the config file, and a flag overrides both.

## Base URL

`base_url` is optional. When unset, each provider uses its own default endpoint (a local Ollama, or the provider's public API). Set it only to reach a non-default endpoint, for example a remote Ollama or a gateway.

**IMPORTANT:** switching a stage from the local default to a cloud provider means setting that stage's `base_url` to the cloud endpoint as well. If the provider changes but the base URL still points at the local address, requests misroute.

## API keys

Cloud providers need an API key; local providers do not. Supply it in any one of these ways:

- the `api_key` field on the stage in the config file,
- a stage-specific environment variable (`TRIBAL_EMBEDDING__API_KEY`, `TRIBAL_INFERENCE__EXTRACTION__API_KEY`, and so on), or
- the provider's standard variable, `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`.

The standard variable is simplest: one value covers every stage that uses that provider.

Editing the config file or an environment file is a sensitive operation; the ask-first protocol in [`consent.md`](consent.md) applies.

## By install path

**Direct binary (Homebrew, shell installer).** Any of the three channels work. The simplest persistent choice is the config file; `tribal config show` reveals the resolved layout without exposing keys. To run one provider across the whole pipeline, set each stage's provider and model (via flags at bootstrap, or in the file) and export the standard API key.

**Docker Compose.** Provider settings come from `.env`, **not** the config file. The compose stack passes a fixed set of `TRIBAL_*` environment variables into the container, and environment variables override the YAML config, so editing `tribal.yaml` inside the container does not change provider routing. The shipped `.env.example` carries a ready-to-paste cloud-provider block: set each stage's provider, model, and base URL there, plus the API key, then restart the stack.

## Choosing models

Model IDs change as providers release new versions. Consult the source of truth rather than a fixed list:

- **Local (Ollama):** the model library at https://ollama.com/library. Tribal ships with local defaults; `tribal config show` reveals the current ones.
- **OpenAI:** the models reference at https://platform.openai.com/docs/models.
- **Anthropic:** the models reference at https://docs.anthropic.com/en/docs/about-claude/models.

A working starting point at the time of writing:

- Embedding (cloud): `text-embedding-3-small`. **The embedding column is currently fixed at 768 dimensions**, and Tribal requests 768 from the model, so the embedding model must produce 768 dimensions natively or support reduction to 768. `text-embedding-3-small` supports reduction to 768.
- Inference, OpenAI (cloud): `gpt-5.4-mini` is the recommended default, and the model the example environment file ships. `gpt-4o-mini` is a cheaper, lower-latency alternative if you would rather not use a reasoning model; `gpt-4o` and the `gpt-4.1` family are more capable still. Tribal adapts the request shape per model, so reasoning and standard chat models both work.
- Inference, Anthropic (cloud): any Claude model works, because the Anthropic API requires `max_tokens` regardless, which makes it the simplest route to a more capable inference model today. Anthropic has no embedding API, so embedding stays on Ollama or OpenAI.

After configuring a cloud provider, gate the first ingest with `tribal check --providers`; the walkthrough is in [`tribal-check-remediation.md`](tribal-check-remediation.md).
