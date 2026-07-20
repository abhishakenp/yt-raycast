import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import {
  SiteFooter,
  FooterContent,
  FooterGrid,
  FooterBrand,
  FooterTagline,
  FooterSocial,
  FooterSocialLink,
  FooterColumn,
  FooterColumnTitle,
  FooterColumnList,
  FooterLink,
  FooterBottom,
  FooterCopyright,
  FooterLegal,
} from '#/section-kit/SiteFooter.tsx'

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
 * AnalyticsFooter — Swiss data-grid site footer for an analytics product,
 * composing the shared SiteFooter kit composite over a giant ghost brand
 * watermark. Renders a bar-chart brand mark, a confident tagline, social links
 * as hairline-framed mono chips, and four link columns whose titles are set as
 * mono uppercase micro-labels with tabular indexes (Product, Resources,
 * Company, Legal), plus a hairline bottom bar with a mono note and legal
 * links. Accepts public props to override every block. Use it as the closing
 * band of any analytics, BI, or data-product site for consistent, route-aware
 * navigation. Renders fully with no props via baked-in defaults.
 */
export const AnalyticsFooter = defineCapsule({
  name: 'AnalyticsFooter',
  description:
    'Swiss data-grid site footer for an analytics product, composing the shared SiteFooter kit composite over a giant ghost brand watermark. Renders a bar-chart brand mark, a confident tagline, social links as hairline-framed mono chips, and four link columns titled with mono uppercase micro-labels and tabular indexes (Product, Resources, Company, Legal), plus a hairline bottom bar with a mono note and legal links. Accepts public props to override every block. Use it as the closing band of any analytics, BI, or data-product site for consistent, route-aware navigation.',
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
        className={cn(
          'relative overflow-hidden border-t border-border bg-background',
          props.className,
        )}
      >
        <Watermark className="-bottom-6 left-0 text-[5rem] sm:text-[8rem] lg:text-[11rem]">
          {brand}
        </Watermark>
        <FooterContent className="relative py-14">
          <FooterGrid className="gap-0 border-l border-t border-border md:grid-cols-5">
            <FooterBrand
              brand={brand}
              brandMark={brandMark}
              brandClassName={'font-semibold tracking-tight'}
              className="border-b border-r border-border p-6 md:col-span-1"
            >
              <FooterTagline>{tagline}</FooterTagline>
              <FooterSocial>
                {social.map((s) => (
                  <FooterSocialLink
                    key={s.label}
                    className="border border-border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.15em] transition-colors hover:border-foreground/40 hover:bg-muted/40"
                  >
                    {s.label}
                  </FooterSocialLink>
                ))}
              </FooterSocial>
            </FooterBrand>
            {columns.map((col, i) => (
              <FooterColumn
                key={col.title}
                className="border-b border-r border-border p-6"
              >
                <FooterColumnTitle className="flex items-baseline gap-2 font-mono text-[11px] font-normal uppercase tracking-[0.2em] text-foreground">
                  <MonoTag
                    aria-hidden="true"
                    tone="faint"
                    className="text-[10px] tabular-nums"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </MonoTag>
                  {col.title}
                </FooterColumnTitle>
                <FooterColumnList className="mt-4">
                  {col.links.map((link) => (
                    <li key={link}>
                      <FooterLink className="inline-block">{link}</FooterLink>
                    </li>
                  ))}
                </FooterColumnList>
              </FooterColumn>
            ))}
          </FooterGrid>
          <FooterBottom className="border-t-0 pt-6">
            <FooterCopyright className="font-mono text-[11px] uppercase tracking-[0.15em]">
              {note}
            </FooterCopyright>
            <FooterLegal>
              {legal.map((l) => (
                <FooterLink key={l}>{l}</FooterLink>
              ))}
            </FooterLegal>
          </FooterBottom>
        </FooterContent>
      </SiteFooter>
    )
  },
})
