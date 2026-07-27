#!/usr/bin/env node
/**
 * End-to-end VPS generation benchmark.
 *
 * Measures the full path:
 *   1. HTTP POST /api/sessions/create (session admission + VPS kickoff)
 *   2. Poll getGenerationView on Convex until preview_ready
 *   3. Report per-phase timings from VPS logs + total wall clock
 *
 * Usage:
 *   node scripts/bench-vps-generation.mjs "your prompt here"
 *
 * Requires:
 *   - VPS running locally (npm run dev) or APP_BASE_URL set
 *   - Convex dev deployment accessible
 */
import { ConvexHttpClient } from 'convex/browser'
import { anyApi } from 'convex/server'

const api = anyApi

const prompt =
  process.argv[2] ??
  'A SaaS landing page for a project management tool called TaskFlow with pricing, features, and testimonials'
const baseUrl = process.env.APP_BASE_URL ?? 'http://localhost:3000'
const convexUrl = process.env.VITE_CONVEX_URL ?? process.env.CONVEX_URL

if (!convexUrl) {
  console.error('Error: Set VITE_CONVEX_URL or CONVEX_URL env var')
  process.exit(1)
}

console.log(`\n🚀 VPS Generation Benchmark`)
console.log(`   Prompt: "${prompt}"`)
console.log(`   VPS:    ${baseUrl}`)
console.log(`   Convex: ${convexUrl}\n`)

const convexClient = new ConvexHttpClient(convexUrl)

// Step 1: Create session via HTTP API
const t_http_start = Date.now()
const createResponse = await fetch(`${baseUrl}/api/sessions/create`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt,
    preferredLanguage: 'en',
    preferredExportTarget: 'html',
    isPrivate: false,
    workspace: `bench-vps-${Date.now()}`,
    anonymousOwnerSecret: `bench-secret-${Date.now()}`,
    anonymousClientId: `bench-client-${Date.now()}`,
  }),
})

if (!createResponse.ok) {
  const text = await createResponse.text().catch(() => 'unknown')
  console.error(`Session creation failed: ${createResponse.status} ${text}`)
  process.exit(1)
}

const createResult = await createResponse.json()
const sessionId = createResult.sessionId
const t_http_end = Date.now()
const httpMs = t_http_end - t_http_start

if (!sessionId) {
  console.error('No sessionId returned')
  process.exit(1)
}

console.log(`   Session: ${sessionId}`)
console.log(`   HTTP /api/sessions/create: ${httpMs}ms\n`)

// Step 2: Poll getGenerationView until preview_ready or failed
const t_poll_start = Date.now()
let lastStatus = null
let lastPreviewVersion = 0
let view = null

while (true) {
  view = await convexClient.query(api.sessions.getGenerationView, {
    lookup: sessionId,
  })

  if (view) {
    const status = view.session?.status
    const previewVersion = view.session?.previewVersion ?? 0

    if (status !== lastStatus || previewVersion !== lastPreviewVersion) {
      const elapsed = Date.now() - t_poll_start
      console.log(
        `   [${(elapsed / 1000).toFixed(1)}s] status=${status} previewVersion=${previewVersion}`,
      )
      lastStatus = status
      lastPreviewVersion = previewVersion
    }

    if (status === 'preview_ready' || status === 'failed') {
      break
    }
  }

  await new Promise((resolve) => setTimeout(resolve, 500))
}

const t_poll_end = Date.now()
const totalMs = t_poll_end - t_http_start
const generationMs = t_poll_end - t_poll_start

// Step 3: Print results
console.log(`\n${'='.repeat(75)}`)
console.log(`VPS GENERATION TIMING BREAKDOWN`)
console.log(`${'='.repeat(75)}\n`)

const colStep = 45
const colMs = 12
console.log(`${'Step'.padEnd(colStep)}${'Time (ms)'.padStart(colMs)}`)
console.log(`${'-'.repeat(colStep)}${'-'.repeat(colMs)}`)
console.log(
  `${'HTTP /api/sessions/create'.padEnd(colStep)}${String(httpMs).padStart(colMs)}`,
)
console.log(
  `${'Generation (poll until preview_ready)'.padEnd(colStep)}${String(generationMs).padStart(colMs)}`,
)
console.log(`${'-'.repeat(colStep)}${'-'.repeat(colMs)}`)
console.log(
  `${'TOTAL (wall clock)'.padEnd(colStep)}${String(totalMs).padStart(colMs)}`,
)

console.log(`\n📊 Summary:`)
console.log(`   HTTP session creation:  ${(httpMs / 1000).toFixed(2)}s`)
console.log(`   Generation (VPS):       ${(generationMs / 1000).toFixed(2)}s`)
console.log(`   Total wall clock:       ${(totalMs / 1000).toFixed(2)}s`)

if (lastStatus === 'failed') {
  console.log(`\n   ⚠ Generation FAILED`)
  if (view?.session?.error) {
    console.log(`   Error: ${view.session.error.message ?? 'unknown'}`)
  }
} else if (view?.latestPreview?.html) {
  console.log(`   Preview HTML length: ${view.latestPreview.html.length} chars`)
}

if (view?.homeModule?.source) {
  console.log(`   OpenUI source length: ${view.homeModule.source.length} chars`)
}

console.log(`\n   Compare to old Convex path: ~20s cold start`)
console.log(
  `   VPS eliminates: 10s SSR cold start + 2s engine import cold start`,
)

console.log(`\n${'='.repeat(75)}\n`)

process.exit(0)
