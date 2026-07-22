import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { GridField } from '#/section-kit/motion.tsx'
import { HeroSection } from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * CoworkingHero — flat editorial opening scene for a coworking / workspace
 * landing page. The backdrop is a restrained architectural hairline field
 * (no glow wash, no watermark) with hairline rails at the content edges. The
 * stage splits asymmetrically 7:5 — left: a mono micro-label eyebrow with a
 * square accent marker, a solid two-tone display headline, supporting
 * paragraph, sharp square primary + outline CTAs with press feedback, and a
 * hairline mono trust-check row. Right: an offset hairline frame behind a
 * bordered hero photo, and one flat hairline proof card with an avatar stack
 * and a tabular member metric. CTAs route through section-kit route links;
 * photos use the alt-driven Image component. Use as the opening section for
 * coworking spaces, shared offices, flex-office providers, or business
 * centers.
 */
export const CoworkingHero = defineCapsule({
  name: 'CoworkingHero',
  description:
    'Luminous editorial hero for a coworking / workspace landing page over a blueprint light-field backdrop (architectural hairline grid with crosshair accents, hairline content rails, giant ghost watermark of the opening headline word), split asymmetrically 7:5: mono-label eyebrow chip with pulsing dot, display headline with gradient-ink closing phrase, supporting paragraph, shimmer primary CTA + glass secondary CTA with press feedback, and a trust-chip row — beside an offset outline frame behind a hero photo with specular ring, and a glass social-proof card with an avatar stack and member metric. CTAs route through section-kit route links; images use the alt-driven Image component. Use as the opening section for coworking spaces, shared offices, flex-office providers, or workspace membership sites.',
  props: z.object({
    /** Availability / status eyebrow text above the headline. */
    eyebrow: z.string().optional(),
    /** First line of the headline. */
    headingLead: z.string().optional(),
    /** Phrase rendered in muted color as a continuation of the headline. */
    headingMuted: z.string().optional(),
    /** Supporting paragraph under the headline. */
    subheading: z.string().optional(),
    /** Primary CTA label (filled). */
    primaryCta: z.string().optional(),
    /** Secondary CTA label (outlined). */
    secondaryCta: z.string().optional(),
    /** Trust checks listed beneath CTAs. */
    checks: z.array(z.string()).optional(),
    /** Alt text driving the main hero photo. */
    imageAlt: z.string().optional(),
    /** Social-proof metric value (e.g. '400+ members'). */
    proofValue: z.string().optional(),
    /** Social-proof sublabel (e.g. 'Active this week'). */
    proofLabel: z.string().optional(),
    /** Alt text list for the avatar stack on the proof card. */
    proofAvatars: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow =
      typeof props.eyebrow === 'string' && props.eyebrow
        ? props.eyebrow
        : "Portland's premier coworking space"
    const headingLead =
      typeof props.headingLead === 'string' && props.headingLead
        ? props.headingLead
        : 'Workspace that works'
    const headingMuted =
      typeof props.headingMuted === 'string' && props.headingMuted
        ? props.headingMuted
        : 'as hard as you do'
    const subheading =
      typeof props.subheading === 'string' && props.subheading
        ? props.subheading
        : 'Private offices, dedicated desks, and meeting rooms in the heart of the Pearl District — with the coffee, light, and quiet your best work deserves.'
    const primaryCta =
      typeof props.primaryCta === 'string' && props.primaryCta
        ? props.primaryCta
        : 'Schedule a Tour'
    const secondaryCta =
      typeof props.secondaryCta === 'string' && props.secondaryCta
        ? props.secondaryCta
        : 'View Memberships'
    const checks = props.checks?.length
      ? props.checks.filter((check) => typeof check === 'string' && check)
      : ['No setup fees', 'Month-to-month', '24/7 access']
    const imageAlt =
      typeof props.imageAlt === 'string' && props.imageAlt
        ? props.imageAlt
        : 'Bright modern coworking space with floor-to-ceiling windows, wooden desks, and green plants'
    const proofValue =
      typeof props.proofValue === 'string' && props.proofValue
        ? props.proofValue
        : '400+ members'
    const proofLabel =
      typeof props.proofLabel === 'string' && props.proofLabel
        ? props.proofLabel
        : 'Active this week'
    const proofAvatars = props.proofAvatars?.length
      ? props.proofAvatars.filter((alt) => typeof alt === 'string' && alt)
      : [
          'Professional headshot of a smiling woman with brown hair',
          'Professional headshot of a man with glasses and short hair',
          'Professional headshot of a woman with blonde hair smiling',
          'Professional headshot of a man with beard in casual attire',
        ]

    const ArrowRight = ({ className }: { className?: string }) => (
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
        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    )

    const Check = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M5 13l4 4L19 7" />
      </svg>
    )

    return (
      <HeroSection
        variant="default"
        className={cn(
          'relative isolate overflow-hidden bg-background',
          props.className,
        )}
      >
        {/* Restrained architectural hairline field — flat, no glow wash. */}
        <GridField
          className="-z-10 text-foreground/[0.035]"
          size={72}
          mask="radial-gradient(ellipse 90% 80% at 50% 0%, black 45%, transparent 82%)"
        />

        <Container
          size="xl"
          className="relative pb-20 pt-32 sm:pb-24 sm:pt-36 lg:pb-28 lg:pt-40"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 hidden w-px bg-border/70 lg:block"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 hidden w-px bg-border/70 lg:block"
          />

          <div className="grid items-center gap-14 lg:grid-cols-[7fr_5fr] lg:gap-16">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2.5">
                <span aria-hidden="true" className="size-2 bg-primary" />
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  {eyebrow}
                </span>
              </span>

              <h1 className="mt-6 text-balance text-5xl font-semibold leading-[1.02] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
                {headingLead}{' '}
                <span className="text-muted-foreground">{headingMuted}</span>
              </h1>

              <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
                {subheading}
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                <NavbarRouteLink
                  className="group inline-flex items-center justify-center gap-2 rounded-none bg-primary px-7 py-3.5 text-base font-semibold text-primary-foreground transition-colors duration-200 hover:bg-primary/90 active:translate-y-px"
                  href={primaryCta}
                >
                  <span>{primaryCta}</span>
                  <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </NavbarRouteLink>
                <NavbarRouteLink
                  className="inline-flex items-center justify-center rounded-none border border-border bg-background px-7 py-3.5 text-base font-medium text-foreground transition-colors duration-200 hover:bg-muted active:translate-y-px"
                  href={secondaryCta}
                >
                  {secondaryCta}
                </NavbarRouteLink>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2">
                {checks.map((check) => (
                  <span
                    key={check}
                    className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground"
                  >
                    <Check className="size-3.5 text-primary" />
                    {check}
                  </span>
                ))}
              </div>
            </div>

            {/* Scene: offset hairline back frame, bordered photo, flat proof card. */}
            <div className="relative">
              <div className="relative">
                <div
                  aria-hidden="true"
                  className="absolute -right-4 -top-4 hidden h-full w-full border border-border sm:block"
                />

                <div className="relative border border-border bg-muted/30">
                  <Image
                    alt={imageAlt}
                    w={1200}
                    h={800}
                    className="h-[360px] w-full object-cover sm:h-[460px] lg:h-[520px]"
                  />
                </div>

                <div className="absolute -bottom-6 -left-4 hidden border border-border bg-background px-4 py-3 shadow-sm sm:block lg:-left-8">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {proofAvatars.map((alt) => (
                        <Image
                          key={alt}
                          alt={alt}
                          w={100}
                          h={100}
                          className="size-9 rounded-full border-2 border-background object-cover"
                        />
                      ))}
                    </div>
                    <div>
                      <p className="font-mono text-sm font-semibold tabular-nums leading-tight text-foreground">
                        {proofValue}
                      </p>
                      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        {proofLabel}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </HeroSection>
    )
  },
})
