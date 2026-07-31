import { runComposition } from '@ship-fast/engine'
import { mkdtempSync, rmSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'

const ws = mkdtempSync(join(tmpdir(), 'prof-fanout-'))
const events = []
const t0 = Date.now()

const ctx = {
  id: 'bench',
  broadcast: (payload) => {
    if (payload.type === 'source') {
      events.push({ t: Date.now() - t0, type: 'source' })
    }
  },
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
    prompt:
      'A cozy neighborhood coffee shop called Brew & Bloom with online ordering, a blog about brewing techniques, and a photo gallery',
    workspace: ws,
    sessionCtx: ctx,
  })
  const total = Date.now() - t0
  console.log(`total: ${total}ms`)
  console.log(`raw chars: ${r.raw.length}`)
  console.log(`sections: ${r.parsed.sections.length}`)
  console.log(`pages: ${r.compiled.pages.length}`)
  console.log(`source broadcasts: ${events.length}`)
  if (events.length > 0) {
    console.log(`first broadcast: ${events[0].t}ms`)
    console.log(`last broadcast: ${events[events.length - 1].t}ms`)
  }
} catch (e) {
  console.error(e.message)
}
rmSync(ws, { recursive: true, force: true })
