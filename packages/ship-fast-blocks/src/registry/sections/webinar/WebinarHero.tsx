import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'
import {
  HeroSection,
  HeroContent,
  HeroBadge,
  HeroHeading,
  HeroSubheading,
} from '#/section-kit/HeroSection.tsx'
import { Card } from '#/section-kit/Card.tsx'

export const WebinarHero = defineCapsule({
  name: 'WebinarHero',
  description:
    "Conversion-focused webinar hero: an uppercase live-event eyebrow pill, a large headline naming the webinar topic, a prominent date/time badge, a value-proposition subheading, a primary 'Save my seat' CTA with a 'Free · Live + Recording' note, a presenter preview (avatar + name + role), and a static countdown row of token cards (Days/Hours/Mins/Secs). Use as the opening viewport of a webinar, summit, or virtual-event registration page.",
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
    const go = useNavigate()
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
          'bg-background py-20 text-foreground lg:py-28',
          props.className,
        )}
      >
        <HeroContent className="mx-auto max-w-3xl px-6 text-center lg:px-8">
          <HeroBadge className="bg-muted text-xs uppercase tracking-[0.2em] shadow-none">
            <span
              className="size-2 rounded-full bg-primary"
              aria-hidden="true"
            />
            {eyebrow}
          </HeroBadge>

          <HeroHeading className="mt-6 font-semibold">{title}</HeroHeading>

          <div className="mt-6 inline-flex items-center justify-center rounded-full border border-primary/30 bg-primary/10 px-5 py-2 text-sm font-semibold text-primary">
            {dateTime}
          </div>

          <HeroSubheading className="mx-auto max-w-2xl leading-8">
            {subheading}
          </HeroSubheading>

          <div className="mt-8 flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => go(primaryTarget)}
              className="rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              {primaryCta}
            </button>
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
              {note}
            </p>
          </div>

          <Card
            variant="default"
            rounded="none"
            padding="none"
            className="mt-10 inline-flex items-center gap-3 rounded-full px-4 py-2 text-left"
          >
            <Image
              alt={presenterAvatarAlt}
              w={96}
              h={96}
              loading="lazy"
              className="size-10 rounded-full object-cover"
            />
            <div>
              <p className="text-sm font-semibold text-foreground">
                {presenterName}
              </p>
              <p className="text-xs text-muted-foreground">{presenterRole}</p>
            </div>
          </Card>

          <div className="mx-auto mt-12 grid max-w-md grid-cols-4 gap-3">
            {countdown.map((unit, i) => (
              <Card
                key={`${unit.label}-${i}`}
                variant="default"
                rounded="xl"
                padding="none"
                className="px-2 py-4"
              >
                <p className="text-2xl font-semibold tabular-nums text-foreground sm:text-3xl">
                  {unit.value}
                </p>
                <p className="mt-1 text-[0.65rem] font-medium uppercase tracking-[0.15em] text-muted-foreground">
                  {unit.label}
                </p>
              </Card>
            ))}
          </div>
        </HeroContent>
      </HeroSection>
    )
  },
})
