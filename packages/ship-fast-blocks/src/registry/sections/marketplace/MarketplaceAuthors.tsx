import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { ResponsiveGrid } from '#/section-kit/ResponsiveGrid.tsx'
import { PersonCard } from '#/section-kit/PersonCard.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * MarketplaceAuthors — editorial "Featured Sellers" index (the Authors role for
 * a marketplace: the vendors behind the storefronts). An asymmetric header
 * pairs a left extrabold heading + description with a mono "View all sellers"
 * link on the right, above a staggered 1/2/4-column grid of sharp seller plates.
 * Each plate is a hairline-framed cover photo on an offset frame — a square
 * star-rating chip and an optional square eco-verified tag overlaid — followed
 * by a hairline ledger row pairing an index numeral and circular seller avatar
 * with the store name, location, and a mono product-count + follower-count meta
 * line. Alternating plates step down on a vertical rhythm. Cards and the
 * view-all link route through section-kit route links; cover and avatar use the
 * alt-driven Image component. Use to spotlight top vendors / featured authors on
 * online marketplaces, multi-vendor or maker/artisan platforms, and seller
 * communities.
 */
export const MarketplaceAuthors = defineCapsule({
  name: 'MarketplaceAuthors',
  description:
    "Editorial commerce-index 'Featured Sellers' section serving the Authors role for a marketplace (the vendors behind the storefronts): an asymmetric header pairs a left extrabold heading + description with a mono 'View all sellers' link on the right, above a staggered 1/2/4-column grid of sharp seller plates — each a hairline-framed cover photo on an offset frame with a square star-rating chip and an optional square eco-verified tag overlaid, then a hairline ledger row pairing an index numeral and circular seller avatar with the store name, location, and a mono product-count + follower-count meta line. Alternating plates step down on a vertical rhythm. Cards and the view-all link route through section-kit route links; cover and avatar use the alt-driven Image component. Use to spotlight top vendors / featured authors on online marketplaces, multi-vendor or maker/artisan platforms, and seller communities.",
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    viewAll: z.string().optional(),
    items: z
      .array(
        z.object({
          name: z.string(),
          location: z.string(),
          rating: z.string(),
          products: z.string(),
          followers: z.string(),
          coverAlt: z.string(),
          avatarAlt: z.string(),
          eco: z.boolean().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const sellersHeading = props.heading ?? 'Featured Sellers'
    const sellersDesc =
      props.description ??
      'Discover our most trusted and top-rated sellers, each verified and committed to quality'
    const sellersViewAll = props.viewAll ?? 'View all 12,483 sellers'
    const sellerItems = props.items?.length
      ? props.items
      : [
          {
            name: 'Artisan Home Co.',
            location: 'Portland, Oregon',
            rating: '4.9',
            products: '847 products',
            followers: '12.4k followers',
            coverAlt:
              'Handcrafted wooden kitchen utensils and cutting boards on marble countertop',
            avatarAlt: 'Portrait of male artisan woodworker in his workshop',
          },
          {
            name: 'Tech Forward',
            location: 'Austin, Texas',
            rating: '4.8',
            products: '1,234 products',
            followers: '28.9k followers',
            coverAlt:
              'Modern electronic gadgets including smartphone, earbuds, and smartwatch on dark surface',
            avatarAlt:
              'Professional headshot of female tech entrepreneur with short hair',
          },
          {
            name: 'Green Earth Organics',
            location: 'Sonoma, California',
            rating: '5.0',
            products: '342 products',
            followers: '8.2k followers',
            coverAlt:
              'Organic fresh produce and vegetables in woven baskets at farmers market',
            avatarAlt:
              'Portrait of male organic farmer in field wearing work shirt',
            eco: true,
          },
          {
            name: 'Vintage Revival',
            location: 'Brooklyn, New York',
            rating: '4.9',
            products: '567 products',
            followers: '15.6k followers',
            coverAlt:
              'Collection of vintage leather bags and accessories on rustic wooden shelf',
            avatarAlt:
              'Portrait of female vintage curator with styled hair and statement earrings',
          },
        ]

    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        className={className ?? 'size-4'}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    )

    const Star = ({ className }: { className?: string }) => (
      <svg
        className={className}
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    const Check = ({ className }: { className?: string }) => (
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
        <path d="M5 13l4 4L19 7" />
      </svg>
    )

    const BoxIcon = ({ className }: { className?: string }) => (
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
        <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    )

    const UsersIcon = ({ className }: { className?: string }) => (
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
        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    )

    return (
      <section
        className={cn('bg-background py-20 lg:py-28', props.className)}
        aria-labelledby="sellers-heading"
      >
        <Container>
          <div className="mb-14 flex flex-col gap-6 border-b border-border pb-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-5 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                <span aria-hidden="true" className="size-1.5 bg-primary" />
                Sellers
                <span aria-hidden="true" className="tabular-nums">
                  · {String(sellerItems.length).padStart(2, '0')}
                </span>
              </div>
              <SectionHeading
                align="left"
                title={sellersHeading}
                subtitle={sellersDesc}
                className="gap-3"
                titleId="sellers-heading"
                titleClassName="text-3xl font-extrabold tracking-tighter text-foreground sm:text-4xl lg:text-5xl"
                subtitleClassName="max-w-xl text-base leading-relaxed text-muted-foreground"
              />
            </div>
            <NavbarRouteLink
              className="group inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-foreground transition-colors hover:text-muted-foreground"
              href={sellersViewAll}
            >
              <span>{sellersViewAll}</span>
              <ArrowRight className="size-4 transition-transform duration-150 group-hover:translate-x-1" />
            </NavbarRouteLink>
          </div>

          <ResponsiveGrid cols="1-2-4" className="items-start gap-x-6 gap-y-12">
            {sellerItems.map((seller, i) => (
              <PersonCard asChild variant="bare" key={seller.name}>
                <NavbarRouteLink
                  className={cn(
                    'group block w-full text-left',
                    i % 2 === 1 && 'sm:translate-y-8 lg:translate-y-0',
                    i % 4 === 1 && 'lg:translate-y-10',
                    i % 4 === 3 && 'lg:translate-y-10',
                  )}
                  href={seller.name}
                >
                  <div className="relative mr-2.5">
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 translate-x-2.5 translate-y-2.5 border border-border"
                    />
                    <div className="relative aspect-[4/3] overflow-hidden rounded-none border border-foreground/15 bg-muted">
                      <Image
                        alt={seller.coverAlt}
                        w={600}
                        h={450}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute right-0 top-0 flex items-center gap-1 border-b border-l border-foreground bg-background px-2.5 py-1 font-mono text-[10px] font-semibold tabular-nums text-foreground">
                        <Star className="size-3 text-primary" />
                        {seller.rating}
                      </div>
                      {seller.eco ? (
                        <div className="absolute left-0 top-0 flex items-center gap-1 border-b border-r border-foreground bg-primary/10 px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-primary">
                          <Check className="size-3" />
                          Eco
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <div className="mt-5 flex items-start gap-3 border-b border-border pb-4">
                    <span
                      aria-hidden="true"
                      className="mt-0.5 shrink-0 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground/60 tabular-nums"
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="size-9 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
                      <Image
                        alt={seller.avatarAlt}
                        w={100}
                        h={100}
                        className="size-full object-cover"
                      />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-semibold tracking-tight text-foreground">
                        {seller.name}
                      </h3>
                      <p className="truncate text-xs text-muted-foreground">
                        {seller.location}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground tabular-nums">
                    <span className="flex items-center gap-1.5">
                      <BoxIcon className="size-3" />
                      {seller.products}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <UsersIcon className="size-3" />
                      {seller.followers}
                    </span>
                  </div>
                </NavbarRouteLink>
              </PersonCard>
            ))}
          </ResponsiveGrid>
        </Container>
      </section>
    )
  },
})
