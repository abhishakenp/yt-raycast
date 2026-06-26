import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'

/**
 * YogaStudioHero — calm, full-bleed hero for a yoga-studio landing page. A warm
 * movement or studio-space photograph fills the band under a soft token-based
 * overlay so light text reads cleanly. Centered content stacks an uppercase
 * eyebrow, a large headline, a grounding supporting paragraph, and dual CTAs
 * (filled "Try a Class" + outlined "See Schedule"). CTAs route through
 * useNavigate. Use as the opening hero for yoga studios, movement spaces,
 * pilates studios, and mindfulness centers. Renders fully with no props.
 */
export const YogaStudioHero = defineComponent({
  name: 'YogaStudioHero',
  description:
    "Calm full-bleed hero for a yoga-studio landing page: a warm movement or studio-space photo fills the band under a soft token-based overlay so light text stays readable. Centered content has an uppercase eyebrow, a large headline, a grounding supporting paragraph, and dual CTAs (filled 'Try a Class' + outlined 'See Schedule'). CTAs route through useNavigate. Use as the opening hero for yoga studios, movement spaces, pilates studios, and mindfulness centers.",
  props: z.object({
    /** Small uppercase eyebrow above the headline. */
    eyebrow: z.string().optional(),
    /** Large headline. */
    heading: z.string().optional(),
    /** Supporting paragraph beneath the headline. */
    subheading: z.string().optional(),
    /** Filled primary CTA label. */
    primaryCta: z.string().optional(),
    /** Route label the primary CTA navigates to. */
    primaryTarget: z.string().optional(),
    /** Outlined secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Route label the secondary CTA navigates to. */
    secondaryTarget: z.string().optional(),
    /** Alt text driving the full-bleed hero photo. */
    imageAlt: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const eyebrow = props.eyebrow ?? 'Move · Breathe · Belong'
    const heading = props.heading ?? 'Find your flow, on and off the mat'
    const subheading =
      props.subheading ??
      'A welcoming studio for every body and every level. Roll out your mat, take a breath, and move through practice with teachers who meet you exactly where you are.'
    const primaryCta = props.primaryCta ?? 'Try a Class'
    const primaryTarget = props.primaryTarget ?? 'Trial'
    const secondaryCta = props.secondaryCta ?? 'See Schedule'
    const secondaryTarget = props.secondaryTarget ?? 'Schedule'
    const imageAlt =
      props.imageAlt ??
      'warm sunlit yoga studio with wood floors and people moving through a flowing practice'

    return (
      <section
        className={cn('relative isolate overflow-hidden', props.className)}
      >
        <Image
          alt={imageAlt}
          w={1920}
          h={1080}
          loading="lazy"
          className="absolute inset-0 -z-10 size-full object-cover"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-foreground/50"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-t from-foreground/60 via-foreground/20 to-foreground/40"
        />

        <div className="mx-auto flex max-w-7xl flex-col items-center px-6 pb-28 pt-36 text-center sm:pt-40 lg:px-8 lg:pb-32 lg:pt-48">
          <span className="inline-flex items-center rounded-full border border-background/30 bg-background/10 px-4 py-1.5 text-xs font-medium tracking-[0.2em] text-background uppercase backdrop-blur-sm">
            {eyebrow}
          </span>

          <h1 className="mt-8 max-w-3xl text-4xl font-bold leading-tight tracking-tight text-background sm:text-5xl lg:text-6xl">
            {heading}
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-background/80 sm:text-lg">
            {subheading}
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <button
              type="button"
              onClick={() => go(primaryTarget)}
              className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-4 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {primaryCta}
            </button>
            <button
              type="button"
              onClick={() => go(secondaryTarget)}
              className="inline-flex items-center justify-center rounded-full border border-border bg-card/10 px-8 py-4 font-medium text-background backdrop-blur-sm transition-colors hover:bg-card/20"
            >
              {secondaryCta}
            </button>
          </div>
        </div>
      </section>
    )
  },
})
