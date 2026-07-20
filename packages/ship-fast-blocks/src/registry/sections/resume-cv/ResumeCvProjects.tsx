import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  PortfolioGrid,
  PortfolioItem,
  PortfolioMedia,
  PortfolioCaption,
  PortfolioTag,
} from '#/section-kit/PortfolioGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * ResumeCvProjects — selected-work plates for a personal resume / CV / portfolio
 * site. A mono metadata rail ("03 / SELECTED WORK") and hairline rule lead into
 * an asymmetric, staggered two-column grid of square-edged project plates — each
 * with a giant mono index numeral, an alt-driven thumbnail, a title, a short
 * description, a row of square mono tag chips, and a routable "Case study" link
 * whose arrow slides on hover with press feedback. Alternating plates drop on a
 * staggered rhythm; binary radius, hairline borders, tokens only. Every card link
 * navigates through section-kit route links so none is a dead link. Use on a
 * personal portfolio, online résumé, or professional profile page to showcase
 * recent work. Renders fully with no props via baked-in defaults.
 */
export const ResumeCvProjects = defineCapsule({
  name: 'ResumeCvProjects',
  description:
    "Selected-work plates for a personal resume / CV / portfolio site: a mono '03 / SELECTED WORK' metadata rail and hairline rule above an asymmetric, staggered two-column grid of square-edged project plates, each with a giant mono index numeral, an alt-driven thumbnail, a title, a short description, a row of square mono tag chips, and a routable 'Case study' link whose arrow slides on hover with press feedback. Binary radius, hairline borders, tokens only. Every card link navigates through section-kit route links. Use on a personal portfolio, online résumé, or professional profile page to showcase recent work.",
  props: z.object({
    /** Small eyebrow above the heading. */
    eyebrow: z.string().optional(),
    /** Section heading title. */
    heading: z.string().optional(),
    /** Section subheading. */
    subheading: z.string().optional(),
    /** Project cards, each thumbnail alt + title + description + tags + link. */
    projects: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
          imageAlt: z.string(),
          tags: z.array(z.string()).optional(),
          linkLabel: z.string().optional(),
          target: z.string().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const projects = props.projects?.length
      ? props.projects
      : [
          {
            title: 'Northwind Analytics',
            description:
              'A real-time analytics dashboard redesign that simplified complex data into clear, actionable views.',
            imageAlt:
              'analytics dashboard interface with charts and clean data tables',
            tags: ['Product Design', 'Design System'],
            linkLabel: 'Case study',
            target: 'Projects',
          },
          {
            title: 'Cobalt Patient App',
            description:
              'A mobile onboarding experience for patients that cut drop-off and earned a top app-store rating.',
            imageAlt: 'mobile health app onboarding screens on a smartphone',
            tags: ['Mobile', 'User Research'],
            linkLabel: 'Case study',
            target: 'Projects',
          },
          {
            title: 'Brightside Design System',
            description:
              'A from-scratch component library and documentation site adopted across multiple product teams.',
            imageAlt:
              'design system component library with color tokens and UI components',
            tags: ['Design System', 'Frontend'],
            linkLabel: 'Case study',
            target: 'Projects',
          },
          {
            title: 'Field Ops Console',
            description:
              'An operations console for field technicians that streamlined scheduling and on-site reporting.',
            imageAlt:
              'operations console web interface with schedule and map view',
            tags: ['Web App', 'Strategy'],
            linkLabel: 'Case study',
            target: 'Projects',
          },
        ]

    return (
      <section
        className={cn(
          'relative overflow-hidden bg-background',
          props.className,
        )}
      >
        <Container size="xl" className="relative px-6 py-24 lg:px-6 lg:py-28">
          {/* Mono metadata rail. */}
          <div className="flex items-center gap-4">
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              03 / Selected Work
            </span>
            <span aria-hidden="true" className="h-px flex-1 bg-border" />
          </div>

          <SectionHeading
            align="left"
            eyebrow={props.eyebrow}
            title={props.heading ?? 'Projects'}
            subtitle={props.subheading ?? 'Selected work'}
            className="mt-6 gap-2"
            titleClassName="text-3xl font-extrabold tracking-tighter text-foreground md:text-5xl"
            subtitleClassName="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground"
          />

          <PortfolioGrid cols="1-md-2" className="mt-12 gap-8">
            {projects.map((project, i) => (
              <PortfolioItem
                asChild
                key={i}
                className={cn(
                  'flex flex-col overflow-hidden rounded-none border-2 border-foreground/15 bg-card text-card-foreground',
                  i % 2 === 1 && 'md:mt-14',
                )}
              >
                <article>
                  <PortfolioMedia
                    aspect="16-10"
                    className="border-b-2 border-foreground/15 bg-muted"
                  >
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute left-0 top-0 z-10 select-none bg-foreground px-2.5 py-1 font-mono text-xs font-bold tabular-nums leading-none text-background"
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <Image
                      alt={project.imageAlt}
                      w={800}
                      h={500}
                      loading="lazy"
                      className="size-full object-cover"
                    />
                  </PortfolioMedia>
                  <PortfolioCaption className="flex flex-1 flex-col p-6">
                    <h3 className="text-lg font-extrabold tracking-tight text-card-foreground">
                      {project.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {project.description}
                    </p>
                    {project.tags?.length ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {project.tags.map((tag, j) => (
                          <PortfolioTag
                            key={j}
                            className="rounded-none border border-border bg-transparent px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground"
                          >
                            {tag}
                          </PortfolioTag>
                        ))}
                      </div>
                    ) : null}
                    <div className="mt-6 border-t border-border pt-4">
                      <NavbarRouteLink
                        className="group/link inline-flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-foreground transition-transform duration-150 active:translate-y-px"
                        href={project.target ?? 'Projects'}
                      >
                        {project.linkLabel ?? 'Case study'}
                        <span
                          aria-hidden="true"
                          className="transition-transform duration-150 group-hover/link:translate-x-1"
                        >
                          &rarr;
                        </span>
                      </NavbarRouteLink>
                    </div>
                  </PortfolioCaption>
                </article>
              </PortfolioItem>
            ))}
          </PortfolioGrid>
        </Container>
      </section>
    )
  },
})
