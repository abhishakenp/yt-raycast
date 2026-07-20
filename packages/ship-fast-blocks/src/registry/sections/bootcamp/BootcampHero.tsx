import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import {
  HeroSection,
  HeroStatBadge,
  HeroStatBadgeIcon,
  HeroStatBadgeContent,
  HeroStatBadgeTitle,
  HeroStatBadgeSubtitle,
} from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { DotGrid, Watermark } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * BootcampHero — "Terminal Classroom" landing hero for a coding bootcamp /
 * career-school. An asymmetric 7:5 split over a dot-grid background with a
 * giant ghost `</>` watermark: the left column opens with a square mono
 * cohort chip (pulsing live dot), a decorative `$ enroll` prompt line, a
 * giant fluid display headline whose second line is a highlight-marker
 * phrase, a supporting paragraph, dual route-link CTAs (hard-offset-shadow
 * primary block + bracketed mono ghost), and a mono `[x]` checklist trust
 * row; the right column frames the cohort photo as a terminal window (three
 * window dots, mono title bar, hard offset shadow) with a floating
 * square stat card of graduate headshots and a mono placement count. Use as
 * the opening hero for coding bootcamps, software-engineering academies, dev
 * courses, or career-switch programs.
 */
export const BootcampHero = defineCapsule({
  name: 'BootcampHero',
  description:
    'Terminal-styled asymmetric 7:5 split hero for a coding bootcamp / career-school landing page: square mono cohort chip with pulsing live dot, decorative "$ enroll" prompt line, giant fluid display headline with a highlight-marker accent phrase, supporting paragraph, dual route-link CTAs (hard-offset-shadow primary block + bracketed mono ghost), and a mono "[x]" checklist trust row on the left; the cohort photo re-framed as a terminal window with window dots, mono title bar, hard offset shadow, and a floating square stat card of graduate headshots with a mono placement count on the right — all over a dot-grid background with a giant ghost "</>" watermark. CTAs route through section-kit route links. Use as the opening hero for coding bootcamps, software-engineering academies, dev courses, or career-switch programs.',
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

    return (
      <HeroSection
        variant="split"
        className={cn(
          'relative overflow-hidden bg-background',
          props.className,
        )}
      >
        <DotGrid tone="border" className="inset-0 opacity-40" />
        <Watermark
          aria-hidden="true"
          className="-right-6 top-8 font-mono text-[8rem] sm:-right-10 sm:text-[15rem]"
        >
          {'</>'}
        </Watermark>
        <Container size="xl" className="relative py-16 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-none border border-border bg-background px-3 py-1.5">
                <span
                  aria-hidden="true"
                  className="size-2 animate-pulse rounded-full bg-primary"
                />
                <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                  {heroBadge}
                </span>
              </div>
              <p
                aria-hidden="true"
                className="mt-6 font-mono text-sm text-muted-foreground"
              >
                <span className="text-primary">$</span> enroll --track
                full-stack
              </p>
              <h1 className="mt-4 text-[clamp(2.5rem,6.5vw,5rem)] font-bold leading-[0.95] tracking-tighter text-foreground">
                {heroHeadingTop}
                <br />
                <span className="-mx-1 box-decoration-clone bg-primary/15 px-2">
                  {heroHighlight}
                </span>
              </h1>
              <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
                {heroSub}
              </p>
              <div className="mt-8 grid grid-cols-1 gap-3 sm:flex sm:flex-row sm:items-center sm:gap-4">
                <NavbarRouteLink
                  className="inline-flex items-center justify-center rounded-none bg-primary px-4 py-4 font-mono text-sm font-semibold uppercase tracking-[0.12em] text-primary-foreground shadow-[6px_6px_0_0] shadow-primary/25 transition-[background-color,box-shadow,transform] duration-150 hover:bg-primary/90 active:translate-y-px active:shadow-none sm:px-7"
                  href={heroPrimary}
                >
                  {heroPrimary}
                </NavbarRouteLink>
                <NavbarRouteLink
                  className="inline-flex items-center justify-center gap-2 rounded-none border border-border bg-background px-4 py-4 font-mono text-sm font-medium uppercase tracking-[0.12em] text-foreground transition-colors duration-150 hover:bg-foreground hover:text-background active:translate-y-px sm:px-7"
                  href={heroSecondary}
                >
                  <span aria-hidden="true">[</span>
                  {heroSecondary}
                  <span aria-hidden="true">]</span>
                </NavbarRouteLink>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2">
                {heroTrust.map((t) => (
                  <div key={t} className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="font-mono text-xs text-primary"
                    >
                      [x]
                    </span>
                    <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                      {t}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="relative pb-8">
                <div className="overflow-hidden rounded-none border border-border bg-card shadow-[8px_8px_0_0] shadow-foreground/10">
                  <div className="flex items-center gap-2 border-b border-border bg-muted px-4 py-2.5">
                    <span
                      aria-hidden="true"
                      className="size-2.5 rounded-full bg-muted-foreground/40"
                    />
                    <span
                      aria-hidden="true"
                      className="size-2.5 rounded-full bg-muted-foreground/25"
                    />
                    <span
                      aria-hidden="true"
                      className="size-2.5 rounded-full bg-primary/60"
                    />
                    <span className="ml-2 truncate font-mono text-[11px] text-muted-foreground">
                      cohort — live.session
                    </span>
                  </div>
                  <Image
                    alt={heroImageAlt}
                    w={800}
                    h={600}
                    className="aspect-[4/3] w-full object-cover"
                  />
                </div>
                <HeroStatBadge className="absolute -bottom-0 left-4 flex items-center gap-3 rounded-none border-border shadow-[6px_6px_0_0] shadow-foreground/10 sm:-left-6">
                  <HeroStatBadgeIcon className="flex w-auto -space-x-2 rounded-none bg-transparent">
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
                    <HeroStatBadgeTitle className="font-mono font-semibold tabular-nums tracking-tight">
                      {heroStatValue}
                    </HeroStatBadgeTitle>
                    <HeroStatBadgeSubtitle className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                      {heroStatLabel}
                    </HeroStatBadgeSubtitle>
                  </HeroStatBadgeContent>
                </HeroStatBadge>
              </div>
            </div>
          </div>
        </Container>
      </HeroSection>
    )
  },
})
