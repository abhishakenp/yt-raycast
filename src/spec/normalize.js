import {
  buildFallbackSiteSpec,
  SITE_SPEC_VERSION,
  SUPPORTED_EXPORT_TARGETS,
  SUPPORTED_SECTION_TYPES,
} from './defaults.js'
import { normalizeBusinessProfile } from '@ship-fast/engine/spec/business-profile.js'
import { slug } from '../pipeline/workspace.js'

function ensureArray(value) {
  return Array.isArray(value) ? value : []
}

function ensureString(value, fallback = '') {
  return typeof value === 'string' ? value : fallback
}

function normalizeAction(action, idx = 0) {
  if (!action || typeof action !== 'object') {
    return { id: `action-${idx + 1}`, label: 'Learn More', href: '#', style: 'secondary' }
  }
  return {
    id: ensureString(action.id, `action-${idx + 1}`),
    label: ensureString(action.label, 'Learn More'),
    href: ensureString(action.href, '#'),
    style: ensureString(action.style, 'secondary'),
  }
}

function normalizeItem(item, idx = 0) {
  if (!item || typeof item !== 'object') {
    return { id: `item-${idx + 1}`, title: `Item ${idx + 1}`, body: '' }
  }
  return {
    id: ensureString(item.id, `item-${idx + 1}`),
    title: ensureString(item.title, `Item ${idx + 1}`),
    body: ensureString(item.body, ''),
    quote: ensureString(item.quote, ''),
    author: ensureString(item.author, ''),
    value: ensureString(item.value, ''),
    label: ensureString(item.label, ''),
    href: ensureString(item.href, ''),
    price: ensureString(item.price, ''),
    features: ensureArray(item.features)
      .map((feature) => ensureString(feature))
      .filter(Boolean),
  }
}

function normalizeContentBlock(block, idx = 0) {
  if (!block || typeof block !== 'object') {
    return { id: `block-${idx + 1}`, kind: 'paragraph', text: '', items: [] }
  }
  return {
    id: ensureString(block.id, `block-${idx + 1}`),
    kind: ensureString(block.kind, 'paragraph'),
    text: ensureString(block.text, ''),
    items: ensureArray(block.items)
      .map((t) => ensureString(t))
      .filter(Boolean),
  }
}

function normalizeField(field, idx = 0) {
  if (!field || typeof field !== 'object') {
    return {
      name: `field_${idx + 1}`,
      label: `Field ${idx + 1}`,
      type: 'text',
      placeholder: '',
      required: false,
    }
  }
  return {
    name: ensureString(field.name, `field_${idx + 1}`),
    label: ensureString(field.label, `Field ${idx + 1}`),
    type: ensureString(field.type, 'text'),
    placeholder: ensureString(field.placeholder, ''),
    required: Boolean(field.required),
  }
}

function normalizeSection(section, idx = 0) {
  const type = SUPPORTED_SECTION_TYPES.includes(section?.type) ? section.type : 'features'
  return {
    id: ensureString(section?.id, `${type}-${idx + 1}`),
    type,
    variant: ensureString(section?.variant, 'default'),
    headline: ensureString(section?.headline, ''),
    subheadline: ensureString(section?.subheadline, ''),
    body: ensureString(section?.body, ''),
    items: ensureArray(section?.items).map(normalizeItem),
    actions: ensureArray(section?.actions).map(normalizeAction),
    fields: ensureArray(section?.fields).map(normalizeField),
    links: ensureArray(section?.links).map((link, linkIdx) =>
      normalizeAction({ ...link, style: link?.style || 'link' }, linkIdx),
    ),
    interactions: ensureArray(section?.interactions).map((interaction) => ({
      type: ensureString(interaction?.type, 'custom'),
      target: ensureString(interaction?.target, ''),
      behavior: ensureString(interaction?.behavior, ''),
      defaultOpenItem: Number.isInteger(interaction?.defaultOpenItem)
        ? interaction.defaultOpenItem
        : 0,
    })),
    styling: typeof section?.styling === 'object' && section?.styling ? section.styling : {},
    visibility:
      typeof section?.visibility === 'object' && section?.visibility ? section.visibility : {},
    contentBlocks: ensureArray(section?.contentBlocks).map(normalizeContentBlock),
    form:
      section?.form && typeof section.form === 'object'
        ? {
            successMessage: ensureString(section.form.successMessage, 'Submitted successfully.'),
            errorMessage: ensureString(section.form.errorMessage, 'Unable to submit.'),
            action:
              section.form.action && typeof section.form.action === 'object'
                ? {
                    type: ensureString(section.form.action.type, 'placeholder'),
                    target: ensureString(section.form.action.target, ''),
                  }
                : { type: 'placeholder', target: '' },
          }
        : null,
    children: ensureArray(section?.children).map(normalizeSection),
  }
}

