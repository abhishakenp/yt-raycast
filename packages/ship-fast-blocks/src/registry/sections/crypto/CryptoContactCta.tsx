import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import {
  CtaBand,
  CtaBandInner,
  CtaBandTitle,
  CtaBandSubtitle,
  CtaAction,
} from '#/section-kit/CtaBand.tsx'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * CryptoContactCta — inverted dark final call-to-action band for a crypto /
 * DeFi landing page. A centered `bg-foreground` section with a large
 * headline, supporting paragraph, dual buttons (filled light primary +
 * outlined secondary), and trust chips with check-circle icons beneath.
 * All buttons route through useNavigate. Use as a closing conversion action
 * for protocols, chains, DeFi platforms, or Web3 infrastructure sites.
 */
export const CryptoContactCta = defineCapsule({
  name: 'CryptoContactCta',
  description:
    'Inverted dark final call-to-action band for a crypto / DeFi landing page: centered bg-foreground section with a large headline, supporting paragraph, dual buttons (filled light primary + outlined secondary), and trust chips with check-circle icons beneath. All buttons route through useNavigate. Use as a closing conversion action for protocols, chains, DeFi platforms, or Web3 infrastructure sites.',
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
    const go = useNavigate()
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

    const CheckCircle = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
    )

    return (
      <CtaBand
        tone="primary"
        className={`bg-foreground text-background ${props.className ?? ''}`}
      >
        <CtaBandInner>
          <CtaBandTitle>{heading}</CtaBandTitle>
          <CtaBandSubtitle>{description}</CtaBandSubtitle>
          <div className="flex flex-wrap justify-center gap-4">
            <CtaAction
              variant="primary"
              invert
              className="rounded-lg px-8 py-3 font-medium"
              onClick={() => go(primaryCta)}
            >
              {primaryCta}
            </CtaAction>
            <CtaAction
              variant="outline"
              className="rounded-lg border-background/40 px-8 py-3 font-medium text-background hover:bg-background/10"
              onClick={() => go(secondaryCta)}
            >
              {secondaryCta}
            </CtaAction>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-primary-foreground/60">
            {trust.map((t) => (
              <div key={t} className="flex items-center gap-2">
                <CheckCircle className="size-4" />
                <span>{t}</span>
              </div>
            ))}
          </div>
        </CtaBandInner>
      </CtaBand>
    )
  },
})
