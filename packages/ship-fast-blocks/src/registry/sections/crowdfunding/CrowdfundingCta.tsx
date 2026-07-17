import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { CtaBand } from '#/section-kit/CtaBand.tsx'

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
      <CtaBand
        tone="primary"
        eyebrow={ctaNote}
        title={ctaHeading}
        subtitle={ctaDesc}
        actions={[
          { label: ctaPrimary, target: rewardsTarget, variant: 'primary' },
          { label: ctaSecondary, target: ctaSecondary, variant: 'outline' },
        ]}
        className={props.className}
      />
    )
  },
})
