---
name: ship-fast
description: "Fast full-stack code generation: spec → design system → HTML-first homepage → parallel Groq execution → auto-fix → manual TSX convert. Uses gpt-oss:120b at ~1200 tps. Perceived speed priority: user sees homepage in ~5s. Usage: /ship-fast [what to build or change]"
allowed-tools: Read, Glob, Grep, Write, Edit, Bash, Task, AskUserQuestion, Skill
user-invokable: true
---

# /ship — Spec → Design → Homepage → Tasks → Execute → Fix

Execute all phases sequentially in ONE pass. No confirmation between phases.

**Core principle: PERCEIVED SPEED.** The user must see a rendered homepage within ~5 seconds. Everything else happens behind the scenes.

**No Chrome MCP during execution.** Never use browser DevTools tools during the pipeline. Open pages via `open` or `webbrowser` only.

## Architecture: HTML-First

1. **No scaffold task** — no `create-next-app`, no Node/Bun project setup during generation
2. **Pure HTML/CSS with Tailwind CDN** — generates `.html` files served via simple local server
3. **Homepage is Task 1** — generated and served immediately, user sees result in ~5s
4. **All other tasks run in parallel** — frontend pages + backend templates via Groq
5. **Manual conversion later** — user triggers `/ship-fast convert` to transform HTML → Next.js + TSX

## Timing (MANDATORY)

Persist timestamps across Bash calls via temp files. Log to console AND `~/.ship.log`.

```bash
date +%s > /tmp/ship-ts-start.txt
echo "--- /ship started at $(date '+%Y-%m-%d %H:%M:%S') ---" | tee -a ~/.ship.log
```

---

## Pre-Phase: Existing Project Detection

**When `/ship-fast` is called with no arguments**, before starting any phase, check if the current directory already contains artifacts from a previous run (`spec.md`, `tasks.json`, `src/`, `index.html`, `design-system/`, etc.).

If existing artifacts are detected, use **AskUserQuestion** with 3 options:

1. **"Continue"** — Pick up where the previous run left off. Determine the appropriate phase based on what already exists:
   - Has `spec.md` + `design-system/MASTER.md` but no `tasks.json` → resume from Phase 2 (homepage)
   - Has `tasks.json` but tasks are incomplete → resume from Phase 3 (execution)
   - Has completed tasks but no fix loop → resume from Phase 4 (fix loop)
   - Everything looks complete → skip to Phase 5 (launch + report)

2. **"Reset"** — Keep `spec.md`, `project-context.json`, `design-system/`, and `references/`, but wipe all implementation code (`index.html`, generated HTML files, `tasks.json`, `tasks-skeleton.json`). Re-execute from Phase 2.

3. **"Reset hard"** — Wipe EVERYTHING in the directory and start completely from scratch. The user provides a new prompt describing what to build.

If the directory is empty or has no recognizable ship-fast artifacts, proceed normally (prompt the user for what to build if no arguments were given).

---

## Phase 1: SPEC + DESIGN (~5s total, parallel)

### Spec (write immediately)
- Write `spec.md` as natural prose, under 200 words
- Write `project-context.json` with structural facts

### Design system (parallel with spec)
Run ui-ux-pro-max skill:
```bash
mkdir -p design-system
python3 ~/.claude/skills/ui-ux-pro-max/.claude/skills/ui-ux-pro-max/scripts/search.py \
  "<description>" --design-system -p "<project-name>" -f markdown --persist --output-dir .
```

**Review and curate** the generated MASTER.md:
- Must match the spec constraints (dark mode, color scheme, etc.)
- Must contain: color tokens, typography, spacing, effects, anti-patterns
- Keep under 50 lines
- If auto-generated doesn't match, Claude Code writes a corrected MASTER.md manually

---

## Phase 2: HOMEPAGE FIRST (~3-5s)

**This is the critical perceived-speed moment.** Generate and serve the homepage HTML BEFORE any task planning.

### Step 1: Generate homepage HTML via Groq

Single Groq call with the spec + design system to generate a complete `index.html`:

