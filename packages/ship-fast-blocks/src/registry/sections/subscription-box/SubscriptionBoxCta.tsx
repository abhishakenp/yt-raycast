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

/**
 * SubscriptionBoxCta — closing conversion band for a subscription-box brand
 * built on the shared CtaBand composite with tone="primary". An eyebrow, a
 * "Start your subscription" title, supporting copy, and a row of routable
 * actions (primary "Build your box" + outline "See plans"). Theme-token only
 * and renders complete with no props. Use as the final push on any curated-box
 * or membership page.
 */
export const SubscriptionBoxCta = defineCapsule({
  name: 'SubscriptionBoxCta',
  description:
    "Closing conversion band for a subscription-box brand built on the shared CtaBand composite (tone='primary'): an eyebrow, a 'Start your subscription' title, supporting copy, and routable actions (primary 'Build your box' + outline 'See plans'). Use as the final push on any curated-box or membership page.",
  props: z.object({
    eyebrow: z.string().optional(),
    title: z.string().optional(),
    subtitle: z.string().optional(),
    primaryCta: z.string().optional(),
    secondaryCta: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Ready when you are'
    const title = props.title ?? 'Start your subscription'
    const subtitle =
      props.subtitle ??
      'Build your first box in minutes. Free shipping, skip or cancel anytime — the joy is just a click away.'
    const primaryCta = props.primaryCta ?? 'Build your box'
    const secondaryCta = props.secondaryCta ?? 'See plans'

    return (
      <CtaBand tone="primary" className={props.className}>
        <CtaBandInner>
          <CtaBandEyebrow>{eyebrow}</CtaBandEyebrow>
          <CtaBandTitle>{title}</CtaBandTitle>
          <CtaBandSubtitle>{subtitle}</CtaBandSubtitle>
          <CtaBandActions>
            <CtaAction variant="primary" asChild>
              <NavbarRouteLink href={'Pricing'}>{primaryCta}</NavbarRouteLink>
            </CtaAction>
            <CtaAction variant="outline" asChild>
              <NavbarRouteLink href={'Pricing'}>{secondaryCta}</NavbarRouteLink>
            </CtaAction>
          </CtaBandActions>
        </CtaBandInner>
      </CtaBand>
    )
  },
})
