#!/usr/bin/env node
import { groqTemplate } from '../src/llm/groq.js'
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

const VALID_TYPES = [
  'saas',
  'landing',
  'portfolio',
  'ecommerce',
  'blog',
  'docs',
  'dashboard',
  'marketplace',
  'community',
]

const templatesDir = join(process.cwd(), 'templates')
mkdirSync(templatesDir, { recursive: true })

console.log(`🚀 Generating all ${VALID_TYPES.length} templates with Kimi in parallel...\n`)

try {
  const results = await Promise.all(
    VALID_TYPES.map(async (siteType) => {
      console.log(`  ⏳ ${siteType}...`)
      const result = await groqTemplate(siteType)
      return { siteType, result }
    })
  )

  let successCount = 0
  for (const { siteType, result } of results) {
    if (result.error) {
      console.log(`  ❌ ${siteType}: ${result.error}`)
    } else {
      const outputFile = join(templatesDir, `${siteType}.html`)
      writeFileSync(outputFile, result.content, 'utf8')
      console.log(`  ✅ ${siteType}: ${result.content.length} chars`)
      successCount++
    }
  }

  console.log(
    `\n✨ Done! Generated ${successCount}/${VALID_TYPES.length} templates in ${templatesDir}`
  )
} catch (err) {
  console.error(`❌ Error: ${err.message}`)
  process.exit(1)
}
