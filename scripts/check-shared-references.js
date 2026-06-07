#!/usr/bin/env node
// Each skill installs as its own directory, so a reference used by more than one skill
// is duplicated into each. This guards the copies against drift: every shared reference
// must be byte-identical across the skills that carry it.
//
// Keyed by reference -> the skills that carry a copy, so references shared by different
// (overlapping or disjoint) subsets of skills are each checked against only their own set.

const { readFileSync } = require("node:fs");
const { join } = require("node:path");

const SKILLS_DIR = join(__dirname, "..", "skills");

const SHARED_REFERENCES = {
  "bootstrap-output.md": ["installing-tribal", "using-tribal"],
  "tribal-check-remediation.md": ["installing-tribal", "using-tribal"],
  "failure-modes.md": ["installing-tribal", "using-tribal"],
  "reindexing.md": ["installing-tribal", "using-tribal"],
};

function read(skill, reference) {
  return readFileSync(join(SKILLS_DIR, skill, "references", reference));
}

// Skills whose copy of `reference` differs from the first skill's copy.
function divergingSkills(reference, skills) {
  const [baseline, ...others] = skills;
  const baselineBytes = read(baseline, reference);
  return others.filter((skill) => !read(skill, reference).equals(baselineBytes));
}

const code = (name) => `\`${name}\``;

let failed = false;

for (const [reference, skills] of Object.entries(SHARED_REFERENCES)) {
  const diverged = divergingSkills(reference, skills);
  if (diverged.length > 0) {
    console.error(`DIVERGED: ${code(reference)} in ${diverged.map(code).join(", ")} differs from ${code(skills[0])}`);
    failed = true;
  }
}

if (failed) {
  process.exit(1);
}

console.log(
  `OK: ${Object.keys(SHARED_REFERENCES).length} shared references byte-identical across their skills`,
);
