import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * KidsEducationGallery — "learning in action" playful-primary bento photo
 * gallery for a kids / family learning platform. An asymmetric mono-labeled
 * header (eyebrow + heading left, index meta right) above a bento grid of
 * sharp-cornered 2px-bordered photo tiles (two tiles run double-wide) that zoom
 * on hover under a sharp mono sticker caption bar. Use to show joyful candid
 * learner photos for kids-education startups, children's e-learning platforms,
 * camps, and family learning apps. Renders fully with no props via baked-in
 * defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  GalleryGrid,
  GalleryGridItems,
  GalleryTile,
  GalleryTileImage,
  GalleryTileCaption,
} from '#/section-kit/GalleryGrid.tsx'
export const KidsEducationGallery = defineCapsule({
  name: 'KidsEducationGallery',
  description:
    "Learning-in-action playful-primary bento photo gallery for a kids / family learning platform: an asymmetric mono-labeled header (eyebrow + heading left, index meta right) above a bento grid of sharp-cornered 2px-bordered photo tiles (two tiles run double-wide) that zoom on hover under a sharp mono sticker caption bar. Use to show joyful candid learner photos for kids-education startups, children's e-learning platforms, camps, and family learning apps.",
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
      <section
        className={cn(
          'relative overflow-hidden bg-background py-20 lg:py-24',
          props.className,
        )}
      >
        <Watermark className="-right-6 top-6 text-[7rem] sm:text-[10rem] lg:text-[13rem]">
          IN ACTION
        </Watermark>
        <Container className="relative">
          <div className="mb-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              align="left"
              eyebrow={eyebrow}
              title={heading}
              subtitle={description}
              className="max-w-2xl gap-0"
              eyebrowClassName="mb-3 inline-block font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground"
              titleClassName="mb-5 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl"
              subtitleClassName="text-lg text-muted-foreground"
            />
            <MonoTag
              aria-hidden="true"
              className="shrink-0 text-muted-foreground/60"
            >
              [ 04 ] gallery
            </MonoTag>
          </div>

          <GalleryGrid>
            <GalleryGridItems columns={3} className="gap-4">
              {items
                .map((item) => ({
                  alt: item.imageAlt,
                  caption: item.caption,
                }))
                .map((img, i) => {
                  const __iv__ = img as {
                    alt: string
                    caption?: string
                    title?: string
                    location?: string
                  }
                  return (
                    <GalleryTile
                      key={__iv__.alt}
                      className={cn(
                        'rounded-none border-2 border-foreground transition-[transform,box-shadow] duration-150 hover:-translate-y-1 hover:shadow-[6px_6px_0_0] hover:shadow-foreground motion-reduce:transform-none',
                        (i === 1 || i === 6) && 'sm:col-span-2 sm:aspect-[8/3]',
                      )}
                    >
                      <GalleryTileImage alt={__iv__.alt} />
                      {__iv__.caption && (
                        <GalleryTileCaption className="inset-x-0 bottom-0 border-t-2 border-foreground bg-background px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-foreground backdrop-blur-none">
                          <span aria-hidden="true" className="text-primary">
                            /{' '}
                          </span>
                          {__iv__.caption}
                        </GalleryTileCaption>
                      )}
                    </GalleryTile>
                  )
                })}
            </GalleryGridItems>
          </GalleryGrid>
        </Container>
      </section>
    )
  },
})
