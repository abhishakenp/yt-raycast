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

const siteType = process.argv[2]?.toLowerCase()

if (!siteType || !VALID_TYPES.includes(siteType)) {
  console.error(
    `❌ Invalid site type. Valid options: ${VALID_TYPES.join(', ')}`
  )
  console.error(`Usage: node scripts/generate-templates.js <site-type>`)
  process.exit(1)
}

console.log(`🚀 Generating ${siteType} template with Kimi...`)

try {
  const result = await groqTemplate(siteType)

  if (result.error) {
    console.error(`❌ Generation failed: ${result.error}`)
    process.exit(1)
  }

  const templatesDir = join(process.cwd(), 'templates')
  mkdirSync(templatesDir, { recursive: true })

  const outputFile = join(templatesDir, `${siteType}.html`)
  writeFileSync(outputFile, result.content, 'utf8')

  console.log(`✅ Template saved: ${outputFile}`)
  console.log(`📊 Generated: ${result.content.length} chars`)
  if (result.tps) console.log(`⚡ Speed: ${result.tps} tps`)
} catch (err) {
  console.error(`❌ Error: ${err.message}`)
  process.exit(1)
}
