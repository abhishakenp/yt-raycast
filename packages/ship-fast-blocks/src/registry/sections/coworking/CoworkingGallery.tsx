import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { Image } from '#/lib/img.tsx'
import { cn } from '#/lib/utils.ts'
import { GridField } from '#/section-kit/motion.tsx'
import { Container } from '#/section-kit/Container.tsx'

/**
 * CoworkingGallery — flat editorial space tour for a coworking or shared-
 * workspace page. Photos flow into an editorial MASONRY of varied-height
 * hairline tiles (`border border-border`) across a token multi-column layout
 * — no uniform equal grid, no rounded glow cards, no glass caption plates.
 * Each tile carries a mono index + caption ledger row under the image
 * (`font-mono text-[10px] uppercase tracking-[0.14em]`) and only a restrained
 * hover (a soft image zoom, no lift — the tiles are non-interactive). The
 * header splits asymmetrically 7:5: a mono micro-label eyebrow with a square
 * accent marker ("02 / The space") plus a solid display heading on the left,
 * and a supporting line on the right. The backdrop is a subtle architectural
 * hairline field with hairline content rails. Every tile is an alt-driven
 * Image. Use to let prospective members picture themselves in the space for
 * coworking spaces, shared offices, or flex-office providers.
 */
export const CoworkingGallery = defineCapsule({
  name: 'CoworkingGallery',
  description:
    'Immersive space-tour gallery for a coworking or shared-workspace page: with default content, six alt-driven photos form a hover-accordion row on desktop — the hovered panel eases wide while a glass mono-index caption plate fades up and the photo zooms softly; authored image lists or an explicit column count render a calm uniform grid with gentle zoom + caption hovers. Asymmetric 7:5 editorial header (mono index eyebrow chip + display heading left, supporting line right) over a connected light-field backdrop (hairline rails). All imagery is alt-driven via the Image component. Use to let prospective members picture themselves in the space for coworking spaces, shared offices, or flex-office providers.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting line under the heading (maps to GalleryGrid subheading). */
    description: z.string().optional(),
    /** Gallery tiles — each has alt text driving the photo and a short caption. */
    images: z
      .array(z.object({ alt: z.string(), caption: z.string().optional() }))
      .optional(),
    /** Grid column count (2, 3, or 4). */
    columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading =
      typeof props.heading === 'string' && props.heading
        ? props.heading
        : 'Take a look around'
    const description =
      typeof props.description === 'string' && props.description
        ? props.description
        : 'Light-filled floors, comfortable lounges, and the little spaces that make a workday feel good.'

    const defaults = [
      {
        alt: 'Bright open-plan coworking floor with rows of wooden hot desks, ergonomic chairs, leafy plants, and floor-to-ceiling windows',
        caption: 'Open desks',
      },
      {
        alt: 'Sunlit coworking lounge with a green velvet sofa, mid-century armchairs, a coffee table, and warm pendant lighting',
        caption: 'Member lounge',
      },
      {
        alt: 'Glass-walled meeting room with a long wooden table, ergonomic chairs, a wall-mounted display, and a whiteboard',
        caption: 'Meeting room',
      },
      {
        alt: 'Modern shared office kitchen with a marble island, bar stools, an espresso machine, and tall windows',
        caption: 'Shared kitchen',
      },
      {
        alt: 'Soundproof single-person phone booth with a small desk, a stool, and a pendant light inside a coworking space',
        caption: 'Phone booth',
      },
      {
        alt: 'Rooftop terrace of a coworking building at golden hour with lounge seating, string lights, planters, and a city skyline',
        caption: 'Rooftop terrace',
      },
    ]

    const authored = props.images
      ?.filter(Boolean)
      .filter((image) => typeof image?.alt === 'string' && image.alt)
    const images = (authored?.length ? authored : defaults).map((image) => ({
      alt: image.alt,
      caption: typeof image.caption === 'string' ? image.caption : '',
    }))

    // Multi-column masonry: the column count honors the authored `columns`
    // prop (default 3); varied tile heights cycle so the flow reads editorial
    // rather than as a uniform equal grid.
    const columns = props.columns ?? 3
    const columnClass =
      columns === 2
        ? 'columns-1 sm:columns-2'
        : columns === 4
          ? 'columns-1 sm:columns-2 lg:columns-4'
          : 'columns-1 sm:columns-2 lg:columns-3'

    const aspects = [
      'aspect-[4/5]',
      'aspect-[4/3]',
      'aspect-square',
      'aspect-[3/4]',
      'aspect-[5/4]',
      'aspect-[4/3]',
    ]

    return (
      <section
        className={cn(
          'relative isolate overflow-hidden bg-background py-24 lg:py-28',
          props.className,
        )}
      >
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-px bg-border/60"
        />
        <GridField className="-z-10 text-foreground/[0.025]" size={64} />

        <Container className="relative">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 hidden w-px bg-border/70 lg:block"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 hidden w-px bg-border/70 lg:block"
          />

          <div className="grid items-end gap-6 lg:grid-cols-[7fr_5fr] lg:gap-16">
            <div>
              <span className="inline-flex items-center gap-2.5">
                <span aria-hidden="true" className="size-2 bg-primary" />
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  02 / The space
                </span>
              </span>
              <h2 className="mt-5 max-w-xl text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                {heading}
              </h2>
            </div>
            <p className="text-pretty text-lg leading-relaxed text-muted-foreground lg:pb-1">
              {description}
            </p>
          </div>

          <div className={cn('mt-14 gap-4', columnClass)}>
            {images.map((image, index) => (
              <figure
                key={`${image.alt}-${index}`}
                className="group mb-4 break-inside-avoid border border-border bg-muted/30"
              >
                <div
                  className={cn(
                    'relative overflow-hidden',
                    aspects[index % aspects.length],
                  )}
                >
                  <Image
                    alt={image.alt}
                    w={800}
                    h={600}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </div>
                {image.caption ? (
                  <figcaption className="flex items-baseline gap-2 border-t border-border px-3.5 py-2.5">
                    <span
                      aria-hidden="true"
                      className="font-mono text-[10px] uppercase tracking-[0.14em] tabular-nums text-muted-foreground"
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-foreground">
                      {image.caption}
                    </span>
                  </figcaption>
                ) : null}
              </figure>
            ))}
          </div>
        </Container>
      </section>
    )
  },
})