```bash
curl -s https://api.groq.com/openai/v1/chat/completions \
  -H "Authorization: Bearer $GROQ_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "openai/gpt-oss-120b",
    "messages": [
      {"role": "system", "content": "You are a frontend code generator. Output ONLY a complete HTML file. Use Tailwind CSS via CDN. The page must be beautiful, polished, and fully responsive. Include animations and micro-interactions via inline CSS/JS. Use Google Fonts via CDN link. No external dependencies beyond Tailwind CDN and Google Fonts."},
      {"role": "user", "content": "Generate a complete index.html for:\n\n<spec.md content>\n\nDesign system:\n<MASTER.md content>\n\nRequirements:\n- Single self-contained HTML file with Tailwind CDN\n- Dark mode using the exact color tokens from the design system\n- Include ALL sections visible in the viewport (header, hero/main content, key interactive elements)\n- Placeholder/mock data for dynamic content\n- Smooth animations (CSS transitions, keyframes)\n- Responsive layout\n- Professional polish — this is what the user sees first\n\nOutput ONLY the HTML. No markdown fences, no explanation."}
    ],
    "temperature": 0.3,
    "max_tokens": 8000
  }' | python3 -c "import sys,json; print(json.load(sys.stdin)['choices'][0]['message']['content'])" > index.html
```

### Step 2: Serve and open immediately

```bash
# Start simple file server
python3 -m http.server 3000 --directory . &
SERVER_PID=$!
echo $SERVER_PID > /tmp/ship-server-pid.txt

# Open in browser
sleep 0.5
open http://localhost:3000
```

The user now sees the homepage. Continue to Phase 3 in the background.

---

## Phase 3: TASKS + EXECUTION (runs while homepage is visible)

### Dashboard with side drawer preview

Launch the executor dashboard. It opens on `localhost:7420` but the user's PRIMARY view is the homepage at `localhost:3000`.

The executor dashboard has a **right-side drawer** that:
- Slides in from the right, **pushing content left** (not overlaying)
- Shows an embedded preview of the homepage (like a computer screen inside the drawer)
- The preview starts **dimmed with an indeterminate loader** on top
- As frontend tasks complete (features visible in viewport), the loader transitions to **determinate** (progress bar)
- When enough features are implemented, the loader disappears
- The bonhommes and teleportation animations continue in the left panel

```bash
SHIP_PROMPT="<user prompt>" \
IRIS_WORKSPACE="<absolute-project-path>" \
python3 ~/.skills/ship-fast/scripts/executor.py &
```

### Task structure

| Task | Role | dependsOn | Type |
|------|------|-----------|------|
| task-1 | Homepage HTML (already done in Phase 2) | [] | DONE |
| task-2..N-1 | Feature pages + components as HTML | [] | CODE GEN |
| backend-1..M | Backend templates (CRUD hooks) | [] | TEMPLATE |
| task-N | Final assembly + verify | [all] | COMMAND |

**Key difference:** No scaffold task. No dependency chains between feature tasks. All tasks run in parallel from wave 1.

### Task planning (Claude Code, ~5s)

Plan 5-12 tasks:
- **Frontend tasks**: One HTML file per page/component. Each is self-contained with Tailwind CDN.
- **Backend tasks**: CRUD templates using the template system (see Backend Templates below).
- All tasks depend only on task-1 (homepage, already DONE).

### Generate action fields via parallel Groq calls

For **frontend tasks**: Groq generates complete HTML files with Tailwind CDN + design system tokens.

**IMPORTANT**: Every Groq prompt includes:
1. The design system (MASTER.md content)
2. The project context
3. Instruction to use Tailwind CDN (`<script src="https://cdn.tailwindcss.com">`) and Google Fonts

For **backend tasks**: Use the template system (see below) — Morph an example template for each entity.

### Assemble tasks.json and execute

Same merge + validation flow as before. Submit to Focus MCP for tracking.

**Auto-wait for executor completion** — poll tasks.json every 10s. Proceed to fix loop when done.

---

