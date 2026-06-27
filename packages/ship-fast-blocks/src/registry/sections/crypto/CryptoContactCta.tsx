import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
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
      <section
        className={cn(
          'bg-foreground py-20 text-background lg:py-32',
          props.className,
        )}
      >
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-6 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
            {heading}
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-background/60">
            {description}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              type="button"
              onClick={() => go(primaryCta)}
              className="rounded-lg bg-background px-8 py-3 font-medium text-foreground transition-colors hover:bg-background/90"
            >
              {primaryCta}
            </button>
            <button
              type="button"
              onClick={() => go(secondaryCta)}
              className="rounded-lg border border-background/40 px-8 py-3 font-medium text-background transition-colors hover:bg-background/10"
            >
              {secondaryCta}
            </button>
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-background/50">
            {trust.map((t) => (
              <div key={t} className="flex items-center gap-2">
                <CheckCircle className="size-4" />
                <span>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
