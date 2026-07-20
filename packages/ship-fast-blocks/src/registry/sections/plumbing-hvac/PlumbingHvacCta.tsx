import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
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
 * PlumbingHvacCta — the full-width trade-industrial conversion band for the
 * bottom of a plumbing & HVAC site — the page's single primary accent moment.
 * Thin configuration over the shared `CtaBand` composite at tone="primary": a
 * left-aligned mono reassurance rule + extrabold slab headline and supporting
 * line over a primary surface behind a giant ghost "24/7" watermark, a squared
 * high-contrast "Schedule Service" button (inverted to the background surface
 * with press feedback), and a squared outlined "Call Now" button. Both CTAs
 * route through section-kit route links. Use as the closing call-to-action for
 * plumber, HVAC, or other home-service pages. Renders fully with no props via
 * baked-in defaults.
 */
export const PlumbingHvacCta = defineCapsule({
  name: 'PlumbingHvacCta',
  description:
    "Full-width trade-industrial conversion band for the bottom of a plumbing & HVAC site and the page's single primary accent moment, built on the shared CtaBand composite at tone='primary': a left-aligned mono reassurance rule + extrabold slab headline and supporting line over a primary surface behind a giant ghost '24/7' watermark, a squared high-contrast 'Schedule Service' button (inverted to the background surface with press feedback), and a squared outlined 'Call Now' button. Both CTAs route through section-kit route links. Use as the closing call-to-action for plumber, HVAC, or other home-service pages.",
  props: z.object({
    /** Centered headline on the band. */
    heading: z.string().optional(),
    /** Supporting line under the headline. */
    subheading: z.string().optional(),
    /** Primary contrast CTA label. */
    primaryCta: z.string().optional(),
    /** Navigation target for the primary CTA. */
    primaryTarget: z.string().optional(),
    /** Optional outlined secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Navigation target for the secondary CTA. */
    secondaryTarget: z.string().optional(),
    /** Small reassurance note shown as the band eyebrow. */
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Schedule your service today'
    const subheading =
      props.subheading ??
      'Same-day appointments available, with 24/7 emergency service when you need it most. Licensed, insured, and ready to help.'
    const primaryCta = props.primaryCta ?? 'Schedule Service'
    const primaryTarget = props.primaryTarget ?? 'Contact'
    const secondaryCta = props.secondaryCta ?? 'Call Now'
    const secondaryTarget = props.secondaryTarget ?? 'Contact'
    const note = props.note ?? 'Upfront pricing • Satisfaction guaranteed'

    return (
      <CtaBand
        tone="primary"
        className={cn('relative overflow-hidden', props.className)}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-6 top-1/2 -translate-y-1/2 select-none font-mono text-[9rem] font-extrabold leading-none tracking-tighter text-primary-foreground/[0.08] sm:text-[13rem]"
        >
          24/7
        </span>
        <CtaBandInner align="left" className="relative max-w-5xl">
          <CtaBandEyebrow className="flex items-center gap-2 font-mono text-[11px] tracking-[0.2em] opacity-90">
            <span aria-hidden="true" className="size-2 bg-primary-foreground" />
            {note}
          </CtaBandEyebrow>
          <CtaBandTitle className="max-w-2xl text-balance text-3xl font-extrabold tracking-tight md:text-5xl">
            {heading}
          </CtaBandTitle>
          <CtaBandSubtitle>{subheading}</CtaBandSubtitle>
          <CtaBandActions align="left" className="mt-2">
            <CtaAction
              variant="primary"
              invert
              asChild
              className="rounded-none px-7 py-3.5 font-semibold shadow-[5px_5px_0_0] shadow-primary-foreground/30 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[7px_7px_0_0] hover:shadow-primary-foreground/30 active:translate-y-0 active:shadow-[2px_2px_0_0] active:shadow-primary-foreground/30 motion-reduce:transform-none"
            >
              <NavbarRouteLink href={primaryTarget}>
                {primaryCta}
              </NavbarRouteLink>
            </CtaAction>
            {secondaryCta && (
              <CtaAction
                variant="outline"
                asChild
                className="rounded-none border-2 border-primary-foreground/50 bg-transparent px-7 py-3.5 font-semibold text-primary-foreground transition-all duration-150 hover:bg-primary-foreground/10 active:translate-y-px motion-reduce:transform-none"
              >
                <NavbarRouteLink href={secondaryTarget}>
                  {secondaryCta}
                </NavbarRouteLink>
              </CtaAction>
            )}
          </CtaBandActions>
        </CtaBandInner>
      </CtaBand>
    )
  },
})
