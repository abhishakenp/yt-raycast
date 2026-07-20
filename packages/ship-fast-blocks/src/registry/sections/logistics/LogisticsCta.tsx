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
 * LogisticsCta — an industrial-manifest inverted closing call-to-action band for
 * a global-logistics / freight-forwarding company. A full `bg-foreground
 * text-background` inversion band that cuts in on a slanted top seam with a giant
 * ghost route-arrow watermark behind: a centered mono reassurance meta line, an
 * extrabold display heading, a supporting paragraph, a pair of square buttons (a
 * solid background-surface primary with a trailing arrow plus a hairline outline
 * secondary, both with press feedback) routed through section-kit route links.
 * Precise and operational, tokens-only so it inverts cleanly in light and dark.
 * Use as the final conversion prompt for logistics, freight-forwarding, shipping,
 * courier or cargo/transport companies. Renders fully with no props.
 */
export const LogisticsCta = defineCapsule({
  name: 'LogisticsCta',
  description:
    'Industrial-manifest inverted closing call-to-action band for a global-logistics / freight-forwarding company: a bg-foreground inversion band with a slanted top seam and giant ghost route-arrow watermark, a centered mono reassurance meta line, an extrabold display heading, a supporting paragraph, and a pair of square buttons (a solid background-surface primary with a trailing arrow plus a hairline outline secondary, both with press feedback) routed through section-kit route links. Precise and operational, tokens-only. Use as the final conversion prompt for logistics, freight-forwarding, shipping, courier, supply-chain or cargo/transport companies.',
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    primary: z.string().optional(),
    secondary: z.string().optional(),
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Ready to ship smarter?'
    const description =
      props.description ??
      'Join 3,400+ companies that trust SwiftFreight to move their cargo. Get your first quote in under 3 minutes.'
    const primary = props.primary ?? 'Get instant quote'
    const secondary = props.secondary ?? 'Talk to sales'
    const note =
      props.note ??
      'No account required for quotes. Volume discounts available for 50+ shipments/month.'

    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    )

    return (
      <CtaBand
        tone="primary"
        className={
          'relative overflow-hidden bg-foreground pt-10 text-background [clip-path:polygon(0_0,100%_2.5rem,100%_100%,0_100%)] sm:pt-14' +
          (props.className ? ' ' + props.className : '')
        }
      >
        <Watermark className="-bottom-10 -right-4 font-mono text-[8rem] tracking-tighter text-background/[0.05] sm:text-[12rem] lg:text-[15rem]">
          &rarr;&rarr;
        </Watermark>
        <CtaBandInner className="relative gap-6 py-16 sm:py-20">
          <CtaBandEyebrow className="font-mono text-[11px] uppercase tracking-[0.2em] text-background/50 opacity-100">
            {note}
          </CtaBandEyebrow>
          <CtaBandTitle className="text-3xl font-extrabold tracking-tight text-background sm:text-5xl">
            {heading}
          </CtaBandTitle>
          <CtaBandSubtitle className="text-background/60 opacity-100">
            {description}
          </CtaBandSubtitle>
          <CtaBandActions className="w-full flex-col sm:w-auto sm:flex-row sm:flex-wrap">
            <CtaAction
              variant="primary"
              asChild
              className="rounded-none bg-background px-6 py-3 font-mono text-sm font-semibold uppercase tracking-wide text-foreground transition-colors hover:bg-background/90 active:translate-y-px"
            >
              <NavbarRouteLink href={primary}>
                {primary}
                <ArrowRight className="size-4" />
              </NavbarRouteLink>
            </CtaAction>
            <CtaAction
              variant="outline"
              asChild
              className="rounded-none border border-background/30 bg-transparent px-6 py-3 font-mono text-sm font-semibold uppercase tracking-wide text-background transition-colors hover:bg-background/10 active:translate-y-px"
            >
              <NavbarRouteLink href={secondary}>{secondary}</NavbarRouteLink>
            </CtaAction>
          </CtaBandActions>
        </CtaBandInner>
      </CtaBand>
    )
  },
})
