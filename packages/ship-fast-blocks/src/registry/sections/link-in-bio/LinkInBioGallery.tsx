import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  GalleryGrid,
  GalleryGridItems,
  GalleryTile,
  GalleryTileImage,
  GalleryTileCaption,
} from '#/section-kit/GalleryGrid.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { Container } from '#/section-kit/Container.tsx'

/**
 * LinkInBioGallery — a bold, mobile-first "Featured" content grid for a creator
 * link hub / Linktree-style page in the "chunky rounded stack" language, built
 * as a thin wrapper over the shared GalleryGrid composite. Renders an extrabold
 * heading + subheading over a tight 2-column grid (2/3/4 supported) of recent
 * posts, drops, videos, and projects, each tile a chunky rounded-2xl 2px-ruled
 * plate with a hard offset token shadow, alternating tiles nudged down for a
 * staggered sticker-stack rhythm. Each tile pulls a relevant stock photo from
 * its alt text and carries an inverted mono caption strip, so the section
 * doubles as a visual portfolio teaser beneath the profile + links stack. The
 * wrapper centers the grid in a narrow column with mobile-first padding; theme
 * tokens only, props.className merged last. Use it on any creator / influencer /
 * freelancer link-in-bio page to spotlight latest work, product drops, or video
 * content. Renders fully with no props via baked-in defaults.
 */
export const LinkInBioGallery = defineCapsule({
  name: 'LinkInBioGallery',
  description:
    "Bold, mobile-first 'Featured' content grid for a creator LINK-IN-BIO / link-hub / Linktree-style page in a chunky-rounded language, built on the shared GalleryGrid composite. An extrabold heading + subheading sit over a tight 2-column grid (2/3/4 supported) of recent posts, product drops, videos, and projects; each tile is a chunky rounded-2xl 2px-ruled plate with a hard offset token shadow, alternating tiles nudged down for a staggered sticker-stack rhythm, pulling a relevant stock photo from its alt text and showing an inverted mono caption strip, turning the section into a visual portfolio teaser beneath the profile and links stack. The wrapper centers the grid in a narrow column with mobile-first padding. Use to spotlight latest work, drops, tutorials, or video content on any creator, influencer, or freelancer link-in-bio landing page. Renders fully with no props.",
  props: z.object({
    /** Section heading (default "Featured"). */
    heading: z.string().optional(),
    /** Supporting line under the heading. */
    subheading: z.string().optional(),
    /** Featured tiles — each alt drives a stock photo; caption is the strip label. */
    images: z
      .array(
        z.object({
          alt: z.string(),
          caption: z.string().optional(),
        }),
      )
      .optional(),
    /** Grid columns (default 2 reads best on a mobile-first link hub). */
    columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const images = props.images?.length
      ? props.images
      : [
          {
            alt: 'minimalist product photo of a design UI kit on a laptop screen on a clean desk',
            caption: 'Latest UI kit',
          },
          {
            alt: 'creator filming a video tutorial at a desk with a ring light and camera',
            caption: 'New tutorial',
          },
          {
            alt: 'flat lay of a freelancer notebook, phone, and coffee on a marble desk',
            caption: 'Behind the scenes',
          },
          {
            alt: 'vibrant abstract 3D render of soft gradient shapes for a brand drop',
            caption: 'Brand drop',
          },
          {
            alt: "smartphone showing a mobile app interface mockup in someone's hand",
            caption: 'App in progress',
          },
          {
            alt: 'person presenting on stage at a creator conference with bright lighting',
            caption: 'Recent talk',
          },
        ]

    return (
      <GalleryGrid className={cn('py-10', props.className)}>
        <Container className="max-w-2xl">
          <SectionHeading
            title={props.heading ?? 'Featured'}
            subtitle={props.subheading ?? 'Recent posts, drops, and projects.'}
            titleClassName="text-3xl font-extrabold tracking-tight md:text-4xl"
          />
          <GalleryGridItems columns={props.columns ?? 2}>
            {images.map((img, i) => {
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
                    'rounded-2xl border-2 border-foreground shadow-[4px_4px_0_0] shadow-foreground',
                    i % 2 === 1 && 'sm:translate-y-5',
                  )}
                >
                  <GalleryTileImage alt={__iv__.alt} />
                  {__iv__.caption && (
                    <GalleryTileCaption className="border-t-2 border-foreground bg-foreground font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-background backdrop-blur-none">
                      {__iv__.caption}
                    </GalleryTileCaption>
                  )}
                </GalleryTile>
              )
            })}
          </GalleryGridItems>
        </Container>
      </GalleryGrid>
    )
  },
})
