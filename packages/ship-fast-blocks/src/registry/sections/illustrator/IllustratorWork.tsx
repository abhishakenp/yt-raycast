import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import {
  PortfolioGrid,
  PortfolioItem,
  PortfolioMedia,
  PortfolioCaption,
} from '#/section-kit/PortfolioGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { Watermark } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * IllustratorWork — a selected-work gallery for an illustrator / visual-artist
 * portfolio on a raised card band. A header row pairs a mono index micro-label +
 * serif heading with a rounded-full "view all" sticker link, above a responsive
 * 3-up grid of clickable projects laid out with a staggered vertical rhythm;
 * each project is a tall 4:5 image pinned in a hand-drawn dashed frame that
 * lifts on hover, captioned with a serif title and a mono meta line. A giant
 * ghost "work" watermark drifts behind. Every item and the view-all link route
 * through route links. Use to showcase an artist's recent books, editorial
 * spreads, campaigns, and personal projects. Renders fully with no props via
 * baked-in defaults.
 */
export const IllustratorWork = defineCapsule({
  name: 'IllustratorWork',
  description:
    "Selected-work gallery for an illustrator / visual-artist portfolio on a raised card band: a header row pairing a mono index micro-label + serif heading with a rounded-full 'view all' sticker link, above a responsive 3-up grid of clickable projects with a staggered vertical rhythm, each a tall 4:5 image pinned in a hand-drawn dashed frame that lifts on hover, captioned with a serif title and a mono meta line, with a giant ghost 'work' watermark behind. Items and the view-all link route through route links. Use to showcase an artist's recent books, editorial spreads, campaigns, and personal projects.",
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
          'relative isolate overflow-hidden bg-card px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-28',
          props.className,
        )}
      >
        <Watermark className="-left-4 bottom-4 text-[10rem] leading-none sm:text-[16rem]">
          work
        </Watermark>
        <Container size="xl" className="relative">
          <div className="mb-12 flex flex-col justify-between gap-4 border-b-2 border-dashed border-border pb-8 sm:mb-16 sm:flex-row sm:items-end">
            <SectionHeading
              align="left"
              eyebrow={eyebrow}
              title={heading}
              className="gap-0"
              eyebrowClassName="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-primary"
              titleClassName="font-serif text-3xl sm:text-4xl lg:text-5xl"
            />
            <NavbarRouteLink
              className="inline-flex w-fit -rotate-1 items-center gap-1.5 rounded-full border-2 border-dashed border-foreground/60 px-4 py-2 font-mono text-xs uppercase tracking-[0.12em] text-foreground transition-[transform,border-color] duration-150 hover:-translate-y-0.5 hover:border-foreground active:translate-y-0"
              href={viewAll}
            >
              {viewAll}
              <ArrowRight className="size-4" />
            </NavbarRouteLink>
          </div>
          <PortfolioGrid cols="1-2-3" className="gap-6 sm:gap-8">
            {items.map((proj, i) => (
              <PortfolioItem
                key={proj.title}
                className={cn(
                  'block w-full',
                  i % 3 === 1 && 'md:translate-y-10',
                )}
                asChild
              >
                <NavbarRouteLink href={proj.title}>
                  <PortfolioMedia
                    aspect="4-5"
                    className="mb-4 rounded-none border-2 border-dashed border-foreground/50 transition-[transform,box-shadow] duration-200 group-hover:-translate-y-1 group-hover:border-foreground group-hover:shadow-[6px_6px_0_0_var(--color-foreground)]"
                  >
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
                    <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                      <span
                        aria-hidden="true"
                        className="mr-1.5 text-muted-foreground/60"
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      {proj.meta}
                    </p>
                  </PortfolioCaption>
                </NavbarRouteLink>
              </PortfolioItem>
            ))}
          </PortfolioGrid>
        </Container>
      </section>
    )
  },
})
