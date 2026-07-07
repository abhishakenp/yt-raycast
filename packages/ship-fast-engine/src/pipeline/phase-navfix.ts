import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { groqParallel } from '../llm/groq.js'
import { stripFences, formatTps } from '../llm/utils.js'
import { ensureLucideIconRuntime } from './lucide-icons.js'
import { writeFile, slug } from './workspace.js'
import { navfixPrompt } from '../prompts/navfix.js'

interface GroqResult {
  inputTokens?: number
  outputTokens?: number
  cost?: number
  content?: string
  error?: string
}

interface NavTask {
  filename?: string
  title?: string
}

interface NavTarget {
  title: string
  filename: string
  slug: string
  tokens: string[]
}

function sumTokens(results: GroqResult[]): {
  inputTokens: number
  outputTokens: number
  cost: number
} {
  let inputTokens = 0
  let outputTokens = 0
  let cost = 0
  for (const r of results) {
    if (!r) continue
    inputTokens += r.inputTokens ?? 0
    outputTokens += r.outputTokens ?? 0
    cost += r.cost ?? 0
  }
  return { inputTokens, outputTokens, cost }
}

function normalizeLinkText(value = '') {
  return String(value)
    .replace(/&amp;/gi, '&')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

function buildNavTargets(tasks: NavTask[] = []): NavTarget[] {
  const targets: NavTarget[] = []
  for (const task of tasks) {
    if (!task?.filename || task.filename === 'index.html') continue
    const title = String(
      task.title || task.filename.replace(/\.html$/i, ''),
    ).trim()
    targets.push({
      title,
      filename: task.filename,
      slug: slug(title),
      tokens: normalizeLinkText(title).split(/\s+/).filter(Boolean),
    })
  }
  return targets
}

const LINK_ALIASES = [
  {
    re: /\b(shop|store|catalog|products?|collections?)\b/i,
    prefer: /shop|store|catalog|product/i,
  },
  { re: /\b(cart|bag|basket)\b/i, prefer: /cart|bag|checkout/i },
  { re: /\b(checkout|pay)\b/i, prefer: /checkout|cart/i },
  { re: /\b(blog|articles?|news|journal)\b/i, prefer: /blog|article|news/i },
  { re: /\b(about|story|company)\b/i, prefer: /about|story|company/i },
  { re: /\b(contact|support|help)\b/i, prefer: /contact|support|help/i },
  {
    re: /\b(account|sign in|login|profile)\b/i,
    prefer: /account|sign|login|profile|auth/i,
  },
  { re: /\b(product details?|pdp|item)\b/i, prefer: /product|details|pdp/i },
]

function resolveNavFilename(
  label: string,
  targets: NavTarget[],
): string | null {
  if (!label || !targets.length) return null
  const norm = normalizeLinkText(label)
  if (!norm || norm === 'home' || norm === 'homepage') return 'index.html'

  const exact = targets.find(
    (t) => t.slug === slug(label) || normalizeLinkText(t.title) === norm,
  )
  if (exact) return exact.filename

  for (const target of targets) {
    if (
      norm.includes(target.slug.replace(/-/g, ' ')) ||
      target.slug.includes(norm.replace(/\s+/g, '-'))
    ) {
      return target.filename
    }
  }

  for (const alias of LINK_ALIASES) {
    if (!alias.re.test(norm)) continue
    const hit = targets.find(
      (t) => alias.prefer.test(t.title) || alias.prefer.test(t.filename),
    )
    if (hit) return hit.filename
  }

  let best: NavTarget | null = null
  let bestScore = 0
  const words = norm.split(/\s+/).filter(Boolean)
  for (const target of targets) {
    let score = 0
    for (const word of words) {
      if (target.tokens.includes(word)) score += 2
      if (target.slug.includes(word)) score += 1
    }
    if (score > bestScore) {
      bestScore = score
      best = target
    }
  }
  return bestScore >= 2 ? (best?.filename ?? null) : null
}

function rewriteHref(tag: string, filename: string): string {
  if (!filename) return tag
  if (/\bhref\s*=/.test(tag)) {
    return tag.replace(/\bhref\s*=\s*(["'])[^"']*\1/i, `href="${filename}"`)
  }
  return tag.replace(/^<a\b/i, `<a href="${filename}"`)
}

/**
 * Wire placeholder nav/footer links to generated sibling HTML files.
 * Keeps in-iframe preview navigation working without LLM nav-fix pass.
 */
export function wireHomepageNavLinks(
  html: string,
  tasks: NavTask[] = [],
): string {
  if (!html || typeof html !== 'string') return html
  const targets = buildNavTargets(tasks)
  if (!targets.length) return html

  let next = html.replace(
    /<a\b([^>]*?)>([\s\S]*?)<\/a>/gi,
    (full, attrs, inner) => {
      const hrefMatch = attrs.match(/\bhref\s*=\s*(["'])([^"']*)\1/i)
      const href = hrefMatch?.[2] ?? ''
      if (href && !/^#(?:|$)/.test(href) && href !== '' && href !== '/')
        return full

      const label = normalizeLinkText(inner)
      const filename = resolveNavFilename(label, targets)
      if (!filename || filename === href) return full
      return `${rewriteHref(`<a${attrs}>`, filename)}${inner}</a>`
    },
  )

  // Map absolute-ish paths like /shop or /blog to shop.html when we have that page.
  next = next.replace(/<a\b([^>]*?)>/gi, (full, attrs) => {
    const hrefMatch = attrs.match(/\bhref\s*=\s*(["'])([^"']*)\1/i)
    if (!hrefMatch) return full
    const href = hrefMatch[2]
    if (
      !href ||
      href.startsWith('http') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:')
    ) {
      return full
    }
    const pathSlug = slug(
      href
        .replace(/^\.\/?/, '')
        .replace(/\.html$/i, '')
        .split('/')
        .pop() || '',
    )
    if (!pathSlug) return full
    const target = targets.find((t) => t.slug === pathSlug)
    if (!target || target.filename === href) return full
    return rewriteHref(full, target.filename)
  })

  return next
}

export async function fixHomepageNav(
  navList: string,
  workspace: string,
  log: (msg: string) => void,
  tasks: NavTask[] = [],
): Promise<{
  count: number
  inputTokens: number
  outputTokens: number
  cost: number
}> {
  const filePath = join(workspace, 'index.html')
  const fileContent = readFileSync(filePath, 'utf-8')
  const wired = wireHomepageNavLinks(fileContent, tasks)
  if (wired !== fileContent) {
    writeFile(workspace, 'index.html', wired)
    log('  ✓ homepage nav links wired to generated pages')
    return { count: 1, inputTokens: 0, outputTokens: 0, cost: 0 }
  }

  // Optional LLM nav-fix pass (off by default — programmatic wiring is enough for most runs).
  const NAV_FIX_ENABLED = process.env.SHIPFAST_NAV_FIX === '1'
  if (!NAV_FIX_ENABLED) {
    return { count: 0, inputTokens: 0, outputTokens: 0, cost: 0 }
  }

  log('\n  ── Fixing homepage nav links (LLM) ──')
  const { system, prompt, temperature, maxTokens } = navfixPrompt(
    navList,
    fileContent,
  )
  const [result] = await groqParallel([
    { system, prompt, temperature, maxTokens },
  ])

  if (result?.content && !result.error) {
    const cleaned = ensureLucideIconRuntime(stripFences(result.content), log)
    if (cleaned.startsWith('<') || cleaned.includes('<!DOCTYPE')) {
      writeFile(workspace, 'index.html', cleaned)
      const tpsStr = formatTps(result) ? ` | ${formatTps(result)}` : ''
      log(`  fixed: index.html${tpsStr}`)
    } else {
      log(`  skipped: nav fix response wasn't valid HTML`)
    }
  }

  return { count: 1, ...sumTokens([result]) }
}
