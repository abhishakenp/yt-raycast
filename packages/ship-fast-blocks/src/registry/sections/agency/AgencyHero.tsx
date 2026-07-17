import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import {
  HeroSection,
  HeroContent,
  HeroBadge,
  HeroHeading,
  HeroHighlight,
  HeroSubheading,
  HeroStats,
  HeroStat,
  HeroStatValue,
  HeroStatLabel,
} from '#/section-kit/HeroSection.tsx'

/**
 * AgencyHero — bold full-bleed hero band for a creative digital-agency landing
 * page. A near-full-viewport, centered section over a soft top-down token
 * gradient with two pulsing blurred glow orbs: an availability pill (pulsing
 * dot), a huge multi-line headline with one phrase rendered in an indigo-violet
 * gradient highlight, a supporting paragraph, dual pill CTAs (filled primary +
 * outlined secondary), and an inline KPI strip beneath. Cinematic, premium,
 * conversion-focused. CTAs route through useNavigate. Use as the opening hero
 * for agencies, design studios, branding shops, or production houses. Renders
 * fully with no props via baked-in "Studio Rise" defaults.
 */
export const AgencyHero = defineCapsule({
  name: 'AgencyHero',
  description:
    'Bold full-bleed hero band for a creative digital-agency landing page: near-full-viewport centered section over a soft token gradient with pulsing blurred glow orbs, an availability pill with a pulsing dot, a huge multi-line headline with one phrase in an indigo-violet gradient highlight, a supporting paragraph, dual pill CTAs (filled primary + outlined secondary), and an inline KPI/stats strip beneath. Cinematic, premium and conversion-focused; CTAs route through useNavigate. Use as the opening hero for agencies, design studios, branding shops, or production houses.',
  props: z.object({
    /** Availability / status pill text. */
    badge: z.string().optional(),
    /** First heading line (before the highlight). */
    headingTop: z.string().optional(),
    /** Phrase rendered with the indigo-violet gradient highlight. */
    highlight: z.string().optional(),
    /** Trailing heading text after the highlight. */
    headingBottom: z.string().optional(),
    /** Supporting paragraph under the headline. */
    subheading: z.string().optional(),
    /** Filled primary CTA label. */
    primaryCta: z.string().optional(),
    /** Outlined secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Inline KPI strip beneath the hero copy. */
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const badge = props.badge ?? 'Available for new projects'
    const headingTop = props.headingTop ?? 'We craft digital'
    const highlight = props.highlight ?? 'experiences'
    const headingBottom = props.headingBottom ?? 'that define brands.'
    const subheading =
      props.subheading ??
      'Strategy, design, and technology fused into cohesive digital products that captivate users and drive measurable business growth.'
    const primaryCta = props.primaryCta ?? 'View our work'
    const secondaryCta = props.secondaryCta ?? 'Start a project'
    const stats = props.stats?.length
      ? props.stats
      : [
          { value: '120+', label: 'Projects delivered' },
          { value: '45', label: 'Industry awards' },
          { value: '8 yrs', label: 'In the game' },
          { value: '98%', label: 'Client retention' },
        ]

    const ArrowRight = () => (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
    )

    return (
      <HeroSection
        variant="gradient"
        className={cn(
          'bg-gradient-to-b from-primary/15 via-accent/5 to-background pt-16',
          props.className,
        )}
      >
        <div aria-hidden="true" className="absolute inset-0 opacity-20">
          <div className="absolute left-1/4 top-1/4 size-96 animate-pulse rounded-full bg-primary/30 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 size-80 animate-pulse rounded-full bg-accent/20 blur-3xl [animation-delay:2s]" />
        </div>
        <HeroContent className="mx-auto max-w-6xl px-6 text-center">
          <HeroBadge variant="pulsing-dot" className="mb-8">
            <span className="size-2 animate-pulse rounded-full bg-primary" />
            {badge}
          </HeroBadge>
          <HeroHeading variant="black">
            {headingTop}
            <br />
            <HeroHighlight variant="gradient">{highlight}</HeroHighlight>{' '}
            {headingBottom}
          </HeroHeading>
          <HeroSubheading variant="large">{subheading}</HeroSubheading>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              type="button"
              onClick={() => go(primaryCta)}
              className="flex items-center gap-2 rounded-full bg-primary px-8 py-4 font-bold text-primary-foreground transition-all hover:bg-primary/90"
            >
              {primaryCta}
              <ArrowRight />
            </button>
            <button
              type="button"
              onClick={() => go(secondaryCta)}
              className="rounded-full border border-border bg-accent/50 px-8 py-4 font-medium text-foreground transition-all hover:bg-accent"
            >
              {secondaryCta}
            </button>
          </div>

          <HeroStats>
            {stats.map((s) => (
              <HeroStat key={s.label}>
                <HeroStatValue>{s.value}</HeroStatValue>
                <HeroStatLabel>{s.label}</HeroStatLabel>
              </HeroStat>
            ))}
          </HeroStats>
        </HeroContent>
      </HeroSection>
    )
  },
})
