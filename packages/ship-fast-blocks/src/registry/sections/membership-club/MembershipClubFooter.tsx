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
 * MembershipClubFooter — multi-column site footer for a private membership club /
 * exclusive community page. A muted, border-topped band: a wide brand column (thin
 * concentric "compass" club mark + light club name + an about paragraph) beside
 * link columns of text buttons, then a bottom row with a dynamic-year copyright on
 * the left and inline legal links on the right. Brand mark and every link route
 * through useNavigate. Use as the closing footer for members clubs, founders/social
 * clubs, professional networks, curated communities or paid community
 * subscriptions. Renders fully with no props.
 */
export const MembershipClubFooter = defineCapsule({
  name: 'MembershipClubFooter',
  description:
    "Multi-column site footer for a private membership club / exclusive community page: a muted, border-topped band with a wide brand column (thin concentric 'compass' club mark + light club name + an about paragraph) beside link columns of text buttons, then a bottom row with a dynamic-year copyright on the left and inline legal links on the right. Brand mark and every link route through useNavigate. Use as the closing footer for members clubs, founders/social clubs, professional networks, curated communities or paid community subscriptions.",
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
    const homeTarget = props.homeTarget ?? 'Benefits'
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

    void homeTarget
    return (
      <SiteFooter className={props.className}>
        <FooterContent>
          <FooterGrid>
            <FooterBrand brand={brand} brandMark={<LogoMark />}>
              <FooterTagline>{about}</FooterTagline>
            </FooterBrand>
            {columns.map((col) => (
              <FooterColumn key={col.title}>
                <FooterColumnTitle>{col.title}</FooterColumnTitle>
                <FooterColumnList>
                  {col.links.map((link) => (
                    <FooterLink key={link}>{link}</FooterLink>
                  ))}
                </FooterColumnList>
              </FooterColumn>
            ))}
          </FooterGrid>
          <FooterBottom>
            <FooterCopyright>{copyright}</FooterCopyright>
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
