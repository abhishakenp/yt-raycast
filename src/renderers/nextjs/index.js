import {
  buildGlobalCss,
  renderCloneRuntimeModule,
  renderExactClonePageComponent,
  routeToNextSegments,
  serializeModule,
} from '../shared.js'

function renderNextPackageJson(projectName) {
  return JSON.stringify(
    {
      name: projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      private: true,
      version: '0.0.0',
      scripts: {
        dev: 'next dev',
        build: 'next build',
        start: 'next start',
      },
      dependencies: {
        next: '^14.2.15',
        react: '^18.3.1',
        'react-dom': '^18.3.1',
      },
    },
    null,
    2,
  )
}

function renderNextSectionRenderer() {
  return `'use client'

import { useMemo, useState } from 'react'
import SmartLink from './SmartLink'

function SectionIntro({ section }) {
  return (
    <>
      {section.subheadline ? <p className="eyebrow">{section.subheadline}</p> : null}
      {section.headline ? <h2>{section.headline}</h2> : null}
      {section.body ? <p className="section-body">{section.body}</p> : null}
    </>
  )
}

function ActionRow({ actions = [] }) {
  if (!actions.length) return null
  return (
    <div className="action-row">
      {actions.map((action) => (
        <SmartLink
          key={action.id || action.label}
          className={action.style === 'primary' ? 'button button--primary' : 'button'}
          href={action.href || '#'}
        >
          {action.label || 'Learn More'}
        </SmartLink>
      ))}
    </div>
  )
}

function CardGrid({ items = [] }) {
  return (
    <div className="card-grid">
      {items.map((item) => (
        <article key={item.id || item.title} className="card">
          <h3>{item.title || item.label || item.value}</h3>
          <p>{item.body || item.quote || ''}</p>
        </article>
      ))}
    </div>
  )
}

function NavbarSection({ section }) {
  const [open, setOpen] = useState(false)
  return (
    <header className={open ? 'site-header is-open' : 'site-header'}>
      <div className="container nav-shell">
        <SmartLink className="brand" href="/">
          {section.headline || 'Site'}
        </SmartLink>
        <button className="nav-toggle" type="button" onClick={() => setOpen((value) => !value)}>
          Menu
        </button>
        <nav className="nav-links">
          {(section.links || []).map((link) => (
            <SmartLink key={link.id || link.label} href={link.href || '#'}>
              {link.label || 'Link'}
            </SmartLink>
          ))}
          <div className="nav-actions">
            <ActionRow actions={section.actions} />
          </div>
        </nav>
      </div>
    </header>
  )
}

function HeroSection({ section }) {
  return (
    <section className={\`section hero hero--\${section.variant || 'default'}\`} id={section.id}>
      <div className="container hero-grid">
        <div>
          {section.subheadline ? <p className="eyebrow">{section.subheadline}</p> : null}
          <h1>{section.headline}</h1>
          {section.body ? <p className="section-body">{section.body}</p> : null}
          <ActionRow actions={section.actions} />
        </div>
        <div className="hero-panel">
          {(section.items || []).map((item) => (
            <div key={item.id || item.title} className="hero-chip">
              {item.title || item.label || item.value}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function StatsSection({ section }) {
  return (
    <section className="section stats" id={section.id}>
      <div className="container">
        <SectionIntro section={section} />
        <div className="stat-grid">
          {(section.items || []).map((item) => (
            <div key={item.id || item.label} className="stat-card">
              <strong>{item.value || item.title}</strong>
              <span>{item.label || item.body}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function PricingSection({ section }) {
  return (
    <section className="section pricing" id={section.id}>
      <div className="container">
        <SectionIntro section={section} />
        <div className="pricing-grid">
          {(section.items || []).map((item) => (
            <article key={item.id || item.title} className="pricing-card">
              <h3>{item.title}</h3>
              <div className="price">{item.price}</div>
              <p>{item.body}</p>
              <ul>
                {(item.features || []).map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function FaqSection({ section }) {
  const behavior = section.interactions?.[0]?.behavior || 'single'
  const [openIds, setOpenIds] = useState(() =>
    behavior === 'multi' ? [section.items?.[0]?.id].filter(Boolean) : section.items?.[0]?.id || null,
  )

  const isOpen = (id) => (Array.isArray(openIds) ? openIds.includes(id) : openIds === id)

  const toggle = (id) => {
    if (behavior === 'multi') {
      setOpenIds((current) => (current.includes(id) ? current.filter((value) => value !== id) : [...current, id]))
      return
    }
    setOpenIds((current) => (current === id ? null : id))
  }

  return (
    <section className="section faq" id={section.id}>
      <div className="container">
        <SectionIntro section={section} />
        <div className="faq-list">
          {(section.items || []).map((item, idx) => {
            const id = item.id || String(idx)
            return (
              <article key={id} className={isOpen(id) ? 'faq-item is-open' : 'faq-item'}>
                <button type="button" className="faq-trigger" onClick={() => toggle(id)}>
                  <span>{item.title}</span>
                  <span>+</span>
                </button>
                {isOpen(id) ? (
                  <div className="faq-content">
                    <p>{item.body}</p>
                  </div>
                ) : null}
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function ContactFormSection({ section }) {
  const successMessage = useMemo(() => section.form?.successMessage || 'Submitted successfully.', [section.form])
  const [message, setMessage] = useState('')

  return (
    <section className="section contact" id={section.id}>
      <div className="container contact-shell">
        <div>
          <SectionIntro section={section} />
        </div>
        <form
          className="contact-form"
          onSubmit={(event) => {
            event.preventDefault()
            setMessage(successMessage)
          }}
        >
          {(section.fields || []).map((field) => (
            <label key={field.name}>
              <span>{field.label}</span>
              {field.type === 'textarea' ? (
                <textarea name={field.name} placeholder={field.placeholder} required={field.required} />
              ) : (
                <input type={field.type || 'text'} name={field.name} placeholder={field.placeholder} required={field.required} />
              )}
            </label>
          ))}
          <button className="button button--primary" type="submit">
            Submit
          </button>
          <p className="form-message">{message}</p>
        </form>
      </div>
    </section>
  )
}

function FooterSection({ section }) {
  return (
    <footer className="site-footer" id={section.id}>
      <div className="container footer-shell">
        <div>
          <strong>{section.headline}</strong>
          {section.body ? <p>{section.body}</p> : null}
        </div>
        <nav className="footer-links">
          {(section.links || []).map((link) => (
            <SmartLink key={link.id || link.label} href={link.href || '#'}>
              {link.label || 'Link'}
            </SmartLink>
          ))}
        </nav>
      </div>
    </footer>
  )
}

export default function SectionRenderer({ section }) {
  switch (section.type) {
    case 'navbar':
      return <NavbarSection section={section} />
    case 'hero':
      return <HeroSection section={section} />
    case 'stats':
      return <StatsSection section={section} />
    case 'pricing':
      return <PricingSection section={section} />
    case 'faq':
      return <FaqSection section={section} />
    case 'contact-form':
      return <ContactFormSection section={section} />
    case 'footer':
      return <FooterSection section={section} />
    case 'cta':
      return (
        <section className="section cta" id={section.id}>
          <div className="container cta-shell">
            <div>
              <SectionIntro section={section} />
            </div>
            <ActionRow actions={section.actions} />
          </div>
        </section>
      )
    default:
      return (
        <section className="section" id={section.id}>
          <div className="container">
            <SectionIntro section={section} />
            <CardGrid items={section.items} />
          </div>
        </section>
      )
  }
}
`
}

