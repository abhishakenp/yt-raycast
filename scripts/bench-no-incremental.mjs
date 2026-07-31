import { runComposition } from '@ship-fast/engine'
import { mkdtempSync, rmSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'

const prompts = [
  'A cozy neighborhood coffee shop called Brew & Bloom with online ordering, a blog about brewing techniques, and a photo gallery',
  'A SaaS analytics platform called DataPulse for monitoring API health, uptime tracking, and incident management with team alerts',
  'A fitness coaching platform called IronClad with workout tracking, trainer booking, and a pricing page',
  'An online store for handmade ceramic pottery called Clay & Craft with product catalog, cart, and artist stories',
  'An Italian restaurant called Trattoria Bella with a menu, reservation booking, and chef specials',
]

// Warm cache
const warmWs = mkdtempSync(join(tmpdir(), 'warm-'))
const warmCtx = {
  id: 'warm',
  broadcast: () => {},
  setPrompt: () => {},
  setTasks: () => {},
  updateTask: () => {},
  signalHomepageReady: () => {},
  signalOpenuiReady: () => {},
  setElapsed: () => {},
  setCost: () => {},
}
try {
  await runComposition({
    prompt: prompts[0],
    workspace: warmWs,
    sessionCtx: warmCtx,
  })
} catch {}
rmSync(warmWs, { recursive: true, force: true })
console.log('Warmed.\n')

// Run with INCREMENTAL parsing (current behavior)
console.log('=== WITH incremental parse/compile (current) ===')
for (let i = 0; i < prompts.length; i++) {
  const ws = mkdtempSync(join(tmpdir(), `inc-${i}-`))
  const ctx = {
    id: 'bench',
    broadcast: () => {},
    setPrompt: () => {},
    setTasks: () => {},
    updateTask: () => {},
    signalHomepageReady: () => {},
    signalOpenuiReady: () => {},
    setElapsed: () => {},
    setCost: () => {},
  }
  try {
    const r = await runComposition({
      prompt: prompts[i],
      workspace: ws,
      sessionCtx: ctx,
    })
    console.log(`p${i + 1}: ${r.duration}ms, ${r.raw.length} chars`)
  } catch (e) {
    console.log(`p${i + 1}: FAILED`)
  }
  rmSync(ws, { recursive: true, force: true })
}
