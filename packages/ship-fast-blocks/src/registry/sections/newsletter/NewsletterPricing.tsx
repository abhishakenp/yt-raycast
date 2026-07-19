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
import { newsletterLakebed } from './newsletter-lakebed.ts'
import { NewsletterSubscribeForm } from './newsletter-interactions.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * NewsletterPricing — two-tier Free vs Paid pricing comparison for a newsletter.
 * On a muted band bordered top and bottom: a centered serif heading + lede over a
 * 2-up grid. The Free card is a light bordered panel with a serif price, tagline,
 * a check-marked feature list, and its own inline email capture + solid submit;
 * the Paid card is an inverted foreground panel with a "Most Popular" badge, a
 * serif price + period, tagline, a check-marked feature list, an inverted email
 * capture + submit, and a small note. A centered footnote with an inline link
 * (e.g. team/enterprise contact) closes the section. Each form submit writes to
 * the shared Lakebed subscriber list and the footnote link routes through
 * section-kit route links. Use for free/paid subscription tiers on newsletters,
 * publications, blogs, or content creators. Renders fully with no props via
 * baked-in defaults.
 */
export const NewsletterPricing = defineCapsule({
  name: 'NewsletterPricing',
  description:
    "Two-tier Free vs Paid pricing comparison for a newsletter on a muted band bordered top and bottom: a centered serif heading + lede over a 2-up grid. The Free card is a light bordered panel with a serif price, tagline, a check-marked feature list, and its own inline email capture + solid submit; the Paid card is an inverted foreground panel with a 'Most Popular' badge, a serif price + period, tagline, a check-marked feature list, an inverted email capture + submit, and a small note. A centered footnote with an inline link (e.g. team/enterprise contact) closes the section. Each form submit writes to the shared Lakebed subscriber list and the footnote link routes through section-kit route links. Use for free/paid subscription tiers on newsletters, publications, blogs, or content creators.",
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
          <SectionHeading
            title={heading}
            subtitle={description}
            className="mx-auto mb-12 max-w-2xl gap-0 md:mb-16"
            titleClassName="mb-4 font-serif text-3xl font-medium text-foreground sm:text-4xl"
            subtitleClassName="text-lg text-muted-foreground"
          />

          <ResponsiveGrid cols="1-md-2" className="mx-auto max-w-4xl">
            {/* Free Plan */}
            <PricingTier className="gap-0 p-8 lg:p-10">
              <div className="mb-2 flex items-baseline gap-1">
                <PricingTierPrice className="font-serif text-4xl font-medium">
                  {freePrice}
                </PricingTierPrice>
              </div>
              <PricingTierTagline className="mb-6">
                {freeTagline}
              </PricingTierTagline>

              <PricingTierFeatures className="mb-8 gap-0 space-y-4">
                {freeFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-3">
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
                className="space-y-3"
                inputClassName="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder-muted-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring"
                buttonClassName="w-full rounded-lg bg-foreground px-6 py-3 font-medium text-background transition-colors hover:bg-foreground/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-70"
                emailLabel="Email address for free subscription"
              />
            </PricingTier>

            {/* Paid Plan */}
            <PricingTier
              variant="highlighted"
              className="relative gap-0 overflow-hidden rounded-2xl border-0 bg-foreground p-8 text-background shadow-none ring-0 lg:p-10"
            >
              <div className="absolute right-4 top-4">
                <PricingTierBadge className="bg-background/20 text-background">
                  {paidBadge}
                </PricingTierBadge>
              </div>

              <div className="mb-2 flex items-baseline gap-1">
                <PricingTierPrice className="font-serif text-4xl font-medium text-background">
                  {paidPrice}
                </PricingTierPrice>
                <span className="text-background/60">{paidPeriod}</span>
              </div>
              <PricingTierTagline className="mb-6 text-background/70">
                {paidTagline}
              </PricingTierTagline>

              <PricingTierFeatures className="mb-8 gap-0 space-y-4">
                {paidFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-3">
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
                className="space-y-3"
                inputClassName="w-full rounded-lg border border-background/20 bg-background/10 px-4 py-3 text-background placeholder-background/50 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-background"
                buttonClassName="w-full rounded-lg bg-background px-6 py-3 font-medium text-foreground transition-colors hover:bg-background/90 focus:outline-none focus:ring-2 focus:ring-background focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-70"
                emailLabel="Email address for paid subscription"
                statusClassName="text-background/60"
              />

              <p className="mt-4 text-center text-sm text-background/60">
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
