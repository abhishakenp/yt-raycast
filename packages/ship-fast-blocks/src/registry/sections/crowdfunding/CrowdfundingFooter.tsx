import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { Container } from '#/section-kit/Container.tsx'
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
  FooterLegal,
} from '#/section-kit/SiteFooter.tsx'
/**
 * CrowdfundingFooter — a 4-column closing footer for a crowdfunding / campaign
 * landing page. A bg-foreground footer with a decorative leaf/sparkle brand
 * mark + campaign name and a tagline in the first cell, multiple link columns,
 * a "Connect" cell of first-letter social icon buttons, and a bottom row with a
 * copyright note and legal links. All buttons route through section-kit route links. Use as
 * the site footer for a Kickstarter/Indiegogo-style raise, pre-order, product
 * launch, fundraiser, or maker/hardware campaign.
 */
export const CrowdfundingFooter = defineCapsule({
  name: 'CrowdfundingFooter',
  description:
    "A 4-column closing footer for a crowdfunding / campaign landing page: a bg-foreground footer with a decorative leaf/sparkle brand mark + campaign name and a tagline in the first cell, multiple link columns, a 'Connect' cell of first-letter social icon buttons, and a bottom row with a copyright note and legal links. All buttons route through section-kit route links. Use as the site footer for a Kickstarter/Indiegogo-style raise, pre-order, product launch, fundraiser, or maker/hardware campaign.",
  props: z.object({
    /** Brand / campaign name shown beside the logo mark. */
    brand: z.string().optional(),
    /** Tagline paragraph under the brand. */
    tagline: z.string().optional(),
    /** Multi-column footer link groups. */
    columns: z
      .array(z.object({ heading: z.string(), links: z.array(z.string()) }))
      .optional(),
    /** Heading above the social icon buttons. */
    connectHeading: z.string().optional(),
    /** Social network names for first-letter icon buttons. */
    socials: z.array(z.string()).optional(),
    /** Copyright / note text line. */
    note: z.string().optional(),
    /** Legal link labels in the bottom row. */
    legal: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'EcoBrush'
    const footerTagline =
      props.tagline ??
      'The first electric toothbrush designed to return to the earth. Sustainable oral care without compromise.'
    const footerColumns = props.columns?.length
      ? props.columns
      : [
          {
            heading: 'Campaign',
            links: ['Our Story', 'Features', 'Rewards', 'FAQ'],
          },
          {
            heading: 'Company',
            links: [
              'About Us',
              'Sustainability Report',
              'Press Kit',
              'Contact',
            ],
          },
        ]
    const footerSocials = props.socials?.length
      ? props.socials
      : ['Instagram', 'Twitter', 'YouTube']
    const footerNote = props.note ?? '© 2026 EcoBrush Inc. All rights reserved.'
    const footerLegal = props.legal?.length
      ? props.legal
      : ['Privacy Policy', 'Terms of Service', 'Cookie Policy']
    return (
      <SiteFooter className={props.className}>
        <Container className="py-12">
          <FooterGrid>
            <FooterBrand brand={brand}>
              <FooterTagline>{footerTagline}</FooterTagline>
              <FooterSocial>
                {footerSocials
                  .map((s) => ({ label: s }))
                  .map((s) => (
                    <FooterSocialLink key={s.label}>{s.label}</FooterSocialLink>
                  ))}
              </FooterSocial>
            </FooterBrand>
            {footerColumns
              .map((c) => ({
                title: c.heading,
                links: c.links,
              }))
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
            <FooterCopyright>{footerNote}</FooterCopyright>
            <FooterLegal>
              {footerLegal.map((l) => (
                <FooterLink key={l}>{l}</FooterLink>
              ))}
            </FooterLegal>
          </FooterBottom>
        </Container>
      </SiteFooter>
    )
  },
})
