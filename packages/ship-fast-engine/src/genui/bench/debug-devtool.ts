import { composeHomeFirstPass, assembleComposedPage, brandFromPrompt } from '../v2-compose.ts'
import { auditOpenUIProgram } from '../openui-program-audit.ts'
import { DEFAULT_MODEL } from '../model-list.ts'

const model = DEFAULT_MODEL
const prompt = process.argv[2] || 'a developer tool for observability and tracing'
const brand = brandFromPrompt(prompt)
const home = await composeHomeFirstPass({ prompt, brand, modelId: model, signal: new AbortController().signal })
const page = assembleComposedPage({ family: home.family, propsByKey: home.propsByKey, brand, nav: ['Home', 'Docs', 'Pricing', 'Contact'], pageId: 'home', seed: 's' })
console.log('family:', home.family.name, 'sections:', page.sectionIds.join(','))
// audit each section statement in isolation to find the culprit
for (const stmt of page.statements) {
  if (stmt.startsWith('home = Stack')) continue
  const id = stmt.split(' = ')[0]
  const program = `root = PageSwitch(["P"], [${id}])\n${stmt}`
  try {
    await auditOpenUIProgram(program, { expectedRoot: 'PageSwitch', expectedPageIds: [id] })
    console.log(`OK   ${id} (${stmt.length}c)`)
  } catch (e) {
    console.log(`FAIL ${id}: ${e instanceof Error ? e.message : String(e)}`)
    console.log('   stmt head:', stmt.slice(0, 240))
  }
}
