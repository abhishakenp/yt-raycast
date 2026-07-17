import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { ProgramGrid, ProgramCard } from '#/section-kit/ProgramGrid.tsx'

/**
 * YogaStudioPrograms — class-types grid for a yoga-studio page. A warm
 * background band with a centered heading + intro above a responsive grid of
 * class cards, each showing the class name, a level pill, and a short blurb
 * describing the style and who it's for. Use to present the range of practices
 * a studio offers — Vinyasa, Yin, Hot, Restorative, and more. Renders fully
 * with no props via baked-in defaults.
 */
export const YogaStudioPrograms = defineCapsule({
  name: 'YogaStudioPrograms',
  description:
    "Class-types grid for a yoga-studio page: a warm band with a centered heading + intro above a responsive grid of class cards, each showing the class name, a level pill, and a short blurb describing the style and who it's for. Use to present the range of practices a studio offers — Vinyasa, Yin, Hot, Restorative, and more.",
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
          'bg-muted/40 pt-28 pb-20 lg:pt-32 lg:pb-28',
          props.className,
        )}
        aria-labelledby="yoga-programs-heading"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2
              id="yoga-programs-heading"
              className="mb-4 text-3xl font-bold text-foreground sm:text-4xl"
            >
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{subheading}</p>
          </div>

          <ProgramGrid cols="1-md-2-3">
            {programs.map((program) => (
              <ProgramCard
                key={program.name}
                variant="default"
                rounded="2xl"
                className="flex flex-col p-6 text-card-foreground shadow-sm transition-shadow hover:shadow-md lg:p-8"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-xl font-semibold text-foreground">
                    {program.name}
                  </h3>
                  <span className="whitespace-nowrap rounded-full bg-accent/15 px-3 py-1 text-xs font-medium text-accent">
                    {program.level}
                  </span>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {program.description}
                </p>
              </ProgramCard>
            ))}
          </ProgramGrid>
        </div>
      </section>
    )
  },
})
