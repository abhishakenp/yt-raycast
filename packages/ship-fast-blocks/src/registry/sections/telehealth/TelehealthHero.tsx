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

export const TelehealthHero = defineCapsule({
  name: 'TelehealthHero',
  description:
    "Bespoke, token-styled hero band for a telehealth / virtual care homepage. Lays out a calm availability badge pill, a large reassuring headline ('See a doctor in minutes'), a supporting lede about on-demand virtual care, a dual call-to-action row (a primary 'Get Started' pill that routes to booking plus an outlined 'How it works' button), and a divider-separated trust strip beneath the CTAs (24/7 availability, insurance, board-certified doctors). A soft image panel sits alongside on large screens. Use as the opening viewport of a telehealth landing page to establish trust and drive booking.",
  props: z.object({
    badge: z.string().optional(),
    heading: z.string().optional(),
    subheading: z.string().optional(),
    primaryCta: z.string().optional(),
    primaryTarget: z.string().optional(),
    secondaryCta: z.string().optional(),
    secondaryTarget: z.string().optional(),
    imageAlt: z.string().optional(),
    trustItems: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const badge = props.badge ?? 'Virtual care, on your schedule'
    const heading = props.heading ?? 'See a doctor in minutes'
    const subheading =
      props.subheading ??
      'Connect with board-certified doctors over secure video for everyday care, prescriptions, and peace of mind — no waiting rooms, no commute.'
    const primaryCta = props.primaryCta ?? 'Get Started'
    const primaryTarget = props.primaryTarget ?? 'Contact'
    const secondaryCta = props.secondaryCta ?? 'How it works'
    const secondaryTarget = props.secondaryTarget ?? 'How it works'
    const imageAlt =
      props.imageAlt ?? 'Patient on a calm video call with a doctor'
    const trustItems = props.trustItems?.length
      ? props.trustItems
      : ['Available 24/7', 'Most insurance accepted', 'Board-certified doctors']

    return (
      <HeroSection
        variant="default"
        className={cn(
          'overflow-hidden bg-background py-20 text-foreground sm:py-28',
          props.className,
        )}
      >
        <HeroContent className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8">
          <div>
            <HeroBadge
              variant="pulsing-dot"
              className="mb-6 bg-muted font-medium"
            >
              <span
                className="size-2 rounded-full bg-primary"
                aria-hidden="true"
              />
              {badge}
            </HeroBadge>
            <HeroHeading className="max-w-3xl">{heading}</HeroHeading>
            <HeroSubheading className="max-w-2xl leading-8">
              {subheading}
            </HeroSubheading>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => go(primaryTarget)}
                className="inline-flex items-center justify-center rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
              >
                {primaryCta}
              </button>
              <button
                type="button"
                onClick={() => go(secondaryTarget)}
                className="inline-flex items-center justify-center rounded-full border border-border bg-background px-7 py-3.5 text-sm font-semibold text-foreground transition hover:bg-muted"
              >
                {secondaryCta}
              </button>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
              {trustItems.map((item, i) => (
                <span
                  key={`${item}-${i}`}
                  className="inline-flex items-center gap-3"
                >
                  {i > 0 ? (
                    <span className="text-border" aria-hidden="true">
                      ·
                    </span>
                  ) : null}
                  <span className="inline-flex items-center gap-1.5">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-primary"
                      aria-hidden="true"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    {item}
                  </span>
                </span>
              ))}
            </div>
          </div>
          <div className="relative">
            <div
              className="absolute inset-6 rounded-3xl bg-primary/10 blur-3xl"
              aria-hidden="true"
            />
            <Card
              variant="default"
              rounded="3xl"
              padding="none"
              className="relative overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.12)]"
            >
              <Image
                alt={imageAlt}
                w={900}
                h={760}
                className="aspect-[4/3] w-full object-cover"
              />
            </Card>
          </div>
        </HeroContent>
      </HeroSection>
    )
  },
})
