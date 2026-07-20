import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import {
  SiteFooter,
  FooterContent,
  FooterGrid,
  FooterBrand,
  FooterTagline,
  FooterColumn,
  FooterColumnTitle,
  FooterColumnList,
  FooterLink,
  FooterBottom,
  FooterCopyright,
  FooterLegal,
} from '#/section-kit/SiteFooter.tsx'

/**
 * MembershipClubFooter — airy multi-column footer for a private membership club /
 * exclusive community page. A muted, border-topped band: a wide brand column
 * (thin concentric club mark + serif club wordmark + an about paragraph) beside
 * mono micro-label link columns of block hit-target text links, then a bottom row
 * with a dynamic-year mono copyright on the left and inline mono legal links on
 * the right. Brand mark and every link route through section-kit route links. Use
 * as the closing footer for members clubs, founders/social clubs, professional
 * networks, curated communities or paid community subscriptions. Renders fully
 * with no props.
 */
export const MembershipClubFooter = defineCapsule({
  name: 'MembershipClubFooter',
  description:
    'Airy multi-column footer for a private membership club / exclusive community page: a muted, border-topped band with a wide brand column (thin concentric club mark + serif club wordmark + an about paragraph) beside mono micro-label link columns of block hit-target text links, then a bottom row with a dynamic-year mono copyright on the left and inline mono legal links on the right. Brand mark and every link route through section-kit route links. Use as the closing footer for members clubs, founders/social clubs, professional networks, curated communities or paid community subscriptions.',
  props: z.object({
    /** Brand / club name shown beside the logo mark. */
    brand: z.string().optional(),
    /** Route target fired by the footer brand mark (site home). */
    homeTarget: z.string().optional(),
    about: z.string().optional(),
    columns: z
      .array(z.object({ title: z.string(), links: z.array(z.string()) }))
      .optional(),
    copyright: z.string().optional(),
    legal: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'The Guild'
    const about =
      props.about ??
      'A private membership for people who value depth over breadth. Curated connections, intimate events, and spaces designed for genuine relationships.'
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Membership',
            links: [
              'Membership Tiers',
              'Benefits',
              'Gift Membership',
              'Corporate Plans',
            ],
          },
          {
            title: 'Company',
            links: ['About', 'Careers', 'Press', 'Contact'],
          },
        ]
    const copyright = props.copyright ?? 'The Guild, Inc. All rights reserved.'
    const legal = props.legal?.length
      ? props.legal
      : ['Privacy', 'Terms', 'Code of Conduct']

    const LogoMark = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className={className}
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2L12 12L19 19" />
      </svg>
    )

    return (
      <SiteFooter className={props.className}>
        <FooterContent className="py-16">
          <FooterGrid>
            <FooterBrand
              brand={brand}
              brandMark={<LogoMark />}
              brandClassName="font-serif text-xl font-normal tracking-tight text-foreground"
            >
              <FooterTagline className="max-w-xs">{about}</FooterTagline>
            </FooterBrand>
            {columns.map((col) => (
              <FooterColumn key={col.title}>
                <FooterColumnTitle className="font-mono text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
                  {col.title}
                </FooterColumnTitle>
                <FooterColumnList className="mt-4 space-y-3">
                  {col.links.map((link) => (
                    <FooterLink key={link} className="block w-fit">
                      {link}
                    </FooterLink>
                  ))}
                </FooterColumnList>
              </FooterColumn>
            ))}
          </FooterGrid>
          <FooterBottom>
            <FooterCopyright className="font-mono text-[11px] uppercase tracking-[0.18em]">
              {copyright}
            </FooterCopyright>
            <FooterLegal>
              {legal.map((l) => (
                <FooterLink
                  key={l}
                  className="block w-fit font-mono text-[11px] uppercase tracking-[0.18em]"
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
