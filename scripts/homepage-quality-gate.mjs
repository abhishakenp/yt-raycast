#!/usr/bin/env node
import { existsSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { basename, dirname, join, resolve } from 'node:path'

const args = new Map(
  process.argv.slice(2).map((arg) => {
    const [key, ...rest] = arg.split('=')
    return [key, rest.join('=') || '1']
  }),
)

const htmlPathArg =
  args.get('--html') ??
  args.get('--file') ??
  args.get('--workspace') ??
  process.env.SHIP_FAST_HOMEPAGE_HTML ??
  process.env.SHIP_FAST_VERIFY_WORKSPACE
const minScore = Number(args.get('--min-score') ?? 80)
const minSections = Number(args.get('--min-sections') ?? 4)
const minWords = Number(args.get('--min-words') ?? 120)
const writeReport = /^(1|true|yes)$/i.test(String(args.get('--write-report') ?? '0'))

if (!htmlPathArg) {
  fail('Missing --html=<index.html> or --workspace=<generated workspace>.')
}

if (!Number.isFinite(minScore) || minScore < 1 || minScore > 100) {
  fail('--min-score must be between 1 and 100')
}

const htmlPath = resolveHtmlPath(htmlPathArg)
const html = readFileSync(htmlPath, 'utf8')
const report = evaluateHomepage(html, { minSections, minWords })

if (writeReport) {
  writeFileSync(
    join(dirname(htmlPath), 'homepage-quality-gate.json'),
    `${JSON.stringify(report, null, 2)}\n`,
  )
}

if (report.score < minScore || report.errors.length > 0) {
  console.error(JSON.stringify({ ok: false, htmlPath, ...report }, null, 2))
  process.exit(1)
}

console.log(JSON.stringify({ ok: true, htmlPath, ...report }, null, 2))

function resolveHtmlPath(value) {
  const candidate = resolve(value)
  if (!existsSync(candidate)) fail(`Path does not exist: ${candidate}`)
  const stat = statSync(candidate)
  const resolved = stat.isDirectory() ? join(candidate, 'index.html') : candidate
  if (!existsSync(resolved)) fail(`index.html not found: ${resolved}`)
  return resolved
}

function fail(message) {
  console.error(JSON.stringify({ ok: false, errors: [message] }, null, 2))
  process.exit(1)
}

function evaluateHomepage(html, options) {
  const stripped = stripTags(html)
  const words = stripped.match(/[\p{L}\p{N}][\p{L}\p{N}'-]{2,}/gu) ?? []
  const sectionCount = countMatches(html, /<(section|article|main|header|footer)\b/gi)
  const headings = countMatches(html, /<h[1-3]\b/gi)
  const links = countMatches(html, /<a\b[^>]*href=/gi)
  const buttons = countMatches(html, /<(button)\b/gi)
  const media = countMatches(html, /<(img|picture|video|canvas|svg)\b/gi)
  const hasTitle = /<title\b[^>]*>[^<]{4,}<\/title>/i.test(html)
  const hasDescription =
    /<meta\b[^>]*name=["']description["'][^>]*content=["'][^"']{20,}["']/i.test(html) ||
    /<meta\b[^>]*content=["'][^"']{20,}["'][^>]*name=["']description["']/i.test(html)
  const hasViewport = /<meta\b[^>]*name=["']viewport["']/i.test(html)
  const hasPrimaryMain = /<main\b/i.test(html)
  const lowerHtml = html.toLowerCase()
  const lowerText = stripped.toLowerCase()
  const failureLeaks = [
    'openui-error',
    'failed to render',
    'cannot read properties',
    'functionpathnotfound',
    'generation failed',
    'fetch failed',
    'runtime error',
    'uncaught error',
    'typeerror:',
    'referenceerror:',
    'syntaxerror:',
  ].filter((needle) => lowerHtml.includes(needle))
  const placeholderLeaks = [
    'lorem ipsum',
    'todo',
    'placeholder',
    'waiting for generated module',
  ].filter((needle) => lowerText.includes(needle))

  const checks = [
    scored('metadata.title', hasTitle, 10),
    scored('metadata.description', hasDescription, 10),
    scored('metadata.viewport', hasViewport, 5),
    scored('structure.main', hasPrimaryMain, 10),
    scored('structure.sections', sectionCount >= options.minSections, 15, {
      sectionCount,
      expected: options.minSections,
    }),
    scored('content.words', words.length >= options.minWords, 15, {
      words: words.length,
      expected: options.minWords,
    }),
    scored('content.headings', headings >= 2, 10, { headings }),
    scored('actions.links_or_buttons', links + buttons >= 2, 10, {
      links,
      buttons,
    }),
    scored('media.visual_assets', media >= 1, 10, { media }),
    scored('quality.no_runtime_failures', failureLeaks.length === 0, 20, {
      failureLeaks,
    }),
    scored('quality.no_placeholder_leaks', placeholderLeaks.length === 0, 15, {
      placeholderLeaks,
    }),
  ]

  const score = checks.reduce((sum, check) => sum + (check.pass ? check.points : 0), 0)
  const total = checks.reduce((sum, check) => sum + check.points, 0)
  const normalizedScore = Math.round((score / total) * 100)
  const errors = checks
    .filter((check) => !check.pass && check.points >= 15)
    .map((check) => `${check.name} failed`)

  return {
    score: normalizedScore,
    source: basename(htmlPath),
    summary: {
      words: words.length,
      sectionCount,
      headings,
      links,
      buttons,
      media,
    },
    checks,
    errors,
  }
}

function scored(name, pass, points, details = {}) {
  return { name, pass: Boolean(pass), points, ...details }
}

function countMatches(value, pattern) {
  return (value.match(pattern) ?? []).length
}

function stripTags(value) {
  return value
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z0-9#]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}
