import { writeFileSync } from 'node:fs'
import { runV2ComposedGeneration } from '../v2-compose.ts'
import { auditOpenUIProgram } from '../openui-program-audit.ts'
import { renderOpenUIToHTML } from '../../openui-ssr.js'
import { DEFAULT_MODEL } from '../model-list.ts'

const model = DEFAULT_MODEL
const prompt = process.argv[2] || 'a cozy artisan bakery and coffee shop'
const seed = process.argv[3] || 'sess-1'

const t0 = performance.now()
let firstPaintMs = -1
const result = await runV2ComposedGeneration({
  prompt,
  modelId: model,
  sessionSeed: seed,
  onSource: () => {
    if (firstPaintMs < 0) firstPaintMs = performance.now() - t0
  },
  onEvent: (e) => {
    if (e.type === 'plan') console.log('plan pages:', e.ids.join(', '))
    if (e.type === 'theme') console.log('theme:', e.name)
  },
})
const totalMs = performance.now() - t0

let valid = false
let err = ''
try {
  await auditOpenUIProgram(result.source, { expectedRoot: 'PageSwitch' })
  valid = true
} catch (e) {
  err = e instanceof Error ? e.message : String(e)
}
const html = await renderOpenUIToHTML(result.source, undefined, 'en')
writeFileSync('/tmp/v2-site.html', html)
console.log(
  `family=${result.family} brand="${result.brand}" valid=${valid} firstPaint=${firstPaintMs.toFixed(0)}ms total=${totalMs.toFixed(0)}ms srcChars=${result.source.length} htmlChars=${html.length}${err ? ' ERR=' + err : ''}`,
)
console.log('pages in PageSwitch:', (result.source.match(/PageSwitch\((\[[^\]]*\])/) || [])[1])
console.log('→ /tmp/v2-site.html')
