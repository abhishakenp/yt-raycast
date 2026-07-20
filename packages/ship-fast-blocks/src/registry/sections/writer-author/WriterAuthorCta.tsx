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
import { Watermark } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * WriterAuthorCta — the page's one dramatic inverted band: a full-width
 * bg-foreground/text-background book-purchase panel that cuts in on a slanted
 * clip-path seam, over a giant ghost serif initial watermark. A mono "OUT NOW"
 * eyebrow sits above a serif headline, a short supporting subheading, and a
 * left-aligned row of two rounded-none CTAs — a high-contrast light "Buy the
 * Book" pill (auto-inverted for the dark band, carrying a hard offset shadow
 * that presses in on click) plus a hairline outlined "Find a Store" button that
 * routes to the store locator. Both actions navigate through the kit's
 * section-kit route links so neither is a dead link. Use near the bottom of an
 * author, novelist, poet, or book-launch page to drive sales. Renders fully
 * with no props via baked-in "Eleanor Vance" defaults.
 */
export const WriterAuthorCta = defineCapsule({
  name: 'WriterAuthorCta',
  description:
    "The page's one dramatic inverted band: a full-width bg-foreground/text-background book-purchase panel that cuts in on a slanted clip-path seam over a giant ghost serif initial watermark, with a mono 'OUT NOW' eyebrow, a serif headline, a short supporting subheading, and a left-aligned row of two rounded-none CTAs (a high-contrast light 'Buy the Book' pill with a hard offset shadow plus a hairline outlined 'Find a Store' button). Both CTAs route through section-kit route links. Use near the bottom of an author, novelist, poet, or book-launch page to drive book sales.",
  props: z.object({
    /** Small eyebrow line above the headline (maps to CtaBand eyebrow). */
    eyebrow: z.string().optional(),
    /** Purchase headline (maps to CtaBand title). */
    title: z.string().optional(),
    /** Short supporting line under the headline (maps to CtaBand subtitle). */
    subtitle: z.string().optional(),
    /** High-contrast primary CTA label. */
    primaryLabel: z.string().optional(),
    /** Route label the primary CTA navigates to. */
    primaryTarget: z.string().optional(),
    /** Outlined secondary CTA label. */
    secondaryLabel: z.string().optional(),
    /** Route label the secondary CTA navigates to. */
    secondaryTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Out now'
    const title = props.title ?? 'Get your copy today'
    const subtitle =
      props.subtitle ??
      "Eleanor Vance's latest novel is available now wherever books are sold."
    const primaryLabel = props.primaryLabel ?? 'Buy the Book'
    const primaryTarget = props.primaryTarget ?? 'Books'
    const secondaryLabel = props.secondaryLabel ?? 'Find a Store'
    const secondaryTarget = props.secondaryTarget ?? 'Stores'
    const initial = title.trim().charAt(0) || 'V'

    return (
      <CtaBand
        tone="primary"
        className={cn(
          'relative overflow-hidden bg-foreground text-background [clip-path:polygon(0_3rem,100%_0,100%_100%,0_100%)]',
          props.className,
        )}
      >
        <Watermark className="-bottom-24 right-2 font-serif text-[18rem] leading-none text-background/10 sm:text-[24rem] lg:text-[30rem]">
          {initial}
        </Watermark>
        <CtaBandInner align="left" className="relative pt-24">
          <CtaBandEyebrow className="font-mono text-[11px] tracking-[0.22em] opacity-70">
            {eyebrow}
          </CtaBandEyebrow>
          <CtaBandTitle className="max-w-2xl font-serif text-4xl font-normal tracking-tight md:text-5xl">
            {title}
          </CtaBandTitle>
          <CtaBandSubtitle className="max-w-xl text-background/70">
            {subtitle}
          </CtaBandSubtitle>
          <CtaBandActions align="left" className="mt-4">
            <CtaAction
              variant="primary"
              invert
              asChild
              className="rounded-none px-8 py-4 shadow-[5px_5px_0_0] shadow-background/25 transition-transform duration-100 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
            >
              <NavbarRouteLink href={primaryTarget}>
                {primaryLabel}
              </NavbarRouteLink>
            </CtaAction>
            <CtaAction
              variant="outline"
              asChild
              className="rounded-none border-background/40 bg-transparent px-8 py-4 text-background transition-transform duration-100 hover:bg-background/10 active:translate-y-px"
            >
              <NavbarRouteLink href={secondaryTarget}>
                {secondaryLabel}
              </NavbarRouteLink>
            </CtaAction>
          </CtaBandActions>
        </CtaBandInner>
      </CtaBand>
    )
  },
})
