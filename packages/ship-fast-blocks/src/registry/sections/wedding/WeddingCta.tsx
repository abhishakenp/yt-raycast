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
import { NavbarRouteLink } from '#/section-kit/index.ts'

export const WeddingCta = defineCapsule({
  name: 'WeddingCta',
  description:
    'Closing RSVP call-to-action band for a wedding site, built on the shared CtaBand composite with a primary surface: an RSVP-by eyebrow, a warm headline inviting guests to respond, a heartfelt subtitle, and two routable actions (RSVP plus View Details). Use near the end of a wedding invitation or celebration page to prompt guests to confirm their attendance.',
  props: z.object({
    headline: z.string().optional(),
    subheading: z.string().optional(),
    rsvpBy: z.string().optional(),
    primaryCta: z.string().optional(),
    primaryTarget: z.string().optional(),
    secondaryCta: z.string().optional(),
    secondaryTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    return (
      <CtaBand tone="primary" className={props.className}>
        <CtaBandInner>
          <CtaBandEyebrow>
            {props.rsvpBy ?? 'Kindly respond by August 1, 2025'}
          </CtaBandEyebrow>
          <CtaBandTitle>
            {props.headline ?? 'Join us — RSVP by August 1'}
          </CtaBandTitle>
          <CtaBandSubtitle>
            {props.subheading ??
              "Nothing would mean more than celebrating this day with you. Let us know you're coming so we can save you a seat at the table."}
          </CtaBandSubtitle>
          <CtaBandActions>
            <CtaAction variant="primary" asChild>
              <NavbarRouteLink href={props.primaryTarget ?? 'RSVP'}>
                {props.primaryCta ?? 'RSVP'}
              </NavbarRouteLink>
            </CtaAction>
            <CtaAction variant="outline" asChild>
              <NavbarRouteLink href={props.secondaryTarget ?? 'Details'}>
                {props.secondaryCta ?? 'View Details'}
              </NavbarRouteLink>
            </CtaAction>
          </CtaBandActions>
        </CtaBandInner>
      </CtaBand>
    )
  },
})
