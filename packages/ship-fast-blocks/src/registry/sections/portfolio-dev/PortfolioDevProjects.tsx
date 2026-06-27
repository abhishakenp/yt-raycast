import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'

export const PortfolioDevProjects = defineCapsule({
  name: 'PortfolioDevProjects',
  description:
    'A selected-work project grid for a modern developer portfolio. Renders a SectionHeading (Work / Selected projects) above a responsive grid of project cards, each with an alt-driven thumbnail Image, a title, a short description, a mono tech-tag pill row, and Live / Code links that route via useNavigate. Token-only styling with mono accents, no hardcoded colors. Ideal for developer, engineer, and freelancer portfolios showcasing shipped projects.',
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
    const go = useNavigate()
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
      <section className={cn('bg-background py-20 sm:py-24', props.className)}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeading
            eyebrow={eyebrow}
            title={heading}
            subtitle={subheading}
          />
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <article
                key={project.title}
                className="flex flex-col overflow-hidden rounded-xl border border-border bg-card"
              >
                <Image
                  alt={project.imageAlt ?? project.title}
                  w={640}
                  h={400}
                  className="aspect-[16/10] w-full object-cover"
                />
                <div className="flex flex-1 flex-col gap-3 p-6">
                  <h3 className="text-lg font-semibold text-card-foreground">
                    {project.title}
                  </h3>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {project.description}
                  </p>
                  {project.tags?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md border border-border bg-muted px-2.5 py-1 font-mono text-xs text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <div className="mt-auto flex gap-4 pt-2">
                    <button
                      type="button"
                      onClick={() => go(project.liveTarget ?? 'Work')}
                      className="text-sm font-semibold text-primary hover:underline"
                    >
                      Live
                    </button>
                    <button
                      type="button"
                      onClick={() => go(project.codeTarget ?? 'Work')}
                      className="text-sm font-semibold text-muted-foreground hover:text-foreground"
                    >
                      Code
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
