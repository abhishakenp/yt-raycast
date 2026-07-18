import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { useNavigate } from '#/lib/use-navigate.tsx'
import { SiteFooter } from '#/section-kit/SiteFooter.tsx'

/**
 * CryptoFooter — rich multi-column footer for a crypto / DeFi infrastructure
 * landing page. A `bg-foreground` footer with a brand bolt icon + protocol
 * name, a description, social-link buttons with first-letter avatars, a
 * multi-column link grid, an auto-updating copyright line, and legal links.
 * All buttons route through useNavigate. Use as the closing site footer for
 * crypto protocols, chains, bridges, DeFi platforms, or Web3 infrastructure
 * sites.
 */
export const CryptoFooter = defineCapsule({
  name: 'CryptoFooter',
  description:
    'Rich multi-column footer for a crypto / DeFi infrastructure landing page: bg-foreground footer with brand bolt icon + protocol name, description, social-link buttons with first-letter avatars, a multi-column link grid, auto-updating copyright line, and legal links. All buttons route through useNavigate. Use as the closing site footer for crypto protocols, chains, bridges, DeFi platforms, or Web3 infrastructure sites.',
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
    const go = useNavigate()
    const brand = props.brand ?? 'NexusChain'
    const description =
      props.description ??
      'Enterprise-grade infrastructure for DeFi protocols, cross-chain bridges, and institutional tokenization.'
    const homeTarget = props.homeTarget ?? 'Features'
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

    const BoltIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
    )

    void go
    void homeTarget
    void BoltIcon
    return (
      <SiteFooter
        brand={brand}
        tagline={description}
        columns={columns.map((c) => ({ title: c.heading, links: c.links }))}
        social={socials.map((s) => ({ label: s }))}
        legal={legal}
        note={note}
        className={props.className}
      />
    )
  },
})
