import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
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

/**
 * HealthcareHero — split hero for a primary-care / medical-clinic landing page.
 * A two-column layout: on the left a pulsing "now accepting patients" pill, a
 * large headline with one accent-colored word, a supporting paragraph, dual
 * CTAs (solid primary + outlined secondary), and a wrapping trust row of
 * check-marked signals; on the right a 4:3 alt-driven exam-room photo with a
 * floating "Open Today" hours card (bottom-left) and a patient-count card with
 * stacked avatars (top-right). Clean, trustworthy, light clinical aesthetic.
 * Use as the top hero for doctors' offices, family medicine, pediatric,
 * women's-health, telehealth or urgent-care clinics. Renders fully with no
 * props via baked-in "Vitality Health Partners" defaults.
 */
export const HealthcareHero = defineCapsule({
  name: 'HealthcareHero',
  description:
    "Split hero for a primary-care / medical-clinic landing page: a two-column layout with a pulsing 'now accepting patients' pill, a large headline with one accent-colored word, a supporting paragraph, dual CTAs (solid primary + outlined secondary) and a check-marked trust row on the left, and a 4:3 alt-driven exam-room photo with a floating 'Open Today' hours card and a patient-count card with stacked avatars on the right. Clean, trustworthy, light clinical aesthetic. Use as the top hero for doctors' offices, family medicine, pediatric, women's-health, telehealth or urgent-care clinics.",
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
    const go = useNavigate()
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

    const CheckCircle = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="currentColor"
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
        className={cn(
          'relative overflow-hidden bg-background',
          props.className,
        )}
        aria-labelledby="hero-heading"
      >
        <Container size="xl" className="py-20 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="max-w-2xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground">
                <span
                  className="size-2 animate-pulse rounded-full bg-primary"
                  aria-hidden="true"
                />
                {badge}
              </div>
              <h1
                id="hero-heading"
                className="mb-6 text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl"
              >
                {headingBefore}
                <span className="text-primary">{highlight}</span>
                {headingAfter}
              </h1>
              <p className="mb-8 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
                {subheading}
              </p>
              <div className="mb-10 flex flex-col gap-4 sm:flex-row">
                <LocalServiceBookingButton
                  lakebed={lakebed}
                  intentLabel={primaryCta}
                  service="Healthcare appointment"
                  source="hero"
                  pendingChildren={
                    <LocalServiceMutationSpinner className="text-primary-foreground" />
                  }
                  className="inline-flex items-center justify-center rounded-xl bg-primary px-8 py-4 font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl disabled:pointer-events-none disabled:opacity-70"
                >
                  {primaryCta}
                  <ArrowRight className="ml-2" />
                </LocalServiceBookingButton>
                <button
                  type="button"
                  onClick={() => go(secondaryCta)}
                  className="inline-flex items-center justify-center rounded-xl border-2 border-border bg-background px-8 py-4 font-semibold text-foreground transition-all hover:border-input hover:bg-muted"
                >
                  {secondaryCta}
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                {trust.map((t) => (
                  <div key={t} className="flex items-center gap-2">
                    <CheckCircle className="text-primary" />
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
                <Image
                  alt={imageAlt}
                  w={1200}
                  h={900}
                  className="size-full object-cover"
                />
              </div>
              <HeroStatBadge className="absolute -bottom-6 -left-6 flex items-center gap-3 shadow-xl">
                <HeroStatBadgeIcon className="size-12 rounded-full bg-accent text-primary">
                  <svg
                    width="24"
                    height="24"
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
                  <HeroStatBadgeTitle className="text-sm font-semibold">
                    {hoursLabel}
                  </HeroStatBadgeTitle>
                  <HeroStatBadgeSubtitle className="text-sm">
                    {hoursValue}
                  </HeroStatBadgeSubtitle>
                </HeroStatBadgeContent>
              </HeroStatBadge>
              <HeroStatBadge className="absolute -right-4 -top-4 flex items-center gap-2 shadow-xl">
                <HeroStatBadgeIcon className="flex -space-x-2 rounded-none bg-transparent">
                  {['a', 'b', 'c'].map((k) => (
                    <span
                      key={k}
                      className="size-8 rounded-full border-2 border-card bg-secondary"
                    />
                  ))}
                </HeroStatBadgeIcon>
                <HeroStatBadgeTitle asChild className="text-sm font-semibold">
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
