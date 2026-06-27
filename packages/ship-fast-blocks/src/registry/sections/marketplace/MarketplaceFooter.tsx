import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { SiteFooter } from '#/section-kit/SiteFooter.tsx'

/**
 * MarketplaceFooter — rich, multi-column closing footer for a multi-vendor
 * marketplace / e-commerce site. Thin configuration over the shared
 * `SiteFooter` composite: a brand-square logo tile beside the marketplace name,
 * a marketplace-flavored tagline, a social row, and a responsive grid of link
 * columns (Shop, Sell, Company, Support); a bordered-top bottom bar carries an
 * auto-updating copyright line plus legal links. Every brand, social, and
 * column link routes through useNavigate. Use as the site-wide footer for
 * online marketplaces, multi-vendor or maker/artisan platforms, handmade/craft
 * stores, and retail aggregators. Renders fully with no props via baked-in
 * "MarketHub" defaults.
 */
export const MarketplaceFooter = defineCapsule({
  name: 'MarketplaceFooter',
  description:
    'Rich, multi-column closing footer for a multi-vendor marketplace / e-commerce site built on the shared SiteFooter composite: a brand-square logo tile beside the marketplace name, a marketplace-flavored tagline, a social row, and a responsive grid of link columns (Shop, Sell, Company, Support); a bordered-top bottom bar carries an auto-updating copyright line plus legal links. Every brand, social, and column link routes through useNavigate. Use as the site-wide footer for online marketplaces, multi-vendor or maker/artisan platforms, handmade/craft stores, and retail aggregators.',
  props: z.object({
    /** Brand / marketplace name shown as the wordmark. */
    brand: z.string().optional(),
    /** Short tagline below the wordmark. */
    tagline: z.string().optional(),
    /** Social channels rendered as a link row under the brand. */
    social: z
      .array(z.object({ label: z.string(), href: z.string().optional() }))
      .optional(),
    /** Link columns (Shop, Sell, Company, Support, …), each a title + labels. */
    columns: z
      .array(z.object({ title: z.string(), links: z.array(z.string()) }))
      .optional(),
    /** Legal links shown in the bottom bar. */
    legal: z.array(z.string()).optional(),
    /** Copyright note appended after the brand + year. */
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'MarketHub'
    const social = props.social?.length
      ? props.social
      : [{ label: 'Instagram' }, { label: 'Twitter' }, { label: 'Pinterest' }]
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Shop',
            links: ['Categories', 'Trending', 'New Arrivals', 'Gift Cards'],
          },
          {
            title: 'Sell',
            links: [
              'Start Selling',
              'Seller Handbook',
              'Pricing & Fees',
              'Seller Stories',
            ],
          },
          {
            title: 'Company',
            links: ['About', 'Careers', 'Press', 'Blog'],
          },
          {
            title: 'Support',
            links: ['Help Center', 'Buyer Protection', 'Shipping', 'Contact'],
          },
        ]
    const legal = props.legal?.length
      ? props.legal
      : ['Privacy', 'Terms', 'Cookies']

    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          'grid place-items-center rounded-lg bg-primary font-bold text-primary-foreground',
          className,
        )}
        aria-hidden="true"
      >
        {brand.charAt(0).toUpperCase()}
      </span>
    )

    return (
      <SiteFooter
        brand={brand}
        brandMark={<LogoMark className="size-8 text-sm" />}
        tagline={
          props.tagline ??
          'The marketplace where independent sellers and curious buyers meet — millions of unique products, one trusted checkout.'
        }
        social={social}
        columns={columns}
        legal={legal}
        note={props.note ?? 'All rights reserved.'}
        className={props.className}
      />
    )
  },
})
