import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * CrowdfundingRewards — a 4-tier REWARDS / pledge grid with a stretch-goals
 * checklist for a crowdfunding / campaign landing page. On a card surface: a
 * centered eyebrow + heading + intro above a responsive 1/2/4-column grid of
 * bordered pledge cards (claimed-count meta, tier name, big price, description,
 * check-marked perk list, and a select CTA), with one highlighted "Best Value"
 * tier wearing a primary border, tinted fill and a floating badge. Below sits a
 * muted stretch-goals panel listing unlocked goals (check icon, card surface)
 * and dimmed in-progress goals (question-mark icon, secondary surface) with a
 * status label each. All buttons route through useNavigate. Use as the pricing
 * / pledge tiers for a Kickstarter/Indiegogo-style raise, pre-order, or
 * fundraiser where reward levels and stretch goals must be front and center.
 */
export const CrowdfundingRewards = defineComponent({
  name: "CrowdfundingRewards",
  description:
    "A 4-tier REWARDS / pledge grid with a stretch-goals checklist for a crowdfunding / campaign landing page on a card surface: a centered eyebrow + heading + intro above a responsive 1/2/4-column grid of bordered pledge cards (claimed-count meta, tier name, big price, description, check-marked perk list, and a select CTA), with one highlighted 'Best Value' tier wearing a primary border, tinted fill and a floating badge. Below sits a muted stretch-goals panel listing unlocked goals (check icon, card surface) and dimmed in-progress goals (question-mark icon, secondary surface) with a status label each. All buttons route through useNavigate. Use as the pricing / pledge tiers for a Kickstarter/Indiegogo-style raise, pre-order, or fundraiser where reward levels and stretch goals must be front and center.",
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
    const go = useNavigate()
    const rewardsEyebrow = props.eyebrow ?? "Rewards"
    const rewardsHeading = props.heading ?? "Choose Your Reward"
    const rewardsDesc =
      props.description ??
      "Select a pledge level that works for you. Every backer brings EcoBrush closer to reality."
    const rewardTiers = props.tiers?.length
      ? props.tiers
      : [
          {
            meta: "Early Bird — 500 claimed",
            name: "Single EcoBrush",
            price: "$49",
            description:
              "One EcoBrush handle, 2 brush heads, USB-C cable, travel case.",
            perks: ["40% off retail ($79)", "Ships June 2026"],
            cta: "Select — $49",
          },
          {
            meta: "Popular — 2,847 claimed",
            name: "Couple Bundle",
            price: "$89",
            description:
              "Two EcoBrush handles, 4 brush heads, 2 travel cases, dual charging base.",
            perks: ["44% off retail", "Free shipping"],
            cta: "Select — $89",
          },
          {
            meta: "4,231 claimed",
            name: "Family Pack",
            price: "$149",
            description:
              "Four EcoBrush handles, 8 brush heads, 4 travel cases, charging station + 4-port USB hub.",
            perks: [
              "53% off retail",
              "Bonus: Year of brush heads",
              "Priority shipping",
            ],
            cta: "Select — $149",
            featured: true,
            badge: "Best Value",
          },
          {
            meta: "Limited — 127 of 250 left",
            name: "VIP Founder",
            price: "$299",
            description:
              "Everything in Family Pack + lifetime 50% off brush heads, name on website, exclusive colorway.",
            perks: [
              "Limited edition walnut variant",
              "Video call with founders",
              "First production batch",
            ],
            cta: "Select — $299",
          },
        ]

    const stretchHeading = props.stretchHeading ?? "Stretch Goals Unlocked"
    const stretchItems = props.stretchItems?.length
      ? props.stretchItems
      : [
          {
            title: "$100K — Mobile App",
            description:
              "iOS & Android app for brushing analytics and reminders",
            status: "Unlocked",
            unlocked: true,
          },
          {
            title: "$250K — Kids Edition",
            description:
              "Smaller handle, fun colors, built-in timer with character guides",
            status: "Unlocked",
            unlocked: true,
          },
          {
            title: "$400K — Subscription Service",
            description:
              "Automated brush head delivery every 3 months at 30% off",
            status: "Unlocked",
            unlocked: true,
          },
          {
            title: "$750K — Solar Charging Base",
            description:
              "Optional solar-powered charging dock for true off-grid living",
            status: "In Progress",
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

    return (
      <section className={cn("bg-card py-20 lg:py-28", props.className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <span className="text-sm font-medium uppercase tracking-wider text-primary">
              {rewardsEyebrow}
            </span>
            <h2 className="mb-4 mt-3 text-3xl font-semibold sm:text-4xl">
              {rewardsHeading}
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              {rewardsDesc}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {rewardTiers.map((tier) => (
              <div
                key={tier.name}
                className={cn(
                  "relative rounded-xl border-2 p-6 transition-colors",
                  tier.featured
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary",
                )}
              >
                {tier.badge ? (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                    {tier.badge}
                  </div>
                ) : null}
                <div
                  className={cn(
                    "mb-2 text-sm",
                    tier.featured
                      ? "font-medium text-primary"
                      : "text-muted-foreground",
                  )}
                >
                  {tier.meta}
                </div>
                <h3 className="mb-2 text-xl font-semibold">{tier.name}</h3>
                <div className="mb-4 text-3xl font-bold">{tier.price}</div>
                <p className="mb-6 text-sm text-muted-foreground">
                  {tier.description}
                </p>
                <ul className="mb-6 space-y-2 text-sm text-muted-foreground">
                  {tier.perks.map((perk) => (
                    <li key={perk} className="flex items-center gap-2">
                      <Check className="size-4 shrink-0 text-primary" />
                      {perk}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => go(tier.name)}
                  className={cn(
                    "w-full rounded-lg py-3 font-medium transition-colors",
                    tier.featured
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "border-2 border-foreground text-foreground hover:bg-foreground hover:text-background",
                  )}
                >
                  {tier.cta}
                </button>
              </div>
            ))}
          </div>

          {/* Stretch goals */}
          <div className="mt-16 rounded-xl bg-muted p-8">
            <h3 className="mb-6 text-center text-xl font-semibold">
              {stretchHeading}
            </h3>
            <div className="space-y-4">
              {stretchItems.map((goal) => (
                <div
                  key={goal.title}
                  className={cn(
                    "flex items-center gap-4 rounded-xl p-4",
                    goal.unlocked ? "bg-card" : "bg-secondary opacity-60",
                  )}
                >
                  <div
                    className={cn(
                      "grid size-10 shrink-0 place-items-center rounded-full",
                      goal.unlocked
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {goal.unlocked ? (
                      <Check className="size-5" />
                    ) : (
                      <span className="text-sm font-bold">?</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{goal.title}</div>
                    <p className="text-sm text-muted-foreground">
                      {goal.description}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "text-sm font-medium",
                      goal.unlocked
                        ? "text-primary"
                        : "text-muted-foreground",
                    )}
                  >
                    {goal.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  },
})
