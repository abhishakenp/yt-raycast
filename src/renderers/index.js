import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { renderHtmlProject } from './html/index.js'
import { renderProjectReadme } from './shared.js'
import { prepareSiteSpecForReliableRender } from './site-spec-prepare.js'

export { prepareSiteSpecForReliableRender } from './site-spec-prepare.js'

export function renderProject(siteSpec, target, session) {
  prepareSiteSpecForReliableRender(siteSpec)
  if (target !== 'html') {
    throw new Error(`Unsupported render target: ${target}. Only 'html' is supported (vanilla project).`)
  }
  const rendered = renderHtmlProject(siteSpec)

  return {
    ...rendered,
    files: {
      ...rendered.files,
      'README.md': renderProjectReadme(siteSpec, target),
    },
  }
}

export function writeRenderedFiles(baseDir, files) {
  for (const [relativePath, content] of Object.entries(files)) {
    const fullPath = join(baseDir, relativePath)
    mkdirSync(dirname(fullPath), { recursive: true })
    writeFileSync(fullPath, content)
  }
}

/**
 * @param {object} [options]
 * @param {string[]} [options.skipFiles] — additional relative paths to skip
 */
export function renderPreviewToWorkspace(siteSpec, workspace, session, options = {}) {
  prepareSiteSpecForReliableRender(siteSpec)
  const { files } = renderHtmlProject(siteSpec)
  const skip = new Set(options.skipFiles || [])
  const filtered = Object.fromEntries(Object.entries(files).filter(([path]) => !skip.has(path)))
  writeRenderedFiles(workspace, filtered)
  return { files: filtered }
}

/** Vanilla project is HTML-only — this is a no-op kept for runner compatibility. */
export function writeNextAppToWorkspace(siteSpec, workspace, session, options = {}) {
  return renderPreviewToWorkspace(siteSpec, workspace, session, options)
}
