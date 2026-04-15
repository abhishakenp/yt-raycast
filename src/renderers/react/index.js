import {
  buildGlobalCss,
  escapeHtml,
  pageComponentName,
  renderCloneRuntimeModule,
  renderExactClonePageComponent,
  serializeModule,
  slimSiteSpecForBundle,
} from '../shared.js'
import { renderGeneratedSiteLlmsTxt } from '../llms-txt.js'
import {
  buildStructuredData,
  renderRobotsTxt,
  renderSitemapXml,
  resolvePageSeo,
  serializeStructuredData,
} from '../seo.js'
import { shouldUseSwiper } from '../../lib/swiper-policy.js'
import { SHIP_FAST_SITE_URL } from '../../marketing.js'

function renderReactPackageJson(projectName, extraDependencies = {}) {
  return JSON.stringify(
    {
      name: projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      private: true,
      version: '0.0.0',
      type: 'module',
      packageManager: 'bun@1.2.5',
      scripts: {
        dev: 'vite',
        build: 'vite build',
        preview: 'vite preview',
      },
      dependencies: {
        'framer-motion': '^12.38.0',
        react: '^18.3.1',
        'react-dom': '^18.3.1',
        'react-router-dom': '^6.28.0',
        ...extraDependencies,
      },
      devDependencies: {
        '@vitejs/plugin-react': '^4.3.3',
        vite: '^5.4.10',
      },
    },
    null,
    2,
  )
}

function renderReactPage(page, componentName) {
  return `import PageTemplate from '../components/PageTemplate'
import siteSpec from '../site-spec'

const page = siteSpec.pages.find((entry) => entry.id === ${JSON.stringify(page.id)})

export default function ${componentName}() {
  return <PageTemplate siteSpec={siteSpec} page={page} />
}
`
}

function renderReactApp(siteSpec) {
  const lazyPages = siteSpec.pages
    .map((page) => {
      const component = pageComponentName(page)
      return `const ${component} = lazy(() => import('./pages/${component}.jsx'))`
    })
    .join('\n')
  const routes = siteSpec.pages
    .map((page) => {
      const component = pageComponentName(page)
      return `        <Route path=${JSON.stringify(page.route)} element={<${component} />} />`
    })
    .join('\n')

  return `import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
${lazyPages}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={null}>
        <Routes>
${routes}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
`
}

