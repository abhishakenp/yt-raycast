#!/usr/bin/env bun
/**
 * Standalone script to run the Ship Faster engine without any UI dependencies.
 * Usage: bun scripts/run-engine-standalone.ts "A fitness club website"
 */

import { runHomepageOrchestrator } from '../src/genui/run.ts'

async function main() {
  const prompt = process.argv[2] || 'A modern fitness club website'

  console.log(`🚀 Running Ship Faster engine standalone...`)
  console.log(`📝 Prompt: ${prompt}`)
  console.log()

  const startTime = Date.now()

  try {
    const result = await runHomepageOrchestrator({
      prompt,
      onEvent: (event) => {
        if (event.type === 'status') {
          console.log(`  ${event.message}`)
        } else if (event.type === 'theme') {
          console.log(`  🎨 Theme: ${event.name}`)
        } else if (event.type === 'plan') {
          console.log(`  📋 Pages: ${event.ids.join(', ')}`)
        } else if (event.type === 'module') {
          console.log(`  ✅ Page: ${event.id}`)
        }
      },
      onSource: (source) => {
        console.log(`  📄 Source length: ${source.length} chars`)
      },
    })

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)

    console.log()
    console.log(`✅ Engine completed in ${elapsed}s`)
    console.log(`🏷️  Brand: ${result.brand}`)
    console.log(`🎨 Theme: ${result.theme}`)
    console.log(
      `📄 Generated ${result.source.length} characters of OpenUI source`,
    )
    console.log()
    console.log('--- Generated OpenUI Source ---')
    console.log(result.source)
  } catch (error) {
    console.error('❌ Engine failed:', error)
    process.exit(1)
  }
}

main()
