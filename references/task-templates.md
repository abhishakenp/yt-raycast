# Task Templates (Deterministic Scripts)

## task-1: Scaffold Script (COMMAND task — executed directly, NOT sent to LLM)

```bash
set -e
echo "[task-1] START: scaffold" >> ship.log

# Scaffold in temp subfolder (avoids "directory not empty" error)
bunx create-next-app@latest scaffold-tmp \
  --typescript --tailwind --eslint --app --src-dir \
  --import-alias "@/*" --use-bun --no-react-compiler 2>&1

# Delete node_modules before moving (moving is slow/error-prone)
rm -rf scaffold-tmp/node_modules

# Move scaffolded files to current dir
cp -a scaffold-tmp/. . 2>/dev/null || true
rm -rf scaffold-tmp

# Install deps + Tailwind v4 PostCSS plugin
bun add -d @tailwindcss/postcss@latest 2>&1
bun i 2>&1

# Tailwind v4 post-scaffold fixes
rm -f tailwind.config.js tailwind.config.ts

cat > postcss.config.mjs << 'PCEOF'
const config = { plugins: { "@tailwindcss/postcss": {} } };
export default config;
PCEOF

cat > src/app/globals.css << 'CSSEOF'
@import "tailwindcss";
html, body { height: 100%; }
body { background-color: #030712; color: #e2e8f0; }
CSSEOF

# Create standard directories
mkdir -p src/types src/lib src/components

echo "[task-1] DONE" >> ship.log
```

### Rules for task-1
- Temp folder name MUST NOT start with a dot (npm rejects it)
- ALWAYS pass `--no-react-compiler` (prevents interactive prompt hang)
- ALWAYS install `@tailwindcss/postcss` as devDependency
- ALWAYS include TW4 post-scaffold fixes
- NEVER create or overwrite package.json manually
- dependsOn: []

## Final task: Verify Script (COMMAND task — executed directly, NOT sent to LLM)

```bash
#!/bin/bash
set -e
echo "[task-N] Final installation and verification..."

# Step 1: Install dependencies
echo "[task-N] Running bun install..."
bun install 2>&1 | tail -5

# Step 2: Auto-fix TypeScript errors using Groq
echo "[task-N] Running TypeScript fix loop..."
python3 ~/.skills/ship/scripts/tsc-fix-loop.py . || {
  echo "[task-N] TypeScript errors remain - manual review needed"
  bunx tsc --noEmit | head -20
  exit 1
}

# Step 3: Clear cache
echo "[task-N] Clearing Next.js cache..."
rm -rf .next

# Step 4: Verify dev server starts
echo "[task-N] Verifying dev server startup..."
timeout 10 bun run dev > /tmp/dev-verify.log 2>&1 &
DEV_PID=$!
sleep 5

if grep -q "error\|Error\|ERROR" /tmp/dev-verify.log 2>/dev/null; then
  echo "[task-N] FAILED: Dev server has errors"
  cat /tmp/dev-verify.log
  kill $DEV_PID 2>/dev/null || true
  exit 1
fi

kill $DEV_PID 2>/dev/null || true
echo "[task-N] PASSED: Project ready for development"
echo "[task-N] DONE"
```

### Rules for final task
- dependsOn: ALL other tasks
- Calls tsc-fix-loop.py at `~/.skills/ship/scripts/tsc-fix-loop.py`
- Exit 0 = success, exit 1 = needs manual fix
- The fix loop uses agentic morph strategy: collects ALL tsc errors, sends ALL errored files to Groq in ONE call, Groq returns write_file tool calls for each fix, applies all patches per wave
- Convergence detection: bails after 2 stalled waves (error count not decreasing)
- Max 10 waves, typically converges in 2-3

## Logging conventions

Every task action should include logging:
- Start: `echo "[task-N] START: <title>" >> ship.log`
- File writes: `echo "[task-N] WROTE: <file path>" >> ship.log`
- End: `echo "[task-N] DONE" >> ship.log`
