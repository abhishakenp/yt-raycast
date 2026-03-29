import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { routeToHtmlFile } from '../renderers/shared.js'

function parseAttributes(fragment = '') {
  const attrs = {}
  const attrRegex = /([:@a-zA-Z0-9_-]+)(?:\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g
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
  const regex = new RegExp(`<${tagName}\\b([^>]*)>([\\s\\S]*?)<\\/${tagName}>`, 'gi')
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

function extractHeadInner(html = '') {
  return html.match(/<head[^>]*>([\s\S]*?)<\/head>/i)?.[1] || ''
}

function extractBodyInner(html = '') {
  return html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] || ''
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

export function extractRenderBlueprintFromHtml(html = '', fallback = {}) {
  const headInner = extractHeadInner(html)
  const bodyInner = extractBodyInner(html)

  const title = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() || fallback.title || ''
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
    bodyHtml: stripScripts(bodyInner),
    htmlAttributes: extractOpeningTagAttributes(html, 'html'),
    bodyAttributes: extractOpeningTagAttributes(html, 'body'),
    originalHtmlDocument: html,
  }
}

export function enrichSiteSpecWithWorkspaceBlueprints(siteSpec, workspace) {
  if (!siteSpec?.pages?.length) return siteSpec

  return {
    ...siteSpec,
    pages: siteSpec.pages.map((page) => {
      const filename = routeToHtmlFile(page.route)
      const filePath = join(workspace, filename)
      if (!existsSync(filePath)) {
        return { ...page, renderBlueprint: null }
      }

      const html = readFileSync(filePath, 'utf-8')
      return {
        ...page,
        renderBlueprint: extractRenderBlueprintFromHtml(html, {
          title: page.seo?.title || page.title,
        }),
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