function renderReactSectionRenderer(siteSpec) {
  const useSwiperExport = shouldUseSwiper(siteSpec)
  const useMarqueeExport = !useSwiperExport && siteSpec.siteType === 'ecommerce'
  const swiperImportBlock = useSwiperExport
    ? `import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'

`
    : ''
  const productMarqueeTrackBlock = useMarqueeExport
    ? `function ProductMarqueeTrack({ children }) {
  const reduceMotion = useReducedMotion()
  if (reduceMotion) {
    return (
      <div className="product-carousel__mask product-carousel__mask--scroll">
        <div className="product-carousel__track product-carousel__track--static">{children}</div>
      </div>
    )
  }
  return (
    <div className="product-carousel__mask">
      <motion.div
        className="product-carousel__track product-carousel__track--motion"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 50, repeat: Infinity, ease: 'linear', repeatType: 'loop' }}
        style={{ willChange: 'transform' }}
      >
        {children}
      </motion.div>
    </div>
  )
}

`
    : ''
  return `${swiperImportBlock}import { useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import SmartLink from './SmartLink'

const USE_PRODUCT_SWIPER = ${useSwiperExport ? 'true' : 'false'}
const USE_PRODUCT_MARQUEE = ${useMarqueeExport ? 'true' : 'false'}

${productMarqueeTrackBlock}

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
        <article key={item.id || item.title} className="card" data-reveal>
          <h3>{item.title || item.label || item.value}</h3>
          <p>{item.body || item.quote || ''}</p>
        </article>
      ))}
    </div>
  )
}

function NavbarSection({ section, siteSpec }) {
  const [open, setOpen] = useState(false)
  const isStore = siteSpec?.siteType === 'ecommerce'
  const brandLogo = section?.styling?.brandLogo
  return (
    <>
      {isStore ? (
        <div className="store-promo-bar">
          <div className="container store-promo-bar__inner">
            <span className="store-promo-bar__msg">Free shipping on orders over $75 · Easy returns</span>
          </div>
        </div>
      ) : null}
      <header
        className={\`\${open ? 'site-header is-open' : 'site-header'}\${isStore ? ' site-header--store' : ''}\`}
      >
        <div className="container nav-shell">
          <SmartLink className="brand" href="/">
            {brandLogo?.kind === 'remote' && brandLogo.src ? (
              <span className="brand-logo" aria-hidden={false}>
                <img src={brandLogo.src} alt={brandLogo.alt || 'Company logo'} decoding="async" loading="eager" />
              </span>
            ) : brandLogo?.kind === 'svg' && brandLogo.svg ? (
              <span className="brand-logo" aria-hidden={false} dangerouslySetInnerHTML={{ __html: brandLogo.svg }} />
            ) : null}
            <span className="brand-name">{section.headline || 'Site'}</span>
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
            {isStore ? (
              <div className="store-nav-tools">
                <label className="store-search">
                  <span className="visually-hidden">Search products</span>
                  <input type="search" className="store-search__input" placeholder="Search products…" autoComplete="off" />
                </label>
                <SmartLink className="store-account" href="/account">
                  Account
                </SmartLink>
              </div>
            ) : null}
            <div className="nav-actions">
              <ActionRow actions={section.actions} />
            </div>
          </nav>
        </div>
      </header>
    </>
  )
}

function HeroSection({ section, siteSpec }) {
  const isStore = siteSpec?.siteType === 'ecommerce'
  const heroImg = section.heroImage || section.imageUrl || section.image
  return (
    <section
      className={\`section hero hero--\${section.variant || 'default'}\${isStore ? ' hero--store' : ''}\`}
      id={section.id}
    >
      <div className="container hero-grid">
        <div>
          {section.subheadline ? <p className="eyebrow">{section.subheadline}</p> : null}
          <h1>{section.headline}</h1>
          {section.body ? <p className="section-body">{section.body}</p> : null}
          <ActionRow actions={section.actions} />
        </div>
        <div className="hero-panel">
          {heroImg ? (
            <figure className="hero-figure">
              <img
                className="hero-image"
                src={heroImg}
                alt={section.imageAlt || ''}
                loading="eager"
                decoding="async"
              />
            </figure>
          ) : null}
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
            <div key={item.id || item.label} className="stat-card" data-reveal>
              <span className="stat-card__label">{item.label || item.body}</span>
              <strong className="stat-card__value">{item.value || item.title}</strong>
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
            <article key={item.id || item.title} className="pricing-card" data-reveal>
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

function TestimonialsSection({ section }) {
  return (
    <section className="section testimonials" id={section.id}>
      <div className="container">
        <SectionIntro section={section} />
        <div className="card-grid">
          {(section.items || []).map((item) => (
            <blockquote key={item.id || item.author} className="card quote-card" data-reveal>
              <p>“{item.quote || item.body}”</p>
              <footer>{item.author || item.title}</footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  )
}

function LogoCloudSection({ section }) {
  return (
    <section className="section logo-cloud" id={section.id}>
      <div className="container">
        <SectionIntro section={section} />
        <div className="logo-row">
          {(section.items || []).map((item) => (
            <span key={item.id || item.title} className="logo-pill">
              {item.title || item.label}
            </span>
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

function ShipFastFooterLogo() {
  return (
    <span className="footer-branding__logo" aria-hidden="true">
      <svg viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M26 4L8 20L14 22L26 10L38 22L44 20L26 4Z" fill="url(#sfr-g1)" opacity="0.9" />
        <path d="M14 22L14 40L22 36V24L14 22Z" fill="url(#sfr-g2)" opacity="0.8" />
        <path d="M38 22L38 40L30 36V24L38 22Z" fill="url(#sfr-g2)" opacity="0.8" />
        <path d="M22 24V36L26 38L30 36V24L26 20L22 24Z" fill="url(#sfr-g1)" />
        <path d="M22 38L26 48L30 38L26 40L22 38Z" fill="#a78bfa" opacity="0.7" />
        <circle cx="26" cy="16" r="2" fill="#c4b5fd" />
        <defs>
          <linearGradient id="sfr-g1" x1="8" y1="4" x2="44" y2="48" gradientUnits="userSpaceOnUse">
            <stop stopColor="#7c3aed" />
            <stop offset="1" stopColor="#a78bfa" />
          </linearGradient>
          <linearGradient id="sfr-g2" x1="14" y1="22" x2="38" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6d28d9" />
            <stop offset="1" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
      </svg>
    </span>
  )
}

function FooterSection({ section }) {
  const brandLogo = section?.styling?.brandLogo
  return (
    <footer className="site-footer" id={section.id}>
      <div className="container footer-shell">
        <div className="footer-meta">
          <div>
            <div className="footer-brand">
              {brandLogo?.kind === 'remote' && brandLogo.src ? (
                <span className="brand-logo" aria-hidden={false}>
                  <img src={brandLogo.src} alt={brandLogo.alt || 'Company logo'} decoding="async" loading="eager" />
                </span>
              ) : brandLogo?.kind === 'svg' && brandLogo.svg ? (
                <span
                  className="brand-logo"
                  aria-hidden={false}
                  dangerouslySetInnerHTML={{ __html: brandLogo.svg }}
                />
              ) : null}
              <strong>{section.headline}</strong>
            </div>
            {section.body ? <p>{section.body}</p> : null}
          </div>
        </div>
        <nav className="footer-links">
          {(section.links || []).map((link) => (
            <SmartLink key={link.id || link.label} href={link.href || '#'}>
              {link.label || 'Link'}
            </SmartLink>
          ))}
        </nav>
        <div className="footer-ship-fast-attribution">
          <div className="footer-branding" aria-label="Built with Ship Fast">
            <a className="footer-branding__link" href="${SHIP_FAST_SITE_URL}" target="_blank" rel="noreferrer">
              <ShipFastFooterLogo />
              <span className="footer-branding__text">
                <span className="footer-branding__label">Built with</span>
                <span className="footer-branding__name">Ship Fast</span>
              </span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default function SectionRenderer({ section, siteSpec }) {
  const reduceMotion = useReducedMotion()
  switch (section.type) {
    case 'navbar':
      return <NavbarSection section={section} siteSpec={siteSpec} />
    case 'hero':
      return <HeroSection section={section} siteSpec={siteSpec} />
    case 'stats':
      return <StatsSection section={section} />
    case 'pricing':
      return <PricingSection section={section} />
    case 'testimonials':
      return <TestimonialsSection section={section} />
    case 'logo-cloud':
      return <LogoCloudSection section={section} />
    case 'faq':
      return <FaqSection section={section} />
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
    case 'contact-form':
      return <ContactFormSection section={section} />
    case 'footer':
      return <FooterSection section={section} />
    case 'product-grid':
    case 'featured-products': {
      const items = section.items || []
      const showSwiper = USE_PRODUCT_SWIPER && items.length > 0
      const showMarquee = USE_PRODUCT_MARQUEE && items.length > 0
      const card = (item, idx, hidden) => {
        const cat = item.category || item.collection
        const compare =
          item.compareAt != null && item.compareAt !== ''
            ? String(item.compareAt)
            : item.compare_at != null && item.compare_at !== ''
              ? String(item.compare_at)
              : null
        return (
          <article
            key={\`\${item.id || item.title}-\${idx}\`}
            className="card product-card product-card--retail product-card--carousel"
            {...(hidden ? { 'aria-hidden': true } : {})}
          >
            <div className="product-image">
              {item.image ? <img src={item.image} alt={hidden ? '' : item.title} /> : <div className="product-placeholder" />}
            </div>
            <div className="product-card__content">
              {cat ? <span className="product-card__category">{cat}</span> : null}
              <h3>{item.title}</h3>
              {item.rating != null && item.rating !== '' ? (
                <div className="product-card__rating">
                  <span className="product-stars" aria-hidden="true">
                    ★★★★★
                  </span>
                  <span className="product-card__rating-num">{Number(item.rating).toFixed(1)}</span>
                </div>
              ) : null}
              <div className="product-card__price-row">
                {item.price ? <span className="product-price">{item.price}</span> : null}
                {compare ? <span className="product-price product-price--compare">{compare}</span> : null}
              </div>
              {item.body ? <p className="product-card__excerpt">{item.body}</p> : null}
              <button type="button" className="product-card__atc button button--primary">
                Add to cart
              </button>
            </div>
          </article>
        )
      }
      if (showSwiper) {
        if (reduceMotion) {
          return (
            <section className={\`section \${section.type} section--product-marquee\`} id={section.id}>
              <div className="container">
                <SectionIntro section={section} />
              </div>
              <div className="product-carousel" role="region" aria-label="Products">
                <div className="product-carousel__mask product-carousel__mask--scroll">
                  <div className="product-carousel__track product-carousel__track--static">
                    {items.map((item, idx) => card(item, idx, false))}
                  </div>
                </div>
              </div>
            </section>
          )
        }
        return (
          <section className={\`section \${section.type} section--product-marquee\`} id={section.id}>
            <div className="container">
              <SectionIntro section={section} />
            </div>
            <Swiper
              modules={[Pagination]}
              slidesPerView="auto"
              spaceBetween={16}
              loop={items.length > 2}
              grabCursor
              watchOverflow
              pagination={{ clickable: true, dynamicBullets: items.length > 4 }}
              className="product-carousel swiper"
              role="region"
              aria-label="Products"
            >
              {items.map((item, idx) => (
                <SwiperSlide
                  key={\`\${item.id || item.title}-\${idx}\`}
                  style={{ width: 'min(280px, 85vw)', maxWidth: 'min(280px, 85vw)', flexShrink: 0 }}
                >
                  {card(item, idx, false)}
                </SwiperSlide>
              ))}
            </Swiper>
          </section>
        )
      }
      if (showMarquee) {
        return (
          <section className={\`section \${section.type} section--product-marquee\`} id={section.id}>
            <div className="container">
              <SectionIntro section={section} />
            </div>
            <div className="product-carousel" role="region" aria-label="Products">
              <ProductMarqueeTrack>
                {items.map((item, idx) => card(item, idx, false))}
                {items.map((item, idx) => card(item, idx, true))}
              </ProductMarqueeTrack>
            </div>
          </section>
        )
      }
      return (
        <section className={\`section \${section.type} section--store-products\`} id={section.id}>
          <div className="container">
            <SectionIntro section={section} />
            <div className="product-grid">
              {items.map((item) => {
                const cat = item.category || item.collection
                const compare =
                  item.compareAt != null && item.compareAt !== ''
                    ? String(item.compareAt)
                    : item.compare_at != null && item.compare_at !== ''
                      ? String(item.compare_at)
                      : null
                return (
                  <article key={item.id || item.title} className="card product-card product-card--retail" data-reveal>
                    <div className="product-image">
                      {item.image ? <img src={item.image} alt={item.title} /> : <div className="product-placeholder" />}
                    </div>
                    <div className="product-card__content">
                      {cat ? <span className="product-card__category">{cat}</span> : null}
                      <h3>{item.title}</h3>
                      {item.rating != null && item.rating !== '' ? (
                        <div className="product-card__rating">
                          <span className="product-stars" aria-hidden="true">
                            ★★★★★
                          </span>
                          <span className="product-card__rating-num">{Number(item.rating).toFixed(1)}</span>
                        </div>
                      ) : null}
                      <div className="product-card__price-row">
                        {item.price ? <span className="product-price">{item.price}</span> : null}
                        {compare ? <span className="product-price product-price--compare">{compare}</span> : null}
                      </div>
                      {item.body ? <p className="product-card__excerpt">{item.body}</p> : null}
                      <button type="button" className="product-card__atc button button--primary">
                        Add to cart
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </section>
      )
    }
    case 'cart-summary':
      return (
        <section className="section cart-summary" id={section.id}>
          <div className="container">
            <SectionIntro section={section} />
            <p className="cart-empty-state">Your cart is empty. Start shopping to add items.</p>
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

export function renderReactProject(siteSpec) {
  const useSwiper = shouldUseSwiper(siteSpec)
  const homePage = (siteSpec.pages || []).find((page) => page.route === '/') || siteSpec.pages?.[0]
  const homeSeo = resolvePageSeo(siteSpec, homePage)
  const homeStructuredData = homePage ? buildStructuredData(siteSpec, homePage) : []
  const files = {
    'package.json': renderReactPackageJson(siteSpec.projectName, useSwiper ? { swiper: '^12.0.0' } : {}),
    'index.html': `<!doctype html>
<html lang="${homeSeo.htmlLang}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(homeSeo.title)}</title>
    <meta name="description" content="${escapeHtml(homeSeo.description)}" />
    <meta name="robots" content="${escapeHtml(homeSeo.robots)}" />
    <meta name="theme-color" content="${escapeHtml(homeSeo.themeColor)}" />
    ${homeSeo.keywords.length ? `<meta name="keywords" content="${escapeHtml(homeSeo.keywords.join(', '))}" />` : ''}
    ${homeSeo.canonicalUrl ? `<link rel="canonical" href="${escapeHtml(homeSeo.canonicalUrl)}" />` : ''}
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${escapeHtml(homeSeo.title)}" />
    <meta property="og:description" content="${escapeHtml(homeSeo.description)}" />
    ${homeSeo.canonicalUrl ? `<meta property="og:url" content="${escapeHtml(homeSeo.canonicalUrl)}" />` : ''}
    <meta property="og:site_name" content="${escapeHtml(homeSeo.siteName)}" />
    <meta property="og:locale" content="${escapeHtml(homeSeo.locale)}" />
    ${
      homeSeo.ogImage
        ? `<meta property="og:image" content="${escapeHtml(homeSeo.ogImage)}" />
    <meta property="og:image:alt" content="${escapeHtml(homeSeo.ogImageAlt)}" />
    <meta name="twitter:image" content="${escapeHtml(homeSeo.ogImage)}" />
    <meta name="twitter:image:alt" content="${escapeHtml(homeSeo.ogImageAlt)}" />`
        : ''
    }
    <meta name="twitter:card" content="${escapeHtml(homeSeo.ogImage ? homeSeo.twitterCard : 'summary')}" />
    <meta name="twitter:title" content="${escapeHtml(homeSeo.title)}" />
    <meta name="twitter:description" content="${escapeHtml(homeSeo.description)}" />
    ${homeStructuredData.length ? `<script type="application/ld+json">${serializeStructuredData(homeStructuredData)}</script>` : ''}
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`,
    'public/robots.txt': renderRobotsTxt(siteSpec),
    'public/llms.txt': renderGeneratedSiteLlmsTxt(siteSpec),
    'vite.config.js': `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
`,
    'src/main.jsx': `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles.css'
${useSwiper ? `import 'swiper/css'
import 'swiper/css/pagination'
` : ''}
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
`,
    'src/App.jsx': renderReactApp(siteSpec),
    'src/site-spec.js': `const siteSpec = ${serializeModule(slimSiteSpecForBundle(siteSpec))}

export default siteSpec
`,
    'src/styles.css': buildGlobalCss(siteSpec.theme, {
      ecommerce: siteSpec.siteType === 'ecommerce',
      siteType: siteSpec.siteType,
    }),
    'src/lib/clone-runtime.js': renderCloneRuntimeModule(),
    'src/components/SeoHead.jsx': `import { useEffect } from 'react'

function normalizeSiteUrl(value = '') {
  const raw = String(value || '').trim()
  if (!raw) return ''
  try {
    const candidate = /^https?:\\/\\//i.test(raw) ? raw : \`https://\${raw}\`
    return new URL(candidate).toString().replace(/\\/+$/, '')
  } catch {
    return ''
  }
}

function normalizePath(value = '/') {
  const raw = String(value || '').trim()
  if (!raw || raw === '/') return '/'
  return raw.startsWith('/') ? raw : \`/\${raw}\`
}

function joinUrl(baseUrl, path = '/') {
  if (!baseUrl) return ''
  try {
    return new URL(normalizePath(path), \`\${baseUrl}/\`).toString()
  } catch {
    return ''
  }
}

function resolveSiteUrl(siteSpec) {
  const explicit = normalizeSiteUrl(siteSpec?.seo?.siteUrl || '')
  if (explicit) return explicit
  if (typeof window !== 'undefined' && window.location?.origin) {
    return String(window.location.origin).replace(/\\/+$/, '')
  }
  return ''
}

function resolveAssetUrl(value = '', siteUrl = '') {
  const raw = String(value || '').trim()
  if (!raw) return ''
  if (/^https?:\\/\\//i.test(raw)) return raw
  if (!siteUrl) return raw.startsWith('/') ? raw : ''
  return joinUrl(siteUrl, raw)
}

function upsertHeadTag(tagName, key, selector, attributes) {
  let node = document.head.querySelector(selector)
  if (!node) {
    node = document.createElement(tagName)
    node.setAttribute(\`data-sf-seo-\${key}\`, '1')
    document.head.appendChild(node)
  }
  Object.entries(attributes).forEach(([name, value]) => {
    if (value == null || value === '') node.removeAttribute(name)
    else node.setAttribute(name, String(value))
  })
}

function removeHeadTag(selector) {
  document.head.querySelector(selector)?.remove()
}

function extractFaqItems(page) {
  return (page?.sections || [])
    .filter((section) => section.type === 'faq')
    .flatMap((section) => section.items || [])
    .map((item) => ({
      question: String(item?.title || '').trim(),
      answer: String(item?.body || '').trim(),
    }))
    .filter((item) => item.question && item.answer)
}

function buildStructuredData(siteSpec, page, seo) {
  const entries = []

  if ((page?.route || '/') === '/') {
    entries.push({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: seo.siteName,
      url: seo.siteUrl || seo.canonicalUrl || undefined,
      description: seo.description,
    })
  }

  entries.push({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: seo.title,
    description: seo.description,
    url: seo.canonicalUrl || undefined,
  })

  const faqItems = extractFaqItems(page)
  if (faqItems.length) {
    entries.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqItems.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    })
  }

  return JSON.stringify(entries.length === 1 ? entries[0] : entries).replace(/</g, '\\\\u003c')
}

export default function SeoHead({ siteSpec, page }) {
  useEffect(() => {
    if (!page) return

    const siteSeo = siteSpec?.seo || {}
    const pageSeo = page?.seo || {}
    const siteUrl = resolveSiteUrl(siteSpec)
    const routePath = normalizePath(pageSeo.canonicalPath || page?.route || '/')
    const canonicalUrl = pageSeo.canonicalUrl ? normalizeSiteUrl(pageSeo.canonicalUrl) : joinUrl(siteUrl, routePath)
    const title = pageSeo.title || page?.title || siteSeo.title || siteSpec?.projectName || 'Website'
    const description = pageSeo.description || page?.description || siteSeo.description || ''
    const siteName = siteSeo.siteName || siteSpec?.projectName || title
    const locale = siteSeo.locale || 'en_US'
    const htmlLang = String(locale).replace('_', '-')
    const keywords = [...new Set([...(siteSeo.keywords || []), ...(pageSeo.keywords || [])].map((entry) => String(entry || '').trim()).filter(Boolean))]
    const ogImage = resolveAssetUrl(pageSeo.ogImage || siteSeo.ogImage || '', siteUrl)
    const ogImageAlt = pageSeo.ogImageAlt || siteSeo.ogImageAlt || \`\${title} social preview\`
    const robots = pageSeo.noIndex ? 'noindex, nofollow' : siteSeo.robots || 'index, follow'
    const themeColor = siteSpec?.theme?.colors?.background || '#09090b'
    const twitterCard = ogImage ? siteSeo.twitterCard || 'summary_large_image' : 'summary'

    document.documentElement.lang = htmlLang
    document.title = title

    upsertHeadTag('meta', 'description', 'meta[data-sf-seo-description]', { name: 'description', content: description })
    upsertHeadTag('meta', 'robots', 'meta[data-sf-seo-robots]', { name: 'robots', content: robots })
    upsertHeadTag('meta', 'theme-color', 'meta[data-sf-seo-theme-color]', { name: 'theme-color', content: themeColor })

    if (keywords.length) {
      upsertHeadTag('meta', 'keywords', 'meta[data-sf-seo-keywords]', { name: 'keywords', content: keywords.join(', ') })
    } else {
      removeHeadTag('meta[data-sf-seo-keywords]')
    }

    if (canonicalUrl) {
      upsertHeadTag('link', 'canonical', 'link[data-sf-seo-canonical]', { rel: 'canonical', href: canonicalUrl })
      upsertHeadTag('meta', 'og-url', 'meta[data-sf-seo-og-url]', { property: 'og:url', content: canonicalUrl })
    } else {
      removeHeadTag('link[data-sf-seo-canonical]')
      removeHeadTag('meta[data-sf-seo-og-url]')
    }

    upsertHeadTag('meta', 'og-type', 'meta[data-sf-seo-og-type]', { property: 'og:type', content: 'website' })
    upsertHeadTag('meta', 'og-title', 'meta[data-sf-seo-og-title]', { property: 'og:title', content: title })
    upsertHeadTag('meta', 'og-description', 'meta[data-sf-seo-og-description]', { property: 'og:description', content: description })
    upsertHeadTag('meta', 'og-site-name', 'meta[data-sf-seo-og-site-name]', { property: 'og:site_name', content: siteName })
    upsertHeadTag('meta', 'og-locale', 'meta[data-sf-seo-og-locale]', { property: 'og:locale', content: locale })
    upsertHeadTag('meta', 'twitter-card', 'meta[data-sf-seo-twitter-card]', { name: 'twitter:card', content: twitterCard })
    upsertHeadTag('meta', 'twitter-title', 'meta[data-sf-seo-twitter-title]', { name: 'twitter:title', content: title })
    upsertHeadTag('meta', 'twitter-description', 'meta[data-sf-seo-twitter-description]', { name: 'twitter:description', content: description })

    if (ogImage) {
      upsertHeadTag('meta', 'og-image', 'meta[data-sf-seo-og-image]', { property: 'og:image', content: ogImage })
      upsertHeadTag('meta', 'og-image-alt', 'meta[data-sf-seo-og-image-alt]', { property: 'og:image:alt', content: ogImageAlt })
      upsertHeadTag('meta', 'twitter-image', 'meta[data-sf-seo-twitter-image]', { name: 'twitter:image', content: ogImage })
      upsertHeadTag('meta', 'twitter-image-alt', 'meta[data-sf-seo-twitter-image-alt]', { name: 'twitter:image:alt', content: ogImageAlt })
    } else {
      removeHeadTag('meta[data-sf-seo-og-image]')
      removeHeadTag('meta[data-sf-seo-og-image-alt]')
      removeHeadTag('meta[data-sf-seo-twitter-image]')
      removeHeadTag('meta[data-sf-seo-twitter-image-alt]')
    }

    let structuredDataNode = document.head.querySelector('script[data-sf-seo-structured-data]')
    if (!structuredDataNode) {
      structuredDataNode = document.createElement('script')
      structuredDataNode.type = 'application/ld+json'
      structuredDataNode.setAttribute('data-sf-seo-structured-data', '1')
      document.head.appendChild(structuredDataNode)
    }
    structuredDataNode.textContent = buildStructuredData(siteSpec, page, {
      title,
      description,
      canonicalUrl,
      siteName,
      siteUrl,
    })
  }, [siteSpec, page])

  return null
}
`,
    'src/components/SmartLink.jsx': `import { Link } from 'react-router-dom'

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
    <Link to={href} {...props}>
      {children}
    </Link>
  )
}
`,
    'src/components/ExactClonePage.jsx': renderExactClonePageComponent({ mode: 'react' }),
    'src/components/MotionPageShell.jsx': `'use client'

import { motion, useReducedMotion } from 'framer-motion'

export default function MotionPageShell({ children }) {
  const reduceMotion = useReducedMotion()
  return (
    <motion.main
      className="motion-page-shell"
      initial={reduceMotion ? false : { opacity: 1, y: 12 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.main>
  )
}
`,
    'src/components/RevealObserver.jsx': `'use client'

import { useEffect } from 'react'

export default function RevealObserver() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-visible'))
      return
    }
    const els = document.querySelectorAll('[data-reveal]')
    if (!els.length) return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('is-visible')
          io.unobserve(entry.target)
        })
      },
      { threshold: 0.08 },
    )
    els.forEach((el) => io.observe(el))
    const t = window.setTimeout(() => {
      document.querySelectorAll('[data-reveal]:not(.is-visible)').forEach((el) => el.classList.add('is-visible'))
    }, 2800)
    return () => {
      window.clearTimeout(t)
      io.disconnect()
    }
  }, [])
  return null
}
`,
    'src/components/PageTemplate.jsx': `import ExactClonePage from './ExactClonePage'
import MotionPageShell from './MotionPageShell'
import RevealObserver from './RevealObserver'
import SeoHead from './SeoHead'
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
    return (
      <>
        <SeoHead siteSpec={siteSpec} page={page} />
        <ExactClonePage page={page} />
      </>
    )
  }

  return (
    <>
      <SeoHead siteSpec={siteSpec} page={page} />
      <MotionPageShell>
        <RevealObserver />
        <div className={siteSpec?.siteType === 'ecommerce' ? 'site-shell site-shell--store' : 'site-shell'}>
          {page.sections.map((section) => (
            <SectionRenderer key={section.id} section={section} siteSpec={siteSpec} />
          ))}
        </div>
      </MotionPageShell>
    </>
  )
}
`,
    'src/components/SectionRenderer.jsx': renderReactSectionRenderer(siteSpec),
  }

  const sitemapXml = renderSitemapXml(siteSpec)
  if (sitemapXml) files['public/sitemap.xml'] = sitemapXml

  for (const page of siteSpec.pages || []) {
    files[`src/pages/${pageComponentName(page)}.jsx`] = renderReactPage(
      page,
      pageComponentName(page),
    )
  }

  const isEcommerce = siteSpec.siteType === 'ecommerce'
  if (isEcommerce) {
    const pkg = JSON.parse(files['package.json'])
    pkg.dependencies['@medusajs/js-sdk'] = '^2.13.5'
    files['package.json'] = JSON.stringify(pkg, null, 2)

    files['src/lib/medusa.js'] = `const backendUrl = import.meta.env.VITE_MEDUSA_BACKEND_URL || 'http://localhost:9000'
const publishableKey = import.meta.env.VITE_MEDUSA_PUBLISHABLE_KEY || ''

let sdk = null

export function getMedusaSdk() {
  if (!publishableKey) return null
  if (!sdk) {
    import('@medusajs/js-sdk').then((mod) => {
      sdk = new mod.default({ baseUrl: backendUrl, publishableKey })
    })
    return null
  }
  return sdk
}

export async function getProducts(params = {}) {
  const client = getMedusaSdk()
  if (!client) return []
  try {
    const { products } = await client.store.product.list(params)
    return products || []
  } catch {
    return []
  }
}

export async function getProductByHandle(handle) {
  const client = getMedusaSdk()
  if (!client || !handle) return null
  try {
    const { products } = await client.store.product.list({ handle })
    return products?.[0] || null
  } catch {
    return null
  }
}

export async function getCategories() {
  const client = getMedusaSdk()
  if (!client) return []
  try {
    const { product_categories } = await client.store.category.list()
    return product_categories || []
  } catch {
    return []
  }
}

export async function createCart(regionId) {
  const client = getMedusaSdk()
  if (!client) return null
  try {
    const { cart } = await client.store.cart.create({ region_id: regionId })
    return cart || null
  } catch {
    return null
  }
}

export async function getCart(cartId) {
  const client = getMedusaSdk()
  if (!client || !cartId) return null
  try {
    const { cart } = await client.store.cart.retrieve(cartId)
    return cart || null
  } catch {
    return null
  }
}

export async function addLineItem(cartId, variantId, quantity = 1) {
  const client = getMedusaSdk()
  if (!client || !cartId || !variantId) return null
  try {
    const { cart } = await client.store.cart.createLineItem(cartId, { variant_id: variantId, quantity })
    return cart || null
  } catch {
    return null
  }
}

export async function getRegions() {
  const client = getMedusaSdk()
  if (!client) return []
  try {
    const { regions } = await client.store.region.list()
    return regions || []
  } catch {
    return []
  }
}
`

    files['.env.example.medusa'] = `# Medusa.js E-Commerce — optional
VITE_MEDUSA_BACKEND_URL=http://localhost:9000
VITE_MEDUSA_PUBLISHABLE_KEY=
`
  }

  return { files }
}
