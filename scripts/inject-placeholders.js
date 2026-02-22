#!/usr/bin/env node
import fs from 'fs'
import path from 'path'

/**
 * Inject placeholder tokens into templates
 * Converts hardcoded text to tokens that groqCustomizeTemplate can replace
 */

const placeholders = {
  v1: {
    'Arcline': 'BRAND_NAME',
    'Workflow Intelligence Platform': 'HERO_SUBTITLE',
    'Automate your entire workflow': 'HERO_HEADLINE',
    'Get Started Free': 'HERO_CTA_TEXT',
  },
  v2: {
    // Light theme specific replacements
  },
}

function injectPlaceholders(html, version) {
  let result = html

  // Always replace these patterns
  const commonReplacements = [
    // Nav brand name (usually first mention)
    [/<a[^>]*class="[^"]*gradient-text[^"]*">[^<]*<\/a>/i, '<a href="#" class="text-xl font-bold tracking-tight"><span class="gradient-text">BRAND_NAME</span></a>'],

    // Hero section headlines
    [/<h1[^>]*>[^<]*<\/h1>/i, '<h1>HERO_HEADLINE</h1>'],

    // Hero subtitle/description
    [/<p[^>]*class="[^"]*text-(?:gray|slate)-(?:400|500)[^"]*">[^<]*<\/p>/i, '<p>HERO_SUBTITLE</p>'],

    // CTA buttons
    [/Get Started|Start Free|Get Started Free/gi, 'HERO_CTA_TEXT'],
  ]

  // Apply common replacements carefully (only first occurrence)
  for (const [pattern, replacement] of commonReplacements) {
    if (pattern instanceof RegExp) {
      result = result.replace(pattern, replacement)
    }
  }

  return result
}

function processTemplates() {
  console.log('🎯 Injecting placeholder tokens into templates...\n')

  const v1Dir = 'templates-v1'
  const v2Dir = 'templates-v2'

  for (const dir of [v1Dir, v2Dir]) {
    if (!fs.existsSync(dir)) {
      console.log(`⏭️  ${dir} not found, skipping`)
      continue
    }

    const version = dir === v1Dir ? 'v1' : 'v2'
    console.log(`📦 Processing ${version} templates...`)

    const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'))

    for (const file of files) {
      const filepath = path.join(dir, file)
      let html = fs.readFileSync(filepath, 'utf-8')

      // Only inject if not already done
      if (!html.includes('BRAND_NAME') && !html.includes('HERO_HEADLINE')) {
        html = injectPlaceholders(html, version)
        fs.writeFileSync(filepath, html)
        console.log(`  ✅ ${file}`)
      } else {
        console.log(`  ⏭️  ${file} (already has placeholders)`)
      }
    }
  }

  console.log('\n✨ Placeholder injection complete!')
}

processTemplates()
