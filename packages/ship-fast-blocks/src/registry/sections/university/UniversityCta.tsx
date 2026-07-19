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

export const UniversityCta = defineCapsule({
  name: 'UniversityCta',
  description:
    "Admissions conversion band for the University page family with a prestigious, collegiate aesthetic. Composes the shared CtaBand kit composite on a primary-tone surface with an optional deadline eyebrow, an invitational title, supporting copy, and two routable actions — a primary 'Start your application' that targets the Admissions page and an outline 'Request info'. Use as the closing call to action before the footer on a university homepage.",
  props: z.object({
    eyebrow: z.string().optional(),
    title: z.string().optional(),
    subtitle: z.string().optional(),
    primaryLabel: z.string().optional(),
    primaryTarget: z.string().optional(),
    secondaryLabel: z.string().optional(),
    secondaryTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Fall applications close January 15'
    const title = props.title ?? 'Start your application'
    const subtitle =
      props.subtitle ??
      "Your place in our next class begins with a single step. Apply today, or request more information and we'll guide you through every part of the journey."
    const primaryLabel = props.primaryLabel ?? 'Start your application'
    const primaryTarget = props.primaryTarget ?? 'Admissions'
    const secondaryLabel = props.secondaryLabel ?? 'Request info'
    const secondaryTarget = props.secondaryTarget ?? 'Admissions'

    return (
      <CtaBand tone="primary" className={props.className}>
        <CtaBandInner>
          <CtaBandEyebrow>{eyebrow}</CtaBandEyebrow>
          <CtaBandTitle>{title}</CtaBandTitle>
          <CtaBandSubtitle>{subtitle}</CtaBandSubtitle>
          <CtaBandActions>
            <CtaAction variant="primary" asChild>
              <NavbarRouteLink href={primaryTarget}>
                {primaryLabel}
              </NavbarRouteLink>
            </CtaAction>
            <CtaAction variant="outline" asChild>
              <NavbarRouteLink href={secondaryTarget}>
                {secondaryLabel}
              </NavbarRouteLink>
            </CtaAction>
          </CtaBandActions>
        </CtaBandInner>
      </CtaBand>
    )
  },
})
