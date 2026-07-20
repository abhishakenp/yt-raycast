import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

/**
 * InvestingSteps — Swiss-fintech onboarding ledger + transfer panel for an
 * investing / brokerage page. An asymmetric mono header (heading + lede left,
 * tabular step count right) sits above a collapsed-border 3-step ledger whose
 * cells share hairline rules and carry a giant ghost numeral watermark, a mono
 * primary "step 01" label, a title, and a description, followed by a
 * hairline-framed transfer panel on an asymmetric 7/5 split pairing a
 * portfolio-transfer headline + paragraph and a square arrow CTA (hard offset
 * shadow, press feedback) with a supporting dashboard photo. The transfer CTA
 * routes through route links. Use to explain how to get started — create
 * account, fund, trade — on a brokerage or trading-app page. Renders fully with
 * no props.
 */
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import { StepTimeline, StepItem } from '#/section-kit/StepTimeline.tsx'
import { ResponsiveGrid } from '#/section-kit/ResponsiveGrid.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
export const InvestingSteps = defineCapsule({
  name: 'InvestingSteps',
  description:
    'Swiss-fintech onboarding ledger + transfer panel for an investing / brokerage page: an asymmetric mono header (heading + lede left, tabular step count right) above a collapsed-border 3-step ledger whose cells share hairline rules and carry a giant ghost numeral watermark, a mono primary step label, a title and a description, followed by a hairline-framed transfer panel on a 7/5 split pairing a portfolio-transfer headline + paragraph and a square arrow CTA (hard offset shadow, press feedback) with a supporting dashboard photo. The transfer CTA routes through section-kit route links. Use to explain how to get started (create account, fund, trade) on a brokerage or trading-app page.',
  props: z.object({
    /** Brand / platform name woven into the transfer copy. */
    brand: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Numbered steps: title + description. */
    items: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
        }),
      )
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
      <StepTimeline
        className={cn('pt-24 pb-20 lg:pt-28 lg:pb-28', props.className)}
      >
        <Container>
          <div className="mb-12 flex flex-col gap-6 border-b border-border pb-6 md:flex-row md:items-end md:justify-between lg:mb-14">
            <div className="max-w-2xl">
              <MonoTag className="mb-4 block">
                Getting started
                <span aria-hidden="true" className="text-primary">
                  {' '}
                  / {String(items.length).padStart(2, '0')}
                </span>
              </MonoTag>
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground text-balance sm:text-4xl">
                {heading}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground text-pretty">
                {description}
              </p>
            </div>
            <MonoTag
              aria-hidden="true"
              tone="faint"
              className="shrink-0 tabular-nums"
            >
              [ {String(items.length).padStart(2, '0')} steps ]
            </MonoTag>
          </div>

          <ResponsiveGrid
            cols="1-md-3"
            className="gap-0 border-l border-t border-border"
          >
            {items.map((step, i) => (
              <StepItem
                key={step.title}
                className="relative overflow-hidden border-b border-r border-border p-7 sm:p-8"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute right-4 top-3 select-none font-mono text-7xl font-extrabold leading-none tabular-nums text-foreground/[0.06]"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <MonoTag className="text-primary">
                  Step {String(i + 1).padStart(2, '0')}
                </MonoTag>
                <h3 className="mt-4 text-xl font-semibold tracking-tight text-foreground">
                  {step.title}
                </h3>
                <p className="mt-3 leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </StepItem>
            ))}
          </ResponsiveGrid>

          <div className="relative mt-10 overflow-hidden border border-border bg-muted/40">
            <div className="grid items-stretch lg:grid-cols-12">
              <div className="p-8 lg:col-span-7 lg:p-12">
                <MonoTag className="mb-4 block">Transfer</MonoTag>
                <h3 className="text-2xl font-extrabold tracking-tight text-foreground">
                  {transferHeading}
                </h3>
                <p className="mb-8 mt-4 leading-relaxed text-muted-foreground">
                  {transferDescription}
                </p>
                <NavbarRouteLink
                  className="group inline-flex items-center gap-2 rounded-none border border-foreground bg-background px-5 py-3 text-sm font-medium text-foreground shadow-[4px_4px_0_0] shadow-foreground transition-[transform,box-shadow,background-color] duration-150 hover:bg-muted active:translate-x-[2px] active:translate-y-[2px] active:shadow-none motion-reduce:transform-none"
                  href={transferCta}
                >
                  {transferCta}
                  <ArrowRight className="size-4 transition-transform duration-150 group-hover:translate-x-0.5 motion-reduce:transform-none" />
                </NavbarRouteLink>
              </div>
              <div className="relative min-h-[240px] lg:col-span-5 lg:min-h-full">
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
        </Container>
      </StepTimeline>
    )
  },
})
