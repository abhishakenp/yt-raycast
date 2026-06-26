import {
  composeHomeFirstPass,
  assembleComposedPage,
  brandFromPrompt,
  shortlistFamilies,
} from '../v2-compose.ts'
import { auditOpenUIProgram } from '../openui-program-audit.ts'
import { DEFAULT_MODEL } from '../model-list.ts'
import { median } from './timed-call.ts'

const model = DEFAULT_MODEL
const PROMPTS = [
  'a cozy artisan bakery and coffee shop',
  'a boutique law firm for startups and IP',
  'a developer tool for observability and tracing',
  'a high-energy boutique fitness studio',
  'an online store for handmade leather backpacks',
]
const nav = ['Home', 'About', 'Pricing', 'Contact']
const times: number[] = []
let validCount = 0
console.log('MODEL=', model, '— FIRST-PASS time-to-homepage')
for (const prompt of PROMPTS) {
  const brand = brandFromPrompt(prompt)
  const shortlist = shortlistFamilies(prompt, 3)
  const t0 = performance.now()
  const home = await composeHomeFirstPass({
    prompt,
    brand,
    modelId: model,
    signal: new AbortController().signal,
  })
  const ms = performance.now() - t0 // ← time to homepage = ONE pass
  const page = assembleComposedPage({
    family: home.family,
    propsByKey: home.propsByKey,
    brand,
    nav,
    pageId: 'home',
    seed: 'seed-1',
  })
  const source = `${page.statements.join('\n')}\nroot = PageSwitch(["Home"], [home])`
  let valid = false
  try {
    await auditOpenUIProgram(source, {
      expectedRoot: 'PageSwitch',
      expectedPageIds: ['home'],
    })
    valid = true
    validCount++
  } catch {
    valid = false
  }
  times.push(ms)
  const filled = Object.keys(home.propsByKey).length
  console.log(
    `[${home.family.name}] timeToHome=${ms.toFixed(0)}ms valid=${valid} sections=${page.sectionIds.length} filledKeys=${filled} shortlist=[${shortlist.join(',')}] :: "${prompt.slice(0, 32)}"`,
  )
}
console.log(
  `\nMEDIAN time-to-homepage (1 pass): ${median(times).toFixed(0)}ms | valid ${validCount}/${PROMPTS.length}`,
)