## Phase 4: FIX LOOP (Claude Code)

After executor finishes:

1. **Verify all HTML files exist** and contain valid markup
2. **Check for broken references** between pages (links, shared assets)
3. **Validate design consistency** — ensure all pages use the same color tokens from MASTER.md
4. **Dev server verification:**
   ```bash
   kill $(lsof -ti:3000) 2>/dev/null
   python3 -m http.server 3000 --directory . &
   sleep 2
   open http://localhost:3000
   ```

No TypeScript fix loop needed in HTML-first mode. That happens during `/ship-fast convert`.

---

## Phase 5: LAUNCH + REPORT

1. Ensure server is running on `localhost:3000`
2. Open browser to homepage
3. Print timing summary:
   ```bash
   echo "/ship complete"
   echo "──────────────────────────────"
   echo "Spec+Design: ${SPEC_D}s"
   echo "Homepage:    ${HOME_D}s"
   echo "Tasks:       ${TASKS_D}s"
   echo "Execute:     ${RUN_D}s"
   echo "Total:       ${TOTAL_D}s"
   echo "──────────────────────────────"
   ```

---

## Backend Templates (CRUD Template System)

Since backend patterns repeat, we use a **template + morph** approach:

### Base template (one-time generation)

Claude Code generates ONE complete CRUD example for a reference entity (e.g., "User"):
- `hooks/useUsers.ts` — Custom hook using React Query + Convex
- `hooks/useUserForm.ts` — React Hook Form hook with Zod validation
- `components/UserForm.tsx` — Form component using the hook
- `components/UserList.tsx` — List component with the query hook
- `lib/convex/users.ts` — Convex functions (query, mutation)

### Morph for each entity

For each additional entity (e.g., "Product", "Order"), Groq morphs the template:
- Replace entity name, fields, validation rules
- Adjust Convex schema and functions
- Keep the same patterns (React Hook Form + React Query + Convex)

This is **much faster** than generating from scratch because:
- Groq just does find-and-replace + field adaptation
- Pattern is already proven correct
- Fewer tokens needed per entity

### Template storage

Templates live in `references/templates/`:
- `references/templates/crud-hook.ts.template` — React Query + Convex hook
- `references/templates/crud-form-hook.ts.template` — React Hook Form hook
- `references/templates/crud-form.tsx.template` — Form component
- `references/templates/crud-list.tsx.template` — List component
- `references/templates/convex-functions.ts.template` — Convex query/mutation

---

## /ship-fast convert — HTML → Next.js + TSX

**Manual trigger.** User runs `/ship-fast convert` when ready to switch to the real framework.

### What it does:

1. **Scaffold Next.js** (using the standard task-1 template from `references/task-templates.md`)
2. **Convert each HTML file to TSX:**
   - Extract the HTML body content
   - Wrap in a React component
   - Convert class → className, for → htmlFor, etc.
   - Move inline styles to Tailwind classes where possible
   - Add 'use client' only where genuinely needed (event handlers, hooks)
   - Import from `@/components/` for shared elements
3. **Move design tokens** from Tailwind CDN config to `globals.css` with `@theme`
4. **Install dependencies** — `bun add lucide-react framer-motion` etc.
5. **Run TypeScript fix loop:**
   ```bash
   python3 ~/.skills/ship-fast/scripts/tsc-fix-loop.py .
   ```
6. **Verify dev server** starts clean
7. **Report** conversion results

### Conversion is a Groq task

Each HTML file → TSX conversion is a Groq call:
```
Convert this HTML page to a Next.js TSX component:
- Use React 19 patterns
- Import from @/components/ for shared UI
- Add 'use client' ONLY if needed
- Use the design system tokens from globals.css (not inline colors)
- Keep all Tailwind classes
- Convert HTML attributes to JSX (className, htmlFor, etc.)
```

---

## Rules

