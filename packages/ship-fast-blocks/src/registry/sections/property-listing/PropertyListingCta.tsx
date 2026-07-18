import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import {
  CtaBand,
  CtaBandInner,
  CtaBandEyebrow,
  CtaBandTitle,
  CtaBandSubtitle,
} from '#/section-kit/CtaBand.tsx'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { propertyListingLakebed } from './property-listing-lakebed.ts'
import {
  PropertyListingInquiryButton,
  PropertyListingMutationSpinner,
} from './property-listing-interactions.tsx'

/**
 * PropertyListingCta — a closing call-to-action band for a property portal. A
 * rounded card surface centers an eyebrow, a bold headline, a supporting line,
 * and dual CTAs (filled "Start Searching" + outlined "Post a Listing") with a
 * small reassurance note beneath. Search navigation routes through useNavigate;
 * seller/contact intent records a shared Lakebed inquiry.
 */
export const PropertyListingCta = defineCapsule({
  name: 'PropertyListingCta',
  description:
    'Closing call-to-action band for a property portal: a rounded card surface centering an eyebrow, a bold headline, a supporting line, and dual CTAs. The search CTA keeps page navigation through useNavigate, while the seller/contact CTA records a shared Lakebed inquiry instead of faking navigation.',
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
    const go = useNavigate()
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
      <CtaBand tone="muted" className={props.className}>
        <CtaBandInner className="max-w-5xl rounded-3xl bg-primary px-6 py-14 sm:px-12 lg:py-16">
          <CtaBandEyebrow className="text-primary-foreground/75 normal-case tracking-[0.18em] font-semibold">
            {eyebrow}
          </CtaBandEyebrow>
          <CtaBandTitle className="text-primary-foreground font-bold tracking-tight sm:text-4xl">
            {heading}
          </CtaBandTitle>
          <CtaBandSubtitle className="text-primary-foreground/80 leading-7">
            {subheading}
          </CtaBandSubtitle>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => go(primaryTarget)}
              className="inline-flex items-center justify-center rounded-full bg-primary-foreground px-6 py-3 text-sm font-semibold text-primary transition hover:bg-primary-foreground/90"
            >
              {primaryCta}
            </button>
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
              className="inline-flex items-center justify-center gap-2 rounded-full border border-primary-foreground/40 px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary-foreground/10 disabled:pointer-events-none disabled:opacity-70"
            >
              {secondaryCta}
            </PropertyListingInquiryButton>
          </div>
          {note ? (
            <p className="text-sm text-primary-foreground/70">{note}</p>
          ) : null}
        </CtaBandInner>
      </CtaBand>
    )
  },
})
