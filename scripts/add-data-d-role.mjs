#!/usr/bin/env node
/**
 * Maps data-slot values to data-d-role values in section-kit components.
 * Adds data-d-role="..." right after data-slot="..." if not already present.
 */
import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { join } from 'path'

const DIR = 'packages/ship-fast-blocks/src/section-kit'

// Map data-slot substrings → data-d-role
// Order matters: more specific patterns first
const SLOT_TO_ROLE = [
  // Display (hero headings)
  { test: /hero-heading|hero-title|display/, role: 'display' },
  // Stats
  { test: /stat-value|stat-badge/, role: 'stat-value' },
  { test: /stat-label|stat-caption|stat-delta/, role: 'eyebrow' },
  { test: /stat-card|stat-item/, role: 'card' },
  // Eyebrow / badge
  { test: /eyebrow/, role: 'eyebrow' },
  { test: /badge/, role: 'badge' },
  // Buttons / CTAs
  { test: /cta|button|sign-in-button|submit/, role: 'btn' },
  // Links
  { test: /link|nav-route-link|nav-cta/, role: 'link' },
  // Nav
  { test: /nav-drawer-nav|navbar-nav|mobile-nav/, role: 'nav' },
  { test: /site-nav|navbar/, role: 'nav' },
  // Footer
  { test: /footer/, role: 'footer' },
  // Form
  { test: /form-field|form$/, role: 'form' },
  { test: /input|textarea|select|search-input/, role: 'input' },
  // List
  { test: /list-item|list$/, role: 'list' },
  // Grid
  { test: /grid$/, role: 'grid' },
  // Card
  { test: /card|tier|tile|item$/, role: 'card' },
  // Image
  { test: /image|logo|avatar|photo|picture/, role: 'image' },
  // Divider
  { test: /divider|separator/, role: 'divider' },
  // Decor
  { test: /decor|dot-grid|glow/, role: 'decor' },
  // Section
  { test: /section$/, role: 'section' },
  // Container
  { test: /container|content$/, role: 'container' },
  // Heading
  { test: /heading|title|name|question/, role: 'heading' },
  // Body / text
  {
    test: /subheading|subtitle|body|excerpt|description|answer|text|content|meta|role|label|info|strip-item|step-content|process-content/,
    role: 'body',
  },
  // Highlight
  { test: /highlight/, role: 'highlight' },
]

function slotToRole(slot) {
  for (const { test, role } of SLOT_TO_ROLE) {
    if (test.test(slot)) return role
  }
  return null
}

const files = readdirSync(DIR).filter(
  (f) =>
    f.endsWith('.tsx') && !f.includes('.test.') && !f.includes('.registry.'),
)

let totalAdded = 0
let filesModified = 0
const report = []

for (const file of files) {
  const path = join(DIR, file)
  let content = readFileSync(path, 'utf8')
  let fileAdded = 0

  // Find all data-slot="..." and add data-d-role after if not present
  content = content.replace(
    /data-slot="([^"]+)"(\s*)(?!data-d-role)/g,
    (match, slot, ws) => {
      const role = slotToRole(slot)
      if (!role) return match
      fileAdded++
      return `data-slot="${slot}"${ws}data-d-role="${role}"`
    },
  )

  if (fileAdded > 0) {
    writeFileSync(path, content)
    filesModified++
    totalAdded += fileAdded
    report.push(`  ${file}: +${fileAdded}`)
  }
}

console.log(
  `Modified ${filesModified} files, added ${totalAdded} data-d-role attributes`,
)
console.log(report.join('\n'))
