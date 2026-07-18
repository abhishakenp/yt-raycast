import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { useNavigate } from '#/lib/use-navigate.tsx'

import { SiteFooter } from '#/section-kit/SiteFooter.tsx'

/**
 * CybersecurityFooter — dark, full-bleed 5-column mega-footer. A brand-surface
 * footer: a wide brand column (shield logo + name, tagline, and social links)
 * beside several link-list columns, then a bordered-top bottom row with an
 * auto-updating copyright line and a set of legal links. The brand button,
 * every column link, social link and legal link route through useNavigate. Use
 * as the closing site footer for cybersecurity vendors, SOC/MDR providers, or
 * any enterprise B2B security SaaS. Renders fully with no props via baked-in
 * "SentinelGuard" defaults.
 */
export const CybersecurityFooter = defineCapsule({
  name: 'CybersecurityFooter',
  description:
    'Dark full-bleed 5-column mega-footer on the brand surface: a wide brand column (shield logo + name, tagline, social links) beside several link-list columns, then a bordered-top bottom row with an auto-updating copyright line and legal links. The brand button, column links, social links and legal links route through useNavigate. Use as the closing site footer for cybersecurity vendors, SOC/MDR providers, or any enterprise B2B security SaaS.',
  props: z.object({
    /** Brand / product name shown beside the shield logo. */
    brand: z.string().optional(),
    /** Short tagline under the brand. */
    tagline: z.string().optional(),
    /** Copyright note appended after the brand + year. */
    note: z.string().optional(),
    /** Link-list columns. */
    columns: z
      .array(z.object({ title: z.string(), links: z.array(z.string()) }))
      .optional(),
    /** Bottom-row legal link labels. */
    legal: z.array(z.string()).optional(),
    /** Social link labels in the brand column. */
    social: z.array(z.string()).optional(),
    /** Navigation target fired by the brand button. */
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'SentinelGuard'
    const tagline =
      props.tagline ??
      'AI-powered cybersecurity platform protecting enterprises worldwide since 2018.'
    const note = props.note ?? 'All rights reserved.'
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Platform',
            links: [
              'Threat Detection',
              'Cloud Security',
              'Zero Trust',
              'Compliance',
              'API Security',
            ],
          },
          {
            title: 'Solutions',
            links: [
              'Enterprise',
              'Financial Services',
              'Healthcare',
              'Retail',
              'Government',
            ],
          },
          {
            title: 'Company',
            links: ['About Us', 'Careers', 'Press', 'Blog', 'Contact'],
          },
          {
            title: 'Resources',
            links: [
              'Documentation',
              'API Reference',
              'System Status',
              'Security',
              'Privacy Policy',
            ],
          },
        ]
    const legal = props.legal?.length
      ? props.legal
      : ['Terms of Service', 'Privacy Policy', 'Cookie Settings']
    const social = props.social?.length
      ? props.social
      : ['Twitter', 'LinkedIn', 'GitHub']
    const homeTarget = props.homeTarget ?? 'Platform'

    const ShieldMark = ({ className }: { className?: string }) => (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    )

    void go
    void homeTarget
    void ShieldMark
    return (
      <SiteFooter
        brand={brand}
        tagline={tagline}
        columns={columns}
        social={social.map((s) => ({ label: s }))}
        legal={legal}
        note={note}
        className={props.className}
      />
    )
  },
})
