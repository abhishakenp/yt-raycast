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
import { SupportBand } from '#/section-kit/SupportBand.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * KnowledgeBaseSupportCta — "Terminal-docs" inverted "still need help?" closing
 * band for a help center. The page's full ink inversion (bg-foreground /
 * text-background) cutting in on a slanted clip-path seam, built on the shared
 * `SupportBand` + `CtaBand` composites: a left-aligned column with a mono
 * `#`-anchored eyebrow carrying the availability / response-time note, an
 * extrabold headline, a muted supporting line, and two square CTAs — a light
 * hard-offset-shadow "live chat" button with press feedback beside a
 * hairline-outlined "email support" button. A giant ghost `#` watermark and a
 * decorative `⌘K` kbd-chip cluster (lg+) echo the hero's search grammar. Both
 * buttons route through section-kit route links. Use near the end of a
 * knowledge base, support portal or docs site to escalate visitors to human
 * support. Renders fully with no props via baked-in defaults. Theme tokens
 * only.
 */
export const KnowledgeBaseSupportCta = defineCapsule({
  name: 'KnowledgeBaseSupportCta',
  description:
    "Terminal-docs inverted 'still need help?' closing band for a help center: a full ink inversion (foreground background, background text) cutting in on a slanted clip-path seam, built on the shared SupportBand + CtaBand composites — a left-aligned mono '#'-anchored eyebrow carrying the availability / response-time note, an extrabold headline, a muted supporting line, and two square CTAs (a light hard-offset-shadow 'live chat' button with press feedback + a hairline-outlined 'email support' button) under a giant ghost '#' watermark and a decorative '⌘K' kbd-chip cluster. Both buttons route through section-kit route links. Use near the end of a knowledge base, support portal or docs site to escalate visitors to human support.",
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    primaryCta: z.string().optional(),
    secondaryCta: z.string().optional(),
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Still need help?'
    const description =
      props.description ??
      'Our support team is available Monday through Friday, 9 AM to 6 PM EST. Enterprise customers have 24/7 priority support.'
    const primaryCta = props.primaryCta ?? 'Start live chat'
    const secondaryCta = props.secondaryCta ?? 'Email support'
    const note =
      props.note ??
      'Average response time: Under 2 hours for email, Instant for live chat'

    const kbdChip =
      'inline-flex min-w-7 items-center justify-center rounded-none border border-background/25 bg-background/5 px-2 py-1 font-mono text-xs text-background/70'

    return (
      <SupportBand asChild variant="inverted">
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
              {note}
            </CtaBandEyebrow>
            <CtaBandTitle className="text-3xl font-extrabold tracking-tight text-background sm:text-4xl md:text-5xl">
              {heading}
            </CtaBandTitle>
            <CtaBandSubtitle className="text-background/70 opacity-100">
              {description}
            </CtaBandSubtitle>
            <CtaBandActions className="mt-2 grid w-full grid-cols-2 gap-3 sm:flex sm:w-auto">
              <CtaAction
                variant="primary"
                asChild
                className="rounded-none bg-background px-6 py-3 text-sm font-semibold text-foreground shadow-[4px_4px_0_0] shadow-background/20 transition-[background-color,box-shadow,transform] duration-150 hover:bg-background/90 active:translate-y-px active:shadow-none"
              >
                <NavbarRouteLink href={primaryCta}>
                  {primaryCta}
                </NavbarRouteLink>
              </CtaAction>
              <CtaAction
                variant="outline"
                asChild
                className="rounded-none border-background/30 bg-transparent px-6 py-3 text-sm font-medium text-background transition-colors duration-150 hover:bg-background/10 active:translate-y-px"
              >
                <NavbarRouteLink href={secondaryCta}>
                  {secondaryCta}
                </NavbarRouteLink>
              </CtaAction>
            </CtaBandActions>
          </CtaBandInner>
        </CtaBand>
      </SupportBand>
    )
  },
})
