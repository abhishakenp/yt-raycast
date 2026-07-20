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
} from '#/section-kit/SiteFooter.tsx'

/**
 * EcommerceFooter — editorial-commerce closing footer for a general online
 * store. Built on the shared SiteFooter composite: an asymmetric 4+8 grid with
 * a brand block (square ink logo tile + wordmark + tagline + a row of square
 * mono social chips) beside four link columns whose mono uppercase titles
 * carry muted index numerals and whose links render block/w-fit with quiet
 * hover; a hairline-ruled bottom bar with a mono copyright sits above a giant
 * ghost brand wordmark bleeding off the footer's bottom edge. Every link,
 * social, and the brand logo route through section-kit route links. Use as
 * the closing footer for online stores, marketplaces, retail shops, ecommerce
 * sites, or any storefront that wants a sharp editorial footer. Renders fully
 * with no props via baked-in "Marketplace" defaults.
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

export const EcommerceFooter = defineCapsule({
  name: 'EcommerceFooter',
  description:
    'Editorial-commerce closing footer for a general online store built on the shared SiteFooter composite: an asymmetric 4+8 grid with a brand block (square ink logo tile + wordmark + tagline + square mono social chips) beside four link columns whose mono uppercase titles carry muted index numerals, a hairline-ruled bottom bar with a mono copyright, and a giant ghost brand wordmark bleeding off the bottom edge. Every link, social, and the brand logo route through section-kit route links. Use as the closing footer for online stores, marketplaces, retail shops, ecommerce sites, or any storefront that wants a sharp editorial footer.',
  props: z.object({
    /** Brand / store name shown as the bold wordmark. */
    brand: z.string().optional(),
    /** Short line about everyday essentials / great prices. */
    tagline: z.string().optional(),
    /** Four titled link columns; defaults to Shop / Help / Company / Legal. */
    columns: z
      .array(z.object({ title: z.string(), links: z.array(z.string()) }))
      .optional(),
    /** Social channels rendered as a link row under the brand. */
    social: z
      .array(z.object({ label: z.string(), href: z.string().optional() }))
      .optional(),
    /** Copyright note appended after the brand + year. */
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'Marketplace'
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Shop',
            links: [
              'New Arrivals',
              'Best Sellers',
              'Deals',
              'Gift Cards',
              'Categories',
            ],
          },
          {
            title: 'Help',
            links: [
              'Contact Us',
              'Shipping',
              'Returns & Exchanges',
              'Track Order',
              'FAQ',
            ],
          },
          {
            title: 'Company',
            links: [
              'About Us',
              'Careers',
              'Sustainability',
              'Press',
              'Affiliates',
            ],
          },
          {
            title: 'Legal',
            links: [
              'Privacy Policy',
              'Terms of Service',
              'Cookie Policy',
              'Accessibility',
            ],
          },
        ]
    const social = props.social?.length
      ? props.social
      : [
          { label: 'Instagram' },
          { label: 'Facebook' },
          { label: 'Twitter' },
          { label: 'TikTok' },
        ]

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
              brandClassName={'text-lg font-extrabold uppercase tracking-tight'}
              className="sm:col-span-2 md:col-span-2 lg:col-span-4"
            >
              <FooterTagline className="mt-4 max-w-xs text-sm leading-relaxed">
                {props.tagline ??
                  'Everyday essentials and the brands you love — quality you can trust at prices that make sense.'}
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
            <p
              aria-hidden="true"
              className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground/60"
            >
              [ EOF ]
            </p>
          </FooterBottom>
        </FooterContent>
      </SiteFooter>
    )
  },
})
