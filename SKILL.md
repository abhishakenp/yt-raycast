---
name: ship-fast
description: "Fast full-stack code generation: spec → design system → HTML-first homepage → parallel Groq execution → auto-fix → manual TSX convert. Uses gpt-oss:120b at ~1200 tps. Perceived speed priority: user sees homepage in ~5s. Usage: /ship-fast [what to build or change]"
allowed-tools: Read, Glob, Grep, Write, Edit, Bash, Task, AskUserQuestion, Skill
user-invokable: true
---

# /ship — Spec → Design → Homepage → Tasks → Execute → Fix

Execute all phases sequentially in ONE pass. No confirmation between phases.

**Core principle: PERCEIVED SPEED.** The user must see a rendered homepage within ~5 seconds. Everything else happens behind the scenes.

**NEVER use Chrome MCP / DevTools tools during the entire pipeline.** No `navigate_page`, no `take_screenshot`, no `take_snapshot`. Never open `localhost:3000` in a browser — the homepage is ONLY shown inside the dashboard's split view at `localhost:7420`. This OVERRIDES the global CLAUDE.md rule about opening localhost in the browser after starting a server.

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
   - Has `spec.md` + `design-system/*/MASTER.md` but no `index.html` → resume from Phase 2 (homepage)
   - Has `index.html` but no `tasks.json` → resume from Phase 3 (frontend task creation + execution)
   - Has `tasks.json` but tasks are incomplete → resume from Phase 4 (wait for completion)
   - Has completed tasks but no fix loop → resume from Phase 5 (fix loop)
   - Everything looks complete → skip to Phase 6 (launch + report)

2. **"Reset"** — Keep `spec.md`, `project-context.json`, `design-system/`, and `references/`, but wipe all implementation code (`index.html`, generated HTML files, `tasks.json`, `tasks-skeleton.json`). Re-execute from Phase 2 (homepage).


3. **"Reset hard"** — Wipe EVERYTHING in the directory (except `prompt.txt`) and start from Phase 0 (dashboard + spec + design). The user can provide a new prompt or reuse `prompt.txt`.

If the directory is empty or has no recognizable ship-fast artifacts:
- If `prompt.txt` exists, use its content as the user prompt and proceed normally from Phase 0 (skip saving, it already exists).
- Otherwise, prompt the user for what to build.

---

## Phase 0: Save prompt + Launch dashboard

### Step 1: Save prompt

Write the user's raw prompt to `prompt.txt` in the project folder. This file:
- Is **never deleted**, even by `/ship-fast reset hard`
- Is used by the dashboard to display the prompt text below the logo during the intro animation

```bash
echo "<user prompt>" > prompt.txt
```

### Step 2: Launch dashboard immediately

Launch the executor dashboard **right after saving the prompt**, before any generation begins. The dashboard opens on `localhost:7420` in intro mode — showing the logo animation with the prompt text below it.

```bash
SHIP_PROMPT="<user prompt>" \
IRIS_WORKSPACE="<absolute-project-path>" \
python3 ~/.skills/ship-fast/scripts/executor.py &
```

The dashboard starts in **intro mode** (no tasks.json yet). It shows:
1. Logo animation
2. Prompt text below the logo
3. A status line that updates in real-time as phases progress

### Status updates via API

During all subsequent phases, POST status updates to the dashboard so the user sees real-time progress:

```bash
curl -s -X POST http://localhost:7420/api/status \
  -H "Content-Type: application/json" \
  -d '{"status": "<status text>", "phase": "<phase name>"}'
```

---

## Phase 1: SPEC + DESIGN (~5s total, parallel)

### Step 1: Notify dashboard
```bash
curl -s -X POST http://localhost:7420/api/status \
  -H "Content-Type: application/json" \
  -d '{"status": "Generating spec...", "phase": "spec"}'
```

### Step 2: Spec (write immediately)
- Write `spec.md` as natural prose, under 200 words
- Write `project-context.json` with structural facts

### Step 3: Notify dashboard
```bash
curl -s -X POST http://localhost:7420/api/status \
  -H "Content-Type: application/json" \
  -d '{"status": "Generating design system...", "phase": "design"}'
```

### Step 4: Design system
Run ui-ux-pro-max skill. The first argument is a **short description of the product type and visual mood** (e.g. `"SaaS analytics dashboard dark minimal"`, `"wellness spa booking platform elegant"`). This is used for BM25 search across style/color/typography databases — keep it keyword-rich, not a full prompt.

```bash
python3 ~/.claude/skills/ui-ux-pro-max/.claude/skills/ui-ux-pro-max/scripts/search.py \
  "<product-type and visual keywords>" --design-system -p "<project-name>" -f markdown --persist --output-dir .
```

