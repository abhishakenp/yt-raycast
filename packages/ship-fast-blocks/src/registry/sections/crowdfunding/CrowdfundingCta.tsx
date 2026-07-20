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
 * CrowdfundingCta — a playful-bold inverted closing CTA band for a
 * crowdfunding / campaign landing page. A full-width bg-foreground inversion
 * band cutting in on a slanted clip-path seam, with a giant ghost "JOIN"
 * watermark, the deadline note as a mono micro-label eyebrow, an extrabold
 * headline whose last word sits on a tilted background-colored marker
 * highlight, a supporting subhead, a decorative token-built progress-tick
 * strip echoing the campaign bar motif, and a dual button row — a
 * background-filled "Back This Project" block with hard offset shadow and
 * press feedback plus an outlined "Share" secondary. Buttons route through
 * section-kit route links. Use as the final conversion push before the footer
 * on any Kickstarter/Indiegogo-style raise, pre-order, fundraiser, or product
 * launch page.
 */
export const CrowdfundingCta = defineCapsule({
  name: 'CrowdfundingCta',
  description:
    "A playful-bold inverted closing CTA band for a crowdfunding / campaign landing page: a full-width bg-foreground inversion band cutting in on a slanted clip-path seam, with a giant ghost 'JOIN' watermark, the deadline note as a mono micro-label eyebrow, an extrabold headline whose last word sits on a tilted background-colored marker highlight, a supporting subhead, a decorative token-built progress-tick strip echoing the campaign bar motif, and a dual button row (a background-filled 'Back This Project' block with hard offset shadow and press feedback plus an outlined 'Share' secondary). Buttons route through section-kit route links. Use as the final conversion push before the footer on any Kickstarter/Indiegogo-style raise, pre-order, fundraiser, or product launch page.",
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    primaryCta: z.string().optional(),
    secondaryCta: z.string().optional(),
    note: z.string().optional(),
    /** Navigation target for the primary "Back This Project" CTA. */
    rewardsTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const ctaHeading = props.heading ?? 'Be Part of the Solution'
    const ctaDesc =
      props.description ??
      '12,847 people have already joined us. Every pledge brings EcoBrush closer to production and keeps more plastic out of our oceans.'
    const ctaPrimary = props.primaryCta ?? 'Back This Project — $49'
    const ctaSecondary = props.secondaryCta ?? 'Share This Campaign'
    const ctaNote =
      props.note ??
      'Campaign ends March 15, 2026 at 11:59 PM EST · Ships June 2026'
    const rewardsTarget = props.rewardsTarget ?? 'Rewards'

    // Split the headline so the last word can carry the tilted marker
    // highlight without changing the copy.
    const headingWords = ctaHeading.trim().split(' ')
    const headingLast = headingWords.length > 1 ? headingWords.pop() : null
    const headingLead = headingWords.join(' ')

    return (
      <CtaBand
        tone="primary"
        className={cn(
          'relative overflow-hidden bg-foreground text-background [clip-path:polygon(0_0,100%_2.5rem,100%_100%,0_100%)]',
          props.className,
        )}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-6 bottom-0 select-none whitespace-nowrap font-extrabold leading-none tracking-tighter text-background/[0.06] text-[8rem] sm:text-[12rem] lg:text-[16rem]"
        >
          JOIN
        </span>
        <CtaBandInner className="relative gap-6 py-20 pt-24 sm:py-24 sm:pt-28">
          <CtaBandEyebrow className="font-mono text-[11px] uppercase tracking-[0.2em] text-background/60 opacity-100">
            {ctaNote}
          </CtaBandEyebrow>
          <CtaBandTitle className="text-4xl font-extrabold leading-[0.98] tracking-tighter sm:text-5xl">
            {headingLast ? (
              <>
                {headingLead}{' '}
                <span className="relative inline-block whitespace-nowrap">
                  <span
                    aria-hidden="true"
                    className="absolute -inset-x-2 inset-y-0.5 rotate-1 bg-background"
                  />
                  <span className="relative text-foreground">
                    {headingLast}
                  </span>
                </span>
              </>
            ) : (
              ctaHeading
            )}
          </CtaBandTitle>
          <CtaBandSubtitle className="text-background/70 opacity-100">
            {ctaDesc}
          </CtaBandSubtitle>
          {/* Decorative progress-tick strip — the campaign bar motif */}
          <span aria-hidden="true" className="flex items-center gap-1.5">
            <span className="h-2 w-24 bg-primary" />
            <span className="h-2 w-10 bg-background/40" />
            <span className="h-2 w-4 bg-background/25" />
            <span className="h-2 w-2 bg-background/15" />
          </span>
          <CtaBandActions className="gap-4">
            <CtaAction
              variant="primary"
              className="rounded-none border-2 border-background bg-background px-7 py-3.5 font-bold text-foreground shadow-[5px_5px_0_0] shadow-background/25 transition-all hover:-translate-y-0.5 hover:bg-background hover:text-foreground active:translate-y-px active:shadow-none"
              asChild
            >
              <NavbarRouteLink href={rewardsTarget}>
                {ctaPrimary}
              </NavbarRouteLink>
            </CtaAction>
            <CtaAction
              variant="outline"
              className="rounded-none border-2 border-background/40 bg-transparent px-7 py-3.5 font-bold text-background transition-all hover:border-background hover:bg-background/10 active:translate-y-px"
              asChild
            >
              <NavbarRouteLink href={ctaSecondary}>
                {ctaSecondary}
              </NavbarRouteLink>
            </CtaAction>
          </CtaBandActions>
        </CtaBandInner>
      </CtaBand>
    )
  },
})
