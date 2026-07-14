## CRITICAL RULE - CHECK GIT HISTORY FIRST

**BEFORE IMPLEMENTING ANYTHING:**

1. ALWAYS check git history to see if the feature/fix was already implemented
2. If it exists in history, use that implementation - DO NOT reimplement
3. If unsure whether it was done, ASK THE USER before implementing
4. NEVER remove or change existing working functionality
5. Implementation is the LAST resort, not the first action

**Command to check history:** `git log --oneline -20` and `git show <commit>` to see what was done
**Command to check if file was changed:** `git log --oneline -- <filename>`

This rule exists because 95% of requests are for features that were already working and got broken by unnecessary reimplementation.

## CRITICAL RULE - NO `as any` CASTS — FIX THE UNDERLYING TYPES

**NEVER use `as any` to silence type errors.** No exceptions.

1. If a type doesn't fit, fix the type definition or the call site — don't cast.
2. If an input type is missing optional fields, add them to the interface or use `Pick`/`Partial`.
3. If a test needs a partial input, construct it with the real type and omit only fields that are genuinely optional.
4. `as any` hides bugs, breaks type safety, and makes refactors unsafe. The type error is telling you something — listen to it.
5. This applies to all code: production, tests, temp scripts, everything.

**Instead of `as any`:**

- Use `Partial<T>` when most fields are optional
- Use `Pick<T, 'field1' | 'field2'>` when you only need a few fields
- Add the missing fields to the type definition
- Use a properly typed test fixture/factory function

This rule exists because `as any` casts have hidden real bugs and type mismatches that surfaced in production.

## CRITICAL RULE - ALWAYS VERIFY YOUR WORK

**AFTER IMPLEMENTING ANYTHING:**

1. ALWAYS test your changes with the actual tool/mechanism (agent-browser, curl, etc.)
2. NEVER claim something is fixed without verification
3. If the user asks you to test with a specific tool (agent-browser), USE THAT TOOL
4. Do NOT assume your fix works - verify it with real inputs
5. If verification fails, DO NOT claim success - report the failure

This rule exists because claiming unverified fixes wastes time and breaks trust.

## CRITICAL RULE - UNIT TEST EVERY FIX TO PREVENT REGRESSION

**This project has suffered from repeated feature breakage and back-and-forth restoring the same features. Every fix or feature arrangement MUST be covered by unit tests.**

**BEFORE implementing:**

1. Check git history for past solutions (`git log --oneline -20`, `git show <commit>`)
2. If the feature existed before, restore it from history — do not reimplement

**AFTER implementing:**

1. Write a unit test that covers the fix or restored behavior
2. Write behavioral tests that exercise the actual runtime behavior, public API, rendered DOM, side effects, or generated artifact contract
3. Run the smallest relevant test command that exercises the changed behavior, plus the actual runtime/tool path when one exists
4. Do NOT run full project test/build suites for hook, CI, docs, config, or tooling-only changes unless the user explicitly asks; GitHub Actions owns exhaustive gates for those changes
5. For production/runtime changes, run the relevant package or project gate; if the only meaningful gate is a slow full suite, ask before launching it
6. NEVER push unless local targeted verification has passed and CI is expected to run the exhaustive gates

**WHEN TESTS FAIL:**

1. Treat the failing test as evidence of a product/code regression first, not as text to rewrite.
2. Fix production code, wiring, generated artifacts, or test setup unless you can prove the test assertion is stale or incorrect.
3. Only change a test when the product requirement changed, the test asserts the wrong contract, or the test points at an old module boundary after a verified refactor.
4. If changing a test, explain the proof that the test was wrong and preserve equivalent coverage for the intended behavior.

**Test patterns for this project:**

- Use `vitest` with `describe`/`it`/`expect`
- Behavioral tests: import public functions, components, actions, or scripts and test inputs/outputs, rendered DOM, API side effects, command plans, or generated artifacts directly
- Do NOT add source-assertion/source-grep tests. Tests must not read production source files and assert strings or regexes to prove wiring, branches, imports, or implementation details exist.
- Reading fixtures, snapshots, generated output, or built artifacts is allowed only when that file content is the runtime artifact under test.
- Tests live next to the code they cover (`*.test.ts` sibling files)

This rule exists because features keep getting broken by refactors and reimplementations. Unit tests are the permanent guard against regression.

## Learned User Preferences

- Prefer direct, low-friction generation flow: do not open sign-up/auth overlay unless the backend explicitly indicates authentication or quota exhaustion (use explicit server signals such as error codes—not generic 429s or unrelated rate limits).
- Prefer prompt guidance that is subtle and non-blocking, with delayed helper text rather than hard minimum-length enforcement; do not treat clearly substantive project descriptions as invalid for being too short or generic.
- Do not auto-open generated pages or spawn macOS `open` / external browser tabs after kimi/playground runs — the gallery grid at `http://localhost:7420/` in the Cursor embedded browser is enough.
- Optional gallery entrypoint: `http://localhost:7420/` (start with `bun .forge/kimi-gallery/serve.mjs` when needed). Do not enable `autoOpenOnStart` for project browser.
- Prefer concise changes for recurring UX behaviors over pre-emptive client-side gating.
- Homepage engine work must stay **generic**: route by site kind / grammar / structural patterns, not by hardcoded briefs (e.g. “blog-dogs”, “KubeMeter”). Users can ask for infinitely many site types; do not accumulate one-off rules per vertical.

