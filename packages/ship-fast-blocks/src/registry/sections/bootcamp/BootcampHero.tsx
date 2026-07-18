import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'
import {
  HeroSection,
  HeroStatBadge,
  HeroStatBadgeIcon,
  HeroStatBadgeContent,
  HeroStatBadgeTitle,
  HeroStatBadgeSubtitle,
} from '#/section-kit/HeroSection.tsx'

/**
 * BootcampHero — split-layout hero section for a coding bootcamp / career-school
 * landing page. A two-column band on a muted canvas with a soft gradient wash:
 * on the left, a pulsing live-cohort pill badge, a bold multi-line headline with
 * one phrase in the primary accent color, a supporting paragraph, dual CTAs
 * (filled primary + outlined secondary), and an inline trust-chip row beneath;
 * on the right, a glowing cohort photo with a floating stat card showing
 * graduate headshots and a placement count. CTAs route through useNavigate.
 * Use as the opening hero for coding bootcamps, software-engineering academies,
 * dev courses, or career-switch programs.
 */
export const BootcampHero = defineCapsule({
  name: 'BootcampHero',
  description:
    'Split-layout hero section for a coding bootcamp / career-school landing page: two-column band on a muted canvas with a soft gradient wash. Left side has a pulsing live-cohort pill badge, a bold multi-line headline with one phrase in primary accent, a supporting paragraph, dual CTAs (filled primary + outlined secondary), and an inline trust-chip row. Right side has a glowing cohort photo with a floating stat card showing graduate headshots and a placement count. CTAs route through useNavigate. Use as the opening hero for coding bootcamps, software-engineering academies, dev courses, or career-switch programs.',
  props: z.object({
    /** Availability / cohort pill text. */
    badge: z.string().optional(),
    /** First heading line (before the highlight). */
    headingTop: z.string().optional(),
    /** Phrase rendered with the accent highlight color. */
    highlight: z.string().optional(),
    /** Supporting paragraph under the headline. */
    subheading: z.string().optional(),
    /** Filled primary CTA label. */
    primaryCta: z.string().optional(),
    /** Outlined secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Inline trust chips beneath the CTAs. */
    trust: z.array(z.string()).optional(),
    /** Alt text driving the hero cohort photo. */
    imageAlt: z.string().optional(),
    /** Stat figure in the floating card. */
    statValue: z.string().optional(),
    /** Stat label in the floating card. */
    statLabel: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heroBadge = props.badge ?? 'Next cohort starts July 14, 2025'
    const heroHeadingTop = props.headingTop ?? 'Become a Full-Stack'
    const heroHighlight = props.highlight ?? 'Developer in 16 Weeks'
    const heroSub =
      props.subheading ??
      'Join 2,400+ graduates who transformed their careers. Learn JavaScript, React, Node.js, and PostgreSQL through hands-on projects with 1:1 mentorship from senior engineers at Google, Stripe, and Airbnb.'
    const heroPrimary = props.primaryCta ?? 'Start Your Application'
    const heroSecondary = props.secondaryCta ?? 'View Curriculum'
    const heroTrust = props.trust?.length
      ? props.trust
      : ['Job guarantee', '89% placement rate', 'Income share option']
    const heroImageAlt =
      props.imageAlt ??
      'diverse group of students collaborating on laptops in a modern coding workspace'
    const heroStatValue = props.statValue ?? '2,400+'
    const heroStatLabel = props.statLabel ?? 'graduates placed'

    const Check = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
    )

    return (
      <HeroSection
        variant="split"
        className={cn('relative overflow-hidden bg-muted/40', props.className)}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent"
        />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5">
                <span className="size-2 animate-pulse rounded-full bg-primary" />
                <span className="text-xs font-medium text-muted-foreground">
                  {heroBadge}
                </span>
              </div>
              <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                {heroHeadingTop}
                <br />
                <span className="text-primary">{heroHighlight}</span>
              </h1>
              <p className="max-w-lg text-lg leading-relaxed text-muted-foreground">
                {heroSub}
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(heroPrimary)}
                  className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3.5 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {heroPrimary}
                </button>
                <button
                  type="button"
                  onClick={() => go(heroSecondary)}
                  className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-6 py-3.5 font-medium text-foreground transition-colors hover:border-foreground/30"
                >
                  {heroSecondary}
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                {heroTrust.map((t) => (
                  <div key={t} className="flex items-center gap-2">
                    <Check className="size-4 text-primary" />
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div
                aria-hidden="true"
                className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-primary/20 to-accent/30 blur-2xl"
              />
              <Image
                alt={heroImageAlt}
                w={800}
                h={600}
                className="relative aspect-[4/3] w-full rounded-2xl border border-border object-cover shadow-lg"
              />
              <HeroStatBadge
                className="absolute -bottom-6 -left-6 flex items-center gap-3"
              >
                <HeroStatBadgeIcon className="flex -space-x-2 rounded-none bg-transparent">
                  {[
                    'professional headshot of a female graduate',
                    'professional headshot of a male graduate',
                    'professional headshot of a smiling graduate',
                  ].map((a) => (
                    <Image
                      key={a}
                      alt={a}
                      w={80}
                      h={80}
                      className="size-8 rounded-full border-2 border-card object-cover"
                    />
                  ))}
                </HeroStatBadgeIcon>
                <HeroStatBadgeContent className="text-sm">
                  <HeroStatBadgeTitle className="font-semibold">
                    {heroStatValue}
                  </HeroStatBadgeTitle>
                  <HeroStatBadgeSubtitle className="text-muted-foreground">
                    {heroStatLabel}
                  </HeroStatBadgeSubtitle>
                </HeroStatBadgeContent>
              </HeroStatBadge>
            </div>
          </div>
        </div>
      </HeroSection>
    )
  },
})
