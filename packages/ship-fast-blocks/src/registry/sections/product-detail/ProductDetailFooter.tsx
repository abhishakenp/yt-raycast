import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Watermark } from '#/section-kit/Decor.tsx'
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

export const ProductDetailFooter = defineCapsule({
  name: 'ProductDetailFooter',
  description:
    'Editorial-product closing footer for the Product Detail page family, wrapping the shared SiteFooter composite. An asymmetric 4+8 grid pairs an Aurora brand block (square hairline logo mark + wordmark + tagline + a row of square mono social chips) with four Shop / Support / Company / Legal link columns whose mono uppercase titles carry muted index numerals and whose links render block/w-fit off a hairline left rule; a hairline-ruled bottom bar carries a mono copyright note and a mono legal row, all over a giant ghost brand wordmark bleeding off the bottom edge. Every link routes through section-kit route links. Use as the closing band of a premium single-product page like the Aurora Pro Headphones; fully prop-driven with Aurora defaults.',
  props: z.object({
    brand: z.string().optional(),
    tagline: z.string().optional(),
    columns: z
      .array(
        z.object({
          title: z.string(),
          links: z.array(z.string()),
        }),
      )
      .optional(),
    social: z
      .array(
        z.object({
          label: z.string(),
          href: z.string().optional(),
        }),
      )
      .optional(),
    legal: z.array(z.string()).optional(),
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'Aurora'
    const tagline =
      props.tagline ?? 'Premium audio, engineered for everyday life.'
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Shop',
            links: ['Aurora Pro', 'Aurora Air', 'Accessories', 'Gift Cards'],
          },
          {
            title: 'Support',
            links: ['Help Center', 'Shipping', 'Returns', 'Warranty'],
          },
          {
            title: 'Company',
            links: ['About', 'Careers', 'Press', 'Sustainability'],
          },
          { title: 'Legal', links: ['Privacy', 'Terms', 'Cookies'] },
        ]
    const social = props.social?.length
      ? props.social
      : [{ label: 'Instagram' }, { label: 'YouTube' }, { label: 'X' }]
    const legal = props.legal?.length
      ? props.legal
      : ['Privacy', 'Terms', 'Accessibility']
    const note = props.note ?? 'Crafted in California.'

    const mark = (
      <svg
        width={28}
        height={28}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-primary"
        aria-hidden="true"
      >
        <path d="M4 13a8 8 0 0 1 16 0" />
        <rect x="3" y="13" width="4" height="7" rx="1.4" />
        <rect x="17" y="13" width="4" height="7" rx="1.4" />
      </svg>
    )

    return (
      <SiteFooter
        className={cn(
          'relative overflow-hidden border-t border-border bg-background',
          props.className,
        )}
      >
        <Watermark className="bottom-[-0.42em] left-1/2 -translate-x-1/2 text-[clamp(4.5rem,14vw,11rem)] uppercase">
          {brand}
        </Watermark>
        <FooterContent className="relative px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
          <FooterGrid className="gap-x-8 gap-y-12 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-12">
            <FooterBrand
              brand={brand}
              brandMark={mark}
              brandClassName="text-lg font-extrabold uppercase tracking-tight"
              className="sm:col-span-2 md:col-span-2 lg:col-span-4"
            >
              <FooterTagline className="mt-4 max-w-xs text-sm leading-relaxed">
                {tagline}
              </FooterTagline>
              <FooterSocial className="mt-6 gap-2">
                {social.map((s) => (
                  <FooterSocialLink
                    key={s.label}
                    className="border border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                  >
                    {s.label}
                  </FooterSocialLink>
                ))}
              </FooterSocial>
            </FooterBrand>
            {columns.map((col, colIndex) => (
              <FooterColumn key={col.title} className="lg:col-span-2">
                <FooterColumnTitle className="flex items-baseline gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  <span
                    aria-hidden="true"
                    className="text-muted-foreground/50 tabular-nums"
                  >
                    {String(colIndex + 1).padStart(2, '0')}
                  </span>
                  {col.title}
                </FooterColumnTitle>
                <FooterColumnList className="mt-4 space-y-2.5 border-l border-border pl-4">
                  {col.links.map((link) => (
                    <FooterLink
                      key={link}
                      className="block w-fit text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link}
                    </FooterLink>
                  ))}
                </FooterColumnList>
              </FooterColumn>
            ))}
          </FooterGrid>
          <FooterBottom className="mt-14 pt-6">
            <FooterCopyright className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              {note}
            </FooterCopyright>
            <FooterLegal className="gap-x-6 gap-y-2">
              {legal.map((l) => (
                <FooterLink
                  key={l}
                  className="block w-fit font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
                >
                  {l}
                </FooterLink>
              ))}
            </FooterLegal>
          </FooterBottom>
        </FooterContent>
      </SiteFooter>
    )
  },
})
