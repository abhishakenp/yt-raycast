import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

/**
 * ElectronicsStoreCategories — a tech-brutalist "Shop by Category" image-tile
 * grid for an electronics storefront. A mono index eyebrow + left-aligned
 * extrabold heading above a 2-to-4 column grid of clickable 4:3 tiles, each a
 * full-bleed image inside a squared border-2 hard-shadow plate under a bottom-up
 * foreground gradient, with the category name and a mono tabular product count
 * overlaid. Tiles route through section-kit route links. Use to surface
 * department navigation on electronics stores, gadget shops, consumer-tech
 * retailers, or audio/camera storefronts.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { CategoryGrid, CategoryCard } from '#/section-kit/CategoryGrid.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
export const ElectronicsStoreCategories = defineCapsule({
  name: 'ElectronicsStoreCategories',
  description:
    'Tech-brutalist Shop by Category image-tile grid for an electronics storefront: a mono index eyebrow + left-aligned extrabold heading above a 2-to-4 column grid of clickable 4:3 tiles, each a full-bleed image inside a squared border-2 hard-shadow plate under a bottom-up foreground gradient with the category name and a mono tabular product count overlaid. Tiles route through section-kit route links; imagery is alt-driven. Use to surface department navigation (Headphones, Smartwatches, Laptops, Cameras, Gaming, Smart Home, Accessories, etc.) on electronics stores, gadget shops, consumer-tech retailers, or audio/camera storefronts.',
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
          <div className="mb-10">
            <span className="mb-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
              <span className="tabular-nums">[ 04 ]</span>
              <span className="text-muted-foreground">Departments</span>
            </span>
            <SectionHeading
              align="left"
              title={heading}
              className="gap-0"
              titleClassName="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl"
            />
          </div>
          <CategoryGrid cols="2-lg-4" className="gap-4">
            {items.map((c, i) => (
              <CategoryCard asChild key={c.name}>
                <NavbarRouteLink
                  className={cn(
                    'group relative block aspect-[4/3] overflow-hidden rounded-none border-2 border-foreground bg-muted text-left shadow-[6px_6px_0_0] shadow-foreground transition-all duration-150 hover:-translate-y-1 hover:shadow-[9px_9px_0_0] active:translate-y-0 active:shadow-[3px_3px_0_0] motion-reduce:transform-none',
                    i % 2 === 1 && 'lg:translate-y-6',
                  )}
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
                    className="absolute inset-0 bg-gradient-to-t from-foreground/70 to-transparent"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute left-3 top-3 font-mono text-[10px] uppercase tracking-[0.16em] tabular-nums text-background/80"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="absolute inset-x-0 bottom-0 border-t-2 border-background/30 bg-foreground/20 p-3 backdrop-blur-sm">
                    <h3 className="font-bold tracking-tight text-background">
                      {c.name}
                    </h3>
                    <p className="font-mono text-[10px] uppercase tracking-[0.14em] tabular-nums text-background/80">
                      {c.count}
                    </p>
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
