import { groq } from '../llm/groq.js'
import { formatTps } from '../llm/utils.js'
import { slug, parseJson, writeFile } from './workspace.js'
import { contextPrompt } from '../prompts/context.js'

export async function generateContext(prompt, designBrief, siteType, workspace, log) {
  log('  context: extracting from prompt via Groq')

  const { system, user, temperature, maxTokens } = contextPrompt(prompt, designBrief, siteType)
  const result = await groq(user, { system, temperature, maxTokens })

  const ctx = parseJson(result.content) ?? {
    project_name: prompt.slice(0, 40),
    slug: slug(prompt.slice(0, 30)),
    tagline: '',
    site_type: siteType,
    pages: ['Home'],
    entities: [],
    features: [],
    mood: 'modern dark',
    color_direction: 'dark with purple accents',
  }

  writeFile(workspace, 'project-context.json', JSON.stringify(ctx, null, 2))

  const tpsStr = formatTps(result) ? ` | ${formatTps(result)}` : ''
  log(`  project-context.json: ${ctx.pages.length} pages, ${ctx.features.length} features${tpsStr}`)

  return {
    ctx,
    inputTokens: result.inputTokens ?? 0,
    outputTokens: result.outputTokens ?? 0,
    cost: result.cost ?? 0,
  }
}
