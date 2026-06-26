import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

/**
 * FitnessGallery — facility photo gallery for a gym or fitness studio, on a muted
 * card-surface band. A centered heading + lead paragraph above a 2/4-column grid of
 * equal-height rounded cover photos showing the training space. Images use the
 * alt-driven Image component. Use to show off the gym floor, studios, locker rooms
 * and recovery areas on gyms, fitness studios, yoga / pilates / boxing / spin studios.
 */
export const FitnessGallery = defineComponent({
  name: 'FitnessGallery',
  description:
    'Facility photo gallery for a gym or fitness studio on a muted card-surface band: a centered heading and lead paragraph above a 2/4-column grid of equal-height rounded cover photos showing the training space. Images use the alt-driven Image component. Use to show off the gym floor, studios, locker rooms, recovery areas or amenities on gyms, fitness studios, CrossFit boxes, yoga, pilates, boxing or spin / cycle studios.',
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    items: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const galleryHeading = props.heading ?? 'Our space'
    const galleryDesc =
      props.description ??
      '12,000 sq ft of premium training space with state-of-the-art equipment and thoughtful design.'
    const galleryItems = props.items?.length
      ? props.items
      : [
          'spacious gym floor with rows of squat racks and barbells with natural light from large windows',
          'pilates studio with reformer machines arranged in rows under pendant lighting',
          'modern gym interior with dumbbell racks and functional training equipment',
          'indoor cycling studio with stationary bikes in dimly lit room with accent lighting',
          'clean locker room with wooden benches and modern lockers',
          'boxing area with punching bags and heavy bags hanging in corner space',
          'yoga studio with wooden floors large mirrors and peaceful natural lighting',
          'recovery area with foam rollers stretching mats and mobility equipment',
        ]

    return (
      <section className={cn('bg-card py-20 md:py-32', props.className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-semibold text-foreground md:text-4xl">
              {galleryHeading}
            </h2>
            <p className="text-muted-foreground">{galleryDesc}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {galleryItems.map((alt) => (
              <Image
                key={alt}
                alt={alt}
                w={600}
                h={400}
                loading="lazy"
                className="h-48 w-full rounded-lg object-cover md:h-64"
              />
            ))}
          </div>
        </div>
      </section>
    )
  },
})
