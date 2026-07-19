import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import {
  ServicesGrid,
  ServiceCard,
  ServiceIcon,
  ServiceTitle,
  ServiceDescription,
} from '#/section-kit/ServicesGrid.tsx'

import { Container } from '#/section-kit/Container.tsx'

/**
 * NonprofitServices — programs / causes grid for a nonprofit / charity / NGO
 * page. Thin configuration over the shared `ServicesGrid` composite: a centered
 * heading and supporting subheading above a responsive grid of cause cards,
 * each pairing a small inline line-icon with a program title (Clean Water,
 * Education, Food Security, Healthcare, …) and a short, warm mission blurb. Use
 * to show the core programs, causes, or focus areas a nonprofit, foundation, or
 * humanitarian organization runs. Renders fully with no props via baked-in
 * "Roots of Hope" program defaults.
 */
function Icon({ d, className }: { d: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  )
}

export const NonprofitServices = defineCapsule({
  name: 'NonprofitServices',
  description:
    'Programs / causes grid for a nonprofit / charity / NGO page built on the shared ServicesGrid composite: a centered heading and supporting subheading above a responsive grid of cause cards, each pairing a small inline line-icon with a program title (Clean Water, Education, Food Security, Healthcare, …) and a short, warm mission blurb. Use to show the core programs, causes, or focus areas a nonprofit, foundation, or humanitarian organization runs.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting line under the heading. */
    subheading: z.string().optional(),
    /** Program / cause cards: title + description. */
    programs: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Where your support goes'
    const subheading =
      props.subheading ??
      'Every gift fuels community-led programs that meet people where they are — and help them build a future they choose.'

    const icons = [
      'M12 22c4-4 7-7.5 7-11a7 7 0 0 0-14 0c0 3.5 3 7 7 11z', // water drop
      'M22 10L12 5 2 10l10 5 10-5zM6 12v5c0 1 3 3 6 3s6-2 6-3v-5', // education / cap
      'M12 2a3 3 0 0 0-3 3c0 2 3 5 3 5s3-3 3-5a3 3 0 0 0-3-3zM4 14c0 4 4 8 8 8s8-4 8-8', // food / grain
      'M12 21s-7-4.5-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.5-7 10-7 10z', // health / heart
    ]

    const programs = props.programs?.length
      ? props.programs
      : [
          {
            title: 'Clean Water',
            description:
              'We dig wells and build sustainable water systems so families have safe water close to home — for good.',
          },
          {
            title: 'Education',
            description:
              'Classrooms, books, and teacher training give children the tools to learn, dream, and lift their whole community.',
          },
          {
            title: 'Food Security',
            description:
              'From emergency meals to seeds and farming know-how, we help families grow lasting nourishment and stability.',
          },
          {
            title: 'Healthcare',
            description:
              'Mobile clinics, vaccines, and trained local health workers bring essential care to places it rarely reaches.',
          },
        ]

    const features = programs.map((p, i) => ({
      title: p.title,
      description: p.description,
      icon: <Icon d={icons[i % icons.length]} className="size-6" />,
    }))

    return (
      <section className="pt-28 pb-20 lg:pt-32 lg:pb-28">
        <Container>
          <ServicesGrid
            heading={heading}
            subheading={subheading}
            columns={4}
            className={props.className}
          >
            {features.map((f) => {
              const __iv__ = f as {
                title: string
                description: string
                icon?: React.ReactNode
                points?: string[]
                cta?: string
                price?: string
                imageAlt?: string
              }
              return (
                <ServiceCard key={__iv__.title}>
                  {__iv__.icon && <ServiceIcon>{__iv__.icon}</ServiceIcon>}
                  <ServiceTitle>{__iv__.title}</ServiceTitle>
                  <ServiceDescription>{__iv__.description}</ServiceDescription>
                </ServiceCard>
              )
            })}
          </ServicesGrid>
        </Container>
      </section>
    )
  },
})
