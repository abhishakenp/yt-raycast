import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  HeroSection,
  HeroSubheading,
  HeroActions,
  HeroSocialProof,
  HeroSocialProofItem,
} from '#/section-kit/HeroSection.tsx'
import { Card } from '#/section-kit/Card.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { DotGrid, MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import {
  SaasMutationSpinner,
  SaasPlanActionButton,
} from '../saas/saas-interactions.tsx'
import { saasLakebed } from '../saas/saas-lakebed.ts'

/**
 * AiProductHero — kinetic tech-editorial split hero for an AI SaaS / product
 * landing page. An asymmetric 7:5 grid over a fading dot-grid field with a
 * giant ghost "//AI" watermark: the left column opens with a mono live-status
 * line (pulsing primary square + tracked micro-label), then an oversized fluid
 * clamp display headline whose second line is a marker-highlight phrase, a
 * supporting paragraph, dual CTAs (a skewed near-black block that un-skews its
 * label + a bracketed mono ghost "watch demo"), and a mono trust microcopy row
 * with plus-glyph markers. The right column is a sharp-cornered editor pane
 * with a hairline title bar (square window dots, mono filename), skeleton
 * message rows, and a primary-edged AI-suggestion block with mono action
 * chips. CTAs and chips route through section-kit route links. Use as the
 * opening hero for AI writing assistants, AI copilots, or generative-AI
 * tools. Renders fully with no props.
 */
