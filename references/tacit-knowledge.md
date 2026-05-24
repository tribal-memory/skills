# Tacit knowledge for Tribal

The practical companion to `skills/using-tribal/SKILL.md`. The skill body covers what Tribal is for and the anti-patterns to avoid; this file covers how to phrase ingests so the tacit layer is front-loaded, the audience rules that keep ingested knowledge usable years later, and the enrichment pattern the agent applies silently on every ingest. Read in full before calling the ingest tool for the first time in a session.

## The four-component phrasing pattern

Every ingest is composed of four parts, in this order:

1. **The principle.** The portable claim that ages well: what a reader should walk away with. Phrase as a generalisation that holds outside the original incident, not as an event in time.
2. **Trigger nod.** Acknowledges what surfaced the principle: optional context a reader might want for auditing provenance. Concise where you can, but do not strip context if clarity suffers. The ingestion pipeline normalises this layer downstream, so prefer including useful framing over producing a sterile principle stripped of its source.
3. **Symptom space.** Where this principle hides: the shape of the problem it warns about or the situations where it applies.
4. **Applicability frame.** When to reach for this in a new problem. Generalises beyond the original trigger.

The component that does most of the work is the **principle**: it is the load-bearing claim, phrased to read true outside the original incident. The trigger nod is a courtesy that lets a reader audit provenance if needed; it is never the headline.

Each ingest carries **one principle**, not a bundle. If a user request contains two distinct claims, submit two ingests.

### The delta

The gap between the trigger and the saved principle is the active tacit signal. When someone hits a bug, debugs it, and decides to ingest *something*, the difference between "the bug they hit" and "the thing they chose to save" reveals what they think matters about it. Readers learn an engineer's philosophy by reading many such deltas across time.

## Worked transformations

The pairs below show a dry-fact phrasing (✗) next to a tacit reframing (✓) of the same underlying insight. The ✗ and ✓ characters are markup for this reference only; they are not part of the prose to ingest. The ingest content is the text between the quotes.

Note also that the ✓ reframings extract only what is supported by the ✗. They do not add new prescriptions (e.g. ordering, sequencing, team-specific conventions) the original did not state. Extraction, not invention.

### Transport / proxy keepalives

✗ "After we debugged the timeout issue in the API gateway on 2026-05-15, I learned we need to set `tcp_keepalive` on long-lived connections."

✓ "Long-lived connections through corporate proxies silently drop without `tcp_keepalive` set; the failure mode is opaque (timeouts with no clear root cause). Surfaced on a streaming RPC bug, but the principle generalises to any long-running transport over a network with intermediate hops (websockets, long polls, server-sent events, gRPC streams). Check keepalive defaults explicitly when designing such a transport; the silence between client and server is the symptom that hides this class of bug."

### Database migration ordering

✗ "We had a bad migration last week that dropped a column before the deploy went out, so the rollback failed."

✓ "Schema changes that remove or rename existing columns must ship in two deploys: first the code paths that no longer depend on the column, then the migration that removes it. One-deploy column removals make rollback impossible because the previous binary cannot recover a column it still references. Applies to any irreversible schema change (drops, renames, type narrowings) whenever there is a chance the prior binary will be redeployed."

### Build cache invalidation

✗ "Our CI cache was poisoned by a stale lockfile and we lost two hours rebuilding it."

✓ "Build caches keyed only on a dependency-manifest hash will silently serve stale outputs when an upstream registry serves a different artefact for the same version string. Add the resolved-artefact hash (lockfile content hash, not declaration hash) to the cache key, or the cache becomes a correctness hazard rather than a speed-up. Applies wherever a build cache is keyed on declared dependencies rather than resolved ones; most package managers default to declaration-only keys."

### Review process (interpersonal)

✗ "Priya flagged that we should stop bundling nits with architectural feedback because it confused junior reviewers."

✓ "Nits and architectural feedback compete for the same review-attention budget when bundled in a single thread; the architectural feedback tends to be answered with the nit-handling reflex (small, mechanical changes) rather than the architectural reflex (a re-think). Surfaced via junior reviewer confusion, but the dynamic applies whenever both classes of feedback share a thread; separating the channels preserves the attention budget for each."

Notice the pattern: each ✓ leads with the principle and demotes the originating incident (the date, the person who hit it, the time wasted) to context the reader can skip. The aim is a principle that reads true to a stranger six months from now, with provenance accessible but never the headline.

## Audience and attribution

Ingested content addresses a **future, unknown audience**: an agent or person with no memory of who ingested it, when, or under what circumstances. Phrase accordingly.

Rules:

- **No first-person voice.** Do not write "I noticed", "we discovered", "we tend to". State the principle as a generalisation.
- **No agent self-reference.** Do not write "the assistant suggested", "the model surfaced". The text is principle-and-evidence, not a transcript.
- **No named attribution in prose.** Do not write personal names or the active user's name. Programmatic attribution (who created the item) is recorded separately at ingest time and is not part of the prose content.

The attribution rule has two reasons. First, attribution in prose ages poorly — people change roles, leave the team, or shift their views. The principle should outlive the speaker. Second, embedding the speaker's identity in prose creates a credibility-based weighting failure mode: a more senior-titled person's incorrect ingest can take precedence over a junior's correct ingest because the prose carries the seniority signal into discover results. Strip identity from the content; let the principle compete on its merit.

Some classes of content genuinely require attribution to make sense (e.g. "the upstream API contract owner specifies X"). In those cases, attribute to a **role or a contract**, not a person: "the API owner", "the schema contract", "the upstream service". Roles outlive incumbents.

## Enriching the ingest

When the user asks to ingest something, the job is to package as much context as possible into the four-component shape and submit. Specifically:

- Take the user's request at face value. They are the gate.
- From the conversation context, infer the trigger nod, symptom space, and applicability frame around the principle they care about. State what you can; leave what you can't.
- Submit the ingest without asking for confirmation. Tribal must fade into the background — confirmation prompts break the user's flow and the tool becomes friction rather than infrastructure.
- The ingestion pipeline performs additional tacit extraction downstream of any single ingest call; this enrichment is one of multiple processing layers, not the only one.
- Do not hallucinate. If the conversation does not support a component (e.g. no obvious applicability), state only what is supported and leave the rest. A short, honest ingest is better than a long, invented one.

If the user's request contains two distinct claims, submit two separate ingests — one principle per item.

## Starter prompts

If the user asks what to ingest first, offer this menu. It is not prescriptive — pick one or none. Their first ingest is theirs.

- **Why we chose X over Y.** The rationale behind a load-bearing design decision, phrased as a portable principle a future reader can apply to a different choice. Include the alternative that was rejected and why — the rejection is often where the tacit layer lives.
- **The alternative you almost picked.** The path not taken, and the constraint or insight that ruled it out. The rejection itself is the principle.
- **The constraint that wasn't written down.** A bound on the design that nobody documented because it was obvious to everyone in the room, and isn't, six months later.
- **The breakthrough that closed the bug.** A recent "oh, this whole class of problems looks like that" moment, articulated with its symptom space and applicability frame.
- **The decision the team keeps re-litigating.** A topic that comes back repeatedly with the same conclusion; capture the principle so future cycles stop re-deriving it.
- **The heuristic that became second nature.** A rule of thumb that someone applies without thinking; surface it so a teammate without the same instincts can apply it deliberately.
- **The thing only one teammate knows.** Bus-factor knowledge converted into a portable principle, stripped of the teammate's name.
- **What a new hire would struggle to learn from code, docs, and tickets alone.** Onboarding-shaped tacit knowledge: the kind that makes the artefacts make sense.
