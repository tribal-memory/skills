# The agentic ingestion executor

Each ingestion stage (`extraction`, `triage`, `relation`) runs under one of two executors. **`one_shot`** is the default: a single completion call, no tools. **`loop`** routes the stage through an in-process turn loop that investigates before it commits. The two cost differently, and the loop needs a tool-capable model; the choice is per stage, set in the `agents` section of config.

## What the loop does

Under the loop, triage and relation get read tools (a stage-scoped semantic search plus item and neighbourhood reads) and a `submit_result` tool. The model searches and reads the graph, then submits. A submission clears the same deterministic validators the one-shot path runs; triage and relation then run a fresh-context **verifier** child that judges the submission before it commits. The extraction loop is degenerate: it has no read tools and submits in a single turn, so it investigates nothing.

Every loop drives tool calls, so a stage set to `loop` needs a **tool-capable model**. A model that cannot emit tool calls cannot submit, and the stage will not complete. See [`failure-modes.md`](failure-modes.md) for that failure's shape.

## Configuration

`agents.<stage>.executor` selects the executor, `one_shot` or `loop`. The matching environment variable is `TRIBAL_AGENTS__<STAGE>__EXECUTOR`, where `<STAGE>` is `EXTRACTION`, `TRIAGE`, or `RELATION`. There is no bootstrap flag; set it in the config file or by environment variable. `tribal config show` prints the resolved executor for each stage. The environment channel is the one Docker Compose uses.

## The verifier

`agents.<stage>.verifier` toggles the verifier child. Triage and relation verify **by default under the loop**; set it `false` to turn that off. Extraction has no verifier. The setting is inert under the one-shot executor (there is no submission loop to verify) and on extraction (there is no verifier to toggle); an inert setting starts the server with an advisory, never an error.

## Budgets

Three caps live under `agents.<stage>`; the defaults below are the loop's:

- **`max_turns`** (default 25): a runaway guard on the loop's turns, not a thinking budget.
- **`max_total_tokens`** (default 200000): the economic limit on a thread's token spend.
- **`execution_deadline_seconds`** (default 1200): the wall-clock bound on a thread's whole execution.

A `max_total_tokens` you set is enforced under either executor; its default applies only under the loop, so an unconfigured one-shot stage has no token cap. The turn and deadline caps bound only the loop: setting them on a one-shot stage is inert and surfaced as an advisory.

## Docker Compose

The stack exposes the executor selector, the triage and relation verifier toggles, and all three budgets per stage as `.env` variables. The executor defaults to `one_shot`; uncomment a stage's `TRIBAL_AGENTS__<STAGE>__EXECUTOR=loop` to opt in, and set any budget or verifier override alongside it.
