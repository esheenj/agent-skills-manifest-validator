# Agent Skills Manifest Inspector

**Check the package. Question the permissions.**

An original MIT-licensed, offline, dependency-free review tool for portable [Agent Skills](https://agentskills.io/specification) SKILL.md files. It checks a **supported subset** of frontmatter conventions and highlights broad tool claims or instruction text deserving a human review. It **does not** issue verified identity badges or authorize an agent to execute anything.

**Live demo:** https://esheenj.github.io/agent-skills-manifest-validator/

## Run locally

```bash
git clone https://github.com/esheenj/agent-skills-manifest-validator
cd agent-skills-manifest-validator
npm test
npm run demo
npm run build
```

For your own **permissioned, preferably fictional** SKILL.md:

```bash
node src/cli.mjs /path/to/SKILL.md parent-folder-name
```

Exit codes: 0 = no issues or only notes within supported subset; 2 = format issue requiring a fix; 3 = review-needed without format issue; 1 = invalid input or runtime problem.

## Checks

- YAML frontmatter delimiters, required `name` and `description`
- Name: 1–64 characters, lowercase letters/digits/hyphens, no leading/trailing/doubled hyphens, matches folder
- Description: 1–1,024 characters; short descriptions flagged as review quality hints
- Optional compatibility length: max 500 characters
- Optional `metadata` simple nested strings, `license`, and **experimental** `allowed-tools`
- Repeated keys, unknown fields, empty instructions, long documents, possible broad tool claims
- Heuristic warnings for certain instructions and pipe-to-shell commands

**Supported YAML:** basic unquoted, single-quoted, JSON-style double-quoted scalar fields and simple two-space-indented metadata. YAML block scalars, anchors, merges, complex flow types, nonstandard constructs and any unsupported YAML are **flagged for review**, not silently certified. A `SUBSET_CHECKED` result is not evidence of full spec validation.

For comprehensive **format validation**, the official [Agent Skills reference validator](https://github.com/agentskills/agentskills/tree/main/skills-ref) is authoritative. You can use `skills-ref validate ./skill-directory` in a separately configured environment. This inspector is complementary UX tooling, not a replacement for the upstream parser.

## Security and privacy boundaries

All browser checking is local and uses a strict Content Security Policy; no telemetry, external services, dynamic dependencies, agent worker, shell execution or file uploads. Suspicious-instruction detection is a **small, non-exhaustive set of regular-expression hints**. Neither a clean result nor an upstream formatting pass proves code is safe, publisher identity is authentic, scripts are appropriate, or network access is acceptable. Review scripts, reference files, dependencies and actual host permissions independently. No private SIGMA, Cortex, trading, financial or confidential customer data is included.

The public example uses invented incident-review content. Keep real credentials, production instructions, personal information and proprietary records out of public bug reports.

## Support and contributions

Please open a GitHub issue with a minimized fictional SKILL.md sample and expected finding. The MIT examples remain free.

Optional voluntary support: [Esheen Labs public support page](https://esheenj.github.io/compound-intelligence-starter/support.html). Native GitHub Sponsors and fiat checkout are not claimed as active. Confirm any crypto deposit address, network and minimum at the time of transfer.

© 2026 Esheen Labs.
