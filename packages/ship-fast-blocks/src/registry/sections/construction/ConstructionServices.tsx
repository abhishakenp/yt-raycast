import { defineCapsule } from '#/capsules/openui.ts'
import type { ReactNode } from 'react'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * ConstructionServices — six-up services grid for a construction / general
 * contractor page. A centered section heading above a responsive 1/2/3-column
 * grid of hover-highlight cards; each card has a rounded icon tile (rotating
 * inline line-icons), a title, a description, and a "Learn more" link that
 * routes through useNavigate. Use to present a construction company's
 * offerings — commercial, residential, renovation, project management,
 * design-build, pre-construction. Renders fully with no props via baked-in
 * defaults.
 */
export const ConstructionServices = defineCapsule({
  name: 'ConstructionServices',
  description:
    "Six-up services grid for a construction / general contractor page: a centered section heading above a responsive 1/2/3-column grid of hover-highlight cards, each with a rounded icon tile (rotating inline line-icons), a title, a description, and a 'Learn more' link that routes through useNavigate. Use to present a construction firm's offerings (commercial, residential, renovation, project management, design-build, pre-construction).",
  props: z.object({
    /** Section eyebrow label. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Card link label. */
    cta: z.string().optional(),
    /** Service cards: title + description. */
    items: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const eyebrow = props.eyebrow ?? 'Our Services'
    const heading = props.heading ?? 'Full-service construction solutions'
    const description =
      props.description ??
      'From initial concept to final inspection, we handle every phase of your construction project with precision and care.'
    const cta = props.cta ?? 'Learn more'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Commercial Construction',
            description:
              'Office buildings, retail centers, warehouses, and industrial facilities. Projects from 5,000 to 500,000 square feet.',
          },
          {
            title: 'Residential Building',
            description:
              'Custom homes, multi-family housing, and residential developments. Crafted with attention to every detail.',
          },
          {
            title: 'Renovation & Remodeling',
            description:
              'Transform existing spaces with modern upgrades, structural modifications, and complete interior renovations.',
          },
          {
            title: 'Project Management',
            description:
              'End-to-end oversight including scheduling, budgeting, subcontractor coordination, and quality control.',
          },
          {
            title: 'Design-Build Services',
            description:
              'Integrated design and construction services for streamlined delivery, reduced costs, and faster timelines.',
          },
          {
            title: 'Pre-Construction',
            description:
              'Site analysis, feasibility studies, permitting, budgeting, and value engineering to set your project up for success.',
          },
        ]

    const serviceIcons: ReactNode[] = [
      <svg
        key="building"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5m-4 0h4" />
      </svg>,
      <svg
        key="home"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 0 0 1 1h3m10-11l2 2m-2-2v10a1 1 0 0 1-1 1h-3m-6 0a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1m-6 0h6" />
      </svg>,
      <svg
        key="pencil"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5m-1.414-9.414a2 2 0 1 1 2.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>,
      <svg
        key="cube"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 20l-5.447-2.724A1 1 0 0 1 3 16.382V5.618a1 1 0 0 1 1.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0 0 21 18.382V7.618a1 1 0 0 0-.806-.984A3 3 0 0 0 15 8m-6 4v8m0 0l6-3" />
      </svg>,
      <svg
        key="document"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" />
      </svg>,
      <svg
        key="bolt"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>,
    ]

    const ChevronRight = () => (
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
        <polyline points="9 5 16 12 9 19" />
      </svg>
    )

    return (
      <section className={cn('bg-card py-20 lg:py-28', props.className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {eyebrow}
            </span>
            <h2 className="mb-4 mt-3 text-3xl font-bold text-foreground sm:text-4xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item, i) => (
              <article
                key={item.title}
                className="group rounded-xl bg-muted p-8 transition-colors hover:bg-accent"
              >
                <div className="mb-6 grid size-14 place-items-center rounded-xl bg-foreground text-background">
                  {serviceIcons[i % serviceIcons.length]}
                </div>
                <h3 className="mb-3 text-xl font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mb-4 leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
                <button
                  type="button"
                  onClick={() => go(item.title)}
                  className="inline-flex items-center gap-1 font-medium text-foreground transition-all hover:gap-2"
                >
                  {cta}
                  <ChevronRight />
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