export const AiProductHero = defineCapsule({
  name: 'AiProductHero',
  description:
    'Kinetic tech-editorial split hero for an AI SaaS / product landing page: an asymmetric 7:5 grid over a fading dot-grid field with a giant ghost "//AI" watermark — a left column with a mono live-status line (pulsing primary square), an oversized fluid clamp display headline whose second line is a marker-highlight phrase, a supporting paragraph, dual fullstack CTAs (skewed near-black block whose label un-skews + bracketed mono ghost watch-demo), and a mono plus-glyph trust row; a right column with a sharp-cornered editor pane featuring a hairline title bar with square window dots and mono filename, skeleton message rows, and a primary-edged AI-suggestion block with scoped mutation mono action chips. CTAs and chips write to shared Lakebed conversion state. Use as the opening hero for AI writing assistants, AI copilots, generative-AI tools, developer-AI products, or modern SaaS launch pages.',
  props: z.object({
    /** Live-status pill text. */
    badge: z.string().optional(),
    /** First heading line. */
    headingTop: z.string().optional(),
    /** Second heading line, rendered muted under the first. */
    headingBottom: z.string().optional(),
    /** Supporting paragraph under the headline. */
    subheading: z.string().optional(),
    /** Filled primary CTA label. */
    primaryCta: z.string().optional(),
    /** Outlined secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Trust microcopy beneath the CTAs. */
    trust: z.array(z.string()).optional(),
    /** Filename shown in the preview card title bar. */
    previewFile: z.string().optional(),
    /** AI suggestion intro line in the preview card. */
    previewIntro: z.string().optional(),
    /** AI suggestion body (italic) in the preview card. */
    previewQuote: z.string().optional(),
    /** Action chips beneath the AI suggestion. */
    previewActions: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  lakebed: saasLakebed,
  component: ({ props, lakebed }) => {
    const badge = props.badge ?? 'Now with GPT-4 powered suggestions'
    const headingTop = props.headingTop ?? 'Write faster.'
    const headingBottom = props.headingBottom ?? 'Think clearer.'
    const subheading =
      props.subheading ??
      'WriteFlow AI understands your voice and helps you draft, edit, and polish content in minutes instead of hours. Trusted by 50,000+ writers at companies like Notion, Figma, and Stripe.'
    const primaryCta = props.primaryCta ?? 'Start writing free'
    const secondaryCta = props.secondaryCta ?? 'Watch demo (2:34)'
    const trust = props.trust?.length
      ? props.trust
      : ['No credit card required', '14-day free trial']
    const previewFile = props.previewFile ?? 'blog-post-draft.md'
    const previewIntro =
      props.previewIntro ??
      "Here's a refined opening that hooks readers immediately:"
    const previewQuote =
      props.previewQuote ??
      "The blank page stares back. You've been here before—the cursor blinking, the deadline looming, the perfect words hiding just out of reach. What if writing didn't have to be this hard?"
    const previewActions = props.previewActions?.length
      ? props.previewActions
      : ['Use this', 'Try again', 'Make shorter']

    return (
      <HeroSection
        className={cn(
          'relative overflow-hidden bg-background',
          props.className,
        )}
      >
        <DotGrid tone="faint" fade="bottom" className="inset-0" />
        <Watermark className="-right-8 top-2 font-mono text-[7rem] sm:-right-12 sm:top-0 sm:text-[15rem]">
          //AI
        </Watermark>
        <Container size="xl" className="relative pb-16 pt-14 lg:pb-24 lg:pt-20">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-14">
            <div className="max-w-2xl lg:col-span-7">
              <p className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="size-2 animate-pulse bg-primary"
                />
                <MonoTag>{badge}</MonoTag>
              </p>
              <h1 className="mt-6 text-[clamp(2.9rem,8vw,6.5rem)] font-semibold leading-[0.92] tracking-tighter text-foreground">
                {headingTop}
                <br />
                <span className="-mx-1 box-decoration-clone bg-primary/15 px-2">
                  {headingBottom}
                </span>
              </h1>
              <HeroSubheading className="mb-8 mt-6 max-w-xl text-base sm:text-lg">
                {subheading}
              </HeroSubheading>
              <HeroActions className="mb-8 mt-0 grid grid-cols-2 gap-3 sm:flex sm:flex-row sm:gap-4">
                <SaasPlanActionButton
                  lakebed={lakebed}
                  intentLabel={primaryCta}
                  plan={primaryCta}
                  source="hero"
                  pendingChildren={
                    <span className="inline-flex skew-x-6 items-center justify-center gap-2">
                      <SaasMutationSpinner className="size-4" />
                      Starting
                    </span>
                  }
                  className="inline-flex -skew-x-6 items-center justify-center rounded-none bg-foreground px-4 py-4 font-mono text-sm font-semibold uppercase tracking-[0.12em] text-background transition-[background-color,transform] duration-150 hover:bg-primary hover:text-primary-foreground active:translate-y-px disabled:pointer-events-none disabled:opacity-70 sm:px-8"
                >
                  <span className="inline-block skew-x-6">{primaryCta}</span>
                </SaasPlanActionButton>
                <SaasPlanActionButton
                  lakebed={lakebed}
                  intentLabel={secondaryCta}
                  source="hero"
                  pendingChildren={
                    <>
                      <SaasMutationSpinner className="size-4" />
                      Opening
                    </>
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-none border border-border bg-background px-4 py-4 font-mono text-sm font-medium uppercase tracking-[0.12em] text-foreground transition-colors duration-150 hover:bg-foreground hover:text-background active:translate-y-px disabled:pointer-events-none disabled:opacity-70 sm:px-6"
                >
                  <span aria-hidden="true">[</span>
                  {secondaryCta}
                  <span aria-hidden="true">]</span>
                </SaasPlanActionButton>
              </HeroActions>
              <HeroSocialProof className="mt-0 gap-x-6 gap-y-2">
                {trust.map((t) => (
                  <HeroSocialProofItem
                    key={t}
                    className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground"
                  >
                    <span aria-hidden="true" className="text-primary">
                      +
                    </span>
                    <span>{t}</span>
                  </HeroSocialProofItem>
                ))}
              </HeroSocialProof>
            </div>

            {/* Editor pane */}
            <div className="relative lg:col-span-5">
              <Card
                variant="default"
                className="-mx-2 overflow-hidden rounded-none border-border p-0 shadow-none sm:mx-0"
              >
                <div className="flex items-center gap-2 border-b border-border bg-muted/60 px-4 py-2.5">
                  <div className="flex gap-1.5" aria-hidden="true">
                    <span className="size-2.5 bg-muted-foreground/40" />
                    <span className="size-2.5 bg-muted-foreground/25" />
                    <span className="size-2.5 bg-primary/60" />
                  </div>
                  <span className="ml-2 truncate font-mono text-[11px] text-muted-foreground">
                    {previewFile}
                  </span>
                  <span
                    aria-hidden="true"
                    className="ml-auto font-mono text-[10px] uppercase tracking-[0.2em] text-primary"
                  >
                    ● live
                  </span>
                </div>
                <div className="space-y-4 p-5 sm:p-6">
                  <div className="flex gap-3">
                    <span className="size-8 shrink-0 rounded-none bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 w-3/4 bg-muted" />
                      <div className="h-3.5 w-1/2 bg-muted" />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="grid size-8 shrink-0 place-items-center rounded-none bg-foreground text-background">
                      <svg
                        className="size-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </span>
                    <Card
                      variant="outline"
                      className="flex-1 rounded-none border-l-2 border-border border-l-primary bg-primary/[0.04] p-4"
                    >
                      <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                        {previewIntro}
                      </p>
                      <p className="text-sm italic leading-relaxed text-foreground">
                        &ldquo;{previewQuote}&rdquo;
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {previewActions.map((action, i) => (
                          <SaasPlanActionButton
                            key={action}
                            lakebed={lakebed}
                            intentLabel={action}
                            plan={action}
                            source="preview"
                            pendingChildren={<SaasMutationSpinner />}
                            className={cn(
                              'inline-flex items-center justify-center rounded-none px-3 py-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.12em] transition-colors duration-150 active:translate-y-px disabled:pointer-events-none disabled:opacity-70',
                              i === 0
                                ? 'bg-foreground text-background hover:bg-primary hover:text-primary-foreground'
                                : 'border border-border text-muted-foreground hover:border-foreground hover:text-foreground',
                            )}
                          >
                            {action}
                          </SaasPlanActionButton>
                        ))}
                      </div>
                    </Card>
                  </div>
                  <div className="flex gap-3">
                    <span className="size-8 shrink-0 rounded-none bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 w-full bg-muted" />
                      <div className="h-3.5 w-5/6 bg-muted" />
                      <div className="h-3.5 w-4/6 bg-muted" />
                    </div>
                  </div>
                </div>
              </Card>
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-3 -right-3 -z-10 hidden size-full border border-primary/30 sm:block"
              />
            </div>
          </div>
        </Container>
      </HeroSection>
    )
  },
})
