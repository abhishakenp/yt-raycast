import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import {
  PortfolioGrid,
  PortfolioItem,
  PortfolioMedia,
  PortfolioCaption,
  PortfolioTag,
} from '#/section-kit/PortfolioGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'

/**
 * AgencyWork — neo-brutalist staggered case-study gallery for a creative
 * digital-agency page, on a muted band. An asymmetric header (slab uppercase
 * heading + lead left, mono "04 / Selected work" index and a bordered block
 * "view all" button with hard offset shadow right) above a 2-column staggered
 * grid of clickable project plates: each is a sharp 2px-bordered card with a
 * hard 8px offset shadow and alternating micro-rotation that lifts on hover,
 * holding an alt-driven image with a thick bottom rule, a mono index numeral,
 * a slab uppercase title, a description, and a rotated sticker category chip
 * overlapping the plate's top edge; a mono "View case study" strip appears
 * over the image on hover. Every card and the view-all button route through
 * section-kit route links. Use to showcase an agency's portfolio, case
 * studies, featured projects, or selected work. Renders fully with no props
 * via four baked-in default projects.
 */
export const AgencyWork = defineCapsule({
  name: 'AgencyWork',
  description:
    "Neo-brutalist staggered case-study gallery for a creative digital-agency page on a muted band: an asymmetric header (slab uppercase heading + lead left, mono index and a bordered block 'view all' button with hard offset shadow right) above a 2-column staggered grid of clickable project plates — sharp 2px-bordered cards with hard 8px offset shadows and alternating micro-rotations that lift on hover, each holding an alt-driven image with a thick bottom rule, a mono index numeral, a slab uppercase title, a description, and a rotated sticker category chip overlapping the plate edge; a mono 'View case study' strip appears over the image on hover. Cards and the view-all button route through section-kit route links. Use to showcase an agency's portfolio, case studies, featured projects, or selected work.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** "View all" link label on the right. */
    viewAll: z.string().optional(),
    /** Project cards: title, description, category tag. */
    items: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
          tag: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Selected work'
    const description =
      props.description ??
      'A curated collection of projects where strategy, craft, and technology converged.'
    const viewAll = props.viewAll ?? 'View all projects'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Aurora Fintech',
            description:
              'Complete brand overhaul and product design for a next-generation trading platform.',
            tag: 'Fintech',
          },
          {
            title: 'Nova Commerce',
            description:
              'Headless e-commerce experience with 40% faster checkout and 3x conversion lift.',
            tag: 'E-commerce',
          },
          {
            title: 'Medilink Health',
            description:
              'Patient-centric telehealth platform serving over 2 million users across Europe.',
            tag: 'Healthcare',
          },
          {
            title: 'Vertex Real Estate',
            description:
              'Immersive property platform with 3D tours and AI-powered matching algorithms.',
            tag: 'Real Estate',
          },
        ]

    const ArrowRight = () => (
      <svg
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
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
    )

    return (
      <section
        className={cn(
          'overflow-hidden border-b-2 border-foreground bg-muted/40 py-14 sm:py-20 lg:py-28',
          props.className,
        )}
      >
        <Container size="xl" className="px-6">
          <div className="mb-12 flex flex-col justify-between gap-6 sm:mb-16 md:flex-row md:items-end">
            <div>
              <MonoTag aria-hidden="true">04 / Selected work</MonoTag>
              <SectionHeading
                align="left"
                title={heading}
                subtitle={description}
                className="mt-3 gap-3"
                titleClassName="text-4xl font-black uppercase leading-[0.95] tracking-tighter sm:text-6xl"
                subtitleClassName="max-w-xl text-base text-muted-foreground sm:text-lg"
              />
            </div>
            <NavbarRouteLink
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-none border-2 border-foreground bg-background px-6 py-3 font-mono text-xs font-bold uppercase tracking-[0.18em] text-foreground shadow-[4px_4px_0_0] shadow-foreground transition-all duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0] hover:shadow-foreground active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              href={viewAll}
            >
              {viewAll} <ArrowRight />
            </NavbarRouteLink>
          </div>

          <PortfolioGrid
            cols="1-md-2"
            className="gap-10 sm:gap-x-10 sm:gap-y-12 md:gap-x-12"
          >
            {items.map((proj, i) => (
              <PortfolioItem
                key={proj.title}
                className={cn(
                  'block w-full cursor-pointer',
                  i % 2 === 1 && 'md:translate-y-12',
                )}
                asChild
              >
                <NavbarRouteLink href={proj.title}>
                  <div
                    className={cn(
                      'relative border-2 border-foreground bg-background shadow-[8px_8px_0_0] shadow-foreground transition-all duration-150 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:shadow-[12px_12px_0_0] group-hover:shadow-foreground',
                      i % 2 === 0 ? 'rotate-[0.4deg]' : '-rotate-[0.4deg]',
                    )}
                  >
                    <PortfolioTag className="absolute -top-3.5 right-4 z-10 inline-flex rotate-3 items-center whitespace-nowrap rounded-full border-2 border-foreground bg-background px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-foreground shadow-[3px_3px_0_0] shadow-foreground sm:right-6">
                      {proj.tag}
                    </PortfolioTag>
                    <PortfolioMedia
                      aspect="4-3"
                      className="rounded-none border-b-2 border-foreground"
                    >
                      <Image
                        alt={proj.title}
                        w={800}
                        h={600}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                      <div className="absolute inset-x-0 bottom-0 flex opacity-0 transition-opacity group-hover:opacity-100">
                        <span className="inline-flex items-center gap-2 border-r-2 border-t-2 border-foreground bg-foreground px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-background">
                          View case study
                        </span>
                      </div>
                    </PortfolioMedia>
                    <PortfolioCaption className="flex items-start gap-4 p-5 sm:p-6">
                      <MonoTag
                        aria-hidden="true"
                        className="mt-1 shrink-0 text-foreground/40"
                      >
                        {String(i + 1).padStart(2, '0')}
                      </MonoTag>
                      <div>
                        <h3 className="mb-2 text-xl font-black uppercase tracking-tight underline-offset-4 group-hover:underline group-hover:decoration-primary group-hover:decoration-4 sm:text-2xl">
                          {proj.title}
                        </h3>
                        <p className="text-sm text-muted-foreground sm:text-base">
                          {proj.description}
                        </p>
                      </div>
                    </PortfolioCaption>
                  </div>
                </NavbarRouteLink>
              </PortfolioItem>
            ))}
          </PortfolioGrid>
        </Container>
      </section>
    )
  },
})
