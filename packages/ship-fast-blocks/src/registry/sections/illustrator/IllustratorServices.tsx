import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  ServicesGrid,
  ServiceCard,
  ServiceTitle,
  ServiceDescription,
} from '#/section-kit/ServicesGrid.tsx'

/**
 * IllustratorServices — a "what I create" offerings grid for an illustrator /
 * visual-artist portfolio. A serif section title and supporting paragraph sit
 * above a responsive 3-up grid of sketchbook cards (rounded-none dashed borders,
 * hard offset shadows on hover, a staggered vertical rhythm); each card leads
 * with a big ghost index numeral instead of an icon tile, then a serif title and
 * a descriptive paragraph. Use to outline an artist's offerings — children's
 * books, editorial illustration, art prints & products, commissions. Renders
 * fully with no props via baked-in defaults.
 */
export const IllustratorServices = defineCapsule({
  name: 'IllustratorServices',
  description:
    "'What I create' offerings grid for an illustrator / visual-artist portfolio: a serif section title and supporting paragraph above a responsive 3-up grid of sketchbook cards (rounded-none dashed borders, hard offset shadows on hover, a staggered vertical rhythm), each led by a big ghost index numeral instead of an icon tile, then a serif title and a descriptive paragraph. Use to outline an artist's offerings — children's books, editorial illustration, art prints & products, commissions.",
  props: z.object({
    /** Serif section heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    description: z.string().optional(),
    /** Service cards. */
    items: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'What I create'
    const description =
      props.description ??
      "From editorial spreads to children's adventures, each project receives the same careful attention to detail and storytelling."
    const items = props.items?.length
      ? props.items
      : [
          {
            title: "Children's Books",
            description:
              'Full-page illustrations and character designs for picture books and middle-grade stories. Published works include "The Star Collector" and "Where Dragons Sleep."',
          },
          {
            title: 'Editorial Illustration',
            description:
              'Magazine covers, article spot illustrations, and digital features for publications. Recent clients include The Atlantic, Kinfolk, and Afar Magazine.',
          },
          {
            title: 'Art Prints & Products',
            description:
              'Limited edition giclée prints, greeting cards, and stationery. All prints are signed, numbered, and produced on archival-quality paper.',
          },
        ]

    return (
      <ServicesGrid
        heading={heading}
        subheading={description}
        columns={3}
        className={cn(
          'px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-28 [&_[data-slot=section-heading-eyebrow]]:font-mono [&_[data-slot=section-heading-title]]:font-serif',
          props.className,
        )}
      >
        {items.map((item, i) => {
          const __iv__ = item
          return (
            <ServiceCard
              key={__iv__.title}
              className={cn(
                'relative gap-4 overflow-hidden rounded-none border-2 border-dashed border-foreground/50 bg-card p-7 transition-[transform,box-shadow] duration-150 hover:-translate-y-1 hover:border-foreground hover:shadow-[6px_6px_0_0_var(--color-foreground)]',
                i % 2 === 1 && 'md:translate-y-8',
              )}
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-2 -top-6 select-none font-serif text-8xl leading-none text-foreground/[0.06]"
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
                {String(i + 1).padStart(2, '0')} / craft
              </span>
              <ServiceTitle className="font-serif text-xl text-card-foreground">
                {__iv__.title}
              </ServiceTitle>
              <ServiceDescription className="leading-relaxed">
                {__iv__.description}
              </ServiceDescription>
            </ServiceCard>
          )
        })}
      </ServicesGrid>
    )
  },
})
