import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { CtaBand } from '#/section-kit/CtaBand.tsx'

/**
 * WineryBreweryCta — a bold, centered visit-and-join band for a winery or
 * brewery home page. Thin configuration over the shared `CtaBand` composite at
 * `tone="primary"`: an hours eyebrow, a strong serif headline, a short
 * supporting subheading, and a centered row of two routable pill CTAs — a
 * high-contrast "Plan Your Visit" button (variant "primary", auto-inverted on
 * the primary band) plus an outlined "Join the Wine Club" button (variant
 * "outline") that routes to membership. Both actions navigate through the kit's
 * useNavigate so neither is a dead link. Use near the bottom of a winery,
 * vineyard, cellar door, brewery, taproom, or cidery page to drive visits and
 * memberships. Renders fully with no props via warm baked-in defaults.
 */
export const WineryBreweryCta = defineCapsule({
  name: 'WineryBreweryCta',
  description:
    "Bold, centered visit-and-join band for a winery or brewery home page: a full-width section wrapping a strong primary-colored card with an hours eyebrow, a serif headline, a short supporting subheading, and a centered row of two pill CTAs (a high-contrast 'Plan Your Visit' button plus an outlined 'Join the Wine Club' button). Both CTAs route through useNavigate. Use near the bottom of a winery, vineyard, cellar door, brewery, taproom, or cidery page to drive visits and memberships.",
  props: z.object({
    /** Visit headline (maps to CtaBand title). */
    headline: z.string().optional(),
    /** Short supporting line under the headline (maps to CtaBand subtitle). */
    subheading: z.string().optional(),
    /** High-contrast primary CTA label. */
    primaryCta: z.string().optional(),
    /** Route label the primary CTA navigates to. */
    primaryTarget: z.string().optional(),
    /** Outlined secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Route label the secondary CTA navigates to. */
    secondaryTarget: z.string().optional(),
    /** Hours line shown as the band eyebrow. */
    hours: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const headline = props.headline ?? 'Come taste the seasons with us'
    const subheading =
      props.subheading ??
      'Weekend flights fill fast — book your visit, or join the club to have estate pours arrive at your door all year long.'
    const primaryCta = props.primaryCta ?? 'Plan Your Visit'
    const primaryTarget = props.primaryTarget ?? 'Visit'
    const secondaryCta = props.secondaryCta ?? 'Join the Wine Club'
    const secondaryTarget = props.secondaryTarget ?? 'Wines'
    const hours = props.hours ?? 'Tasting room · Thu–Sun · 11am–6pm'

    return (
      <CtaBand
        tone="primary"
        eyebrow={hours}
        title={headline}
        subtitle={subheading}
        actions={[
          { label: primaryCta, target: primaryTarget, variant: 'primary' },
          { label: secondaryCta, target: secondaryTarget, variant: 'outline' },
        ]}
        className={props.className}
      />
    )
  },
})
