---
name: incident-review
description: Guides engineers through incident evidence triage, timeline reconstruction, and review preparation. Use when investigating fictional system incidents.
license: MIT
compatibility: Works offline with plain Markdown and no external services
metadata:
  author: Esheen Labs
  version: "1.0"
allowed-tools: Read Grep
---
# Incident review

Use fictional event logs. Summarize the sequence and identify gaps.
Never change production systems or treat self-reported events as authenticated evidence.

1. Gather the provided example timeline.
2. List the hypotheses, counterexamples, and missing evidence.
3. Return a report that separates observed facts from unverified claims.
