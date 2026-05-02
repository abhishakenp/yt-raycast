## Learned User Preferences

- Prefer direct, low-friction generation flow: do not open sign-up/auth overlay unless the backend explicitly indicates authentication or quota exhaustion (use explicit server signals such as error codes—not generic 429s or unrelated rate limits).
- Prefer prompt guidance that is subtle and non-blocking, with delayed helper text rather than hard minimum-length enforcement; do not treat clearly substantive project descriptions as invalid for being too short or generic.
- Prefer Cursor to open the project in the integrated browser and open automatically on start.
- Prefer local web entrypoint at `http://localhost:7420` in Cursor project settings.
- Prefer concise changes for recurring UX behaviors over pre-emptive client-side gating.

## Learned Workspace Facts

- `.cursor/settings.json` is used for project browser behavior (`cursorProject`) including `openMode`, `autoOpenOnStart`, and `defaultUrl`.
- Workspace has a GitHub MCP configuration in `.cursor/mcp.json` using `bunx` and `@modelcontextprotocol/server-github` with token env var.
- Local MCP plugin metadata indicates a configured tldraw integration under `.cursor/projects/Users-livio-Documents-ship-fast/mcps/plugin-tldraw-tldraw`.
- The app has recurring runtime behavior around preview hot-reload events (`preview_reload`, `client_reload`) and websocket-driven dashboard updates.
- Session and homepage flows have repeatedly aimed to avoid iframe-embedding the homepage behind a session; prefer URL or view-state changes without iframes where possible.

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **ship-fast** (8799 symbols, 16030 relationships, 300 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

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
