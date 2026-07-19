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
  FooterLegal,
} from '#/section-kit/SiteFooter.tsx'

/**
 * NewsFooter — fat multi-column closing footer for a news / editorial
 * publication. Thin configuration over the shared `SiteFooter` composite: a
 * bold wordmark beside an inline newspaper-glyph mark, a tagline, a social row,
 * and a responsive grid of link columns (Sections / Company / Support / Legal),
 * with a bordered-top bottom bar carrying an auto-updating copyright line and a
 * row of legal links. Use as the closing footer of a newspaper, magazine or
 * publication homepage. Renders fully with no props via baked-in "The
 * Chronicle" defaults.
 */
function Masthead({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M7 8h10M7 12h10M7 16h6" />
    </svg>
  )
}

export const NewsFooter = defineCapsule({
  name: 'NewsFooter',
  description:
    'Fat multi-column closing footer for a news / editorial publication built on the shared SiteFooter composite: a brand block (bold wordmark + newspaper-glyph mark + tagline + social row) alongside link columns (Sections / Company / Support / Legal), with a bordered-top bottom bar carrying an auto-updating copyright line and a row of legal links. Every brand, social and column link routes through section-kit route links. Use as the closing footer of a newspaper, magazine or publication homepage.',
  props: z.object({
    /** Publication / masthead name shown beside the logo. */
    brand: z.string().optional(),
    /** Tagline under the brand. */
    tagline: z.string().optional(),
    /** Link columns, each a title + labels. */
    columns: z
      .array(z.object({ title: z.string(), links: z.array(z.string()) }))
      .optional(),
    /** Social channels rendered as a link row under the brand. */
    social: z
      .array(z.object({ label: z.string(), href: z.string().optional() }))
      .optional(),
    /** Legal links in the bottom bar. */
    legal: z.array(z.string()).optional(),
    /** Copyright note appended after the brand + year. */
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Sections',
            links: [
              'World News',
              'Politics',
              'Business',
              'Technology',
              'Science',
              'Health',
            ],
          },
          {
            title: 'Company',
            links: [
              'About Us',
              'Careers',
              'Code of Ethics',
              'Press Center',
              'Advertise',
            ],
          },
          {
            title: 'Support',
            links: [
              'Help Center',
              'Contact Us',
              'Subscription',
              'Accessibility',
              'Apps',
            ],
          },
          {
            title: 'Legal',
            links: [
              'Privacy Policy',
              'Terms of Service',
              'Cookie Policy',
              'Your Privacy Choices',
            ],
          },
        ]
    const social = props.social?.length
      ? props.social
      : [
          { label: 'Twitter' },
          { label: 'Facebook' },
          { label: 'LinkedIn' },
          { label: 'Instagram' },
        ]
    const legal = props.legal?.length
      ? props.legal
      : ['Privacy', 'Terms', 'Cookies', 'Sitemap']

    return (
      <SiteFooter className={props.className}>
        <FooterContent>
          <FooterGrid>
            <FooterBrand
              brand={props.brand ?? 'The Chronicle'}
              brandMark={<Masthead className="size-6 text-primary" />}
              brandClassName={'text-lg font-bold'}
            >
              <FooterTagline>
                {props.tagline ??
                  'Independent journalism since 1923. Committed to truth, accuracy, and the public interest.'}
              </FooterTagline>
              <FooterSocial>
                {social.map((s) => (
                  <FooterSocialLink key={s.label}>{s.label}</FooterSocialLink>
                ))}
              </FooterSocial>
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
            <FooterCopyright>
              {props.note ?? 'All rights reserved.'}
            </FooterCopyright>
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
