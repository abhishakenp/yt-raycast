import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * FoodDeliverySteps — playful-bold "how it works" band for a food-delivery /
 * restaurant-marketplace site. An asymmetric header (mono eyebrow + extrabold
 * heading + intro left, a mono "[ 1 · 2 · 3 ]" tag right) above a responsive
 * 3-up grid of chunky 2px-bordered step cards that stagger in a checker rhythm,
 * each led by a rounded-full sticker number badge and a mono step label, then a
 * bold title and a short description, with a hard offset shadow lift on hover.
 * Use to explain the 1-2-3 ordering flow (choose a restaurant, build your order,
 * track and enjoy) for food-delivery apps, restaurant aggregators, or
 * online-ordering platforms. Renders fully with no props via baked-in defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import { StepTimeline, StepTimelineGrid } from '#/section-kit/StepTimeline.tsx'
export const FoodDeliverySteps = defineCapsule({
  name: 'FoodDeliverySteps',
  description:
    "Playful-bold 'how it works' band for a food-delivery / restaurant-marketplace site: an asymmetric header (mono eyebrow + extrabold heading + intro left, mono '[ 1 · 2 · 3 ]' tag right) above a responsive 3-up grid of chunky 2px-bordered step cards staggered in a checker rhythm, each led by a rounded-full sticker number badge and a mono step label, then a bold title and a short description, with a hard offset shadow lift on hover. Use to explain the 1-2-3 ordering flow (choose a restaurant, build your order, track and enjoy) for food-delivery apps, restaurant aggregators, online-ordering platforms, or takeout services.",
  props: z.object({
    /** Centered section heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    description: z.string().optional(),
    /** Ordered steps (title + description); numbered automatically. */
    items: z
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
    const stepsHeading = props.heading ?? 'How it works'
    const stepsDesc =
      props.description ??
      'Getting your favorite food delivered is as easy as 1-2-3.'
    const stepItems = props.items?.length
      ? props.items
      : [
          {
            title: 'Choose your restaurant',
            description:
              'Browse hundreds of local restaurants filtered by cuisine, price, and delivery time to find your perfect match.',
          },
          {
            title: 'Build your order',
            description:
              'Select your dishes, customize toppings and sides, add special instructions, and review your cart.',
          },
          {
            title: 'Track and enjoy',
            description:
              'Watch your order from kitchen prep to doorstep delivery in real-time on our live map.',
          },
        ]
    return (
      <StepTimeline
        className={cn('pt-20 pb-16 lg:pt-28 lg:pb-24', props.className)}
      >
        <Container>
          <div className="mb-12 flex flex-col gap-4 sm:mb-16 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              align="left"
              eyebrow="How it works"
              title={stepsHeading}
              subtitle={stepsDesc}
              className="max-w-2xl gap-3"
              eyebrowClassName="font-mono text-[11px] uppercase tracking-[0.2em] text-primary"
              titleClassName="text-3xl font-extrabold leading-[1.03] tracking-tighter text-foreground sm:text-4xl"
              subtitleClassName="text-lg text-muted-foreground"
            />
            <MonoTag aria-hidden="true" tone="faint" className="shrink-0">
              [ 1 · 2 · 3 ]
            </MonoTag>
          </div>
          <StepTimelineGrid columns={3} className="gap-6 lg:gap-6">
            {stepItems.map((step, i) => (
              <div
                key={step.title}
                className={cn(
                  'group relative rounded-none border-2 border-foreground bg-background p-6 transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0_0] hover:shadow-foreground active:translate-y-px active:shadow-none motion-reduce:transform-none sm:p-7',
                  i % 2 === 1 && 'md:translate-y-8',
                )}
              >
                <div className="mb-5 flex size-14 -rotate-3 items-center justify-center rounded-full border-2 border-foreground bg-primary text-2xl font-extrabold text-primary-foreground shadow-[3px_3px_0_0] shadow-foreground tabular-nums">
                  {i + 1}
                </div>
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  Step {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mb-2 mt-2 text-xl font-extrabold tracking-tight text-foreground">
                  {step.title}
                </h3>
                <p className="leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </StepTimelineGrid>
        </Container>
      </StepTimeline>
    )
  },
})