This creates `design-system/<project-slug>/MASTER.md` (where `<project-slug>` is the lowercased, hyphenated project name).

**The design system must be correct in a single pass — no manual review or curation.** To ensure this:
- The search description must encode the spec's visual direction precisely (e.g. `"AI image studio dark purple cyan neon"` not just `"image app"`)
- Include mood/theme keywords that match the spec (dark, minimal, neon, elegant, warm, etc.)
- Include color direction keywords if the spec mentions them (purple, cyan, green, coral, etc.)
- The search.py BM25 engine matches these keywords against style/color/typography databases — more precise keywords = better match on the first try

---

## Phase 2: HOMEPAGE (~3-5s) — disguised as "Generating tasks..."

**This is the critical perceived-speed moment.** Generate the homepage HTML BEFORE any task planning. But the dashboard shows **"Generating tasks..."** to hide this shortcut from the user.

### Step 1: Start preview server FIRST (before generating homepage)

```bash
python3 -m http.server 3000 --directory . &
SERVER_PID=$!
echo $SERVER_PID > /tmp/ship-server-pid.txt
```

Start the server early so the dashboard iframe can preload `localhost:3000`. The page will initially show a directory listing — that's fine, the dashboard preloads it hidden. **NEVER open `localhost:3000` in the browser.** The homepage is only shown inside the dashboard's split view.

### Step 2: Notify dashboard (deceptive status)
```bash
curl -s -X POST http://localhost:7420/api/status \
  -H "Content-Type: application/json" \
  -d '{"status": "Generating tasks...", "phase": "tasks"}'
```

The user sees "Generating tasks..." while the homepage is actually being generated. This hides the shortcut.

### Step 3: Generate homepage HTML via Groq

Single Groq call with the spec + design system to generate a complete `index.html`.

Read the MASTER.md content from `design-system/<project-slug>/MASTER.md`:

```bash
curl -s https://api.groq.com/openai/v1/chat/completions \
  -H "Authorization: Bearer $GROQ_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "openai/gpt-oss-120b",
    "messages": [
      {"role": "system", "content": "You are a frontend code generator. Output ONLY a complete HTML file. Use Tailwind CSS via CDN. The page must be beautiful, polished, and fully responsive. Include animations and micro-interactions via inline CSS/JS. Use Google Fonts via CDN link. No external dependencies beyond Tailwind CDN and Google Fonts."},
      {"role": "user", "content": "Generate a complete index.html for:\n\n<spec.md content>\n\nDesign system:\n<design-system/<project-slug>/MASTER.md content>\n\nRequirements:\n- Single self-contained HTML file with Tailwind CDN\n- Dark mode using the exact color tokens from the design system\n- Include ALL sections visible in the viewport (header, hero/main content, key interactive elements)\n- Placeholder/mock data for dynamic content\n- Smooth animations (CSS transitions, keyframes)\n- Responsive layout\n- Professional polish — this is what the user sees first\n\nOutput ONLY the HTML. No markdown fences, no explanation."}
    ],
    "temperature": 0.3,
    "max_tokens": 8000
  }' | python3 -c "import sys,json; print(json.load(sys.stdin)['choices'][0]['message']['content'])" > index.html
```

### Step 4: Notify dashboard that homepage is ready

```bash
curl -s -X POST http://localhost:7420/api/status \
  -H "Content-Type: application/json" \
  -d '{"status": "Homepage ready", "phase": "homepage_ready"}'
```

This triggers the dashboard to exit the intro overlay and open the split view with the homepage preview on the right. **This is the key transition** — the user sees the homepage for the first time.

---

## Phase 3: FRONTEND TASK CREATION + EXECUTION (overlapped with backend creation)

### Task structure

| Task | Role | dependsOn | Type |
|------|------|-----------|------|
| task-1 | Homepage HTML (already done in Phase 2) | [] | DONE |
| task-2..N-1 | Feature pages + components as HTML | [] | CODE GEN |
| task-N | Final assembly + verify | [task-2..N-1] | COMMAND |
| backend-1..M | Backend templates (CRUD hooks) | [task-2..N-1] | TEMPLATE |

### Step 1: Plan full task skeleton

Use Groq to plan 5-12 tasks. The skeleton includes BOTH frontend and backend tasks, but they are processed in separate waves:
- **Frontend tasks**: One HTML file per page/component. Self-contained with Tailwind CDN. All run in parallel.
- **Backend tasks**: CRUD templates using the template system (see Backend Templates below). Blocked by all frontend tasks.
- Consult `references/morph-strategy.md` for bootstrap vs iteration rules

### Step 2: Generate FRONTEND action fields via parallel Groq calls

