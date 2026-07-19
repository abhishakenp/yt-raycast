import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import {
  HeroSection,
  HeroBadge,
  HeroHeading,
  HeroSubheading,
  HeroMediaPanel,
} from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { ResponsiveGrid } from '#/section-kit/ResponsiveGrid.tsx'
import {
  StatGrid,
  StatItem,
  StatValue,
  StatLabel,
} from '#/section-kit/StatGrid.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * CrowdfundingHero — a 2-column campaign hero for a crowdfunding / pre-order
 * landing page. A clean, warm eco aesthetic on a card surface: on one side a
 * large product image with a 4-up thumbnail strip, on the other a funding
 * card showing a live badge + category, headline + subhead, the amount raised
 * vs goal, an animated progress bar, a percent-funded / stretch-goals-unlocked
 * banner with a check glyph, a three-up backers / early-bird / days-left stat
 * trio, a big "Back This Project" CTA and an all-or-nothing deadline note.
 * Links route through section-kit route links; imagery uses the alt-driven Image component.
 * Use as the opening hero for Kickstarter/Indiegogo-style raises, product
 * launches, fundraisers, or maker/hardware campaigns where funding progress and
 * a hard deadline must lead.
 */
export const CrowdfundingHero = defineCapsule({
  name: 'CrowdfundingHero',
  description:
    "A 2-column campaign hero for a crowdfunding / pre-order landing page with a clean, warm eco aesthetic on a card surface: on one side a large product image with a 4-up thumbnail strip, on the other a funding card showing a live badge + category, headline + subhead, the amount raised vs goal, an animated progress bar, a percent-funded / stretch-goals-unlocked banner with a check glyph, a three-up backers / early-bird / days-left stat trio, a big 'Back This Project' CTA and an all-or-nothing deadline note. Links route through section-kit route links; imagery uses the alt-driven Image component. Use as the opening hero for Kickstarter/Indiegogo-style raises, product launches, fundraisers, or maker/hardware campaigns where funding progress and a hard deadline must lead.",
  props: z.object({
    category: z.string().optional(),
    liveBadge: z.string().optional(),
    heading: z.string().optional(),
    subheading: z.string().optional(),
    mainImageAlt: z.string().optional(),
    thumbAlts: z.array(z.string()).optional(),
    raisedAmount: z.string().optional(),
    goalLabel: z.string().optional(),
    progressPercent: z.number().optional(),
    fundedBanner: z.string().optional(),
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    primaryCta: z.string().optional(),
    deadlineNote: z.string().optional(),
    /** Navigation target for the image gallery thumbnails. */
    galleryTarget: z.string().optional(),
    /** Navigation target for the primary "Back This Project" CTA. */
    rewardsTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heroCategory = props.category ?? 'Design & Technology'
    const heroLiveBadge = props.liveBadge ?? 'Live Project'
    const heroHeading =
      props.heading ??
      'EcoBrush: The Bamboo Electric Toothbrush That Returns to Earth'
    const heroSub =
      props.subheading ??
      '98% biodegradable. Zero plastic. Powerful sonic cleaning. The first electric toothbrush designed to gracefully return to nature at the end of its life.'
    const heroMainImageAlt =
      props.mainImageAlt ??
      'Elegant bamboo electric toothbrush displayed on marble countertop with natural morning light'
    const heroThumbAlts = props.thumbAlts?.length
      ? props.thumbAlts
      : [
          'Close-up view of bamboo toothbrush handle texture showing natural grain',
          'Electric toothbrush brush head detail showing biodegradable bristles',
          'EcoBrush packaging showing sustainable recycled cardboard box',
          'Family bathroom counter with EcoBrush charging base and accessories',
        ]
    const heroRaised = props.raisedAmount ?? '$487,293'
    const heroGoalLabel = props.goalLabel ?? 'raised of $75,000 goal'
    const heroProgress = Math.min(
      100,
      Math.max(0, props.progressPercent ?? 100),
    )
    const heroFundedBanner =
      props.fundedBanner ?? '649% funded — Stretch goals unlocked!'
    const heroStats = props.stats?.length
      ? props.stats
      : [
          { value: '12,847', label: 'backers' },
          { value: '$49', label: 'early bird' },
          { value: '18', label: 'days left' },
        ]
    const heroPrimary =
      props.primaryCta ?? 'Back This Project — Starting at $49'
    const heroDeadlineNote =
      props.deadlineNote ??
      'This project will only be funded if it reaches its goal by March 15, 2026 at 11:59 PM EST.'
    const galleryTarget = props.galleryTarget ?? 'Our Story'
    const rewardsTarget = props.rewardsTarget ?? 'Rewards'

    return (
      <HeroSection className={cn('bg-card', props.className)}>
        <Container size="xl" className="py-12 lg:py-20">
          <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Campaign image gallery */}
            <div className="order-2 lg:order-1">
              <HeroMediaPanel
                alt={heroMainImageAlt}
                w={1200}
                h={900}
                className="aspect-[4/3] bg-muted shadow-lg rounded-xl"
              />
              <ResponsiveGrid cols="4" className="mt-4 gap-4">
                {heroThumbAlts.map((alt) => (
                  <NavbarRouteLink
                    key={alt}
                    className="aspect-square overflow-hidden rounded-lg bg-muted transition-all hover:ring-2 hover:ring-ring"
                    href={galleryTarget}
                  >
                    <Image
                      alt={alt}
                      w={400}
                      h={400}
                      loading="lazy"
                      className="size-full object-cover"
                    />
                  </NavbarRouteLink>
                ))}
              </ResponsiveGrid>
            </div>

            {/* Campaign info */}
            <div className="order-1 lg:order-2">
              <div className="mb-4 flex items-center gap-2">
                <HeroBadge variant="solid" className="px-3 py-1 text-xs">
                  {heroLiveBadge}
                </HeroBadge>
                <span className="text-sm text-muted-foreground">
                  {heroCategory}
                </span>
              </div>
              <HeroHeading className="mb-4 text-3xl font-semibold sm:text-4xl lg:text-5xl">
                {heroHeading}
              </HeroHeading>
              <HeroSubheading className="mb-8 mt-0">{heroSub}</HeroSubheading>

              {/* Funding progress */}
              <div className="mb-8 rounded-xl bg-muted p-6">
                <div className="mb-2 flex items-baseline gap-2">
                  <span className="text-4xl font-bold sm:text-5xl">
                    {heroRaised}
                  </span>
                  <span className="text-lg text-muted-foreground">
                    {heroGoalLabel}
                  </span>
                </div>

                <div
                  className="mb-4 h-3 w-full overflow-hidden rounded-full bg-secondary"
                  role="progressbar"
                  aria-valuenow={heroProgress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Funding progress"
                >
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${heroProgress}%` }}
                  />
                </div>
                <div className="mb-6 flex items-center gap-2 font-medium text-primary">
                  <svg
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
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{heroFundedBanner}</span>
                </div>

                <StatGrid
                  columns={3}
                  className="border-t border-border pt-6 gap-6"
                >
                  {heroStats.map((s, i) => (
                    <StatItem
                      key={s.label}
                      align="center"
                      className={cn(i === 1 && 'border-x border-border')}
                    >
                      <StatValue
                        size="default"
                        className="text-2xl sm:text-3xl"
                      >
                        {s.value}
                      </StatValue>
                      <StatLabel>{s.label}</StatLabel>
                    </StatItem>
                  ))}
                </StatGrid>
              </div>

              <NavbarRouteLink
                className="mb-4 block w-full rounded-xl bg-foreground py-4 text-center text-lg font-semibold text-background transition-colors hover:bg-foreground/90"
                href={rewardsTarget}
              >
                {heroPrimary}
              </NavbarRouteLink>
              <p className="text-center text-sm text-muted-foreground">
                {heroDeadlineNote}
              </p>
            </div>
          </div>
        </Container>
      </HeroSection>
    )
  },
})
