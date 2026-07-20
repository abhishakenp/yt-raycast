import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { Container } from '#/section-kit/Container.tsx'
import { Watermark } from '#/section-kit/Decor.tsx'
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
 * CryptoFooter — Web3-terminal inverted multi-column footer for a crypto /
 * DeFi infrastructure landing page. A `bg-foreground` footer with an
 * asymmetric 5/7-feel grid: brand wordmark + description + square mono
 * social chips on the left, hairline-ruled link columns with mono uppercase
 * column titles on the right, then a hairline-topped bottom row with the
 * auto-updating copyright line and mono legal links. A giant ghost Ξ
 * watermark sits behind the grid. All buttons route through section-kit
 * route links. Use as the closing site footer for crypto protocols, chains,
 * bridges, DeFi platforms, or Web3 infrastructure sites.
 */
export const CryptoFooter = defineCapsule({
  name: 'CryptoFooter',
  description:
    'Web3-terminal inverted multi-column footer for a crypto / DeFi infrastructure landing page: bg-foreground footer with brand wordmark + description + square mono social chips, hairline-ruled link columns with mono uppercase titles, an auto-updating copyright line, and mono legal links, backed by a giant ghost Ξ watermark. All buttons route through section-kit route links. Use as the closing site footer for crypto protocols, chains, bridges, DeFi platforms, or Web3 infrastructure sites.',
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
      <SiteFooter
        className={`relative overflow-hidden border-t-0 bg-foreground text-background ${props.className ?? ''}`}
      >
        <Watermark className="-bottom-8 right-2 text-[8rem] text-background/[0.05] sm:text-[12rem]">
          Ξ
        </Watermark>
        <Container className="relative py-14 lg:py-16">
          <FooterGrid className="gap-12 md:grid-cols-12">
            <FooterBrand
              brand={brand}
              brandClassName="text-background"
              className="md:col-span-5"
            >
              <FooterTagline className="max-w-sm text-background/60">
                {description}
              </FooterTagline>
              <FooterSocial className="mt-6 gap-2">
                {socials
                  .map((s) => ({ label: s }))
                  .map((s) => (
                    <FooterSocialLink
                      key={s.label}
                      className="border border-background/20 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.15em] text-background/70 transition-colors hover:border-background/50 hover:text-background active:translate-y-px"
                    >
                      {s.label}
                    </FooterSocialLink>
                  ))}
              </FooterSocial>
            </FooterBrand>
            {columns
              .map((c) => ({ title: c.heading, links: c.links }))
              .map((col, ci) => (
                <FooterColumn
                  key={col.title}
                  className={
                    'border-l border-background/15 pl-6 md:col-span-2' +
                    (ci === 0 ? ' md:col-start-6' : '')
                  }
                >
                  <FooterColumnTitle className="font-mono text-[11px] uppercase tracking-[0.2em] text-background/50">
                    {col.title}
                  </FooterColumnTitle>
                  <FooterColumnList className="mt-4 space-y-2.5">
                    {col.links.map((link) => (
                      <FooterLink
                        key={link}
                        className="block text-left text-background/70 hover:text-background"
                      >
                        {link}
                      </FooterLink>
                    ))}
                  </FooterColumnList>
                </FooterColumn>
              ))}
          </FooterGrid>
          <FooterBottom className="mt-14 border-background/15">
            <FooterCopyright className="font-mono text-[11px] uppercase tracking-[0.15em] text-background/50">
              {note}
            </FooterCopyright>
            <FooterLegal>
              {legal.map((l) => (
                <FooterLink
                  key={l}
                  className="font-mono text-[11px] uppercase tracking-[0.15em] text-background/50 hover:text-background"
                >
                  {l}
                </FooterLink>
              ))}
            </FooterLegal>
          </FooterBottom>
        </Container>
      </SiteFooter>
    )
  },
})
