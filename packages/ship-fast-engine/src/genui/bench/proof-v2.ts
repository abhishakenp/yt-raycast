import { writeFileSync } from 'node:fs'
import {
  classifyFamilies,
  resolveFamily,
  composePage,
  brandFromPrompt,
  FAMILY_NAMES,
} from '../v2-compose.ts'
import { auditOpenUIProgram } from '../openui-program-audit.ts'
import { renderOpenUIToHTML } from '../../openui-ssr.js'
import { DEFAULT_MODEL } from '../model-list.ts'

const model = DEFAULT_MODEL
const prompt = process.argv[2] || 'a modern SaaS analytics platform for product teams'
console.log('families discovered:', FAMILY_NAMES.length)

const signal = new AbortController().signal
const t0 = performance.now()
const candidates = await classifyFamilies(prompt, model, signal)
const classifyMs = performance.now() - t0
console.log(`classified families = [${candidates.join(', ')}] (${classifyMs.toFixed(0)}ms)`)

const nav = ['Home', 'Product', 'Pricing', 'Contact']
const brand = brandFromPrompt(prompt)

for (const seed of ['seed-A', 'seed-B', 'seed-C']) {
  const family = resolveFamily(candidates, seed)
  const tHome = performance.now()
  const home = await composePage({
    prompt,
    family,
    brand,
    nav,
    pageId: 'home',
    seed,
    modelId: model,
    signal,
  })
  const homeMs = performance.now() - tHome
  const source = `${home.statements.join('\n')}\nroot = PageSwitch(["Home"], [home])`
  let valid = false
  let err = ''
  try {
    await auditOpenUIProgram(source, { expectedRoot: 'PageSwitch', expectedPageIds: ['home'] })
    valid = true
  } catch (e) {
    err = e instanceof Error ? e.message : String(e)
  }
  const html = await renderOpenUIToHTML(source, undefined, 'en')
  const textLen = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().length
  const file = `/tmp/v2-${seed}.html`
  writeFileSync(file, html)
  console.log(
    `[${seed}] family=${home.family} sections=${home.sectionIds.length} valid=${valid} homeMs=${homeMs.toFixed(0)} htmlChars=${html.length} textChars=${textLen} → ${file}${err ? ' ERR=' + err : ''}`,
  )
  console.log('   sections:', home.sectionIds.join(', '))
}
