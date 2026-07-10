import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { Card } from '#/section-kit/Card.tsx'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'

/**
 * FintechHero — split hero for a fintech / neobank / digital-banking landing
 * page. A two-column band: the left column carries a rounded trust badge pill,
 * a large headline with one phrase rendered in the primary highlight color, a
 * supporting paragraph, dual CTAs ("Open an Account" primary pill + a "See how"
 * ghost link with a play glyph), and a row of compliance trust badges ("FDIC
 * insured", "256-bit encryption", "SOC 2"). The right column frames a banking
 * app dashboard image inside a bordered card with a soft primary glow. Both
 * CTAs route through useNavigate. Premium, trustworthy, conversion-focused; use
 * as the opening hero for banking apps, wallets, payments, or lending products.
 * Renders fully with no props via baked-in "Vault" defaults.
 */
export const FintechHero = defineCapsule({
  name: 'FintechHero',
  description:
    "Split hero for a fintech / neobank / digital-banking landing page: a two-column band with a left column carrying a rounded trust badge pill, a large headline with one phrase in the primary highlight color, a supporting paragraph, dual CTAs ('Open an Account' primary pill + a ghost 'See how' link), and a row of compliance trust badges (FDIC insured, 256-bit encryption, SOC 2). The right column frames a banking app dashboard image inside a bordered card with a soft primary glow. CTAs route through useNavigate. Premium, trustworthy and conversion-focused; use as the opening hero for banking apps, wallets, payments, or lending products.",
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
    const go = useNavigate()
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

    return (
      <section
        className={cn(
          'relative overflow-hidden bg-background',
          props.className,
        )}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-1/3 -right-[15%] size-[700px] rounded-full bg-primary/[0.07] blur-3xl"
        />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-28">
          <div className="flex flex-col items-start gap-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-1.5 text-sm font-medium text-muted-foreground">
              <span
                className="size-2 rounded-full bg-primary"
                aria-hidden="true"
              />
              {badge}
            </span>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              {heading} <span className="text-primary">{highlight}</span>
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
              {subheading}
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => go(primaryTarget)}
                className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {primaryCta}
              </button>
              <button
                type="button"
                onClick={() => go(secondaryTarget)}
                className="inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="size-4 text-primary"
                  aria-hidden="true"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
                {secondaryCta}
              </button>
            </div>
            <ul className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2">
              {trustBadges.map((label) => (
                <li
                  key={label}
                  className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-4 text-primary"
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
          <div className="relative">
            <Card rounded="2xl" shadow="2xl" className="overflow-hidden p-2">
              <Image
                alt={imageAlt}
                w={720}
                h={540}
                className="aspect-[4/3] w-full rounded-xl object-cover"
              />
            </Card>
          </div>
        </div>
      </section>
    )
  },
})
