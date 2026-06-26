import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'

/**
 * EventPlannerProcess — numbered "how we work" process row on a muted band. A
 * centered intro (uppercase eyebrow, thin light heading, lede) above a responsive
 * 2-up/4-up grid of steps, each with a large primary-filled zero-padded numeral
 * circle, a medium-weight title, a relaxed description, and a thin horizontal
 * connector line bridging steps on desktop. Use to explain a planning workflow
 * (Discovery, Design, Planning, Execution) for event/wedding planners or
 * service businesses.
 */
export const EventPlannerProcess = defineComponent({
  name: 'EventPlannerProcess',
  description:
    "Numbered 'how we work' process row on a muted band: a centered intro (uppercase eyebrow, thin light heading, lede) above a responsive 2-up/4-up grid of steps, each with a large primary-filled zero-padded numeral circle, a medium-weight title, a relaxed description, and a thin horizontal connector line bridging steps on desktop. Use to explain a planning workflow (e.g. Discovery, Design, Planning, Execution) for event/wedding planners, agencies, or service businesses.",
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    description: z.string().optional(),
    steps: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const processEyebrow = props.eyebrow ?? 'Our Process'
    const processHeading = props.heading ?? 'How We Work'
    const processDesc =
      props.description ??
      'A proven four-step approach that ensures every event exceeds expectations while respecting your time and vision.'
    const processSteps = props.steps?.length
      ? props.steps
      : [
          {
            title: 'Discovery',
            description:
              'We begin with an in-depth consultation to understand your vision, preferences, budget, and the feeling you want to create. This is where the magic begins.',
          },
          {
            title: 'Design',
            description:
              'Our creative team develops a comprehensive concept including mood boards, color palettes, venue recommendations, and vendor selections tailored to your story.',
          },
          {
            title: 'Planning',
            description:
              'We handle all logistics: contract negotiations, timeline creation, RSVP management, and coordination meetings. You stay informed without the stress.',
          },
          {
            title: 'Execution',
            description:
              'On the big day, we manage every detail from setup to breakdown. You simply enjoy the moment while we ensure everything unfolds perfectly.',
          },
        ]

    return (
      <section
        className={cn(
          'bg-muted px-4 py-20 sm:px-6 lg:px-8 lg:py-32',
          props.className,
        )}
      >
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-16 max-w-3xl text-center lg:mb-24">
            <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
              {processEyebrow}
            </p>
            <h2 className="mb-6 text-3xl font-light text-foreground sm:text-4xl lg:text-5xl">
              {processHeading}
            </h2>
            <p className="text-lg text-muted-foreground">{processDesc}</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {processSteps.map((step, i) => (
              <div key={step.title} className="relative">
                <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-primary text-2xl font-light text-primary-foreground">
                  {String(i + 1).padStart(2, '0')}
                </div>
                <h3 className="mb-3 text-xl font-medium text-foreground">
                  {step.title}
                </h3>
                <p className="leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
                {i < processSteps.length - 1 && (
                  <div
                    aria-hidden="true"
                    className="absolute left-full top-8 hidden h-px w-full -translate-y-1/2 bg-border lg:block"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
