import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * NutritionHero — split two-column hero for a nutrition-coaching / wellness landing
 * page. A left column with a primary eyebrow, big tracking-tight headline, relaxed
 * subheading, dual pill CTAs (filled primary + outlined card), and a stacked trust-avatar
 * row with a social-proof note; a right column with a large rounded food photo and an
 * overlapping floating "meal logged" card (check badge + title + subtitle). All CTAs
 * route through useNavigate; imagery uses the alt-driven Image component. Use as the
 * top hero for nutrition coaches, dietitians, meal-plan subscriptions, diet / wellness
 * programs or healthy-eating apps.
 */
export const NutritionHero = defineComponent({
  name: "NutritionHero",
  description:
    "Split two-column hero for a nutrition-coaching / wellness landing page: a left column with a primary eyebrow, big tracking-tight headline, relaxed subheading, dual pill CTAs (filled primary + outlined card), and a stacked trust-avatar row with a social-proof note; a right column with a large rounded food photo and an overlapping floating 'meal logged' card (check badge + title + subtitle). All CTAs route through useNavigate; imagery uses the alt-driven Image component. Use as the top hero for nutrition coaches, registered dietitians, meal-plan subscriptions, diet / wellness programs, weight-loss services or healthy-eating apps.",
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    subheading: z.string().optional(),
    primaryCta: z.string().optional(),
    secondaryCta: z.string().optional(),
    trustNote: z.string().optional(),
    /** Alt texts for the stacked trust avatars (drive the headshot images). */
    avatars: z.array(z.string()).optional(),
    imageAlt: z.string().optional(),
    /** Floating card overlay on the hero photo. */
    badgeTitle: z.string().optional(),
    badgeSubtitle: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const eyebrow = props.eyebrow ?? "Evidence-Based Nutrition Coaching"
    const heading =
      props.heading ?? "Finally, a nutrition plan that fits your life"
    const subheading =
      props.subheading ??
      "Personalized meal plans, expert coaching, and sustainable habits. Join 50,000+ clients who have transformed their relationship with food—and their bodies."
    const primaryCta = props.primaryCta ?? "Start 7-Day Free Trial"
    const secondaryCta = props.secondaryCta ?? "See Transformations"
    const trustNote =
      props.trustNote ?? "Trusted by 50,000+ clients worldwide"
    const avatars = props.avatars?.length
      ? props.avatars
      : [
          "professional headshot of a smiling woman with brown hair",
          "professional headshot of a man with short dark hair smiling",
          "professional headshot of a blonde woman smiling outdoors",
        ]
    const imageAlt =
      props.imageAlt ??
      "overhead view of a colorful healthy meal prep with fresh vegetables grains and proteins in ceramic bowls"
    const badgeTitle = props.badgeTitle ?? "Meal logged"
    const badgeSubtitle = props.badgeSubtitle ?? "Mediterranean bowl • 485 cal"

    const Check = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M5 13l4 4L19 7"
        />
      </svg>
    )

    return (
      <section
        className={cn("relative overflow-hidden bg-background", props.className)}
      >
        <div className="mx-auto max-w-7xl px-4 pb-24 pt-16 sm:px-6 lg:px-8 lg:pb-32 lg:pt-24">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="max-w-2xl">
              <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-primary">
                {eyebrow}
              </p>
              <h1 className="mb-6 text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                {heading}
              </h1>
              <p className="mb-8 max-w-xl text-lg leading-relaxed text-muted-foreground">
                {subheading}
              </p>
              <div className="mb-10 flex flex-col gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(primaryCta)}
                  className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3.5 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {primaryCta}
                </button>
                <button
                  type="button"
                  onClick={() => go(secondaryCta)}
                  className="inline-flex items-center justify-center rounded-full border border-input bg-card px-6 py-3.5 text-base font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
                >
                  {secondaryCta}
                </button>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex -space-x-2">
                  {avatars.map((alt) => (
                    <Image
                      key={alt}
                      alt={alt}
                      w={64}
                      h={64}
                      className="size-8 rounded-full border-2 border-background object-cover"
                    />
                  ))}
                </div>
                <p>{trustNote}</p>
              </div>
            </div>
            <div className="relative">
              <Image
                alt={imageAlt}
                w={800}
                h={600}
                className="aspect-[4/3] w-full rounded-2xl object-cover shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 hidden max-w-xs rounded-xl bg-card p-4 shadow-lg sm:block">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                    <Check className="size-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-card-foreground">
                      {badgeTitle}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {badgeSubtitle}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  },
})
