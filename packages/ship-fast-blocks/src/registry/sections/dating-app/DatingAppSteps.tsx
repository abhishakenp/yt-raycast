import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import {
  StepTimeline,
  StepTimelineGrid,
  StepItem,
} from '#/section-kit/StepTimeline.tsx'

/**
 * DatingAppSteps — playful-geometric staggered "How it works" band for a
 * dating / matchmaking app. On a muted wash: an asymmetric header
 * (left-aligned extrabold heading + lede, mono "[ 04 ] steps" meta right)
 * above a 2/4-column row of sharp 2px-bordered cards that tilt alternately
 * ±1deg and stagger vertically on wider screens, each carrying a hard 3px
 * offset token shadow, a rounded-full primary number chip beside a mono step
 * index, a bold title, and a description; a giant faint ghost numeral sits
 * behind each card's corner. Use to explain onboarding — create profile,
 * discover matches, start chatting, meet in person — for dating apps, singles
 * platforms, or any product with a simple sign-up-to-outcome flow. Renders
 * fully with no props via baked-in "HeartLink" step defaults.
 */
export const DatingAppSteps = defineCapsule({
  name: 'DatingAppSteps',
  description:
    "Playful-geometric staggered 'How it works' band for a dating / matchmaking app on a muted wash: an asymmetric header (left-aligned extrabold heading + lede, mono step-count meta right) above a 2/4-column row of sharp 2px-bordered cards tilting alternately ±1deg with vertical stagger on wider screens, each with a hard 3px offset shadow, a rounded-full primary number chip beside a mono step index, a bold title, a description, and a giant faint ghost numeral behind its corner. Use to explain onboarding — create profile, discover matches, start chatting, meet in person — for dating apps, singles platforms, or any product with a simple sign-up-to-outcome flow.",
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
      <StepTimeline
        className={cn(
          'overflow-hidden bg-muted/40 py-16 lg:py-24',
          props.className,
        )}
      >
        <Container>
          <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-16">
            <SectionHeading
              align="left"
              title={stepsHeading}
              subtitle={stepsDesc}
              className="max-w-2xl gap-0"
              titleClassName="mb-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl"
              subtitleClassName="text-lg text-muted-foreground"
            />
            <MonoTag aria-hidden="true" tone="faint" className="shrink-0">
              [ {String(stepItems.length).padStart(2, '0')} ] steps
            </MonoTag>
          </div>
          <StepTimelineGrid
            columns={2}
            className="gap-6 pb-6 sm:gap-8 lg:grid-cols-4"
          >
            {stepItems.map((step, i) => (
              <StepItem
                key={step.title}
                className={cn(
                  'relative overflow-hidden border-2 border-foreground bg-card p-6 shadow-[3px_3px_0_0] shadow-foreground',
                  i % 2 === 1 ? 'rotate-1 sm:translate-y-6' : '-rotate-1',
                )}
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-2 -top-4 select-none font-mono text-7xl font-bold tabular-nums leading-none text-foreground/[0.06]"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="flex items-center gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                    {i + 1}
                  </span>
                  <MonoTag tone="muted" className="tabular-nums">
                    Step {String(i + 1).padStart(2, '0')}
                  </MonoTag>
                </div>
                <h3 className="mt-5 text-xl font-bold tracking-tight text-card-foreground">
                  {step.title}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </StepItem>
            ))}
          </StepTimelineGrid>
        </Container>
      </StepTimeline>
    )
  },
})
