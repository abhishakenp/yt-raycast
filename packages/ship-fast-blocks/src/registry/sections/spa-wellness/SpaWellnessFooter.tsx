import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { Container } from '#/section-kit/Container.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import {
  SiteFooter,
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
 * SpaWellnessFooter — airy calm-luxury ledger footer for a day-spa / wellness
 * site. A hairline-topped soft-wash band with a giant ghost serif brand
 * watermark bleeding off the bottom edge: an asymmetric 12-column grid pairs a
 * wide brand block (delicate serif wordmark, tagline, and square mono social
 * chips with hard hover borders) with mono-labeled link columns whose links sit
 * as block w-fit rows; hours, address, and contact fold into a "Visit" column
 * alongside the navigational columns. A hairline-divided bottom bar carries the
 * copyright line and a decorative mono tag. The wordmark, social, and every
 * column link route through section-kit route links. Use as the closing site
 * footer for spas, wellness retreats, and treatment studios. Renders fully with
 * no props via baked-in defaults.
 */
export const SpaWellnessFooter = defineCapsule({
  name: 'SpaWellnessFooter',
  description:
    'Airy calm-luxury ledger footer for a day-spa / wellness site: a hairline-topped soft-wash band with a giant ghost serif brand watermark, an asymmetric 12-column grid pairing a wide brand block (delicate serif wordmark, tagline, square mono social chips) with mono-labeled link columns of block w-fit rows where hours / address / contact fold into a Visit column, and a hairline-divided bottom bar with the copyright line and a decorative mono tag. The wordmark, social, and column links route through section-kit route links. Use as the closing site footer for spas, wellness retreats, and treatment studios.',
  props: z.object({
    /** Serif wordmark / brand name. */
    brand: z.string().optional(),
    /** Tagline beneath the wordmark. */
    tagline: z.string().optional(),
    /** Opening hours line. */
    hours: z.string().optional(),
    /** Address line. */
    address: z.string().optional(),
    /** Contact line (phone / email). */
    contact: z.string().optional(),
    /** Social channels rendered as a link row under the brand. */
    social: z
      .array(z.object({ label: z.string(), href: z.string().optional() }))
      .optional(),
    /** Footer link columns. */
    columns: z
      .array(z.object({ title: z.string(), links: z.array(z.string()) }))
      .optional(),
    /** Copyright note appended after the brand + year. */
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'Lumen Spa'
    const hours = props.hours ?? 'Open Daily · 9am–8pm'
    const address = props.address ?? '12 Willow Lane, Sausalito, CA'
    const contact = props.contact ?? '(415) 555-0147 · hello@lumenspa.com'
    const social = props.social?.length
      ? props.social
      : [{ label: 'Instagram' }, { label: 'Facebook' }, { label: 'Pinterest' }]
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Visit',
            links: [hours, address, contact],
          },
          {
            title: 'Explore',
            links: ['Treatments', 'Memberships', 'Gift Cards', 'Booking'],
          },
          {
            title: 'Studio',
            links: ['About', 'Our Therapists', 'Careers', 'Contact'],
          },
        ]

    return (
      <SiteFooter
        className={
          'relative overflow-hidden border-t border-border bg-muted/30' +
          (props.className ? ' ' + props.className : '')
        }
      >
        <Watermark className="-bottom-6 -right-2 font-serif text-[5rem] font-normal sm:text-[9rem] lg:text-[12rem]">
          {brand}
        </Watermark>
        <Container className="relative py-14 lg:py-16">
          <FooterGrid className="grid gap-10 md:grid-cols-12 lg:gap-8">
            <FooterBrand
              brand={brand}
              brandClassName="font-serif text-xl font-semibold tracking-tight"
              className="md:col-span-3"
            >
              <FooterTagline className="max-w-sm">
                {props.tagline ??
                  'A quiet sanctuary for rest, renewal, and everyday calm.'}
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
              <FooterColumn key={col.title} className="md:col-span-3">
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
        </Container>
      </SiteFooter>
    )
  },
})
