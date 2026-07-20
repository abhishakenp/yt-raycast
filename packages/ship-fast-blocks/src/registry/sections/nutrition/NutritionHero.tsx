import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import {
  HeroSection,
  HeroHeading,
  HeroSubheading,
  HeroActions,
  HeroCta,
  HeroMediaPanel,
} from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * NutritionHero — fresh clean-editorial, asymmetric 7/5 hero for a
 * nutrition-coaching / wellness landing page. On an airy fresh-wash background
 * with a giant ghost "plate" ring behind the media: a left column with a
 * square hairline status chip (single primary dot + mono eyebrow), a giant
 * fluid-clamp extrabold tracking-tight headline, a relaxed lede, dual
 * sharp-cornered CTAs (filled primary + hairline outline, both with press
 * feedback), and a hairline ledger trust row (stacked avatars + social-proof
 * note); a right column with a hairline double-framed food photo and an
 * overlapping square nutrition-facts "food log" card (mono LOGGED label + check
 * tick, meal title, hairline rule, and a mono tabular calorie subtitle). All
 * CTAs route through section-kit route links; imagery uses the alt-driven Image
 * component. Use as the top hero for nutrition coaches, registered dietitians,
 * meal-plan subscriptions, diet / wellness programs, weight-loss services or
 * healthy-eating apps.
 */
export const NutritionHero = defineCapsule({
  name: 'NutritionHero',
  description:
    'Fresh clean-editorial asymmetric 7/5 hero for a nutrition-coaching / wellness landing page: an airy fresh-wash band with a giant ghost plate ring behind the media, a left column with a square hairline status chip (single primary dot + mono eyebrow), a giant fluid extrabold tracking-tight headline, a relaxed lede, dual sharp-cornered CTAs (filled primary + hairline outline with press feedback), and a hairline ledger trust row of stacked avatars with a social-proof note; a right column with a hairline double-framed food photo and an overlapping square nutrition-facts food-log card (mono LOGGED label + check tick, meal title, hairline rule, mono tabular calorie subtitle). All CTAs route through section-kit route links; imagery uses the alt-driven Image component. Use as the top hero for nutrition coaches, registered dietitians, meal-plan subscriptions, diet / wellness programs, weight-loss services or healthy-eating apps.',
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
    const eyebrow = props.eyebrow ?? 'Evidence-Based Nutrition Coaching'
    const heading =
      props.heading ?? 'Finally, a nutrition plan that fits your life'
    const subheading =
      props.subheading ??
      'Personalized meal plans, expert coaching, and sustainable habits. Join 50,000+ clients who have transformed their relationship with food—and their bodies.'
    const primaryCta = props.primaryCta ?? 'Start 7-Day Free Trial'
    const secondaryCta = props.secondaryCta ?? 'See Transformations'
    const trustNote = props.trustNote ?? 'Trusted by 50,000+ clients worldwide'
    const avatars = props.avatars?.length
      ? props.avatars
      : [
          'professional headshot of a smiling woman with brown hair',
          'professional headshot of a man with short dark hair smiling',
          'professional headshot of a blonde woman smiling outdoors',
        ]
    const imageAlt =
      props.imageAlt ??
      'overhead view of a colorful healthy meal prep with fresh vegetables grains and proteins in ceramic bowls'
    const badgeTitle = props.badgeTitle ?? 'Meal logged'
    const badgeSubtitle = props.badgeSubtitle ?? 'Mediterranean bowl • 485 cal'

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
      <HeroSection
        className={cn(
          'relative overflow-hidden border-b border-border bg-background',
          props.className,
        )}
      >
        {/* Fresh muted wash + giant ghost plate ring (decorative). */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-muted/40 to-transparent"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 top-1/2 hidden aspect-square w-[34rem] -translate-y-1/2 rounded-full border border-border/70 lg:block"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 top-1/2 hidden aspect-square w-[24rem] -translate-y-1/2 rounded-full border border-border/50 lg:block"
        />
        <Container size="xl" className="relative pb-20 pt-16 lg:pb-28 lg:pt-24">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="max-w-2xl lg:col-span-7">
              <div className="mb-7 inline-flex items-center gap-2.5 border border-border bg-background px-3.5 py-2">
                <span
                  aria-hidden="true"
                  className="size-1.5 rounded-full bg-primary"
                />
                <MonoTag>{eyebrow}</MonoTag>
              </div>
              <HeroHeading className="mb-6 text-[clamp(2.5rem,6vw,4.75rem)] font-extrabold leading-[0.98] tracking-tight">
                {heading}
              </HeroHeading>
              <HeroSubheading className="mb-9 mt-0 max-w-xl text-base leading-relaxed sm:text-lg">
                {subheading}
              </HeroSubheading>
              <HeroActions className="mb-10 mt-0 flex-col gap-3 sm:flex-row sm:gap-4">
                <HeroCta
                  asChild
                  variant="primary"
                  className="rounded-none px-7 py-3.5 text-base font-semibold active:translate-y-px"
                >
                  <NavbarRouteLink href={primaryCta}>
                    {primaryCta}
                  </NavbarRouteLink>
                </HeroCta>
                <HeroCta
                  asChild
                  variant="outline"
                  className="rounded-none border-foreground/25 bg-background px-7 py-3.5 text-base font-semibold text-foreground hover:bg-muted active:translate-y-px"
                >
                  <NavbarRouteLink href={secondaryCta}>
                    {secondaryCta}
                  </NavbarRouteLink>
                </HeroCta>
              </HeroActions>
              <div className="flex items-center gap-4 border-t border-border pt-6 text-sm text-muted-foreground">
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
            <div className="relative lg:col-span-5">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-3 border border-border sm:-inset-4"
              />
              <HeroMediaPanel
                alt={imageAlt}
                w={800}
                h={600}
                className="aspect-[4/3] w-full rounded-none border border-border"
              />
              <div className="absolute -bottom-6 -left-3 max-w-xs border border-border bg-background p-4 sm:-left-6">
                <div className="flex items-center justify-between gap-6 border-b border-border pb-2.5">
                  <MonoTag tone="faint" className="tracking-[0.14em]">
                    Logged
                  </MonoTag>
                  <span
                    aria-hidden="true"
                    className="grid size-6 place-items-center rounded-full bg-primary/10"
                  >
                    <Check className="size-3.5 text-primary" />
                  </span>
                </div>
                <p className="mt-3 text-sm font-bold tracking-tight text-foreground">
                  {badgeTitle}
                </p>
                <p className="mt-1 font-mono text-xs tabular-nums text-muted-foreground">
                  {badgeSubtitle}
                </p>
              </div>
            </div>
          </div>
        </Container>
      </HeroSection>
    )
  },
})