function normalizeEcommerceProduct(p, idx = 0) {
  if (!p || typeof p !== 'object') {
    return {
      id: `prod-${idx + 1}`,
      title: `Product ${idx + 1}`,
      handle: `product-${idx + 1}`,
      description: '',
      price: '',
      currency: 'USD',
      image: '',
      category: '',
    }
  }
  const title = ensureString(p.title, `Product ${idx + 1}`)
  return {
    id: ensureString(p.id, `prod-${idx + 1}`),
    title,
    handle: ensureString(p.handle, slug(title) || `product-${idx + 1}`),
    description: ensureString(p.description, ''),
    price: p.price != null && p.price !== '' ? p.price : '',
    currency: ensureString(p.currency, 'USD'),
    image: ensureString(p.image, ''),
    category: ensureString(p.category, ''),
  }
}

function normalizeEcommerceCategory(c, idx = 0) {
  if (!c || typeof c !== 'object') {
    return {
      id: `cat-${idx + 1}`,
      name: '',
      handle: `category-${idx + 1}`,
      description: '',
      image: '',
    }
  }
  const name = ensureString(c.name, '')
  return {
    id: ensureString(c.id, `cat-${idx + 1}`),
    name,
    handle: ensureString(c.handle, slug(name) || `category-${idx + 1}`),
    description: ensureString(c.description, ''),
    image: ensureString(c.image, ''),
  }
}

function normalizeEcommerce(raw, fallback) {
  const fromRaw = raw?.ecommerce && typeof raw.ecommerce === 'object' ? raw.ecommerce : null
  const fromFb =
    fallback?.ecommerce && typeof fallback.ecommerce === 'object' ? fallback.ecommerce : null
  if (!fromRaw && !fromFb) return null
  const base = fromRaw || fromFb
  const settingsSrc = base.settings && typeof base.settings === 'object' ? base.settings : {}
  const fbSettings = fromFb?.settings && typeof fromFb.settings === 'object' ? fromFb.settings : {}
  let products = ensureArray(base.products).map(normalizeEcommerceProduct)
  if (!products.length && fromFb?.products?.length) {
    products = ensureArray(fromFb.products).map(normalizeEcommerceProduct)
  }
  let categories = ensureArray(base.categories).map(normalizeEcommerceCategory)
  if (!categories.length && fromFb?.categories?.length) {
    categories = ensureArray(fromFb.categories).map(normalizeEcommerceCategory)
  }
  return {
    provider: ensureString(base.provider, 'medusa'),
    settings: {
      currency: ensureString(settingsSrc.currency, fbSettings.currency || 'USD'),
      storeName: ensureString(
        settingsSrc.storeName,
        fbSettings.storeName || fallback.projectName || '',
      ),
      provider: ensureString(
        settingsSrc.provider,
        fbSettings.provider || ensureString(base.provider, 'medusa'),
      ),
    },
    products,
    categories,
  }
}

function normalizeExportOptions(rawEx) {
  if (rawEx == null) return null
  if (typeof rawEx !== 'object' || Array.isArray(rawEx)) return null
  const out = {}
  if (rawEx.cms === 'sanity') out.cms = 'sanity'
  if (rawEx.embedSanityStudio != null) out.embedSanityStudio = Boolean(rawEx.embedSanityStudio)
  return Object.keys(out).length ? out : null
}

function normalizePlanMeta(rawPm, fallbackPm) {
  const fb = fallbackPm && typeof fallbackPm === 'object' ? fallbackPm : {}
  const r = rawPm && typeof rawPm === 'object' ? rawPm : {}
  return {
    schemaRevision: ensureString(
      r.schemaRevision,
      ensureString(fb.schemaRevision, SITE_SPEC_VERSION),
    ),
    contentRefId: ensureString(r.contentRefId, fb.contentRefId || ''),
    contentRefStashName: ensureString(r.contentRefStashName, fb.contentRefStashName || ''),
    archetypePresetKey: ensureString(
      r.archetypePresetKey,
      fb.archetypePresetKey || 'marketingDark',
    ),
    resolutionReason: ensureString(r.resolutionReason, fb.resolutionReason || ''),
    qualityChecklist: ensureArray(r.qualityChecklist ?? fb.qualityChecklist)
      .map((x) => ensureString(x))
      .filter(Boolean),
    specPhase:
      typeof r.specPhase === 'string' && r.specPhase
        ? r.specPhase
        : typeof fb.specPhase === 'string'
          ? fb.specPhase
          : '',
  }
}

