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
 * PropertyListingFooter — editorial closing footer for a property marketplace.
 * A brand block (square ink logo tile + extrabold uppercase wordmark + blurb +
 * square mono social chips) sits beside several "explore" link columns whose
 * mono uppercase titles carry muted index numerals and whose links render
 * block/w-fit with quiet hover; a hairline-ruled bottom bar with a mono
 * copyright sits above a giant ghost brand wordmark bleeding off the footer's
 * bottom edge. The wordmark and every link route through section-kit route
 * links. Use as the closing footer for a property search portal or listing
 * marketplace. Renders fully with no props via baked defaults.
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

export const PropertyListingFooter = defineCapsule({
  name: 'PropertyListingFooter',
  description:
    "Editorial closing footer for a property marketplace: a brand block (square ink logo tile + extrabold uppercase wordmark + blurb + square mono social chips) beside several 'explore' link columns whose mono uppercase titles carry muted index numerals, a hairline-ruled bottom bar with a mono copyright, and a giant ghost brand wordmark bleeding off the bottom edge. Wordmark and links route through section-kit route links. Use as the closing footer for a property search portal or listing marketplace.",
  props: z.object({
    /** Brand wordmark beside the logo tile. */
    brand: z.string().optional(),
    /** Short blurb under the wordmark. */
    blurb: z.string().optional(),
    /** Contact line (phone / email). */
    contact: z.string().optional(),
    /** Explore link columns. */
    columns: z
      .array(z.object({ title: z.string(), links: z.array(z.string()) }))
      .optional(),
    /** Social link labels. */
    social: z.array(z.string()).optional(),
    /** Copyright note appended after the brand + year. */
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'Nestable'
    const blurb =
      props.blurb ??
      'The fast, clutter-free way to search verified homes for sale and rent across the country.'
    const contact = props.contact ?? 'support@nestable.com · (888) 555-0190'
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Explore',
            links: ['For Sale', 'For Rent', 'New Builds', 'Open Houses'],
          },
          {
            title: 'Search',
            links: ['Cities', 'Neighborhoods', 'Map Search', 'Saved Alerts'],
          },
          {
            title: 'Company',
            links: ['About', 'Agents', 'Post a Listing', 'Help Center'],
          },
        ]
    const social = props.social?.length
      ? props.social
      : ['Instagram', 'Twitter', 'LinkedIn']
    const note = props.note ?? 'All rights reserved.'

    const footerColumns = [...columns, { title: 'Contact', links: [contact] }]

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
                {blurb}
              </FooterTagline>
              <FooterSocial className="mt-6 gap-2">
                {social
                  .map((label) => ({ label }))
                  .map((s) => (
                    <FooterSocialLink
                      key={s.label}
                      className="border border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                    >
                      {s.label}
                    </FooterSocialLink>
                  ))}
              </FooterSocial>
            </FooterBrand>
            {footerColumns.map((col, colIndex) => (
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
