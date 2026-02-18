# Tailwind v4 CSS Rules (Single Source of Truth)

## FORBIDDEN in globals.css

```css
/* ❌ @tailwind v3 directives — v4 does not support them */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* ❌ Redefining built-in Tailwind colors in @theme */
@theme {
  --color-gray-950: #030712;   /* Already built-in */
  --color-violet-500: #8b5cf6; /* Already built-in */
}

/* ❌ Manual CSS resets — breaks utility classes (p-6, gap-4, etc.) */
* { margin: 0; padding: 0; box-sizing: border-box; }

/* ❌ @apply — fragile, hidden dependencies */
.glass { @apply bg-white/5 backdrop-blur-lg; }
```

## CORRECT globals.css template

```css
@import "tailwindcss";

/* @theme ONLY for truly custom tokens not in Tailwind's palette */
@theme {
  --color-brand: #7c3aed;
  --font-display: "Cal Sans";
}

html, body { height: 100%; }
body { background-color: #030712; color: #e2e8f0; }

::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: #0f172a; }
::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
```

## Post-scaffold fix commands

```bash
rm -f tailwind.config.js tailwind.config.ts

cat > postcss.config.mjs << 'EOF'
const config = { plugins: { "@tailwindcss/postcss": {} } };
export default config;
EOF

# Overwrite globals.css with minimal correct version
cat > src/app/globals.css << 'EOF'
@import "tailwindcss";
html, body { height: 100%; }
body { background-color: #030712; color: #e2e8f0; }
EOF
```

## Post-Groq validation (Phase 3 Step B — MANDATORY)

After executor finishes, validate globals.css before fix loop:

```bash
GLOBALS="src/app/globals.css"
NEEDS_FIX=0
grep -q '@tailwind' "$GLOBALS" 2>/dev/null && NEEDS_FIX=1
grep -q '@theme' "$GLOBALS" 2>/dev/null && grep -q '\-\-color-gray' "$GLOBALS" 2>/dev/null && NEEDS_FIX=1
grep -q '^\* {' "$GLOBALS" 2>/dev/null && NEEDS_FIX=1
grep -q '@apply' "$GLOBALS" 2>/dev/null && NEEDS_FIX=1

if [ "$NEEDS_FIX" = "1" ]; then
  echo "FIXING: globals.css has forbidden patterns — overwriting"
  cat > "$GLOBALS" << 'EOF'
@import "tailwindcss";
html, body { height: 100%; }
body { background-color: #030712; color: #e2e8f0; }
EOF
fi
```

## Why these matter

- Redefining built-in colors in `@theme` corrupts internal theme resolution, breaking spacing/sizing utilities
- `* { margin: 0; padding: 0 }` has higher specificity than Tailwind's `p-*` utilities in edge cases
- `@tailwind base/components/utilities` is v3 syntax — v4 silently ignores it, producing no CSS output
- `@apply` creates hidden dependencies that break unpredictably across builds
