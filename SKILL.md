---
name: ship-fast
description: "Fast full-stack code generation: spec → design system → HTML-first homepage → parallel Groq execution → auto-fix → manual TSX convert. Uses gpt-oss:120b at ~1200 tps. Perceived speed priority: user sees homepage in ~5s. Usage: /ship-fast [what to build or change]"
allowed-tools: Read, Glob, Grep, Write, Edit, Bash, Task, AskUserQuestion, Skill
user-invokable: true
---

# ship-fast Workflow

**NEVER use Chrome MCP / DevTools tools during the entire pipeline.** No `navigate_page`, no `take_screenshot`, no `take_snapshot`. Never open `localhost:3000` in a browser — the homepage is ONLY shown inside the dashboard's split view at `localhost:7420`. This OVERRIDES the global CLAUDE.md rule about opening localhost in the browser after starting a server.

## ⚠️ IMPORTANT: Manual Steps BEFORE Running ship.py

The `/ship-fast` commands below **only run the Python orchestrator**. You must complete these steps MANUALLY first:

### Step 1: Save prompt.txt & open dashboard

```bash
echo "<user prompt>" > prompt.txt

# Start executor with workspace set to current directory
IRIS_WORKSPACE=$(pwd) python3 ~/.skills/ship-fast/scripts/executor.py &
```

Then open browser: `http://localhost:7420`

The dashboard will display your prompt.txt and be ready for steps 2-4.

### Step 2: Write spec + context (Claude ONLY)

**YOU must write these files — ship.py will NOT generate them:**

**spec.md** (natural prose, ~200 words):
```
# [Project Name]

[Description of product, pages, visual direction, mood, interactions]

**Visual Direction:** [Colors, atmosphere, design approach]
**Key Pages:** [List of main pages/sections]
```

**project-context.json**:
```json
{
  "project_name": "...",
  "slug": "kebab-case-name",
  "pages": ["Home", "Page2", ...],
  "entities": ["Entity1", "Entity2", ...],
  "features": ["feature 1", "feature 2", ...],
  "mood": "sleek futuristic / warm minimal / etc",
  "color_direction": "dark background with cyan accents / etc"
}
```

### Step 3: Generate design system (Claude + /ui-ux-pro-max)

```bash
/ui-ux-pro-max [mood, color_direction, project details]
```

Post progress to dashboard:
```bash
curl -s http://localhost:7420/api/status -X POST -H "Content-Type: application/json" \
  -d '{"message": "Generating design system...", "phase": "design"}'
```

### Step 4: Review & curate design system (Claude ONLY)

Edit `design-system/<slug>/MASTER.md` to align colors/fonts/spacing with your spec intent.

Post completion:
```bash
curl -s http://localhost:7420/api/status -X POST -H "Content-Type: application/json" \
  -d '{"message": "Design system review complete", "phase": "design_review"}'
```

---

## Then Run ship.py

**After completing steps 1-4 above**, ship.py handles the rest:

```bash
python3 ~/.skills/ship-fast/scripts/ship.py "<user prompt>"
```

### What ship.py does:
1. Verify spec.md, project-context.json, design-system/<slug>/MASTER.md exist (hard requirement)
2. Generate homepage HTML via Groq
3. Plan & execute tasks in parallel
4. Fix broken links, verify output, report timings

### Auto-continue (no args):
```bash
python3 ~/.skills/ship-fast/scripts/ship.py
```
Detects existing artifacts and resumes from the right phase.

### Reset variants (shorthands):

**`/ship-fast reset-hard`** — Manual sequence (run these commands):
```bash
# 1. Wipe everything except prompt.txt
python3 ~/.skills/ship-fast/scripts/ship.py --reset-hard

# 2. Start executor/dashboard with workspace set
IRIS_WORKSPACE=$(pwd) python3 ~/.skills/ship-fast/scripts/executor.py &

# 3. Open dashboard in browser
# http://localhost:7420
```
Dashboard will show your prompt.txt. Ready for steps 2-4 (write spec, generate design, review)

Other reset variants:
```bash
/ship-fast reset              # Keep spec/design/tasks, wipe code
/ship-fast reset-no-home      # Re-generate homepage
/ship-fast reset-no-tasks     # Re-plan tasks
```

Or run directly:
```bash
python3 ~/.skills/ship-fast/scripts/ship.py --reset
python3 ~/.skills/ship-fast/scripts/ship.py --reset-hard
python3 ~/.skills/ship-fast/scripts/ship.py --reset-no-home
python3 ~/.skills/ship-fast/scripts/ship.py --reset-no-tasks
```

---

## How It Works

The orchestrator runs 7 phases automatically:
0. Save prompt → kill stale ports → launch executor dashboard
1. Verify spec + design system exist (hard requirement — errors if missing)
2. Generate homepage HTML via Groq (uses design system + spec)
3. Task skeleton + parallel frontend Groq calls
4. Wait for executor completion
5. Verify HTML files, check broken links
6. Print timing report

## Dependencies

- **Groq API key** (`GROQ_API_KEY` env var) — for Groq calls
- **`/ui-ux-pro-max` skill** — for design system generation (Step 3 only)
- **executor.py running** at `:7420` — for dashboard
