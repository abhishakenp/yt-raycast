import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import { RewardList, RewardItem } from '#/section-kit/RewardList.tsx'
import { ResponsiveGrid } from '#/section-kit/ResponsiveGrid.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * CrowdfundingRewards — a playful-bold 4-tier REWARDS / pledge board with a
 * stretch-goals progress track for a crowdfunding / campaign landing page. An
 * asymmetric header (mono eyebrow + extrabold heading + intro left, mono
 * "[ pledge board ]" tag right) above a 1/2/4-column grid of sharp
 * 2px-bordered pledge cards that stagger downward in a checker rhythm on
 * desktop. Each card carries a mono claimed-count micro-label over a tiny
 * token-built claim bar, tier name, giant extrabold tabular price, muted
 * description, check-marked perk list, and a hard-shadowed block CTA with
 * press feedback; the featured "Best Value" tier tilts -1°, wears a
 * primary-shadowed border and a rotated rounded-full sticker badge. Below, a
 * hard-bordered stretch-goals panel runs a vertical progress rail of goal rows
 * — rounded-full checkpoint dots (filled primary when unlocked), bold titles,
 * muted descriptions, and rotated mono status sticker chips. All buttons route
 * through section-kit route links. Use as the pricing / pledge tiers for a
 * Kickstarter/Indiegogo-style raise, pre-order, or fundraiser where reward
 * levels and stretch goals must be front and center.
 */
