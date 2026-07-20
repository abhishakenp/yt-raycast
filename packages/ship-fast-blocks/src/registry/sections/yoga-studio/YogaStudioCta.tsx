import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

import {
  CtaBand,
  CtaBandInner,
  CtaBandTitle,
  CtaBandSubtitle,
  CtaBandActions,
  CtaAction,
} from '#/section-kit/CtaBand.tsx'
import { Watermark } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * YogaStudioCta — the calm inverted closing band for a yoga-studio page. The
 * single full-inversion moment of the page: a bg-foreground / text-background
 * band with a gentle slanted clip-path seam at the top edge and a giant lowercase
 * ghost watermark word, a left-aligned clean-sans headline, a short supporting
 * line, and dual sharp-cornered CTAs — a filled background-on-ink "Start Free
 * Trial" button plus a hairline outline "Contact" button, both with press
 * feedback. Both CTAs route through section-kit route links. Use as a closing
 * conversion band inviting visitors to begin a trial or reach out. Renders fully
 * with no props via baked-in defaults.
 */
export const YogaStudioCta = defineCapsule({
  name: 'YogaStudioCta',
  description:
    "Calm inverted closing band for a yoga-studio page — the single full-inversion moment of the page: a bg-foreground / text-background band with a gentle slanted clip-path seam at the top edge and a giant lowercase ghost watermark word, a left-aligned clean-sans headline, a short supporting line, and dual sharp-cornered CTAs (a filled background-on-ink 'Start Free Trial' button + a hairline outline 'Contact' button) with press feedback. Both route through section-kit route links. Use as a closing conversion band inviting visitors to begin a trial or reach out.",
  props: z.object({
    /** Headline. */
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
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Your first week is on us'
    const subheading =
      props.subheading ??
      'Start a free trial and move through a full week of classes — no card, no pressure.'
    const primaryCta = props.primaryCta ?? 'Start Free Trial'
    const primaryTarget = props.primaryTarget ?? 'Trial'
    const secondaryCta = props.secondaryCta ?? 'Contact'
    const secondaryTarget = props.secondaryTarget ?? 'Contact'

    return (
      <CtaBand
        tone="primary"
        className={cn(
          'relative overflow-hidden bg-foreground text-background [clip-path:polygon(0_2.5rem,100%_0,100%_100%,0_100%)]',
          props.className,
        )}
      >
        <Watermark className="-right-8 -bottom-16 text-[10rem] font-semibold text-background/[0.05] sm:text-[16rem]">
          belong
        </Watermark>
        <CtaBandInner className="max-w-5xl items-start gap-7 pt-28 pb-20 text-left lg:pt-32 lg:pb-28">
          <CtaBandTitle className="max-w-3xl text-[clamp(2.25rem,5vw,4rem)] font-semibold leading-[1.04] tracking-tight">
            {heading}
          </CtaBandTitle>
          <CtaBandSubtitle className="max-w-2xl text-background/70 opacity-100">
            {subheading}
          </CtaBandSubtitle>
          <CtaBandActions className="relative w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-4">
            <CtaAction
              variant="primary"
              asChild
              className="rounded-none bg-background px-8 py-4 text-base font-medium text-foreground hover:bg-background/90 active:translate-y-px"
            >
              <NavbarRouteLink href={primaryTarget}>
                {primaryCta}
              </NavbarRouteLink>
            </CtaAction>
            <CtaAction
              variant="outline"
              asChild
              className="rounded-none border-background/30 bg-transparent px-8 py-4 text-base font-medium text-background hover:bg-background/10 active:translate-y-px"
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
