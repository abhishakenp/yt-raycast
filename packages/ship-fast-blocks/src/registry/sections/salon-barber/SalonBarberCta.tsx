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

export const SalonBarberCta = defineCapsule({
  name: 'SalonBarberCta',
  description:
    "Barbershop / salon booking call-to-action band built on the shared CtaBand composite with a confident primary surface. Surfaces opening hours / walk-in availability as an eyebrow, a direct grooming headline, and twin actions to book online or call. Use it as the conversion band on any barbershop, salon, or men's grooming homepage — typically the closing section that turns browsers into booked appointments.",
  props: z.object({
    headline: z.string().optional(),
    subheading: z.string().optional(),
    hours: z.string().optional(),
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
            {props.hours ?? 'Open 7 days · Walk-ins welcome'}
          </CtaBandEyebrow>
          <CtaBandTitle>
            {props.headline ?? 'Book your appointment'}
          </CtaBandTitle>
          <CtaBandSubtitle>
            {props.subheading ??
              "Reserve your chair in seconds and show up to a cut that's done right."}
          </CtaBandSubtitle>
          <CtaBandActions>
            <CtaAction variant="primary" asChild>
              <NavbarRouteLink href={props.primaryTarget ?? 'Book'}>
                {props.primaryCta ?? 'Book Now'}
              </NavbarRouteLink>
            </CtaAction>
            <CtaAction variant="outline" asChild>
              <NavbarRouteLink href={props.secondaryTarget ?? 'Contact'}>
                {props.secondaryCta ?? 'Call Us'}
              </NavbarRouteLink>
            </CtaAction>
          </CtaBandActions>
        </CtaBandInner>
      </CtaBand>
    )
  },
})
