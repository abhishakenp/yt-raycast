import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

/**
 * ElectronicsStoreCategories — a "Shop by Category" image-tile grid for an
 * electronics storefront. A left-aligned heading above a 2-to-4 column grid of
 * clickable 4:3 tiles, each a full-bleed image under a bottom-up foreground
 * gradient with the category name and product count overlaid. Tiles route
 * through section-kit route links. Use to surface department navigation on electronics
 * stores, gadget shops, consumer-tech retailers, or audio/camera storefronts.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { CategoryGrid, CategoryCard } from '#/section-kit/CategoryGrid.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

export const ElectronicsStoreCategories = defineCapsule({
  name: 'ElectronicsStoreCategories',
  description:
    'Shop by Category image-tile grid for an electronics storefront: a left-aligned heading above a 2-to-4 column grid of clickable 4:3 tiles, each a full-bleed image under a bottom-up foreground gradient with the category name and product count overlaid. Tiles route through section-kit route links; imagery is alt-driven. Use to surface department navigation (Headphones, Smartwatches, Laptops, Cameras, Gaming, Smart Home, Accessories, etc.) on electronics stores, gadget shops, consumer-tech retailers, or audio/camera storefronts.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Category tiles. */
    items: z
      .array(
        z.object({
          name: z.string(),
          count: z.string(),
          imageAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Shop by Category'
    const items = props.items?.length
      ? props.items
      : [
          {
            name: 'Headphones',
            count: '124 products',
            imageAlt:
              'Collection of premium over-ear headphones in various colors',
          },
          {
            name: 'Smartwatches',
            count: '86 products',
            imageAlt:
              'Collection of modern smartwatches with various watch faces and bands',
          },
          {
            name: 'Laptops',
            count: '52 products',
            imageAlt: 'Collection of laptop computers on clean workspace setup',
          },
          {
            name: 'Cameras',
            count: '38 products',
            imageAlt:
              'Collection of mirrorless cameras and photography equipment',
          },
          {
            name: 'Earbuds',
            count: '96 products',
            imageAlt: 'Collection of wireless earbuds and charging cases',
          },
          {
            name: 'Gaming',
            count: '74 products',
            imageAlt:
              'Gaming accessories including controllers and mechanical keyboards',
          },
          {
            name: 'Smart Home',
            count: '63 products',
            imageAlt:
              'Smart home devices including speakers and voice assistants',
          },
          {
            name: 'Accessories',
            count: '215 products',
            imageAlt:
              'Cables, chargers, and tech accessories on white background',
          },
        ]
    return (
      <section className={cn('py-16 lg:py-24', props.className)}>
        <Container>
          <SectionHeading
            align="left"
            title={heading}
            className="mb-8 gap-0"
            titleClassName="text-2xl font-semibold text-foreground"
          />
          <CategoryGrid cols="2-lg-4" className="gap-4">
            {items.map((c) => (
              <CategoryCard asChild key={c.name}>
                <NavbarRouteLink
                  className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-muted text-left"
                  href={c.name}
                >
                  <Image
                    alt={c.imageAlt}
                    w={400}
                    h={300}
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent"
                  />
                  <div className="absolute bottom-4 left-4 text-background">
                    <h3 className="font-semibold">{c.name}</h3>
                    <p className="text-sm text-background/80">{c.count}</p>
                  </div>
                </NavbarRouteLink>
              </CategoryCard>
            ))}
          </CategoryGrid>
        </Container>
      </section>
    )
  },
})
