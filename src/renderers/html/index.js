import {
  buildGlobalCss,
  buildHtmlRuntimeScript,
  escapeHtml,
  pageUsesExactClone,
  renderSectionHtml,
  routeToHtmlFile,
} from '../shared.js'

function renderPageDocument(siteSpec, page) {
  const sections = (page.sections || []).map((section) => renderSectionHtml(section)).join('\n')
  const title = escapeHtml(page.seo?.title || page.title || siteSpec.projectName)
  const description = escapeHtml(page.seo?.description || page.description || siteSpec.seo?.description || '')

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <link rel="stylesheet" href="./site.css" />
  </head>
  <body>
    <div class="site-shell">
      ${sections}
    </div>
    <script src="./site.js"></script>
  </body>
</html>`
}

export function renderHtmlProject(siteSpec) {
  const files = {
    'site.css': buildGlobalCss(siteSpec.theme),
    'site.js': buildHtmlRuntimeScript(),
  }

  for (const page of siteSpec.pages || []) {
    files[routeToHtmlFile(page.route)] = pageUsesExactClone(page)
      ? page.renderBlueprint.originalHtmlDocument
      : renderPageDocument(siteSpec, page)
  }

  return { files }
}
