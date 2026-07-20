import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { DotGrid, MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import { HeroSection } from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * FintechHero — Swiss-fintech asymmetric 7/5 split hero for a neobank /
 * digital-banking landing page. The left column carries a mono micro-label
 * index eyebrow + trust pill, a large tracking-tight headline with one phrase
 * in the primary highlight color, a supporting paragraph, dual CTAs (a square
 * binary-radius "Open an Account" primary with mechanical press feedback + a
 * ghost "See how" link with a play glyph), and a hairline mono row of
 * compliance trust badges. The narrower right column frames the banking-app
 * dashboard image in a sharp bordered card with a hard offset shadow, overlaid
 * by a floating hairline balance ledger — a giant tabular-nums currency figure,
 * a positive primary delta, and a div-built bar-chart motif — with a giant
 * ghost "$" watermark behind. Both CTAs route through route links. Precise,
 * calm, institutional; use as the opening hero for banking apps, wallets,
 * payments, or lending products. Renders fully with no props via baked-in
 * "Vault" defaults.
 */
export const FintechHero = defineCapsule({
  name: 'FintechHero',
  description:
    "Swiss-fintech asymmetric 7/5 split hero for a neobank / digital-banking landing page: a left column with a mono micro-label index eyebrow + trust pill, a large tracking-tight headline with one phrase in the primary highlight color, a supporting paragraph, dual CTAs (a square 'Open an Account' primary with press feedback + a ghost 'See how' link), and a hairline mono row of compliance trust badges (FDIC insured, 256-bit encryption, SOC 2). The narrower right column frames the banking-app dashboard image in a sharp bordered card with a hard offset shadow, overlaid by a floating hairline balance ledger (giant tabular currency figure, positive primary delta, div-built bar-chart motif) with a giant ghost '$' watermark behind. CTAs route through route links. Precise, calm and institutional; use as the opening hero for banking apps, wallets, payments, or lending products.",
  props: z.object({
    /** Trust badge pill text above the headline. */
    badge: z.string().optional(),
    /** Headline text before the highlighted phrase. */
    heading: z.string().optional(),
    /** Phrase inside the heading rendered in the primary highlight color. */
    highlight: z.string().optional(),
    /** Supporting paragraph under the headline. */
    subheading: z.string().optional(),
    /** Primary CTA label. */
    primaryCta: z.string().optional(),
    /** Navigation target for the primary CTA. */
    primaryTarget: z.string().optional(),
    /** Secondary (ghost) CTA label. */
    secondaryCta: z.string().optional(),
    /** Navigation target for the secondary CTA. */
    secondaryTarget: z.string().optional(),
    /** Compliance / trust badge labels shown beneath the CTAs. */
    trustBadges: z.array(z.string()).optional(),
    /** Alt text for the framed dashboard image. */
    imageAlt: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const badge = props.badge ?? 'Banking reimagined for the modern world'
    const heading = props.heading ?? 'Money that moves at'
    const highlight = props.highlight ?? 'the speed of you'
    const subheading =
      props.subheading ??
      'Open an account in minutes, send money instantly with zero fees, and grow your savings with industry-leading rates. All your finances, beautifully simple, in one secure place.'
    const primaryCta = props.primaryCta ?? 'Open an Account'
    const primaryTarget = props.primaryTarget ?? primaryCta
    const secondaryCta = props.secondaryCta ?? 'See how'
    const secondaryTarget = props.secondaryTarget ?? secondaryCta
    const trustBadges = props.trustBadges?.length
      ? props.trustBadges
      : ['FDIC insured', '256-bit encryption', 'SOC 2 compliant']
    const imageAlt = props.imageAlt ?? 'fintech banking app dashboard'
    const bars = ['h-4', 'h-7', 'h-5', 'h-9', 'h-6', 'h-11', 'h-8']

    return (
      <HeroSection
        variant="split"
        className={cn(
          'relative overflow-hidden bg-background',
          props.className,
        )}
      >
        <Watermark className="-top-10 right-[-2%] hidden text-[24rem] leading-none lg:block">
          $
        </Watermark>
        <Container className="relative grid items-center gap-12 py-20 sm:px-8 lg:grid-cols-12 lg:gap-14 lg:py-28">
          <div className="flex flex-col items-start gap-6 lg:col-span-7">
            <div className="flex items-center gap-3">
              <MonoTag className="text-primary">01 / Neobank</MonoTag>
              <span aria-hidden="true" className="h-px w-8 bg-border" />
              <MonoTag tone="faint">{badge}</MonoTag>
            </div>
            <h1 className="text-4xl font-extrabold leading-[1.02] tracking-tight text-foreground text-balance sm:text-5xl lg:text-6xl">
              {heading} <span className="text-primary">{highlight}</span>
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty">
              {subheading}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <NavbarRouteLink
                className="inline-flex items-center justify-center rounded-none bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-[5px_5px_0_0] shadow-foreground transition-[transform,box-shadow,background-color] duration-150 hover:bg-primary/90 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none motion-reduce:transform-none"
                href={primaryTarget}
              >
                {primaryCta}
              </NavbarRouteLink>
              <NavbarRouteLink
                className="inline-flex items-center gap-2 rounded-none border border-border px-5 py-3 text-sm font-medium text-foreground transition-[transform,background-color] duration-150 hover:bg-muted active:translate-y-px motion-reduce:transform-none"
                href={secondaryTarget}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="size-3.5 text-primary"
                  aria-hidden="true"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
                {secondaryCta}
              </NavbarRouteLink>
            </div>
            <ul className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-border pt-5">
              {trustBadges.map((label) => (
                <li
                  key={label}
                  className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-3.5 text-primary"
                    aria-hidden="true"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                  {label}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative lg:col-span-5">
            <DotGrid
              tone="border"
              className="-right-4 -top-4 hidden size-28 sm:block"
            />
            <div className="relative overflow-hidden border border-foreground bg-card shadow-[10px_10px_0_0] shadow-foreground">
              <Image
                alt={imageAlt}
                w={720}
                h={540}
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-4 w-[min(20rem,80%)] border border-border bg-background p-5 shadow-[6px_6px_0_0] shadow-foreground/15">
              <div className="flex items-center justify-between">
                <MonoTag tone="faint">Total balance</MonoTag>
                <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold tabular-nums text-primary">
                  <span aria-hidden="true">▲</span> 12.4%
                </span>
              </div>
              <p className="mt-2 text-3xl font-extrabold leading-none tracking-tight text-foreground tabular-nums">
                $48,209
                <span className="text-muted-foreground">.55</span>
              </p>
              <div aria-hidden="true" className="mt-4 flex items-end gap-1.5">
                {bars.map((h, i) => (
                  <span
                    key={i}
                    className={cn(
                      'w-full',
                      h,
                      i === bars.length - 1 ? 'bg-primary' : 'bg-foreground/20',
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        </Container>
      </HeroSection>
    )
  },
})
