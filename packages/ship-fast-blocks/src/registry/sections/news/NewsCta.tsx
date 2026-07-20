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
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * NewsCta — "Support Independent Journalism" subscribe band styled as a
 * newspaper house-ad for a news / editorial site. Thin configuration over the
 * shared `CtaBand` composite, restyled to a boxed newsprint panel: heavy
 * masthead rules top and bottom on a light card surface, a mono membership
 * eyebrow, a serif black headline, a short supporting subheading, and a
 * centered row of two square (rounded-none) routable CTAs with press feedback —
 * a solid primary "Subscribe Now" button (the single accent moment) beside an
 * outlined "View All Plans" button. Both actions route through section-kit
 * route links so neither is a dead link. Use as the subscription / membership
 * CTA near the bottom of a newspaper, magazine or publication homepage. Renders
 * fully with no props via baked-in defaults.
 */
export const NewsCta = defineCapsule({
  name: 'NewsCta',
  description:
    "'Support Independent Journalism' subscribe band styled as a newspaper house-ad for a news / editorial site, built on the shared CtaBand composite restyled to a boxed newsprint panel: heavy masthead rules top and bottom on a light card surface, a mono membership eyebrow, a serif black headline, a short supporting subheading, and a centered row of two square (rounded-none) CTAs with press feedback — a solid primary 'Subscribe Now' button beside an outlined 'View All Plans' button. Both CTAs route through section-kit route links. Use as the subscription / membership CTA near the bottom of a newspaper, magazine or publication homepage.",
  props: z.object({
    /** CTA heading (maps to CtaBand title). */
    heading: z.string().optional(),
    /** Short supporting line under the heading (maps to CtaBand subtitle). */
    subheading: z.string().optional(),
    /** Small eyebrow above the heading. */
    eyebrow: z.string().optional(),
    /** High-contrast primary CTA label. */
    primaryCta: z.string().optional(),
    /** Outlined secondary CTA label. */
    secondaryCta: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    return (
      <CtaBand
        tone="primary"
        className={
          'border-y-2 border-foreground bg-card text-foreground shadow-[0_3px_0_-2px] shadow-border ' +
          (props.className ?? '')
        }
      >
        <CtaBandInner className="py-16">
          <CtaBandEyebrow className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary opacity-100">
            {props.eyebrow ?? 'Become a member'}
          </CtaBandEyebrow>
          <CtaBandTitle className="font-serif text-4xl font-black tracking-tight text-foreground md:text-5xl">
            {props.heading ?? 'Support Independent Journalism'}
          </CtaBandTitle>
          <CtaBandSubtitle className="text-muted-foreground opacity-100">
            {props.subheading ??
              'Subscribe today for unlimited access to award-winning reporting, expert analysis, and exclusive features. No paywalls on breaking news—ever.'}
          </CtaBandSubtitle>
          <CtaBandActions className="mt-2">
            <CtaAction
              variant="primary"
              asChild
              className="rounded-none px-6 font-mono text-[11px] uppercase tracking-[0.16em] active:translate-y-px"
            >
              <NavbarRouteLink href={'Subscribe'}>
                {props.primaryCta ?? 'Subscribe Now'}
              </NavbarRouteLink>
            </CtaAction>
            <CtaAction
              variant="outline"
              asChild
              className="rounded-none border-foreground px-6 font-mono text-[11px] uppercase tracking-[0.16em] active:translate-y-px"
            >
              <NavbarRouteLink href={'Plans'}>
                {props.secondaryCta ?? 'View All Plans'}
              </NavbarRouteLink>
            </CtaAction>
          </CtaBandActions>
        </CtaBandInner>
      </CtaBand>
    )
  },
})
