import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'

/**
 * ManufacturingGallery — a dark portfolio / recent-projects gallery for a
 * precision-manufacturing site. On a foreground-colored band, a header row pairs
 * an eyebrow + heading with a right-aligned description, above a responsive
 * three-column grid of project tiles, each an alt-driven photo that zooms on
 * hover plus a title and material/spec caption, the whole tile routing through
 * useNavigate. Bold, industrial, gallery-like. Use to showcase recently
 * machined parts on machine-shop or fabricator pages. Renders fully with no
 * props via baked-in defaults.
 */
export const ManufacturingGallery = defineComponent({
  name: 'ManufacturingGallery',
  description:
    'A dark portfolio / recent-projects gallery for a precision-manufacturing site: on a foreground-colored band, a header row pairs an eyebrow + heading with a right-aligned description, above a responsive three-column grid of project tiles, each an alt-driven photo that zooms on hover plus a title and material/spec caption, the whole tile routing through useNavigate. Bold, industrial, gallery-like. Use to showcase recently machined parts on machine-shop or fabricator pages.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    description: z.string().optional(),
    items: z
      .array(z.object({ title: z.string(), spec: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
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
      <section className={cn('bg-foreground py-20 lg:py-28', props.className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="text-sm font-medium uppercase tracking-wider text-background/60">
                {eyebrow}
              </span>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-background sm:text-4xl">
                {heading}
              </h2>
            </div>
            <p className="max-w-md text-background/70">{description}</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <button
                key={item.title}
                type="button"
                onClick={() => go(item.title)}
                className="group block text-left"
              >
                <div className="overflow-hidden rounded-lg">
                  <Image
                    alt={item.title}
                    w={600}
                    h={400}
                    loading="lazy"
                    className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="mt-4">
                  <p className="font-medium text-background">{item.title}</p>
                  <p className="text-sm text-background/60">{item.spec}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
