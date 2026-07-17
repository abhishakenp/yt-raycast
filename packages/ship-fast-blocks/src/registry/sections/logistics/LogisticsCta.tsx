import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { CtaBand } from '#/section-kit/CtaBand.tsx'

/**
 * LogisticsCta — a high-contrast closing call-to-action band for a global-
 * logistics / freight-forwarding company. A full-width solid primary section with
 * a centered heading, a supporting paragraph, a pair of buttons (a solid
 * background-surface primary with a trailing arrow, plus an outlined secondary)
 * and a small reassurance note. Clean and corporate, inverting the page palette
 * for emphasis. Every button routes through useNavigate. Use as the final
 * conversion prompt for logistics, freight-forwarding, shipping, courier or
 * cargo/transport companies. Renders fully with no props.
 */
export const LogisticsCta = defineCapsule({
  name: 'LogisticsCta',
  description:
    'High-contrast closing call-to-action band for a global-logistics / freight-forwarding company: a full-width solid primary section with a centered heading, a supporting paragraph, a pair of buttons (a solid background-surface primary with a trailing arrow plus an outlined secondary) and a small reassurance note. Clean and corporate, inverting the page palette for emphasis; every button routes through useNavigate. Use as the final conversion prompt for logistics, freight-forwarding, shipping, courier, supply-chain or cargo/transport companies.',
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    primary: z.string().optional(),
    secondary: z.string().optional(),
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Ready to ship smarter?'
    const description =
      props.description ??
      'Join 3,400+ companies that trust SwiftFreight to move their cargo. Get your first quote in under 3 minutes.'
    const primary = props.primary ?? 'Get instant quote'
    const secondary = props.secondary ?? 'Talk to sales'
    const note =
      props.note ??
      'No account required for quotes. Volume discounts available for 50+ shipments/month.'

    return (
      <CtaBand
        tone="primary"
        eyebrow={note}
        title={heading}
        subtitle={description}
        actions={[
          { label: primary, target: primary, variant: 'primary' },
          { label: secondary, target: secondary, variant: 'outline' },
        ]}
        className={props.className}
      />
    )
  },
})
