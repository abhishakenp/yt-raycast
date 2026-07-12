import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { Image } from '#/lib/img.tsx'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { cn } from '#/lib/utils.ts'

export const UniversityHero = defineCapsule({
  name: 'UniversityHero',
  description:
    'Bespoke full-bleed hero band for the University page family with a prestigious, collegiate aesthetic. Renders a campus photograph through the alt-driven Image component, a dark token overlay, an established-since eyebrow pill, a stately serif headline, supporting copy, dual call-to-action buttons (Apply Now + Visit Campus) routed via useNavigate, and a quick-stats strip summarizing enrollment, graduation rate, and student-faculty ratio. Use as the opening viewport of a university homepage.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    subheading: z.string().optional(),
    primaryCta: z.string().optional(),
    primaryTarget: z.string().optional(),
    secondaryCta: z.string().optional(),
    secondaryTarget: z.string().optional(),
    imageAlt: z.string().optional(),
    quickStats: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const eyebrow = props.eyebrow ?? 'Est. 1887 · Ranked Top 25 Nationally'
    const heading =
      props.heading ?? 'A tradition of inquiry, a future without limits'
    const subheading =
      props.subheading ??
      'For more than a century, Whitmore University has shaped scholars, scientists, and civic leaders. Join a community where rigorous academics meet timeless ideals and a campus built for discovery.'
    const primaryCta = props.primaryCta ?? 'Apply Now'
    const primaryTarget = props.primaryTarget ?? 'Admissions'
    const secondaryCta = props.secondaryCta ?? 'Visit Campus'
    const secondaryTarget = props.secondaryTarget ?? 'Campus Life'
    const imageAlt =
      props.imageAlt ?? 'historic university campus quad with stone buildings'
    const quickStats = props.quickStats?.length
      ? props.quickStats
      : ['18,000 students', '95% graduation rate', '22:1 student-faculty ratio']

    return (
      <section
        className={cn(
          'relative isolate flex min-h-[640px] items-center overflow-hidden bg-foreground py-20 text-background lg:py-28',
          props.className,
        )}
      >
        <Image
          alt={imageAlt}
          w={1920}
          h={1080}
          className="absolute inset-0 -z-10 size-full object-cover"
        />
        <div
          className="absolute inset-0 -z-10 bg-foreground/60"
          aria-hidden="true"
        />
        <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
          <span className="inline-flex items-center rounded-full border border-background/30 bg-background/10 px-4 py-2 text-sm font-medium uppercase tracking-wide text-background backdrop-blur-sm">
            {eyebrow}
          </span>
          <h1 className="mt-8 font-serif text-4xl font-bold leading-tight text-background sm:text-6xl">
            {heading}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-background/85">
            {subheading}
          </p>
          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => go(primaryTarget)}
              className="rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              {primaryCta}
            </button>
            <button
              type="button"
              onClick={() => go(secondaryTarget)}
              className="rounded-full border border-background/40 bg-background/10 px-7 py-3 text-sm font-semibold text-background backdrop-blur-sm transition hover:bg-background/20"
            >
              {secondaryCta}
            </button>
          </div>
          <div className="mx-auto mt-12 flex max-w-2xl flex-wrap items-center justify-center gap-x-3 gap-y-2 border-t border-background/20 pt-8 text-sm font-medium text-background/80">
            {quickStats.map((stat, i) => (
              <span key={stat} className="flex items-center gap-3">
                {i > 0 ? (
                  <span aria-hidden="true" className="text-background/40">
                    ·
                  </span>
                ) : null}
                {stat}
              </span>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
