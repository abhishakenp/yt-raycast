import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

/**
 * LawFirmProcess — an asymmetric 7/5 "how we work" process band on the card
 * surface. The left column carries a mono eyebrow, giant serif heading, lead
 * paragraph and a hairline-divided step ledger — each row a mono "Step 0x" case
 * label, a giant serif tabular numeral, a serif title and description; the right
 * column shows a tall portrait photo in a sharp hairline frame with a
 * primary-tinted offset frame block behind it and a rotated hairline-bordered
 * mono "seal" stamp overlapping its corner. Authoritative, traditional-yet-
 * modern newsprint aesthetic with sharp binary corners. Imagery uses the
 * alt-driven Image component. Use to explain a firm's client engagement or
 * matter-handling process on law-firm, attorney, consulting or
 * professional-services pages. Renders fully with no props via baked-in defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { ProcessTimeline } from '#/section-kit/ProcessTimeline.tsx'
export const LawFirmProcess = defineCapsule({
  name: 'LawFirmProcess',
  description:
    "Asymmetric 7/5 'how we work' process band on the card surface: the left column carries a mono eyebrow, giant serif heading, lead paragraph and a hairline-divided step ledger (each row a mono 'Step 0x' case label, a giant serif tabular numeral, a serif title and description); the right column shows a tall portrait photo in a sharp hairline frame with a primary-tinted offset frame block behind it and a rotated hairline-bordered mono 'seal' stamp overlapping its corner. Authoritative, traditional-yet-modern newsprint aesthetic with sharp binary corners; imagery uses the alt-driven Image component. Use to explain a firm's client engagement, intake or matter-handling process on law-firm, attorney, consulting, accounting or professional-services pages.",
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
      <ProcessTimeline
        className={cn(
          'relative overflow-hidden bg-card py-20 sm:py-24 lg:py-28',
          props.className,
        )}
      >
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <SectionHeading
                align="left"
                eyebrow={eyebrow}
                title={heading}
                subtitle={description}
                className="mb-10 gap-0 sm:mb-12"
                eyebrowClassName="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
                titleClassName="mb-6 font-serif text-4xl font-semibold tracking-tight text-foreground lg:text-5xl"
                subtitleClassName="text-lg leading-relaxed text-muted-foreground"
              />
              <div className="border-t border-border">
                {steps.map((step, i) => (
                  <div
                    key={step.title}
                    className="flex gap-5 border-b border-border py-6 sm:gap-8 sm:py-8"
                  >
                    <span
                      aria-hidden="true"
                      className="shrink-0 font-serif text-4xl font-semibold leading-none tabular-nums text-foreground/20 sm:text-5xl"
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="border-l border-border pl-5 sm:pl-8">
                      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
                        Step {String(i + 1).padStart(2, '0')}
                      </span>
                      <h3 className="mb-2 mt-2 font-serif text-xl text-foreground">
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
            <div className="relative lg:col-span-5">
              {/* Primary-tinted offset frame behind the sharp photo plate. */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -translate-x-4 translate-y-4 border border-primary/30 bg-primary/5"
              />
              <Image
                alt={imageAlt}
                w={600}
                h={800}
                loading="lazy"
                className="relative h-[440px] w-full rounded-none border border-foreground/15 object-cover sm:h-[560px]"
              />
              {/* Rotated hairline bar-association-style seal stamp. */}
              <div
                aria-hidden="true"
                className="absolute -right-3 -top-4 grid size-24 -rotate-12 place-items-center rounded-full border border-foreground/25 bg-card text-center font-mono text-[9px] uppercase leading-tight tracking-[0.15em] text-muted-foreground sm:-right-5 sm:size-28"
              >
                <span>
                  Est.
                  <br />
                  1987
                  <br />
                  &middot; Bar &middot;
                </span>
              </div>
            </div>
          </div>
        </Container>
      </ProcessTimeline>
    )
  },
})
