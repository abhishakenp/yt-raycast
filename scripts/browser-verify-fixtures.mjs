import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildFallbackSiteSpec } from '../src/spec/defaults.js'
import { renderPreviewToWorkspace } from '../src/renderers/index.js'
import { injectInstitutionalLightChrome } from '../src/pipeline/phase-homepage.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outRoot = join(__dirname, '../assets/brandfetch-proof/browser-verify')

const LOGO_INSTACART = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 52" fill="none"><path d="M10 38 L18 14 L26 38" stroke="#FF7009" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/><text x="36" y="36" font-family="system-ui,-apple-system,sans-serif" font-weight="800" font-size="26" fill="#0AAD0A">instacart</text></svg>`

const LOGO_KHALTI = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 52" fill="none"><path d="M102 10 L118 22 L102 18 Z" fill="#F69931"/><path d="M108 8 L124 4 L118 20 Z" fill="#DC0019"/><text x="8" y="36" font-family="system-ui,-apple-system,sans-serif" font-weight="800" font-size="30" fill="#DC0019">khalti</text><text x="8" y="48" font-family="system-ui,-apple-system,sans-serif" font-size="10" fill="#64748b">by IME</text><rect x="8" y="42" width="92" height="4" rx="1" fill="#582E80"/></svg>`

const LOGO_SAIL = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 48" fill="none"><rect x="4" y="8" width="52" height="32" rx="4" fill="#0c4a6e"/><text x="14" y="30" font-family="system-ui,-apple-system,sans-serif" font-weight="800" font-size="16" fill="#ffffff">SAIL</text><text x="64" y="30" font-family="system-ui,-apple-system,sans-serif" font-weight="700" font-size="13" fill="#0c4a6e">Steel Authority of India Limited</text></svg>`

function patchBrandLogo(siteSpec, logo) {
  const payload =
    logo.kind === 'svg'
      ? { kind: 'svg', svg: logo.svg, alt: String(logo.alt || '').trim() || 'Brand' }
      : { kind: 'remote', src: String(logo.src || '').trim(), alt: String(logo.alt || '').trim() || 'Brand' }
  if (payload.kind === 'remote' && !payload.src) return
  if (payload.kind === 'svg' && !payload.svg) return
  for (const page of siteSpec.pages || []) {
    for (const sec of page.sections || []) {
      if (sec.type !== 'navbar' && sec.type !== 'footer') continue
      sec.styling = { ...(sec.styling || {}), brandLogo: payload }
    }
  }
}

function patchTheme(siteSpec, colors) {
  siteSpec.theme = siteSpec.theme || {}
  siteSpec.theme.colors = { ...(siteSpec.theme.colors || {}), ...colors }
  siteSpec.theme.tailwind = {
    ...(siteSpec.theme.tailwind || {}),
    primary: colors.primary,
    secondary: colors.secondary,
    accent: colors.accent,
  }
  if (colors.background?.startsWith('#f')) {
    siteSpec.theme.appearance = { darkMode: false, lightMode: true }
  }
}

const cases = [
  {
    slug: 'instacart',
    prompt:
      'Marketing landing page for Instacart — same-day grocery delivery from local stores; consumer brand, bright green identity',
    siteType: 'landing',
    ctx: {
      project_name: 'Instacart',
      tagline: 'Groceries delivered in as fast as one hour.',
      features: ['Local stores', 'Real-time tracking', 'Membership savings'],
    },
    logo: { kind: 'svg', svg: LOGO_INSTACART, alt: 'Instacart' },
    theme: {
      primary: '#0AAD0A',
      secondary: '#004E3A',
      accent: '#FF7009',
      background: '#f4fbf4',
      surface: '#ffffff',
      border: '#c8e6c9',
      text: '#0b0b0b',
      mutedText: '#1b5e20',
    },
    institutional: false,
  },
  {
    slug: 'khalti',
    prompt: 'Fintech landing for Khalti — digital wallet and payments in Nepal; modern trustworthy UI',
    siteType: 'landing',
    ctx: {
      project_name: 'Khalti',
      tagline: 'Pay bills, send money, and shop from your phone.',
      features: ['Instant transfers', 'Bill pay', 'Merchant network'],
    },
    logo: { kind: 'svg', svg: LOGO_KHALTI, alt: 'Khalti' },
    theme: {
      primary: '#DC0019',
      secondary: '#582E80',
      accent: '#F69931',
      background: '#fffafa',
      surface: '#ffffff',
      border: '#f5ccd0',
      text: '#1a0a0f',
      mutedText: '#582E80',
    },
    institutional: false,
  },
  {
    slug: 'sail-psu',
    prompt:
      'Official institutional portal for Steel Authority of India Limited (SAIL) — PSU public sector steel; notices, tenders, careers',
    siteType: 'institutional',
    ctx: {
      project_name: 'Steel Authority of India Limited',
      tagline: 'Official information for stakeholders, investors, and citizens.',
      features: ['Notices', 'Tenders', 'CSR', 'Careers'],
    },
    logo: { kind: 'svg', svg: LOGO_SAIL, alt: 'Steel Authority of India Limited' },
    theme: {
      primary: '#0c4a6e',
      secondary: '#075985',
      accent: '#c2410c',
      background: '#f8fafc',
      surface: '#ffffff',
      border: '#cbd5e1',
      text: '#0f172a',
      mutedText: '#475569',
    },
    institutional: true,
  },
]

for (const c of cases) {
  let siteSpec = buildFallbackSiteSpec({
    prompt: c.prompt,
    ctx: c.ctx,
    siteType: c.siteType,
  })
  patchBrandLogo(siteSpec, c.logo)
  patchTheme(siteSpec, c.theme)
  const dir = join(outRoot, c.slug)
  mkdirSync(dir, { recursive: true })
  renderPreviewToWorkspace(siteSpec, dir)
  if (c.institutional) {
    const fp = join(dir, 'index.html')
    let html = readFileSync(fp, 'utf8')
    html = injectInstitutionalLightChrome(html, c.prompt)
    writeFileSync(fp, html)
  }
}

console.log(`Wrote ${cases.length} fixtures under ${outRoot}`)
