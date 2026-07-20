import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { HeroSection } from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * TelehealthHero — calm clinical + warmth asymmetric 7/5 hero for a telehealth /
 * virtual-care homepage. On an airy background carrying a giant ghost "+" cross
 * watermark: a left column with a square hairline availability chip (mono
 * micro-label + single pulsing primary dot), a giant fluid-clamp extrabold
 * headline, a reassuring lede, a dual square CTA row (a filled-primary "Get
 * Started" button routing to booking plus an outlined "How it works" button,
 * both with press feedback), and a hairline trust ledger row with primary tick
 * dashes; the right column shows a hairline double-framed video-visit photo with
 * a square overlapping "live secure video" device-chrome card. Precise yet warm,
 * telemedicine-flavored aesthetic. The photo is rendered through the alt-driven
 * Image component. Use as the opening viewport of a telehealth landing page to
 * establish trust and drive booking.
 */
export const TelehealthHero = defineCapsule({
  name: 'TelehealthHero',
  description:
    "Calm clinical + warmth asymmetric 7/5 hero for a telehealth / virtual care homepage: an airy band with a giant ghost '+' cross watermark, a left column with a square hairline availability chip (mono micro-label + pulsing primary dot), a giant fluid extrabold headline ('See a doctor in minutes'), a reassuring lede, a dual square CTA row (a filled-primary 'Get Started' button routing to booking plus an outlined 'How it works' button, both with press feedback), and a hairline trust ledger row with primary tick dashes, and a right column with a hairline double-framed video-visit photo and a square overlapping 'live secure video' device-chrome card. Precise yet warm, telemedicine-flavored aesthetic. Use as the opening viewport of a telehealth landing page to establish trust and drive booking.",
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
          'relative overflow-hidden border-b border-border bg-background text-foreground',
          props.className,
        )}
        aria-labelledby="telehealth-hero-heading"
      >
        <Watermark className="-top-16 right-[-4rem] text-[13rem] sm:right-[-6rem] sm:text-[18rem] lg:-top-24 lg:text-[24rem]">
          +
        </Watermark>
        <Container size="xl" className="relative py-16 sm:py-20 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="max-w-2xl lg:col-span-7">
              <div className="mb-7 inline-flex items-center gap-2.5 border border-border bg-muted/40 px-3.5 py-2">
                <span
                  className="size-1.5 animate-pulse rounded-full bg-primary"
                  aria-hidden="true"
                />
                <MonoTag>{badge}</MonoTag>
              </div>
              <h1
                id="telehealth-hero-heading"
                className="mb-6 max-w-2xl text-[clamp(2.5rem,6vw,4.75rem)] font-extrabold leading-[0.98] tracking-tight text-foreground text-balance"
              >
                {heading}
              </h1>
              <p className="mb-9 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                {subheading}
              </p>
              <div className="mb-12 flex flex-col gap-3 sm:flex-row sm:gap-4">
                <NavbarRouteLink
                  className="inline-flex items-center justify-center gap-2 rounded-none bg-primary px-7 py-3.5 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:translate-y-px"
                  href={primaryTarget}
                >
                  {primaryCta}
                  <ArrowRight />
                </NavbarRouteLink>
                <NavbarRouteLink
                  className="inline-flex items-center justify-center rounded-none border border-foreground/25 bg-background px-7 py-3.5 text-base font-semibold text-foreground transition-colors hover:bg-muted active:translate-y-px"
                  href={secondaryTarget}
                >
                  {secondaryCta}
                </NavbarRouteLink>
              </div>
              <div className="grid max-w-xl grid-cols-1 gap-0 border-t border-border sm:grid-cols-3">
                {trustItems.map((item, i) => (
                  <div
                    key={`${item}-${i}`}
                    className="flex items-center gap-3 border-b border-border py-3.5 text-sm text-muted-foreground sm:border-b-0 sm:pr-4"
                  >
                    <span
                      aria-hidden="true"
                      className="h-px w-4 shrink-0 bg-primary"
                    />
                    <span>{item}</span>
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
                  w={900}
                  h={760}
                  className="size-full object-cover"
                />
              </div>
              <div className="absolute -bottom-5 -left-3 flex items-center gap-3 rounded-none border border-border bg-background p-4 sm:-left-8">
                <span
                  aria-hidden="true"
                  className="grid size-11 place-items-center rounded-none bg-primary text-primary-foreground"
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M15 10l4.553-2.276A1 1 0 0 1 21 8.618v6.764a1 1 0 0 1-1.447.894L15 14M5 6h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" />
                  </svg>
                </span>
                <span className="flex flex-col">
                  <span className="flex items-center gap-1.5 text-sm font-bold tracking-tight text-foreground">
                    <span
                      aria-hidden="true"
                      className="size-1.5 animate-pulse rounded-full bg-primary"
                    />
                    Live now
                  </span>
                  <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                    Secure video visit
                  </span>
                </span>
              </div>
            </div>
          </div>
        </Container>
      </HeroSection>
    )
  },
})
