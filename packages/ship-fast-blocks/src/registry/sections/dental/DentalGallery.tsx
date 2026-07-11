import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

/**
 * DentalGallery — office-tour photo gallery for a dental practice site. A
 * centered eyebrow + heading + lede above a responsive mosaic grid where the
 * first image spans two columns and rows as a large feature tile and the rest
 * are uniform 64-tall thumbnails; every photo zooms slightly on hover. Imagery
 * uses the alt-driven Image component. Use to show off the reception, treatment
 * rooms, and waiting area for dentists, dental offices, or clinics.
 */
import { Container } from '#/section-kit/Container.tsx'
export const DentalGallery = defineCapsule({
  name: 'DentalGallery',
  description:
    'Office-tour photo gallery for a dental practice site: a centered eyebrow + heading + lede above a responsive mosaic grid where the first image spans two columns and rows as a large feature tile and the rest are uniform thumbnails; every photo zooms slightly on hover. Imagery uses the Image component. Use to show off the reception, treatment rooms, and waiting area for dentists, dental offices, or clinics.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    description: z.string().optional(),
    images: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const galleryEyebrow = props.eyebrow ?? 'Our Office'
    const galleryHeading =
      props.heading ?? 'A welcoming space designed for your comfort'
    const galleryDesc =
      props.description ??
      'Step into our modern, calming environment where every detail is designed to make your dental visit as pleasant as possible.'
    const galleryImages = props.images?.length
      ? props.images
      : [
          'Spacious modern dental clinic reception area with comfortable seating and natural light',
          'Modern dental examination room with advanced dental equipment and patient chair',
          'State-of-the-art digital dental x-ray machine in clean modern clinic',
          'Bright clean dental treatment room with advanced technology and ergonomic patient chair',
          'Welcoming dental office waiting area with plants and comfortable modern furniture',
        ]
    return (
      <section className={cn('bg-background py-24', props.className)}>
        <Container>
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-wider text-primary">
              {galleryEyebrow}
            </span>
            <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
              {galleryHeading}
            </h2>
            <p className="text-lg text-muted-foreground">{galleryDesc}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {galleryImages.map((alt, i) => (
              <div
                key={alt}
                className={cn(
                  'overflow-hidden rounded-2xl',
                  i === 0
                    ? 'sm:col-span-2 lg:col-span-2 lg:row-span-2'
                    : 'h-64',
                )}
              >
                <Image
                  alt={alt}
                  w={i === 0 ? 800 : 600}
                  h={i === 0 ? 600 : 400}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
            ))}
          </div>
        </Container>
      </section>
    )
  },
})
