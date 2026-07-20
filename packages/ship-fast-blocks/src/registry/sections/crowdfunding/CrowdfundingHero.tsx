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
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * CrowdfundingHero — playful-bold campaign hero for a crowdfunding / pre-order
 * landing page built around the campaign's central metaphor: a chunky
 * token-built progress bar. An asymmetric 7:5 split under a giant ghost
 * "FUNDED" watermark: on the left a rotated live-badge sticker pill + mono
 * category rail, an extrabold tight-tracked headline whose last word sits on a
 * tilted primary marker highlight, the subhead, then a hard-bordered funding
 * panel — giant tabular raised amount, the thick sharp-cornered progress bar
 * with quarter tick marks and a mono tabular percent chip, a rotated
 * stretch-goals sticker, and a collapsed-border backers / early-bird /
 * days-left stat ledger — followed by a full-width inverted "Back This
 * Project" block CTA with hard offset shadow + press feedback and a mono
 * deadline note. On the right the product photo in a sharp 2px-bordered plate
 * tilted over a primary-tinted offset frame, with a staggered 4-up thumbnail
 * strip. Links route through section-kit route links; imagery uses the
 * alt-driven Image component. Use as the opening hero for
 * Kickstarter/Indiegogo-style raises, product launches, fundraisers, or
 * maker/hardware campaigns where funding progress and a hard deadline must
 * lead.
 */