function renderNextPageModule(pageId, depth = 1) {
  const prefix = '../'.repeat(depth + 1)
  return `import PageTemplate from '${prefix}components/PageTemplate'
import siteSpec from '${prefix}lib/site-spec'

const page = siteSpec.pages.find((entry) => entry.id === ${JSON.stringify(pageId)})

export default function GeneratedPage() {
  return <PageTemplate siteSpec={siteSpec} page={page} />
}
`
}

export function renderNextProject(siteSpec) {
  const files = {
    'package.json': renderNextPackageJson(siteSpec.projectName),
    'next.config.mjs': `/** @type {import('next').NextConfig} */
const nextConfig = {}

export default nextConfig
`,
    'app/layout.jsx': `import './globals.css'

export const metadata = {
  title: ${JSON.stringify(siteSpec.seo?.title || siteSpec.projectName)},
  description: ${JSON.stringify(siteSpec.seo?.description || '')},
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
`,
    'app/page.jsx': `import PageTemplate from '../components/PageTemplate'
import siteSpec from '../lib/site-spec'

const page = siteSpec.pages.find((entry) => entry.route === '/')

export default function HomePage() {
  return <PageTemplate siteSpec={siteSpec} page={page} />
}
`,
    'app/globals.css': buildGlobalCss(siteSpec.theme),
    'lib/clone-runtime.js': renderCloneRuntimeModule(),
    'lib/site-spec.js': `const siteSpec = ${serializeModule(siteSpec)}

export default siteSpec
`,
    'components/ExactClonePage.jsx': renderExactClonePageComponent({ mode: 'nextjs' }),
    'components/PageTemplate.jsx': `import ExactClonePage from './ExactClonePage'
import SectionRenderer from './SectionRenderer'

export default function PageTemplate({ siteSpec, page }) {
  if (!page) {
    return (
      <main className="empty-state">
        <div>
          <h1>Page not found</h1>
          <p>The site spec does not include this route.</p>
        </div>
      </main>
    )
  }

  if (page.renderBlueprint?.exactClone && page.renderBlueprint?.bodyHtml) {
    return <ExactClonePage page={page} />
  }

  return (
    <div className="site-shell">
      {page.sections.map((section) => (
        <SectionRenderer key={section.id} section={section} siteSpec={siteSpec} />
      ))}
    </div>
  )
}
`,
    'components/SectionRenderer.jsx': renderNextSectionRenderer(),
    'components/SmartLink.jsx': `import Link from 'next/link'

export default function SmartLink({ href = '#', children, ...props }) {
  const internal = href.startsWith('/')
  if (!internal) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    )
  }
  return (
    <Link href={href} {...props}>
      {children}
    </Link>
  )
}
`,
  }

  for (const page of siteSpec.pages || []) {
    if (page.route === '/') continue
    const segments = routeToNextSegments(page.route)
    const dir = ['app', ...segments].join('/')
    files[`${dir}/page.jsx`] = renderNextPageModule(page.id, segments.length)
  }

  return { files }
}
