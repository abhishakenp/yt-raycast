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
 * MobileAppHero — a kinetic app-showcase split hero for a consumer mobile-app
 * landing page on a calm muted band washed with a fading dot grid and a giant
 * ghost "APP" watermark. An asymmetric 7:5 grid: on the left a square mono
 * status chip with a pulsing dot, a huge clamp-scaled extrabold headline whose
 * final word sits on a tilted primary marker block, a relaxed subheading, a
 * mono "[ INSTALL → OPEN → REPEAT ]" micro-strip, sharp App Store + Google Play
 * download buttons (Apple / Play glyphs, hard offset shadows, mechanical press
 * feedback), and an overlapping avatar social-proof row. On the right a
 * hairline-chromed device frame with a notch + mono status bar wraps the
 * app-screen mockup, and two rotated hard-shadow stat stickers (a check-in
 * "done" card and a streak counter) overlap its corners. Download buttons record
 * shared Lakebed download intent with scoped loading; all imagery is alt-driven
 * via <Image>. Use as the opening hero for a habit tracker, fitness / wellness /
 * meditation app, productivity or to-do app, or any consumer app-download page.
 * Renders fully with no props via baked-in "DailyFlow" defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
import { HeroSection } from '#/section-kit/HeroSection.tsx'
import { DotGrid, MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import {
  HeroStatBadge,
  HeroStatBadgeIcon,
  HeroStatBadgeContent,
  HeroStatBadgeTitle,
  HeroStatBadgeSubtitle,
} from '#/section-kit/HeroSection.tsx'
export const MobileAppHero = defineCapsule({
  name: 'MobileAppHero',
  description:
    'Kinetic app-showcase split hero for a consumer mobile-app landing page on a calm muted band with a fading dot grid and giant ghost APP watermark: an asymmetric 7:5 grid with a square mono status chip, a huge clamp-scaled headline whose final word sits on a tilted primary marker block, a mono install micro-strip, sharp App Store and Google Play buttons (hard offset shadows, press feedback) that record shared Lakebed download intent with scoped loading, and a hairline-chromed device frame with a notch + mono status bar wrapping the app-screen mockup plus two rotated hard-shadow stat stickers. Use as the opening hero for a habit tracker, fitness / wellness / meditation app, productivity or to-do app, or any consumer app-download page.',
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
    const bottomWords = headingBottom.split(' ')
    const bottomLead = bottomWords.slice(0, -1).join(' ')
    const bottomMark = bottomWords.at(-1) ?? ''
    return (
      <HeroSection
        variant="split"
        className={cn(
          'relative overflow-hidden bg-muted/50 pt-24 pb-20 lg:pt-32 lg:pb-28',
          props.className,
        )}
        aria-labelledby="mobileapp-hero-heading"
      >
        {/* Layered wash: dot grid fading out to the right + ghost watermark. */}
        <DotGrid
          className="inset-y-0 left-0 w-2/3"
          fade="right"
          tone="border"
        />
        <Watermark className="-top-8 right-0 text-[8rem] sm:text-[12rem] lg:-top-12 lg:text-[18rem]">
          APP
        </Watermark>
        <Container className="relative">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-7">
              <span className="mb-6 inline-flex items-center gap-2 border border-border bg-background px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.15em] text-foreground/80">
                <span
                  aria-hidden="true"
                  className="size-2 animate-pulse bg-primary"
                />
                {badge}
              </span>
              <h1
                id="mobileapp-hero-heading"
                className="mb-6 max-w-2xl text-[clamp(2.5rem,6.5vw,4.75rem)] font-extrabold leading-[0.98] tracking-tight text-foreground"
              >
                {headingTop}
                <br />
                {bottomLead ? <>{bottomLead} </> : null}
                <span className="relative ml-[0.04em] inline-block whitespace-nowrap">
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-[-0.12em] inset-y-[0.05em] -rotate-1 bg-primary"
                  />
                  <span className="relative text-primary-foreground">
                    {bottomMark}
                  </span>
                </span>
              </h1>
              <p className="mb-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
                {subheading}
              </p>
              <MonoTag aria-hidden="true" tone="faint" className="mb-8 block">
                [ install → open → repeat ]
              </MonoTag>
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
                  className="inline-flex items-center justify-center gap-2 rounded-none bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground shadow-[5px_5px_0_0] shadow-foreground transition-[transform,box-shadow,background-color] duration-150 hover:bg-primary/90 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none motion-reduce:transform-none disabled:pointer-events-none disabled:opacity-70"
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
                  className="inline-flex items-center justify-center gap-2 rounded-none border border-foreground bg-background px-6 py-3.5 text-base font-semibold text-foreground transition-[transform,background-color] duration-150 hover:bg-muted active:translate-y-px motion-reduce:transform-none disabled:pointer-events-none disabled:opacity-70"
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
                      className="size-8 rounded-none border-2 border-background object-cover"
                    />
                  ))}
                </div>
                <span>{socialProof}</span>
              </div>
            </div>
            <div className="relative flex justify-center lg:col-span-5 lg:justify-end">
              <div className="relative">
                {/* Device frame: hairline chrome, notch + mono status bar. */}
                <div className="relative w-64 rounded-[2.5rem] border-8 border-foreground bg-foreground p-0 shadow-[10px_10px_0_0] shadow-foreground/20 sm:w-72 lg:w-80">
                  <span
                    aria-hidden="true"
                    className="absolute left-1/2 top-2 z-10 h-5 w-24 -translate-x-1/2 rounded-b-2xl bg-foreground"
                  />
                  <div className="relative overflow-hidden rounded-[1.9rem] bg-background">
                    <div
                      aria-hidden="true"
                      className="flex items-center justify-between px-6 pt-3 pb-1 font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground"
                    >
                      <span>9:41</span>
                      <span>DailyFlow</span>
                    </div>
                    <Image
                      alt={imageAlt}
                      w={400}
                      h={800}
                      className="w-full object-cover"
                    />
                  </div>
                </div>
                {/* Rotated hard-shadow stat stickers overlapping the frame. */}
                <HeroStatBadge className="absolute -bottom-6 -right-6 flex rotate-2 items-center gap-3 rounded-none border border-foreground bg-background shadow-[5px_5px_0_0] shadow-foreground">
                  <HeroStatBadgeIcon className="size-10 rounded-none bg-primary/10">
                    <CheckIcon className="size-5 text-primary" />
                  </HeroStatBadgeIcon>
                  <HeroStatBadgeContent>
                    <HeroStatBadgeTitle className="text-sm font-bold tracking-tight">
                      {chipTitle}
                    </HeroStatBadgeTitle>
                    <HeroStatBadgeSubtitle className="font-mono text-[10px] uppercase tracking-[0.12em]">
                      {chipSubtitle}
                    </HeroStatBadgeSubtitle>
                  </HeroStatBadgeContent>
                </HeroStatBadge>
                <HeroStatBadge className="absolute -left-6 -top-4 -rotate-2 rounded-none border border-foreground bg-background p-3 text-center shadow-[5px_5px_0_0] shadow-foreground">
                  <HeroStatBadgeTitle className="text-2xl font-extrabold tracking-tight tabular-nums">
                    {streakValue}
                  </HeroStatBadgeTitle>
                  <HeroStatBadgeSubtitle className="font-mono text-[10px] uppercase tracking-[0.12em]">
                    {streakLabel}
                  </HeroStatBadgeSubtitle>
                </HeroStatBadge>
              </div>
            </div>
          </div>
        </Container>
      </HeroSection>
    )
  },
})
