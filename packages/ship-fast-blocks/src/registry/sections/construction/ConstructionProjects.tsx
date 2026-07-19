import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

/**
 * ConstructionProjects — featured-projects gallery for a construction /
 * general contractor page. A centered section heading above a responsive grid
 * of clickable project cards; each card has an alt-driven image with a
 * category tag overlay, a title, and a meta line. Every card and the
 * "View all" link route through section-kit route links. Use to showcase completed
 * projects for construction firms, contractors, builders, or design-build
 * firms. Renders fully with no props via baked-in defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  PortfolioGrid,
  PortfolioItem,
  PortfolioMedia,
  PortfolioCaption,
} from '#/section-kit/PortfolioGrid.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

export const ConstructionProjects = defineCapsule({
  name: 'ConstructionProjects',
  description:
    "Featured-projects gallery for a construction / general contractor page: a centered section heading above a responsive grid of clickable project cards, each with an alt-driven image with a category tag overlay, a title, and a meta line. Cards and the 'View all' link route through section-kit route links. Use to showcase completed projects for construction firms, contractors, builders, or design-build firms.",
  props: z.object({
    /** Section eyebrow label. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** "View all" link label. */
    viewAll: z.string().optional(),
    /** Project cards: title + meta + tag. */
    items: z
      .array(
        z.object({
          title: z.string(),
          meta: z.string(),
          tag: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Featured Projects'
    const heading = props.heading ?? "Recent work we're proud of"
    const description =
      props.description ??
      'A selection of our completed commercial and residential projects across Washington and Oregon.'
    const viewAll = props.viewAll ?? 'View all 500+ projects'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Pacific Tower Office Complex',
            meta: 'Downtown Seattle, WA • 120,000 sq ft • Completed 2024',
            tag: 'Commercial',
          },
          {
            title: 'Mercer Island Estate',
            meta: 'Mercer Island, WA • 8,500 sq ft • Completed 2024',
            tag: 'Residential',
          },
          {
            title: 'The Willows Apartments',
            meta: 'Bellevue, WA • 48 units • Completed 2023',
            tag: 'Multi-Family',
          },
          {
            title: 'Harvest Kitchen & Bar',
            meta: 'Portland, OR • 4,200 sq ft • Completed 2023',
            tag: 'Retail',
          },
          {
            title: 'Aurora Distribution Center',
            meta: 'Tacoma, WA • 250,000 sq ft • Completed 2023',
            tag: 'Industrial',
          },
          {
            title: 'Green Lake Craftsman',
            meta: 'Seattle, WA • 3,800 sq ft • Completed 2022',
            tag: 'Residential',
          },
        ]
    const ArrowRight = () => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <line x1="3" y1="12" x2="21" y2="12" />
        <polyline points="14 5 21 12 14 19" />
      </svg>
    )
    return (
      <section className={cn('bg-card py-20 lg:py-28', props.className)}>
        <Container>
          <SectionHeading
            eyebrow={eyebrow}
            title={heading}
            subtitle={description}
            className="mb-16 max-w-3xl gap-0"
            eyebrowClassName="text-sm font-semibold tracking-wider text-muted-foreground"
            titleClassName="mb-4 mt-3 text-3xl font-bold text-foreground sm:text-4xl"
            subtitleClassName="text-lg text-muted-foreground"
          />

          <PortfolioGrid cols="1-md-2-3">
            {items.map((proj) => (
              <PortfolioItem
                key={proj.title}
                className="group block w-full text-left"
                asChild
              >
                <NavbarRouteLink href={proj.title}>
                  <PortfolioMedia aspect="4-3" className="mb-4 rounded-xl">
                    <Image
                      alt={proj.title}
                      w={800}
                      h={600}
                      loading="lazy"
                      className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                    <div className="absolute inset-x-4 bottom-4">
                      <span className="mb-2 inline-block rounded-full bg-background/90 px-3 py-1 text-xs font-semibold text-foreground">
                        {proj.tag}
                      </span>
                    </div>
                  </PortfolioMedia>
                  <PortfolioCaption>
                    <h3 className="text-lg font-semibold text-foreground">
                      {proj.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{proj.meta}</p>
                  </PortfolioCaption>
                </NavbarRouteLink>
              </PortfolioItem>
            ))}
          </PortfolioGrid>

          <div className="mt-12 text-center">
            <NavbarRouteLink
              className="inline-flex items-center gap-2 font-semibold text-foreground transition-all hover:gap-3"
              href={viewAll}
            >
              {viewAll}
              <ArrowRight />
            </NavbarRouteLink>
          </div>
        </Container>
      </section>
    )
  },
})
