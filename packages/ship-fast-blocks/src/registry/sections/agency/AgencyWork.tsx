import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'

/**
 * AgencyWork — selected-work / case-study gallery for a creative digital-agency
 * page, on a subtle muted band. A heading + lead on the left with a "view all"
 * link on the right, above a 2-column grid of clickable project cards: each has
 * a 4:3 alt-driven image that zooms on hover, a "View case study" overlay pill
 * that fades in, a title (color-shifts on hover), a description, and a category
 * tag chip. Every card and the view-all link route through useNavigate. Use to
 * showcase an agency's portfolio, case studies, featured projects, or selected
 * work. Renders fully with no props via four baked-in default projects.
 */
export const AgencyWork = defineComponent({
  name: 'AgencyWork',
  description:
    "Selected-work / case-study gallery for a creative digital-agency page on a subtle muted band: a heading and lead paragraph on the left with a 'view all' link on the right, above a 2-column grid of clickable project cards. Each card has a 4:3 alt-driven image that zooms on hover, a 'View case study' overlay pill that fades in, a title that color-shifts on hover, a description, and a category tag chip. Cards and the view-all link route through useNavigate. Use to showcase an agency's portfolio, case studies, featured projects, or selected work.",
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
    const go = useNavigate()
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
      <section className={cn('bg-muted/30 py-24 sm:py-32', props.className)}>
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <h2 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
                {heading}
              </h2>
              <p className="max-w-xl text-lg text-muted-foreground">
                {description}
              </p>
            </div>
            <button
              type="button"
              onClick={() => go(viewAll)}
              className="inline-flex items-center gap-2 font-medium text-primary transition-colors hover:text-primary/80"
            >
              {viewAll} <ArrowRight />
            </button>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {items.map((proj) => (
              <button
                key={proj.title}
                type="button"
                onClick={() => go(proj.title)}
                className="group block w-full cursor-pointer text-left"
              >
                <div className="relative mb-6 aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
                  <Image
                    alt={proj.title}
                    w={800}
                    h={600}
                    loading="lazy"
                    className="size-full rounded-2xl object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-end rounded-2xl bg-gradient-to-t from-background/60 to-transparent p-6 opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="rounded-full bg-accent/80 px-4 py-2 text-sm font-medium text-accent-foreground backdrop-blur">
                      View case study
                    </span>
                  </div>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="mb-2 text-2xl font-semibold transition-colors group-hover:text-primary">
                      {proj.title}
                    </h3>
                    <p className="text-muted-foreground">{proj.description}</p>
                  </div>
                  <span className="mt-2 whitespace-nowrap rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                    {proj.tag}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
