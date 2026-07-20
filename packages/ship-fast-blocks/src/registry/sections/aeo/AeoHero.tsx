import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import {
  HeroSection,
  HeroContent,
  HeroSubheading,
} from '#/section-kit/HeroSection.tsx'
import { Card } from '#/section-kit/Card.tsx'
import { Container } from '#/section-kit/Container.tsx'
import {
  SaasMutationSpinner,
  SaasPlanActionButton,
} from '../saas/saas-interactions.tsx'
import { saasLakebed } from '../saas/saas-lakebed.ts'

/**
 * AeoHero — "Answer Terminal" landing hero for an Answer-Engine-Optimization
 * (AEO) SaaS. An offset split composition: the left column opens with a mono
 * prompt line ("> how do i get cited by chatgpt?") and a bracketed mono eyebrow,
 * then a giant fluid display headline whose accent phrase is a highlight-marker
 * span, a supporting paragraph, dual Lakebed-backed CTAs (hard-offset-shadow
 * primary "Start Free" + bracketed mono ghost "Book demo"); the right column
 * re-frames the dashboard screenshot as a terminal window (three window dots,
 * mono title bar, hairline border, hard offset shadow). A hairline ticker strip
 * of supported engines separated by slashes runs beneath, over a dot-grid
 * background with a giant ghost "[1]" citation watermark. Use as the opening
 * section for AEO platforms, generative-search visibility tools, or
 * brand-citation analytics products.
 */
export const AeoHero = defineCapsule({
  name: 'AeoHero',
  description:
    "Terminal-styled split landing hero for an Answer-Engine-Optimization (AEO) product: a mono prompt line and bracketed eyebrow above a giant fluid display headline with a highlight-marker accent phrase, a supporting paragraph, Lakebed-backed dual CTAs (hard-offset-shadow 'Start Free' block + bracketed mono ghost 'Book demo'), the dashboard screenshot re-framed as a terminal window with window dots and a mono title bar, and a hairline slash-separated engine ticker strip — all over a dot-grid background with a ghost '[1]' citation watermark. CTA intent is shared across sections and the screenshot uses the alt-driven Image component. Use as the opening section for AEO platforms, generative-search visibility tools, or brand-citation analytics products.",
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
        className={cn(
          'relative overflow-hidden bg-background',
          props.className,
        )}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 text-border"
        >
          <div className="absolute inset-0 bg-[radial-gradient(currentColor_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
        </div>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-4 top-6 select-none font-mono text-[9rem] font-bold leading-none text-foreground/[0.03] sm:-right-10 sm:top-4 sm:text-[16rem]"
        >
          [1]
        </span>
        <Container className="relative pb-10 pt-16 sm:pt-24">
          <HeroContent className="grid items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                <span aria-hidden="true" className="text-primary">
                  [{' '}
                </span>
                {eyebrow}
                <span aria-hidden="true" className="text-primary">
                  {' '}
                  ]
                </span>
              </p>
              <p
                aria-hidden="true"
                className="mt-6 font-mono text-sm text-muted-foreground"
              >
                <span className="text-primary">&gt;_</span> how do i get cited
                by chatgpt?
              </p>
              <h1 className="mt-4 text-[clamp(2.75rem,7vw,6rem)] font-semibold leading-[0.92] tracking-tighter text-foreground">
                {headingLead}{' '}
                <span className="-mx-1 box-decoration-clone bg-primary/15 px-2 text-foreground">
                  {headingAccent}
                </span>
              </h1>
              <HeroSubheading className="max-w-xl text-base sm:text-lg">
                {subheading}
              </HeroSubheading>
              <div className="mt-8 grid grid-cols-2 gap-3 sm:flex sm:flex-row sm:items-center sm:gap-4">
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
                  className="inline-flex items-center justify-center gap-2 rounded-none bg-primary px-3 py-4 font-mono text-sm font-semibold uppercase tracking-[0.12em] text-primary-foreground shadow-[6px_6px_0_0] shadow-primary/25 transition-[background-color,box-shadow,transform] duration-150 hover:bg-primary/90 active:translate-y-px active:shadow-none disabled:pointer-events-none disabled:opacity-70 sm:px-8"
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
                  className="inline-flex items-center justify-center gap-2 rounded-none border border-border bg-background px-3 py-4 font-mono text-sm font-medium uppercase tracking-[0.12em] text-foreground transition-colors duration-150 hover:bg-foreground hover:text-background active:translate-y-px disabled:pointer-events-none disabled:opacity-70 sm:px-8"
                >
                  <span aria-hidden="true">[</span>
                  {secondaryCta}
                  <span aria-hidden="true">]</span>
                </SaasPlanActionButton>
              </div>
            </div>
            <div className="lg:col-span-5">
              <Card
                variant="default"
                className="-mx-2 overflow-hidden rounded-none border-border p-0 shadow-[8px_8px_0_0] shadow-foreground/10 sm:mx-0"
              >
                <div className="flex items-center gap-2 border-b border-border bg-muted px-4 py-2.5">
                  <span
                    aria-hidden="true"
                    className="size-2.5 rounded-full bg-muted-foreground/40"
                  />
                  <span
                    aria-hidden="true"
                    className="size-2.5 rounded-full bg-muted-foreground/25"
                  />
                  <span
                    aria-hidden="true"
                    className="size-2.5 rounded-full bg-primary/60"
                  />
                  <span className="ml-2 truncate font-mono text-[11px] text-muted-foreground">
                    citeable — answers.watch
                  </span>
                </div>
                <Image
                  alt={imageAlt}
                  w={1600}
                  h={900}
                  className="h-auto w-full object-cover"
                />
              </Card>
            </div>
          </HeroContent>
        </Container>
        <div className="relative border-y border-border">
          <Container className="flex flex-nowrap items-center gap-x-4 overflow-x-auto whitespace-nowrap py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap sm:gap-y-2 sm:overflow-x-visible sm:whitespace-normal">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-foreground">
              Tracks:
            </span>
            {engines.map((engine, i) => (
              <span
                key={`${engine}-${i}`}
                className="flex items-center gap-x-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
              >
                {i > 0 ? (
                  <span aria-hidden="true" className="text-border">
                    /
                  </span>
                ) : null}
                {engine}
              </span>
            ))}
          </Container>
        </div>
      </HeroSection>
    )
  },
})
