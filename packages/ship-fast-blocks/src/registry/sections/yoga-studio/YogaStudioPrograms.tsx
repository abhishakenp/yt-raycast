import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { ProgramGrid, ProgramCard } from '#/section-kit/ProgramGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'

/**
 * YogaStudioPrograms — collapsed-border class-types ledger for a yoga-studio
 * page. On a soft muted wash with a giant lowercase ghost watermark word: an
 * asymmetric left-aligned header (mono index eyebrow + calm clean-sans heading +
 * grounding intro, mono class-count meta on the right) sits above a
 * collapsed-border grid of class cells sharing hairline rules — each cell pairs a
 * mono index numeral with a mono level tag, then a clean-sans class name and a
 * short blurb describing the style and who it's for. Use to present the range of
 * practices a studio offers — Vinyasa, Yin, Hot, Restorative, and more. Renders
 * fully with no props via baked-in defaults.
 */
export const YogaStudioPrograms = defineCapsule({
  name: 'YogaStudioPrograms',
  description:
    'Collapsed-border class-types ledger for a yoga-studio page: a soft muted wash with a giant lowercase ghost watermark word, an asymmetric left-aligned header (mono index eyebrow + calm clean-sans heading + grounding intro, mono class-count meta right) above a collapsed-border grid of class cells sharing hairline rules — each cell pairs a mono index numeral with a mono level tag, then a clean-sans class name and a short blurb. Use to present the range of practices a studio offers — Vinyasa, Yin, Hot, Restorative, and more.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting intro under the heading. */
    subheading: z.string().optional(),
    /** Class-type entries shown in the grid. */
    programs: z
      .array(
        z.object({
          name: z.string(),
          level: z.string(),
          description: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Classes for every body'
    const subheading =
      props.subheading ??
      'From sweaty and strong to slow and soft — find the practice that meets you today.'
    const programs = props.programs?.length
      ? props.programs
      : [
          {
            name: 'Vinyasa Flow',
            level: 'All Levels',
            description:
              'A breath-led, dynamic practice linking movement to breath to build heat, strength, and ease.',
          },
          {
            name: 'Yin & Stretch',
            level: 'Beginner',
            description:
              'Long, gentle holds that open deep connective tissue and invite the nervous system to settle.',
          },
          {
            name: 'Hot Power',
            level: 'Intermediate',
            description:
              'A heated, athletic flow designed to build stamina, focus, and full-body strength.',
          },
          {
            name: 'Restorative',
            level: 'All Levels',
            description:
              'Fully supported poses with props for deep rest, recovery, and complete relaxation.',
          },
          {
            name: 'Slow Flow Foundations',
            level: 'Beginner',
            description:
              'A grounded, well-paced class breaking down alignment so newcomers feel confident and safe.',
          },
          {
            name: 'Meditation & Breathwork',
            level: 'All Levels',
            description:
              'Guided breath and stillness practices to calm the mind and reconnect with the present.',
          },
        ]

    return (
      <section
        className={cn(
          'relative overflow-hidden bg-muted/30 pt-28 pb-20 lg:pt-32 lg:pb-28',
          props.className,
        )}
        aria-labelledby="yoga-programs-heading"
      >
        <Watermark className="-top-6 right-2 text-[6rem] font-semibold tracking-tight sm:text-[9rem] lg:text-[13rem]">
          flow
        </Watermark>
        <Container size="xl" className="relative px-6">
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-16">
            <div className="max-w-2xl">
              <MonoTag className="mb-4 block">02 / The Practice</MonoTag>
              <h2
                id="yoga-programs-heading"
                className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem] lg:leading-[1.08]"
              >
                {heading}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">{subheading}</p>
            </div>
            <MonoTag
              aria-hidden="true"
              tone="faint"
              className="shrink-0 md:pb-2"
            >
              {String(programs.length).padStart(2, '0')} / classes
            </MonoTag>
          </div>

          <ProgramGrid
            cols="1-md-2-3"
            className="gap-0 border-l border-t border-border"
          >
            {programs.map((program, i) => (
              <ProgramCard
                key={program.name}
                variant="none"
                className="group rounded-none border-b border-r border-border bg-background/40 p-6 transition-colors duration-150 hover:bg-background lg:p-8"
              >
                <div className="mb-5 flex items-center justify-between gap-3">
                  <span className="font-mono text-[11px] font-normal uppercase tracking-[0.2em] text-primary tabular-nums">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="border border-border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                    {program.level}
                  </span>
                </div>
                <h3 className="text-xl font-semibold tracking-tight text-foreground">
                  {program.name}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {program.description}
                </p>
              </ProgramCard>
            ))}
          </ProgramGrid>
        </Container>
      </section>
    )
  },
})
