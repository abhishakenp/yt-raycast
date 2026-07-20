import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import {
  LocalServiceBookingButton,
  LocalServiceMutationSpinner,
} from '../local-service/local-service-interactions.tsx'
import { localServiceLakebed } from '../local-service/local-service-lakebed.ts'
import { HeroSection } from '#/section-kit/HeroSection.tsx'
import {
  HeroStatBadge,
  HeroStatBadgeIcon,
  HeroStatBadgeContent,
  HeroStatBadgeTitle,
  HeroStatBadgeSubtitle,
} from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * HealthcareHero — calm Swiss-clinical asymmetric 7/5 hero for a primary-care /
 * medical-clinic landing page. On an airy background carrying a giant ghost "+"
 * cross watermark: a left column with a square hairline status chip (mono
 * "now accepting new patients" micro-label + single primary dot), a giant
 * fluid-clamp extrabold headline with one accent-colored word, a lede
 * paragraph, dual square CTAs (filled-primary book button + outlined secondary),
 * and a hairline ledger row of trust signals with primary tick dashes; the
 * right column shows a hairline double-framed exam-room photo with two square
 * cards overlapping its corners — an "Open Today" hours card and a
 * stacked-avatar patient-count card. Precise, trustworthy, light clinical
 * aesthetic. Use as the top hero for doctors' offices, family medicine,
 * pediatric, women's-health, telehealth or urgent-care clinics. Renders fully
 * with no props via baked-in "Vitality Health Partners" defaults.
 */
