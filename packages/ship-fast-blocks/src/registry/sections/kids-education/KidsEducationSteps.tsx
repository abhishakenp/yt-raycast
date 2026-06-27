import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

/**
 * KidsEducationSteps — playful "how it works" flow for a kids / family learning
 * platform. A centered eyebrow + heading + description intro above a 3-up grid of
 * rounded white step cards on a muted band; each card has a rotating soft-tint
 * numbered badge, a title, a description, and a photo, with large connector
 * arrows between cards on desktop. Use to explain onboarding / get-started flows
 * for kids-education startups, children's e-learning platforms, tutoring
 * services, and family learning apps. Renders fully with no props via baked-in
 * defaults.
 */
export const KidsEducationSteps = defineCapsule({
  name: 'KidsEducationSteps',
  description:
    "Playful 'how it works' flow for a kids / family learning platform: a centered eyebrow + heading + description intro above a 3-up grid of rounded white step cards on a muted band; each card has a rotating soft-tint numbered badge, a title, a description, and a photo, with large connector arrows between cards on desktop. Use to explain onboarding / get-started flows for kids-education startups, children's e-learning platforms, tutoring services, and family learning apps.",
  props: z.object({
    /** Uppercase eyebrow above the heading. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting description under the heading. */
    description: z.string().optional(),
    /** Step cards. */
    items: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
          imageAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'How It Works'
    const heading = props.heading ?? 'Learning Made Simple'
    const description =
      props.description ??
      'Get started in minutes. Our guided approach ensures every child finds activities matched to their interests and level.'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Create a Profile',
            description:
              'Set up personalized profiles for each child. Tell us their age, interests, and learning goals.',
            imageAlt:
              'Parent and child creating a learning profile on a tablet together',
          },
          {
            title: 'Get Recommendations',
            description:
              "Our smart system suggests activities tailored to your child's age, skills, and interests.",
            imageAlt:
              'Tablet screen showing colorful learning app interface with activity recommendations',
          },
          {
            title: 'Learn & Track Progress',
            description:
              'Complete activities, earn badges, and watch skills grow. Parents get detailed progress reports.',
            imageAlt:
              'Child proudly showing completed artwork with achievement badges displayed on screen',
          },
        ]

    const stepTints = [
      'bg-primary/15 text-primary',
      'bg-secondary/15 text-secondary-foreground',
      'bg-accent/15 text-accent-foreground',
    ]

    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    )

    return (
      <section className={cn('bg-muted/40 py-24', props.className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-wider text-secondary">
              {eyebrow}
            </span>
            <h2 className="mb-6 text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
            {items.map((step, i) => (
              <div key={step.title} className="relative">
                <div className="rounded-3xl bg-card p-8 shadow-sm transition-shadow hover:shadow-lg">
                  <div
                    className={cn(
                      'mb-6 grid size-16 place-items-center rounded-2xl',
                      stepTints[i % stepTints.length],
                    )}
                  >
                    <span className="text-2xl font-bold">{i + 1}</span>
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-card-foreground">
                    {step.title}
                  </h3>
                  <p className="mb-6 text-muted-foreground">
                    {step.description}
                  </p>
                  <div className="overflow-hidden rounded-2xl">
                    <Image
                      alt={step.imageAlt}
                      w={400}
                      h={300}
                      loading="lazy"
                      className="h-48 w-full object-cover"
                    />
                  </div>
                </div>
                {i < items.length - 1 && (
                  <div className="absolute top-1/2 -right-6 hidden -translate-y-1/2 md:block lg:-right-8">
                    <ArrowRight className="size-12 text-border" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
