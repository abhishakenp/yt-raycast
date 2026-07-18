import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * MobileAppFeatures — a centered-intro, 6-up feature grid for a clean,
 * minimalist mobile-app marketing page. A centered heading + description sits
 * above a responsive 2-/3-column grid of feature cells, each with a rounded
 * muted icon tile (that warms to the accent color on hover), a short title, and
 * a relaxed description paragraph. Icons rotate through a built-in set of
 * line-style glyphs. No links, no imagery. Use as the core value-prop / feature
 * grid on a habit tracker, fitness / wellness app, productivity or to-do app, or
 * any consumer app landing page. Renders fully with no props via baked-in
 * defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
import { FeatureGrid } from '#/section-kit/FeatureGrid.tsx'
export const MobileAppFeatures = defineCapsule({
  name: 'MobileAppFeatures',
  description:
    'Centered-intro 6-up feature grid for a clean, minimalist mobile-app marketing page: a centered heading + description over a responsive 2-/3-column grid of feature cells, each with a rounded muted icon tile (warming to the accent color on hover), a short title, and a relaxed description paragraph; icons rotate through a built-in line-style glyph set. Use as the core value-prop / feature grid on a habit tracker, fitness / wellness app, productivity or to-do app, or any consumer app landing page.',
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
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
    const heading = props.heading ?? 'Everything you need to succeed'
    const description =
      props.description ??
      "We've stripped away the complexity. DailyFlow gives you just the right tools to build habits that stick—without the overwhelm."
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Smart Reminders',
            description:
              'Gentle nudges at the right time. Our AI learns your routine and suggests optimal moments for each habit.',
          },
          {
            title: 'Visual Progress',
            description:
              'Beautiful charts and streak counters that make every small win feel meaningful and motivating.',
          },
          {
            title: 'Self-Compassion Mode',
            description:
              "Miss a day? No problem. We don't break streaks for small slips—life happens, and we get it.",
          },
          {
            title: 'Accountability Groups',
            description:
              'Join small groups of 3-5 people with similar goals. Share progress and celebrate wins together.',
          },
          {
            title: 'Dark Mode',
            description:
              'Easy on the eyes, day or night. Automatic switching based on your system preferences.',
          },
          {
            title: 'Widget Support',
            description:
              'Track habits right from your home screen with beautiful iOS and Android widgets.',
          },
        ]
    return (
      <section
        className={cn('pt-28 pb-20 lg:pt-32 lg:pb-28', props.className)}
        aria-labelledby="mobileapp-features-heading"
      >
        <Container>
          <div className="mx-auto mb-16 max-w-2xl text-center lg:mb-20">
            <h2
              id="mobileapp-features-heading"
              className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl"
            >
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <FeatureGrid features={items} columns={3} />
        </Container>
      </section>
    )
  },
})
