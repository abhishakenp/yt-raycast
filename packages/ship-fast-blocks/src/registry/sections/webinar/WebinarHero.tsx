import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { HeroSection, HeroContent } from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { Watermark, MonoTag } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
export const WebinarHero = defineCapsule({
  name: 'WebinarHero',
  description:
    "Kinetic-event webinar hero on an asymmetric 7/5 canvas: a mono live-event eyebrow with a pulse-free primary dot above a countdown-scale, fluid extrabold headline naming the topic; a slanted inverted date/time band as the signature element; a value-proposition subheading; a square-edged 'Save my seat' CTA with a hard offset token shadow, press feedback and a mono 'Free · Live + Recording' note; a hairline-framed presenter chip (square portrait + name + mono role); and a bordered countdown panel with a collapsed-border grid of giant tabular numerals (Days/Hours/Mins/Secs). A giant ghost watermark bleeds behind. Use as the opening viewport of a webinar, summit, or virtual-event registration page.",
  props: z.object({
    eyebrow: z.string().optional(),
    title: z.string().optional(),
    dateTime: z.string().optional(),
    subheading: z.string().optional(),
    primaryCta: z.string().optional(),
    primaryTarget: z.string().optional(),
    note: z.string().optional(),
    presenterName: z.string().optional(),
    presenterRole: z.string().optional(),
    presenterAvatarAlt: z.string().optional(),
    countdown: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Live online masterclass'
    const title = props.title ?? 'Scaling SaaS in 2026'
    const dateTime = props.dateTime ?? 'Thursday, July 17 · 11:00 AM PT'
    const subheading =
      props.subheading ??
      'Join our growth team for a 60-minute, no-fluff session on the playbooks that take a SaaS product from product-market fit to predictable, compounding revenue.'
    const primaryCta = props.primaryCta ?? 'Save my seat'
    const primaryTarget = props.primaryTarget ?? 'Register'
    const note = props.note ?? 'Free · Live + Recording'
    const presenterName = props.presenterName ?? 'Dana Whitfield'
    const presenterRole = props.presenterRole ?? 'VP of Growth, Catalyst Labs'
    const presenterAvatarAlt =
      props.presenterAvatarAlt ??
      'professional headshot of a confident woman in business attire smiling at camera'
    const countdown = props.countdown?.length
      ? props.countdown
      : [
          { value: '12', label: 'Days' },
          { value: '08', label: 'Hours' },
          { value: '45', label: 'Mins' },
          { value: '30', label: 'Secs' },
        ]

    return (
      <HeroSection
        variant="default"
        className={cn(
          'relative overflow-hidden bg-background py-20 text-foreground lg:py-28',
          props.className,
        )}
      >
        <Watermark className="-right-6 top-10 text-[7rem] leading-none sm:text-[11rem] lg:text-[14rem]">
          LIVE
        </Watermark>
        <HeroContent asChild>
          <Container size="xl">
            <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
              {/* Left: countdown-scale headline, slanted date band, CTA. */}
              <div className="lg:col-span-7">
                <p className="inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  <span
                    aria-hidden="true"
                    className="size-2 rounded-full bg-primary"
                  />
                  {eyebrow}
                </p>
                <h1 className="mt-5 text-[clamp(2.5rem,8vw,5.25rem)] font-extrabold leading-[0.9] tracking-tight text-balance">
                  {title}
                </h1>
                <p className="mt-6 inline-flex -rotate-1 items-center rounded-none border border-foreground bg-foreground px-4 py-2 font-mono text-xs font-bold uppercase tracking-[0.16em] text-background sm:text-sm">
                  {dateTime}
                </p>
                <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground text-pretty">
                  {subheading}
                </p>
                <div className="mt-8 flex flex-col items-start gap-3">
                  <NavbarRouteLink
                    className="inline-flex w-full items-center justify-center rounded-none border border-foreground bg-primary px-8 py-3.5 font-mono text-xs font-bold uppercase tracking-[0.14em] text-primary-foreground shadow-[5px_5px_0_0] shadow-foreground transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-[7px_7px_0_0] hover:shadow-foreground active:translate-x-[5px] active:translate-y-[5px] active:shadow-none sm:w-auto"
                    href={primaryTarget}
                  >
                    {primaryCta}
                  </NavbarRouteLink>
                  <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                    {note}
                  </p>
                </div>
                <div className="mt-8 inline-flex items-center gap-3 border border-border bg-card p-2 pr-5">
                  <Image
                    alt={presenterAvatarAlt}
                    w={96}
                    h={96}
                    loading="lazy"
                    className="size-11 rounded-none border border-border object-cover"
                  />
                  <div>
                    <p className="text-sm font-bold tracking-tight text-card-foreground">
                      {presenterName}
                    </p>
                    <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                      {presenterRole}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right: countdown timer panel (collapsed-border numerals). */}
              <div className="lg:col-span-5">
                <div className="relative border border-foreground bg-card shadow-[8px_8px_0_0] shadow-foreground/15">
                  <div className="flex items-center justify-between border-b border-border px-5 py-3">
                    <MonoTag>Starts in</MonoTag>
                    <span
                      aria-hidden="true"
                      className="size-2 rounded-full bg-primary"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-px bg-border">
                    {countdown.map((unit, i) => (
                      <div
                        key={`${unit.label}-${i}`}
                        className="bg-card px-2 py-7 text-center"
                      >
                        <div className="text-4xl font-extrabold tabular-nums tracking-tight text-card-foreground sm:text-5xl">
                          {unit.value}
                        </div>
                        <div className="mt-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                          {unit.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </HeroContent>
      </HeroSection>
    )
  },
})
