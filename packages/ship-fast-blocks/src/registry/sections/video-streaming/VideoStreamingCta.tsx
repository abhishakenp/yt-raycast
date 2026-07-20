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
import { Watermark } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * VideoStreamingCta — a bold free-trial band for a video-streaming home page.
 * Built on the shared `CtaBand` composite at tone="primary", cut by a slanted
 * clip-path seam and set over a giant faint "PLAY" watermark: a mono
 * "No commitment · Cancel anytime" eyebrow, a strong extrabold "Start your free
 * trial" headline, a short supporting subheading, and a centered row of two
 * square press-responsive CTAs — a high-contrast play-icon "Start Free Trial"
 * button plus an outlined "See all plans" button. Both actions route through
 * section-kit route links; tokens-only so it flips between light and dark
 * themes. Use near the bottom of a streaming-service or OTT page to drive
 * signups. Renders fully with no props via baked-in defaults.
 */
export const VideoStreamingCta = defineCapsule({
  name: 'VideoStreamingCta',
  description:
    "Bold free-trial band for a video-streaming home page built on the shared CtaBand composite at tone='primary', cut by a slanted clip-path seam over a giant faint 'PLAY' watermark: a mono 'No commitment · Cancel anytime' eyebrow, a strong extrabold 'Start your free trial' headline, a short supporting subheading, and a centered row of two square press-responsive CTAs (a high-contrast play-icon 'Start Free Trial' button plus an outlined 'See all plans' button). Both CTAs route through section-kit route links; tokens-only and theme-adaptive. Use near the bottom of a streaming-service or OTT page to drive signups.",
  props: z.object({
    /** Reassurance eyebrow above the headline. */
    eyebrow: z.string().optional(),
    /** Free-trial headline (maps to CtaBand title). */
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
    const eyebrow = props.eyebrow ?? 'No commitment · Cancel anytime'
    const headline = props.headline ?? 'Start your free trial'
    const subheading =
      props.subheading ??
      "Stream thousands of shows and movies ad-free for 30 days. Pick a plan when you're ready, or cancel before it ends — your call."
    const primaryCta = props.primaryCta ?? 'Start Free Trial'
    const primaryTarget = props.primaryTarget ?? 'Pricing'
    const secondaryCta = props.secondaryCta ?? 'See all plans'
    const secondaryTarget = props.secondaryTarget ?? 'Pricing'

    const PlayIcon = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path d="M6 4.5v11a1 1 0 0 0 1.52.85l9-5.5a1 1 0 0 0 0-1.7l-9-5.5A1 1 0 0 0 6 4.5Z" />
      </svg>
    )

    return (
      <CtaBand
        tone="primary"
        className="relative overflow-hidden [clip-path:polygon(0_2.5rem,100%_0,100%_100%,0_100%)]"
      >
        <Watermark className="-right-4 top-4 text-[26vw] leading-none text-primary-foreground/[0.08] lg:text-[16rem]">
          PLAY
        </Watermark>
        <CtaBandInner className="relative pt-24 lg:pt-28">
          <CtaBandEyebrow className="font-mono tracking-[0.2em]">
            {eyebrow}
          </CtaBandEyebrow>
          <CtaBandTitle className="text-4xl font-extrabold tracking-tight md:text-5xl">
            {headline}
          </CtaBandTitle>
          <CtaBandSubtitle>{subheading}</CtaBandSubtitle>
          <CtaBandActions className="mt-2">
            <CtaAction
              variant="primary"
              invert
              asChild
              className="rounded-none px-8 py-4 transition-transform duration-150 active:translate-y-px motion-reduce:transform-none"
            >
              <NavbarRouteLink href={primaryTarget}>
                <PlayIcon className="mr-2 size-5" />
                {primaryCta}
              </NavbarRouteLink>
            </CtaAction>
            <CtaAction
              variant="outline"
              asChild
              className="rounded-none px-8 py-4 transition-transform duration-150 active:translate-y-px motion-reduce:transform-none"
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
