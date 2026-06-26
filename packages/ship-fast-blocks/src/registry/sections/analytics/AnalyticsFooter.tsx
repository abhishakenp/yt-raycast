import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { SiteFooter } from '#/section-kit/SiteFooter.tsx'

const brandMark = (
  <svg
    className="size-7 text-primary"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M3 3v18h18" />
    <rect x="7" y="11" width="3" height="6" rx="0.5" />
    <rect x="12" y="7" width="3" height="10" rx="0.5" />
    <rect x="17" y="4" width="3" height="13" rx="0.5" />
  </svg>
)

const DEFAULT_COLUMNS: { title: string; links: string[] }[] = [
  {
    title: 'Product',
    links: ['Features', 'Dashboards', 'Integrations', 'Pricing'],
  },
  {
    title: 'Resources',
    links: ['Docs', 'API Reference', 'Changelog', 'Status'],
  },
  { title: 'Company', links: ['About', 'Careers', 'Customers', 'Contact'] },
  { title: 'Legal', links: ['Privacy', 'Terms', 'Security', 'DPA'] },
]

const DEFAULT_SOCIAL: { label: string; href?: string }[] = [
  { label: 'X' },
  { label: 'GitHub' },
  { label: 'LinkedIn' },
]

const DEFAULT_LEGAL = ['Privacy', 'Terms', 'Cookies']

/**
 * AnalyticsFooter — sharp, data-forward site footer for an analytics product,
 * composing the shared SiteFooter kit composite. Renders a bar-chart brand mark,
 * a confident tagline, social links, and four link columns (Product, Resources,
 * Company, Legal), plus a bottom bar with copyright, a short note, and legal
 * links. Accepts public props to override every block. Use it as the closing
 * band of any analytics, BI, or data-product site for consistent, route-aware
 * navigation. Renders fully with no props via baked-in defaults.
 */
export const AnalyticsFooter = defineComponent({
  name: 'AnalyticsFooter',
  description:
    'Sharp, data-forward site footer for an analytics product, composing the shared SiteFooter kit composite. Renders a bar-chart brand mark, a confident tagline, social links, and four link columns (Product, Resources, Company, Legal), plus a bottom bar with copyright, a short note, and legal links. Accepts public props to override every block. Use it as the closing band of any analytics, BI, or data-product site for consistent, route-aware navigation.',
  props: z.object({
    brand: z.string().optional(),
    tagline: z.string().optional(),
    columns: z
      .array(z.object({ title: z.string(), links: z.array(z.string()) }))
      .optional(),
    social: z
      .array(z.object({ label: z.string(), href: z.string().optional() }))
      .optional(),
    legal: z.array(z.string()).optional(),
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'Pulse Analytics'
    const tagline =
      props.tagline ??
      'The fast, queryable analytics platform that turns raw events into decisions you can ship.'
    const columns = props.columns?.length ? props.columns : DEFAULT_COLUMNS
    const social = props.social?.length ? props.social : DEFAULT_SOCIAL
    const legal = props.legal?.length ? props.legal : DEFAULT_LEGAL
    const note = props.note ?? 'Built for teams who trust their data.'

    return (
      <SiteFooter
        brand={brand}
        brandMark={brandMark}
        brandClassName="font-semibold tracking-tight"
        tagline={tagline}
        columns={columns}
        social={social}
        legal={legal}
        note={note}
        className={props.className}
      />
    )
  },
})
