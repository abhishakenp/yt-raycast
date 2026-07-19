import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

/**
 * MarketingAgencyFooter — a 4-column site footer. A bordered footer on the page
 * surface: a brand column (layered-diamond glyph + name + short about blurb)
 * beside three link columns of titled lists, with a divider rule above a bottom
 * bar holding an auto-year copyright line and a row of legal links. Every link
 * routes through useNavigate; the brand returns to the home target. Use as the
 * closing footer for a marketing / growth agency, SaaS, or B2B services site.
 * Renders fully with no props.
 */
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
export const MarketingAgencyFooter = defineCapsule({
  name: 'MarketingAgencyFooter',
  description:
    '4-column site footer: a bordered footer on the page surface with a brand column (layered-diamond glyph + name + short about blurb) beside three titled link-list columns, plus a divider rule above a bottom bar holding an auto-year copyright line and a row of legal links. Every link routes through useNavigate; the brand returns to the home target. Use as the closing footer for a marketing / growth agency, SaaS, or B2B services site.',
  props: z.object({
    /** Agency / brand name shown beside the logo glyph. */
    brand: z.string().optional(),
    /** Nav target the brand button routes to (typically the home label). */
    homeTarget: z.string().optional(),
    about: z.string().optional(),
    columns: z
      .array(
        z.object({
          title: z.string(),
          links: z.array(z.string()),
        }),
      )
      .optional(),
    copyright: z.string().optional(),
    legal: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'Nexus Growth'
    const about =
      props.about ??
      'Data-driven marketing for ambitious brands. Based in San Francisco, working with clients globally.'
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Services',
            links: [
              'Performance Marketing',
              'SEO & Content',
              'Email Marketing',
              'CRO',
            ],
          },
          {
            title: 'Company',
            links: ['About', 'Case Studies', 'Careers', 'Contact'],
          },
          {
            title: 'Connect',
            links: ['Twitter', 'LinkedIn', 'YouTube', 'Newsletter'],
          },
        ]
    const copyright = props.copyright ?? 'All rights reserved.'
    const legal = props.legal?.length
      ? props.legal
      : ['Privacy Policy', 'Terms of Service', 'Cookie Policy']
    const LogoMark = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className={className}
        aria-hidden="true"
      >
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    )
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
