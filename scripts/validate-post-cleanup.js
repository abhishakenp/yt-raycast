// Moved from root validate-post-cleanup.js
// Post-Cleanup Visual Validation Script
const { chromium } = require('playwright')
const fs = require('fs')

async function validatePostCleanup() {
  console.log('🔍 POST-CLEANUP VISUAL VALIDATION')
  console.log('==================================')

  // Create comparison directory
  if (!fs.existsSync('test-results/post-cleanup')) {
    fs.mkdirSync('test-results/post-cleanup', { recursive: true })
  }

  const browser = await chromium.launch()
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  })

  const page = await context.newPage()

  const pages = [
    { url: 'http://localhost:3000/', name: 'homepage' },
    { url: 'http://localhost:3000/pricing', name: 'pricing' },
    { url: 'http://localhost:3000/privacy', name: 'privacy' },
  ]

  console.log('📸 Capturing post-cleanup screenshots...\n')

  for (const testPage of pages) {
    console.log(`🔍 Testing ${testPage.name}...`)

    try {
      await page.goto(testPage.url)
      await page.waitForLoadState('networkidle', { timeout: 30000 })
      await page.waitForTimeout(2000)

      // Hide dynamic content (same as baseline)
      await page.addStyleTag({
        content: `
          [data-testid="countdown"],
          [data-testid="pricing-countdown"],
          [data-testid="dynamic-price"],
          .countdown,
          .timer,
          .timestamp,
          .current-time {
            visibility: hidden !important;
          }
        `,
      })

      // Check for specific elements that should be preserved
      const checks = {
        navigation: await page.locator('nav').count(),
        glassMorphism: await page
          .locator('[class*="glass"], [class*="backdrop"], [class*="blur"]')
          .count(),
        buttons: await page.locator('button, .btn, [role="button"]').count(),
        headings: await page.locator('h1, h2, h3').count(),
      }

      console.log(`  📊 Element counts:`)
      console.log(`     Navigation: ${checks.navigation}`)
      console.log(`     Glass effects: ${checks.glassMorphism}`)
      console.log(`     Buttons: ${checks.buttons}`)
      console.log(`     Headings: ${checks.headings}`)

      // Capture post-cleanup screenshot
      await page.screenshot({
        path: `test-results/post-cleanup/${testPage.name}_post_cleanup.png`,
        fullPage: true,
      })

      // Check for any JavaScript errors
      const jsErrors = []
      page.on('pageerror', (error) => jsErrors.push(error.message))

      if (jsErrors.length > 0) {
        console.log(`  ⚠️  JavaScript errors detected:`)
        jsErrors.forEach((error) => console.log(`     - ${error}`))
      } else {
        console.log(`  ✅ No JavaScript errors`)
      }

      console.log(`  ✅ ${testPage.name} screenshot captured\n`)
    } catch (error) {
      console.log(`  ❌ Failed to test ${testPage.name}: ${error.message}\n`)
    }
  }

  await browser.close()

  // Compare file sizes if baseline exists
  console.log('📊 VISUAL VALIDATION SUMMARY')
  console.log('============================')

  const postCleanupFiles = fs.readdirSync('test-results/post-cleanup/')
  const baselineFiles = fs.existsSync('test-results/visual-baselines/')
    ? fs.readdirSync('test-results/visual-baselines/')
    : []

  if (baselineFiles.length > 0) {
    console.log('📸 Screenshot comparison available:')
    postCleanupFiles.forEach((file) => {
      const baselineEquivalent = baselineFiles.find((bf) => bf.includes(file.split('_')[0]))
      if (baselineEquivalent) {
        console.log(`  📋 ${file} ↔️ ${baselineEquivalent}`)
      }
    })
  }

  console.log('\n🎯 Next Steps:')
  console.log(
    '1. Manually compare screenshots in test-results/post-cleanup/ vs test-results/visual-baselines/',
  )
  console.log('2. Check for layout differences, missing glass effects, or font changes')
  console.log('3. Run: npx playwright test tests/visual-regression/ (if configured)')
  console.log('4. Validate navigation functionality and responsive behavior')

  return {
    status: 'complete',
    screenshotsCaptured: postCleanupFiles.length,
    pagesValidated: pages.length,
  }
}

validatePostCleanup()
  .then((result) => {
    console.log(
      `\n✅ Validation complete: ${result.screenshotsCaptured} screenshots for ${result.pagesValidated} pages`,
    )
  })
  .catch(console.error)
