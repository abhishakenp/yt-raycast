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
import { NavbarRouteLink } from '#/section-kit/index.ts'

export const PortfolioDevProjects = defineCapsule({
  name: 'PortfolioDevProjects',
  description:
    'A selected-work project grid for a modern developer portfolio. Renders a SectionHeading (Work / Selected projects) above a responsive grid of project cards, each with an alt-driven thumbnail Image, a title, a short description, a mono tech-tag pill row, and Live / Code links that route via section-kit route links. Token-only styling with mono accents, no hardcoded colors. Ideal for developer, engineer, and freelancer portfolios showcasing shipped projects.',
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
          'bg-background pt-28 pb-20 sm:pt-32 sm:pb-24',
          props.className,
        )}
      >
        <Container size="xl" className="px-6">
          <SectionHeading
            eyebrow={eyebrow}
            title={heading}
            subtitle={subheading}
          />
          <PortfolioGrid cols="1-2-3" className="mt-12">
            {projects.map((project) => (
              <PortfolioItem
                asChild
                key={project.title}
                className="overflow-hidden rounded-xl border border-border bg-card text-card-foreground"
              >
                <article>
                  <PortfolioMedia aspect="16-10" className="w-full">
                    <Image
                      alt={project.imageAlt ?? project.title}
                      w={640}
                      h={400}
                      className="h-full w-full object-cover"
                    />
                  </PortfolioMedia>
                  <PortfolioCaption className="flex-1 gap-3 p-6">
                    <h3 className="text-lg font-semibold text-card-foreground">
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
                            className="rounded-md border border-border bg-muted px-2.5 py-1 font-mono text-xs text-muted-foreground"
                          >
                            {tag}
                          </PortfolioTag>
                        ))}
                      </div>
                    ) : null}
                    <div className="mt-auto flex gap-4 pt-2">
                      <NavbarRouteLink
                        className="text-sm font-semibold text-primary hover:underline"
                        href={project.liveTarget ?? 'Work'}
                      >
                        Live
                      </NavbarRouteLink>
                      <NavbarRouteLink
                        className="text-sm font-semibold text-muted-foreground hover:text-foreground"
                        href={project.codeTarget ?? 'Work'}
                      >
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
