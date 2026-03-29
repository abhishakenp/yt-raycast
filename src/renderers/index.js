import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { renderHtmlProject } from './html/index.js'
import { renderReactProject } from './react/index.js'
import { renderNextProject } from './nextjs/index.js'

export function renderProject(siteSpec, target) {
  switch (target) {
    case 'html':
      return renderHtmlProject(siteSpec)
    case 'react':
      return renderReactProject(siteSpec)
    case 'nextjs':
      return renderNextProject(siteSpec)
    default:
      throw new Error(`Unsupported render target: ${target}`)
  }
}

export function writeRenderedFiles(baseDir, files) {
  for (const [relativePath, content] of Object.entries(files)) {
    const fullPath = join(baseDir, relativePath)
    mkdirSync(dirname(fullPath), { recursive: true })
    writeFileSync(fullPath, content)
  }
}

export function renderPreviewToWorkspace(siteSpec, workspace) {
  const { files } = renderHtmlProject(siteSpec)
  writeRenderedFiles(workspace, files)
  return { files }
}
