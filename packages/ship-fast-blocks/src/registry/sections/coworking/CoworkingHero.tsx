import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'

/**
 * CoworkingHero — split coworking landing hero with eyebrow, oversized headline,
 * dual pill CTAs, trust-check row, and a floating "members active" proof card
 * with an avatar stack overlapping a large rounded hero image. Built for
 * workspace brands that need immediate credibility + conversion. CTAs route
 * through useNavigate; avatar photos use the alt-driven Image component.
 * Use as the opening section for coworking spaces, shared offices, flex-office
 * providers, or business centers.
 */
export const CoworkingHero = defineCapsule({
  name: 'CoworkingHero',
  description:
    "Split hero section for a coworking / workspace landing page: eyebrow label, large multi-line headline with one phrase muted, a supporting paragraph, dual pill CTAs (filled primary + outlined secondary), a trust-check row with icons, a large rounded hero image, and an absolute-positioned floating 'members active' social-proof card with an avatar stack. CTAs route through useNavigate; images use the alt-driven Image component. Use as the opening section for coworking spaces, shared offices, flex-office providers, or workspace membership sites.",
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
    const eyebrow = props.eyebrow ?? "Portland's Premier Coworking Space"
    const headingLead = props.headingLead ?? 'Workspace that works'
    const headingMuted = props.headingMuted ?? 'as hard as you do'
    const subheading =
      props.subheading ??
      "Private offices, dedicated desks, and meeting rooms in the heart of the Pearl District. Join 400+ professionals who've made Northside their base."
    const primaryCta = props.primaryCta ?? 'Schedule a Tour'
    const secondaryCta = props.secondaryCta ?? 'View Memberships'
    const checks = props.checks?.length
      ? props.checks
      : ['No setup fees', 'Month-to-month', '24/7 access']
    const imageAlt =
      props.imageAlt ??
      'Bright modern coworking space with floor-to-ceiling windows, wooden desks, and green plants'
    const proofValue = props.proofValue ?? '400+ members'
    const proofLabel = props.proofLabel ?? 'Active this week'
    const proofAvatars = props.proofAvatars?.length
      ? props.proofAvatars
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
      <section className={cn('relative bg-muted/50', props.className)}>
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="max-w-2xl">
              <p className="mb-4 text-sm font-medium uppercase tracking-wider text-muted-foreground">
                {eyebrow}
              </p>
              <h1 className="mb-6 text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                {headingLead}{' '}
                <span className="text-muted-foreground">{headingMuted}</span>
              </h1>
              <p className="mb-8 text-lg leading-relaxed text-muted-foreground sm:text-xl">
                {subheading}
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(primaryCta)}
                  className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3.5 text-base font-medium text-primary-foreground transition-all hover:bg-primary/90"
                >
                  {primaryCta}
                  <ArrowRight className="ml-2 size-5" />
                </button>
                <button
                  type="button"
                  onClick={() => go(secondaryCta)}
                  className="inline-flex items-center justify-center rounded-xl border border-border bg-card px-6 py-3.5 text-base font-medium text-foreground transition-all hover:bg-accent"
                >
                  {secondaryCta}
                </button>
              </div>
              <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                {checks.map((check) => (
                  <div key={check} className="flex items-center gap-2">
                    <Check className="size-5 text-primary" />
                    <span>{check}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <Image
                alt={imageAlt}
                w={1200}
                h={800}
                className="h-[400px] w-full rounded-2xl object-cover shadow-2xl sm:h-[500px] lg:h-[600px]"
              />
              <div className="absolute -bottom-6 -left-6 hidden rounded-xl bg-card p-6 shadow-xl sm:block">
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-2">
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
                    <p className="font-semibold text-card-foreground">
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
      </section>
    )
  },
})
