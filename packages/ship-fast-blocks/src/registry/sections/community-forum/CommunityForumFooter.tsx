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
 * CommunityForumFooter — rich multi-column footer for a community-platform / discussion-forum
 * landing page. A top-bordered section with a brand column (logo + tagline + social icon buttons)
 * plus a grid of link columns, and a bottom bar with copyright and legal links. Every link and the
 * brand button route through section-kit route links. Use as the closing site footer for community platforms,
 * SaaS products, or online forum services.
 */
export const CommunityForumFooter = defineCapsule({
  name: 'CommunityForumFooter',
  description:
    'Rich multi-column footer for a community-platform / discussion-forum landing page: a top-bordered section with a brand column (logo + tagline + social icon buttons) plus a grid of link columns, and a bottom bar with copyright and legal links. Every link and the brand button route through section-kit route links. Use as the closing site footer for community platforms, SaaS products, or online forum services.',
  props: z.object({
    /** Brand / product name shown in the logo and copyright. */
    brand: z.string().optional(),
    /** Brand tagline under the logo. */
    tagline: z.string().optional(),
    /** Link columns: heading + link labels. */
    columns: z
      .array(
        z.object({
          heading: z.string(),
          links: z.array(z.string()),
        }),
      )
      .optional(),
    /** Copyright note appended after the brand + year. */
    note: z.string().optional(),
    /** Legal / utility link labels in the bottom bar. */
    legal: z.array(z.string()).optional(),
    /** Navigation target for the brand button. */
    homeTarget: z.string().optional(),
    /** Social link labels for the social icon buttons. */
    socials: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'Threadloom'
    const tagline =
      props.tagline ??
      'The modern platform for communities that value depth, organization, and meaningful connection.'
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            heading: 'Product',
            links: [
              'Features',
              'Pricing',
              'Integrations',
              'Changelog',
              'Roadmap',
            ],
          },
          {
            heading: 'Resources',
            links: [
              'Documentation',
              'API Reference',
              'Community',
              'Blog',
              'Guides',
            ],
          },
          {
            heading: 'Company',
            links: ['About', 'Careers', 'Contact', 'Privacy', 'Terms'],
          },
        ]
    const note = props.note ?? 'All rights reserved.'
    const legal = props.legal?.length
      ? props.legal
      : ['Status', 'Security', 'Sitemap']
    const socials = props.socials?.length
      ? props.socials
      : ['Twitter', 'GitHub', 'Instagram']
    const BrandMark = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 32 32"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <circle cx="8" cy="16" r="3" />
        <circle cx="16" cy="16" r="3" />
        <circle cx="24" cy="16" r="3" />
      </svg>
    )
    return (
      <SiteFooter className={props.className}>
        <FooterContent>
          <FooterGrid>
            <FooterBrand brand={brand} brandMark={<BrandMark />}>
              <FooterTagline>{tagline}</FooterTagline>
              <FooterSocial>
                {socials
                  .map((s) => ({ label: s }))
                  .map((s) => (
                    <FooterSocialLink key={s.label}>{s.label}</FooterSocialLink>
                  ))}
              </FooterSocial>
            </FooterBrand>
            {columns
              .map((c) => ({ title: c.heading, links: c.links }))
              .map((col) => (
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
            <FooterCopyright>{note}</FooterCopyright>
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
