import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * AiProductHero — split, two-column hero for a clean, light AI SaaS / product
 * landing page. On the left: a live-status pill with a pulsing dot, a huge
 * two-line headline (second line muted), a supporting paragraph, dual CTAs (a
 * near-black filled primary with arrow + an outlined "watch demo" secondary with
 * play glyph), and a trust microcopy row with check marks. On the right: a
 * mocked AI chat/editor preview card with a macOS-style title bar, skeleton
 * message rows, and a highlighted AI suggestion block with action chips, framed
 * by soft blurred glow orbs. CTAs and chips route through useNavigate. Use as
 * the opening hero for AI writing assistants, AI copilots, or generative-AI
 * tools. Renders fully with no props.
 */
export const AiProductHero = defineComponent({
  name: "AiProductHero",
  description:
    "Split two-column hero for a clean, light AI SaaS / product landing page: a left column with a live-status pill (pulsing dot), a large two-line headline (second line muted), a supporting paragraph, dual CTAs (near-black filled primary with arrow + outlined watch-demo secondary with play glyph), and a check-marked trust microcopy row; a right column with a mocked AI chat/editor preview card featuring a macOS-style title bar, skeleton message rows, and a highlighted AI-suggestion block with action chips, framed by soft blurred glow orbs. CTAs and chips route through useNavigate. Use as the opening hero for AI writing assistants, AI copilots, generative-AI tools, developer-AI products, or modern SaaS launch pages.",
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
  component: ({ props }) => {
    const go = useNavigate()
    const badge = props.badge ?? "Now with GPT-4 powered suggestions"
    const headingTop = props.headingTop ?? "Write faster."
    const headingBottom = props.headingBottom ?? "Think clearer."
    const subheading =
      props.subheading ??
      "WriteFlow AI understands your voice and helps you draft, edit, and polish content in minutes instead of hours. Trusted by 50,000+ writers at companies like Notion, Figma, and Stripe."
    const primaryCta = props.primaryCta ?? "Start writing free"
    const secondaryCta = props.secondaryCta ?? "Watch demo (2:34)"
    const trust = props.trust?.length
      ? props.trust
      : ["No credit card required", "14-day free trial"]
    const previewFile = props.previewFile ?? "blog-post-draft.md"
    const previewIntro =
      props.previewIntro ??
      "Here's a refined opening that hooks readers immediately:"
    const previewQuote =
      props.previewQuote ??
      "The blank page stares back. You've been here before—the cursor blinking, the deadline looming, the perfect words hiding just out of reach. What if writing didn't have to be this hard?"
    const previewActions = props.previewActions?.length
      ? props.previewActions
      : ["Use this", "Try again", "Make shorter"]

    const Check = ({ className }: { className?: string }) => (
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
        <path d="M5 13l4 4L19 7" />
      </svg>
    )

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
      <section
        className={cn("relative overflow-hidden", props.className)}
      >
        <div className="mx-auto max-w-7xl px-4 pb-24 pt-16 sm:px-6 lg:px-8 lg:pb-32 lg:pt-24">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="max-w-2xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1">
                <span className="size-2 animate-pulse rounded-full bg-primary" />
                <span className="text-xs font-medium text-muted-foreground">
                  {badge}
                </span>
              </div>
              <h1 className="mb-6 text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                {headingTop}
                <br />
                <span className="text-muted-foreground">{headingBottom}</span>
              </h1>
              <p className="mb-8 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
                {subheading}
              </p>
              <div className="mb-8 flex flex-col gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(primaryCta)}
                  className="inline-flex items-center justify-center rounded-lg bg-foreground px-6 py-3 text-base font-medium text-background transition-colors hover:bg-foreground/90"
                >
                  {primaryCta}
                  <ArrowRight className="ml-2 size-5" />
                </button>
                <button
                  type="button"
                  onClick={() => go(secondaryCta)}
                  className="inline-flex items-center justify-center rounded-lg border border-input bg-background px-6 py-3 text-base font-medium text-foreground transition-colors hover:bg-muted"
                >
                  <svg
                    className="mr-2 size-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {secondaryCta}
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                {trust.map((t) => (
                  <div key={t} className="flex items-center gap-2">
                    <Check className="size-5 text-primary" />
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Preview card */}
            <div className="relative">
              <div className="relative overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
                <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-3">
                  <div className="flex gap-1.5">
                    <span className="size-3 rounded-full bg-destructive/70" />
                    <span className="size-3 rounded-full bg-chart-4" />
                    <span className="size-3 rounded-full bg-primary/70" />
                  </div>
                  <span className="ml-2 font-mono text-xs text-muted-foreground">
                    {previewFile}
                  </span>
                </div>
                <div className="space-y-4 p-6">
                  <div className="flex gap-3">
                    <span className="size-8 shrink-0 rounded-full bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/4 rounded bg-muted" />
                      <div className="h-4 w-1/2 rounded bg-muted" />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-foreground text-background">
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
                    <div className="flex-1 rounded-lg border border-border bg-muted/50 p-4">
                      <p className="mb-2 text-sm text-muted-foreground">
                        {previewIntro}
                      </p>
                      <p className="text-sm italic text-foreground">
                        &ldquo;{previewQuote}&rdquo;
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {previewActions.map((action, i) => (
                          <button
                            key={action}
                            type="button"
                            onClick={() => go(action)}
                            className={cn(
                              "rounded px-3 py-1.5 text-xs font-medium transition-colors",
                              i === 0
                                ? "bg-foreground text-background hover:bg-foreground/90"
                                : "text-muted-foreground hover:text-foreground",
                            )}
                          >
                            {action}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="size-8 shrink-0 rounded-full bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-full rounded bg-muted" />
                      <div className="h-4 w-5/6 rounded bg-muted" />
                      <div className="h-4 w-4/6 rounded bg-muted" />
                    </div>
                  </div>
                </div>
              </div>
              <div
                aria-hidden="true"
                className="absolute -bottom-6 -right-6 size-24 rounded-full bg-muted blur-2xl"
              />
              <div
                aria-hidden="true"
                className="absolute -left-6 -top-6 size-32 rounded-full bg-muted/50 blur-3xl"
              />
            </div>
          </div>
        </div>
      </section>
    )
  },
})
