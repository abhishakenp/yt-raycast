import { defineCapsule } from '#/capsules/openui.ts'
import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { z } from 'zod/v4'

import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  ServicesGrid,
  ServiceCard,
  ServiceIcon,
  ServiceTitle,
  ServiceDescription,
} from '#/section-kit/ServicesGrid.tsx'

/**
 * ResumeCvServices — a skills / expertise ledger for a personal resume / CV /
 * portfolio site. A mono metadata rail ("04 / SKILLS") and hairline rule lead
 * into a left-aligned extrabold heading and a responsive grid of open ledger
 * entries — each a top-ruled column pairing a mono index numeral with an
 * expertise-area title (Product Design, Design Systems, User Research,
 * Prototyping, Frontend, Strategy) and a concise description, no icon tiles or
 * boxed cards. Composed on the shared `ServicesGrid` composite; binary radius,
 * hairline rules, tokens only. Use on a personal portfolio, online résumé, or
 * professional profile page to summarize core competencies. Renders fully with
 * no props via baked-in defaults.
 */
export const ResumeCvServices = defineCapsule({
  name: 'ResumeCvServices',
  description:
    "Skills / expertise ledger for a personal resume / CV / portfolio site, composed on the shared ServicesGrid composite: a mono '04 / SKILLS' metadata rail and hairline rule above a left-aligned extrabold heading and a responsive grid of open ledger entries, each a top-ruled column pairing a mono index numeral with an expertise-area title (Product Design, Design Systems, User Research, Prototyping, Frontend, Strategy) and a concise description, no icon tiles or boxed cards. Binary radius, hairline rules, tokens only. Use on a personal portfolio, online résumé, or professional profile page to summarize core competencies.",
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
          'relative overflow-hidden bg-background pt-28 pb-20 lg:pt-32 lg:pb-28',
          props.className,
        )}
      >
        <Container className="relative">
          {/* Giant faint section-index watermark. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-10 right-0 select-none font-extrabold leading-none tracking-tighter text-foreground/[0.04] text-[9rem] sm:text-[13rem]"
          >
            04
          </span>

          {/* Mono metadata rail. */}
          <div className="relative flex items-center gap-4">
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              04 / Skills
            </span>
            <span aria-hidden="true" className="h-px flex-1 bg-border" />
          </div>

          <SectionHeading
            align="left"
            title={props.heading ?? 'Skills'}
            subtitle={props.subheading ?? 'What I do'}
            className="relative mt-6 gap-2"
            titleClassName="text-3xl font-extrabold tracking-tighter text-foreground md:text-5xl"
            subtitleClassName="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground"
          />

          <ServicesGrid
            className="relative mt-14 gap-0"
            columns={props.columns ?? 3}
          >
            {skills.map((f, i) => {
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
                <ServiceCard
                  key={__iv__.title}
                  className="gap-3 rounded-none border-0 border-t-2 border-foreground bg-transparent p-0 pt-5"
                >
                  {__iv__.icon && <ServiceIcon>{__iv__.icon}</ServiceIcon>}
                  <span
                    aria-hidden="true"
                    className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-primary"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <ServiceTitle className="text-lg font-extrabold tracking-tight text-foreground">
                    {__iv__.title}
                  </ServiceTitle>
                  <ServiceDescription className="leading-relaxed text-muted-foreground">
                    {__iv__.description}
                  </ServiceDescription>
                </ServiceCard>
              )
            })}
          </ServicesGrid>
        </Container>
      </section>
    )
  },
})
