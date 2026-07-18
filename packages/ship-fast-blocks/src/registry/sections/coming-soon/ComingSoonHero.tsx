import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  HeroSection,
  HeroContent,
  HeroSubheading,
  HeroStatBadge,
  HeroStatBadgeTitle,
} from '#/section-kit/HeroSection.tsx'
import { newsletterLakebed } from '../newsletter/newsletter-lakebed.ts'
import { NewsletterSubscribeForm } from '../newsletter/newsletter-interactions.tsx'

/**
 * ComingSoonHero — centered hero band for a "launching soon" / waitlist pre-launch
 * landing page. Alight, airy section with a launch-date eyebrow label, a large
 * multi-line headline (one phrase in normal weight for emphasis), a supporting
 * paragraph, a four-cell countdown timer (Days/Hours/Minutes/Seconds), and an
 * inline email-capture form with a primary submit button and a disclaimer line.
 * Form submit writes to the shared Lakebed subscriber list. Use as the
 * opening hero for SaaS waitlists, app pre-launch pages, beta sign-ups, or any
 * countdown / "notify me" landing page. Renders fully with no props via
 * baked-in "Nexus" defaults.
 */
export const ComingSoonHero = defineCapsule({
  name: 'ComingSoonHero',
  description:
    "Centered hero band for a 'launching soon' / waitlist pre-launch landing page: launch-date eyebrow label, large multi-line headline with one phrase in normal weight for emphasis, supporting paragraph, four-cell countdown timer (Days/Hours/Minutes/Seconds), and an inline email-capture form with primary submit button and disclaimer. Form submit writes to the shared Lakebed subscriber list. Use as the opening hero for SaaS waitlists, app pre-launch pages, beta sign-ups, or countdown / 'notify me' landing pages.",
  props: z.object({
    /** Launch date / status eyebrow text. */
    eyebrow: z.string().optional(),
    /** First line of the headline (before the emphasis). */
    headingTop: z.string().optional(),
    /** Emphasized phrase rendered with normal weight on its own line. */
    headingEmphasis: z.string().optional(),
    /** Supporting paragraph under the headline. */
    subheading: z.string().optional(),
    /** Email input placeholder text. */
    emailPlaceholder: z.string().optional(),
    /** Submit button label. */
    submit: z.string().optional(),
    /** Disclaimer line under the form. */
    disclaimer: z.string().optional(),
    /** Four-cell countdown data: value + label pairs. */
    countdown: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: newsletterLakebed,
  component: ({ props, lakebed }) => {
    const eyebrow = props.eyebrow ?? 'Launching March 15, 2025'
    const headingTop = props.headingTop ?? 'The future of'
    const headingEmphasis = props.headingEmphasis ?? 'collaborative work'
    const subheading =
      props.subheading ??
      "Nexus brings your team's documents, conversations, and workflows into one beautiful, unified space. Join 12,000+ teams on the waitlist."
    const emailPlaceholder = props.emailPlaceholder ?? 'Enter your email'
    const submit = props.submit ?? 'Join Waitlist'
    const disclaimer =
      props.disclaimer ??
      'Early access members receive 50% off for 6 months. No spam, unsubscribe anytime.'
    const countdown = props.countdown?.length
      ? props.countdown
      : [
          { value: '00', label: 'Days' },
          { value: '00', label: 'Hours' },
          { value: '00', label: 'Minutes' },
          { value: '00', label: 'Seconds' },
        ]

    const inputCls =
      'flex-1 rounded-lg border border-input bg-background px-5 py-3.5 text-sm text-foreground placeholder-muted-foreground transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring'
    const submitCls =
      'whitespace-nowrap rounded-lg bg-primary px-8 py-3.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'

    return (
      <HeroSection
        variant="default"
        className={cn(
          'w-full px-4 pb-24 pt-16 sm:px-6 sm:pb-32 sm:pt-24 lg:px-8 lg:pb-40 lg:pt-32 xl:px-12',
          props.className,
        )}
      >
        <HeroContent className="mx-auto max-w-4xl text-center">
          <p className="mb-6 text-xs font-medium uppercase tracking-widest text-muted-foreground sm:text-sm">
            {eyebrow}
          </p>
          <h1 className="mb-8 text-4xl font-light leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl xl:text-7xl">
            {headingTop}
            <br className="hidden sm:block" />{' '}
            <span className="font-normal">{headingEmphasis}</span>
          </h1>
          <HeroSubheading variant="large" className="mb-12 font-light">
            {subheading}
          </HeroSubheading>

          {/* Countdown timer */}
          <div
            className="mb-12 flex flex-wrap justify-center gap-4 sm:gap-6"
            aria-label="Time remaining until launch"
          >
            {countdown.map((unit) => (
              <div key={unit.label} className="flex flex-col items-center">
                <HeroStatBadge
                  className="flex size-16 items-center justify-center rounded-lg sm:size-20"
                >
                  <HeroStatBadgeTitle asChild className="text-2xl font-light sm:text-3xl">
                    <span>{unit.value}</span>
                  </HeroStatBadgeTitle>
                </HeroStatBadge>
                <span className="mt-2 text-xs uppercase tracking-wider text-muted-foreground">
                  {unit.label}
                </span>
              </div>
            ))}
          </div>

          {/* Email capture */}
          <NewsletterSubscribeForm
            lakebed={lakebed}
            source={submit}
            placeholder={emailPlaceholder}
            buttonLabel={submit}
            successMessage="You're on the waitlist. Early access updates will arrive by email."
            className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row"
            inputClassName={inputCls}
            buttonClassName={`${submitCls} disabled:pointer-events-none disabled:opacity-70`}
          />
          <p className="mt-3 text-xs text-muted-foreground">{disclaimer}</p>
        </HeroContent>
      </HeroSection>
    )
  },
})
