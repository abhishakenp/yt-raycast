import { groq } from '../llm/groq'
import { formatTps } from '../llm/utils'
import { promptSnippet } from '../prompt'
import { slug, parseJson, writeFile } from './workspace'
import { contextPrompt } from '../prompts/context'
import type { BrandProfile } from '../prompts/brand-profile'

export async function generateContext(
  prompt: string,
  designBrief: string | null,
  siteType: string,
  workspace: string,
  log: (msg: string) => void,
  brandProfile: BrandProfile | null = null,
) {
  log('  context: extracting from prompt via Groq')

  const { system, user, temperature, maxTokens } = contextPrompt(
    prompt,
    designBrief,
    siteType,
    brandProfile,
  )
  const result = await groq(user, { system, temperature, maxTokens })

  // Clean stats markers that might break JSON parsing
  const cleanedContent = result.content
    .replace(/<\|stats\|>[\s\S]*?<\/\|stats\|>/g, '')
    .trim()

  const parsed = parseJson(cleanedContent)
  const fallbackProjectName = promptSnippet(prompt, 40, 'Generated Project')
  const fallbackSlugSource = promptSnippet(prompt, 30, 'generated-project')

  const ctx = parsed || {
    project_name: fallbackProjectName,
    slug: slug(fallbackSlugSource),
    tagline: '',
    site_url: '',
    site_type: siteType,
    pages: ['Home'],
    entities: [],
    features: [],
    mood: 'modern dark',
    color_direction: 'dark with purple accents',
  }

  if (!parsed) {
    log(`  ⚠️  context: JSON parsing failed, using fallback.`)
    log(
      `  Raw content length: ${result.content.length}, cleaned: ${cleanedContent.length}`,
    )
    log(`  Cleaned content sample: ${cleanedContent.slice(0, 150)}`)
  } else {
    log(
      `  ✅ context: successfully parsed. Project: "${ctx.project_name}" | Features: ${ctx.features?.length || 0}`,
    )
  }

  writeFile(workspace, 'project-context.json', JSON.stringify(ctx, null, 2))

  const tpsStr = formatTps(result) ? ` | ${formatTps(result)}` : ''
  log(
    `  project-context.json: ${ctx.pages.length} pages, ${ctx.features.length} features${tpsStr}`,
  )

  return {
    ctx,
    inputTokens: result.inputTokens ?? 0,
    outputTokens: result.outputTokens ?? 0,
    cost: result.cost ?? 0,
  }
}
