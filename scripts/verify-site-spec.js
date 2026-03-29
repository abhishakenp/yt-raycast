import { buildFallbackSiteSpec, normalizeSiteSpec, validateSiteSpec } from '../src/spec/index.js'
import { renderProject } from '../src/renderers/index.js'

const spec = normalizeSiteSpec(
  buildFallbackSiteSpec({
    prompt: 'A modern SaaS launch site with pricing, docs, and contact pages.',
    ctx: {
      project_name: 'LaunchPilot',
      slug: 'launchpilot',
      site_type: 'saas',
      pages: ['Home', 'Pricing', 'Docs', 'Contact'],
      features: ['Auth', 'Billing', 'Exports'],
      mood: 'confident modern',
      typography: 'Inter + JetBrains Mono',
    },
    designBrief: 'Primary color #7c3aed, secondary #a78bfa, accent #22c55e.',
    siteType: 'saas',
  }),
  {
    prompt: 'A modern SaaS launch site with pricing, docs, and contact pages.',
    ctx: { project_name: 'LaunchPilot', pages: ['Home', 'Pricing', 'Docs', 'Contact'] },
    designBrief: '',
    siteType: 'saas',
  },
)

const validation = validateSiteSpec(spec)
if (!validation.valid) {
  console.error('Site spec validation failed:')
  for (const error of validation.errors) console.error(`- ${error}`)
  process.exit(1)
}

const requiredOutputs = {
  html: ['index.html', 'site.css', 'site.js'],
  react: [
    'package.json',
    'src/App.jsx',
    'src/components/SectionRenderer.jsx',
    'src/components/ExactClonePage.jsx',
    'src/lib/clone-runtime.js',
    'src/site-spec.js',
  ],
  nextjs: [
    'package.json',
    'app/layout.jsx',
    'components/SectionRenderer.jsx',
    'components/ExactClonePage.jsx',
    'lib/clone-runtime.js',
    'lib/site-spec.js',
  ],
}

for (const target of Object.keys(requiredOutputs)) {
  const { files } = renderProject(spec, target)
  for (const file of requiredOutputs[target]) {
    if (!files[file]) {
      console.error(`Missing "${file}" in ${target} renderer output`)
      process.exit(1)
    }
  }
}

const exactCloneSpec = normalizeSiteSpec(
  {
    ...spec,
    pages: spec.pages.map((page, index) =>
      index === 0
        ? {
            ...page,
            renderBlueprint: {
              version: 1,
              exactClone: true,
              title: 'LaunchPilot Clone',
              meta: [{ name: 'description', content: 'Exact clone test' }],
              links: [],
              styles: ['body { background: #010101; color: #fafafa; }'],
              headHtml: '',
              scripts: [],
              bodyHtml:
                '<main data-exact-clone="true"><h1>LaunchPilot</h1><a href="/pricing">Pricing</a></main>',
              htmlAttributes: { lang: 'en' },
              bodyAttributes: { class: 'clone-mode' },
              originalHtmlDocument: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>LaunchPilot Clone</title>
  </head>
  <body class="clone-mode">
    <main data-exact-clone="true"><h1>LaunchPilot</h1><a href="/pricing">Pricing</a></main>
  </body>
</html>`,
            },
          }
        : page,
    ),
  },
  {
    prompt: spec.userPrompt,
    ctx: { project_name: spec.projectName, pages: spec.pages.map((page) => page.name) },
    designBrief: '',
    siteType: spec.siteType,
  },
)

const reactExactClone = renderProject(exactCloneSpec, 'react').files
const nextExactClone = renderProject(exactCloneSpec, 'nextjs').files
const htmlExactClone = renderProject(exactCloneSpec, 'html').files

if (!reactExactClone['src/components/PageTemplate.jsx']?.includes('ExactClonePage')) {
  console.error('React renderer did not route exact-clone pages through ExactClonePage.')
  process.exit(1)
}

if (!nextExactClone['components/PageTemplate.jsx']?.includes('ExactClonePage')) {
  console.error('Next.js renderer did not route exact-clone pages through ExactClonePage.')
  process.exit(1)
}

if (!htmlExactClone['index.html']?.includes('data-exact-clone="true"')) {
  console.error('HTML renderer did not preserve the exact-clone document output.')
  process.exit(1)
}

console.log('Site spec validation and renderer verification passed.')
