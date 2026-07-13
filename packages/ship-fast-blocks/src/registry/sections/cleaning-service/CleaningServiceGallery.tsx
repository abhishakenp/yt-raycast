import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'
import { ImageTile } from '#/section-kit/ImageTile.tsx'
import { BentoTileCaption } from '#/section-kit/BentoGrid.tsx'

/**
 * CleaningServiceGallery — a before/after transformations image gallery for a home-cleaning / maid-service landing page. A centered heading + lead paragraph above a responsive 1/2/3-column grid of clickable project cards; each card shows a lazy-loaded image that subtly zooms on hover, with a gradient-to-top overlay that fades in to reveal a title and location caption. Every card routes through useNavigate on click. Use for portfolio / results galleries for residential cleaning companies, maid services, renovation cleaners, or home-service brands that want visual proof. Renders fully with no props via six baked-in default transformations.
 */
import { Container } from '#/section-kit/Container.tsx'
export const CleaningServiceGallery = defineCapsule({
  name: 'CleaningServiceGallery',
  description:
    'A before/after transformations image gallery for a home-cleaning / maid-service landing page: centered heading + lead above a responsive 1/2/3-column grid of clickable project cards. Each card has a lazy-loaded image that zooms on hover with a gradient-to-top overlay that fades in, revealing a title and location caption. Cards route through useNavigate on click. Use for portfolio / results galleries for residential cleaning, maid services, renovation cleaners, or home-service brands that want visual proof.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Gallery items: title + location + alt text for the image. */
    items: z
      .array(
        z.object({
          title: z.string(),
          location: z.string(),
          alt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heading = props.heading ?? 'Transformations that speak for themselves'
    const description =
      props.description ??
      'See the difference professional cleaning makes in real homes across Seattle.'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Kitchen Deep Clean',
            location: 'Capitol Hill, Seattle',
            alt: 'before and after comparison of kitchen deep cleaning showing greasy stove to sparkling clean',
          },
          {
            title: 'Bathroom Revival',
            location: 'Ballard, Seattle',
            alt: 'pristine bathroom with white subway tiles and clean glass shower enclosure',
          },
          {
            title: 'Living Room Refresh',
            location: 'Fremont, Seattle',
            alt: 'freshly cleaned living room with organized furniture and dust-free surfaces',
          },
          {
            title: 'Home Office Clean',
            location: 'Queen Anne, Seattle',
            alt: 'clean home office with organized desk and dusted shelves',
          },
          {
            title: 'Floor Restoration',
            location: 'Green Lake, Seattle',
            alt: 'sparkling hardwood floors after professional mopping in open concept space',
          },
          {
            title: 'Master Bedroom',
            location: 'Wallingford, Seattle',
            alt: 'immaculate bedroom with freshly laundered white linens and organized nightstands',
          },
        ]
    return (
      <section className={cn('bg-background py-20 lg:py-28', props.className)}>
        <Container>
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <ImageTile
                key={item.title}
                asChild
                treatment="h-72-2xl"
                className="block text-left"
              >
                <button type="button" onClick={() => go(item.title)}>
                  <Image
                    alt={item.alt}
                    w={600}
                    h={450}
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <BentoTileCaption
                    reveal="hover"
                    className="inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent"
                  >
                    <div className="absolute bottom-4 left-4 text-background">
                      <p className="font-semibold">{item.title}</p>
                      <p className="text-sm text-background/80">
                        {item.location}
                      </p>
                    </div>
                  </BentoTileCaption>
                </button>
              </ImageTile>
            ))}
          </div>
        </Container>
      </section>
    )
  },
})
