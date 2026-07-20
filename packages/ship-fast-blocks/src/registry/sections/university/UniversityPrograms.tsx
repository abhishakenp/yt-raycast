import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { ProgramGrid, ProgramCard } from '#/section-kit/ProgramGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { cn } from '#/lib/utils.ts'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
export const UniversityPrograms = defineCapsule({
  name: 'UniversityPrograms',
  description:
    "Editorial-academic degree-program index for the University page family, laid out as a university-catalog ledger. An asymmetric header pairs a left-aligned mono eyebrow + serif heading + lede with a mono program count on the right, over a collapsed-border grid whose cells share hairline rules. Each cell is numbered like a course index (mono 'PROG 01') with a giant ghost numeral watermark, a mono uppercase school label, a serif degree title, a short blurb, and a per-card 'Explore program' link (with press/gap feedback) routed via section-kit route links. Binary sharp corners throughout. Use to summarize flagship academic offerings across colleges on a university homepage.",
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
          <div className="flex flex-col gap-6 border-b border-border pb-8 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              align="left"
              eyebrow={eyebrow}
              title={heading}
              subtitle={subheading}
              className="max-w-2xl gap-3"
              titleClassName="font-serif text-4xl font-semibold tracking-tight text-foreground sm:text-5xl"
              subtitleClassName="max-w-xl text-muted-foreground md:text-base"
            />
            <p
              aria-hidden="true"
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] tabular-nums text-muted-foreground"
            >
              {String(programs.length).padStart(2, '0')} programs · index
            </p>
          </div>
          <ProgramGrid
            cols="1-md-2-3"
            className="mt-0 gap-0 border-l border-t border-border"
          >
            {programs.map((program, i) => (
              <ProgramCard
                key={`${program.degree ?? 'program'}-${i}`}
                variant="none"
                className="relative flex flex-col rounded-none border-b border-r border-border bg-card p-7 text-card-foreground transition-colors duration-150 hover:bg-muted/40"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute right-4 top-3 select-none font-serif text-6xl font-semibold leading-none tabular-nums text-foreground/[0.06]"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
                  Prog {String(i + 1).padStart(2, '0')}
                </p>
                <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  {program.school}
                </p>
                <h3 className="mt-1 font-serif text-xl font-semibold tracking-tight text-card-foreground">
                  {program.degree}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-6 text-muted-foreground">
                  {program.blurb}
                </p>
                <NavbarRouteLink
                  className="mt-6 inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-primary transition-[gap] duration-150 hover:gap-3"
                  href={linkTarget}
                >
                  {linkLabel}
                  <span aria-hidden="true">→</span>
                </NavbarRouteLink>
              </ProgramCard>
            ))}
          </ProgramGrid>
        </Container>
      </section>
    )
  },
})
