import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

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
 * NonprofitFooter — warm mission-editorial closing footer for a nonprofit /
 * charity / NGO site. Built on the shared `SiteFooter` composite as a calm
 * border-topped hairline ledger on a soft muted wash: a wide brand block (a
 * hand-drawn sprout glyph beside a serif organization wordmark, a tagline, and a
 * row of square mono social chips) leads an asymmetric grid of link columns
 * (Get Involved, About, Resources, Contact) whose titles are mono uppercase
 * micro-labels and whose links sit as tidy block rows. A hairline bottom bar
 * carries the registration note. Every link routes through section-kit route
 * links. Warm, human, trustworthy. Use as the site-wide footer for nonprofits,
 * charities, NGOs, foundations, or humanitarian organizations. Renders fully
 * with no props via baked-in "Roots of Hope" defaults.
 */
function SproutMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 22V12" />
      <path d="M12 12C12 8 9 5 4 5c0 5 3 8 8 8z" />
      <path d="M12 11c0-4 3-7 8-7 0 5-3 8-8 8" />
    </svg>
  )
}

export const NonprofitFooter = defineCapsule({
  name: 'NonprofitFooter',
  description:
    'Warm mission-editorial closing footer for a nonprofit / charity / NGO site built on the shared SiteFooter composite: a calm border-topped hairline ledger on a soft muted wash with a wide brand block (a hand-drawn sprout glyph + serif organization wordmark, a tagline, and a row of square mono social chips) leading an asymmetric grid of link columns (Get Involved, About, Resources, Contact) whose titles are mono uppercase micro-labels and whose links sit as tidy block rows, closed by a hairline bottom bar with the registration note. Every link routes through section-kit route links. Warm, human, trustworthy. Use as the site-wide footer for nonprofits, charities, NGOs, foundations, or humanitarian organizations.',
  props: z.object({
    /** Organization / brand name shown beside the logo mark. */
    brand: z.string().optional(),
    /** Short tagline below the wordmark. */
    tagline: z.string().optional(),
    /** Social channels rendered as a link row under the brand. */
    social: z
      .array(z.object({ label: z.string(), href: z.string().optional() }))
      .optional(),
    /** Link columns (Get Involved, About, Resources, Contact, …). */
    columns: z
      .array(z.object({ title: z.string(), links: z.array(z.string()) }))
      .optional(),
    /** Copyright note appended after the brand + year. */
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const social = props.social?.length
      ? props.social
      : [{ label: 'Instagram' }, { label: 'Facebook' }, { label: 'LinkedIn' }]
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Get Involved',
            links: ['Donate', 'Volunteer', 'Fundraise', 'Partner with us'],
          },
          {
            title: 'About',
            links: ['Our Mission', 'Our Impact', 'Annual Report', 'Careers'],
          },
          {
            title: 'Resources',
            links: ['Stories', 'News', 'Events', 'FAQ'],
          },
          {
            title: 'Contact',
            links: ['Get in Touch', 'Press', 'Newsletter', 'Find a Chapter'],
          },
        ]

    return (
      <SiteFooter className={props.className}>
        <FooterContent className="py-14 sm:py-16">
          <FooterGrid className="gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-6">
            <FooterBrand
              brand={props.brand ?? 'Roots of Hope'}
              brandMark={<SproutMark className="size-7 text-primary" />}
              brandClassName="font-serif text-xl font-medium tracking-tight"
              className="md:col-span-2 lg:col-span-2"
            >
              <FooterTagline className="mt-3 max-w-xs leading-relaxed">
                {props.tagline ??
                  'Planting hope and growing brighter futures with communities around the world.'}
              </FooterTagline>
              <FooterSocial className="mt-5 gap-2">
                {social.map((s) => (
                  <FooterSocialLink
                    key={s.label}
                    className="border border-border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground active:translate-y-px"
                  >
                    {s.label}
                  </FooterSocialLink>
                ))}
              </FooterSocial>
            </FooterBrand>
            {columns.map((col) => (
              <FooterColumn key={col.title}>
                <FooterColumnTitle className="font-mono text-[11px] font-normal uppercase tracking-[0.2em] text-muted-foreground">
                  {col.title}
                </FooterColumnTitle>
                <FooterColumnList className="mt-4 space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link}>
                      <FooterLink className="block w-fit text-foreground/80 hover:text-foreground">
                        {link}
                      </FooterLink>
                    </li>
                  ))}
                </FooterColumnList>
              </FooterColumn>
            ))}
          </FooterGrid>
          <FooterBottom className="mt-14">
            <FooterCopyright className="font-mono text-[11px] uppercase tracking-[0.15em]">
              {props.note ??
                'A registered 501(c)(3) nonprofit. All rights reserved.'}
            </FooterCopyright>
          </FooterBottom>
        </FooterContent>
      </SiteFooter>
    )
  },
})
