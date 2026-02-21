---
name: ship-fast
description: "Fully automated full-stack code generation: prompt → spec → design → homepage → tasks → execution. One command does everything."
allowed-tools: Read, Glob, Grep, Write, Edit, Bash, Task, AskUserQuestion, Skill
user-invokable: true
---

# ship-fast — Fully Automated

One command. Everything else happens automatically.

```bash
/ship-fast "build an image generation studio"
/ship-fast                                    # Reuse existing prompt.txt
```

---

## Complete Workflow

### Step 1: Save Prompt & Start Dashboard

```bash
echo "<USER PROMPT>" > prompt.txt
IRIS_WORKSPACE=$(pwd) python3 ~/.skills/ship-fast/scripts/executor.py &
# Opens http://localhost:7420 to monitor progress in real-time
```

**Why executor?** The executor runs a dashboard server that:
- Displays your prompt.txt on startup
- Shows real-time progress as Claude works (spec generation, design system, homepage generation)
- Displays the generated homepage in a split-screen view
- Monitors task execution progress
- Provides visual feedback throughout the entire workflow

### Step 2: Generate spec.md + project-context.json

Post status to dashboard:
```bash
curl -s http://localhost:7420/api/status -X POST -H "Content-Type: application/json" \
  -d '{"message": "Generating spec.md + project-context.json...", "phase": "spec"}'
```

Claude analyzes the prompt and writes intentional specifications:

**spec.md** (~200-300 words, natural prose):
- Project vision & what it does
- Target users & key features
- Pages/sections needed
- Visual mood & atmosphere
- Technical considerations

**project-context.json** (structured metadata):
```json
{
  "project_name": "Image Generation Studio",
  "slug": "image-gen-studio",
  "pages": ["Home", "Editor", "Gallery", "Settings"],
  "entities": ["Image", "Prompt", "Model", "Gallery"],
  "features": ["Text-to-Image", "Batch Processing", "History"],
  "mood": "sleek futuristic / minimalist dark",
  "color_direction": "dark background with cyan & purple accents"
}
```

### Step 3: Generate Design Direction

Claude creates a design brief from the spec:
- Specific color palette reasoning (why these colors match the mood?)
- Typography approach (which fonts, why?)
- Component philosophy (buttons, cards, inputs styling)
- Spacing & layout system
- Visual hierarchy rules

This becomes the **design brief** that guides /ui-ux-pro-max.

### Step 4: Generate Design System

Post status to dashboard:
```bash
curl -s http://localhost:7420/api/status -X POST -H "Content-Type: application/json" \
  -d '{"message": "Generating design system via /ui-ux-pro-max...", "phase": "design_system"}'
```

Call /ui-ux-pro-max to generate design system:

```bash
/ui-ux-pro-max generate design system for [project] with [mood] and [color direction]
```

Creates `design-system/<slug>/MASTER.md` with:
- Color palette (primary, secondary, accents, neutrals with hex codes)
- Typography (font families, sizing scales, weights)
- Component library (buttons, cards, forms, navigation)
- Spacing & sizing tokens
- Shadows, borders, transitions
- Usage examples

### Step 5: Auto-Reconcile Design

Claude reviews the generated design system:
- Verify colors match the design direction intent
- Check typography pairings are cohesive
- Ensure components align with the mood
- Auto-adjust MASTER.md if needed to match the brief
- Approve the final design

This ensures design tokens are exactly what was intended, not just what was generated.

### Step 6: Run ship.py

Once spec, design brief, and design system exist:

```bash
python3 ~/.skills/ship-fast/scripts/ship.py "<PROMPT>"
```

ship.py orchestrates 7 phases:
1. **Setup** — Create workspace directories
2. **Verify** — Confirm spec, context, design exist ✓
3. **Homepage** — Generate HTML via Groq (visible in dashboard ~5s)
4. **Tasks** — Plan features (backend + frontend)
5. **Execute** — Parallel Groq execution (~1200 tps)
6. **Fix** — Auto-fix broken links, missing components
7. **Report** — Timings, output summary, file paths

Dashboard shows real-time progress for steps 3-7.

---

## Reset Variants

```bash
/ship-fast reset              # Keep spec/design/tasks, wipe code
/ship-fast reset-hard         # Wipe everything, start from prompt.txt
/ship-fast reset-no-spec      # Re-generate spec only
/ship-fast reset-no-design    # Re-generate design system only
```

Or direct ship.py:
```bash
python3 ~/.skills/ship-fast/scripts/ship.py --reset
python3 ~/.skills/ship-fast/scripts/ship.py --reset-hard
```

---

## Output Files

- `prompt.txt` — Your original request
- `spec.md` — Auto-generated spec
- `project-context.json` — Auto-generated metadata
- `design-direction.md` — Claude's design brief (internal)
- `design-system/<slug>/MASTER.md` — Auto-generated design tokens
- `index.html` — Generated homepage
- `tasks.json` — Generated task definitions
- `src/` — Generated code (components, utilities, API routes)

---

## Technical Notes

**NEVER use Chrome MCP / DevTools tools** — no `navigate_page`, `take_screenshot`, `take_snapshot`. Homepage is ONLY in the dashboard's split-view at `http://localhost:7420`.

**Architecture:**
- HTML-first: No Node/Bun setup during generation
- Tailwind CDN: Pure CSS, responsive, zero build step
- Parallel execution: All tasks run in parallel via Groq
- Auto-fix: Detects & repairs broken links, missing files
- Manual TSX convert: User runs `/convert` later to transform HTML → Next.js

**Environment:**
- `GROQ_API_KEY` — Required for Groq LLM calls
- `IRIS_WORKSPACE` — Set to $(pwd) when starting executor
- `GROQ_MODEL` — Defaults to `openai/gpt-oss-120b`
