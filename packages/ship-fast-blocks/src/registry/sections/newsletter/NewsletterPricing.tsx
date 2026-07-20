import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  PricingTier,
  PricingTierBadge,
  PricingTierPrice,
  PricingTierTagline,
  PricingTierFeatures,
} from '#/section-kit/PricingGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { ResponsiveGrid } from '#/section-kit/ResponsiveGrid.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import { newsletterLakebed } from './newsletter-lakebed.ts'
import { NewsletterSubscribeForm } from './newsletter-interactions.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * NewsletterPricing — newsprint-lite Free vs Paid comparison for a newsletter. On
 * a muted band ruled top and bottom: a hairline meta rail (a primary square +
 * mono "Membership" label, a mono plan count) tops a left-aligned serif heading +
 * lede over a 2-up comparison. The Free card is a square (rounded-none) hairline
 * panel with a mono "Plan 01 / Free" tier label, a serif price, tagline, a
 * hairline-divided check-marked feature list, and its own square inline email
 * capture + mono uppercase submit (press feedback); the Paid card is an inverted
 * foreground panel with a square "Most Popular" badge, a mono "Plan 02" tier
 * label, a giant ghost price watermark behind a serif price + period, tagline, a
 * check-marked feature list, an inverted square email capture + submit, and a
 * small note. A centered footnote with an inline link closes the section. Each
 * form submit writes to the shared Lakebed subscriber list and the footnote link
 * routes through section-kit route links. Use for free/paid subscription tiers on
 * newsletters, publications, blogs, or content creators. Renders fully with no
 * props via baked-in defaults.
 */
