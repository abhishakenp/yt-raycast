import { defineCapsule } from '#/capsules/openui.ts'
import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import type { ReactNode } from 'react'
import { z } from 'zod/v4'

import {
  FeatureGrid,
  FeatureCard,
  FeatureIcon,
  FeatureTitle,
  FeatureDescription,
} from '#/section-kit/FeatureGrid.tsx'

/**
 * MarketplaceFeatures — "Browse by Category" grid for a multi-vendor
 * marketplace / e-commerce home page. Thin configuration over the shared
 * `FeatureGrid` composite: a centered heading block above a responsive 4-column
 * grid of category tiles, each with an inline line-icon tile, a category title,
 * and an item-count-flavored description (Electronics, Fashion, Home & Living,
 * Art & Collectibles, Health & Beauty, Sports & Outdoors, Books & Media, Crafts
 * & Supplies). Theme-token only. Use to surface top shopping categories on
 * online marketplaces, multi-vendor or maker/artisan platforms, handmade/craft
 * stores, and retail aggregators. Renders fully with no props via vibrant
 * baked-in defaults.
 */
export const MarketplaceFeatures = defineCapsule({
  name: 'MarketplaceFeatures',
  description:
    "'Browse by Category' grid for a multi-vendor marketplace / e-commerce home page built on the shared FeatureGrid composite: a centered heading block above a responsive 4-column grid of category tiles, each with an inline line-icon tile, a category title, and an item-count-flavored description (Electronics, Fashion, Home & Living, Art & Collectibles, Health & Beauty, Sports & Outdoors, Books & Media, Crafts & Supplies). Theme-token only. Use to surface top shopping categories on online marketplaces, multi-vendor or maker/artisan platforms, handmade/craft stores, and retail aggregators.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting line under the heading. */
    subheading: z.string().optional(),
    /** Category tiles — each a title + item-count-flavored description. */
    features: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    /** Grid column count (2, 3, or 4). */
    columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const Phone = (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-5"
        aria-hidden="true"
      >
        <rect x="7" y="2" width="10" height="20" rx="2" />
        <line x1="11" y1="18" x2="13" y2="18" />
      </svg>
    )
    const Shirt = (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-5"
        aria-hidden="true"
      >
        <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
      </svg>
    )
    const Home = (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-5"
        aria-hidden="true"
      >
        <path d="M3 9.5 12 3l9 6.5" />
        <path d="M5 10v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V10" />
        <path d="M9 21v-6h6v6" />
      </svg>
    )
    const Palette = (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-5"
        aria-hidden="true"
      >
        <circle cx="13.5" cy="6.5" r=".8" fill="currentColor" />
        <circle cx="17.5" cy="10.5" r=".8" fill="currentColor" />
        <circle cx="8.5" cy="7.5" r=".8" fill="currentColor" />
        <circle cx="6.5" cy="12.5" r=".8" fill="currentColor" />
        <path d="M12 2a10 10 0 0 0 0 20 2.5 2.5 0 0 0 2.5-2.5c0-.7-.3-1.3-.7-1.7-.4-.5-.6-1-.6-1.6a2.5 2.5 0 0 1 2.5-2.5H18a4 4 0 0 0 4-4 10 10 0 0 0-10-8z" />
      </svg>
    )
    const Heart = (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-5"
        aria-hidden="true"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    )
    const Activity = (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-5"
        aria-hidden="true"
      >
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    )
    const Book = (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-5"
        aria-hidden="true"
      >
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    )
    const Scissors = (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-5"
        aria-hidden="true"
      >
        <circle cx="6" cy="6" r="3" />
        <circle cx="6" cy="18" r="3" />
        <line x1="20" y1="4" x2="8.12" y2="15.88" />
        <line x1="14.47" y1="14.48" x2="20" y2="20" />
        <line x1="8.12" y1="8.12" x2="12" y2="12" />
      </svg>
    )

    const defaults: { title: string; description: string; icon: ReactNode }[] =
      [
        {
          title: 'Electronics',
          description: '12,847 items from gadgets to audio gear',
          icon: Phone,
        },
        {
          title: 'Fashion',
          description: '24,392 items across apparel and accessories',
          icon: Shirt,
        },
        {
          title: 'Home & Living',
          description: '8,156 items to furnish and decorate',
          icon: Home,
        },
        {
          title: 'Art & Collectibles',
          description: '5,203 one-of-a-kind original pieces',
          icon: Palette,
        },
        {
          title: 'Health & Beauty',
          description: '6,891 items for self-care and wellness',
          icon: Heart,
        },
        {
          title: 'Sports & Outdoors',
          description: '4,127 items for every adventure',
          icon: Activity,
        },
        {
          title: 'Books & Media',
          description: '9,564 reads, prints, and recordings',
          icon: Book,
        },
        {
          title: 'Crafts & Supplies',
          description: '3,742 materials for makers',
          icon: Scissors,
        },
      ]

    const features = props.features?.length
      ? props.features.map((f, i) => ({
          title: f.title,
          description: f.description,
          icon: defaults[i % defaults.length].icon,
        }))
      : defaults

    return (
      <section className={cn('bg-background py-20 lg:py-28', props.className)}>
        <Container>
          <FeatureGrid
            heading={props.heading ?? 'Browse by Category'}
            subheading={
              props.subheading ??
              'Explore a curated collection across major categories with over 50,000 unique products from verified sellers.'
            }
            columns={props.columns ?? 4}
          >
            {features.map((f) => {
              const __iv__ = f as {
                title: string
                description: string
                icon?: React.ReactNode
                points?: string[]
                cta?: string
                price?: string
                imageAlt?: string
              }
              return (
                <FeatureCard key={__iv__.title}>
                  {__iv__.icon && <FeatureIcon>{__iv__.icon}</FeatureIcon>}
                  <FeatureTitle>{__iv__.title}</FeatureTitle>
                  <FeatureDescription>{__iv__.description}</FeatureDescription>
                </FeatureCard>
              )
            })}
          </FeatureGrid>
        </Container>
      </section>
    )
  },
})
