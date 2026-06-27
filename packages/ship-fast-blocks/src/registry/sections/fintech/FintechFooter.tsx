import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { SiteFooter } from '#/section-kit/SiteFooter.tsx'

/**
 * FintechFooter — multi-column site footer for a fintech / neobank landing
 * page. A thin configuration over the shared SiteFooter composite: an inline
 * shield brand mark + wordmark, a tagline, Product / Company / Resources /
 * Legal link columns, a social row, and a compliance note in the bottom bar.
 * Every link routes through useNavigate. Use as the page footer for banking
 * apps, wallets, payments, or lending products. Renders fully with no props via
 * baked-in "Vault" defaults.
 */
const ShieldMark = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
)

export const FintechFooter = defineCapsule({
  name: 'FintechFooter',
  description:
    'Multi-column fintech / neobank site footer built on the shared SiteFooter composite: an inline shield brand mark + wordmark, a tagline, Product / Company / Resources / Legal link columns, a social row, and a compliance note in the bottom bar. Every link routes through useNavigate. Use as the page footer for banking apps, wallets, payments, or lending products.',
  props: z.object({
    /** Brand / product name. */
    brand: z.string().optional(),
    /** Tagline beneath the brand. */
    tagline: z.string().optional(),
    /** Footer link columns. */
    columns: z
      .array(z.object({ title: z.string(), links: z.array(z.string()) }))
      .optional(),
    /** Social links. */
    social: z
      .array(z.object({ label: z.string(), href: z.string().optional() }))
      .optional(),
    /** Legal link labels in the bottom bar. */
    legal: z.array(z.string()).optional(),
    /** Compliance note appended to the copyright line. */
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'Vault'
    const tagline =
      props.tagline ??
      'Banking that puts you first. Send, save, and spend with confidence.'
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Product',
            links: ['Features', 'Security', 'Pricing', 'Cards', 'Savings'],
          },
          {
            title: 'Company',
            links: ['About', 'Careers', 'Press', 'Blog'],
          },
          {
            title: 'Resources',
            links: ['Help Center', 'FAQ', 'Community', 'API Docs'],
          },
          {
            title: 'Legal',
            links: ['Privacy', 'Terms', 'Compliance', 'Licenses'],
          },
        ]
    const social = props.social?.length
      ? props.social
      : [{ label: 'Twitter' }, { label: 'LinkedIn' }, { label: 'Instagram' }]
    const legal = props.legal?.length
      ? props.legal
      : ['Privacy Policy', 'Terms of Service', 'Cookie Settings']
    const note =
      props.note ?? 'FDIC insured. Member-backed deposits up to $250,000.'

    return (
      <SiteFooter
        brand={brand}
        brandMark={<ShieldMark className="size-7 text-primary" />}
        tagline={tagline}
        columns={columns}
        social={social}
        legal={legal}
        note={note}
        className={props.className}
      />
    )
  },
})