export const HealthcareHero = defineCapsule({
  name: 'HealthcareHero',
  description:
    "Calm Swiss-clinical asymmetric 7/5 hero for a primary-care / medical-clinic landing page: an airy band with a giant ghost '+' cross watermark, a left column with a square hairline status chip (mono now-accepting-new-patients micro-label + primary dot), a giant fluid extrabold headline with one accent-colored word, a lede paragraph, dual square CTAs (filled-primary book button + outlined secondary), and a hairline ledger row of trust signals with primary tick dashes, and a right column with a hairline double-framed exam-room photo and two square overlapping cards (an Open-Today hours card and a stacked-avatar patient-count card). Precise, trustworthy, light clinical aesthetic. Use as the top hero for doctors' offices, family medicine, pediatric, women's-health, telehealth or urgent-care clinics.",
  props: z.object({
    /** Pulsing availability pill text. */
    badge: z.string().optional(),
    /** Heading text before the highlighted word. */
    headingBefore: z.string().optional(),
    /** Word rendered in the accent color. */
    highlight: z.string().optional(),
    /** Heading text after the highlighted word. */
    headingAfter: z.string().optional(),
    /** Supporting paragraph under the headline. */
    subheading: z.string().optional(),
    /** Solid primary CTA label. */
    primaryCta: z.string().optional(),
    /** Outlined secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Trust signals beneath the CTAs. */
    trust: z.array(z.string()).optional(),
    /** Alt text driving the hero photo. */
    imageAlt: z.string().optional(),
    /** Floating "open today" hours card label. */
    hoursLabel: z.string().optional(),
    /** Floating "open today" hours card value. */
    hoursValue: z.string().optional(),
    /** Floating patient-count card text. */
    patientCount: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: localServiceLakebed,
  component: ({ props, lakebed }) => {
    const badge = props.badge ?? 'Now accepting new patients'
    const headingBefore = props.headingBefore ?? 'Healthcare that puts '
    const highlight = props.highlight ?? 'you'
    const headingAfter = props.headingAfter ?? ' first'
    const subheading =
      props.subheading ??
      'Experience modern primary care with same-day appointments, transparent pricing, and a team that truly listens. Serving San Francisco families since 2015.'
    const primaryCta = props.primaryCta ?? 'Schedule Your Visit'
    const secondaryCta = props.secondaryCta ?? 'Explore Services'
    const trust = props.trust?.length
      ? props.trust
      : ['Insurance accepted', 'Same-day visits', 'Virtual care']
    const imageAlt =
      props.imageAlt ?? 'Modern medical examination room with natural light'
    const hoursLabel = props.hoursLabel ?? 'Open Today'
    const hoursValue = props.hoursValue ?? '7:00 AM - 7:00 PM'
    const patientCount = props.patientCount ?? '4,900+ patients'

    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    )

    return (
      <HeroSection
        variant="split"
        className={cn(
          'relative overflow-hidden border-b border-border bg-background',
          props.className,
        )}
        aria-labelledby="hero-heading"
      >
        <Watermark className="-top-16 right-[-4.5rem] text-[13rem] sm:right-[-6rem] sm:text-[18rem] lg:-top-24 lg:text-[24rem]">
          +
        </Watermark>
        <Container size="xl" className="relative py-16 sm:py-20 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="max-w-2xl lg:col-span-7">
              <div className="mb-7 inline-flex items-center gap-2.5 border border-border bg-background px-3.5 py-2">
                <span
                  className="size-1.5 animate-pulse rounded-full bg-primary"
                  aria-hidden="true"
                />
                <MonoTag>{badge}</MonoTag>
              </div>
              <h1
                id="hero-heading"
                className="mb-6 max-w-2xl text-[clamp(2.5rem,6vw,4.75rem)] font-extrabold leading-[0.98] tracking-tight text-foreground text-balance"
              >
                {headingBefore}
                <span className="text-primary">{highlight}</span>
                {headingAfter}
              </h1>
              <p className="mb-9 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                {subheading}
              </p>
              <div className="mb-12 flex flex-col gap-3 sm:flex-row sm:gap-4">
                <LocalServiceBookingButton
                  lakebed={lakebed}
                  intentLabel={primaryCta}
                  service="Healthcare appointment"
                  source="hero"
                  pendingChildren={
                    <LocalServiceMutationSpinner className="text-primary-foreground" />
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-none bg-primary px-7 py-3.5 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:translate-y-px disabled:pointer-events-none disabled:opacity-70"
                >
                  {primaryCta}
                  <ArrowRight />
                </LocalServiceBookingButton>
                <NavbarRouteLink
                  className="inline-flex items-center justify-center rounded-none border border-foreground/25 bg-background px-7 py-3.5 text-base font-semibold text-foreground transition-colors hover:bg-muted active:translate-y-px"
                  href={secondaryCta}
                >
                  {secondaryCta}
                </NavbarRouteLink>
              </div>
              <div className="grid max-w-xl grid-cols-1 gap-0 border-t border-border sm:grid-cols-3">
                {trust.map((t) => (
                  <div
                    key={t}
                    className="flex items-center gap-3 border-b border-border py-3.5 text-sm text-muted-foreground sm:border-b-0 sm:pr-4"
                  >
                    <span
                      aria-hidden="true"
                      className="h-px w-4 shrink-0 bg-primary"
                    />
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative lg:col-span-5">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-3 border border-border sm:-inset-4"
              />
              <div className="aspect-[4/3] overflow-hidden rounded-none border border-border bg-muted">
                <Image
                  alt={imageAlt}
                  w={1200}
                  h={900}
                  className="size-full object-cover"
                />
              </div>
              <HeroStatBadge className="absolute -bottom-5 -left-3 flex items-center gap-3 rounded-none border border-border bg-background p-4 shadow-none sm:-left-8">
                <HeroStatBadgeIcon className="size-11 rounded-none bg-primary text-primary-foreground">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </HeroStatBadgeIcon>
                <HeroStatBadgeContent>
                  <HeroStatBadgeTitle className="text-sm font-bold tracking-tight text-foreground">
                    {hoursLabel}
                  </HeroStatBadgeTitle>
                  <HeroStatBadgeSubtitle className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground tabular-nums">
                    {hoursValue}
                  </HeroStatBadgeSubtitle>
                </HeroStatBadgeContent>
              </HeroStatBadge>
              <HeroStatBadge className="absolute -right-3 -top-4 flex items-center gap-3 rounded-none border border-border bg-background p-3 shadow-none">
                <HeroStatBadgeIcon className="flex -space-x-2 rounded-none bg-transparent">
                  {['a', 'b', 'c'].map((k) => (
                    <span
                      key={k}
                      className="size-8 rounded-full border-2 border-background bg-secondary"
                    />
                  ))}
                </HeroStatBadgeIcon>
                <HeroStatBadgeTitle
                  asChild
                  className="text-sm font-bold tracking-tight text-foreground tabular-nums"
                >
                  <span>{patientCount}</span>
                </HeroStatBadgeTitle>
              </HeroStatBadge>
            </div>
          </div>
        </Container>
      </HeroSection>
    )
  },
})