export const CrowdfundingHero = defineCapsule({
  name: 'CrowdfundingHero',
  description:
    "Playful-bold campaign hero for a crowdfunding / pre-order landing page built around a chunky token-built progress-bar motif: an asymmetric 7:5 split under a giant ghost 'FUNDED' watermark with a rotated live-badge sticker pill + mono category rail, an extrabold headline whose last word sits on a tilted primary marker highlight, a hard-bordered funding panel (giant tabular raised amount, thick sharp progress bar with tick marks and mono percent chip, rotated stretch-goals sticker, collapsed-border backers / early-bird / days-left stat ledger), a full-width inverted 'Back This Project' block CTA with hard offset shadow and press feedback, and a mono deadline note; the product photo sits in a tilted 2px-bordered plate over a primary-tinted offset frame with a staggered 4-up thumbnail strip. Links route through section-kit route links; imagery uses the alt-driven Image component. Use as the opening hero for Kickstarter/Indiegogo-style raises, product launches, fundraisers, or maker/hardware campaigns where funding progress and a hard deadline must lead.",
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

    // Split the headline so the last word can carry the tilted marker
    // highlight without changing the copy.
    const headingWords = heroHeading.trim().split(' ')
    const headingLast = headingWords.length > 1 ? headingWords.pop() : null
    const headingLead = headingWords.join(' ')

    return (
      <HeroSection
        className={cn('relative overflow-hidden bg-card', props.className)}
      >
        <Watermark className="-right-10 top-6 text-[7rem] sm:text-[11rem] lg:text-[16rem]">
          FUNDED
        </Watermark>
        <Container size="xl" className="relative py-14 lg:py-20">
          <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-10">
            {/* Campaign info — the wide 7-col side */}
            <div className="order-1 lg:col-span-7">
              <div className="mb-6 flex flex-wrap items-center gap-3">
                <HeroBadge
                  variant="solid"
                  className="-rotate-1 gap-2 rounded-full border-2 border-foreground bg-background px-3.5 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-foreground shadow-[3px_3px_0_0] shadow-primary/40"
                >
                  <span
                    aria-hidden="true"
                    className="size-2 rounded-full bg-primary"
                  />
                  {heroLiveBadge}
                </HeroBadge>
                <MonoTag>{heroCategory}</MonoTag>
                <span
                  aria-hidden="true"
                  className="hidden h-px min-w-8 flex-1 bg-border sm:block"
                />
              </div>

              <HeroHeading className="mb-5 text-4xl font-extrabold leading-[0.98] tracking-tighter sm:text-5xl lg:text-6xl">
                {headingLast ? (
                  <>
                    {headingLead}{' '}
                    <span className="relative inline-block whitespace-nowrap">
                      <span
                        aria-hidden="true"
                        className="absolute -inset-x-2 inset-y-0.5 -rotate-1 bg-primary"
                      />
                      <span className="relative text-primary-foreground">
                        {headingLast}
                      </span>
                    </span>
                  </>
                ) : (
                  heroHeading
                )}
              </HeroHeading>
              <HeroSubheading className="mb-8 mt-0 max-w-xl">
                {heroSub}
              </HeroSubheading>

              {/* Funding panel — progress bar is the hero motif */}
              <div className="mb-6 border-2 border-foreground bg-background p-5 sm:p-6">
                <div className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="text-4xl font-extrabold tracking-tight tabular-nums sm:text-5xl">
                    {heroRaised}
                  </span>
                  <MonoTag>{heroGoalLabel}</MonoTag>
                </div>

                <div className="mb-4 flex items-center gap-3">
                  <div
                    className="relative h-5 flex-1 border-2 border-foreground bg-muted"
                    role="progressbar"
                    aria-valuenow={heroProgress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Funding progress"
                  >
                    <div
                      className="h-full bg-primary transition-all duration-500"
                      style={{ width: `${heroProgress}%` }}
                    />
                    {/* Quarter tick marks over the track */}
                    <span
                      aria-hidden="true"
                      className="absolute inset-y-0 left-1/4 w-px bg-foreground/25"
                    />
                    <span
                      aria-hidden="true"
                      className="absolute inset-y-0 left-1/2 w-px bg-foreground/25"
                    />
                    <span
                      aria-hidden="true"
                      className="absolute inset-y-0 left-3/4 w-px bg-foreground/25"
                    />
                  </div>
                  <span className="shrink-0 border-2 border-foreground bg-foreground px-2 py-0.5 font-mono text-xs font-bold text-background tabular-nums">
                    {heroProgress}%
                  </span>
                </div>

                <div className="mb-6 flex">
                  <span className="inline-flex rotate-1 items-center gap-2 rounded-full border-2 border-foreground bg-background px-3.5 py-1.5 text-sm font-bold shadow-[3px_3px_0_0] shadow-foreground/20">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      className="text-primary"
                    >
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{heroFundedBanner}</span>
                  </span>
                </div>

                <StatGrid
                  columns={3}
                  className="gap-0 border-l-2 border-t-2 border-foreground/15"
                >
                  {heroStats.map((s) => (
                    <StatItem
                      key={s.label}
                      align="left"
                      className="gap-1 border-b-2 border-r-2 border-foreground/15 p-3 sm:p-4"
                    >
                      <StatValue
                        size="default"
                        className="text-2xl font-extrabold tracking-tight tabular-nums sm:text-3xl"
                      >
                        {s.value}
                      </StatValue>
                      <StatLabel className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                        {s.label}
                      </StatLabel>
                    </StatItem>
                  ))}
                </StatGrid>
              </div>

              <NavbarRouteLink
                className="mb-4 block w-full border-2 border-foreground bg-foreground py-4 text-center text-lg font-bold text-background shadow-[5px_5px_0_0] shadow-primary/40 transition-all hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0] hover:shadow-primary/40 active:translate-y-px active:shadow-none"
                href={rewardsTarget}
              >
                {heroPrimary}
              </NavbarRouteLink>
              <p className="font-mono text-xs leading-relaxed text-muted-foreground">
                {heroDeadlineNote}
              </p>
            </div>

            {/* Campaign image gallery — the narrow 5-col side */}
            <div className="order-2 lg:col-span-5">
              <div className="relative rotate-1 lg:mt-10">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 translate-x-3 translate-y-3 border-2 border-primary/30 bg-primary/10"
                />
                <HeroMediaPanel
                  alt={heroMainImageAlt}
                  w={1200}
                  h={900}
                  className="relative aspect-[4/3] rounded-none border-2 border-foreground bg-muted"
                />
              </div>
              <ResponsiveGrid cols="4" className="mt-6 gap-3 sm:mt-8">
                {heroThumbAlts.map((alt, i) => (
                  <NavbarRouteLink
                    key={alt}
                    className={cn(
                      'aspect-square overflow-hidden rounded-none border-2 border-foreground/25 bg-muted transition-all hover:-translate-y-0.5 hover:border-foreground active:translate-y-px',
                      i % 2 === 1 && 'translate-y-2',
                    )}
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
          </div>
        </Container>
      </HeroSection>
    )
  },
})
