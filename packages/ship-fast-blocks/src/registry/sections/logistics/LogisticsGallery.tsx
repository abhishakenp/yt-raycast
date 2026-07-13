import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { ImageTile } from '#/section-kit/ImageTile.tsx'

/**
 * LogisticsGallery — a global-network image gallery for a logistics / freight-
 * forwarding company on a subtle muted band. A centered heading + lede over a
 * responsive 1 → 2 → 3 column grid of rounded 4:3 photo tiles (ships, warehouses,
 * trucks, cargo planes, terminals, ports) that gently zoom on hover. Clean and
 * corporate on a light surface. Use to showcase facilities, fleet and
 * infrastructure for logistics, freight-forwarding, shipping, courier, warehousing
 * or cargo/transport companies. Renders fully with no props via alt-driven images.
 */
import { Container } from '#/section-kit/Container.tsx'
export const LogisticsGallery = defineCapsule({
  name: 'LogisticsGallery',
  description:
    'Global-network image gallery for a logistics / freight-forwarding company on a subtle muted band: a centered heading + lede over a responsive 1 → 2 → 3 column grid of rounded 4:3 photo tiles (ships, warehouses, trucks, cargo planes, terminals, ports) that gently zoom on hover. Clean and corporate on a light surface. Use to showcase facilities, fleet and infrastructure for logistics, freight-forwarding, shipping, courier, warehousing, supply-chain or cargo/transport companies.',
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    images: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Our global network'
    const description =
      props.description ??
      'Facilities, fleet, and infrastructure that keep the world moving.'
    const images = props.images?.length
      ? props.images
      : [
          'Large commercial cargo ship loaded with colorful shipping containers sailing at sea',
          'Modern warehouse interior with tall shelves of packages and automated conveyor systems',
          'Fleet of white commercial delivery trucks parked at a distribution center',
          'Cargo airplane being loaded with freight containers at an airport tarmac',
          'Workers in safety vests coordinating logistics operations at a busy freight terminal',
          'Aerial view of a massive container port with cranes and stacked shipping containers',
        ]
    return (
      <section className={cn('bg-muted/50 py-16 lg:py-24', props.className)}>
        <Container>
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-semibold tracking-tight lg:text-4xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {images.map((alt) => (
              <ImageTile key={alt} treatment="4-3-2xl-muted">
                <Image
                  alt={alt}
                  w={600}
                  h={450}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </ImageTile>
            ))}
          </div>
        </Container>
      </section>
    )
  },
})
