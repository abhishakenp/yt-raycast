import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import {
  SaasMutationSpinner,
  SaasPlanActionButton,
} from '../saas/saas-interactions.tsx'
import { saasLakebed } from '../saas/saas-lakebed.ts'

/**
 * MobileAppHero — a split, two-column hero for a clean, minimalist mobile-app
 * landing page on a calm muted band. The left column stacks a dot status pill,
 * a large two-line headline, a relaxed subheading, App Store + Google Play
 * download buttons (with Apple / Play glyphs), and an overlapping avatar
 * social-proof row. The right column floats a phone mockup (soft blurred glow
 * behind it) with two floating UI chips: a check-in "done" card and a streak
 * counter. Download buttons route through useNavigate; all imagery is alt-driven
 * via <Image>. Use as the opening hero for a habit tracker, fitness / wellness /
 * meditation app, productivity or to-do app, or any consumer app-download page.
 * Renders fully with no props via baked-in "DailyFlow" defaults.
 */
export const MobileAppHero = defineCapsule({
  name: 'MobileAppHero',
  description:
    'Split two-column hero for a clean, minimalist mobile-app landing page on a calm muted band: App Store and Google Play buttons record shared Lakebed download intent with scoped loading, while the right column floats a phone mockup with progress chips. Use as the opening hero for a habit tracker, fitness / wellness / meditation app, productivity or to-do app, or any consumer app-download page.',
  props: z.object({
    badge: z.string().optional(),
    headingTop: z.string().optional(),
    headingBottom: z.string().optional(),
    subheading: z.string().optional(),
    primaryCta: z.string().optional(),
    secondaryCta: z.string().optional(),
    socialProof: z.string().optional(),
    imageAlt: z.string().optional(),
    chipTitle: z.string().optional(),
    chipSubtitle: z.string().optional(),
    streakValue: z.string().optional(),
    streakLabel: z.string().optional(),
    /** Avatar alt strings for the overlapping social-proof row. */
    avatars: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  lakebed: saasLakebed,
  component: ({ props, lakebed }) => {
    const badge = props.badge ?? 'Trusted by 50,000+ habit builders'
    const headingTop = props.headingTop ?? 'Build better habits,'
    const headingBottom = props.headingBottom ?? 'one day at a time'
    const subheading =
      props.subheading ??
      'DailyFlow helps you create lasting routines with gentle reminders, visual streak tracking, and insights that actually make sense. No guilt, no pressure—just progress.'
    const primaryCta = props.primaryCta ?? 'App Store'
    const secondaryCta = props.secondaryCta ?? 'Google Play'
    const socialProof =
      props.socialProof ?? 'Joined by 12,847 people this month'
    const imageAlt =
      props.imageAlt ??
      'iPhone displaying a habit tracking mobile app interface with daily progress circles'
    const chipTitle = props.chipTitle ?? 'Morning Meditation'
    const chipSubtitle = props.chipSubtitle ?? 'Done at 7:23 AM'
    const streakValue = props.streakValue ?? '24'
    const streakLabel = props.streakLabel ?? 'day streak'
    const avatars = props.avatars?.length
      ? props.avatars
      : [
          'Professional headshot of a smiling woman with dark hair',
          'Professional headshot of a man with short curly hair and glasses',
          'Professional headshot of a woman with blonde hair smiling',
          'Professional headshot of a man with beard and warm smile',
        ]

    const AppleIcon = () => (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="size-5"
        aria-hidden="true"
      >
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
      </svg>
    )

    const PlayIcon = () => (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="size-5"
        aria-hidden="true"
      >
        <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
      </svg>
    )

    const CheckIcon = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M5 13l4 4L19 7" />
      </svg>
    )

    return (
      <section
        className={cn(
          'bg-muted/50 pb-20 pt-32 lg:pb-32 lg:pt-40',
          props.className,
        )}
        aria-labelledby="mobileapp-hero-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="max-w-xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1">
                <span className="size-2 rounded-full bg-primary" />
                <span className="text-xs font-medium text-muted-foreground">
                  {badge}
                </span>
              </div>
              <h1
                id="mobileapp-hero-heading"
                className="mb-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl"
              >
                {headingTop}
                <br />
                {headingBottom}
              </h1>
              <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
                {subheading}
              </p>
              <div className="mb-10 flex flex-col gap-4 sm:flex-row">
                <SaasPlanActionButton
                  lakebed={lakebed}
                  intentLabel={primaryCta}
                  plan={primaryCta}
                  source="hero-download"
                  pendingChildren={
                    <>
                      <SaasMutationSpinner className="size-4" />
                      Opening
                    </>
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-70"
                >
                  <AppleIcon />
                  {primaryCta}
                </SaasPlanActionButton>
                <SaasPlanActionButton
                  lakebed={lakebed}
                  intentLabel={secondaryCta}
                  plan={secondaryCta}
                  source="hero-download"
                  pendingChildren={
                    <>
                      <SaasMutationSpinner className="size-4" />
                      Opening
                    </>
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-input bg-background px-6 py-3 text-base font-medium text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-70"
                >
                  <PlayIcon />
                  {secondaryCta}
                </SaasPlanActionButton>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex -space-x-2">
                  {avatars.map((a) => (
                    <Image
                      key={a}
                      alt={a}
                      w={100}
                      h={100}
                      className="size-8 rounded-full border-2 border-background object-cover"
                    />
                  ))}
                </div>
                <span>{socialProof}</span>
              </div>
            </div>
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative">
                <div
                  aria-hidden="true"
                  className="absolute -left-4 -top-4 size-72 rounded-full bg-primary/20 opacity-50 blur-3xl"
                />
                <Image
                  alt={imageAlt}
                  w={400}
                  h={800}
                  className="relative w-72 rounded-[2.5rem] border-8 border-foreground object-cover shadow-2xl sm:w-80 lg:w-96"
                />
                <div className="absolute -bottom-6 -right-6 rounded-2xl border border-border bg-card p-4 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="grid size-10 place-items-center rounded-full bg-primary/10">
                      <CheckIcon className="size-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-card-foreground">
                        {chipTitle}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {chipSubtitle}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="absolute -right-4 -top-4 rounded-2xl border border-border bg-card p-3 shadow-xl">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-card-foreground">
                      {streakValue}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {streakLabel}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  },
})
