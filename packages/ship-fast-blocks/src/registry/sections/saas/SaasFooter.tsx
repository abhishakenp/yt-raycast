import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

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
} from '#/section-kit/SiteFooter.tsx'

/**
 * SaasFooter — kinetic-SaaS ledger footer for a SaaS / AI-product landing page.
 * A hairline-topped band with a giant ghost brand watermark bleeding off the
 * bottom edge: an asymmetric 12-column grid pairs a wide brand block (sharp
 * square brand-initial glyph + wordmark, a tagline, and square mono social chips
 * with hard hover borders) with mono-labeled link columns (Product / Company /
 * Resources / Legal); below, a hairline-topped bottom bar carries the copyright
 * line and a decorative "[ EOF ]" tag. The brand, every column link, and each
 * social link route through section-kit route links. Use as the closing footer
 * for SaaS, API, or B2B product sites. Renders fully with no props via baked-in
 * "Chronos AI" defaults.
 */
function BrandTile({ brand }: { brand: string }) {
  return (
    <span
      className="grid size-9 place-items-center rounded-none bg-foreground text-base font-black text-background"
      aria-hidden="true"
    >
      {brand.charAt(0).toUpperCase()}
    </span>
  )
}

export const SaasFooter = defineCapsule({
  name: 'SaasFooter',
  description:
    'Kinetic-SaaS ledger footer for a SaaS / AI-product landing page: a hairline-topped band with a giant ghost brand watermark, an asymmetric 12-column grid pairing a wide brand block (sharp square brand-initial glyph + wordmark, tagline, square mono social chips) with mono-labeled link columns (Product / Company / Resources / Legal), and a hairline-topped bottom bar with the copyright line and a decorative [ EOF ] tag. The brand, every column link, and each social link route through section-kit route links. Use as the closing footer for SaaS, API, or B2B product sites.',
  props: z.object({
    /** Brand / product name shown beside the logo tile. */
    brand: z.string().optional(),
    /** Short tagline under the wordmark. */
    tagline: z.string().optional(),
    /** Link columns: each a title plus a list of link labels. */
    columns: z
      .array(
        z.object({
          title: z.string(),
          links: z.array(z.string()),
        }),
      )
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
    const brand = props.brand ?? 'Chronos AI'
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Product',
            links: ['Features', 'Integrations', 'Pricing', 'Changelog'],
          },
          {
            title: 'Company',
            links: ['About', 'Careers', 'Blog', 'Contact'],
          },
          {
            title: 'Resources',
            links: ['Documentation', 'API Reference', 'Community', 'Support'],
          },
          {
            title: 'Legal',
            links: ['Privacy', 'Terms', 'Security', 'Cookies'],
          },
        ]
    const social = props.social?.length
      ? props.social
      : [{ label: 'Twitter' }, { label: 'LinkedIn' }, { label: 'GitHub' }]

    return (
      <SiteFooter
        className={
          'relative overflow-hidden border-t border-border bg-background' +
          (props.className ? ' ' + props.className : '')
        }
      >
        {/* Giant ghost brand watermark bleeding off the bottom edge. */}
        <Watermark className="-bottom-6 -right-2 text-[5rem] sm:text-[9rem] lg:text-[12rem]">
          {brand}
        </Watermark>
        <FooterContent className="relative">
          <FooterGrid className="grid gap-10 md:grid-cols-12 lg:gap-8">
            <FooterBrand
              brand={brand}
              brandMark={<BrandTile brand={brand} />}
              brandClassName={'text-lg font-bold tracking-tight'}
              className="md:col-span-4"
            >
              <FooterTagline className="max-w-sm">
                {props.tagline ??
                  'AI-powered scheduling that gives you back your time. Smart, secure, and built for teams that move fast.'}
              </FooterTagline>
              <FooterSocial className="mt-5 gap-2">
                {social.map((s) => (
                  <FooterSocialLink
                    key={s.label}
                    className="rounded-none border border-border px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                  >
                    {s.label}
                  </FooterSocialLink>
                ))}
              </FooterSocial>
            </FooterBrand>
            {columns.map((col) => (
              <FooterColumn key={col.title} className="md:col-span-2">
                <FooterColumnTitle className="font-mono text-[11px] font-normal uppercase tracking-[0.2em] text-muted-foreground">
                  <span aria-hidden="true" className="text-primary">
                    /{' '}
                  </span>
                  {col.title}
                </FooterColumnTitle>
                <FooterColumnList className="mt-4 space-y-2.5">
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
          <FooterBottom className="mt-12 flex flex-col justify-between gap-4 border-t border-border pt-6 sm:flex-row sm:items-center">
            <FooterCopyright className="text-sm text-muted-foreground">
              {props.note ?? 'All rights reserved.'}
            </FooterCopyright>
            <MonoTag tone="faint" aria-hidden="true">
              [ EOF ]
            </MonoTag>
          </FooterBottom>
        </FooterContent>
      </SiteFooter>
    )
  },
})
