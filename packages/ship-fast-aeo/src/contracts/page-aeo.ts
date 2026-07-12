export type EntityContact = {
  email?: string
  phone?: string
  location?: string
  address?: string
}

export type EntitySignals = {
  brandName?: string
  category?: string
  audience?: string
  useCases?: string[]
  benefits?: string[]
  differentiators?: string[]
  contact?: EntityContact
}

export type PageAeoContract = {
  objective?: string
  targetIntent?: string
  suggestedQueries?: string[]
  entitySignals?: EntitySignals
}

export type BreadcrumbItem = {
  label: string
  href?: string
}

export type SitePageLike = {
  route?: string
  title?: string
  description?: string
  name?: string
  seo?: Record<string, unknown>
  aeo?: PageAeoContract
  breadcrumbs?: BreadcrumbItem[]
  sections?: SectionLike[]
}

export type SectionLike = {
  id?: string
  type?: string
  variant?: string
  headline?: string
  subheadline?: string
  body?: string
  items?: SectionItemLike[]
  columns?: ComparisonColumnLike[]
  rows?: ComparisonRowLike[]
  interactions?: Array<{ behavior?: string }>
}

export type SectionItemLike = {
  title?: string
  body?: string
  label?: string
  value?: string
  quote?: string
  author?: string
  price?: string
  features?: string[]
  href?: string
  description?: string
}

export type ComparisonColumnLike = {
  title?: string
  highlight?: boolean
}

export type ComparisonRowLike = {
  label?: string
  values?: string[]
}

export type SiteSpecLike = {
  brand?: string
  projectName?: string
  siteType?: string
  seo?: Record<string, unknown>
  theme?: { colors?: { background?: string } }
  generatedTimestamp?: string
  pages?: SitePageLike[]
}
