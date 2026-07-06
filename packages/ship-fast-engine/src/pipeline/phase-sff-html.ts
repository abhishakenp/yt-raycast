import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { HOMEPAGE_MODEL, LLM_CONFIG } from '../config.js'
import { groqStream } from '../llm/groq.js'
import { brandProfilePromptBlock } from '../prompts/brand-profile.js'
import { ensureLucideIconRuntime } from './lucide-icons.js'

type GenerateHtmlInput = {
  system: string
  user: string
  onToken?: (token: string, accumulated: string) => void
}

type GenerateHtmlResult = {
  content: string
  cost?: number
}

const brandProfilePromptBlockTyped = brandProfilePromptBlock as (
  brandProfile?: Record<string, unknown> | null,
) => string

const groqStreamTyped = groqStream as (
  prompt: string,
  opts: {
    system: string
    temperature: number
    maxTokens: number
    model: string
    onToken?: (token: string, accumulated: string) => void
  },
) => Promise<GenerateHtmlResult>

const ensureLucideIconRuntimeTyped = ensureLucideIconRuntime as (
  html: string,
  log?: (message: string) => void,
) => string

type WriteSffHtmlHomeInput = {
  workspace: string
  prompt: string
  siteSpec?: Record<string, unknown>
  preferredLanguage?: string
  imageHints?: {
    photos?: Array<{ query?: string; alt?: string; url?: string }>
    videos?: Array<{
      query?: string
      alt?: string
      url?: string
      posterUrl?: string
    }>
  } | null
  brandProfile?: Record<string, unknown> | null
  log?: (message: string) => void
  sessionCtx?: {
    broadcast?: (payload: unknown) => void
  }
  generateHtml?: (input: GenerateHtmlInput) => Promise<GenerateHtmlResult>
}

export const SFF_HTML_SYSTEM_PROMPT = `You are an elite web designer that outputs a single complete HTML file and nothing else.

Rules:
- Output ONLY raw HTML starting with <!DOCTYPE html>. No markdown, no code fences, no explanations.
- Use Tailwind through <script src="https://cdn.tailwindcss.com"></script> in <head>.
- Use Google Fonts: one distinctive display font and one readable body font.
- Build a premium responsive website: bold hero, generous spacing, gradient or dark accents when appropriate, hover states, and subtle CSS animations.
- Include a sticky nav, hero with CTA, 3 feature cards, stats/social-proof strip, and footer.
- Use specific content from the user prompt. No lorem ipsum and no generic placeholder brands.
- Use verified Pexels media from the supplied media block. If no verified media is supplied, use /api/pexels?query=<specific visual query>&w=<width>&h=<height>&seed=<stable slug>; do not use Unsplash, Picsum, placeholder.com, fake stock URLs, base64 images, or invented image URLs.
- CRITICAL — IMAGE ALT TEXT AND PEXELS QUERY MUST ALWAYS BE IN ENGLISH. No exceptions. When the brief contains non-English concepts, TRANSLATE them to their closest English visual equivalent (e.g. Malayalam "sarikk" → "silk saree", "onam" → "harvest festival", "ponnundu" → "gift box"; Hindi "mithai" → "Indian sweets"; Tamil "pookkalam" → "flower rangoli"). Never transliterate — Pexels/Unsplash search in English and cannot match transliterated words. Alt text must be a descriptive English phrase a stock photographer would use, never a file path or non-English script.
- Use official Brandfetch/brand-profile logo and brand facts from the supplied brand block when present. If no verified logo exists, render a restrained text wordmark instead of inventing a logo.
- For pictograms and UI icons, use Lucide placeholders such as <i data-lucide="sparkles" class="w-5 h-5"></i> plus the Lucide CDN/runtime; do not generate long inline SVG pictogram sets. Inline SVG is acceptable only for a tiny original brand mark or chart.
- Static HTML only: no JSX, no framework syntax, no template loops.
- Keep the file under 110 lines.`

