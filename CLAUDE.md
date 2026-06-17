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
2. Prefer source-level structural assertions (read the file and assert invariants) when testing that a feature gate or code path is present/absent
3. Run `bun test` and fix any failures BEFORE claiming the work is done
4. NEVER push without all tests passing

**Test patterns for this project:**

- Use `vitest` with `describe`/`it`/`expect`
- Source-level invariant tests: `readFileSync` the source file and assert structural properties (e.g. "file must not contain env var gate X", "file must contain API call Y")
- Behavioral tests: import the function and test inputs/outputs directly
- Tests live next to the code they cover (`*.test.ts` sibling files)

This rule exists because features keep getting broken by refactors and reimplementations. Unit tests are the permanent guard against regression.

# RTK (Rust Token Killer) - Token-Optimized Commands

## Golden Rule

**Always prefix commands with `rtk`**. If RTK has a dedicated filter, it uses it. If not, it passes through unchanged. This means RTK is always safe to use.

**Important**: Even in command chains with `&&`, use `rtk`:

```bash
# ❌ Wrong
git add . && git commit -m "msg" && git push

# ✅ Correct
rtk git add . && rtk git commit -m "msg" && rtk git push
```

## RTK Commands by Workflow

### Build & Compile (80-90% savings)

```bash
rtk cargo build         # Cargo build output
rtk cargo check         # Cargo check output
rtk cargo clippy        # Clippy warnings grouped by file (80%)
rtk tsc                 # TypeScript errors grouped by file/code (83%)
rtk lint                # ESLint/Biome violations grouped (84%)
rtk prettier --check    # Files needing format only (70%)
rtk next build          # Next.js build with route metrics (87%)
```

### Test (90-99% savings)

```bash
rtk cargo test          # Cargo test failures only (90%)
rtk vitest run          # Vitest failures only (99.5%)
rtk playwright test     # Playwright failures only (94%)
rtk test <cmd>          # Generic test wrapper - failures only
```

### Git (59-80% savings)

```bash
rtk git status          # Compact status
rtk git log             # Compact log (works with all git flags)
rtk git diff            # Compact diff (80%)
rtk git show            # Compact show (80%)
rtk git add             # Ultra-compact confirmations (59%)
rtk git commit          # Ultra-compact confirmations (59%)
rtk git push            # Ultra-compact confirmations
rtk git pull            # Ultra-compact confirmations
rtk git branch          # Compact branch list
rtk git fetch           # Compact fetch
rtk git stash           # Compact stash
rtk git worktree        # Compact worktree
```

Note: Git passthrough works for ALL subcommands, even those not explicitly listed.

### GitHub (26-87% savings)

```bash
rtk gh pr view <num>    # Compact PR view (87%)
rtk gh pr checks        # Compact PR checks (79%)
rtk gh run list         # Compact workflow runs (82%)
rtk gh issue list       # Compact issue list (80%)
rtk gh api              # Compact API responses (26%)
```

### JavaScript/TypeScript Tooling (70-90% savings)

```bash
rtk pnpm list           # Compact dependency tree (70%)
rtk pnpm outdated       # Compact outdated packages (80%)
rtk pnpm install        # Compact install output (90%)
rtk npm run <script>    # Compact npm script output
rtk npx <cmd>           # Compact npx command output
rtk prisma              # Prisma without ASCII art (88%)
```

### Files & Search (60-75% savings)

```bash
rtk ls <path>           # Tree format, compact (65%)
rtk read <file>         # Code reading with filtering (60%)
rtk grep <pattern>      # Search grouped by file (75%)
rtk find <pattern>      # Find grouped by directory (70%)
```

### Analysis & Debug (70-90% savings)

```bash
rtk err <cmd>           # Filter errors only from any command
rtk log <file>          # Deduplicated logs with counts
rtk json <file>         # JSON structure without values
rtk deps                # Dependency overview
rtk env                 # Environment variables compact
rtk summary <cmd>       # Smart summary of command output
rtk diff                # Ultra-compact diffs
```

### Infrastructure (85% savings)

```bash
rtk docker ps           # Compact container list
rtk docker images       # Compact image list
rtk docker logs <c>     # Deduplicated logs
rtk kubectl get         # Compact resource list
rtk kubectl logs        # Deduplicated pod logs
```

### Network (65-70% savings)

```bash
rtk curl <url>          # Compact HTTP responses (70%)
rtk wget <url>          # Compact download output (65%)
```

### Meta Commands

```bash
rtk gain                # View token savings statistics
rtk gain --history      # View command history with savings
rtk discover            # Analyze Claude Code sessions for missed RTK usage
rtk proxy <cmd>         # Run command without filtering (for debugging)
rtk init                # Add RTK instructions to CLAUDE.md
rtk init --global       # Add RTK to ~/.claude/CLAUDE.md
```

