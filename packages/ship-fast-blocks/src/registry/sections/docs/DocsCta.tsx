import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Watermark } from '#/section-kit/Decor.tsx'
import {
  CtaBand,
  CtaBandInner,
  CtaBandEyebrow,
  CtaBandTitle,
  CtaBandSubtitle,
  CtaBandActions,
  CtaAction,
} from '#/section-kit/CtaBand.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * DocsCta — "Terminal-docs" inverted closing band for a developer
 * documentation home page. The page's full ink inversion (bg-foreground /
 * text-background) cutting in on a slanted clip-path seam, built on the
 * shared `CtaBand` composite: a left-aligned column with a mono `#`-anchored
 * eyebrow, an extrabold headline, a muted supporting line, and two square
 * CTAs — a light hard-offset-shadow "Start building" button with press
 * feedback that routes to the quickstart, plus a hairline-outlined "View API
 * Reference" button. A giant ghost `#` watermark and a decorative `⌘K`
 * kbd-chip cluster (lg+) echo the hero's search grammar. Both actions
 * navigate through the kit's section-kit route links so neither is a dead
 * link. Use near the bottom of a docs home, API reference, SDK guide, or
 * developer portal page to push readers into the quickstart. Renders fully
 * with no props via crisp, developer-friendly baked-in defaults.
 */
export const DocsCta = defineCapsule({
  name: 'DocsCta',
  description:
    "Terminal-docs inverted closing band for a developer documentation home page: a full ink inversion (foreground background, background text) cutting in on a slanted clip-path seam, with a left-aligned mono '#'-anchored eyebrow, an extrabold headline, a muted supporting line, and two square CTAs — a light hard-offset-shadow 'Start building' button with press feedback routing to the quickstart plus a hairline-outlined 'View API Reference' button — under a giant ghost '#' watermark and a decorative '⌘K' kbd-chip cluster. Both CTAs route through section-kit route links. Use near the bottom of a docs home, API reference, SDK guide, or developer portal page to push readers into getting started.",
  props: z.object({
    /** Short label shown above the headline (maps to CtaBand eyebrow). */
    eyebrow: z.string().optional(),
    /** Closing headline (maps to CtaBand title). */
    headline: z.string().optional(),
    /** Short supporting line under the headline (maps to CtaBand subtitle). */
    subheading: z.string().optional(),
    /** High-contrast primary CTA label. */
    primaryCta: z.string().optional(),
    /** Route the primary CTA navigates to. */
    primaryTarget: z.string().optional(),
    /** Outlined secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Route the secondary CTA navigates to. */
    secondaryTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const kbdChip =
      'inline-flex min-w-7 items-center justify-center rounded-none border border-background/25 bg-background/5 px-2 py-1 font-mono text-xs text-background/70'
    return (
      <CtaBand
        tone="primary"
        className={cn(
          // Slanted top seam: the ink inversion cuts in on a diagonal —
          // clip-path on the band itself keeps it neighbor-independent.
          'relative overflow-hidden bg-foreground pt-12 text-background [clip-path:polygon(0_3rem,100%_0,100%_100%,0_100%)] sm:pt-16',
          props.className,
        )}
      >
        {/* Giant ghost anchor glyph, echoing the hero watermark. */}
        <Watermark className="-right-8 -top-10 font-mono text-[14rem] text-background/[0.05] sm:text-[20rem]">
          #
        </Watermark>

        {/* Decorative kbd cluster — the ⌘K search grammar, closing the loop. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-10 top-1/2 hidden -translate-y-1/2 flex-col items-end gap-3 lg:flex"
        >
          <span className="flex gap-1.5">
            <kbd className={kbdChip}>⌘</kbd>
            <kbd className={kbdChip}>K</kbd>
          </span>
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-background/40">
            search anywhere
          </span>
        </div>

        <CtaBandInner
          align="left"
          className="relative max-w-6xl gap-5 px-6 py-16 sm:px-8 sm:py-20 lg:px-12 lg:pr-72"
        >
          <CtaBandEyebrow className="font-mono text-[11px] uppercase tracking-[0.22em] text-background/60 opacity-100 before:mr-2 before:font-normal before:text-background/40 before:content-['#']">
            {props.eyebrow ?? 'Ready to build?'}
          </CtaBandEyebrow>
          <CtaBandTitle className="text-3xl font-extrabold tracking-tight text-background sm:text-4xl md:text-5xl">
            {props.headline ?? 'Start building in minutes'}
          </CtaBandTitle>
          <CtaBandSubtitle className="text-background/70 opacity-100">
            {props.subheading ??
              'Grab an API key, follow the quickstart, and ship your first request — the full reference is one click away.'}
          </CtaBandSubtitle>
          <CtaBandActions className="mt-2 grid w-full grid-cols-2 gap-3 sm:flex sm:w-auto">
            <CtaAction
              variant="primary"
              asChild
              className="rounded-none bg-background px-6 py-3 text-sm font-semibold text-foreground shadow-[4px_4px_0_0] shadow-background/20 transition-[background-color,box-shadow,transform] duration-150 hover:bg-background/90 active:translate-y-px active:shadow-none"
            >
              <NavbarRouteLink href={props.primaryTarget ?? 'Getting Started'}>
                {props.primaryCta ?? 'Start building'}
              </NavbarRouteLink>
            </CtaAction>
            <CtaAction
              variant="outline"
              asChild
              className="rounded-none border-background/30 bg-transparent px-6 py-3 text-sm font-medium text-background transition-colors duration-150 hover:bg-background/10 active:translate-y-px"
            >
              <NavbarRouteLink href={props.secondaryTarget ?? 'API Reference'}>
                {props.secondaryCta ?? 'View API Reference'}
              </NavbarRouteLink>
            </CtaAction>
          </CtaBandActions>
        </CtaBandInner>
      </CtaBand>
    )
  },
})
