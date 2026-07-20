import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * FoodDeliveryFeatures — playful-bold value-prop grid for a food-delivery /
 * restaurant-marketplace site. An asymmetric header (left-aligned mono eyebrow +
 * extrabold heading + intro on the left, a mono "[ why nosh ]" tag on the right)
 * above a 3-up grid of chunky 2px-bordered cards that stagger downward in a
 * checker rhythm, each led by a giant ghost index numeral and a mono menu-style
 * micro-label, then a bold title and a body paragraph, with a hard offset shadow
 * lift on hover. Use to explain the core value props (real-time tracking,
 * curated selection, saved favorites) for food-delivery apps, restaurant
 * aggregators, or online-ordering platforms. Renders fully with no props via
 * baked-in defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import {
  FeatureGrid,
  FeatureCard,
  FeatureTitle,
  FeatureDescription,
} from '#/section-kit/FeatureGrid.tsx'
export const FoodDeliveryFeatures = defineCapsule({
  name: 'FoodDeliveryFeatures',
  description:
    'Playful-bold value-prop grid for a food-delivery / restaurant-marketplace site: an asymmetric header (left-aligned mono eyebrow + extrabold heading + intro, mono "[ why nosh ]" tag right) above a 3-up grid of chunky 2px-bordered cards staggered in a checker rhythm, each led by a giant ghost index numeral and a mono menu-style micro-label, then a bold title and a body paragraph, with a hard offset shadow lift on hover. Use to explain core value props like real-time GPS tracking, curated/vetted selection, and saved favorites for food-delivery apps, restaurant aggregators, online-ordering platforms, or takeout services.',
  props: z.object({
    /** Centered section heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    description: z.string().optional(),
    /** Feature cards (title + description); icons rotate by index. */
    items: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const featuresHeading = props.heading ?? 'Everything you need'
    const featuresDesc =
      props.description ??
      'We have thought through every detail to make your food delivery experience effortless.'
    const featureItems = props.items?.length
      ? props.items
      : [
          {
            title: 'Real-Time Tracking',
            description:
              'Know exactly where your order is with live GPS tracking from restaurant to your doorstep. Get updates at every step.',
          },
          {
            title: 'Curated Selection',
            description:
              'Every restaurant is vetted for quality. We partner only with kitchens that meet our high standards for food and service.',
          },
          {
            title: 'Saved Favorites',
            description:
              'Reorder your go-to meals in seconds. Your favorite dishes and restaurants are always just one tap away.',
          },
        ]
    return (
      <section className={cn('pt-20 pb-16 lg:pt-28 lg:pb-24', props.className)}>
        <Container>
          <div className="mb-12 flex flex-col gap-4 sm:mb-16 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              align="left"
              eyebrow="What you get"
              title={featuresHeading}
              subtitle={featuresDesc}
              className="max-w-2xl gap-3"
              eyebrowClassName="font-mono text-[11px] uppercase tracking-[0.2em] text-primary"
              titleClassName="text-3xl font-extrabold leading-[1.03] tracking-tighter text-foreground sm:text-4xl"
              subtitleClassName="text-lg text-muted-foreground"
            />
            <MonoTag aria-hidden="true" tone="faint" className="shrink-0">
              [ why nosh ]
            </MonoTag>
          </div>
          <FeatureGrid columns={3} className="gap-6">
            {featureItems.map((f, i) => {
              const __iv__ = f as {
                title: string
                description: string
                icon?: React.ReactNode
                points?: string[]
                cta?: string
                price?: string
                imageAlt?: string
              }
              return (
                <FeatureCard
                  key={__iv__.title}
                  className={cn(
                    'relative gap-4 overflow-hidden rounded-none border-2 border-foreground bg-background p-6 transition-all hover:-translate-y-1 hover:border-foreground hover:shadow-[6px_6px_0_0] hover:shadow-foreground active:translate-y-px active:shadow-none motion-reduce:transform-none sm:p-7',
                    i % 2 === 1 && 'lg:translate-y-8',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-2 -top-4 select-none font-mono text-8xl font-extrabold leading-none tabular-nums text-foreground/[0.06]"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {__iv__.icon ? (
                    <span className="relative grid size-11 place-items-center rounded-full border-2 border-foreground bg-primary text-primary-foreground">
                      {__iv__.icon}
                    </span>
                  ) : null}
                  <span className="relative font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
                    Menu {String(i + 1).padStart(2, '0')}
                  </span>
                  <FeatureTitle className="relative text-xl font-extrabold tracking-tight">
                    {__iv__.title}
                  </FeatureTitle>
                  <FeatureDescription className="relative leading-relaxed">
                    {__iv__.description}
                  </FeatureDescription>
                </FeatureCard>
              )
            })}
          </FeatureGrid>
        </Container>
      </section>
    )
  },
})
