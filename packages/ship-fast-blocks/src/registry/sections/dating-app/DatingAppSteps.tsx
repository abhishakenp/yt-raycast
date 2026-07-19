import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  StepTimeline,
  StepTimelineGrid,
  StepItem,
} from '#/section-kit/StepTimeline.tsx'

/**
 * DatingAppSteps — a 4-step "How it works" numbered timeline for a dating /
 * matchmaking app. Sits on a soft muted band: a centered heading + supporting
 * paragraph above a responsive 1/2/4-column row of steps, each with a large rounded
 * primary number tile, a bold title, and a description; a faint primary gradient
 * connector line links steps on large screens. Use to explain onboarding —
 * create profile, discover matches, start chatting, meet in person — for dating
 * apps, singles platforms, or any product with a simple sign-up-to-outcome flow.
 * Renders fully with no props via baked-in "HeartLink" step defaults.
 */
export const DatingAppSteps = defineCapsule({
  name: 'DatingAppSteps',
  description:
    "4-step 'How it works' numbered timeline for a dating / matchmaking app on a soft muted band: a centered heading + supporting paragraph above a responsive 1/2/4-column row of steps, each with a large rounded primary number tile, a bold title, and a description, with a faint primary gradient connector line between steps on large screens. Use to explain onboarding — create profile, discover matches, start chatting, meet in person — for dating apps, singles platforms, or any product with a simple sign-up-to-outcome flow.",
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    items: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const stepsHeading = props.heading ?? 'How HeartLink works'
    const stepsDesc =
      props.description ?? 'Four simple steps from download to your first date.'
    const stepItems = props.items?.length
      ? props.items
      : [
          {
            title: 'Create your profile',
            description:
              "Sign up in under 2 minutes. Add photos, answer fun prompts, and tell us what you're looking for in a partner.",
          },
          {
            title: 'Discover matches',
            description:
              'Browse curated profiles based on compatibility. Swipe right on people who interest you—left to pass.',
          },
          {
            title: 'Start chatting',
            description:
              "When you both like each other, it's a match! Use our icebreakers to start conversations that go somewhere.",
          },
          {
            title: 'Meet in person',
            description:
              'Feeling the connection? Schedule a date. We suggest safe public spots and let you share plans with friends.',
          },
        ]

    return (
      <StepTimeline className={cn('bg-muted py-24', props.className)}>
        <Container>
          <SectionHeading
            title={stepsHeading}
            subtitle={stepsDesc}
            className="mb-16 max-w-3xl gap-0"
            titleClassName="mb-4 text-3xl font-bold text-foreground sm:text-4xl"
            subtitleClassName="text-lg text-muted-foreground"
          />
          <StepTimelineGrid columns={2} className="gap-8 lg:grid-cols-4">
            {stepItems.map((step, i) => (
              <StepItem key={step.title} className="relative">
                <div className="mb-6 grid size-16 place-items-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground shadow-lg shadow-primary/20">
                  {i + 1}
                </div>
                <h3 className="mb-3 text-xl font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
                {i < stepItems.length - 1 && (
                  <div
                    aria-hidden="true"
                    className="absolute left-full top-8 -z-10 hidden h-0.5 w-full bg-gradient-to-r from-primary/30 to-transparent lg:block"
                  />
                )}
              </StepItem>
            ))}
          </StepTimelineGrid>
        </Container>
      </StepTimeline>
    )
  },
})
