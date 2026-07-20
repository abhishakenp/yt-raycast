import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { StepTimeline, StepTimelineGrid } from '#/section-kit/StepTimeline.tsx'

/**
 * MembershipClubSteps — hairline application-flow ledger for a private membership
 * club / exclusive community page. A left-aligned mono micro-label kicker + serif
 * heading + supporting line sit above a responsive 3-column grid of steps, each
 * opening with an oversized serif index numeral over a hairline top rule,
 * followed by a serif title and a relaxed muted description. Use to explain the
 * join / application process for members clubs, professional networks, mastermind
 * groups or curated communities. Renders fully with no props.
 */
export const MembershipClubSteps = defineCapsule({
  name: 'MembershipClubSteps',
  description:
    'Hairline application-flow ledger for a private membership club / exclusive community page: a left-aligned mono micro-label kicker + serif heading + supporting line above a responsive 3-column grid of steps, each opening with an oversized serif index numeral over a hairline top rule, followed by a serif title and a relaxed muted description. Use to explain the join / application process for members clubs, professional networks, mastermind groups or curated communities.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    description: z.string().optional(),
    items: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'How It Works'
    const heading = props.heading ?? 'Joining The Guild'
    const description =
      props.description ??
      'A simple process designed to ensure the right fit for everyone.'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Apply Online',
            description:
              "Complete a 10-minute application sharing your background, interests, and what you're seeking in a community.",
          },
          {
            title: 'Interview',
            description:
              'A casual 20-minute video call with our membership team to learn more about you and answer your questions.',
          },
          {
            title: 'Get Matched',
            description:
              "If accepted, you'll receive your onboarding within 24 hours, including your first 3 curated member introductions.",
          },
        ]

    return (
      <StepTimeline
        className={cn('w-full bg-background py-20 lg:py-28', props.className)}
        aria-labelledby="steps-heading"
      >
        <Container>
          <SectionHeading
            align="left"
            eyebrow={eyebrow}
            title={heading}
            subtitle={description}
            titleId="steps-heading"
            className="mb-14 max-w-3xl gap-4 lg:mb-20"
            eyebrowClassName="font-mono text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground"
            titleClassName="font-serif text-4xl font-normal tracking-tight text-foreground lg:text-5xl"
            subtitleClassName="text-lg leading-relaxed text-muted-foreground"
          />
          <StepTimelineGrid columns={3} className="gap-10 lg:gap-16">
            {items.map((step, i) => (
              <div key={step.title} className="border-t border-border pt-6">
                <span className="font-serif text-5xl font-normal tabular-nums text-foreground">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-5 font-serif text-2xl font-normal text-foreground">
                  {step.title}
                </h3>
                <p className="mt-3 leading-relaxed text-muted-foreground">
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