export const CrowdfundingRewards = defineCapsule({
  name: 'CrowdfundingRewards',
  description:
    "A playful-bold 4-tier REWARDS / pledge board with a stretch-goals progress track for a crowdfunding / campaign landing page: an asymmetric header (mono eyebrow + extrabold heading + intro left, mono '[ pledge board ]' tag right) above a 1/2/4-column grid of sharp 2px-bordered pledge cards staggered in a checker rhythm, each with a mono claimed-count micro-label over a tiny token-built claim bar, tier name, giant extrabold tabular price, muted description, check-marked perk list, and a hard-shadowed block CTA with press feedback — the featured 'Best Value' tier tilts -1° with a primary-shadowed border and rotated rounded-full sticker badge. Below, a hard-bordered stretch-goals panel runs a vertical progress rail of goal rows with rounded-full checkpoint dots (filled primary when unlocked), bold titles, muted descriptions, and rotated mono status sticker chips. All buttons route through section-kit route links. Use as the pricing / pledge tiers for a Kickstarter/Indiegogo-style raise, pre-order, or fundraiser where reward levels and stretch goals must be front and center.",
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    description: z.string().optional(),
    tiers: z
      .array(
        z.object({
          meta: z.string(),
          name: z.string(),
          price: z.string(),
          description: z.string(),
          perks: z.array(z.string()),
          cta: z.string(),
          featured: z.boolean().optional(),
          badge: z.string().optional(),
        }),
      )
      .optional(),
    /** Stretch-goals panel heading. */
    stretchHeading: z.string().optional(),
    /** Stretch-goals checklist items. */
    stretchItems: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
          status: z.string(),
          unlocked: z.boolean().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const rewardsEyebrow = props.eyebrow ?? 'Rewards'
    const rewardsHeading = props.heading ?? 'Choose Your Reward'
    const rewardsDesc =
      props.description ??
      'Select a pledge level that works for you. Every backer brings EcoBrush closer to reality.'
    const rewardTiers = props.tiers?.length
      ? props.tiers
      : [
          {
            meta: 'Early Bird — 500 claimed',
            name: 'Single EcoBrush',
            price: '$49',
            description:
              'One EcoBrush handle, 2 brush heads, USB-C cable, travel case.',
            perks: ['40% off retail ($79)', 'Ships June 2026'],
            cta: 'Select — $49',
          },
          {
            meta: 'Popular — 2,847 claimed',
            name: 'Couple Bundle',
            price: '$89',
            description:
              'Two EcoBrush handles, 4 brush heads, 2 travel cases, dual charging base.',
            perks: ['44% off retail', 'Free shipping'],
            cta: 'Select — $89',
          },
          {
            meta: '4,231 claimed',
            name: 'Family Pack',
            price: '$149',
            description:
              'Four EcoBrush handles, 8 brush heads, 4 travel cases, charging station + 4-port USB hub.',
            perks: [
              '53% off retail',
              'Bonus: Year of brush heads',
              'Priority shipping',
            ],
            cta: 'Select — $149',
            featured: true,
            badge: 'Best Value',
          },
          {
            meta: 'Limited — 127 of 250 left',
            name: 'VIP Founder',
            price: '$299',
            description:
              'Everything in Family Pack + lifetime 50% off brush heads, name on website, exclusive colorway.',
            perks: [
              'Limited edition walnut variant',
              'Video call with founders',
              'First production batch',
            ],
            cta: 'Select — $299',
          },
        ]

    const stretchHeading = props.stretchHeading ?? 'Stretch Goals Unlocked'
    const stretchItems = props.stretchItems?.length
      ? props.stretchItems
      : [
          {
            title: '$100K — Mobile App',
            description:
              'iOS & Android app for brushing analytics and reminders',
            status: 'Unlocked',
            unlocked: true,
          },
          {
            title: '$250K — Kids Edition',
            description:
              'Smaller handle, fun colors, built-in timer with character guides',
            status: 'Unlocked',
            unlocked: true,
          },
          {
            title: '$400K — Subscription Service',
            description:
              'Automated brush head delivery every 3 months at 30% off',
            status: 'Unlocked',
            unlocked: true,
          },
          {
            title: '$750K — Solar Charging Base',
            description:
              'Optional solar-powered charging dock for true off-grid living',
            status: 'In Progress',
            unlocked: false,
          },
        ]

    const Check = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="16"
        height="16"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
    )

    const claimWidths = ['w-2/3', 'w-4/5', 'w-11/12', 'w-1/3']

    return (
      <section
        className={cn('bg-card py-16 sm:py-20 lg:py-28', props.className)}
      >
        <Container>
          <div className="mb-12 flex flex-col gap-4 sm:mb-16 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              eyebrow={rewardsEyebrow}
              title={rewardsHeading}
              subtitle={rewardsDesc}
              align="left"
              className="max-w-2xl gap-3"
              eyebrowClassName="font-mono text-[11px] uppercase tracking-[0.2em] text-primary"
              titleClassName="text-3xl font-extrabold leading-[1.02] tracking-tighter sm:text-4xl"
              subtitleClassName="text-lg text-muted-foreground"
            />
            <MonoTag aria-hidden="true" tone="faint" className="shrink-0">
              [ pledge board ]
            </MonoTag>
          </div>

          <ResponsiveGrid cols="1-md-2-4" className="gap-6 lg:gap-5">
            {rewardTiers.map((tier, i) => (
              <div
                key={tier.name}
                className={cn(
                  'relative flex flex-col border-2 bg-background p-6 transition-all',
                  tier.featured
                    ? 'z-10 -rotate-1 border-foreground shadow-[6px_6px_0_0] shadow-primary/40'
                    : 'border-foreground/25 hover:-translate-y-1 hover:border-foreground hover:shadow-[4px_4px_0_0] hover:shadow-foreground/15 motion-reduce:transform-none',
                  !tier.featured && i % 2 === 1 && 'lg:translate-y-6',
                )}
              >
                {tier.badge ? (
                  <div className="absolute -top-4 right-4 rotate-3 rounded-full border-2 border-foreground bg-primary px-3.5 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-primary-foreground shadow-[2px_2px_0_0] shadow-foreground/30">
                    {tier.badge}
                  </div>
                ) : null}
                <div className="mb-2">
                  <span
                    className={cn(
                      'font-mono text-[11px] uppercase tracking-[0.12em]',
                      tier.featured
                        ? 'font-bold text-primary'
                        : 'text-muted-foreground',
                    )}
                  >
                    {tier.meta}
                  </span>
                  <span
                    aria-hidden="true"
                    className="mt-1.5 block h-1.5 w-full bg-muted"
                  >
                    <span
                      className={cn(
                        'block h-full bg-primary/70',
                        claimWidths[i % claimWidths.length],
                      )}
                    />
                  </span>
                </div>
                <h3 className="mb-1 text-xl font-bold tracking-tight">
                  {tier.name}
                </h3>
                <div className="mb-4 text-4xl font-extrabold tracking-tight tabular-nums">
                  {tier.price}
                </div>
                <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                  {tier.description}
                </p>
                <RewardList className="mb-6 space-y-2 text-sm text-muted-foreground">
                  {tier.perks.map((perk) => (
                    <RewardItem
                      key={perk}
                      className="flex flex-row items-center gap-2"
                    >
                      <Check className="size-4 shrink-0 text-primary" />
                      {perk}
                    </RewardItem>
                  ))}
                </RewardList>
                <NavbarRouteLink
                  className={cn(
                    'mt-auto w-full border-2 border-foreground py-3 text-center font-bold transition-all active:translate-y-px active:shadow-none',
                    tier.featured
                      ? 'bg-foreground text-background shadow-[4px_4px_0_0] shadow-primary/40 hover:-translate-y-0.5'
                      : 'bg-background text-foreground hover:bg-foreground hover:text-background',
                  )}
                  href={tier.name}
                >
                  {tier.cta}
                </NavbarRouteLink>
              </div>
            ))}
          </ResponsiveGrid>

          {/* Stretch goals — vertical progress track */}
          <div className="mt-16 border-2 border-foreground bg-muted/40 p-6 sm:p-8 lg:mt-20">
            <div className="mb-8 flex items-center gap-4">
              <h3 className="text-xl font-extrabold tracking-tight">
                {stretchHeading}
              </h3>
              <span aria-hidden="true" className="h-px flex-1 bg-border" />
            </div>
            <div className="relative space-y-6 pl-2">
              <span
                aria-hidden="true"
                className="absolute bottom-3 left-[1.1rem] top-3 w-0.5 bg-foreground/15"
              />
              {stretchItems.map((goal) => (
                <div
                  key={goal.title}
                  className="relative grid grid-cols-[auto_1fr] items-start gap-4 sm:grid-cols-[auto_1fr_auto] sm:items-center"
                >
                  <span
                    className={cn(
                      'relative z-10 grid size-9 shrink-0 place-items-center rounded-full border-2',
                      goal.unlocked
                        ? 'border-foreground bg-primary text-primary-foreground'
                        : 'border-dashed border-foreground/40 bg-background text-muted-foreground',
                    )}
                  >
                    {goal.unlocked ? (
                      <Check className="size-4" />
                    ) : (
                      <span className="text-sm font-bold">?</span>
                    )}
                  </span>
                  <div className={cn(!goal.unlocked && 'opacity-60')}>
                    <div className="font-bold tracking-tight">{goal.title}</div>
                    <p className="text-sm text-muted-foreground">
                      {goal.description}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'col-start-2 justify-self-start sm:col-start-3 sm:justify-self-end',
                      'inline-flex rounded-full border-2 px-3 py-0.5 font-mono text-[11px] font-bold uppercase tracking-[0.12em]',
                      goal.unlocked
                        ? 'rotate-1 border-foreground bg-background text-foreground shadow-[2px_2px_0_0] shadow-primary/40'
                        : 'border-foreground/30 bg-background text-muted-foreground',
                    )}
                  >
                    {goal.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>
    )
  },
})
