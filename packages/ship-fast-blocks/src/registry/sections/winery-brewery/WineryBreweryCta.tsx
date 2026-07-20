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
 * WineryBreweryCta — a bold, centered visit-and-join band for a winery or
 * brewery home page. Thin configuration over the shared `CtaBand` composite at
 * `tone="primary"`: a mono label-stamp hours eyebrow, a strong serif headline,
 * a short supporting subheading, and a centered row of two square-edged routable
 * CTAs (binary radius, press feedback) — a high-contrast "Plan Your Visit"
 * button (variant "primary", auto-inverted on the primary band) plus an
 * outlined "Join the Wine Club" button (variant "outline") that routes to
 * membership. Both actions navigate through the kit's section-kit route links so
 * neither is a dead link. Use near the bottom of a winery, vineyard, cellar
 * door, brewery, taproom, or cidery page to drive visits and memberships.
 * Renders fully with no props via warm baked-in defaults.
 */
export const WineryBreweryCta = defineCapsule({
  name: 'WineryBreweryCta',
  description:
    "Bold, centered visit-and-join band for a winery or brewery home page: a full-width primary-colored band with a mono label-stamp hours eyebrow, a serif headline, a short supporting subheading, and a centered row of two square-edged CTAs with press feedback (a high-contrast 'Plan Your Visit' button plus an outlined 'Join the Wine Club' button). Both CTAs route through section-kit route links. Use near the bottom of a winery, vineyard, cellar door, brewery, taproom, or cidery page to drive visits and memberships.",
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
      <CtaBand tone="primary" className={props.className}>
        <CtaBandInner className="py-20">
          <CtaBandEyebrow className="inline-flex -rotate-1 items-center border border-primary-foreground/40 px-2.5 py-1 font-mono text-[11px] tracking-[0.2em] opacity-90">
            {hours}
          </CtaBandEyebrow>
          <CtaBandTitle className="font-serif text-4xl font-medium tracking-tight md:text-5xl">
            {headline}
          </CtaBandTitle>
          <CtaBandSubtitle>{subheading}</CtaBandSubtitle>
          <CtaBandActions className="mt-2">
            <CtaAction
              variant="primary"
              asChild
              className="rounded-none px-7 text-xs font-semibold uppercase tracking-[0.12em] transition-transform duration-150 active:translate-y-px"
            >
              <NavbarRouteLink href={primaryTarget}>
                {primaryCta}
              </NavbarRouteLink>
            </CtaAction>
            <CtaAction
              variant="outline"
              asChild
              className="rounded-none border-primary-foreground/40 px-7 text-xs font-semibold uppercase tracking-[0.12em] text-primary-foreground transition-transform duration-150 hover:bg-primary-foreground/10 active:translate-y-px"
            >
              <NavbarRouteLink href={secondaryTarget}>
                {secondaryCta}
              </NavbarRouteLink>
            </CtaAction>
          </CtaBandActions>
        </CtaBandInner>
      </CtaBand>
    )
  },
})
