#!/usr/bin/env node
// Removes hardcoded rounded-XXX/shadow-XXX Tailwind utility classes from
// primitives, section-kit, and motifs. These override the design system's
// CSS custom properties (--d-radius, --d-shadow).
//
// KEEPS:
// - rounded-full (semantic: avatars, icons that must be circular)
// - rounded-none (explicit: no radius)
// - shadow-none (explicit: no shadow)
// - shadow-[...] arbitrary values (custom shadows, often part of design intent)
// - shadow-foreground, shadow-primary, etc. (color modifiers, not shape)
// - Classes inside d-XXX-lock wrappers (explicit opt-out)
//
// REMOVES:
// - rounded-sm, rounded-md, rounded-lg, rounded-xl, rounded-2xl, rounded-3xl
// - shadow-sm, shadow-md, shadow-lg, shadow-xl, shadow-2xl
import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { join } from 'path'

const DIRS = [
  'packages/ship-fast-blocks/src/primitives',
  'packages/ship-fast-blocks/src/section-kit',
  'packages/ship-fast-blocks/src/motifs',
]

// Classes to remove (exact word boundaries to avoid partial matches)
const REMOVE_PATTERNS = [
  /\brounded-sm\b/g,
  /\brounded-md\b/g,
  /\brounded-lg\b/g,
  /\brounded-xl\b/g,
  /\brounded-2xl\b/g,
  /\brounded-3xl\b/g,
  /\bshadow-sm\b/g,
  /\bshadow-md\b/g,
  /\bshadow-lg\b/g,
  /\bshadow-xl\b/g,
  /\bshadow-2xl\b/g,
]

let totalRemoved = 0
const report = []

for (const dir of DIRS) {
  const files = readdirSync(dir).filter(
    (f) => f.endsWith('.tsx') && !f.includes('.test.') && !f.includes('.registry.'),
  )

  for (const file of files) {
    const path = join(dir, file)
    let content = readFileSync(path, 'utf8')
    let fileRemoved = 0

    for (const pattern of REMOVE_PATTERNS) {
      const matches = content.match(pattern)
      if (matches) {
        fileRemoved += matches.length
        content = content.replace(pattern, '')
      }
    }

    // Clean up double spaces left by removals
    content = content.replace(/  +/g, ' ')
    // Clean up empty className fragments: className=" text-lg" → className="text-lg"
    content = content.replace(/className="\s+/g, 'className="')
    content = content.replace(/\s+"/g, '"')
    // Clean up trailing spaces before >
    content = content.replace(/\s+>/g, '>')

    if (fileRemoved > 0) {
      writeFileSync(path, content)
      totalRemoved += fileRemoved
      report.push(`  ${dir}/${file}: -${fileRemoved}`)
    }
  }
}

console.log(`Removed ${totalRemoved} hardcoded rounded/shadow classes`)
console.log(report.join('\n'))
