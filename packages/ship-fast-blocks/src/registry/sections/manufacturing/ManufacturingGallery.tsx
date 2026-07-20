import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * ManufacturingGallery — a dark, heavy-industrial portfolio / recent-projects
 * gallery for a precision-manufacturing site. On an inverted bg-foreground band,
 * an asymmetric header pairs a mono index eyebrow + giant heading with a right-
 * aligned description, above a staggered three-column grid of hard-bordered slab
 * tiles: each an alt-driven photo that zooms on hover under a mono spec ledger
 * caption (index + title + material/spec line). A giant ghost watermark bleeds
 * behind. Tech-brutalist, industrial, gallery-like. Use to showcase recently
 * machined parts on machine-shop or fabricator pages. Renders fully with no props
 * via baked-in defaults.
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
export const ManufacturingGallery = defineCapsule({
  name: 'ManufacturingGallery',
  description:
    'A dark, heavy-industrial portfolio / recent-projects gallery for a precision-manufacturing site: on an inverted bg-foreground band, an asymmetric header pairs a mono index eyebrow + giant heading with a right-aligned description, above a staggered three-column grid of hard-bordered slab tiles, each an alt-driven photo that zooms on hover under a mono spec ledger caption (index + title + material/spec line), with a giant ghost watermark behind. Tech-brutalist, industrial, gallery-like. Use to showcase recently machined parts on machine-shop or fabricator pages.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    description: z.string().optional(),
    items: z
      .array(
        z.object({
          title: z.string(),
          spec: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Portfolio'
    const heading = props.heading ?? 'Recent Projects'
    const description =
      props.description ??
      "A selection of components we've manufactured for aerospace, automotive, and industrial clients in 2024-2025."
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Titanium Aerospace Brackets',
            spec: '5-axis CNC • Ti-6Al-4V • ±0.001"',
          },
          {
            title: 'EV Motor Controller Heat Sinks',
            spec: 'Aluminum 6061 • Anodized • High-volume',
          },
          {
            title: 'Oil & Gas Valve Manifolds',
            spec: '316 Stainless • NACE MR0175 • Welded',
          },
          {
            title: 'Orthopedic Surgical Instruments',
            spec: '17-4 PH Stainless • Passivated • FDA',
          },
          {
            title: 'Robotic Arm Base Structures',
            spec: 'Mild Steel • Robot Welded • Powder Coat',
          },
          {
            title: 'Wire EDM Precision Gears',
            spec: 'Hardened Steel • AGMA Class 10 • WEDM',
          },
        ]
    return (
      <section
        className={cn(
          'relative overflow-hidden bg-foreground py-20 text-background lg:py-28',
          props.className,
        )}
      >
        <Watermark className="-right-4 top-8 text-[8rem] leading-none text-background/[0.05] sm:text-[13rem]">
          WORK
        </Watermark>
        <Container className="relative">
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              align="left"
              eyebrow={eyebrow}
              title={heading}
              className="gap-0"
              eyebrowClassName="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-background/60"
              titleClassName="mt-3 text-3xl font-extrabold uppercase tracking-tight text-background sm:text-4xl"
            />
            <p className="max-w-md text-background/70 md:text-right">
              {description}
            </p>
          </div>
          <GalleryGrid>
            <GalleryGridItems columns={3}>
              {items.map((item, i) => (
                <GalleryTile
                  key={item.title}
                  className={cn(
                    'rounded-none border-2 border-background/40',
                    i % 3 === 1 && 'lg:translate-y-6',
                  )}
                >
                  <GalleryTileImage alt={item.title} />
                  <GalleryTileCaption className="rounded-none border-t-2 border-background/40 bg-foreground/90 px-4 py-3 text-background">
                    <MonoTag
                      aria-hidden="true"
                      tone="inverted"
                      className="block text-[10px]"
                    >
                      {String(i + 1).padStart(2, '0')} / Part
                    </MonoTag>
                    <span className="mt-1 block text-sm font-bold uppercase tracking-tight text-background">
                      {item.title}
                    </span>
                    <span className="mt-1 block font-mono text-[11px] tracking-[0.06em] text-background/60">
                      {item.spec}
                    </span>
                  </GalleryTileCaption>
                </GalleryTile>
              ))}
            </GalleryGridItems>
          </GalleryGrid>
        </Container>
      </section>
    )
  },
})
