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
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
export const PortfolioDevProjects = defineCapsule({
  name: 'PortfolioDevProjects',
  description:
    'Editorial selected-work grid for a developer portfolio built as staggered work plates. A mono meta rule (Work / tabular project count) sits above a left-aligned oversized heading and lede, then a responsive grid of sharp-cornered project cards on an alternating ±translate stagger — each plate carries a mono index numeral, an alt-driven thumbnail Image, a title, a short description, a monospace tech-tag chip row, and mono `>` prompt Live / Code links that route via section-kit route links, with a hard offset shadow and mechanical press feedback on hover/press. Token-only styling with mono accents, no hardcoded colors. Ideal for developer, engineer, and freelancer portfolios showcasing shipped projects.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    subheading: z.string().optional(),
    projects: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
          imageAlt: z.string().optional(),
          tags: z.array(z.string()).optional(),
          liveTarget: z.string().optional(),
          codeTarget: z.string().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Work'
    const heading = props.heading ?? 'Selected projects'
    const subheading =
      props.subheading ??
      "A few things I've designed, built, and shipped recently."
    const projects = props.projects?.length
      ? props.projects
      : [
          {
            title: 'Lakebed Analytics',
            description:
              'A real-time analytics dashboard processing millions of events a day with sub-second query latency.',
            imageAlt:
              'analytics dashboard with charts and live event stream on a dark developer console',
            tags: ['Next.js', 'TypeScript', 'ClickHouse'],
            liveTarget: 'Work',
            codeTarget: 'Work',
          },
          {
            title: 'Shipfast CLI',
            description:
              'An open-source developer CLI that scaffolds, tests, and deploys full-stack apps in one command.',
            imageAlt:
              'terminal window running a developer command line tool with colored output',
            tags: ['Node.js', 'Rust', 'OSS'],
            liveTarget: 'Work',
            codeTarget: 'Work',
          },
          {
            title: 'Atlas Payments',
            description:
              'A PCI-compliant payments API handling subscriptions, invoicing, and global payouts at scale.',
            imageAlt: 'clean payments API documentation page with code samples',
            tags: ['Go', 'Postgres', 'Stripe'],
            liveTarget: 'Work',
            codeTarget: 'Work',
          },
        ]

    return (
      <section
        className={cn(
          'relative overflow-hidden bg-background pt-28 pb-20 sm:pt-32 sm:pb-24',
          props.className,
        )}
      >
        <Container size="xl" className="px-6">
          <div className="mb-8 flex items-center justify-between gap-4 border-b border-border pb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            <span className="flex items-center gap-3">
              <span aria-hidden="true" className="size-2 bg-primary" />
              {eyebrow}
            </span>
            <span className="tabular-nums">
              {String(projects.length).padStart(2, '0')} shipped
            </span>
          </div>
          <div className="max-w-3xl">
            <h2 className="text-4xl font-extrabold leading-[0.95] tracking-tighter text-foreground sm:text-5xl">
              {heading}
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              {subheading}
            </p>
          </div>
          <PortfolioGrid
            cols="1-2-3"
            className="mt-12 items-start gap-6 sm:gap-7"
          >
            {projects.map((project, i) => (
              <PortfolioItem
                asChild
                key={project.title}
                className={cn(
                  'overflow-hidden rounded-none border border-border bg-card text-card-foreground transition-[transform,box-shadow,border-color] duration-150 hover:-translate-y-1 hover:border-foreground/30 hover:shadow-[6px_6px_0_0] hover:shadow-foreground active:translate-y-0 active:shadow-none motion-reduce:transform-none',
                  i % 2 === 1 && 'md:translate-y-10',
                )}
              >
                <article>
                  <PortfolioMedia
                    aspect="16-10"
                    className="w-full border-b border-border"
                  >
                    <Image
                      alt={project.imageAlt ?? project.title}
                      w={640}
                      h={400}
                      className="h-full w-full object-cover"
                    />
                    <span
                      aria-hidden="true"
                      className="absolute left-3 top-3 bg-background/90 px-2 py-0.5 font-mono text-[11px] font-semibold tabular-nums tracking-[0.1em] text-foreground"
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </PortfolioMedia>
                  <PortfolioCaption className="flex-1 gap-3 p-6">
                    <h3 className="text-lg font-bold tracking-tight text-card-foreground">
                      {project.title}
                    </h3>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {project.description}
                    </p>
                    {project.tags?.length ? (
                      <div className="flex flex-wrap gap-2">
                        {project.tags.map((tag) => (
                          <PortfolioTag
                            key={tag}
                            className="rounded-none border border-border bg-muted px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground"
                          >
                            {tag}
                          </PortfolioTag>
                        ))}
                      </div>
                    ) : null}
                    <div className="mt-auto flex gap-5 border-t border-border pt-4 font-mono text-xs uppercase tracking-[0.12em]">
                      <NavbarRouteLink
                        className="font-semibold text-primary hover:underline"
                        href={project.liveTarget ?? 'Work'}
                      >
                        <span aria-hidden="true" className="text-primary/60">
                          {'> '}
                        </span>
                        Live
                      </NavbarRouteLink>
                      <NavbarRouteLink
                        className="font-semibold text-muted-foreground hover:text-foreground"
                        href={project.codeTarget ?? 'Work'}
                      >
                        <span
                          aria-hidden="true"
                          className="text-muted-foreground/60"
                        >
                          {'> '}
                        </span>
                        Code
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
