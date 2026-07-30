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

// Warm the cache first
const warmWs = mkdtempSync(join(tmpdir(), 'warm-'))
const warmCtx = { id: 'warm', broadcast: () => {}, setPrompt: () => {}, setTasks: () => {}, updateTask: () => {}, signalHomepageReady: () => {}, signalOpenuiReady: () => {}, setElapsed: () => {}, setCost: () => {} }
try { await runComposition({ prompt: prompts[0], workspace: warmWs, sessionCtx: warmCtx }) } catch {}
rmSync(warmWs, { recursive: true, force: true })
console.log('Cache warmed\n')

for (let i = 0; i < prompts.length; i++) {
  const ws = mkdtempSync(join(tmpdir(), `tok-${i}-`))
  const ctx = { id: `bench`, broadcast: () => {}, setPrompt: () => {}, setTasks: () => {}, updateTask: () => {}, signalHomepageReady: () => {}, signalOpenuiReady: () => {}, setElapsed: () => {}, setCost: () => {} }
  try {
    const r = await runComposition({ prompt: prompts[i], workspace: ws, sessionCtx: ctx })
    let currentPage = 'home'
    let navbarCount = 0, footerCount = 0
    const pageSet = new Set(['home'])
    for (const line of r.raw.split('\n')) {
      if (line.startsWith('@page ')) { currentPage = line.slice(6).trim(); pageSet.add(currentPage) }
      if (line.startsWith('@section Navbar')) navbarCount++
      if (line.startsWith('@section Footer')) footerCount++
    }
    console.log(`p${i+1}: ${r.duration}ms, ${r.raw.length} chars, ~${Math.round(r.raw.length/4)} tok, ${pageSet.size} pages, Navbar:${navbarCount}, Footer:${footerCount}`)
  } catch(e) { console.log(`p${i+1}: FAILED - ${e.message}`) }
  rmSync(ws, { recursive: true, force: true })
}