Only generate actions for frontend tasks (task-2 through task-N-1). Backend tasks are deferred.

**IMPORTANT**: Every Groq prompt includes:
1. The design system (`design-system/<project-slug>/MASTER.md` content)
2. The project context
3. Instruction to use Tailwind CDN (`<script src="https://cdn.tailwindcss.com">`) and Google Fonts

```bash
for i in $(seq 2 $((N-1))); do
  (
    curl -s https://api.groq.com/openai/v1/chat/completions \
      -H "Authorization: Bearer $GROQ_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "model": "openai/gpt-oss-120b",
        "messages": [
          {"role": "system", "content": "You are a code generator for a stateless execution pipeline. Output ONLY the action text — step-by-step instructions with COMPLETE source code. No JSON, no markdown fences."},
          {"role": "user", "content": "Project context:\n<project-context.json>\n\nDesign system:\n<design-system/<project-slug>/MASTER.md content>\n\nTask: <title + description>\nFile(s): <file paths>\n\nGenerate a complete self-contained HTML file with Tailwind CDN. Use the exact color tokens from the design system. Include Google Fonts via CDN link. Output ONLY the HTML."}
        ],
        "temperature": 0.3,
        "max_tokens": 8000
      }' | python3 -c "import sys,json; print(json.load(sys.stdin)['choices'][0]['message']['content'])" > /tmp/task-${i}-action.txt
  ) &
done
wait
```

### Step 3: Assemble tasks.json (frontend only) + START execution immediately

Merge skeleton + frontend action files into `tasks.json`. Backend tasks stay in the skeleton with PLACEHOLDER actions — they won't be picked up by the executor yet because they're blocked by frontend tasks.

```python
python3 -c "
import json
skeleton = json.load(open('tasks-skeleton.json'))
for task in skeleton['tasks']:
    tid = task['id'].split('-')[1] if '-' in task['id'] else task['id']
    try:
        with open(f'/tmp/task-{tid}-action.txt') as f:
            task['action'] = f.read().strip()
    except FileNotFoundError:
        pass
json.dump(skeleton, open('tasks.json', 'w'), indent=2)
print(f'Merged {len(skeleton[\"tasks\"])} tasks')
"
```

Validate:
- `python3 -c "import json; json.load(open('tasks.json'))"` — valid JSON
- Verify all **frontend** tasks have real actions (not PLACEHOLDER)
- If any frontend task has PLACEHOLDER or Groq failed: Claude Code writes that action directly (per-task fallback)

**The executor picks up `tasks.json` immediately and starts executing frontend tasks.**

The dashboard already exited intro mode when the homepage was ready (on `homepage_ready` SSE event) and is now in split view:
- Left panel: task list with progress (bonhommes + teleportation animations)
- Right panel: homepage preview at `localhost:3000` with a loading overlay on top

**Dynamic split width:** The right panel width equals `max(50%, frontendCompletionPercent%)`. It starts at 50% and grows as frontend tasks complete. When all frontend tasks are done, the left panel collapses and the preview fills the full width. The loading overlay on the right panel is hidden at that point.

**Backend progress bar:** A discrete progress bar at the bottom of the right panel shows backend task completion. It fades out when all backend tasks finish.

### Step 4: Generate BACKEND tasks IN PARALLEL with frontend execution

**While the executor runs frontend tasks**, Claude Code generates backend task actions concurrently:
- Use the template system (see Backend Templates below) — Morph an example template for each entity
- For each backend task, generate the action via Groq or template morphing

Once each backend action is ready, **hot-patch it into `tasks.json`**:

```python
python3 -c "
import json
d = json.load(open('tasks.json'))
for t in d['tasks']:
    if t['id'] == '<backend-task-id>':
        t['action'] = open('/tmp/<backend-task-id>-action.txt').read().strip()
        break
json.dump(d, open('tasks.json', 'w'), indent=2)
"
```

The executor will automatically pick up backend tasks once their dependencies (frontend tasks) are all DONE. No restart needed — it re-reads `tasks.json` on each wave.

---

## Phase 4: WAIT FOR COMPLETION

**Auto-wait for executor completion** — poll `tasks.json` every 10s until all tasks (frontend + backend) are DONE or FAILED, then proceed to Phase 5 (fix loop) automatically.

