import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { CtaBand } from '#/section-kit/CtaBand.tsx'

/**
 * MembershipClubCta — full-width primary-surface conversion CTA for a private
 * membership club / exclusive community page. A centered narrow column on the
 * inverted primary surface: a thin display heading, a relaxed supporting line,
 * dual rounded-pill CTAs (solid light primary + outlined secondary) and a small
 * contact footnote (with email) below. CTAs route through useNavigate. Use as the
 * closing "Ready to join" band for members clubs, professional networks, founders
 * communities, mastermind groups or paid community subscriptions. Renders fully
 * with no props.
 */
export const MembershipClubCta = defineCapsule({
  name: 'MembershipClubCta',
  description:
    "Full-width primary-surface conversion CTA for a private membership club / exclusive community page: a centered narrow column on the inverted primary surface with a thin display heading, a relaxed supporting line, dual rounded-pill CTAs (solid light primary + outlined secondary) and a small contact footnote (with email) below. CTAs route through useNavigate. Use as the closing 'Ready to join' band for members clubs, professional networks, founders communities, mastermind groups or paid community subscriptions.",
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    primaryCta: z.string().optional(),
    secondaryCta: z.string().optional(),
    /** Contact email surfaced in the footnote. */
    email: z.string().optional(),
    footnote: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Ready to join us?'
    const description =
      props.description ??
      "Applications are reviewed on a rolling basis. We keep membership intentionally small to preserve the quality of connections. Join 487 members who've found their people."
    const primaryCta = props.primaryCta ?? 'Apply for Membership'
    const secondaryCta = props.secondaryCta ?? 'Contact Us'
    const email = props.email ?? 'hello@theguild.club'
    const footnote =
      props.footnote ??
      `Questions? Email us at ${email} — we reply within 24 hours.`

    return (
      <CtaBand
        tone="primary"
        eyebrow={footnote}
        title={heading}
        subtitle={description}
        actions={[
          { label: primaryCta, target: primaryCta, variant: 'primary' },
          { label: secondaryCta, target: secondaryCta, variant: 'outline' },
        ]}
        className={props.className}
      />
    )
  },
})
