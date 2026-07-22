import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import {
  CtaBand,
  CtaBandInner,
  CtaBandEyebrow,
  CtaBandTitle,
  CtaBandSubtitle,
  CtaAction,
} from '#/section-kit/CtaBand.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * CoworkingCta — flat editorial closing band for a coworking or
 * shared-workspace page. A full-bleed hairline band (`border-y border-border`)
 * on a plain token background, left-aligned: a mono kicker (square primary
 * marker + mono uppercase label), a big two-tone display headline
 * (`text-foreground` lead + `text-muted-foreground` continuation), a short
 * supporting line, and two SQUARE (`rounded-none`) CTAs with press feedback —
 * one primary fill beside a hairline outline. Both route through section-kit
 * route links. No gradients, glow shadows, rounded pills, or shimmer sweeps.
 * Renders fully with no props via baked-in defaults. Use near the bottom of a
 * coworking, shared-office, or flex-office page to drive tour bookings.
 */
export const CoworkingCta = defineCapsule({
  name: 'CoworkingCta',
  description:
    'Luminous closing CTA band for a coworking or shared-workspace page: a full-bleed rounded panel on a deep primary gradient, framed by faint oversized ring outlines and floating over a slanted muted seam band cutting diagonally across the backdrop — with a mono uppercase eyebrow, display headline, short supporting line, and two press-feedback CTAs (inverted shimmer-sweep pill + translucent outline pill), both routed through section-kit route links. Use near the bottom of a coworking, shared-office, or flex-office page to drive tour bookings and pricing views.',
  props: z.object({
    /** Small eyebrow label above the headline. */
    eyebrow: z.string().optional(),
    /** CTA headline (maps to CtaBand title). */
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
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow =
      typeof props.eyebrow === 'string' && props.eyebrow
        ? props.eyebrow
        : 'Your desk is waiting'
    const headline =
      typeof props.headline === 'string' && props.headline
        ? props.headline
        : 'Come see why members never want to leave'
    const subheading =
      typeof props.subheading === 'string' && props.subheading
        ? props.subheading
        : 'Book a free walkthrough and grab a coffee on us — no pressure, no contracts, just a look at where your best work happens.'
    const primaryCta =
      typeof props.primaryCta === 'string' && props.primaryCta
        ? props.primaryCta
        : 'Tour the space'
    const secondaryCta =
      typeof props.secondaryCta === 'string' && props.secondaryCta
        ? props.secondaryCta
        : 'View pricing'

    const headlineWords = headline.split(/\s+/).filter(Boolean)
    const splitAt = Math.ceil(headlineWords.length / 2)
    const headlineLead = headlineWords.slice(0, splitAt).join(' ')
    const headlineTail = headlineWords.slice(splitAt).join(' ')

    return (
      <CtaBand
        tone="muted"
        className={`relative isolate border-y border-border bg-background py-20 sm:py-24 ${props.className ?? ''}`}
      >
        <Container>
          <CtaBandInner align="left" className="max-w-3xl gap-6 px-0 py-0">
            <CtaBandEyebrow className="inline-flex items-center gap-2.5 font-mono text-[11px] font-normal uppercase tracking-[0.16em] text-muted-foreground opacity-100">
              <span aria-hidden="true" className="size-2 bg-primary" />
              {eyebrow}
            </CtaBandEyebrow>
            <CtaBandTitle className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              {headlineLead}
              {headlineTail ? (
                <>
                  {' '}
                  <span className="text-muted-foreground">{headlineTail}</span>
                </>
              ) : null}
            </CtaBandTitle>
            <CtaBandSubtitle className="max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground opacity-100">
              {subheading}
            </CtaBandSubtitle>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <NavbarRouteLink
                className="inline-flex items-center justify-center rounded-none bg-primary px-7 py-3.5 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:translate-y-px"
                href={props.primaryTarget ?? primaryCta}
              >
                {primaryCta}
              </NavbarRouteLink>
              <CtaAction
                variant="outline"
                className="inline-flex items-center justify-center rounded-none border border-border bg-background px-7 py-3.5 text-base font-medium text-foreground transition-colors hover:bg-muted active:translate-y-px"
                asChild
              >
                <NavbarRouteLink href={props.secondaryTarget ?? secondaryCta}>
                  {secondaryCta}
                </NavbarRouteLink>
              </CtaAction>
            </div>
          </CtaBandInner>
        </Container>
      </CtaBand>
    )
  },
})
