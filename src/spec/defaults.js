import { slug } from '../pipeline/workspace.js'

export const SITE_SPEC_VERSION = '1.0.0'
export const SUPPORTED_EXPORT_TARGETS = ['html', 'react', 'nextjs']
export const SUPPORTED_SECTION_TYPES = [
  'hero',
  'features',
  'pricing',
  'testimonials',
  'contact-form',
  'gallery',
  'logo-cloud',
  'docs-content',
  'faq',
  'cta',
  'footer',
  'navbar',
  'stats',
  'team',
  'blog-list',
  'dashboard-shell',
]

function toPageRoute(name, idx = 0) {
  if (idx === 0 || /^home$/i.test(name)) return '/'
  return `/${slug(name || `page-${idx + 1}`)}`
}

function inferSiteType(ctx, explicitSiteType) {
  return explicitSiteType || ctx?.site_type || 'landing'
}

function parseDesignPalette(designBrief = '') {
  const lines = String(designBrief).split('\n')
  const palette = []
  for (const line of lines) {
    const matches = line.match(/#[0-9a-fA-F]{6}/g)
    if (matches) palette.push(...matches)
  }
  const unique = [...new Set(palette)]
  return {
    primary: unique[0] || '#7c3aed',
    secondary: unique[1] || '#a78bfa',
    accent: unique[2] || '#22c55e',
    background: unique[3] || '#09090b',
    surface: unique[4] || '#18181b',
    text: unique[5] || '#f4f4f5',
    mutedText: unique[6] || '#a1a1aa',
    border: unique[7] || '#27272a',
  }
}

function parseTypography(ctx, designBrief = '') {
  const source = `${ctx?.typography || ''} ${designBrief}`
  const mono = /jetbrains mono|ibm plex mono|fira code/i.test(source)
    ? source.match(/(JetBrains Mono|IBM Plex Mono|Fira Code)/i)?.[0]
    : 'JetBrains Mono'
  const body = /inter|space grotesk|manrope|sora|plus jakarta sans|dm sans/i.test(source)
    ? source.match(/(Inter|Space Grotesk|Manrope|Sora|Plus Jakarta Sans|DM Sans)/i)?.[0]
    : 'Inter'
  const heading = /space grotesk|manrope|sora|plus jakarta sans|dm sans|inter/i.test(source)
    ? source.match(/(Space Grotesk|Manrope|Sora|Plus Jakarta Sans|DM Sans|Inter)/i)?.[0]
    : body

  return {
    heading,
    body,
    mono,
    scale: {
      hero: 'clamp(3rem, 8vw, 5.75rem)',
      h1: 'clamp(2.5rem, 6vw, 4rem)',
      h2: 'clamp(2rem, 4vw, 3rem)',
      h3: '1.5rem',
      body: '1rem',
      small: '0.875rem',
    },
  }
}

function defaultNavActions(projectName) {
  return [
    { id: 'cta-primary', label: 'Get Started', href: '#contact', style: 'primary' },
    { id: 'cta-secondary', label: 'See Pricing', href: '#pricing', style: 'secondary' },
  ]
}

function defaultHero(projectName, tagline, siteType, features = []) {
  const body =
    siteType === 'dashboard'
      ? `Operate ${projectName} from one control surface with focused workflows and fast team collaboration.`
      : tagline || `${projectName} helps teams move from idea to launch without the usual drag.`
  return {
    id: 'hero',
    type: 'hero',
    variant: siteType === 'dashboard' ? 'app' : 'split',
    headline: projectName,
    subheadline: tagline || 'Ship your next product faster.',
    body,
    actions: [
      { label: 'Get Started', href: '#contact', style: 'primary' },
      { label: 'View Features', href: '#features', style: 'secondary' },
    ],
    items: features.slice(0, 3).map((feature) => ({ title: feature })),
    interactions: [{ type: 'heroCta', behavior: 'scroll', target: '#contact' }],
  }
}

function defaultFeatureItems(ctx) {
  const features = ctx?.features?.length
    ? ctx.features
    : ['Fast setup', 'Opinionated defaults', 'Reusable building blocks']
  return features.slice(0, 6).map((feature, idx) => ({
    id: `feature-${idx + 1}`,
    title: feature,
    body: `${feature} is built into the product flow so teams can ship without extra coordination overhead.`,
  }))
}

function defaultSectionsForSiteType(ctx, siteType, projectName, tagline) {
  const sections = [
    defaultHero(projectName, tagline, siteType, ctx?.features || []),
    {
      id: 'stats',
      type: 'stats',
      variant: 'pill-grid',
      headline: 'Built for high-output teams',
      items: [
        { label: 'Launch Speed', value: '10x' },
        { label: 'Setup Time', value: '<1 day' },
        { label: 'Team Visibility', value: 'Shared' },
      ],
    },
    {
      id: 'features',
      type: 'features',
      variant: 'cards',
      headline: 'Everything in one structured workflow',
      body: 'A single source of truth for pages, content, interactions, and exports.',
      items: defaultFeatureItems(ctx),
    },
  ]

  if (siteType === 'blog') {
    sections.push({
      id: 'blog-list',
      type: 'blog-list',
      variant: 'featured-grid',
      headline: 'Latest writing',
      items: [
        {
          title: 'Shipping velocity without chaos',
          body: 'A playbook for keeping product execution aligned as your team scales.',
          href: '#',
        },
        {
          title: 'Design systems that stay useful',
          body: 'How to keep tokens and components practical instead of ornamental.',
          href: '#',
        },
      ],
    })
  } else if (siteType === 'docs') {
    sections.push({
      id: 'docs-content',
      type: 'docs-content',
      variant: 'quickstart',
      headline: 'Quick start',
      body: 'Set up the project, understand the architecture, and move into production changes fast.',
      items: [
        { title: 'Install', body: 'Install dependencies and boot the app locally.' },
        { title: 'Generate', body: 'Create a session from a prompt and inspect the canonical site spec.' },
        { title: 'Export', body: 'Render HTML, React, or Next.js from the same site specification.' },
      ],
    })
  } else if (siteType === 'portfolio') {
    sections.push({
      id: 'gallery',
      type: 'gallery',
      variant: 'project-grid',
      headline: 'Selected work',
      items: [
        { title: 'Flagship Project', body: 'A polished launch experience built for clarity and conversion.' },
        { title: 'Systems Project', body: 'Operational tooling designed around fast iteration and clean handoff.' },
        { title: 'Experimental Project', body: 'An exploration of bold interfaces and structured product stories.' },
      ],
    })
  } else if (siteType === 'dashboard') {
    sections.push({
      id: 'dashboard-shell',
      type: 'dashboard-shell',
      variant: 'workspace',
      headline: 'Operational workspace',
      items: [
        { title: 'Overview', body: 'Track work, exports, and release readiness from one screen.' },
        { title: 'Projects', body: 'Move between generated surfaces without losing context.' },
        { title: 'Activity', body: 'Review state changes and generated outputs as they happen.' },
      ],
    })
  } else {
    sections.push({
      id: 'testimonials',
      type: 'testimonials',
      variant: 'cards',
      headline: 'Teams use it to move with less friction',
      items: [
        {
          quote: `${projectName} gave us a faster path from concept to a launch-ready experience.`,
          author: 'Product Lead',
        },
        {
          quote: 'We kept the preview quality and gained clean export paths for the stack we actually use.',
          author: 'Engineering Manager',
        },
      ],
    })
  }

  sections.push(
    {
      id: 'pricing',
      type: 'pricing',
      variant: 'three-tier',
      headline: 'Simple plans',
      items: [
        { title: 'Starter', price: '$0', body: 'Validate ideas quickly.', features: ['1 workspace', 'HTML export'] },
        {
          title: 'Pro',
          price: '$49',
          body: 'For shipping teams.',
          features: ['Unlimited sessions', 'React export', 'Next.js export'],
        },
        {
          title: 'Enterprise',
          price: 'Custom',
          body: 'Operational control and support.',
          features: ['Custom workflows', 'Security review', 'Priority support'],
        },
      ],
    },
    {
      id: 'faq',
      type: 'faq',
      variant: 'accordion',
      headline: 'Common questions',
      items: [
        {
          title: 'Can I choose the framework later?',
          body: 'Yes. The site specification is stored once, and renderers export framework-specific projects on demand.',
        },
        {
          title: 'Does the preview stay fast?',
          body: 'Yes. Preview generation stays optimized while exports are driven from the canonical spec.',
        },
      ],
      interactions: [{ type: 'accordion', behavior: 'single', defaultOpenItem: 0 }],
    },
    {
      id: 'contact',
      type: 'contact-form',
      variant: 'split',
      headline: 'Start with a prompt',
      body: 'Describe the site once and export it to the stack you want afterward.',
      fields: [
        { name: 'name', label: 'Name', type: 'text', placeholder: 'Jane Doe', required: true },
        { name: 'email', label: 'Email', type: 'email', placeholder: 'jane@company.com', required: true },
        {
          name: 'message',
          label: 'Project Brief',
          type: 'textarea',
          placeholder: 'Describe the workflow or site you want to generate.',
          required: true,
        },
      ],
      form: {
        successMessage: 'Thanks. We will reach out shortly.',
        errorMessage: 'Please check the required fields and try again.',
        action: { type: 'placeholder', target: 'lead_capture' },
      },
    },
    {
      id: 'footer',
      type: 'footer',
      variant: 'simple',
      headline: projectName,
      links: [
        { label: 'Home', href: '/' },
        { label: 'Features', href: '#features' },
        { label: 'Pricing', href: '#pricing' },
        { label: 'Contact', href: '#contact' },
      ],
    },
  )

  return sections
}

function inferPageDescription(pageName, projectName) {
  if (/pricing/i.test(pageName)) return `Pricing and plan details for ${projectName}.`
  if (/contact/i.test(pageName)) return `Ways to contact the ${projectName} team.`
  if (/about/i.test(pageName)) return `Background and positioning for ${projectName}.`
  if (/docs/i.test(pageName)) return `Documentation and quickstart guides for ${projectName}.`
  return `${pageName} page for ${projectName}.`
}

function buildSecondaryPageSections(pageName, projectName, siteType) {
  const lower = pageName.toLowerCase()
  if (lower.includes('pricing')) {
    return [
      {
        id: 'pricing-page',
        type: 'pricing',
        variant: 'detailed',
        headline: `${projectName} pricing`,
        body: 'Choose the operating model that fits your team.',
        items: [
          { title: 'Starter', price: '$0', features: ['1 workspace', 'HTML export'] },
          { title: 'Pro', price: '$49', features: ['React export', 'Unlimited sessions'] },
          { title: 'Enterprise', price: 'Custom', features: ['Security review', 'Priority support'] },
        ],
      },
      {
        id: 'pricing-cta',
        type: 'cta',
        variant: 'banner',
        headline: 'Need a custom workflow?',
        body: 'Talk to the team about enterprise rollout and framework standards.',
        actions: [{ label: 'Contact Sales', href: '/contact', style: 'primary' }],
      },
    ]
  }

  if (lower.includes('contact')) {
    return [
      {
        id: 'contact-page',
        type: 'contact-form',
        variant: 'centered',
        headline: `Talk to the ${projectName} team`,
        body: 'Share the product, workflow, or launch brief you need help with.',
        fields: [
          { name: 'name', label: 'Name', type: 'text', placeholder: 'Jane Doe', required: true },
          { name: 'email', label: 'Email', type: 'email', placeholder: 'jane@company.com', required: true },
          {
            name: 'message',
            label: 'Message',
            type: 'textarea',
            placeholder: 'Tell us what you want to build.',
            required: true,
          },
        ],
        form: {
          successMessage: 'Thanks. We will get back to you shortly.',
          errorMessage: 'Please fill in the required fields.',
          action: { type: 'placeholder', target: 'contact_request' },
        },
      },
    ]
  }

  if (lower.includes('about')) {
    return [
      {
        id: 'about-story',
        type: 'team',
        variant: 'story',
        headline: `Why ${projectName} exists`,
        body: `${projectName} is designed for teams that need structure without losing momentum.`,
        items: [
          { title: 'Product', body: 'Clear system boundaries, content structure, and export-ready output.' },
          { title: 'Design', body: 'Consistent tokens and reusable section logic across every target.' },
          { title: 'Engineering', body: 'A canonical site spec that keeps the project maintainable.' },
        ],
      },
    ]
  }

  if (lower.includes('blog')) {
    return [
      {
        id: 'blog-archive',
        type: 'blog-list',
        variant: 'archive',
        headline: `${projectName} journal`,
        items: [
          { title: 'Building with structured output', body: 'Why canonical specs scale better than HTML conversion.' },
          { title: 'Renderer architecture', body: 'How one spec powers multiple frontend targets.' },
        ],
      },
    ]
  }

  if (lower.includes('docs')) {
    return [
      {
        id: 'docs-page',
        type: 'docs-content',
        variant: 'reference',
        headline: `${projectName} docs`,
        body: 'Installation, workflow, and renderer references in one place.',
        items: [
          { title: 'Getting Started', body: 'Generate a site, inspect the spec, and export the target you need.' },
          { title: 'Site Spec', body: 'Pages, sections, interactions, theme tokens, and backend hints.' },
          { title: 'Exports', body: 'Render HTML, React, and Next.js from the same structured source.' },
        ],
      },
    ]
  }

  return [
    {
      id: `${slug(pageName)}-hero`,
      type: 'hero',
      variant: siteType === 'portfolio' ? 'editorial' : 'simple',
      headline: pageName,
      subheadline: inferPageDescription(pageName, projectName),
      body: `${pageName} keeps the same theme system and content structure as the rest of the site.`,
      actions: [{ label: 'Back Home', href: '/', style: 'secondary' }],
    },
    {
      id: `${slug(pageName)}-content`,
      type: 'features',
      variant: 'stacked',
      headline: `${pageName} overview`,
      items: [
        { title: 'Structure', body: 'Page content is defined in the canonical site specification.' },
        { title: 'Reusability', body: 'Sections can render to multiple frameworks without HTML conversion.' },
        { title: 'Continuity', body: 'Design tokens and navigation remain consistent across outputs.' },
      ],
    },
  ]
}

export function buildFallbackSiteSpec({
  prompt,
  ctx = {},
  designBrief = '',
  siteType,
}) {
  const inferredSiteType = inferSiteType(ctx, siteType)
  const projectName = ctx.project_name || prompt.slice(0, 40) || 'Generated Project'
  const normalizedSlug = ctx.slug || slug(projectName)
  const pages = (ctx.pages?.length ? ctx.pages : ['Home']).map((name, idx) => ({
    id: idx === 0 ? 'page-home' : `page-${slug(name || `page-${idx + 1}`)}`,
    name: name || `Page ${idx + 1}`,
    route: toPageRoute(name || `Page ${idx + 1}`, idx),
    title: idx === 0 ? projectName : `${name} | ${projectName}`,
    description: inferPageDescription(name || `Page ${idx + 1}`, projectName),
    seo: {
      title: idx === 0 ? projectName : `${name} | ${projectName}`,
      description: inferPageDescription(name || `Page ${idx + 1}`, projectName),
    },
    layoutType: inferredSiteType === 'dashboard' ? 'app-shell' : 'marketing',
    sections:
      idx === 0
        ? [
            {
              id: 'navbar',
              type: 'navbar',
              variant: 'default',
              headline: projectName,
              links: (ctx.pages?.length ? ctx.pages : ['Home'])
                .map((pageName, pageIdx) => ({
                  label: pageName,
                  href: toPageRoute(pageName, pageIdx),
                })),
              actions: defaultNavActions(projectName),
              interactions: [{ type: 'mobileMenu', target: 'main-nav', behavior: 'toggle' }],
            },
            ...defaultSectionsForSiteType(ctx, inferredSiteType, projectName, ctx.tagline),
          ]
        : buildSecondaryPageSections(name || `Page ${idx + 1}`, projectName, inferredSiteType),
  }))

  const palette = parseDesignPalette(designBrief)
  const typography = parseTypography(ctx, designBrief)

  return {
    projectName,
    slug: normalizedSlug,
    siteType: inferredSiteType,
    userPrompt: prompt,
    generatedTimestamp: new Date().toISOString(),
    exportableFrameworks: [...SUPPORTED_EXPORT_TARGETS],
    version: SITE_SPEC_VERSION,
    theme: {
      colors: palette,
      typography,
      radius: {
        sm: '0.5rem',
        md: '0.875rem',
        lg: '1.25rem',
      },
      spacing: {
        sectionY: '5rem',
        container: 'min(1120px, calc(100vw - 2rem))',
        gap: '1.5rem',
      },
      shadows: {
        soft: '0 20px 60px rgba(0,0,0,0.18)',
        card: '0 12px 30px rgba(0,0,0,0.14)',
      },
      appearance: {
        darkMode: true,
        lightMode: false,
      },
      mood: ctx.mood || 'modern',
      tailwind: {
        primary: palette.primary,
        secondary: palette.secondary,
        accent: palette.accent,
      },
    },
    navigation: {
      global: pages.map((page) => ({ label: page.name, href: page.route })),
      footer: pages.map((page) => ({ label: page.name, href: page.route })),
      ctas: defaultNavActions(projectName),
    },
    pages,
    components: [
      { id: 'site-navbar', type: 'layout', name: 'SiteNavbar' },
      { id: 'site-footer', type: 'layout', name: 'SiteFooter' },
      { id: 'section-renderer', type: 'renderer', name: 'SectionRenderer' },
    ],
    interactions: [
      { type: 'mobileMenu', target: 'main-nav', behavior: 'toggle' },
      { type: 'accordion', target: 'faq', behavior: 'single' },
    ],
    forms: pages
      .flatMap((page) => page.sections || [])
      .filter((section) => section.type === 'contact-form')
      .map((section) => ({
        id: `${section.id}-form`,
        pageId: pages.find((page) => page.sections.includes(section))?.id || 'page-home',
        fields: section.fields || [],
        validationHints: (section.fields || []).map((field) => ({
          field: field.name,
          required: !!field.required,
        })),
        successMessage: section.form?.successMessage || 'Submitted successfully.',
        errorMessage: section.form?.errorMessage || 'Unable to submit.',
        action: section.form?.action || { type: 'placeholder', target: 'lead_capture' },
      })),
    assets: [],
    seo: {
      title: projectName,
      description: ctx.tagline || `${projectName} generated from a canonical site specification.`,
    },
    backendFeatureHints: ctx.features || [],
  }
}
