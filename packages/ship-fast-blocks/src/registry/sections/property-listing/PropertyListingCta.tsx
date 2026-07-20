import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  CtaBand,
  CtaBandInner,
  CtaBandTitle,
  CtaBandSubtitle,
  CtaAction,
} from '#/section-kit/CtaBand.tsx'
import { Watermark } from '#/section-kit/Decor.tsx'
import { propertyListingLakebed } from './property-listing-lakebed.ts'
import {
  PropertyListingInquiryButton,
  PropertyListingMutationSpinner,
} from './property-listing-interactions.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * PropertyListingCta — editorial closing call-to-action band for a property
 * portal. A muted surface carries a giant ghost "HOMES" watermark and a
 * hairline-framed left-aligned block: a mono eyebrow rule (primary tick), an
 * oversized extrabold tight-tracked headline, a supporting line, and dual square
 * CTAs (ink-filled "Start Searching" + hairline outline "Post a Listing", both
 * with press feedback), with a mono reassurance note beneath. Search navigation
 * routes through section-kit route links; the seller/contact CTA records a
 * shared Lakebed inquiry instead of faking navigation.
 */
export const PropertyListingCta = defineCapsule({
  name: 'PropertyListingCta',
  description:
    'Editorial closing call-to-action band for a property portal: a muted surface with a giant ghost watermark and a hairline-framed left-aligned block — a mono eyebrow rule, an oversized extrabold tight-tracked headline, a supporting line, and dual square CTAs (ink-filled "Start Searching" + hairline outline "Post a Listing", both with press feedback), plus a mono reassurance note. The search CTA keeps page navigation through section-kit route links, while the seller/contact CTA records a shared Lakebed inquiry instead of faking navigation.',
  props: z.object({
    /** Small uppercase eyebrow above the headline. */
    eyebrow: z.string().optional(),
    /** Bold headline. */
    heading: z.string().optional(),
    /** Supporting line beneath the headline. */
    subheading: z.string().optional(),
    /** Filled primary CTA label. */
    primaryCta: z.string().optional(),
    /** Route label the primary CTA navigates to. */
    primaryTarget: z.string().optional(),
    /** Outlined secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Route label the secondary CTA navigates to. */
    secondaryTarget: z.string().optional(),
    /** Small reassurance note beneath the CTAs. */
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: propertyListingLakebed,
  component: ({ props, lakebed }) => {
    const eyebrow = props.eyebrow ?? 'Your search starts here'
    const heading = props.heading ?? 'Find your next place'
    const subheading =
      props.subheading ??
      'Browse thousands of verified listings, save your favorites, and get alerted the moment the right home shows up.'
    const primaryCta = props.primaryCta ?? 'Start Searching'
    const primaryTarget = props.primaryTarget ?? 'For Sale'
    const secondaryCta = props.secondaryCta ?? 'Post a Listing'
    const secondaryTarget = props.secondaryTarget ?? 'Post'
    const note = props.note ?? 'Free to browse · No account required to start'

    return (
      <CtaBand
        tone="muted"
        className={cn('relative overflow-hidden', props.className)}
      >
        <Watermark className="right-[-0.06em] top-2 text-[clamp(6rem,18vw,14rem)] uppercase">
          Homes
        </Watermark>
        <CtaBandInner
          align="left"
          className="relative max-w-6xl gap-6 border border-border bg-background px-6 py-14 sm:px-12 lg:py-16"
        >
          <div className="flex w-full items-center gap-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            <span className="flex items-center gap-3">
              <span aria-hidden="true" className="size-1.5 bg-primary" />
              {eyebrow}
            </span>
            <span aria-hidden="true" className="h-px flex-1 bg-border" />
            <span aria-hidden="true">[ listings ]</span>
          </div>
          <CtaBandTitle className="max-w-3xl text-4xl font-extrabold leading-[0.98] tracking-tighter text-foreground sm:text-5xl">
            {heading}
          </CtaBandTitle>
          <CtaBandSubtitle className="max-w-2xl leading-relaxed text-muted-foreground opacity-100">
            {subheading}
          </CtaBandSubtitle>
          <div className="grid w-full grid-cols-2 gap-3 sm:flex sm:w-auto">
            <CtaAction
              variant="primary"
              invert
              className="inline-flex items-center justify-center rounded-none bg-foreground px-7 py-3.5 font-mono text-xs font-semibold uppercase tracking-[0.15em] text-background transition-all duration-150 hover:bg-foreground/90 active:translate-y-px"
              asChild
            >
              <NavbarRouteLink href={primaryTarget}>
                {primaryCta}
              </NavbarRouteLink>
            </CtaAction>
            <PropertyListingInquiryButton
              lakebed={lakebed}
              intent={secondaryTarget}
              source="cta"
              pendingChildren={
                <>
                  <PropertyListingMutationSpinner className="size-4" />
                  Sending
                </>
              }
              className="inline-flex items-center justify-center gap-2 rounded-none border border-foreground/25 bg-transparent px-7 py-3.5 font-mono text-xs font-semibold uppercase tracking-[0.15em] text-foreground transition-all duration-150 hover:border-foreground active:translate-y-px disabled:pointer-events-none disabled:opacity-70"
            >
              {secondaryCta}
            </PropertyListingInquiryButton>
          </div>
          {note ? (
            <p className="w-full border-t border-border pt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground/70">
              {note}
            </p>
          ) : null}
        </CtaBandInner>
      </CtaBand>
    )
  },
})
