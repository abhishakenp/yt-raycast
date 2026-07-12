import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * CommunityForumContactCta — final dark call-to-action band for a community-platform /
 * discussion-forum landing page. A centered section on a dark foreground background with a
 * large heading, supporting paragraph, dual CTAs (filled primary + outlined secondary), and
 * a trust note beneath. All CTAs route through useNavigate. Use as the closing conversion band
 * for community platforms, SaaS products, or subscription services.
 */
export const CommunityForumContactCta = defineCapsule({
  name: 'CommunityForumContactCta',
  description:
    'Final dark call-to-action band for a community-platform / discussion-forum landing page: a centered section on a dark foreground background with a large heading, a supporting paragraph, dual CTAs (filled primary + outlined secondary), and a trust note beneath. All CTAs route through useNavigate. Use as the closing conversion band for community platforms, SaaS products, or subscription services.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting paragraph. */
    description: z.string().optional(),
    /** Filled primary CTA label. */
    primaryCta: z.string().optional(),
    /** Outlined secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Trust note beneath the CTAs. */
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heading = props.heading ?? 'Ready to build your community?'
    const description =
      props.description ??
      "Join thousands of communities already fostering meaningful conversations on Threadloom. Start free, upgrade when you're ready."
    const primaryCta = props.primaryCta ?? 'Create Free Community'
    const secondaryCta = props.secondaryCta ?? 'Schedule a Demo'
    const note =
      props.note ??
      'Free 14-day trial on all paid plans • No credit card required'

    return (
      <section className={cn('bg-foreground py-24 lg:py-28', props.className)}>
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-6 text-3xl font-bold text-background sm:text-4xl lg:text-5xl">
            {heading}
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-background/70 sm:text-xl">
            {description}
          </p>
          <div className="mb-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              type="button"
              onClick={() => go(primaryCta)}
              className="inline-flex w-full items-center justify-center rounded-lg bg-background px-8 py-4 text-base font-medium text-foreground transition-colors hover:bg-background/90 sm:w-auto"
            >
              {primaryCta}
            </button>
            <button
              type="button"
              onClick={() => go(secondaryCta)}
              className="inline-flex w-full items-center justify-center rounded-lg border border-background/30 px-8 py-4 text-base font-medium text-background transition-colors hover:bg-background/10 sm:w-auto"
            >
              {secondaryCta}
            </button>
          </div>
          <p className="text-sm text-background/60">{note}</p>
        </div>
      </section>
    )
  },
})
