import { runComposition } from '@ship-fast/engine'
import { mkdtempSync, rmSync, writeFileSync, readFileSync, existsSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'

const prompt = process.argv[2]
const outFile = process.argv[3]
const ws = mkdtempSync(join(tmpdir(), 'bench-'))
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
const t0 = Date.now()
try {
  const r = await runComposition({ prompt, workspace: ws, sessionCtx: ctx })
  const elapsed = Date.now() - t0
  // Count sections: both @section MotifName (old) and @MotifName (new compact)
  const sections = (r.raw.match(/@(?:section\s+)?[A-Z]\w+/g) || []).length
  const pages = (r.raw.match(/@page\s/g) || []).length
  console.log(`time:${elapsed}ms sections:${sections} pages:${pages} chars:${r.raw.length} tokens~${Math.round(r.raw.length/4)}`)
  writeFileSync(outFile, r.raw)
} catch (e) {
  console.error('ERROR:', e.message)
}
rmSync(ws, { recursive: true, force: true })
