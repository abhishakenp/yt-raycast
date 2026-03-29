import { SITE_SPEC_VERSION, SUPPORTED_EXPORT_TARGETS, SUPPORTED_SECTION_TYPES } from './defaults.js'

export const siteSpecSchema = {
  version: SITE_SPEC_VERSION,
  supportedExportTargets: SUPPORTED_EXPORT_TARGETS,
  supportedSectionTypes: SUPPORTED_SECTION_TYPES,
  requiredProjectFields: [
    'projectName',
    'slug',
    'siteType',
    'userPrompt',
    'generatedTimestamp',
    'exportableFrameworks',
    'version',
  ],
  requiredPageFields: ['id', 'name', 'route', 'title', 'description', 'seo', 'layoutType', 'sections'],
  requiredSectionFields: ['id', 'type', 'variant'],
}
