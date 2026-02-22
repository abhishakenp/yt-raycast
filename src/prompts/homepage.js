import { HOME_LABELS, SITE_TYPE_INSTRUCTIONS } from '../config.js'
import { slug } from '../pipeline/workspace.js'

export function homepagePrompt(prompt, ctx, designBrief) {
  const st = ctx?.site_type ?? 'saas'
  const otherPages = (ctx?.pages ?? []).filter((p) => !HOME_LABELS.includes(p.toLowerCase()))
  const isOnePager = ['landing', 'portfolio'].includes(st) || otherPages.length === 0

  const navLinks = (ctx?.pages ?? [])
    .map((p) => {
      const label = p.toLowerCase()
      if (HOME_LABELS.includes(label)) return '- Home: index.html'
      return `- ${p}: ${slug(p)}.html`
    })
    .join('\n')

  const typeBlock = SITE_TYPE_INSTRUCTIONS[st] ?? SITE_TYPE_INSTRUCTIONS['landing']
  const pagesBlock = isOnePager
    ? 'ONE-PAGER. All content in this file. Anchor links (#features, #pricing) for nav.'
    : `MULTI-PAGE. This is ONLY the homepage. Other pages are separate files.\nNav hrefs:\n${navLinks}`

  const featuresBlock = ctx?.features?.length
    ? `\nProduct features (MUST showcase these on the homepage):\n${ctx.features.map((f) => `- ${f}`).join('\n')}\n`
    : ''
  const entitiesBlock = ctx?.entities?.length ? `\nKey entities: ${ctx.entities.join(', ')}\n` : ''
  const taglineBlock = ctx?.tagline ? `\nTagline: "${ctx.tagline}"\n` : ''

  return (
    `index.html \u2014 ${st}:\n${prompt}\n\n` +
    `Project: ${ctx?.project_name ?? 'My App'}${taglineBlock}${featuresBlock}${entitiesBlock}\n` +
    `${typeBlock}\n${pagesBlock}\n\n` +
    `Design system:\n${designBrief || 'Clean, professional, dark mode. Inter font. Muted palette.'}\n\n` +
    'Tailwind CDN. Realistic mock data. Lorem Picsum images. Output ONLY HTML.'
  )
}
