import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { ProgramGrid, ProgramCard } from '#/section-kit/ProgramGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { cn } from '#/lib/utils.ts'

export const UniversityPrograms = defineCapsule({
  name: 'UniversityPrograms',
  description:
    "Bespoke degree-program showcase for the University page family with a prestigious, collegiate aesthetic. Opens with a SectionHeading, then lays out a responsive grid of program cards — each naming a school, a degree, and a short blurb, with a per-card 'Explore program' link routed via useNavigate. Card and border tokens give each program a refined, catalog-style frame. Use to summarize flagship academic offerings across colleges on a university homepage.",
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    subheading: z.string().optional(),
    programs: z
      .array(
        z.object({
          school: z.string().optional(),
          degree: z.string().optional(),
          blurb: z.string().optional(),
        }),
      )
      .optional(),
    linkLabel: z.string().optional(),
    linkTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const eyebrow = props.eyebrow ?? 'Academics'
    const heading = props.heading ?? 'Programs that shape leaders'
    const subheading =
      props.subheading ??
      'Choose from more than 120 degree programs across our colleges, each taught by faculty at the frontier of their field.'
    const linkLabel = props.linkLabel ?? 'Explore program'
    const linkTarget = props.linkTarget ?? 'Academics'
    const programs = props.programs?.length
      ? props.programs
      : [
          {
            school: 'School of Engineering',
            degree: 'B.S. Computer Science',
            blurb:
              'Build systems, algorithms, and AI alongside faculty advancing the field, with hands-on lab and research opportunities from year one.',
          },
          {
            school: 'College of Arts & Sciences',
            degree: 'B.A. Economics',
            blurb:
              'Study markets, policy, and human behavior with a rigorous quantitative core and seminars led by published researchers.',
          },
          {
            school: 'School of Life Sciences',
            degree: 'B.S. Biology',
            blurb:
              'Explore molecular, organismal, and ecological biology with access to fully equipped wet labs and field stations.',
          },
          {
            school: 'Whitmore School of Business',
            degree: 'B.B.A. Finance',
            blurb:
              'Master corporate finance, markets, and analytics with a curriculum shaped by industry fellows and a trading lab.',
          },
          {
            school: 'School of Public Health',
            degree: 'B.S. Public Health',
            blurb:
              'Tackle epidemiology, health policy, and community wellbeing through coursework paired with field practicums.',
          },
          {
            school: 'College of Humanities',
            degree: 'B.A. History',
            blurb:
              'Investigate the past through primary-source seminars, archival research, and a renowned faculty of historians.',
          },
        ]

    return (
      <section
        className={cn(
          'bg-background py-20 text-foreground sm:py-24',
          props.className,
        )}
      >
        <Container size="xl" className="px-6">
          <SectionHeading
            eyebrow={eyebrow}
            title={heading}
            subtitle={subheading}
          />
          <ProgramGrid cols="1-md-2-3" className="mt-14">
            {programs.map((program, i) => (
              <ProgramCard
                key={`${program.degree ?? 'program'}-${i}`}
                variant="default"
                className="flex flex-col rounded-2xl p-7 text-card-foreground transition hover:border-primary/40 hover:shadow-lg"
              >
                <p className="font-serif text-sm font-semibold uppercase tracking-wide text-primary">
                  {program.school}
                </p>
                <h3 className="mt-2 text-xl font-semibold text-card-foreground">
                  {program.degree}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-6 text-muted-foreground">
                  {program.blurb}
                </p>
                <button
                  type="button"
                  onClick={() => go(linkTarget)}
                  className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-primary transition hover:gap-2"
                >
                  {linkLabel}
                  <span aria-hidden="true">→</span>
                </button>
              </ProgramCard>
            ))}
          </ProgramGrid>
        </Container>
      </section>
    )
  },
})
