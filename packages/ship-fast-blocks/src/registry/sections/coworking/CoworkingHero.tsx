import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'
import { GridField } from '#/section-kit/motion.tsx'

/**
 * CoworkingHero — luminous opening scene for a coworking / workspace landing
 * page. The backdrop is a blueprint light-field: an architectural hairline
 * grid with crosshair accents and vertical rails at the content edges. Left:
 * an eyebrow chip with a soft pulsing dot, a display headline with a
 * gradient-ink closing phrase, supporting paragraph, a shimmer primary CTA
 * beside a glass secondary CTA, and a quiet trust-chip row. Right: an offset
 * outline frame behind a hero photo with specular ring, and one glass proof
 * card with an avatar stack. CTAs route through useNavigate; photos use the
 * alt-driven Image component. Use as the opening section for coworking
 * spaces, shared offices, flex-office providers, or business centers.
 */
export const CoworkingHero = defineCapsule({
  name: 'CoworkingHero',
  description:
    'Luminous hero scene for a coworking / workspace landing page over a blueprint light-field backdrop (architectural hairline grid with crosshair accents, hairline content rails): eyebrow chip with pulsing dot, display headline with gradient-ink closing phrase, supporting paragraph, shimmer primary CTA + glass secondary CTA, and a trust-chip row — beside an offset outline frame behind a hero photo with specular ring, and a glass social-proof card with an avatar stack and member metric. CTAs route through useNavigate; images use the alt-driven Image component. Use as the opening section for coworking spaces, shared offices, flex-office providers, or workspace membership sites.',
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
    const go = useNavigate()
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
      <section
        className={cn(
          'relative isolate overflow-hidden bg-background',
          props.className,
        )}
      >
        {/* Blueprint light-field: hairline grid, crosshair accents. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-b from-muted/50 via-background to-background"
        />
        <GridField
          className="-z-10 text-foreground/[0.06]"
          size={64}
          mask="radial-gradient(ellipse 95% 85% at 50% 10%, black 30%, transparent 78%)"
        />
        <div aria-hidden="true" className="absolute inset-0 -z-10">
          {[
            'left-[16%] top-[22%]',
            'left-[42%] top-[64%]',
            'right-[12%] top-[18%]',
            'right-[34%] bottom-[16%]',
          ].map((position) => (
            <span
              key={position}
              className={cn(
                'absolute text-lg font-light leading-none text-foreground/15',
                position,
              )}
            >
              +
            </span>
          ))}
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-32 sm:px-6 sm:pb-28 sm:pt-36 lg:px-8 lg:pb-32 lg:pt-44">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 hidden w-px bg-gradient-to-b from-transparent via-border/70 to-transparent lg:block"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 hidden w-px bg-gradient-to-b from-transparent via-border/70 to-transparent lg:block"
          />

          <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2.5 rounded-full border border-border/60 bg-card/70 px-4 py-1.5 shadow-sm backdrop-blur">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-50" />
                  <span className="relative inline-flex size-2 rounded-full bg-primary" />
                </span>
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {eyebrow}
                </span>
              </span>

              <h1 className="mt-8 text-5xl font-semibold leading-[1.04] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
                {headingLead}{' '}
                <span className="bg-gradient-to-r from-primary via-primary/80 to-foreground/50 bg-clip-text text-transparent">
                  {headingMuted}
                </span>
              </h1>

              <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
                {subheading}
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={() => go(primaryCta)}
                  className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-xl hover:shadow-primary/35"
                >
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-primary-foreground/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
                  />
                  <span className="relative">{primaryCta}</span>
                  <ArrowRight className="relative size-5 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
                <button
                  type="button"
                  onClick={() => go(secondaryCta)}
                  className="inline-flex items-center justify-center rounded-2xl border border-border/70 bg-card/60 px-8 py-4 text-base font-medium text-foreground backdrop-blur transition-colors duration-300 hover:bg-card"
                >
                  {secondaryCta}
                </button>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-3">
                {checks.map((check) => (
                  <span
                    key={check}
                    className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 py-1.5 pl-2 pr-4 text-sm text-muted-foreground backdrop-blur"
                  >
                    <span className="grid size-5 place-items-center rounded-full bg-primary/15 text-primary">
                      <Check className="size-3" />
                    </span>
                    {check}
                  </span>
                ))}
              </div>
            </div>

            {/* Scene: back frame plane, photo, floating proof card. */}
            <div className="relative">
              <div className="relative [perspective:1200px]">
                <div className="pointer-events-none absolute -inset-6 -z-10">
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 translate-x-7 translate-y-7 rounded-[2rem] border border-border/50 bg-muted/30"
                  />
                </div>

                <div className="relative rounded-[1.75rem]">
                  <div className="relative overflow-hidden rounded-[1.75rem] shadow-[0_32px_80px_-20px] shadow-primary/20 ring-1 ring-border/60">
                    <Image
                      alt={imageAlt}
                      w={1200}
                      h={800}
                      className="h-[400px] w-full object-cover sm:h-[500px] lg:h-[600px]"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 rounded-[1.75rem] ring-1 ring-inset ring-foreground/10"
                    />
                  </div>
                </div>

                <div className="absolute -bottom-8 -left-4 hidden sm:block lg:-left-10">
                  <div className="rounded-2xl border border-border/60 bg-card/85 p-5 shadow-xl backdrop-blur-xl">
                    <div className="flex items-center gap-4">
                      <div className="flex -space-x-3">
                        {proofAvatars.map((alt) => (
                          <Image
                            key={alt}
                            alt={alt}
                            w={100}
                            h={100}
                            className="size-10 rounded-full border-2 border-card object-cover"
                          />
                        ))}
                      </div>
                      <div>
                        <p className="text-lg font-semibold leading-tight text-card-foreground">
                          {proofValue}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {proofLabel}
                        </p>
                      </div>
                    </div>
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