function normalizePage(page, idx = 0) {
  const route = ensureString(
    page?.route,
    idx === 0 ? '/' : `/${slug(page?.name || `page-${idx + 1}`)}`,
  )
  const normalizedRoute = route === '' ? '/' : route.startsWith('/') ? route : `/${route}`
  const name = ensureString(page?.name, idx === 0 ? 'Home' : `Page ${idx + 1}`)

  return {
    id: ensureString(page?.id, idx === 0 ? 'page-home' : `page-${slug(name)}`),
    name,
    route: normalizedRoute,
    title: ensureString(page?.title, name),
    description: ensureString(page?.description, ''),
    seo:
      page?.seo && typeof page.seo === 'object'
        ? {
            title: ensureString(page.seo.title, ensureString(page?.title, name)),
            description: ensureString(page.seo.description, ensureString(page?.description, '')),
            keywords: ensureArray(page.seo.keywords)
              .map((item) => ensureString(item))
              .filter(Boolean),
            canonicalPath: ensureString(page.seo.canonicalPath, normalizedRoute),
            canonicalUrl: ensureString(page.seo.canonicalUrl, ''),
            ogImage: ensureString(page.seo.ogImage, ''),
            ogImageAlt: ensureString(
              page.seo.ogImageAlt,
              `${ensureString(page?.title, name)} social preview`,
            ),
            noIndex: page.seo.noIndex === true,
          }
        : {
            title: ensureString(page?.title, name),
            description: ensureString(page?.description, ''),
            keywords: [],
            canonicalPath: normalizedRoute,
            canonicalUrl: '',
            ogImage: '',
            ogImageAlt: `${ensureString(page?.title, name)} social preview`,
            noIndex: false,
          },
    layoutType: ensureString(page?.layoutType, 'marketing'),
    pageRole: ensureString(page?.pageRole, idx === 0 ? 'conversion' : 'standard'),
    contentGoals:
      ensureArray(page?.contentGoals)
        .map((g) => ensureString(g))
        .filter(Boolean).length > 0
        ? ensureArray(page?.contentGoals)
            .map((g) => ensureString(g))
            .filter(Boolean)
        : idx === 0
          ? ['Establish trust', 'Drive primary CTA']
          : ['Inform', 'Link related pages'],
    sections: ensureArray(page?.sections).map(normalizeSection),
    renderBlueprint:
      page?.renderBlueprint && typeof page.renderBlueprint === 'object'
        ? {
            version: Number.isFinite(page.renderBlueprint.version)
              ? page.renderBlueprint.version
              : 1,
            exactClone: page.renderBlueprint.exactClone !== false,
            title: ensureString(page.renderBlueprint.title, ensureString(page?.title, name)),
            meta: ensureArray(page.renderBlueprint.meta),
            links: ensureArray(page.renderBlueprint.links),
            styles: ensureArray(page.renderBlueprint.styles)
              .map((style) => ensureString(style))
              .filter(Boolean),
            headHtml: ensureString(page.renderBlueprint.headHtml, ''),
            scripts: ensureArray(page.renderBlueprint.scripts),
            bodyHtml: ensureString(page.renderBlueprint.bodyHtml, ''),
            htmlAttributes:
              page.renderBlueprint.htmlAttributes &&
              typeof page.renderBlueprint.htmlAttributes === 'object'
                ? page.renderBlueprint.htmlAttributes
                : {},
            bodyAttributes:
              page.renderBlueprint.bodyAttributes &&
              typeof page.renderBlueprint.bodyAttributes === 'object'
                ? page.renderBlueprint.bodyAttributes
                : {},
            originalHtmlDocument: ensureString(page.renderBlueprint.originalHtmlDocument, ''),
          }
        : null,
  }
}

