import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import {
  CtaBand,
  CtaBandInner,
  CtaBandTitle,
  CtaBandSubtitle,
  CtaAction,
} from '#/section-kit/CtaBand.tsx'
import { Watermark } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * CryptoContactCta — Web3-terminal inverted closing band for a crypto /
 * DeFi landing page. A `bg-foreground` section that cuts away on a slanted
 * clip-path bottom seam, left-aligned: mono "[ INIT ] START SEQUENCE"
 * micro-label, large tight-tracking headline, supporting paragraph, dual
 * square-cornered buttons (light-filled primary with hard offset shadow +
 * hairline outlined secondary, both with press feedback), and a
 * hairline-topped mono uppercase trust row with square tick markers. A
 * giant ghost Ξ watermark backs the band. All buttons route through
 * section-kit route links. Use as a closing conversion action for
 * protocols, chains, DeFi platforms, or Web3 infrastructure sites.
 */
export const CryptoContactCta = defineCapsule({
  name: 'CryptoContactCta',
  description:
    'Web3-terminal inverted closing band for a crypto / DeFi landing page: bg-foreground section with a slanted clip-path bottom seam, left-aligned mono micro-label, large tight headline, supporting paragraph, dual square buttons (light-filled primary with hard offset shadow + hairline outlined secondary), and a hairline-topped mono uppercase trust row with square tick markers, backed by a giant ghost Ξ watermark. All buttons route through section-kit route links. Use as a closing conversion action for protocols, chains, DeFi platforms, or Web3 infrastructure sites.',
  props: z.object({
    /** Headline text. */
    heading: z.string().optional(),
    /** Supporting paragraph. */
    description: z.string().optional(),
    /** Primary CTA label. */
    primaryCta: z.string().optional(),
    /** Secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Trust chips beneath the CTAs. */
    trust: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Start building on NexusChain today'
    const description =
      props.description ??
      'Join 340+ protocols processing $2.4B in daily volume. Deploy your first contract in minutes with our comprehensive developer tools.'
    const primaryCta = props.primaryCta ?? 'Get Started'
    const secondaryCta = props.secondaryCta ?? 'Contact Sales'
    const trust = props.trust?.length
      ? props.trust
      : [
          'Free testnet access',
          'No credit card required',
          'Enterprise support available',
        ]

    return (
      <CtaBand
        tone="primary"
        className={`relative overflow-hidden bg-foreground pb-10 text-background [clip-path:polygon(0_0,100%_0,100%_calc(100%-3rem),0_100%)] ${props.className ?? ''}`}
      >
        <Watermark className="right-2 top-1/2 -translate-y-1/2 text-[10rem] text-background/[0.05] sm:text-[16rem]">
          Ξ
        </Watermark>
        <CtaBandInner
          align="left"
          className="relative max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28"
        >
          <p
            aria-hidden="true"
            className="font-mono text-[11px] uppercase tracking-[0.2em] text-background/40"
          >
            [ init ] start sequence
          </p>
          <CtaBandTitle className="max-w-3xl text-[clamp(2rem,5vw,3.75rem)] font-extrabold leading-[1.02] tracking-tight">
            {heading}
          </CtaBandTitle>
          <CtaBandSubtitle className="text-background/60 opacity-100">
            {description}
          </CtaBandSubtitle>
          <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row sm:flex-wrap">
            <CtaAction
              variant="primary"
              invert
              className="rounded-none bg-background px-7 py-3 font-mono text-sm font-semibold uppercase tracking-wider text-foreground shadow-[4px_4px_0_0] shadow-background/25 transition-transform duration-150 hover:-translate-y-0.5 hover:bg-background/90 active:translate-y-px"
              asChild
            >
              <NavbarRouteLink href={primaryCta}>{primaryCta}</NavbarRouteLink>
            </CtaAction>
            <CtaAction
              variant="outline"
              className="rounded-none border-background/40 bg-transparent px-7 py-3 font-mono text-sm font-semibold uppercase tracking-wider text-background transition-colors duration-150 hover:bg-background/10 active:translate-y-px"
              asChild
            >
              <NavbarRouteLink href={secondaryCta}>
                {secondaryCta}
              </NavbarRouteLink>
            </CtaAction>
          </div>
          <div className="mt-4 flex w-full flex-wrap items-center gap-x-8 gap-y-3 border-t border-background/15 pt-6">
            {trust.map((t) => (
              <div key={t} className="flex items-center gap-2.5">
                <span aria-hidden="true" className="size-1.5 bg-primary" />
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-background/60">
                  {t}
                </span>
              </div>
            ))}
          </div>
        </CtaBandInner>
      </CtaBand>
    )
  },
})
