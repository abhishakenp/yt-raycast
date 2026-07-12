import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { SiteFooter } from '#/section-kit/SiteFooter.tsx'

/**
 * SaasFooter — a multi-column site footer for a SaaS / AI-product landing page.
 * Thin configuration over the shared `SiteFooter` composite: a gradient
 * brand-initial logo tile + wordmark, a tagline, a social row, and a responsive
 * grid of link columns (Product / Company / Resources / Legal); below, a
 * bordered-top bottom bar with an auto-updating copyright line. The brand,
 * every column link, and each social link route through useNavigate. Use as the
 * closing footer for SaaS, API, or B2B product sites. Renders fully with no
 * props via baked-in "Chronos AI" defaults.
 */
function BrandTile({ brand }: { brand: string }) {
  return (
    <span
      className="grid size-9 place-items-center rounded-lg bg-gradient-to-br from-primary to-accent text-base font-black text-primary-foreground"
      aria-hidden="true"
    >
      {brand.charAt(0).toUpperCase()}
    </span>
  )
}

export const SaasFooter = defineCapsule({
  name: 'SaasFooter',
  description:
    'Multi-column site footer for a SaaS / AI-product landing page built on the shared SiteFooter composite: a gradient brand-initial logo tile + wordmark, a tagline, a social row, and a responsive grid of link columns (Product / Company / Resources / Legal); below, a bordered-top bottom bar with an auto-updating copyright line. The brand, every column link, and each social link route through useNavigate. Use as the closing footer for SaaS, API, or B2B product sites.',
  props: z.object({
    /** Brand / product name shown beside the logo tile. */
    brand: z.string().optional(),
    /** Short tagline under the wordmark. */
    tagline: z.string().optional(),
    /** Link columns: each a title plus a list of link labels. */
    columns: z
      .array(
        z.object({
          title: z.string(),
          links: z.array(z.string()),
        }),
      )
      .optional(),
    /** Social channels rendered as a link row under the brand. */
    social: z
      .array(z.object({ label: z.string(), href: z.string().optional() }))
      .optional(),
    /** Copyright note appended after the brand + year. */
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'Chronos AI'
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Product',
            links: ['Features', 'Integrations', 'Pricing', 'Changelog'],
          },
          {
            title: 'Company',
            links: ['About', 'Careers', 'Blog', 'Contact'],
          },
          {
            title: 'Resources',
            links: ['Documentation', 'API Reference', 'Community', 'Support'],
          },
          {
            title: 'Legal',
            links: ['Privacy', 'Terms', 'Security', 'Cookies'],
          },
        ]
    const social = props.social?.length
      ? props.social
      : [{ label: 'Twitter' }, { label: 'LinkedIn' }, { label: 'GitHub' }]

    return (
      <SiteFooter
        brand={brand}
        brandMark={<BrandTile brand={brand} />}
        brandClassName="text-lg font-bold"
        tagline={
          props.tagline ??
          'AI-powered scheduling that gives you back your time. Smart, secure, and built for teams that move fast.'
        }
        columns={columns}
        social={social}
        note={props.note ?? 'All rights reserved.'}
        className={props.className}
      />
    )
  },
})
