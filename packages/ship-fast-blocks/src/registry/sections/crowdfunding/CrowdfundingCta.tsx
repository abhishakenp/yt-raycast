import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * CrowdfundingCta — a full-width closing CTA band for a crowdfunding / campaign
 * landing page. A bold primary-colored, center-aligned section with a large
 * heading, a supporting subhead, a dual button group (a solid background-filled
 * "Back This Project" primary plus an outlined "Share" secondary), and a small
 * deadline / ship-date note beneath. Buttons route through useNavigate. Use as
 * the final conversion push before the footer on any Kickstarter/Indiegogo-
 * style raise, pre-order, fundraiser, or product launch page.
 */
export const CrowdfundingCta = defineCapsule({
  name: 'CrowdfundingCta',
  description:
    "A full-width closing CTA band for a crowdfunding / campaign landing page: a bold primary-colored, center-aligned section with a large heading, a supporting subhead, a dual button group (a solid background-filled 'Back This Project' primary plus an outlined 'Share' secondary), and a small deadline / ship-date note beneath. Buttons route through useNavigate. Use as the final conversion push before the footer on any Kickstarter/Indiegogo-style raise, pre-order, fundraiser, or product launch page.",
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    primaryCta: z.string().optional(),
    secondaryCta: z.string().optional(),
    note: z.string().optional(),
    /** Navigation target for the primary "Back This Project" CTA. */
    rewardsTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const ctaHeading = props.heading ?? 'Be Part of the Solution'
    const ctaDesc =
      props.description ??
      '12,847 people have already joined us. Every pledge brings EcoBrush closer to production and keeps more plastic out of our oceans.'
    const ctaPrimary = props.primaryCta ?? 'Back This Project — $49'
    const ctaSecondary = props.secondaryCta ?? 'Share This Campaign'
    const ctaNote =
      props.note ??
      'Campaign ends March 15, 2026 at 11:59 PM EST · Ships June 2026'
    const rewardsTarget = props.rewardsTarget ?? 'Rewards'

    return (
      <section
        className={cn(
          'bg-primary py-20 text-primary-foreground lg:py-28',
          props.className,
        )}
      >
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-6 text-3xl font-semibold sm:text-4xl lg:text-5xl">
            {ctaHeading}
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-primary-foreground/80 sm:text-xl">
            {ctaDesc}
          </p>
          <div className="mb-8 flex flex-col justify-center gap-4 sm:flex-row">
            <button
              type="button"
              onClick={() => go(rewardsTarget)}
              className="rounded-xl bg-background px-8 py-4 text-lg font-semibold text-foreground transition-colors hover:bg-background/90"
            >
              {ctaPrimary}
            </button>
            <button
              type="button"
              onClick={() => go(ctaSecondary)}
              className="rounded-xl border-2 border-primary-foreground px-8 py-4 text-lg font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10"
            >
              {ctaSecondary}
            </button>
          </div>
          <p className="text-sm text-primary-foreground/70">{ctaNote}</p>
        </div>
      </section>
    )
  },
})
