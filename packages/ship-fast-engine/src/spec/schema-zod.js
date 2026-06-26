import { z } from 'zod'
import { SUPPORTED_EXPORT_TARGETS } from './defaults.js'

export const ThemeSchema = z.object({
  primaryColor: z.string().default('#6366f1'),
  backgroundColor: z.string().default('#ffffff'),
  textColor: z.string().default('#111827'),
  accentColor: z.string().optional(),
  typography: z
    .object({
      heading: z.string().optional(),
      body: z.string().optional(),
      mono: z.string().optional(),
    })
    .optional(),
})

export const ActionSchema = z.object({
  id: z.string(),
  label: z.string(),
  href: z.string().default('#'),
  style: z
    .enum(['primary', 'secondary', 'ghost', 'outline'])
    .default('secondary'),
})

export const SectionItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string().default(''),
  quote: z.string().default(''),
  author: z.string().default(''),
  value: z.string().default(''),
  label: z.string().default(''),
  href: z.string().default(''),
  price: z.string().default(''),
  features: z.array(z.string()).default([]),
})

export const SectionSchema = z.object({
  id: z.string(),
  type: z.string(),
  headline: z.string().optional(),
  subheadline: z.string().optional(),
  body: z.string().optional(),
  items: z.array(SectionItemSchema).default([]),
  actions: z.array(ActionSchema).default([]),
})

export const PageSchema = z.object({
  id: z.string(),
  name: z.string(),
  route: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  sections: z.array(SectionSchema).default([]),
})

export const ExportOptionsSchema = z
  .object({
    cms: z.enum(['sanity']).optional(),
    embedSanityStudio: z.boolean().optional(),
  })
  .optional()

export const SiteSpecSchema = z.object({
  version: z.string().optional(),
  projectName: z.string(),
  slug: z.string(),
  siteType: z.string(),
  exportableFrameworks: z
    .array(
      z.enum(/** @type {[string, ...string[]]} */ (SUPPORTED_EXPORT_TARGETS)),
    )
    .min(1),
  theme: ThemeSchema,
  pages: z.array(PageSchema).min(1),
  exportOptions: ExportOptionsSchema,
  brandColors: z.array(z.string()).optional(),
  brandLogoUrl: z.string().optional(),
})

/** @typedef {import('zod').infer<typeof SiteSpecSchema>} SiteSpec */
/** @typedef {import('zod').infer<typeof PageSchema>} Page */
/** @typedef {import('zod').infer<typeof SectionSchema>} Section */
/** @typedef {import('zod').infer<typeof ThemeSchema>} Theme */
