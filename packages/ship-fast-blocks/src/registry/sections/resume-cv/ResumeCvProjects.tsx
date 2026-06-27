import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'

/**
 * ResumeCvProjects — selected-work grid for a personal resume / CV / portfolio
 * site. A left-aligned `SectionHeading` ("Projects" / "Selected work") leads
 * into a responsive grid of project cards, each with a rounded thumbnail photo,
 * a title, a short description, a row of token tag chips, and a routable "Case
 * study" link. Every card link navigates through useNavigate so none is a dead
 * link. Clean, minimal, and portfolio-style. Use on a personal portfolio,
 * online résumé, or professional profile page to showcase recent work. Renders
 * fully with no props via baked-in defaults.
 */
export const ResumeCvProjects = defineCapsule({
  name: 'ResumeCvProjects',
  description:
    "Selected-work grid for a personal resume / CV / portfolio site: a left-aligned SectionHeading ('Projects' / 'Selected work') leads into a responsive grid of project cards, each with a rounded thumbnail photo, a title, a short description, a row of token tag chips, and a routable 'Case study' link. Every card link navigates through useNavigate. Clean, minimal, portfolio-style. Use on a personal portfolio, online résumé, or professional profile page to showcase recent work.",
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
    const go = useNavigate()
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
      <section className={cn('bg-background', props.className)}>
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-28">
          <SectionHeading
            align="left"
            eyebrow={props.eyebrow}
            title={props.heading ?? 'Projects'}
            subtitle={props.subheading ?? 'Selected work'}
          />

          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
            {projects.map((project, i) => (
              <article
                key={i}
                className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card"
              >
                <div className="overflow-hidden bg-muted">
                  <Image
                    alt={project.imageAlt}
                    w={800}
                    h={500}
                    loading="lazy"
                    className="aspect-[16/10] size-full object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-lg font-semibold text-card-foreground">
                    {project.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {project.description}
                  </p>
                  {project.tags?.length ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {project.tags.map((tag, j) => (
                        <span
                          key={j}
                          className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <div className="mt-6 pt-2">
                    <button
                      type="button"
                      onClick={() => go(project.target ?? 'Projects')}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                    >
                      {project.linkLabel ?? 'Case study'}
                      <span aria-hidden="true">&rarr;</span>
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
