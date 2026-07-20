import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

/**
 * FashionStoreCollections — Shop-by-Category collection grid for a luxury
 * fashion store. A mono kicker + serif heading set in an asymmetric header row
 * beside a mono category count, above a responsive 1-to-4 column grid of tall
 * portrait category plates staggered in an editorial broken rhythm — each a
 * sharp full-bleed image with a darkening scrim that deepens on hover, a mono
 * index numeral, and an overlaid serif category name + mono piece count. Every
 * plate routes through section-kit route links and imagery uses the alt-driven
 * Image component. Use to let shoppers browse by department for clothing
 * brands, boutiques, or apparel and accessories shops.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { CollectionGrid } from '#/section-kit/CollectionGrid.tsx'
import { Watermark } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
export const FashionStoreCollections = defineCapsule({
  name: 'FashionStoreCollections',
  description:
    'Shop-by-Category collection grid for a luxury fashion store: a mono kicker + serif heading set in an asymmetric header row beside a mono category count, above a responsive 1-to-4 column grid of tall portrait category plates staggered in an editorial broken rhythm — each a sharp full-bleed image with a darkening scrim that deepens on hover, a mono index numeral, and an overlaid serif category name + mono piece count. Every plate routes through section-kit route links and imagery uses the alt-driven Image component. Use to let shoppers browse by department or collection for clothing brands, boutiques, or apparel and accessories shops.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
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
    const collectionsEyebrow = props.eyebrow ?? 'Shop By Category'
    const collectionsHeading = props.heading ?? 'The Collections'
    const collectionItems = props.items?.length
      ? props.items
      : [
          {
            name: 'Outerwear',
            count: '42 pieces',
            imageAlt:
              "Collection of women's outerwear featuring tailored coats and jackets",
          },
          {
            name: 'Knitwear',
            count: '28 pieces',
            imageAlt: 'Collection of premium knitwear sweaters and cardigans',
          },
          {
            name: 'Trousers',
            count: '35 pieces',
            imageAlt: 'Collection of tailored trousers and bottoms',
          },
          {
            name: 'Accessories',
            count: '18 pieces',
            imageAlt:
              'Collection of minimalist accessories including belts and bags',
          },
        ]
    const eyebrowCls =
      'font-mono text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground'
    return (
      <section
        aria-label="Collection categories"
        className={cn(
          'relative overflow-hidden pt-28 pb-20 lg:pt-32 lg:pb-28',
          props.className,
        )}
      >
        <Watermark className="-right-4 top-10 text-[22vw] uppercase">
          Mode
        </Watermark>
        <Container className="relative">
          <div className="mb-16 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              align="left"
              eyebrow={collectionsEyebrow}
              title={collectionsHeading}
              className="max-w-xl gap-0"
              eyebrowClassName={cn(eyebrowCls, 'mb-3')}
              titleClassName="font-serif text-4xl font-normal tracking-tight sm:text-5xl lg:text-6xl"
            />
            <p
              aria-hidden="true"
              className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground tabular-nums"
            >
              {String(collectionItems.length).padStart(2, '0')} Collections
            </p>
          </div>

          <CollectionGrid className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {collectionItems.map((c, i) => (
              <NavbarRouteLink
                key={c.name}
                className="group block text-left sm:even:translate-y-8 lg:even:translate-y-12"
                href={c.name}
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                  <Image
                    alt={c.imageAlt}
                    w={800}
                    h={1000}
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-foreground/20 transition-colors group-hover:bg-foreground/35" />
                  <span
                    aria-hidden="true"
                    className="absolute left-4 top-4 font-mono text-[11px] uppercase tracking-[0.2em] text-background/80 tabular-nums"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="absolute inset-x-6 bottom-6 text-background">
                    <p className="font-serif text-2xl leading-tight">
                      {c.name}
                    </p>
                    <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-background/80">
                      {c.count}
                    </p>
                  </div>
                </div>
              </NavbarRouteLink>
            ))}
          </CollectionGrid>
        </Container>
      </section>
    )
  },
})