export const NewsletterPricing = defineCapsule({
  name: 'NewsletterPricing',
  description:
    "Newsprint-lite Free vs Paid comparison for a newsletter on a muted band ruled top and bottom: a hairline meta rail (a primary square + mono 'Membership' label, a mono plan count) above a left-aligned serif heading + lede over a 2-up comparison. The Free card is a square (rounded-none) hairline panel with a mono 'Plan 01 / Free' tier label, a serif price, tagline, a hairline-divided check-marked feature list, and its own square inline email capture + mono uppercase submit (press feedback); the Paid card is an inverted foreground panel with a square 'Most Popular' badge, a mono 'Plan 02' tier label, a giant ghost price watermark behind a serif price + period, tagline, a check-marked feature list, an inverted square email capture + submit, and a small note. A centered footnote with an inline link closes the section. Each form submit writes to the shared Lakebed subscriber list and the footnote link routes through section-kit route links. Use for free/paid subscription tiers on newsletters, publications, blogs, or content creators.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting lede under the heading. */
    description: z.string().optional(),
    /** Shared email input placeholder for both plans. */
    emailPlaceholder: z.string().optional(),
    /** Free plan content. */
    free: z
      .object({
        price: z.string().optional(),
        tagline: z.string().optional(),
        submit: z.string().optional(),
        features: z.array(z.string()).optional(),
      })
      .optional(),
    /** Paid plan content. */
    paid: z
      .object({
        badge: z.string().optional(),
        price: z.string().optional(),
        period: z.string().optional(),
        tagline: z.string().optional(),
        submit: z.string().optional(),
        note: z.string().optional(),
        features: z.array(z.string()).optional(),
      })
      .optional(),
    /** Footnote prefix before the inline link. */
    footnotePrefix: z.string().optional(),
    /** Footnote inline link label (also the navigate target). */
    footnoteLink: z.string().optional(),
    /** Footnote suffix after the inline link. */
    footnoteSuffix: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: newsletterLakebed,
  component: ({ props, lakebed }) => {
    const heading = props.heading ?? 'Choose Your Experience'
    const description =
      props.description ?? "Free to start. Upgrade when you're ready for more."
    const emailPlaceholder = props.emailPlaceholder ?? 'your@email.com'
    const freePrice = props.free?.price ?? 'Free'
    const freeTagline = props.free?.tagline ?? 'Perfect for getting started'
    const freeSubmit = props.free?.submit ?? 'Subscribe Free'
    const freeFeatures = props.free?.features?.length
      ? props.free.features
      : [
          'Weekly essay in your inbox',
          'Access to 3 months of archives',
          'Reply to any issue',
        ]
    const paidBadge = props.paid?.badge ?? 'Most Popular'
    const paidPrice = props.paid?.price ?? '$8'
    const paidPeriod = props.paid?.period ?? '/month'
    const paidTagline = props.paid?.tagline ?? 'For the dedicated reader'
    const paidSubmit = props.paid?.submit ?? 'Upgrade — $8/month'
    const paidNote = props.paid?.note ?? 'Annual billing saves 20% ($76/year)'
    const paidFeatures = props.paid?.features?.length
      ? props.paid.features
      : [
          'Everything in Free',
          'Complete archive (156 issues)',
          'Audio versions (podcast feed)',
          'Private Discord community',
          'Monthly AMA sessions',
          'Support independent writing',
        ]
    const footnotePrefix = props.footnotePrefix ?? 'Need a team subscription? '
    const footnoteLink = props.footnoteLink ?? 'Contact us'
    const footnoteSuffix = props.footnoteSuffix ?? ' for enterprise pricing.'

    const Check = ({ className }: { className?: string }) => (
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
        <path d="M5 13l4 4L19 7" />
      </svg>
    )

    return (
      <section
        className={cn(
          'border-y border-border bg-muted/40 py-16 md:py-24 lg:py-28',
          props.className,
        )}
      >
        <Container size="lg">
          <div className="mb-8 flex items-center justify-between gap-4 border-b border-border pb-4">
            <MonoTag className="flex items-center gap-3 tracking-[0.25em]">
              <span aria-hidden="true" className="size-1.5 bg-primary" />
              Membership
            </MonoTag>
            <MonoTag className="tracking-[0.25em]">02 Plans</MonoTag>
          </div>

          <SectionHeading
            title={heading}
            subtitle={description}
            align="left"
            className="mb-12 max-w-3xl gap-4 md:mb-16"
            titleClassName="font-serif text-3xl font-medium text-foreground sm:text-4xl"
            subtitleClassName="max-w-2xl text-lg text-muted-foreground"
          />

          <ResponsiveGrid cols="1-md-2" className="mx-auto max-w-4xl gap-0">
            {/* Free Plan */}
            <PricingTier className="gap-0 rounded-none border-border bg-background p-8 shadow-none lg:p-10">
              <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Plan 01 / Free
              </p>
              <div className="mb-2 flex items-baseline gap-1">
                <PricingTierPrice className="font-serif text-5xl font-medium tabular-nums">
                  {freePrice}
                </PricingTierPrice>
              </div>
              <PricingTierTagline className="mb-6">
                {freeTagline}
              </PricingTierTagline>

              <PricingTierFeatures className="mb-8 gap-0 divide-y divide-border border-y border-border">
                {freeFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-3 py-3">
                    <Check className="mt-0.5 size-5 flex-shrink-0 text-muted-foreground" />
                    <span className="text-foreground/80">{f}</span>
                  </li>
                ))}
              </PricingTierFeatures>

              <NewsletterSubscribeForm
                lakebed={lakebed}
                source={freeSubmit}
                placeholder={emailPlaceholder}
                buttonLabel={freeSubmit}
                successMessage="You're on the free list. The next issue will arrive by email."
                className="space-y-2.5"
                inputClassName="w-full rounded-none border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground transition-colors focus:border-foreground focus:outline-none"
                buttonClassName="w-full rounded-none bg-foreground px-6 py-3 font-mono text-xs font-medium uppercase tracking-[0.15em] text-background transition-[transform,background-color] duration-150 hover:bg-foreground/90 active:translate-y-px disabled:pointer-events-none disabled:opacity-70"
                emailLabel="Email address for free subscription"
              />
            </PricingTier>

            {/* Paid Plan */}
            <PricingTier
              variant="highlighted"
              className="relative gap-0 overflow-hidden rounded-none border-0 bg-foreground p-8 text-background shadow-none ring-0 lg:p-10"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-3 top-16 select-none font-serif text-[9rem] font-medium leading-none tracking-tight text-background/[0.06] tabular-nums"
              >
                {paidPrice}
              </span>

              <div className="absolute right-4 top-4">
                <PricingTierBadge className="rounded-none bg-background/15 font-mono text-[11px] uppercase tracking-[0.15em] text-background">
                  {paidBadge}
                </PricingTierBadge>
              </div>

              <p className="relative mb-6 font-mono text-[11px] uppercase tracking-[0.2em] text-background/60">
                Plan 02 / Paid
              </p>
              <div className="relative mb-2 flex items-baseline gap-1">
                <PricingTierPrice className="font-serif text-5xl font-medium text-background tabular-nums">
                  {paidPrice}
                </PricingTierPrice>
                <span className="text-background/60">{paidPeriod}</span>
              </div>
              <PricingTierTagline className="relative mb-6 text-background/70">
                {paidTagline}
              </PricingTierTagline>

              <PricingTierFeatures className="relative mb-8 gap-0 divide-y divide-background/15 border-y border-background/15">
                {paidFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-3 py-3">
                    <Check className="mt-0.5 size-5 flex-shrink-0 text-background/60" />
                    <span className="text-background/80">{f}</span>
                  </li>
                ))}
              </PricingTierFeatures>

              <NewsletterSubscribeForm
                lakebed={lakebed}
                source={paidSubmit}
                placeholder={emailPlaceholder}
                buttonLabel={paidSubmit}
                successMessage="You're on the paid list. Watch your inbox for next steps."
                className="relative space-y-2.5"
                inputClassName="w-full rounded-none border border-background/30 bg-background/10 px-4 py-3 text-background placeholder:text-background/50 transition-colors focus:border-background focus:outline-none"
                buttonClassName="w-full rounded-none bg-background px-6 py-3 font-mono text-xs font-medium uppercase tracking-[0.15em] text-foreground transition-[transform,background-color] duration-150 hover:bg-background/90 active:translate-y-px disabled:pointer-events-none disabled:opacity-70"
                emailLabel="Email address for paid subscription"
                statusClassName="text-background/60"
              />

              <p className="relative mt-4 text-center text-sm text-background/60">
                {paidNote}
              </p>
            </PricingTier>
          </ResponsiveGrid>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            {footnotePrefix}
            <NavbarRouteLink
              className="text-foreground underline hover:no-underline"
              href={footnoteLink}
            >
              {footnoteLink}
            </NavbarRouteLink>
            {footnoteSuffix}
          </p>
        </Container>
      </section>
    )
  },
})
