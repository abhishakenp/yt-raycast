import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'
import {
  PortfolioGrid,
  PortfolioItem,
  PortfolioMedia,
  PortfolioCaption,
} from '#/section-kit/PortfolioGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'

/**
 * IllustratorWork — a selected-work project gallery for an illustrator /
 * visual-artist portfolio on a raised card-colored band. A header row pairs an
 * uppercase accent eyebrow + serif heading with a "view all" link (arrow) on
 * the right, above a responsive 3-up grid of clickable projects; each project
 * is a tall 4:5 image that zooms on hover with a serif title and a small meta
 * line beneath. Every item and the view-all link route through useNavigate. Use
 * to showcase an artist's recent books, editorial spreads, campaigns, and
 * personal projects. Renders fully with no props via baked-in defaults.
 */
export const IllustratorWork = defineCapsule({
  name: 'IllustratorWork',
  description:
    "Selected-work project gallery for an illustrator / visual-artist portfolio on a raised card-colored band: a header row pairing an uppercase accent eyebrow + serif heading with a 'view all' arrow link, above a responsive 3-up grid of clickable projects, each a tall 4:5 image that zooms on hover with a serif title and small meta line. Items and the view-all link route through useNavigate. Use to showcase an artist's recent books, editorial spreads, campaigns, and personal projects.",
  props: z.object({
    /** Uppercase accent eyebrow label. */
    eyebrow: z.string().optional(),
    /** Serif section heading. */
    heading: z.string().optional(),
    /** "View all" link label on the right. */
    viewAll: z.string().optional(),
    /** Project items (title drives the image alt + nav target). */
    items: z
      .array(z.object({ title: z.string(), meta: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const eyebrow = props.eyebrow ?? 'Selected Work'
    const heading = props.heading ?? 'Recent Projects'
    const viewAll = props.viewAll ?? 'View all work'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'The Star Collector',
            meta: "Children's picture book · 2024",
          },
          { title: 'Kinfolk Magazine', meta: 'Editorial spread · Spring 2024' },
          { title: 'Portland Farmers Market', meta: 'Brand campaign · 2024' },
          { title: 'Botanical Series', meta: 'Personal project · 2023' },
          { title: 'The Reading Life', meta: 'Book cover · Chronicle Books' },
          { title: 'Garden Adventures', meta: 'Picture book · 2023' },
        ]

    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    )

    return (
      <section
        className={cn(
          'bg-card px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-28',
          props.className,
        )}
      >
        <Container size="xl">
          <div className="mb-12 flex flex-col justify-between gap-4 sm:mb-16 sm:flex-row sm:items-end">
            <div>
              <p className="mb-2 text-sm font-medium uppercase tracking-wider text-chart-1">
                {eyebrow}
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl">
                {heading}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => go(viewAll)}
              className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {viewAll}
              <ArrowRight className="size-4" />
            </button>
          </div>
          <PortfolioGrid cols="1-2-3" className="gap-4 sm:gap-6">
            {items.map((proj) => (
              <PortfolioItem
                key={proj.title}
                onClick={() => go(proj.title)}
                className="block w-full"
              >
                <PortfolioMedia aspect="4-5" className="mb-4">
                  <Image
                    alt={proj.title}
                    w={600}
                    h={750}
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </PortfolioMedia>
                <PortfolioCaption>
                  <h3 className="mb-1 font-serif text-lg">{proj.title}</h3>
                  <p className="text-sm text-muted-foreground">{proj.meta}</p>
                </PortfolioCaption>
              </PortfolioItem>
            ))}
          </PortfolioGrid>
        </Container>
      </section>
    )
  },
})
