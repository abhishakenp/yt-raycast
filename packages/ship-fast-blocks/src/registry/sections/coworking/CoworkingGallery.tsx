import { useState } from 'react'
import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { Camera } from 'lucide-react'

import { Image } from '#/lib/img.tsx'
import { cn } from '#/lib/utils.ts'
import { GridField } from '#/section-kit/motion.tsx'

import { Container } from '#/section-kit/Container.tsx'
import {
  HoverAccordion,
  HoverAccordionPanel,
} from '#/section-kit/HoverAccordion.tsx'

/**
 * CoworkingGallery — immersive space tour for a coworking or shared-
 * workspace page. On large screens the default six photos form a single
 * accordion row of tall panels: hovering a panel eases it wide while its
 * glass caption plate fades up and the photo zooms softly — an exploratory,
 * editorial way to wander the space. Small screens and authored image lists
 * render a calm uniform grid honoring the column prop, with gentle zoom and
 * caption hovers. Every tile is an alt-driven Image with ring borders and a
 * soft gradient overlay; the backdrop continues the page's light-field
 * (hairline rails, seam hairline). SSR renders static equal panels with
 * captions visible. Use to let prospective members picture themselves in the
 * space for coworking spaces, shared offices, or flex-office providers.
 */
export const CoworkingGallery = defineCapsule({
  name: 'CoworkingGallery',
  description:
    'Immersive space-tour gallery for a coworking or shared-workspace page: with default content, six alt-driven photos form a hover-accordion row on desktop — the hovered panel eases wide while a glass caption plate fades up and the photo zooms softly; authored image lists or an explicit column count render a calm uniform grid with gentle zoom + caption hovers. Header with eyebrow chip, display heading, and supporting line over a connected light-field backdrop (hairline rails). All imagery is alt-driven via the Image component. Use to let prospective members picture themselves in the space for coworking spaces, shared offices, or flex-office providers.',
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
    const [expanded, setExpanded] = useState<number | null>(null)
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

    // The hover-accordion row is reserved for the untouched default set;
    // authored content or an explicit column count gets a uniform grid.
    const accordion = !authored?.length && props.columns == null
    const columns = props.columns ?? 3
    const uniformCols =
      columns === 2
        ? 'sm:grid-cols-2'
        : columns === 4
          ? 'sm:grid-cols-2 lg:grid-cols-4'
          : 'sm:grid-cols-2 lg:grid-cols-3'

    const captionPlate = (caption: string, visible: boolean) =>
      caption ? (
        <div
          className={cn(
            'absolute inset-x-0 bottom-0 flex items-end p-4 transition-all duration-500',
            visible
              ? 'translate-y-0 opacity-100'
              : 'translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100',
          )}
        >
          <span className="rounded-full border border-border/40 bg-background/70 px-3.5 py-1.5 text-sm font-medium text-foreground shadow-sm backdrop-blur-md">
            {caption}
          </span>
        </div>
      ) : null

    const overlay = (
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-background/70 via-background/10 to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-90"
      />
    )

    return (
      <section
        className={cn(
          'relative isolate overflow-hidden bg-background py-24 lg:py-28',
          props.className,
        )}
      >
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border/60 to-transparent"
        />
        <GridField
          className="-z-10 text-foreground/[0.045]"
          size={64}
          mask="radial-gradient(ellipse 90% 70% at 50% 25%, black 25%, transparent 78%)"
        />

        <Container className="relative">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 hidden w-px bg-gradient-to-b from-transparent via-border/70 to-transparent lg:block"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 hidden w-px bg-gradient-to-b from-transparent via-border/70 to-transparent lg:block"
          />

          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/70 px-4 py-1.5 backdrop-blur">
              <Camera className="size-3.5 text-primary" aria-hidden="true" />
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                The space
              </span>
            </span>
            <h2 className="mt-5 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              {heading}
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>

          {accordion ? (
            <>
              {/* Desktop: hover-accordion row — the hovered panel eases wide. */}
              <HoverAccordion
                className="mt-14 hidden h-[30rem] lg:flex"
                onExpandedChange={setExpanded}
              >
                {images.map((image, index) => {
                  const isExpanded = expanded === index
                  return (
                    <HoverAccordionPanel
                      key={`${image.alt}-${index}`}
                      expanded={isExpanded}
                      onMouseEnter={() => setExpanded(index)}
                      onFocus={() => setExpanded(index)}
                    >
                      <Image
                        alt={image.alt}
                        w={900}
                        h={1200}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      {overlay}
                      {captionPlate(image.caption, isExpanded)}
                    </HoverAccordionPanel>
                  )
                })}
              </HoverAccordion>

              {/* Small screens: calm 2-col grid of the same tiles. */}
              <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:hidden">
                {images.map((image, index) => (
                  <div
                    key={`${image.alt}-${index}`}
                    className="group relative aspect-[4/3] overflow-hidden rounded-3xl ring-1 ring-border/60"
                  >
                    <Image
                      alt={image.alt}
                      w={800}
                      h={600}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {overlay}
                    {captionPlate(image.caption, true)}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className={cn('mt-14 grid grid-cols-1 gap-4', uniformCols)}>
              {images.map((image, index) => (
                <div
                  key={`${image.alt}-${index}`}
                  className="group relative aspect-[4/3] overflow-hidden rounded-3xl ring-1 ring-border/60 transition-shadow duration-500 hover:shadow-lg hover:shadow-primary/10 hover:ring-primary/40"
                >
                  <Image
                    alt={image.alt}
                    w={800}
                    h={600}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {overlay}
                  {captionPlate(image.caption, false)}
                </div>
              ))}
            </div>
          )}
        </Container>
      </section>
    )
  },
})
