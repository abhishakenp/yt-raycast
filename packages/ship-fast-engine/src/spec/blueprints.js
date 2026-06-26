import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { routeToHtmlFile } from '../renderers/shared.js'

function stripEditorArtifacts(source = '') {
  return String(source)
    .replace(
      /<script>window\.__SF_PREVIEW_SESSION_ID__=[^<]*<\/script>\s*/gi,
      '',
    )
    .replace(/<script>window\.__SF_PREVIEW_AI__=[^<]*<\/script>\s*/gi, '')
    .replace(/<script\b[^>]*data-sf-preview-tools="1"[^>]*><\/script>/gi, '')
    .replace(
      /<script\b[^>]*data-sf-editor-runtime="1"[^>]*>[\s\S]*?<\/script>/gi,
      '',
    )
    .replace(/\sdata-editable="true"/gi, '')
    .replace(/\sdata-editor-kind="[^"]*"/gi, '')
    .replace(/\sdata-editor-file="[^"]*"/gi, '')
    .replace(/\sdata-editor-hover="[^"]*"/gi, '')
    .replace(/\sdata-editor-selected="[^"]*"/gi, '')
    .replace(/\sdata-sf-edit-id="[^"]*"/gi, '')
    .replace(/\sdata-sf-edit-stable-id="[^"]*"/gi, '')
}

function parseAttributes(fragment = '') {
  const attrs = {}
  const attrRegex =
    /([:@a-zA-Z0-9_-]+)(?:\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g
  let match
  while ((match = attrRegex.exec(fragment))) {
    const [, key, , dq, sq, bare] = match
    attrs[key] = dq ?? sq ?? bare ?? true
  }
  return attrs
}

function extractOpeningTagAttributes(html = '', tagName) {
  const match = html.match(new RegExp(`<${tagName}\\b([^>]*)>`, 'i'))
  return match ? parseAttributes(match[1]) : {}
}

function collectTags(source = '', tagName) {
  const regex = new RegExp(
    `<${tagName}\\b([^>]*)>([\\s\\S]*?)<\\/${tagName}>`,
    'gi',
  )
  const items = []
  let match
  while ((match = regex.exec(source))) {
    items.push({
      attrs: parseAttributes(match[1]),
      content: match[2] || '',
      raw: match[0],
    })
  }
  return items
}

function collectVoidTags(source = '', tagName) {
  const regex = new RegExp(`<${tagName}\\b([^>]*)\\/?>`, 'gi')
  const items = []
  let match
  while ((match = regex.exec(source))) {
    items.push({
      attrs: parseAttributes(match[1]),
      raw: match[0],
    })
  }
  return items
}

function extractFragmentBody(html = '') {
  const t = String(html || '').trim()
  if (!t) return ''
  if (/^<!DOCTYPE/i.test(t) || /<html\b/i.test(t)) return ''
  return t
}

function extractHeadInner(html = '') {
  const src = String(html)
  const openMatch = src.match(/<head\b[^>]*>/i)
  if (!openMatch) return ''
  const start = openMatch.index + openMatch[0].length
  const lower = src.toLowerCase()
  const closeIdx = lower.lastIndexOf('</head>')
  if (closeIdx === -1 || closeIdx < start) return ''
  return src.slice(start, closeIdx)
}

function extractBodyInner(html = '') {
  const src = String(html)
  const openMatch = src.match(/<body\b[^>]*>/i)
  if (!openMatch) {
    return extractFragmentBody(src)
  }
  const start = openMatch.index + openMatch[0].length
  const lower = src.toLowerCase()
  const closeIdx = lower.lastIndexOf('</body>')
  if (closeIdx === -1 || closeIdx < start) return ''
  return src.slice(start, closeIdx)
}

function stripScripts(source = '') {
  return source.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').trim()
}

function stripTitleMeta(source = '') {
  return source
    .replace(/<title\b[^>]*>[\s\S]*?<\/title>/gi, '')
    .replace(/<meta\b[^>]*>/gi, '')
    .replace(/<link\b[^>]*>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .trim()
}

function fallbackBodyHtmlFromDocument(sanitizedHtml = '') {
  let s = String(sanitizedHtml || '')
  s = s.replace(/<!DOCTYPE[^>]*>/gi, '')
  s = s.replace(/<head\b[^>]*>[\s\S]*?<\/head>/gi, '')
  s = s.replace(/<\/?html\b[^>]*>/gi, '')
  const lower = s.toLowerCase()
  const bOpen = s.match(/<body\b[^>]*>/i)
  if (bOpen) {
    const start = bOpen.index + bOpen[0].length
    const close = lower.lastIndexOf('</body>')
    if (close > start) s = s.slice(start, close)
    else s = s.slice(start)
  }
  return stripScripts(s).trim()
}

export function extractRenderBlueprintFromHtml(html = '', fallback = {}) {
  const sanitizedHtml = stripEditorArtifacts(html)
  const headInner = extractHeadInner(sanitizedHtml)
  const bodyInner = extractBodyInner(sanitizedHtml)

  let bodyHtml = stripScripts(bodyInner)
  if (!bodyHtml.trim() && sanitizedHtml.trim()) {
    bodyHtml = fallbackBodyHtmlFromDocument(sanitizedHtml)
  }

  const title =
    sanitizedHtml.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() ||
    fallback.title ||
    ''
  const meta = collectVoidTags(headInner, 'meta').map((entry) => entry.attrs)
  const links = collectVoidTags(headInner, 'link').map((entry) => entry.attrs)
  const styles = collectTags(headInner, 'style').map((entry) => entry.content)
  const headScripts = collectTags(headInner, 'script').map((entry) => ({
    ...entry.attrs,
    content: entry.content?.trim() || '',
    location: 'head',
  }))
  const bodyScripts = collectTags(bodyInner, 'script').map((entry) => ({
    ...entry.attrs,
    content: entry.content?.trim() || '',
    location: 'body',
  }))

  return {
    version: 1,
    exactClone: true,
    title,
    meta,
    links,
    styles,
    headHtml: stripTitleMeta(stripScripts(headInner)),
    scripts: [...headScripts, ...bodyScripts],
    bodyHtml,
    htmlAttributes: extractOpeningTagAttributes(sanitizedHtml, 'html'),
    bodyAttributes: extractOpeningTagAttributes(sanitizedHtml, 'body'),
    originalHtmlDocument: sanitizedHtml,
  }
}

export function enrichSiteSpecWithWorkspaceBlueprints(siteSpec, workspace) {
  if (!siteSpec?.pages?.length) return siteSpec

  let indexHtml = ''
  const indexPath = join(workspace, 'index.html')
  if (existsSync(indexPath)) {
    try {
      indexHtml = readFileSync(indexPath, 'utf-8')
    } catch {
      indexHtml = ''
    }
  }

  return {
    ...siteSpec,
    pages: siteSpec.pages.map((page) => {
      const filename = routeToHtmlFile(page.route)
      const filePath = join(workspace, filename)
      if (!existsSync(filePath)) return { ...page, renderBlueprint: null }

      let html = readFileSync(filePath, 'utf-8')
      let blueprint = extractRenderBlueprintFromHtml(html, {
        title: page.seo?.title || page.title,
      })
      return {
        ...page,
        renderBlueprint: blueprint,
      }
    }),
  }
}

export function stripSiteSpecBlueprints(siteSpec) {
  if (!siteSpec?.pages?.length) return siteSpec
  return {
    ...siteSpec,
    pages: siteSpec.pages.map((page) => ({
      ...page,
      renderBlueprint: null,
    })),
  }
}
