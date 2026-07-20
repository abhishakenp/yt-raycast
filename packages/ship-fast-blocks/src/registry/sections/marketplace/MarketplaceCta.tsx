import { defineCapsule } from '#/capsules/openui.ts'
import { cn } from '#/lib/utils.ts'
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
import { Watermark } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * MarketplaceCta — bold, left-aligned editorial conversion band for a
 * multi-vendor marketplace. Built on the shared CtaBand composite over a giant
 * ghost "SELL" watermark on a hairline-bounded muted wash: a mono index rule, an
 * optional eyebrow, a strong extrabold tight-tracked "Start selling today"
 * headline, a short supporting subheading, and a row of two square routable CTAs
 * — a high-contrast hard-offset-shadow "Start Selling" button that routes to
 * seller onboarding, plus a hairline outline "Browse Marketplace" button that
 * routes to category browsing. Both actions have press feedback and navigate
 * through the kit's section-kit route links. Use near the bottom of an online
 * marketplace, multi-vendor or maker/artisan platform, or retail aggregator to
 * drive seller signups and shopping. Renders fully with no props via baked-in
 * defaults.
 */
export const MarketplaceCta = defineCapsule({
  name: 'MarketplaceCta',
  description:
    "Bold, left-aligned editorial commerce-index conversion band for a multi-vendor marketplace built on the shared CtaBand composite over a giant ghost 'SELL' watermark on a hairline-bounded muted wash: a mono index rule, an optional eyebrow, a strong extrabold tight-tracked 'Start selling today' headline, a short supporting subheading, and a row of two square routable CTAs (a high-contrast hard-offset-shadow 'Start Selling' button routing to seller onboarding plus a hairline outline 'Browse Marketplace' button routing to category browsing). Both CTAs have press feedback and route through section-kit route links. Use near the bottom of an online marketplace, multi-vendor or maker/artisan platform, or retail aggregator to drive seller signups and shopping.",
  props: z.object({
    /** Optional eyebrow above the headline. */
    eyebrow: z.string().optional(),
    /** Conversion headline (maps to CtaBand title). */
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
    const headline = props.headline ?? 'Start selling today'
    const subheading =
      props.subheading ??
      'Open your storefront in minutes and reach millions of buyers worldwide. No listing fees to get started — keep more of every sale.'
    const primaryCta = props.primaryCta ?? 'Start Selling'
    const primaryTarget = props.primaryTarget ?? 'Sell'
    const secondaryCta = props.secondaryCta ?? 'Browse Marketplace'
    const secondaryTarget = props.secondaryTarget ?? 'Categories'

    return (
      <CtaBand
        tone="primary"
        className={cn(
          'relative overflow-hidden border-y border-border bg-muted/40 text-foreground',
          props.className,
        )}
      >
        <Watermark className="-right-[0.06em] bottom-[-0.18em] text-[clamp(6rem,18vw,15rem)] uppercase">
          Sell
        </Watermark>
        <CtaBandInner
          align="left"
          className="relative max-w-7xl gap-6 px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
        >
          <div className="flex w-full items-center gap-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            <span className="flex items-center gap-3">
              <span aria-hidden="true" className="size-1.5 bg-primary" />
              Sellers
            </span>
            <span aria-hidden="true" className="h-px flex-1 bg-border" />
            <span aria-hidden="true">[ join ]</span>
          </div>
          {props.eyebrow ? (
            <CtaBandEyebrow className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground opacity-100">
              {props.eyebrow}
            </CtaBandEyebrow>
          ) : null}
          <CtaBandTitle className="max-w-3xl text-4xl font-extrabold leading-[0.98] tracking-tighter text-foreground sm:text-5xl lg:text-6xl">
            {headline}
          </CtaBandTitle>
          <CtaBandSubtitle className="max-w-2xl text-base leading-relaxed text-muted-foreground opacity-100">
            {subheading}
          </CtaBandSubtitle>
          <CtaBandActions
            align="left"
            className="mt-2 grid w-full grid-cols-1 gap-3 sm:flex sm:w-auto sm:flex-wrap sm:gap-4"
          >
            <CtaAction
              variant="primary"
              asChild
              className="inline-flex items-center justify-center rounded-none border border-foreground bg-foreground px-7 py-3.5 font-mono text-xs font-semibold uppercase tracking-[0.15em] text-background shadow-[4px_4px_0_0] shadow-foreground/20 transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-foreground/90 hover:shadow-[2px_2px_0_0] hover:shadow-foreground/20 active:translate-x-1 active:translate-y-1 active:shadow-none"
            >
              <NavbarRouteLink href={primaryTarget}>
                {primaryCta}
              </NavbarRouteLink>
            </CtaAction>
            <CtaAction
              variant="outline"
              asChild
              className="inline-flex items-center justify-center rounded-none border border-foreground/25 bg-transparent px-7 py-3.5 font-mono text-xs font-semibold uppercase tracking-[0.15em] text-foreground transition-all duration-150 hover:border-foreground active:translate-y-px"
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
