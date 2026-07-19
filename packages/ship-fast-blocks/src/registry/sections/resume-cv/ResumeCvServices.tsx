import { defineCapsule } from '#/capsules/openui.ts'
import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { z } from 'zod/v4'

import {
  ServicesGrid,
  ServiceCard,
  ServiceIcon,
  ServiceTitle,
  ServiceDescription,
} from '#/section-kit/ServicesGrid.tsx'

/**
 * ResumeCvServices — a skills / expertise grid for a personal resume / CV /
 * portfolio site. Thin configuration over the shared `ServicesGrid` composite: a
 * "Skills" heading with a short subheading and a responsive three-column grid of
 * token cards, each pairing an expertise area title (Product Design, Design
 * Systems, User Research, Prototyping, Frontend, Strategy) with a concise
 * description of what that skill covers. Use on a personal portfolio, online
 * résumé, or professional profile page to summarize core competencies. Renders
 * fully with no props via baked-in defaults.
 */
export const ResumeCvServices = defineCapsule({
  name: 'ResumeCvServices',
  description:
    "Skills / expertise grid for a personal resume / CV / portfolio site, built on the shared ServicesGrid composite: a 'Skills' heading with a short subheading and a responsive three-column grid of token cards, each pairing an expertise-area title (Product Design, Design Systems, User Research, Prototyping, Frontend, Strategy) with a concise description of what that skill covers. Use on a personal portfolio, online résumé, or professional profile page to summarize core competencies.",
  props: z.object({
    /** Section heading (maps to ServicesGrid heading). */
    heading: z.string().optional(),
    /** Short supporting line under the heading. */
    subheading: z.string().optional(),
    /** Skill / expertise cards, each a title + description. */
    skills: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    /** Number of grid columns. */
    columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const skills = props.skills?.length
      ? props.skills
      : [
          {
            title: 'Product Design',
            description:
              'End-to-end design of digital products, from problem framing and flows to polished, shippable interfaces.',
          },
          {
            title: 'Design Systems',
            description:
              'Scalable component libraries, tokens, and documentation that keep teams consistent and fast.',
          },
          {
            title: 'User Research',
            description:
              'Interviews, usability testing, and synthesis that ground decisions in real user behavior.',
          },
          {
            title: 'Prototyping',
            description:
              'High-fidelity interactive prototypes for testing ideas and aligning stakeholders quickly.',
          },
          {
            title: 'Frontend',
            description:
              'Comfortable in React and modern CSS, shipping accessible UI and pairing closely with engineers.',
          },
          {
            title: 'Strategy',
            description:
              'Roadmapping, prioritization, and design leadership that connect craft to business outcomes.',
          },
        ]

    return (
      <section
        className={cn(
          'bg-background pt-28 pb-20 lg:pt-32 lg:pb-28',
          props.className,
        )}
      >
        <Container>
          <ServicesGrid
            heading={props.heading ?? 'Skills'}
            subheading={props.subheading ?? 'What I do'}
            columns={props.columns ?? 3}
          >
            {skills.map((f) => {
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