## Token Savings Overview

| Category         | Commands                       | Typical Savings |
| ---------------- | ------------------------------ | --------------- |
| Tests            | vitest, playwright, cargo test | 90-99%          |
| Build            | next, tsc, lint, prettier      | 70-87%          |
| Git              | status, log, diff, add, commit | 59-80%          |
| GitHub           | gh pr, gh run, gh issue        | 26-87%          |
| Package Managers | pnpm, npm, npx                 | 70-90%          |
| Files            | ls, read, grep, find           | 60-75%          |
| Infrastructure   | docker, kubectl                | 85%             |
| Network          | curl, wget                     | 65-70%          |

Overall average: **60-90% token reduction** on common development operations.

## Production (Ship Fast)

- **Live site:** [https://ship-fast.io/](https://ship-fast.io/)
- **Hosting:** [Coolify](https://coolify.io) on `159.195.70.194`
- **Operations:** Deployments and services are managed via the [Coolify CLI](https://coolify.io/docs/installation); configure the CLI against that Coolify instance per upstream docs.

## Environment

- Secrets and environment files are managed with Doppler. Run env-dependent commands through `doppler run -- <cmd>` and do not assume `.env.local` contains current model/API keys.
- Do not commit generated env files; update Doppler-managed configuration instead.

## Homepage engine (playground vs production)

| Path                                                       | Role                                                                 |
| ---------------------------------------------------------- | -------------------------------------------------------------------- |
| `playground-engine-ui-ship/`                               | Unified homepage compiler (router, planner, composers, audits)       |
| `packages/ship-fast-engine/src/pipeline/phase-homepage.js` | Production entry — `groqHomepage` path and hybrid fallback path only |
| `.forge/ship-native/`                                      | Local generation artifacts                                           |
| `.forge/ship-gallery/` + port **7420**                     | Desktop screenshot grid for bench runs                               |

Gallery workflow:

```bash
bun playground-engine-ui-ship/scripts/ship-native.mjs
bun playground-engine-ui-ship/scripts/ship-gallery-build.mjs --skip-shots
bun .forge/ship-gallery/serve.mjs   # http://localhost:7420/
```

Single-brief preview: add `--run=<runId>` to the gallery build step.

### Design rule: generic engine, not infinite special cases

Users can request any kind of website; we **cannot** maintain hardcoded rules per vertical, slug, or demo brief. Engine changes must be **global**:

- Infer **site kind** and **page grammar** from the prompt (blog, ecommerce, SaaS, portfolio, ops console, …).
- Encode layout expectations in **shared contracts** and **audits** (structure and density), not in lists of known projects.
- Use **structural repair** when stitch/LLM drops a required band (e.g. archive grid on publication homes)—keyed on site kind + missing pattern, not on `"blog-dogs"` or `"Paws & Tales"`.
- Keep named stress briefs (`blog-dogs`, canonical 8 verticals) in **scripts/tests/gallery only**; production logic must generalize.

**Do not** add: per-slug conditionals, fixed copy for one customer story, or “if brief mentions dogs” branches in core engine code. **Do** add: routers, grammars, planners, and validators that scale to unseen inputs.

### Deprecated Engines (No Longer Used)

The following code generation engines are deprecated and no longer used:

- `playground-engine-ui-ship` (legacy UI compiler) — use the unified pipeline instead
- All legacy per-vertical engines — consolidated into `groqHomepage` in production

**Rendering Safety (Critical Fix)**

- Fixed: “Cannot read properties of null” errors in `.map()` operations when streaming incomplete OpenUI responses
- Added defensive null filtering: `.filter(Boolean)` before all array iterations
- Added optional chaining (`?.`) for property access on potentially null items
- Improved `stripNullsFromArrays()` preprocessing to remove incomplete Image() calls
- Updated both React and Next.js renderers in `packages/ship-fast-engine/src/renderers/`

<!-- gitnexus:start -->

# GitNexus — Code Intelligence

This project is indexed by GitNexus as **ship-fast** (54331 symbols, 91667 relationships, 300 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

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

<!-- MACP-MCP:START -->

## MACP Coordination

MACP is active for this project. The shared project id is `ship-fast`. The MCP server auto-registers this session on startup and auto-joins the default channel `ship-fast`.

Normal workflow:

- do not run SQL directly
- do not manually attach another MACP server inside the agent loop
- call `macp_poll` regularly to stay aware of peer work
- call `macp_send_channel` for shared updates and `macp_send_direct` for one-to-one requests
- call `macp_ack` after acting on a delivery
- use `macp_ext_claim_files`, shared memory, tasks, goals, and vault tools when this project requires them

If this project uses shared memory, tasks, goals, or the vault, follow the local instructions in this file and use those tools as part of normal work.

<!-- MACP-MCP:END -->

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