## Learned Workspace Facts

- **Initial engine reference:** The original ship-faster engine is at `/Users/livio/Documents/ship-faster` (git: https://github.com/AbhiShake1/ship-faster.git). Use this for checking original implementations, patterns, and architectural decisions before reimplementing features.
- Environment/secrets are managed with Doppler. For commands that need real env vars, prefer `doppler run -- <cmd>` rather than assuming `.env.local` has current keys; do not commit generated env files.
- `.cursor/settings.json` may set `cursorProject.defaultUrl` to `http://localhost:7420/` but `autoOpenOnStart` should stay `false`.
- Workspace has a GitHub MCP configuration in `.cursor/mcp.json` using `bunx` and `@modelcontextprotocol/server-github` with token env var.
- Local MCP plugin metadata indicates a configured tldraw integration under `.cursor/projects/Users-livio-Documents-ship-fast/mcps/plugin-tldraw-tldraw`.
- The app has recurring runtime behavior around preview hot-reload events (`preview_reload`, `client_reload`) and websocket-driven dashboard updates.
- Session and homepage flows have repeatedly aimed to avoid iframe-embedding the homepage behind a session; prefer URL or view-state changes without iframes where possible.

## Homepage generation

- **Playground ship engine:** `playground-engine-ui-ship/` — local bench via `bun playground-engine-ui-ship/scripts/ship-native.mjs`. Artifacts: `.forge/ship-native/<runId>/`.
- **Gallery grid:** `bun playground-engine-ui-ship/scripts/ship-gallery-build.mjs` then `bun .forge/ship-gallery/serve.mjs` → `http://localhost:7420/`. After a single-brief run, pass `--run=<runId>`.
- **Production path:** sessions on ship-fast.devliv.io use `groqHomepage` in `packages/ship-fast-engine/src/pipeline/phase-homepage.js`.
- **Parity check:** playground output and live session preview can differ when production is still on a legacy path or when the gallery/compiler changes structure (e.g. blog index missing a post grid). Compare `/preview/<sessionId>/` to gallery pages, not the dashboard shell.

## Engine design — general, not per-use-case

Ship Fast cannot predict what websites users will describe. Inputs are open-ended (blog, store, fleet ops, hotel, portfolio, … and endless variants). Therefore:

- **Build generic mechanisms:** site-kind inference (`blog`, `commerce`, `software`, …), page grammars, planner genomes, shared contracts, stitch/repair, and audits keyed on **structure** (e.g. “publication index = featured story + archive grid”), not on named examples.
- **Do not hardcode infinite verticals:** avoid new `if (slug === 'blog-dogs')` branches, fixed copy decks, or stub content lists tied to one demo brief. Prefer fallbacks derived from the user brief + site kind.
- **Regression tests use exemplars, production stays general:** stress briefs like `blog-dogs` are for CI/gallery only; fixes must generalize to any blog/publication brief.
- **Safety nets repair missing structure, not a single brand:** post-process injectors should detect absent _patterns_ (no post grid on a blog home) and fill with brief-aware generic placeholders—not permanent “dog blog” templates in core logic.

When adding engine behavior, ask: _“Does this work for the next arbitrary prompt?”_ If not, lift it to a site kind or layout grammar instead.

<!-- gitnexus:start -->

# GitNexus — Code Intelligence

This project is indexed by GitNexus as **ship-fast** (45089 symbols, 76813 relationships, 300 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

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

| Resource                                   | Use for                                  |
| ------------------------------------------ | ---------------------------------------- |
| `gitnexus://repo/ship-fast/context`        | Codebase overview, check index freshness |
| `gitnexus://repo/ship-fast/clusters`       | All functional areas                     |
| `gitnexus://repo/ship-fast/processes`      | All execution flows                      |
| `gitnexus://repo/ship-fast/process/{name}` | Step-by-step execution trace             |

## CLI

| Task                                         | Read this skill file                                        |
| -------------------------------------------- | ----------------------------------------------------------- |
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md`       |
| Blast radius / "What breaks if I change X?"  | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?"             | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md`       |
| Rename / extract / split / refactor          | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md`     |
| Tools, resources, schema reference           | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md`           |
| Index, status, clean, wiki CLI commands      | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md`             |

<!-- gitnexus:end -->

## Repository Map

A full codemap is available at `codemap.md` in the project root.

Before working on any task, read `codemap.md` to understand:

- Project architecture and entry points
- Directory responsibilities and design patterns
- Data flow and integration points between modules

For deep work on a specific folder, also read that folder's `codemap.md`.

## Agent-browser

never run agent-browser headless. Always use parameter --headed

<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->
