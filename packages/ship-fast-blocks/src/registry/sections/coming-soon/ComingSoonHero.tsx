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
import { Container } from '#/section-kit/Container.tsx'
import { Watermark } from '#/section-kit/Decor.tsx'
import { newsletterLakebed } from '../newsletter/newsletter-lakebed.ts'
import { NewsletterSubscribeForm } from '../newsletter/newsletter-interactions.tsx'

/**
 * ComingSoonHero — kinetic teaser hero for a "launching soon" / waitlist
 * pre-launch landing page. A mono metadata rail ("[ T-MINUS ] — STATUS /
 * PRELAUNCH") sits above a giant clamp-scale display headline whose emphasis
 * line renders as hollow outlined ghost type, over a huge faint watermark
 * numeral. Below, an asymmetric 7:5 split: a collapsed-border countdown grid
 * with countdown-scale tabular numerals (Days/Hours/Minutes/Seconds) on the
 * left, and the supporting paragraph + sharp-cornered email-capture form with
 * a hard-offset-shadow primary submit and mono disclaimer offset on the
 * right. A full-bleed marquee-style strip of the repeated launch-date label
 * closes the band. Form submit writes to the shared Lakebed subscriber list.
 * Use as the opening hero for SaaS waitlists, app pre-launch pages, beta
 * sign-ups, or any countdown / "notify me" landing page. Renders fully with
 * no props via baked-in "Nexus" defaults.
 */
export const ComingSoonHero = defineCapsule({
  name: 'ComingSoonHero',
  description:
    "Kinetic teaser hero for a 'launching soon' / waitlist pre-launch landing page: mono metadata rail with the launch-date eyebrow, giant clamp-scale display headline with the emphasis phrase in hollow outlined ghost type, huge faint watermark numeral behind, then an asymmetric 7:5 split — collapsed-border countdown grid with countdown-scale tabular numerals (Days/Hours/Minutes/Seconds) left, supporting paragraph plus sharp-cornered email-capture form with hard-offset-shadow primary submit and mono disclaimer right — closed by a full-bleed marquee-style strip of the repeated launch label. Form submit writes to the shared Lakebed subscriber list. Use as the opening hero for SaaS waitlists, app pre-launch pages, beta sign-ups, or countdown / 'notify me' landing pages.",
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
      'min-h-12 flex-1 rounded-none border-2 border-foreground/25 bg-background px-4 font-mono text-sm text-foreground transition-colors placeholder:text-muted-foreground focus:border-foreground focus:outline-none'
    const submitCls =
      'inline-flex min-h-12 items-center justify-center whitespace-nowrap rounded-none bg-primary px-7 font-mono text-[13px] font-semibold uppercase tracking-[0.14em] text-primary-foreground shadow-[4px_4px_0_0] shadow-foreground transition-[transform,box-shadow] duration-100 hover:-translate-y-0.5 active:translate-y-px active:shadow-[2px_2px_0_0] active:shadow-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'

    return (
      <HeroSection
        variant="default"
        className={cn(
          'relative w-full overflow-hidden px-4 pb-0 pt-14 sm:px-6 sm:pt-20 lg:px-8 lg:pt-24 xl:px-12',
          props.className,
        )}
      >
        {/* Giant ghost countdown numeral bleeding off the top-right edge. */}
        <Watermark className="-top-8 right-0 text-[9rem] tabular-nums sm:-top-14 sm:text-[16rem] lg:-top-20 lg:text-[24rem]">
          {countdown[0]?.value ?? '00'}
        </Watermark>

        <Container asChild size="4xl">
          <HeroContent className="text-left">
            {/* Mono metadata rail: launch label — hairline — status meta. */}
            <div className="flex items-center gap-4">
              <p className="shrink-0 font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                [ T-minus ] {eyebrow}
              </p>
              <span aria-hidden="true" className="h-px flex-1 bg-border" />
              <p
                aria-hidden="true"
                className="hidden shrink-0 font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground/60 sm:block"
              >
                status / prelaunch
              </p>
            </div>

            <h1 className="mt-8 text-[clamp(3rem,11vw,8.5rem)] font-extrabold uppercase leading-[0.88] tracking-tighter text-foreground">
              {headingTop}
              <br />
              <span className="[-webkit-text-fill-color:transparent] [-webkit-text-stroke:2px_currentColor]">
                {headingEmphasis}
              </span>
            </h1>

            {/* Asymmetric 7:5 split: countdown grid vs copy + capture form. */}
            <div className="mt-12 grid gap-10 sm:mt-16 lg:grid-cols-12 lg:gap-12">
              <div
                className="lg:col-span-7"
                aria-label="Time remaining until launch"
              >
                <div className="grid grid-cols-2 gap-0 border-l-2 border-t-2 border-foreground sm:grid-cols-4">
                  {countdown.map((unit) => (
                    <HeroStatBadge
                      key={unit.label}
                      className="flex flex-col items-start gap-2 rounded-none border-0 border-b-2 border-r-2 border-foreground bg-transparent p-4 text-foreground shadow-none sm:p-5"
                    >
                      <HeroStatBadgeTitle
                        asChild
                        className="text-[clamp(2.75rem,5.5vw,5rem)] font-extrabold leading-none tracking-tighter text-foreground tabular-nums"
                      >
                        <span>{unit.value}</span>
                      </HeroStatBadgeTitle>
                      <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                        {unit.label}
                      </span>
                    </HeroStatBadge>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-5 lg:translate-y-6">
                <HeroSubheading
                  variant="large"
                  className="mx-0 mb-6 max-w-md text-base leading-relaxed sm:text-lg"
                >
                  {subheading}
                </HeroSubheading>
                <NewsletterSubscribeForm
                  lakebed={lakebed}
                  source={submit}
                  placeholder={emailPlaceholder}
                  buttonLabel={submit}
                  successMessage="You're on the waitlist. Early access updates will arrive by email."
                  className="flex max-w-md flex-col gap-3 sm:flex-row"
                  inputClassName={inputCls}
                  buttonClassName={`${submitCls} disabled:pointer-events-none disabled:opacity-70`}
                />
                <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  {disclaimer}
                </p>
              </div>
            </div>

            {/* Full-bleed marquee-style repeated launch strip (static). */}
            <div
              aria-hidden="true"
              className="pointer-events-none -mx-4 mt-14 select-none overflow-hidden whitespace-nowrap border-y-2 border-foreground py-3 sm:-mx-6 sm:mt-20 lg:-mx-8 xl:-mx-12"
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-foreground/60">
                {Array.from({ length: 10 }, () => eyebrow).join('  ✦  ')}
              </p>
            </div>
          </HeroContent>
        </Container>
      </HeroSection>
    )
  },
})
