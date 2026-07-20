import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import {
  OverviewSection,
  OverviewGrid,
  OverviewContent,
  OverviewEyebrow,
  OverviewBrand,
  OverviewHeading,
  OverviewSubheading,
  OverviewFeatures,
  OverviewFeature,
  OverviewCta,
  OverviewStats,
  OverviewStat,
  OverviewStatValue,
  OverviewStatLabel,
  OverviewMediaPanel,
} from '#/section-kit/OverviewSection.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * SubscriptionBoxOverview — playful-commerce overview / hero section for the
 * Subscription Box page family. Derived from the section template catalog to
 * provide section-level coverage without new HTML generation, restyled in the
 * box language: a mono-eyebrow sticker, a mono brand index, an extrabold
 * heading, supporting copy, two squared routable CTAs with hard offset token
 * shadows and press feedback, rotated rounded-full sticker feature chips, a
 * collapsed-border KPI ledger with tabular numerals, and a token-bordered
 * box-motif image panel rendered through the alt-driven Image component. Use
 * when composing a subscription box page or adding a focused subscription box
 * band to a larger generated site.
 */
export const SubscriptionBoxOverview = defineCapsule({
  name: 'SubscriptionBoxOverview',
  description:
    'Reusable playful-commerce overview / hero section for the Subscription Box page family. Derived from the section template catalog to provide section-level coverage without new HTML generation: a mono-eyebrow sticker, mono brand index, extrabold heading, supporting copy, two squared routable CTAs with hard offset token shadows and press feedback, rotated rounded-full sticker feature chips, a collapsed-border KPI ledger with tabular numerals, and a token-bordered box-motif image panel rendered through the alt-driven Image component. Use when composing a subscription box page or adding a focused subscription box band to a larger generated site.',
  props: z.object({
    brand: z.string().optional(),
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    subheading: z.string().optional(),
    primaryCta: z.string().optional(),
    secondaryCta: z.string().optional(),
    imageAlt: z.string().optional(),
    features: z.array(z.string()).optional(),
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'Subscription Box'
    const eyebrow = props.eyebrow ?? 'Subscription Box section'
    const heading =
      props.heading ?? 'Subscription Box experience, ready to customize'
    const subheading =
      props.subheading ??
      'A reusable overview section derived from the existing Subscription Box page family, built for prompts that need a polished first viewport without creating new HTML.'
    const primaryCta = props.primaryCta ?? 'Explore'
    const secondaryCta = props.secondaryCta ?? 'Learn more'
    const imageAlt = props.imageAlt ?? 'Subscription Box website experience'
    const features = props.features?.length
      ? props.features
      : [
          'Purpose-built subscription box layout',
          'Token-based styling',
          'Prompt-safe content props',
        ]
    const stats = props.stats?.length
      ? props.stats
      : [
          {
            value: '01',
            label: 'Reusable section',
          },
          {
            value: '100%',
            label: 'Token compliant',
          },
          {
            value: '0',
            label: 'Image URLs',
          },
        ]

    return (
      <OverviewSection className={cn('relative', props.className)}>
        <OverviewGrid>
          <OverviewContent>
            <OverviewEyebrow className="w-fit -rotate-1 rounded-full border-2 border-foreground bg-background px-3.5 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-foreground shadow-[3px_3px_0_0] shadow-foreground/20">
              {eyebrow}
            </OverviewEyebrow>
            <OverviewBrand className="mt-6 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              {brand}
            </OverviewBrand>
            <OverviewHeading className="font-extrabold tracking-tight">
              {heading}
            </OverviewHeading>
            <OverviewSubheading>{subheading}</OverviewSubheading>
            <OverviewFeatures>
              {features.map((feature: string, i: number) => (
                <OverviewFeature
                  key={feature}
                  className={cn(
                    'rounded-full border-2 border-foreground bg-background px-4 py-1.5 text-sm font-semibold text-foreground shadow-[3px_3px_0_0] shadow-foreground/20',
                    i % 2 === 0 ? '-rotate-1' : 'rotate-1',
                  )}
                >
                  {feature}
                </OverviewFeature>
              ))}
            </OverviewFeatures>
            <OverviewCta>
              <NavbarRouteLink
                className="inline-flex items-center justify-center rounded-none border-2 border-foreground bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-[4px_4px_0_0] shadow-foreground transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 active:translate-y-px active:shadow-none motion-reduce:transform-none"
                href={primaryCta}
              >
                {primaryCta}
              </NavbarRouteLink>
              <NavbarRouteLink
                className="inline-flex items-center justify-center rounded-none border-2 border-foreground bg-background px-6 py-3 text-sm font-bold text-foreground shadow-[4px_4px_0_0] shadow-foreground/20 transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 active:translate-y-px active:shadow-none motion-reduce:transform-none"
                href={secondaryCta}
              >
                {secondaryCta}
              </NavbarRouteLink>
            </OverviewCta>
            <OverviewStats className="mt-12 grid-cols-3 gap-0 border-0 border-l-2 border-t-2 border-foreground pt-0">
              {stats.map((stat: { value: string; label: string }) => (
                <OverviewStat
                  key={stat.label}
                  className="border-b-2 border-r-2 border-foreground p-4"
                >
                  <OverviewStatValue className="text-3xl font-extrabold tabular-nums">
                    {stat.value}
                  </OverviewStatValue>
                  <OverviewStatLabel className="font-mono text-[11px] uppercase tracking-[0.14em]">
                    {stat.label}
                  </OverviewStatLabel>
                </OverviewStat>
              ))}
            </OverviewStats>
          </OverviewContent>
          <OverviewMediaPanel
            className="[&>div:last-child]:rounded-none [&>div:last-child]:border-2 [&>div:last-child]:border-foreground [&>div:last-child]:shadow-[10px_10px_0_0] [&>div:last-child]:shadow-foreground"
            alt={imageAlt}
            brand={brand}
            caption="Section-level building block for generated multi-page experiences."
          />
        </OverviewGrid>
      </OverviewSection>
    )
  },
})
