import { SUPPORTED_EXPORT_TARGETS, SUPPORTED_SECTION_TYPES } from './defaults.js'

export function validateSiteSpec(spec) {
  const errors = []

  if (!spec || typeof spec !== 'object') {
    return { valid: false, errors: ['Site spec must be an object.'] }
  }

  if (!spec.projectName) errors.push('projectName is required.')
  if (!spec.slug) errors.push('slug is required.')
  if (!spec.siteType) errors.push('siteType is required.')
  if (!Array.isArray(spec.exportableFrameworks) || spec.exportableFrameworks.length === 0) {
    errors.push('exportableFrameworks must contain at least one target.')
  } else {
    for (const target of spec.exportableFrameworks) {
      if (!SUPPORTED_EXPORT_TARGETS.includes(target)) {
        errors.push(`Unsupported export target "${target}".`)
      }
    }
  }

  if (!spec.theme || typeof spec.theme !== 'object') errors.push('theme is required.')
  if (spec.exportOptions != null) {
    if (typeof spec.exportOptions !== 'object' || Array.isArray(spec.exportOptions)) {
      errors.push('exportOptions must be an object.')
    } else if (spec.exportOptions.cms != null && spec.exportOptions.cms !== 'sanity') {
      errors.push(`Unsupported exportOptions.cms "${spec.exportOptions.cms}".`)
    }
    if (
      spec.exportOptions.embedSanityStudio != null &&
      typeof spec.exportOptions.embedSanityStudio !== 'boolean'
    ) {
      errors.push('exportOptions.embedSanityStudio must be a boolean.')
    }
  }
  if (!Array.isArray(spec.pages) || spec.pages.length === 0)
    errors.push('pages must contain at least one page.')

  const seenRoutes = new Set()
  const seenPageIds = new Set()

  for (const page of spec.pages || []) {
    if (!page.id) errors.push('Every page requires an id.')
    if (!page.route) errors.push(`Page "${page.name || page.id || 'unknown'}" is missing a route.`)
    if (!Array.isArray(page.sections)) {
      errors.push(`Page "${page.name || page.id || 'unknown'}" must include sections.`)
      continue
    }
    if (seenPageIds.has(page.id)) errors.push(`Duplicate page id "${page.id}".`)
    if (seenRoutes.has(page.route)) errors.push(`Duplicate page route "${page.route}".`)
    seenPageIds.add(page.id)
    seenRoutes.add(page.route)

    const seenSectionIds = new Set()
    for (const section of page.sections) {
      if (!section.id) errors.push(`Page "${page.id}" has a section without an id.`)
      if (!section.type) errors.push(`Section "${section.id || 'unknown'}" is missing a type.`)
      if (section.type && !SUPPORTED_SECTION_TYPES.includes(section.type)) {
        errors.push(`Section "${section.id || 'unknown'}" has unsupported type "${section.type}".`)
      }
      if (seenSectionIds.has(section.id)) {
        errors.push(`Page "${page.id}" has duplicate section id "${section.id}".`)
      }
      seenSectionIds.add(section.id)
    }

    if (page.renderBlueprint) {
      if (!page.renderBlueprint.bodyHtml) {
        errors.push(`Page "${page.id}" renderBlueprint is missing bodyHtml.`)
      }
    }
  }

  return { valid: errors.length === 0, errors }
}
