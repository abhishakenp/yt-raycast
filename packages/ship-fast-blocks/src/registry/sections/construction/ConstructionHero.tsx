import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'
import {
  HeroSection,
  HeroContent,
  HeroHeading,
} from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'

/**
 * ConstructionHero — full-bleed dark hero section for a construction / general
 * contractor landing page. A large left-aligned headline over a faded jobsite
 * photo with a left-to-right scrim, a pulsing "now booking" status pill, dual
 * CTAs (primary filled + secondary outlined), and a trust strip with check
 * badges beneath. Every CTA routes through useNavigate. Use as the opening
 * hero for construction companies, contractors, builders, or design-build
 * firms. Renders fully with no props via baked-in defaults.
 */
export const ConstructionHero = defineCapsule({
  name: 'ConstructionHero',
  description:
    "Full-bleed dark hero section for a construction / general contractor landing page: a large left-aligned headline over a faded jobsite photo with a left-to-right scrim, a pulsing 'now booking' status pill, dual CTAs (primary filled + secondary outlined), and a trust strip with check badges beneath. CTAs route through useNavigate. Use as the opening hero for construction firms, contractors, builders, or design-build firms.",
  props: z.object({
    /** Status pill text. */
    badge: z.string().optional(),
    /** Heading top line. */
    headingTop: z.string().optional(),
    /** Heading bottom line (rendered stacked below top line). */
    headingBottom: z.string().optional(),
    /** Supporting paragraph under the headline. */
    subheading: z.string().optional(),
    /** Primary CTA label. */
    primaryCta: z.string().optional(),
    /** Secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Alt text driving the hero background photo. */
    imageAlt: z.string().optional(),
    /** Trust badges beneath the hero copy. */
    trust: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const badge = props.badge ?? 'Now booking projects for Q3 2026'
    const headingTop = props.headingTop ?? 'Building excellence'
    const headingBottom = props.headingBottom ?? 'since 1987'
    const subheading =
      props.subheading ??
      'Commercial and residential construction across the Pacific Northwest. Licensed, bonded, and trusted by 500+ clients for projects from $50K to $50M.'
    const primaryCta = props.primaryCta ?? 'Request Free Estimate'
    const secondaryCta = props.secondaryCta ?? 'View Our Projects'
    const imageAlt =
      props.imageAlt ??
      'Construction crane and steel framework at a commercial building site during golden hour'
    const trust = props.trust?.length
      ? props.trust
      : ['Licensed & Insured', '38 Years Experience', 'A+ BBB Rating']

    const CheckCircle = ({ className }: { className?: string }) => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
    )

    const ArrowRight = () => (
      <svg
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
        <line x1="3" y1="12" x2="21" y2="12" />
        <polyline points="14 5 21 12 14 19" />
      </svg>
    )

    return (
      <HeroSection
        variant="default"
        className={cn(
          'relative overflow-hidden bg-foreground',
          props.className,
        )}
      >
        <div aria-hidden="true" className="absolute inset-0">
          <Image
            alt={imageAlt}
            w={1920}
            h={1080}
            className="size-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/70 to-transparent" />
        </div>
        <Container asChild size="xl" className="py-24 lg:py-32">
          <HeroContent>
            <div className="max-w-2xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-background/10 px-4 py-2 backdrop-blur-sm">
                <span className="size-2 animate-pulse rounded-full bg-primary" />
                <span className="text-sm font-medium text-background/80">
                  {badge}
                </span>
              </div>
              <HeroHeading className="mb-6 text-background">
                {headingTop}
                <br />
                {headingBottom}
              </HeroHeading>
              <p className="mb-8 max-w-xl text-lg leading-relaxed text-background/70 sm:text-xl">
                {subheading}
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(primaryCta)}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-background px-6 py-3.5 font-semibold text-foreground transition-colors hover:bg-background/90"
                >
                  {primaryCta}
                  <ArrowRight />
                </button>
                <button
                  type="button"
                  onClick={() => go(secondaryCta)}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background/10 px-6 py-3.5 font-semibold text-background backdrop-blur-sm transition-colors hover:bg-background/20"
                >
                  {secondaryCta}
                </button>
              </div>
              <div className="mt-12 flex flex-wrap items-center gap-6 text-sm text-background/60">
                {trust.map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle className="text-primary" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </HeroContent>
        </Container>
      </HeroSection>
    )
  },
})
