import { defineCapsule } from '#/capsules/openui.ts'
import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import { z } from 'zod/v4'

import {
  ServiceCard,
  ServiceIcon,
  ServiceTitle,
  ServiceDescription,
} from '#/section-kit/ServicesGrid.tsx'

/**
 * NutritionServices — fresh clean-editorial offerings ledger for a
 * nutrition-coaching or wellness site, built on the shared ServiceCard kit
 * slots. An asymmetric left-aligned header (mono index eyebrow + big
 * tracking-tight heading + lede) sits above a sharp-cornered, collapsed-border
 * hairline grid of four service cells (Meal Plans, 1-on-1 Coaching, Progress
 * Tracking, Recipe Library); each cell carries a giant ghost tabular index
 * numeral, a mono index label, a square hairline primary-tinted icon, a title
 * and a description, and washes to muted on hover. A giant ghost watermark
 * bleeds behind the section. All props are optional with baked defaults so it
 * renders standalone. Use mid-page on nutrition coaches, registered dietitians,
 * meal-plan subscriptions, diet / wellness programs or healthy-eating apps to
 * lay out what the program includes.
 */
export const NutritionServices = defineCapsule({
  name: 'NutritionServices',
  description:
    'Fresh clean-editorial offerings ledger for a nutrition-coaching or wellness site, built on the shared ServiceCard kit slots: an asymmetric left-aligned header (mono index eyebrow + big tracking-tight heading + lede) above a sharp-cornered, collapsed-border hairline grid of four service cells (Meal Plans, 1-on-1 Coaching, Progress Tracking, Recipe Library), each with a giant ghost tabular index numeral, a mono index label, a square hairline primary-tinted icon, a title and a description that washes to muted on hover, behind a giant ghost watermark. Use mid-page on nutrition coaches, registered dietitians, meal-plan subscriptions, diet / wellness programs or healthy-eating apps to lay out what the program includes.',
  props: z.object({
    heading: z.string().optional(),
    subheading: z.string().optional(),
    /** Service cards (title + description); icons are baked per position. */
    services: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Everything you need to eat well'
    const subheading =
      props.subheading ??
      'A complete toolkit of plans, coaching, and tracking that adapts to your goals and your life.'

    const iconClass = 'size-5 text-primary'
    const icons = [
      // Meal Plans — clipboard / plan
      <svg
        key="plans"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className={iconClass}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9 2 2 4-4"
        />
      </svg>,
      // 1-on-1 Coaching — chat bubbles
      <svg
        key="coaching"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className={iconClass}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 0 1-9 9c-1.6 0-3.1-.4-4.4-1.1L3 21l1.1-4.6A9 9 0 1 1 21 12Z"
        />
      </svg>,
      // Progress Tracking — chart trending up
      <svg
        key="progress"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className={iconClass}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 17l6-6 4 4 7-7m0 0h-5m5 0v5"
        />
      </svg>,
      // Recipe Library — open book
      <svg
        key="recipes"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className={iconClass}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6.5C10.8 5.6 9.2 5 7.5 5 5.8 5 4.2 5.6 3 6.5v12C4.2 17.6 5.8 17 7.5 17c1.7 0 3.3.6 4.5 1.5m0-12c1.2-.9 2.8-1.5 4.5-1.5 1.7 0 3.3.6 4.5 1.5v12c-1.2-.9-2.8-1.5-4.5-1.5-1.7 0-3.3.6-4.5 1.5m0-12v12"
        />
      </svg>,
    ]

    const defaults = [
      {
        title: 'Meal Plans',
        description:
          'Personalized weekly meal plans built around your tastes, goals, and dietary needs—updated automatically as you progress.',
      },
      {
        title: '1-on-1 Coaching',
        description:
          'Direct access to a registered dietitian who answers questions, adjusts your plan, and keeps you accountable every week.',
      },
      {
        title: 'Progress Tracking',
        description:
          'Log meals, weight, and energy in seconds and watch clear trend charts turn small daily wins into lasting results.',
      },
      {
        title: 'Recipe Library',
        description:
          'Hundreds of fresh, fast, dietitian-approved recipes with macros, prep times, and one-tap swaps for picky eaters.',
      },
    ]

    const source = props.services?.length ? props.services : defaults
    const features = source.map((s, i) => ({
      title: s.title,
      description: s.description,
      icon: icons[i % icons.length],
    }))

    return (
      <section
        className={cn(
          'relative overflow-hidden bg-background py-16 lg:py-24',
          props.className,
        )}
      >
        <Watermark className="-top-4 right-2 text-[6rem] sm:text-[9rem] lg:text-[13rem]">
          Eat well
        </Watermark>
        <Container className="relative">
          {/* Asymmetric left-aligned header. */}
          <div className="mb-12 max-w-2xl lg:mb-16">
            <MonoTag className="mb-4 block">01 / What's included</MonoTag>
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              {heading}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">{subheading}</p>
          </div>

          {/* Collapsed-border hairline service ledger. */}
          <div className="grid grid-cols-1 border-l border-t border-border sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => (
              <ServiceCard
                key={f.title}
                className="group relative gap-4 overflow-hidden rounded-none border-0 border-b border-r border-border bg-card p-6 transition-colors duration-150 hover:bg-muted/40 lg:p-7"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -bottom-5 right-1 text-[6rem] font-extrabold leading-none tracking-tighter tabular-nums text-foreground/[0.04]"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="relative flex items-center justify-between">
                  <ServiceIcon className="size-10 rounded-none border border-border bg-primary/10">
                    {f.icon}
                  </ServiceIcon>
                  <MonoTag tone="faint" aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </MonoTag>
                </div>
                <ServiceTitle className="relative text-lg font-bold tracking-tight">
                  {f.title}
                </ServiceTitle>
                <ServiceDescription className="relative leading-relaxed">
                  {f.description}
                </ServiceDescription>
              </ServiceCard>
            ))}
          </div>
        </Container>
      </section>
    )
  },
})
