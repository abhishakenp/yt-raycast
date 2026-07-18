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
 * MusicFestivalCta — a dark closing call-to-action band for a music / arts
 * festival landing page. A full-bleed inverted (foreground) centered section
 * with a large headline, a supporting paragraph, dual pill CTAs (get tickets /
 * join mailing list), and a small contact note beneath. Both CTAs route through
 * useNavigate. Use as the final conversion push on music festivals, arts
 * festivals, concert series, or any multi-day ticketed event.
 */
export const MusicFestivalCta = defineCapsule({
  name: 'MusicFestivalCta',
  description:
    'Dark closing call-to-action band for a music / arts festival landing page: a full-bleed inverted (foreground background, light text) centered section with a large headline, a supporting paragraph, dual pill CTAs (get tickets / join mailing list), and a small contact note beneath. Both CTAs route through useNavigate. Use as the final conversion push before the footer on music festivals, arts festivals, concert series, raves, or any multi-day ticketed event.',
  props: z.object({
    /** Headline. */
    heading: z.string().optional(),
    /** Supporting paragraph. */
    description: z.string().optional(),
    /** Primary CTA label. */
    primaryCta: z.string().optional(),
    /** Secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Small contact note beneath the CTAs. */
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heading = props.heading ?? 'Your horizon awaits'
    const description =
      props.description ??
      'Join us August 15-17 for three days that will stay with you forever. Early bird pricing ends soon.'
    const primaryCta = props.primaryCta ?? 'Get Tickets'
    const secondaryCta = props.secondaryCta ?? 'Join Mailing List'
    const note =
      props.note ?? 'Questions? Email us at hello@horizonfestival.com'

    return (
      <CtaBand
        tone="primary"
        className={`bg-foreground text-background ${props.className ?? ''}`}
      >
        <CtaBandInner>
          <CtaBandEyebrow>{note}</CtaBandEyebrow>
          <CtaBandTitle>{heading}</CtaBandTitle>
          <CtaBandSubtitle>{description}</CtaBandSubtitle>
          <CtaBandActions>
            <CtaAction variant="primary" onClick={() => go(primaryCta)}>
              {primaryCta}
            </CtaAction>
            <CtaAction variant="outline" onClick={() => go(secondaryCta)}>
              {secondaryCta}
            </CtaAction>
          </CtaBandActions>
        </CtaBandInner>
      </CtaBand>
    )
  },
})
