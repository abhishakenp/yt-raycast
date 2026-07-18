import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

/**
 * LawFirmProcess — a split "how we work" process band on the card surface. The
 * left column carries a tracked-uppercase eyebrow, serif heading, lead
 * paragraph and a vertical list of numbered steps (each a squared
 * primary-filled serif numeral beside a serif title + description); the right
 * column shows a tall portrait photo. Refined, authoritative editorial aesthetic
 * with sharp squared corners. Imagery uses the alt-driven Image component. Use
 * to explain a firm's client engagement or matter-handling process on law-firm,
 * attorney, consulting or professional-services pages. Renders fully with no
 * props via baked-in defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
import { StepTimeline } from '#/section-kit/StepTimeline.tsx'
export const LawFirmProcess = defineCapsule({
  name: 'LawFirmProcess',
  description:
    "Split 'how we work' process band on the card surface: the left column carries a tracked-uppercase eyebrow, serif heading, lead paragraph and a vertical list of numbered steps (each a squared primary-filled serif numeral beside a serif title + description); the right column shows a tall portrait photo. Refined, authoritative editorial aesthetic with sharp squared corners; imagery uses the alt-driven Image component. Use to explain a firm's client engagement, intake or matter-handling process on law-firm, attorney, consulting, accounting or professional-services pages.",
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    description: z.string().optional(),
    imageAlt: z.string().optional(),
    steps: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Our Process'
    const heading = props.heading ?? 'How We Work With Clients'
    const description =
      props.description ??
      'We believe in transparent communication, strategic planning, and relentless execution. Our proven process has delivered successful outcomes for over three decades.'
    const imageAlt =
      props.imageAlt ??
      'Professional attorney in tailored navy suit reviewing documents in modern conference room'
    const steps = props.steps?.length
      ? props.steps
      : [
          {
            title: 'Initial Consultation',
            description:
              'We begin with a confidential, no-obligation consultation to understand your situation, objectives, and concerns. This allows us to assess your needs and explain how we can help.',
          },
          {
            title: 'Strategic Assessment',
            description:
              'Our attorneys conduct a thorough analysis of your legal position, identifying opportunities, risks, and optimal pathways forward. We develop multiple strategic options for your consideration.',
          },
          {
            title: 'Execution & Resolution',
            description:
              'We implement the agreed strategy with precision, keeping you informed at every stage. Our goal is always the most favorable outcome in the shortest time frame possible.',
          },
        ]
    return (
      <StepTimeline className={cn('bg-card py-24 lg:py-28', props.className)}>
        <Container>
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div>
              <p className="mb-4 text-sm uppercase tracking-widest text-muted-foreground">
                {eyebrow}
              </p>
              <h2 className="mb-6 font-serif text-3xl text-foreground lg:text-4xl">
                {heading}
              </h2>
              <p className="mb-12 text-lg leading-relaxed text-muted-foreground">
                {description}
              </p>
              <div className="space-y-10">
                {steps.map((step, i) => (
                  <div key={step.title} className="flex gap-6">
                    <div className="grid size-12 shrink-0 place-items-center bg-primary font-serif text-xl text-primary-foreground">
                      {i + 1}
                    </div>
                    <div>
                      <h3 className="mb-2 font-serif text-xl text-foreground">
                        {step.title}
                      </h3>
                      <p className="leading-relaxed text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <Image
                alt={imageAlt}
                w={600}
                h={800}
                loading="lazy"
                className="h-[600px] w-full rounded-sm object-cover shadow-xl"
              />
            </div>
          </div>
        </Container>
      </StepTimeline>
    )
  },
})
