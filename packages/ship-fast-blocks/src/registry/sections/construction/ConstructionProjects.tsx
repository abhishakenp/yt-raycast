import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

/**
 * ConstructionProjects — industrial-brutalist build log for a construction /
 * general contractor page. An asymmetric header (left mono eyebrow + extrabold
 * uppercase heading, mono file index right) above a staggered grid of
 * hard-edged project plates: every other column shifts down, each plate wraps
 * its alt-driven photo in a 2px frame with a hard offset shadow, a mono index
 * chip and a square category tag overlay, then an uppercase title and a mono
 * spec meta line. Every card and the square-edged "View all" button route
 * through section-kit route links. Use to showcase completed projects for
 * construction firms, contractors, builders, or design-build firms. Renders
 * fully with no props via baked-in defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  PortfolioGrid,
  PortfolioItem,
  PortfolioMedia,
  PortfolioCaption,
} from '#/section-kit/PortfolioGrid.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
export const ConstructionProjects = defineCapsule({
  name: 'ConstructionProjects',
  description:
    "Industrial-brutalist build log for a construction / general contractor page: an asymmetric header (left mono eyebrow + extrabold uppercase heading, mono file index right) above a staggered grid of hard-edged project plates — 2px photo frames with hard offset shadows, mono index chips, square category tag overlays, uppercase titles, and mono spec meta lines. Cards and the square-edged 'View all' button route through section-kit route links. Use to showcase completed projects for construction firms, contractors, builders, or design-build firms.",
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
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <line x1="3" y1="12" x2="21" y2="12" />
        <polyline points="14 5 21 12 14 19" />
      </svg>
    )
    return (
      <section
        className={cn(
          'overflow-hidden bg-card py-16 lg:py-24',
          props.className,
        )}
      >
        <Container>
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-16">
            <SectionHeading
              align="left"
              eyebrow={eyebrow}
              title={heading}
              subtitle={description}
              className="max-w-2xl gap-0"
              eyebrowClassName="font-mono text-[11px] uppercase tracking-[0.2em] text-primary"
              titleClassName="mb-4 mt-3 text-3xl font-extrabold uppercase tracking-tight text-foreground sm:text-4xl lg:text-5xl"
              subtitleClassName="text-lg text-muted-foreground"
            />
            <p
              aria-hidden="true"
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] tabular-nums text-muted-foreground/60"
            >
              File {String(items.length).padStart(2, '0')} / builds
            </p>
          </div>

          <PortfolioGrid
            cols="1-md-2-3"
            className="gap-x-6 gap-y-10 md:gap-y-8 lg:pb-10"
          >
            {items.map((proj, i) => (
              <PortfolioItem
                key={proj.title}
                className={cn(
                  'group block w-full text-left',
                  i % 2 === 1 && 'md:translate-y-6 lg:translate-y-0',
                  i % 3 === 1 && 'lg:translate-y-10',
                )}
                asChild
              >
                <NavbarRouteLink href={proj.title}>
                  <PortfolioMedia
                    aspect="4-3"
                    className="mb-4 rounded-none border-2 border-foreground shadow-[6px_6px_0_0] shadow-foreground/20 transition-all duration-100 group-hover:-translate-y-1 group-hover:shadow-[8px_8px_0_0] group-hover:shadow-foreground/30"
                  >
                    <Image
                      alt={proj.title}
                      w={800}
                      h={600}
                      loading="lazy"
                      className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                    <span className="absolute left-0 top-0 bg-foreground px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] tabular-nums text-background">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="absolute inset-x-4 bottom-4">
                      <span className="mb-2 inline-block rounded-none border border-foreground bg-background px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-foreground">
                        {proj.tag}
                      </span>
                    </div>
                  </PortfolioMedia>
                  <PortfolioCaption>
                    <h3 className="text-base font-extrabold uppercase tracking-tight text-foreground">
                      {proj.title}
                    </h3>
                    <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                      {proj.meta}
                    </p>
                  </PortfolioCaption>
                </NavbarRouteLink>
              </PortfolioItem>
            ))}
          </PortfolioGrid>

          <div className="mt-14 lg:mt-20">
            <NavbarRouteLink
              className="inline-flex items-center gap-2 rounded-none border-2 border-foreground bg-background px-6 py-3.5 font-mono text-xs font-bold uppercase tracking-[0.15em] text-foreground shadow-[5px_5px_0_0] shadow-foreground transition-all duration-100 hover:-translate-y-px hover:gap-3 active:translate-x-px active:translate-y-px active:shadow-none"
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
