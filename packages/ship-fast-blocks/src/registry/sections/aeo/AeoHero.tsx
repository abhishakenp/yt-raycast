import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import {
  HeroSection,
  HeroContent,
  HeroBadge,
  HeroSubheading,
} from '#/section-kit/HeroSection.tsx'
import {
  SaasMutationSpinner,
  SaasPlanActionButton,
} from '../saas/saas-interactions.tsx'
import { saasLakebed } from '../saas/saas-lakebed.ts'

/**
 * AeoHero — centered, data-forward landing hero for an Answer-Engine-Optimization
 * (AEO) SaaS. An eyebrow pill ("Answer Engine Optimization"), an oversized
 * headline about getting cited in AI answers, a supporting paragraph, dual pill
 * CTAs (filled "Start Free" + outlined "Book demo"), a trust-row of supported
 * engines, and a large rounded dashboard screenshot below. CTAs route through
 * useNavigate; the screenshot uses the alt-driven Image component. Use as the
 * opening section for AEO platforms, generative-search visibility tools, or
 * brand-citation analytics products.
 */
export const AeoHero = defineCapsule({
  name: 'AeoHero',
  description:
    "Centered, modern-SaaS landing hero for an Answer-Engine-Optimization (AEO) product: an eyebrow pill, a large multi-line headline about winning the AI answer and getting cited across ChatGPT, Perplexity and Google AI Overviews, a supporting paragraph, Lakebed-backed dual pill CTAs (filled 'Start Free' + outlined 'Book demo'), a row of supported answer engines, and a large rounded dashboard screenshot below the copy. CTA intent is shared across sections and the screenshot uses the alt-driven Image component. Use as the opening section for AEO platforms, generative-search visibility tools, or brand-citation analytics products.",
  props: z.object({
    /** Eyebrow pill label above the headline. */
    eyebrow: z.string().optional(),
    /** First line of the headline. */
    headingLead: z.string().optional(),
    /** Phrase rendered with an accent gradient as a continuation of the headline. */
    headingAccent: z.string().optional(),
    /** Supporting paragraph under the headline. */
    subheading: z.string().optional(),
    /** Primary CTA label (filled). */
    primaryCta: z.string().optional(),
    /** Secondary CTA label (outlined). */
    secondaryCta: z.string().optional(),
    /** Supported answer engines listed beneath the CTAs. */
    engines: z.array(z.string()).optional(),
    /** Alt text driving the dashboard screenshot. */
    imageAlt: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: saasLakebed,
  component: ({ props, lakebed }) => {
    const eyebrow = props.eyebrow ?? 'Answer Engine Optimization'
    const headingLead = props.headingLead ?? 'Get cited by AI answers,'
    const headingAccent = props.headingAccent ?? 'win the AI answer'
    const subheading =
      props.subheading ??
      'Citeable tracks how AI engines describe your brand, finds the prompts you should own, and optimizes your content so ChatGPT, Perplexity, and Google AI Overviews cite you — not your competitors.'
    const primaryCta = props.primaryCta ?? 'Start Free'
    const secondaryCta = props.secondaryCta ?? 'Book demo'
    const engines = props.engines?.length
      ? props.engines
      : ['ChatGPT', 'Perplexity', 'Google AI Overviews', 'Gemini', 'Claude']
    const imageAlt =
      props.imageAlt ??
      'Analytics dashboard showing AI answer citations, share-of-voice charts, and tracked prompts'

    return (
      <HeroSection
        variant="default"
        className={cn('bg-background', props.className)}
      >
        <HeroContent className="mx-auto max-w-4xl px-4 pb-16 pt-20 text-center sm:px-6 sm:pb-20 sm:pt-28 lg:px-8">
          <HeroBadge className="bg-muted text-xs shadow-none">
            {eyebrow}
          </HeroBadge>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {headingLead}{' '}
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              {headingAccent}
            </span>
          </h1>
          <HeroSubheading className="mx-auto max-w-2xl">
            {subheading}
          </HeroSubheading>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <SaasPlanActionButton
              lakebed={lakebed}
              intentLabel={primaryCta}
              plan={primaryCta}
              source="hero"
              pendingChildren={
                <>
                  <SaasMutationSpinner className="size-4" />
                  Starting
                </>
              }
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-70"
            >
              {primaryCta}
            </SaasPlanActionButton>
            <SaasPlanActionButton
              lakebed={lakebed}
              intentLabel={secondaryCta}
              plan={secondaryCta}
              source="hero"
              pendingChildren={
                <>
                  <SaasMutationSpinner className="size-4" />
                  Sending
                </>
              }
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-8 py-4 text-base font-medium text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-70"
            >
              {secondaryCta}
            </SaasPlanActionButton>
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Tracks:</span>
            {engines.map((engine) => (
              <span key={engine}>{engine}</span>
            ))}
          </div>
        </HeroContent>
        <div className="mx-auto max-w-5xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
            <Image
              alt={imageAlt}
              w={1600}
              h={900}
              className="h-auto w-full object-cover"
            />
          </div>
        </div>
      </HeroSection>
    )
  },
})