export function normalizeSiteSpec(input, context = {}) {
  const fallback = buildFallbackSiteSpec(context)
  const raw = input && typeof input === 'object' ? input : {}
  const exportableFrameworks = ensureArray(raw.exportableFrameworks)
    .map((target) => ensureString(target))
    .filter((target) => SUPPORTED_EXPORT_TARGETS.includes(target))

  const pages = ensureArray(raw.pages).map(normalizePage)
  const normalizedPages = pages.length ? pages : fallback.pages.map(normalizePage)
  const ecommerceNormalized = normalizeEcommerce(raw, fallback)

  return {
    projectName: ensureString(raw.projectName, fallback.projectName),
    slug: ensureString(raw.slug, fallback.slug),
    siteType: ensureString(raw.siteType, fallback.siteType),
    userPrompt: ensureString(raw.userPrompt, fallback.userPrompt),
    generatedTimestamp: ensureString(raw.generatedTimestamp, fallback.generatedTimestamp),
    exportableFrameworks: exportableFrameworks.length
      ? exportableFrameworks
      : [...fallback.exportableFrameworks],
    version: ensureString(raw.version, fallback.version),
    theme:
      raw.theme && typeof raw.theme === 'object'
        ? {
            colors: { ...fallback.theme.colors, ...(raw.theme.colors || {}) },
            typography: {
              ...fallback.theme.typography,
              ...(raw.theme.typography || {}),
              scale: {
                ...fallback.theme.typography.scale,
                ...(raw.theme.typography?.scale || {}),
              },
            },
            radius: { ...fallback.theme.radius, ...(raw.theme.radius || {}) },
            spacing: { ...fallback.theme.spacing, ...(raw.theme.spacing || {}) },
            shadows: { ...fallback.theme.shadows, ...(raw.theme.shadows || {}) },
            appearance: { ...fallback.theme.appearance, ...(raw.theme.appearance || {}) },
            mood: ensureString(raw.theme.mood, fallback.theme.mood),
            tailwind: { ...fallback.theme.tailwind, ...(raw.theme.tailwind || {}) },
          }
        : fallback.theme,
    navigation:
      raw.navigation && typeof raw.navigation === 'object'
        ? {
            global: ensureArray(raw.navigation.global).map((item, idx) =>
              normalizeAction(item, idx),
            ),
            footer: ensureArray(raw.navigation.footer).map((item, idx) =>
              normalizeAction(item, idx),
            ),
            ctas: ensureArray(raw.navigation.ctas).map((item, idx) => normalizeAction(item, idx)),
          }
        : fallback.navigation,
    pages: normalizedPages,
    components: ensureArray(raw.components).map((component, idx) => ({
      id: ensureString(component?.id, `component-${idx + 1}`),
      type: ensureString(component?.type, 'component'),
      name: ensureString(component?.name, `Component${idx + 1}`),
    })),
    interactions: ensureArray(raw.interactions).map((interaction) => ({
      type: ensureString(interaction?.type, 'custom'),
      target: ensureString(interaction?.target, ''),
      behavior: ensureString(interaction?.behavior, ''),
    })),
    forms: ensureArray(raw.forms).map((form, idx) => ({
      id: ensureString(form?.id, `form-${idx + 1}`),
      pageId: ensureString(form?.pageId, normalizedPages[0]?.id || 'page-home'),
      fields: ensureArray(form?.fields).map(normalizeField),
      validationHints: ensureArray(form?.validationHints),
      successMessage: ensureString(form?.successMessage, 'Submitted successfully.'),
      errorMessage: ensureString(form?.errorMessage, 'Unable to submit.'),
      action:
        form?.action && typeof form.action === 'object'
          ? {
              type: ensureString(form.action.type, 'placeholder'),
              target: ensureString(form.action.target, ''),
            }
          : { type: 'placeholder', target: '' },
    })),
    assets: ensureArray(raw.assets),
    seo:
      raw.seo && typeof raw.seo === 'object'
        ? {
            title: ensureString(raw.seo.title, fallback.seo.title),
            description: ensureString(raw.seo.description, fallback.seo.description),
            siteName: ensureString(raw.seo.siteName, fallback.seo.siteName),
            siteUrl: ensureString(raw.seo.siteUrl, fallback.seo.siteUrl),
            keywords: ensureArray(raw.seo.keywords)
              .map((item) => ensureString(item))
              .filter(Boolean),
            ogImage: ensureString(raw.seo.ogImage, fallback.seo.ogImage),
            ogImageAlt: ensureString(raw.seo.ogImageAlt, fallback.seo.ogImageAlt),
            twitterCard: ensureString(raw.seo.twitterCard, fallback.seo.twitterCard),
            locale: ensureString(raw.seo.locale, fallback.seo.locale),
            robots: ensureString(raw.seo.robots, fallback.seo.robots),
          }
        : fallback.seo,
    backendFeatureHints: ensureArray(raw.backendFeatureHints)
      .map((item) => ensureString(item))
      .filter(Boolean),
    businessProfile: normalizeBusinessProfile(raw.businessProfile, fallback.businessProfile),
    planMeta: normalizePlanMeta(raw.planMeta, fallback.planMeta),
    exportOptions: normalizeExportOptions(raw.exportOptions),
    ...(ecommerceNormalized ? { ecommerce: ecommerceNormalized } : {}),
  }
}