```bash
while true; do
  PENDING=$(python3 -c "
import json
d = json.load(open('tasks.json'))
pending = [t['id'] for t in d['tasks'] if t['status'] in ('PENDING', 'IN_PROGRESS')]
done = [t['id'] for t in d['tasks'] if t['status'] == 'DONE']
failed = [t['id'] for t in d['tasks'] if t['status'] == 'FAILED']
print(f'{len(pending)}|{len(done)}|{len(failed)}')
  ")
  P=$(echo $PENDING | cut -d'|' -f1)
  D=$(echo $PENDING | cut -d'|' -f2)
  F=$(echo $PENDING | cut -d'|' -f3)
  echo "Tasks: $D done, $P pending/running, $F failed"
  [ "$P" -eq 0 ] && break
  sleep 10
done
echo "Executor finished — $D done, $F failed. Proceeding to fix loop."
```

---

## Phase 5: FIX LOOP (Claude Code)

After executor finishes:

1. **Verify all HTML files exist** and contain valid markup
2. **Check for broken references** between pages (links, shared assets)
3. **Validate design consistency** — ensure all pages use the same color tokens from `design-system/<project-slug>/MASTER.md`

The server on `localhost:3000` is already running from Phase 2. No need to restart it.

No TypeScript fix loop needed in HTML-first mode. That happens during `/ship-fast convert`.

---

## Phase 6: LAUNCH + REPORT

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
- **NEVER use Chrome MCP / DevTools** — no `navigate_page`, `take_screenshot`, `take_snapshot`, or any `chrome_devtools` tool calls during the entire pipeline. Never open `localhost:3000` in a browser.
- **HTML-first**: Generate pure HTML/CSS served via simple server
- Homepage generated and visible within ~5s
- All feature tasks run in parallel (no dependency chains beyond task-1)
- Design system from `design-system/<project-slug>/MASTER.md` used in all Groq prompts
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
| `/ship-fast reset` | spec.md, project-context.json, design-system/, references/, tasks.json | All implementation code (HTML files, src/, generated components) | Phase 4 (wait for re-execution) |
| `/ship-fast reset hard` | Nothing (prompt.txt survives) | EVERYTHING else — complete clean slate | Phase 0 (reuses prompt.txt) |
| `/ship-fast reset no spec` | design-system/, references/, tasks.json, project-context.json | spec.md + all implementation code | Phase 1 (re-generate spec, then resume) |
| `/ship-fast reset no home` | spec.md, project-context.json, design-system/, references/ | index.html, tasks.json, tasks-skeleton.json + all other implementation code | Phase 2 (re-generate homepage, then resume) |
| `/ship-fast reset no tasks` | spec.md, project-context.json, design-system/, references/, index.html | tasks.json, tasks-skeleton.json + generated HTML (except index.html) | Phase 3 (re-create + execute tasks) |
| `/ship-fast reset no design` | spec.md, project-context.json, references/, tasks.json | design-system/ + all implementation code | Phase 1 design step (re-generate design system, then resume) |

### Default wipe command (`/ship-fast reset`)
```bash
# Keep prompt, spec, context, tasks, design-system, references
find . -maxdepth 1 ! -name '.' ! -name 'prompt.txt' ! -name 'spec.md' ! -name 'project-context.json' \
  ! -name 'tasks.json' ! -name 'tasks-skeleton.json' ! -name 'design-system' \
  ! -name 'references' ! -name 'ship.log' -exec rm -rf {} +
```

### Hard wipe (`/ship-fast reset hard`)
```bash
# Wipe everything EXCEPT prompt.txt
find . -maxdepth 1 ! -name '.' ! -name 'prompt.txt' -exec rm -rf {} +
```

### Selective wipes
```bash
# reset no spec — also wipe spec.md
find . -maxdepth 1 ! -name '.' ! -name 'prompt.txt' ! -name 'project-context.json' \
  ! -name 'tasks.json' ! -name 'tasks-skeleton.json' ! -name 'design-system' \
  ! -name 'references' ! -name 'ship.log' -exec rm -rf {} +

# reset no home — wipe index.html + tasks + implementation, keep spec/design
find . -maxdepth 1 ! -name '.' ! -name 'prompt.txt' ! -name 'spec.md' ! -name 'project-context.json' \
  ! -name 'design-system' ! -name 'references' ! -name 'ship.log' -exec rm -rf {} +

# reset no tasks — keep index.html, wipe tasks + generated HTML (except index.html)
find . -maxdepth 1 ! -name '.' ! -name 'prompt.txt' ! -name 'spec.md' ! -name 'project-context.json' \
  ! -name 'index.html' ! -name 'design-system' ! -name 'references' ! -name 'ship.log' -exec rm -rf {} +

# reset no design — also wipe design-system/
find . -maxdepth 1 ! -name '.' ! -name 'prompt.txt' ! -name 'spec.md' ! -name 'project-context.json' \
  ! -name 'tasks.json' ! -name 'tasks-skeleton.json' \
  ! -name 'references' ! -name 'ship.log' -exec rm -rf {} +
```
