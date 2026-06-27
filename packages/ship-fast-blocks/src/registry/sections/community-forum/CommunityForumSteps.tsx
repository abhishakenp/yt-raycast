import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

/**
 * CommunityForumSteps — numbered step timeline for a community-platform / discussion-forum
 * landing page. A centered heading + description above a responsive 3-column timeline of
 * numbered steps; each step has a primary-colored number circle, a title, and a description.
 * A thin connector line runs between steps on desktop. No links — instructional / persuasive
 * only. Use as the "how it works" / "get started" section for community platforms, SaaS onboarding
 * flows, or product walkthroughs.
 */
export const CommunityForumSteps = defineCapsule({
  name: 'CommunityForumSteps',
  description:
    "Numbered step timeline for a community-platform / discussion-forum landing page: a centered heading and description above a responsive 3-column timeline of numbered steps, each with a primary-colored number circle, a title, and a description; a thin connector line runs between steps on desktop. No links — instructional / persuasive only. Use as the 'how it works' / 'get started' section for community platforms, SaaS onboarding flows, or product walkthroughs.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Step items: title + description. */
    items: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Launch your community in minutes'
    const description =
      props.description ??
      'From zero to thriving community in three simple steps.'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Create your space',
            description:
              'Choose your community name, customize the look and feel, and set up your initial topic categories. No technical skills required.',
          },
          {
            title: 'Invite your people',
            description:
              'Send invitation links, import your existing mailing list, or make your community discoverable. Set membership rules that work for you.',
          },
          {
            title: 'Start conversations',
            description:
              'Post your first discussion topic, welcome new members, and watch your community flourish with meaningful exchanges.',
          },
        ]

    return (
      <section className={cn('py-24 lg:py-32', props.className)}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
            {items.map((step, i) => (
              <div key={step.title} className="relative">
                <div className="mb-6 flex size-12 items-center justify-center rounded-xl bg-primary font-bold text-primary-foreground">
                  {i + 1}
                </div>
                <h3 className="mb-3 text-xl font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
                {i < items.length - 1 && (
                  <div
                    aria-hidden="true"
                    className="absolute left-full top-6 hidden h-px w-full -translate-x-6 bg-border md:block"
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
