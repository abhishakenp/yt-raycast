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
 * CryptoFooter — rich multi-column footer for a crypto / DeFi infrastructure
 * landing page. A `bg-foreground` footer with a brand bolt icon + protocol
 * name, a description, social-link buttons with first-letter avatars, a
 * multi-column link grid, an auto-updating copyright line, and legal links.
 * All buttons route through section-kit route links. Use as the closing site footer for
 * crypto protocols, chains, bridges, DeFi platforms, or Web3 infrastructure
 * sites.
 */
export const CryptoFooter = defineCapsule({
  name: 'CryptoFooter',
  description:
    'Rich multi-column footer for a crypto / DeFi infrastructure landing page: bg-foreground footer with brand bolt icon + protocol name, description, social-link buttons with first-letter avatars, a multi-column link grid, auto-updating copyright line, and legal links. All buttons route through section-kit route links. Use as the closing site footer for crypto protocols, chains, bridges, DeFi platforms, or Web3 infrastructure sites.',
  props: z.object({
    /** Brand / protocol name shown beside the logo icon. */
    brand: z.string().optional(),
    /** Description paragraph under the brand. */
    description: z.string().optional(),
    /** Navigation target for the brand button. */
    homeTarget: z.string().optional(),
    /** Multi-column footer link groups. */
    columns: z
      .array(
        z.object({
          heading: z.string(),
          links: z.array(z.string()),
        }),
      )
      .optional(),
    /** Social network names for first-letter icon buttons. */
    socials: z.array(z.string()).optional(),
    /** Copyright / note text line. */
    note: z.string().optional(),
    /** Legal link labels in the bottom row. */
    legal: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'NexusChain'
    const description =
      props.description ??
      'Enterprise-grade infrastructure for DeFi protocols, cross-chain bridges, and institutional tokenization.'
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            heading: 'Product',
            links: ['Infrastructure', 'Bridge', 'Analytics', 'SDK', 'Pricing'],
          },
          {
            heading: 'Developers',
            links: [
              'Documentation',
              'API Reference',
              'GitHub',
              'Status',
              'Bug Bounty',
            ],
          },
          {
            heading: 'Company',
            links: ['About', 'Careers', 'Blog', 'Press', 'Contact'],
          },
        ]
    const socials = props.socials?.length
      ? props.socials
      : ['Twitter', 'GitHub', 'LinkedIn', 'Discord']
    const note =
      props.note ??
      `© ${new Date().getFullYear()} ${brand} Foundation. All rights reserved.`
    const legal = props.legal?.length
      ? props.legal
      : ['Privacy Policy', 'Terms of Service', 'Cookie Policy']

    return (
      <SiteFooter className={props.className}>
        <FooterContent>
          <FooterGrid>
            <FooterBrand brand={brand}>
              <FooterTagline>{description}</FooterTagline>
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
