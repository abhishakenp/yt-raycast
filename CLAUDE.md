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

## Golden rule: local fixes first

- If something can be fixed at the block or component level itself, do not touch other files.
- For the LLM, this is like generating the data to fill up the form: if something is wrong, 90% of the time it is the system's fault, not the block's.
- To verify a fix, do not regenerate by default. Fix the blocks, reload, and confirm the result.
- Treat this as a standing golden rule. Do not wait for the same instruction to be repeated.

## Homepage engine (playground vs production)

| Path | Role |
|------|------|
| `playground-engine-ui-ship/` | Unified homepage compiler (router, planner, composers, audits) |
| `packages/ship-fast-engine/src/pipeline/phase-homepage.js` | Production entry — `groqHomepage` path and hybrid fallback path only |
| `.forge/ship-native/` | Local generation artifacts |
| `.forge/ship-gallery/` + port **7420** | Desktop screenshot grid for bench runs |

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

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **ship-fast** (16276 symbols, 27905 relationships, 300 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

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