const cleanFence = (value: string): string =>
  value
    .replace(/^```(?:html)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()

// Hosts allowed to serve <script src="..."> tags. Inline scripts and
// scripts from any other origin are stripped as a security measure.
const SAFE_SCRIPT_HOSTS = [
  'cdn.tailwindcss.com',
  'unpkg.com',
  'cdn.jsdelivr.net',
  'esm.sh',
  'skypack.dev',
  'fonts.googleapis.com',
]

const isAllowedScriptSrc = (src: string): boolean => {
  if (!src) return false
  try {
    const host = new URL(src, 'https://example.com').hostname
    return SAFE_SCRIPT_HOSTS.some((h) => host === h || host.endsWith(`.${h}`))
  } catch {
    return false
  }
}

// Strip <script> tags that carry inline content or load from untrusted
// origins. Known-safe CDN scripts (e.g. Tailwind runtime) are preserved.
export const stripDangerousScripts = (html: string): string =>
  html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, (match) => {
    const contentMatch = match.match(/<script\b[^>]*>([\s\S]*?)<\/script>/i)
    const content = contentMatch?.[1] ?? ''
    // Inline content (e.g. alert("xss")) is always dangerous → remove.
    if (content.trim()) return ''
    const srcMatch = match.match(/\bsrc\s*=\s*["']([^"']+)["']/i)
    const src = srcMatch?.[1] ?? ''
    // No src and no content is useless; unknown origins are untrusted.
    return isAllowedScriptSrc(src) ? match : ''
  })

// Remove inline event handler attributes (onclick, onload, onerror, …).
export const stripInlineEventHandlers = (html: string): string =>
  html.replace(/\s+on[a-zA-Z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')

// Neutralize javascript: URLs in href (and src) attributes.
export const stripJavascriptUrls = (html: string): string =>
  html
    .replace(/(href\s*=\s*["'])javascript:[^"']*["']/gi, '$1#"')
    .replace(/(src\s*=\s*["'])javascript:[^"']*["']/gi, '$1#"')
    .replace(
      /\b(href|src)\s*=\s*(?!["'])([^\s>]*javascript:[^\s>]*)/gi,
      '$1="#"',
    )

export const sanitizeSffHtml = (raw: string): string => {
  let html = cleanFence(String(raw || ''))
  const start = html.search(/<!doctype\s+html/i)
  if (start > 0) html = html.slice(start).trim()
  const end = html.toLowerCase().lastIndexOf('</html>')
  if (end >= 0) html = html.slice(0, end + '</html>'.length).trim()
  html = stripDangerousScripts(html)
  html = stripInlineEventHandlers(html)
  html = stripJavascriptUrls(html)
  return html
}

export const isCompleteSffHtml = (html: string): boolean =>
  /^<!doctype\s+html/i.test(html.trim()) &&
  /<html[\s>]/i.test(html) &&
  /<head[\s>]/i.test(html) &&
  /<body[\s>]/i.test(html) &&
  /<\/html>\s*$/i.test(html.trim())

const summarizeSiteSpec = (siteSpec?: Record<string, unknown>): string => {
  if (!siteSpec) return 'No site spec was generated.'
  const pick = (key: string) => {
    const value = siteSpec[key]
    return typeof value === 'string' && value.trim() ? value.trim() : undefined
  }
  const pages = Array.isArray(siteSpec.pages)
    ? siteSpec.pages
        .map((page: unknown) =>
          page && typeof page === 'object' && 'name' in page
            ? String((page as { name?: unknown }).name ?? '')
            : String(page ?? ''),
        )
        .filter(Boolean)
        .slice(0, 6)
        .join(', ')
    : undefined
  return [
    `Brand: ${pick('brand') ?? pick('projectName') ?? pick('name') ?? 'derive from prompt'}`,
    `Tagline: ${pick('tagline') ?? 'derive from prompt'}`,
    `Site type: ${pick('siteType') ?? 'landing'}`,
    pages ? `Pages/sections: ${pages}` : undefined,
  ]
    .filter(Boolean)
    .join('\n')
}

const buildMediaPromptBlock = (
  imageHints?: WriteSffHtmlHomeInput['imageHints'],
): string => {
  const photos = imageHints?.photos ?? []
  const videos = imageHints?.videos ?? []
  if (!photos.length && !videos.length) {
    return [
      'Verified media:',
      '- No verified Pexels URLs were preloaded. Use /api/pexels with specific query, width, height, and seed parameters when the page needs imagery.',
      '- Never invent stock-image URLs.',
    ].join('\n')
  }

  const photoLines = photos.slice(0, 8).map((photo, index) => {
    const hint = String(
      photo.query && photo.alt && photo.alt !== photo.query
        ? `[${photo.query}] ${photo.alt}`
        : photo.alt || photo.query || 'Pexels photo',
    ).slice(0, 140)
    return `- Photo ${index + 1}: ${hint}: ${photo.url}`
  })
  const videoLines = videos.slice(0, 4).map((video, index) => {
    const hint = String(
      video.query && video.alt && video.alt !== video.query
        ? `[${video.query}] ${video.alt}`
        : video.alt || video.query || 'Pexels video',
    ).slice(0, 120)
    const poster = video.posterUrl ? ` | poster: ${video.posterUrl}` : ''
    return `- Video ${index + 1}: ${hint}: ${video.url}${poster}`
  })

  return [
    'Verified Pexels media:',
    ...photoLines,
    ...videoLines,
    'Use these URLs first and match them to the closest section. Reuse rather than inventing.',
  ].join('\n')
}

export const buildSffHtmlPrompt = ({
  prompt,
  siteSpec,
  preferredLanguage,
  imageHints,
  brandProfile,
}: {
  prompt: string
  siteSpec?: Record<string, unknown>
  preferredLanguage?: string
  imageHints?: WriteSffHtmlHomeInput['imageHints']
  brandProfile?: WriteSffHtmlHomeInput['brandProfile']
}): string => `Create the website for this brief:
${prompt}

Generated planning context:
${summarizeSiteSpec(siteSpec)}

Language:
${preferredLanguage?.trim() || 'Use the language implied by the brief; default to English.'}

${buildMediaPromptBlock(imageHints)}
${brandProfilePromptBlockTyped(brandProfile)}

Faithfulness target:
Match the /Users/livio/Desktop/sff prototype generator behavior: one fast, polished, complete single-file site that feels immediately shippable in the preview frame.`

const defaultGenerateHtml = async ({
  system,
  user,
  onToken,
}: GenerateHtmlInput): Promise<GenerateHtmlResult> => {
  const result = await groqStreamTyped(user, {
    system,
    temperature: 0.78,
    maxTokens: Math.min(9000, LLM_CONFIG.homepage.maxTokens),
    model: process.env.SHIP_FAST_V2_HTML_MODEL || HOMEPAGE_MODEL,
    onToken,
  })
  return { content: result.content, cost: result.cost }
}

export async function writeSffHtmlHome({
  workspace,
  prompt,
  siteSpec,
  preferredLanguage,
  imageHints,
  brandProfile,
  log,
  sessionCtx,
  generateHtml = defaultGenerateHtml,
}: WriteSffHtmlHomeInput) {
  const chunks: string[] = []
  const result = await generateHtml({
    system: SFF_HTML_SYSTEM_PROMPT,
    user: buildSffHtmlPrompt({
      prompt,
      siteSpec,
      preferredLanguage,
      imageHints,
      brandProfile,
    }),
    onToken: (token, accumulated) => {
      chunks.push(token)
      sessionCtx?.broadcast?.({
        type: 'source',
        text: accumulated,
      })
    },
  })
  const html = ensureLucideIconRuntimeTyped(
    sanitizeSffHtml(result.content),
    log,
  )

  if (!isCompleteSffHtml(html)) {
    throw new Error(
      'SFF HTML generation did not return a complete HTML document',
    )
  }

  writeFileSync(join(workspace, 'index.html'), html)
  writeFileSync(join(workspace, 'home.openui'), html)
  log?.(
    `  sff-html: ${html.length} chars generated${chunks.length ? ` in ${chunks.length} chunks` : ''}`,
  )

  return {
    chars: html.length,
    cost: result.cost ?? 0,
  }
}
