# Unified Design Token System

## Overview

Both template versions (v1 dark + v2 light) will use the same **centralized CSS variable system** at the top of the `<style>` block. This makes it trivially easy to:

1. **Swap color schemes** - Change just one place
2. **Switch themes** - Dark ↔ Light
3. **Customize for weaker models** - Just modify `:root`
4. **Maintain consistency** - Both versions follow same pattern

## Design Tokens Structure

All templates use this structure:

```html
<style>
  :root {
    /* === COLOR PALETTE === */
    --color-bg-primary: #ffffff;
    --color-bg-secondary: #f8f9fa;
    --color-text-primary: #0f172a;
    --color-text-secondary: #64748b;
    --color-border: #e2e8f0;

    /* === ACCENT COLORS === */
    --color-accent-1: #6366f1;      /* Primary accent (indigo) */
    --color-accent-2: #8b5cf6;      /* Secondary accent (purple) */
    --color-accent-3: #3b82f6;      /* Tertiary accent (blue) */

    /* === GRADIENTS === */
    --gradient-accent: linear-gradient(135deg, var(--color-accent-1), var(--color-accent-2));
    --gradient-mesh: radial-gradient(...);

    /* === TYPOGRAPHY === */
    --font-sans: 'Inter', system-ui, sans-serif;
    --font-size-xs: 0.75rem;
    --font-size-sm: 0.875rem;
    --font-size-base: 1rem;
    --font-size-lg: 1.125rem;
    --font-size-xl: 1.25rem;

    /* === SPACING === */
    --space-xs: 0.25rem;
    --space-sm: 0.5rem;
    --space-md: 1rem;
    --space-lg: 1.5rem;
    --space-xl: 2rem;

    /* === BORDER RADIUS === */
    --radius-sm: 0.375rem;
    --radius-md: 0.5rem;
    --radius-lg: 0.75rem;
    --radius-xl: 1rem;
    --radius-full: 9999px;
  }

  /* === SEMANTIC CLASSES === */
  body {
    background-color: var(--color-bg-primary);
    color: var(--color-text-primary);
  }

  .bg-primary { background-color: var(--color-bg-primary); }
  .bg-secondary { background-color: var(--color-bg-secondary); }
  .text-primary { color: var(--color-text-primary); }
  .text-secondary { color: var(--color-text-secondary); }
  .text-accent { color: var(--color-accent-1); }
  .border-primary { border-color: var(--color-border); }

  .btn-primary {
    background: var(--gradient-accent);
    color: white;
  }
</style>
```

## Color Schemes

### Light Theme (V2 Pattern)
```css
:root {
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f8f9fa;
  --color-text-primary: #0f172a;
  --color-text-secondary: #64748b;
  --color-border: #e2e8f0;
  --color-accent-1: #6366f1;    /* Indigo */
  --color-accent-2: #8b5cf6;    /* Violet */
  --color-accent-3: #3b82f6;    /* Blue */
}
```

### Dark Theme (V1 Pattern)
```css
:root {
  --color-bg-primary: #09090b;
  --color-bg-secondary: #1a1a2e;
  --color-text-primary: #f1f5f9;
  --color-text-secondary: #94a3b8;
  --color-border: #ffffff0d;
  --color-accent-1: #a78bfa;    /* Purple (lighter for dark) */
  --color-accent-2: #818cf8;    /* Indigo (lighter for dark) */
  --color-accent-3: #38bdf8;    /* Cyan (lighter for dark) */
}
```

## Template Variables Reference

```
COLORS:
  --color-bg-primary         Main background
  --color-bg-secondary       Cards, surfaces
  --color-text-primary       Headlines, primary text
  --color-text-secondary     Muted text, descriptions
  --color-border             Borders, dividers
  --color-accent-1           Primary CTA, emphasis
  --color-accent-2           Secondary accent
  --color-accent-3           Tertiary accent

GRADIENTS:
  --gradient-accent          Multi-accent gradient
  --gradient-mesh            Background mesh pattern

TYPOGRAPHY:
  --font-sans                Font family
  --font-size-*              Predefined sizes (xs, sm, base, lg, xl)

SPACING:
  --space-*                  Predefined spacing (xs, sm, md, lg, xl)

RADIUS:
  --radius-*                 Predefined border radius
```

## How to Apply to Templates

### Before (Hardcoded)
```html
<button style="background: linear-gradient(135deg, #6366f1, #8b5cf6)">
  Click me
</button>

<div style="color: #0f172a; background: #ffffff">
  Content
</div>
```

### After (Using Tokens)
```html
<button style="background: var(--gradient-accent)">
  Click me
</button>

<div style="color: var(--color-text-primary); background: var(--color-bg-primary)">
  Content
</div>
```

## For Weaker Models

To change colors/theme, **just modify `:root`**:

```css
:root {
  /* Change to dark theme */
  --color-bg-primary: #09090b;        /* was #ffffff */
  --color-text-primary: #f1f5f9;      /* was #0f172a */
  --color-accent-1: #a78bfa;          /* was #6366f1 */
  /* ... etc ... */
}
```

That's it! **Everything automatically uses the new colors.**

## Random Version Selection

In `groqCustomizeTemplate()`:

```javascript
// Randomly pick v1 (dark) or v2 (light)
const version = Math.random() > 0.5 ? 'v1' : 'v2'
const templatePath = `templates-${version}/${siteType}.html`
const template = await loadTemplate(templatePath)

// Customize both versions same way
const customized = await customizeTemplate(template, ctx)
```

Both versions will work with the same customization logic because they use the same variable names.

## Implementation Checklist

- [ ] Extract hardcoded colors from v1 templates
- [ ] Extract hardcoded colors from v2 templates
- [ ] Create unified `:root` section
- [ ] Replace all hardcoded colors with CSS variables
- [ ] Test that both versions render correctly
- [ ] Update `groqCustomizeTemplate()` to handle both versions
- [ ] Create random selector in template loading
- [ ] Update documentation

## Benefits

✅ **Single source of truth** - Colors defined once
✅ **Easy theme switching** - Change `:root` = change everything
✅ **Weaker model friendly** - Simple variable replacement
✅ **Maintainable** - Consistent across all templates
✅ **Scalable** - Add new tokens as needed
✅ **Random variants** - Users get different looks
✅ **No API calls** - All local customization