- No confirmation between phases (unless prompt is too vague)
- No docs/tests/README unless asked
- **No Chrome MCP during execution** — don't slow down with browser DevTools
- **HTML-first**: Generate pure HTML/CSS served via simple server
- Homepage generated and visible within ~5s
- All feature tasks run in parallel (no dependency chains beyond task-1)
- Design system from MASTER.md used in all Groq prompts
- Backend uses template + morph pattern (React Hook Form + React Query + Convex)
- **SSR-first after conversion**: When converting to Next.js, prefer server components. `'use client'` only where truly needed.

## Metrics (CRITICAL)

- **TPS**: Display output tokens/second for every Groq call
- **Per-step timing**: Each phase logs wall-clock duration
- **Homepage time-to-render**: Measure from /ship start to browser open
- **Final summary**: spec time, homepage time, task creation time, execution time, total time, total tokens, aggregate TPS

## Memory System (Self-Improving Error Intelligence)

Same 3-layer system:

**Layer 1: Error Bank** (`~/.claude/skills/ship-fast/memory/errors.json`)
**Layer 2: Patterns** (`~/.claude/skills/ship-fast/memory/patterns.json`)
**Layer 3: Stats** (`~/.claude/skills/ship-fast/memory/stats.json`)

**CLI:** `python3 ~/.claude/skills/ship-fast/scripts/memory.py [status|errors|patterns|compact|extract]`

## Vague prompts

If too vague:
1. Run Phase 1 (explore) first
2. Ask ONE targeted question to clarify scope
3. Resume from Phase 2

---

## /ship-fast reset — Wipe + Re-execute

Kill running processes first, then wipe selectively based on the variant.

```bash
# Always kill processes first
kill $(lsof -ti:7420) 2>/dev/null
kill $(lsof -ti:3000) 2>/dev/null
```

### Variants

| Command | Keeps | Wipes | Resumes from |
|---------|-------|-------|--------------|
| `/ship-fast reset` | spec.md, project-context.json, design-system/, references/, tasks.json | All implementation code (HTML files, src/, generated components) | Phase 3 (re-execute tasks) |
| `/ship-fast reset hard` | Nothing | EVERYTHING — complete clean slate | Phase 1 (user provides new prompt) |
| `/ship-fast reset no spec` | design-system/, references/, tasks.json, project-context.json | spec.md + all implementation code | Phase 1 (re-generate spec, then resume) |
| `/ship-fast reset no tasks` | spec.md, project-context.json, design-system/, references/ | tasks.json, tasks-skeleton.json + all implementation code | Phase 2 (re-plan tasks from spec) |
| `/ship-fast reset no design` | spec.md, project-context.json, references/, tasks.json | design-system/ + all implementation code | Phase 1 design step (re-generate design system, then resume) |

### Default wipe command (`/ship-fast reset`)
```bash
# Keep spec, context, tasks, design-system, references
find . -maxdepth 1 ! -name '.' ! -name 'spec.md' ! -name 'project-context.json' \
  ! -name 'tasks.json' ! -name 'tasks-skeleton.json' ! -name 'design-system' \
  ! -name 'references' ! -name 'ship.log' -exec rm -rf {} +
```

### Hard wipe (`/ship-fast reset hard`)
```bash
# Wipe absolutely everything
find . -maxdepth 1 ! -name '.' -exec rm -rf {} +
```

### Selective wipes
```bash
# reset no spec — also wipe spec.md
find . -maxdepth 1 ! -name '.' ! -name 'project-context.json' \
  ! -name 'tasks.json' ! -name 'tasks-skeleton.json' ! -name 'design-system' \
  ! -name 'references' ! -name 'ship.log' -exec rm -rf {} +

# reset no tasks — also wipe tasks
find . -maxdepth 1 ! -name '.' ! -name 'spec.md' ! -name 'project-context.json' \
  ! -name 'design-system' ! -name 'references' ! -name 'ship.log' -exec rm -rf {} +

# reset no design — also wipe design-system/
find . -maxdepth 1 ! -name '.' ! -name 'spec.md' ! -name 'project-context.json' \
  ! -name 'tasks.json' ! -name 'tasks-skeleton.json' \
  ! -name 'references' ! -name 'ship.log' -exec rm -rf {} +
```
