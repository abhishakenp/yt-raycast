import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'

/**
 * InvestingSteps — onboarding timeline + transfer CTA for an investing / fintech
 * page. A centered heading + lead above a responsive 3-step horizontal timeline
 * (large numbered primary tiles with connecting lines on desktop), followed by a
 * muted rounded panel pairing a portfolio-transfer headline + paragraph and an
 * arrow link with a supporting dashboard photo. The transfer link routes through
 * useNavigate. Use to explain how to get started — create account, fund,
 * trade — on a brokerage or trading-app page. Renders fully with no props.
 */
export const InvestingSteps = defineCapsule({
  name: 'InvestingSteps',
  description:
    'Onboarding timeline + transfer CTA for an investing / fintech page: a centered heading + lead above a responsive 3-step horizontal timeline (large numbered primary tiles with connecting lines on desktop), followed by a muted rounded panel pairing a portfolio-transfer headline + paragraph and an arrow link with a supporting dashboard photo. The transfer link routes through useNavigate. Use to explain how to get started (create account, fund, trade) on a brokerage or trading-app page.',
  props: z.object({
    /** Brand / platform name woven into the transfer copy. */
    brand: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Numbered steps: title + description. */
    items: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    /** Transfer panel headline. */
    transferHeading: z.string().optional(),
    /** Transfer panel paragraph. */
    transferDescription: z.string().optional(),
    /** Transfer panel arrow-link label. */
    transferCta: z.string().optional(),
    /** Alt text for the transfer panel photo. */
    transferImageAlt: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'Vestora'
    const heading = props.heading ?? 'Start investing in minutes'
    const description =
      props.description ??
      'A streamlined onboarding process designed to get you trading quickly and securely.'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Create your account',
            description:
              'Sign up in under 2 minutes. Verify your identity securely with our streamlined KYC process.',
          },
          {
            title: 'Fund your portfolio',
            description:
              'Connect your bank account for instant transfers. Start with as little as $1 or deposit up to $100,000.',
          },
          {
            title: 'Start trading',
            description:
              'Browse thousands of stocks, ETFs, and crypto. Place your first trade with zero commission.',
          },
        ]
    const transferHeading =
      props.transferHeading ?? 'Already have investments elsewhere?'
    const transferDescription =
      props.transferDescription ??
      `Our automated transfer service makes it easy to bring your portfolio to ${brand}. We'll handle the paperwork and reimburse any transfer fees up to $500.`
    const transferCta = props.transferCta ?? 'Learn about transfers'
    const transferImageAlt =
      props.transferImageAlt ??
      'laptop showing financial dashboard with charts and account balances'

    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    )

    return (
      <section className={cn('bg-background py-24', props.className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <div className="grid gap-8 lg:grid-cols-3 lg:gap-12">
            {items.map((step, i) => (
              <div key={step.title} className="relative">
                <div className="flex items-start gap-6 lg:flex-col lg:items-center">
                  <div className="grid size-16 flex-shrink-0 place-items-center rounded-2xl bg-primary text-2xl font-semibold text-primary-foreground">
                    {i + 1}
                  </div>
                  <div className="flex-1 lg:text-center">
                    <h3 className="mb-2 text-xl font-semibold">{step.title}</h3>
                    <p className="leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
                {i < items.length - 1 && (
                  <div
                    aria-hidden="true"
                    className="absolute left-full top-8 hidden h-0.5 w-full -translate-x-8 bg-border lg:block"
                  >
                    <div className="absolute -top-1.5 right-0 size-3 rounded-full bg-muted-foreground/40" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-16 rounded-2xl bg-muted/50 p-8 lg:p-12">
            <div className="grid items-center gap-8 lg:grid-cols-2">
              <div>
                <h3 className="mb-4 text-2xl font-semibold">
                  {transferHeading}
                </h3>
                <p className="mb-6 leading-relaxed text-muted-foreground">
                  {transferDescription}
                </p>
                <button
                  type="button"
                  onClick={() => go(transferCta)}
                  className="group inline-flex items-center gap-2 font-medium text-foreground transition-all hover:gap-3"
                >
                  {transferCta}
                  <ArrowRight className="size-5" />
                </button>
              </div>
              <div className="relative h-64 overflow-hidden rounded-xl lg:h-80">
                <Image
                  alt={transferImageAlt}
                  w={800}
                  h={600}
                  loading="lazy"
                  className="absolute inset-0 size-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  },
})
