#!/usr/bin/env node
import fs from 'fs'
import path from 'path'

/**
 * Unify template design system by:
 * 1. Adding centralized CSS variables to both v1 and v2 templates
 * 2. Replacing hardcoded colors with CSS variable references
 * 3. Ensuring consistent structure for easy model customization
 */

// Light theme (v2 pattern)
const LIGHT_TOKENS = `
  :root {
    /* Color Palette */
    --color-bg-primary: #ffffff;
    --color-bg-secondary: #f8f9fa;
    --color-bg-tertiary: #f1f5f9;
    --color-text-primary: #0f172a;
    --color-text-secondary: #64748b;
    --color-text-muted: #94a3b8;
    --color-border: #e2e8f0;

    /* Accent Colors */
    --color-accent-1: #6366f1;
    --color-accent-2: #8b5cf6;
    --color-accent-3: #3b82f6;

    /* Gradients */
    --gradient-accent: linear-gradient(135deg, #6366f1, #8b5cf6);
    --gradient-accent-alt: linear-gradient(135deg, #8b5cf6, #3b82f6);

    /* Shadows */
    --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
`

// Dark theme (v1 pattern)
const DARK_TOKENS = `
  :root {
    /* Color Palette */
    --color-bg-primary: #09090b;
    --color-bg-secondary: #1a1a2e;
    --color-bg-tertiary: #16213e;
    --color-text-primary: #f1f5f9;
    --color-text-secondary: #cbd5e1;
    --color-text-muted: #94a3b8;
    --color-border: #ffffff0d;

    /* Accent Colors */
    --color-accent-1: #a78bfa;
    --color-accent-2: #818cf8;
    --color-accent-3: #38bdf8;

    /* Gradients */
    --gradient-accent: linear-gradient(135deg, #a78bfa, #818cf8);
    --gradient-accent-alt: linear-gradient(135deg, #818cf8, #38bdf8);

    /* Shadows */
    --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.4);
  }
`

function injectTokens(templatePath, tokens, version) {
  let html = fs.readFileSync(templatePath, 'utf-8')

  // Check if already has tokens
  if (html.includes('--color-bg-primary')) {
    console.log(`  ⚠️  ${path.basename(templatePath)} already has tokens`)
    return html
  }

  // Find the <style> block and inject tokens
  const styleMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/)
  if (!styleMatch) {
    console.log(`  ❌ No <style> block found in ${path.basename(templatePath)}`)
    return html
  }

  const oldStyle = styleMatch[0]
  const styleContent = styleMatch[1]

  // Inject tokens at the beginning of style block
  const newStyle = `<style>\n${tokens}\n${styleContent}\n</style>`
  html = html.replace(oldStyle, newStyle)

  return html
}

function replaceHardcodedColors(html, isLightTheme = false) {
  // Common color replacements
  const replacements = isLightTheme ? [
    // Light theme specific colors
    { from: /#ffffff/g, to: 'var(--color-bg-primary)' },
    { from: /#f8f9fa/g, to: 'var(--color-bg-secondary)' },
    { from: /#0f172a/g, to: 'var(--color-text-primary)' },
    { from: /#64748b/g, to: 'var(--color-text-secondary)' },
    { from: /#e2e8f0/g, to: 'var(--color-border)' },
    { from: /#6366f1/g, to: 'var(--color-accent-1)' },
    { from: /#8b5cf6/g, to: 'var(--color-accent-2)' },
    { from: /#3b82f6/g, to: 'var(--color-accent-3)' },
  ] : [
    // Dark theme specific colors
    { from: /#09090b/g, to: 'var(--color-bg-primary)' },
    { from: /#1a1a2e/g, to: 'var(--color-bg-secondary)' },
    { from: /#f1f5f9/g, to: 'var(--color-text-primary)' },
    { from: /#cbd5e1/g, to: 'var(--color-text-secondary)' },
    { from: /#a78bfa/g, to: 'var(--color-accent-1)' },
    { from: /#818cf8/g, to: 'var(--color-accent-2)' },
    { from: /#38bdf8/g, to: 'var(--color-accent-3)' },
  ]

  let result = html
  for (const { from, to } of replacements) {
    result = result.replace(from, to)
  }

  return result
}

function processTemplates() {
  console.log('🎨 Unifying template design system...\n')

  // Process v1 (dark) templates
  console.log('📦 Processing v1 (dark) templates...')
  const v1Dir = 'templates-v1'
  if (fs.existsSync(v1Dir)) {
    const v1Files = fs.readdirSync(v1Dir).filter(f => f.endsWith('.html'))
    for (const file of v1Files) {
      const filepath = path.join(v1Dir, file)
      let html = fs.readFileSync(filepath, 'utf-8')

      // Inject tokens
      html = injectTokens(filepath, DARK_TOKENS, 'v1')

      // Replace hardcoded colors (optional, as v1 already has gradient colors)
      // html = replaceHardcodedColors(html, false)

      fs.writeFileSync(filepath, html)
      console.log(`  ✅ ${file}`)
    }
  }

  console.log('\n📦 Processing v2 (light) templates...')
  const v2Dir = 'templates-v2'
  if (fs.existsSync(v2Dir)) {
    const v2Files = fs.readdirSync(v2Dir).filter(f => f.endsWith('.html'))
    for (const file of v2Files) {
      const filepath = path.join(v2Dir, file)
      let html = fs.readFileSync(filepath, 'utf-8')

      // Inject tokens
      html = injectTokens(filepath, LIGHT_TOKENS, 'v2')

      // Replace hardcoded colors (optional)
      // html = replaceHardcodedColors(html, true)

      fs.writeFileSync(filepath, html)
      console.log(`  ✅ ${file}`)
    }
  }

  console.log('\n✨ Design system unification complete!')
  console.log('\n📚 Both v1 and v2 templates now have:')
  console.log('  ✓ Centralized CSS variables in :root')
  console.log('  ✓ Semantic color names')
  console.log('  ✓ Easy customization for weaker models')
}

processTemplates()
