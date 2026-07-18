import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import {
  CtaBand,
  CtaBandInner,
  CtaBandEyebrow,
  CtaBandTitle,
  CtaBandSubtitle,
  CtaBandActions,
  CtaAction,
} from '#/section-kit/CtaBand.tsx'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * TourExperiencesCta — closing call-to-action band for an adventure /
 * guided-tour brand. Composes the shared CtaBand composite on a primary-tone
 * surface with an eyebrow, a bold "Book your adventure" title, a supporting line,
 * and two routable actions (primary "Book a Tour" + outline "Talk to a guide").
 * Use as the conversion band before the footer on tour-operator, expedition, and
 * travel-experience landing pages. Renders fully with no props via baked-in
 * defaults.
 */
export const TourExperiencesCta = defineCapsule({
  name: 'TourExperiencesCta',
  description:
    "Closing call-to-action band for an adventure / guided-tour brand. Composes the shared CtaBand composite on a primary-tone surface with an eyebrow, a bold 'Book your adventure' title, a supporting line, and two routable actions (primary 'Book a Tour' + outline 'Talk to a guide'). Use as the conversion band before the footer on tour-operator, expedition, and travel-experience landing pages.",
  props: z.object({
    /** Eyebrow / kicker above the title. */
    eyebrow: z.string().optional(),
    /** Band title. */
    title: z.string().optional(),
    /** Supporting subtitle line. */
    subtitle: z.string().optional(),
    /** Primary CTA label. */
    primaryCta: z.string().optional(),
    /** Navigation target for the primary CTA. */
    primaryTarget: z.string().optional(),
    /** Secondary (outline) CTA label. */
    secondaryCta: z.string().optional(),
    /** Navigation target for the secondary CTA. */
    secondaryTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    return (
      <CtaBand tone="primary" className={props.className}>
        <CtaBandInner>
          <CtaBandEyebrow>
            {props.eyebrow ?? 'Limited seats each departure'}
          </CtaBandEyebrow>
          <CtaBandTitle>{props.title ?? 'Book your adventure'}</CtaBandTitle>
          <CtaBandSubtitle>
            {props.subtitle ??
              'Lock in your spot on a small-group tour led by local experts. Free cancellation up to 48 hours before you go.'}
          </CtaBandSubtitle>
          <CtaBandActions>
            <CtaAction
              variant="primary"
              onClick={() => go(props.primaryTarget ?? 'Book a Tour')}
            >
              {props.primaryCta ?? 'Book a Tour'}
            </CtaAction>
            <CtaAction
              variant="outline"
              onClick={() => go(props.secondaryTarget ?? 'Contact')}
            >
              {props.secondaryCta ?? 'Talk to a guide'}
            </CtaAction>
          </CtaBandActions>
        </CtaBandInner>
      </CtaBand>
    )
  },
})
