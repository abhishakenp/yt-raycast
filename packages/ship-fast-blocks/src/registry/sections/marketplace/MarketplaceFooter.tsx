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

/**
 * MarketplaceFooter — editorial commerce-index closing footer for a multi-vendor
 * marketplace. Built on the shared SiteFooter composite: an asymmetric 4+8 grid
 * with a brand block (square ink logo tile + extrabold uppercase wordmark +
 * tagline + a row of square mono social chips) beside four link columns whose
 * mono uppercase titles carry muted index numerals and whose links render
 * block/w-fit with quiet hover; a hairline-ruled bottom bar carries an
 * auto-updating mono copyright plus legal links, and a giant ghost brand
 * wordmark bleeds off the footer's bottom edge. Every brand, social, and column
 * link routes through section-kit route links. Use as the site-wide footer for
 * online marketplaces, multi-vendor or maker/artisan platforms, handmade/craft
 * stores, and retail aggregators. Renders fully with no props via baked-in
 * "MarketHub" defaults.
 */
function LogoTile({ brand }: { brand: string }) {
  return (
    <span
      className="grid size-8 place-items-center rounded-none bg-foreground text-base font-extrabold text-background"
      aria-hidden="true"
    >
      {brand.charAt(0).toUpperCase()}
    </span>
  )
}

export const MarketplaceFooter = defineCapsule({
  name: 'MarketplaceFooter',
  description:
    'Editorial commerce-index closing footer for a multi-vendor marketplace built on the shared SiteFooter composite: an asymmetric 4+8 grid with a brand block (square ink logo tile + extrabold uppercase wordmark + tagline + square mono social chips) beside four link columns whose mono uppercase titles carry muted index numerals and whose links render block/w-fit with quiet hover, a hairline-ruled bottom bar with a mono copyright + legal links, and a giant ghost brand wordmark bleeding off the bottom edge. Every brand, social, and column link routes through section-kit route links. Use as the site-wide footer for online marketplaces, multi-vendor or maker/artisan platforms, handmade/craft stores, and retail aggregators.',
  props: z.object({
    /** Brand / marketplace name shown as the wordmark. */
    brand: z.string().optional(),
    /** Short tagline below the wordmark. */
    tagline: z.string().optional(),
    /** Social channels rendered as a link row under the brand. */
    social: z
      .array(z.object({ label: z.string(), href: z.string().optional() }))
      .optional(),
    /** Link columns (Shop, Sell, Company, Support, …), each a title + labels. */
    columns: z
      .array(z.object({ title: z.string(), links: z.array(z.string()) }))
      .optional(),
    /** Legal links shown in the bottom bar. */
    legal: z.array(z.string()).optional(),
    /** Copyright note appended after the brand + year. */
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'MarketHub'
    const social = props.social?.length
      ? props.social
      : [{ label: 'Instagram' }, { label: 'Twitter' }, { label: 'Pinterest' }]
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Shop',
            links: ['Categories', 'Trending', 'New Arrivals', 'Gift Cards'],
          },
          {
            title: 'Sell',
            links: [
              'Start Selling',
              'Seller Handbook',
              'Pricing & Fees',
              'Seller Stories',
            ],
          },
          {
            title: 'Company',
            links: ['About', 'Careers', 'Press', 'Blog'],
          },
          {
            title: 'Support',
            links: ['Help Center', 'Buyer Protection', 'Shipping', 'Contact'],
          },
        ]
    const legal = props.legal?.length
      ? props.legal
      : ['Privacy', 'Terms', 'Cookies']

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
              brandMark={<LogoTile brand={brand} />}
              brandClassName="text-lg font-extrabold uppercase tracking-tight"
              className="sm:col-span-2 md:col-span-2 lg:col-span-4"
            >
              <FooterTagline className="mt-4 max-w-xs text-sm leading-relaxed">
                {props.tagline ??
                  'The marketplace where independent sellers and curious buyers meet — millions of unique products, one trusted checkout.'}
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
              {props.note ?? 'All rights reserved.'}
            </FooterCopyright>
            <FooterLegal>
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
