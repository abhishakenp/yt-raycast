import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * KidsEducationGallery — "learning in action" masonry photo gallery for a kids /
 * family learning platform. A centered eyebrow + heading + description intro
 * above a responsive masonry grid of square photo tiles (the 2nd tile spans 2x2,
 * a later tile spans 2 columns); each tile zooms on hover and reveals a caption
 * over a soft bottom gradient. Use to show joyful candid learner photos for
 * kids-education startups, children's e-learning platforms, camps, and family
 * learning apps. Renders fully with no props via baked-in defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
import { Eyebrow } from '#/section-kit/Eyebrow.tsx'
import { GalleryGrid } from '#/section-kit/GalleryGrid.tsx'
export const KidsEducationGallery = defineCapsule({
  name: 'KidsEducationGallery',
  description:
    "Learning-in-action masonry photo gallery for a kids / family learning platform: a centered eyebrow + heading + description intro above a responsive masonry grid of square photo tiles (the 2nd tile spans 2x2, a later tile spans 2 columns); each tile zooms on hover and reveals a caption over a soft bottom gradient. Use to show joyful candid learner photos for kids-education startups, children's e-learning platforms, camps, and family learning apps.",
  props: z.object({
    /** Uppercase eyebrow above the heading. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting description under the heading. */
    description: z.string().optional(),
    /** Gallery tiles. */
    items: z
      .array(
        z.object({
          caption: z.string(),
          imageAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Gallery'
    const heading = props.heading ?? 'Learning in Action'
    const description =
      props.description ??
      'See the joy of discovery through the eyes of our young learners from around the world.'
    const items = props.items?.length
      ? props.items
      : [
          {
            caption: 'Craft Time',
            imageAlt:
              'Young girl smiling while doing a craft project with colorful paper',
          },
          {
            caption: 'Building Together',
            imageAlt:
              'Children collaborating on a large building blocks project in a bright classroom',
          },
          {
            caption: 'Garden Science',
            imageAlt:
              'Child excitedly observing a plant growing in a small pot',
          },
          {
            caption: 'Robotics Fun',
            imageAlt:
              'Young boy focused on assembling a robot kit with concentration',
          },
          {
            caption: 'Art Studio',
            imageAlt:
              'Children painting at easels with bright colorful paints in art class',
          },
          {
            caption: 'Microscope Lab',
            imageAlt:
              'Child using a microscope to examine slides with curiosity',
          },
          {
            caption: 'Reading Corner',
            imageAlt:
              'Young children reading books together in a cozy library corner',
          },
          {
            caption: 'Nature Walk',
            imageAlt:
              'Children outdoors on a nature walk exploring and collecting leaves',
          },
        ]
    return (
      <section className={cn('bg-background py-24', props.className)}>
        <Container>
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <Eyebrow
              variant="text"
              className="mb-3 text-sm tracking-wider text-secondary"
            >
              {eyebrow}
            </Eyebrow>
            <h2 className="mb-6 text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>

          <GalleryGrid
            images={items.map((item) => ({
              alt: item.imageAlt,
              caption: item.caption,
            }))}
            columns={3}
          />
        </Container>
      </section>
    )
  },
})
