import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'

/**
 * MembershipClubSteps — 3-step "How it works" application flow for a private
 * membership club / exclusive community page. A centered eyebrow + thin heading +
 * supporting line sit above a responsive 3-column grid of steps, each led by a
 * numbered primary circle followed by a medium title and a relaxed description.
 * Use to explain the join / application process for members clubs, professional
 * networks, mastermind groups or curated communities. Renders fully with no props.
 */
export const MembershipClubSteps = defineComponent({
  name: 'MembershipClubSteps',
  description:
    "3-step 'How it works' application flow for a private membership club / exclusive community page: a centered eyebrow + thin heading + supporting line above a responsive 3-column grid of steps, each led by a numbered primary circle followed by a medium title and a relaxed description. Use to explain the join / application process for members clubs, professional networks, mastermind groups or curated communities.",
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
      <section
        className={cn('w-full bg-background py-20 lg:py-32', props.className)}
        aria-labelledby="steps-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-3xl text-center lg:mb-24">
            <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
              {eyebrow}
            </p>
            <h2
              id="steps-heading"
              className="mb-6 text-3xl font-light text-foreground sm:text-4xl"
            >
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3 lg:gap-16">
            {items.map((step, i) => (
              <div key={step.title} className="text-center md:text-left">
                <div className="mx-auto mb-6 grid size-12 place-items-center rounded-full bg-primary text-lg font-medium text-primary-foreground md:mx-0">
                  {i + 1}
                </div>
                <h3 className="mb-3 text-xl font-medium text-foreground">
                  {step.title}
                </h3>
                <p className="leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
