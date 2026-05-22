## Learned User Preferences

- Prefer direct, low-friction generation flow: do not open sign-up/auth overlay unless the backend explicitly indicates authentication or quota exhaustion (use explicit server signals such as error codes—not generic 429s or unrelated rate limits).
- Prefer prompt guidance that is subtle and non-blocking, with delayed helper text rather than hard minimum-length enforcement; do not treat clearly substantive project descriptions as invalid for being too short or generic.
- Do not auto-open generated pages or spawn macOS `open` / external browser tabs after kimi/playground runs — the gallery grid at `http://localhost:7420/` in the Cursor embedded browser is enough.
- Optional gallery entrypoint: `http://localhost:7420/` (start with `bun .forge/kimi-gallery/serve.mjs` when needed). Do not enable `autoOpenOnStart` for project browser.
- Prefer concise changes for recurring UX behaviors over pre-emptive client-side gating.
- Homepage engine work must stay **generic**: route by site kind / grammar / structural patterns, not by hardcoded briefs (e.g. “blog-dogs”, “KubeMeter”). Users can ask for infinitely many site types; do not accumulate one-off rules per vertical.

## Learned Workspace Facts

- `.cursor/settings.json` may set `cursorProject.defaultUrl` to `http://localhost:7420/` but `autoOpenOnStart` should stay `false`.
- Workspace has a GitHub MCP configuration in `.cursor/mcp.json` using `bunx` and `@modelcontextprotocol/server-github` with token env var.
- Local MCP plugin metadata indicates a configured tldraw integration under `.cursor/projects/Users-livio-Documents-ship-fast/mcps/plugin-tldraw-tldraw`.
- The app has recurring runtime behavior around preview hot-reload events (`preview_reload`, `client_reload`) and websocket-driven dashboard updates.
- Session and homepage flows have repeatedly aimed to avoid iframe-embedding the homepage behind a session; prefer URL or view-state changes without iframes where possible.

## Homepage generation

- **Playground ship engine:** `playground-engine-ui-ship/` — local bench via `bun playground-engine-ui-ship/scripts/ship-native.mjs`. Artifacts: `.forge/ship-native/<runId>/`.
- **Gallery grid:** `bun playground-engine-ui-ship/scripts/ship-gallery-build.mjs` then `bun .forge/ship-gallery/serve.mjs` → `http://localhost:7420/`. After a single-brief run, pass `--run=<runId>`.
- **Production default:** sessions on ship-fast.devliv.io use `groqHomepage` in `packages/ship-fast-engine/src/pipeline/phase-homepage.js` unless `SHIPFAST_HOMEPAGE_ENGINE=ship` is set on the server.
- **Parity check:** playground output and live session preview can differ when production is still on the legacy path or when the ship engine regresses structure (e.g. blog index missing a post grid). Compare `/preview/<sessionId>/` to gallery pages, not the dashboard shell.

## Engine design — general, not per-use-case

Ship Fast cannot predict what websites users will describe. Inputs are open-ended (blog, store, fleet ops, hotel, portfolio, … and endless variants). Therefore:

- **Build generic mechanisms:** site-kind inference (`blog`, `commerce`, `software`, …), page grammars, planner genomes, shared contracts, stitch/repair, and audits keyed on **structure** (e.g. “publication index = featured story + archive grid”), not on named examples.
- **Do not hardcode infinite verticals:** avoid new `if (slug === 'blog-dogs')` branches, fixed copy decks, or stub content lists tied to one demo brief. Prefer fallbacks derived from the user brief + site kind.
- **Regression tests use exemplars, production stays general:** stress briefs like `blog-dogs` are for CI/gallery only; fixes must generalize to any blog/publication brief.
- **Safety nets repair missing structure, not a single brand:** post-process injectors should detect absent *patterns* (no post grid on a blog home) and fill with brief-aware generic placeholders—not permanent “dog blog” templates in core logic.

When adding engine behavior, ask: *“Does this work for the next arbitrary prompt?”* If not, lift it to a site kind or layout grammar instead.

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **ship-fast** (15133 symbols, 25758 relationships, 300 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/ship-fast/context` | Codebase overview, check index freshness |
| `gitnexus://repo/ship-fast/clusters` | All functional areas |
| `gitnexus://repo/ship-fast/processes` | All execution flows |
| `gitnexus://repo/ship-fast/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->

## Repository Map

A full codemap is available at `codemap.md` in the project root.

Before working on any task, read `codemap.md` to understand:

- Project architecture and entry points
- Directory responsibilities and design patterns
- Data flow and integration points between modules

For deep work on a specific folder, also read that folder's `codemap.md`.
