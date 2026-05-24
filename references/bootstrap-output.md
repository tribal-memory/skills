<!-- PLACEHOLDER (CHECKPOINT 1 scaffold): authored at CHECKPOINT 4.

Exact schemas:
  - `tribal bootstrap --json`: bearer_token, principal_key, principal_id, project_id,
    project_name, git_remote, transport, mcp_config{type/command/args/url/headers},
    config_path.
  - `tribal mcp-config --json`: identical mcp_config shape with "type" discriminator
    (stdio | http | sse). Headers present only when auth is provided (http/sse).

Plus jq snippets extracting each field. Note that the shapes are snapshot-locked
(reference the relevant snapshot fixture names in the parent repo without quoting
paths, per the no-private-refs rule).

Target: ~80 lines.
-->
