import { runComposition } from '@ship-fast/engine'
import { mkdtempSync, rmSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'

const ws = mkdtempSync(join(tmpdir(), 'prof-'))
let chunkCount = 0
let firstChunkTime = 0
let lastChunkTime = 0
const t0 = Date.now()

const ctx = {
  id: 'prof',
  broadcast: (payload) => {
    if (payload.type === 'source') {
      if (firstChunkTime === 0) firstChunkTime = Date.now()
      lastChunkTime = Date.now()
      chunkCount++
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
  console.log(`first source broadcast: ${firstChunkTime - t0}ms`)
  console.log(`last source broadcast: ${lastChunkTime - t0}ms`)
  console.log(`source broadcasts: ${chunkCount}`)
  console.log(`post-stream overhead: ${total - (lastChunkTime - t0)}ms`)
  console.log(`raw chars: ${r.raw.length}`)
} catch (e) {
  console.error(e.message)
}
rmSync(ws, { recursive: true, force: true })
