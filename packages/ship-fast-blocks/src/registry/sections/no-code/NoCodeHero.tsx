import type { ReactNode } from "react"
import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * NoCodeHero — two-column landing hero for a no-code / drag-and-drop app-builder
 * SaaS, on a bright neutral canvas. The left column stacks a live-status pill
 * (pulsing dot), a large two-tone headline (solid + muted accent), a supporting
 * paragraph, dual CTAs (filled primary with arrow + outlined "watch demo" with
 * play icon), and a row of checkmarked trust microcopy. The right column renders
 * a faux visual-EDITOR mockup: browser chrome with traffic-light dots, a
 * Components rail, a gridded drag-and-drop canvas with a selected block, a
 * Properties panel, and a floating "Published!" success toast. CTAs route
 * through useNavigate. Use as the opening hero for no-code / website-builder /
 * page-builder / SaaS platform products. Renders fully with no props.
 */
export const NoCodeHero = defineComponent({
  name: "NoCodeHero",
  description:
    "Two-column landing hero for a no-code / drag-and-drop app-builder SaaS on a bright neutral canvas: left column has a live-status pill (pulsing dot), a large two-tone headline (solid + muted accent), a supporting paragraph, dual CTAs (filled primary with arrow + outlined watch-demo with play icon), and checkmarked trust microcopy; right column shows a faux visual-EDITOR mockup with browser chrome traffic-light dots, a Components rail, a gridded drag-and-drop canvas with a selected block, a Properties panel, and a floating 'Published!' success toast. CTAs route through useNavigate. Use as the opening hero for no-code / website-builder / page-builder / app-builder / SaaS platform products.",
  props: z.object({
    /** Live-status pill text. */
    badge: z.string().optional(),
    /** First (solid) headline line. */
    headingTop: z.string().optional(),
    /** Muted continuation of the headline. */
    headingAccent: z.string().optional(),
    /** Supporting paragraph under the headline. */
    subheading: z.string().optional(),
    /** Filled primary CTA label. */
    primaryCta: z.string().optional(),
    /** Outlined secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Short checkmarked trust microcopy lines. */
    trust: z.array(z.string()).optional(),
    /** Label shown in the editor mockup's title bar. */
    editorLabel: z.string().optional(),
    /** Floating success-toast label on the mockup. */
    toast: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const badge = props.badge ?? "Now with AI-powered components"
    const headingTop = props.headingTop ?? "Build apps without code."
    const headingAccent = props.headingAccent ?? "Drag, drop, launch."
    const subheading =
      props.subheading ??
      "Create stunning web and mobile apps in minutes. Choose from 200+ professionally designed templates, customize with our intuitive drag-and-drop builder, and publish instantly."
    const primaryCta = props.primaryCta ?? "Start building free"
    const secondaryCta = props.secondaryCta ?? "Watch demo"
    const trust = props.trust?.length
      ? props.trust
      : ["No credit card required", "Free forever plan"]
    const editorLabel = props.editorLabel ?? "Buildr Editor"
    const toast = props.toast ?? "Published!"

    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={className}
      >
        <line x1="3" y1="12" x2="21" y2="12" />
        <polyline points="14 5 21 12 14 19" />
      </svg>
    )

    const Check = ({ className }: { className?: string }) => (
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
        className={className}
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    )

    const PlayIcon = () => (
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
        <circle cx="12" cy="12" r="9" />
        <polygon points="10 9 15 12 10 15 10 9" />
      </svg>
    )

    const iconTints = [
      "bg-primary/10 text-primary",
      "bg-secondary text-secondary-foreground",
      "bg-accent text-accent-foreground",
      "bg-chart-2/15 text-chart-2",
    ]
    const railIcons: ReactNode[] = [
      <svg
        key="drag"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
        <path d="M13 13l6 6" />
      </svg>,
      <svg
        key="grid"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>,
      <svg
        key="mobile"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="7" y="2" width="10" height="20" rx="2" />
        <line x1="12" y1="18" x2="12" y2="18" />
      </svg>,
      <svg
        key="bolt"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polygon points="13 2 4 14 11 14 11 22 20 10 13 10 13 2" />
      </svg>,
    ]

    return (
      <section
        className={cn("relative overflow-hidden", props.className)}
        aria-labelledby="nc-hero"
      >
        <div className="mx-auto max-w-7xl px-4 pb-24 pt-20 sm:px-6 lg:px-8 lg:pb-40 lg:pt-32">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="text-center lg:text-left">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5">
                <span className="size-2 animate-pulse rounded-full bg-chart-2" />
                <span className="text-sm font-medium text-muted-foreground">
                  {badge}
                </span>
              </div>
              <h1
                id="nc-hero"
                className="mb-6 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl"
              >
                {headingTop}{" "}
                <span className="text-muted-foreground">{headingAccent}</span>
              </h1>
              <p className="mx-auto mb-8 max-w-xl text-lg leading-relaxed text-muted-foreground lg:mx-0">
                {subheading}
              </p>
              <div className="mb-8 flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
                <button
                  type="button"
                  onClick={() => go(primaryCta)}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {primaryCta}
                  <ArrowRight className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => go(secondaryCta)}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-6 py-3 font-medium text-foreground transition-colors hover:bg-accent"
                >
                  <PlayIcon />
                  {secondaryCta}
                </button>
              </div>
              <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground lg:justify-start">
                {trust.map((t) => (
                  <div key={t} className="flex items-center gap-2">
                    <Check className="size-5 text-chart-2" />
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Editor mockup (decorative product UI) */}
            <div className="relative" aria-hidden="true">
              <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
                <div className="flex items-center gap-2 border-b border-border bg-muted px-4 py-3">
                  <div className="flex gap-1.5">
                    <div className="size-3 rounded-full bg-chart-1" />
                    <div className="size-3 rounded-full bg-chart-4" />
                    <div className="size-3 rounded-full bg-chart-2" />
                  </div>
                  <div className="flex-1 text-center">
                    <span className="text-xs font-medium text-muted-foreground">
                      {editorLabel}
                    </span>
                  </div>
                </div>
                <div className="grid min-h-[400px] grid-cols-12">
                  <div className="col-span-3 space-y-3 border-r border-border bg-muted/50 p-4">
                    <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Components
                    </div>
                    {["Text", "Image", "Button", "Form"].map((c, i) => (
                      <div
                        key={c}
                        className="flex items-center gap-3 rounded-lg border border-border bg-card p-2 shadow-sm"
                      >
                        <div
                          className={cn(
                            "grid size-8 place-items-center rounded",
                            iconTints[i % iconTints.length],
                          )}
                        >
                          <span className="size-4">
                            {railIcons[i % railIcons.length]}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-card-foreground">
                          {c}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="relative col-span-6 bg-card p-6">
                    <div
                      className="absolute inset-0 opacity-40"
                      style={{
                        backgroundImage:
                          "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
                        backgroundSize: "20px 20px",
                        color: "var(--border)",
                      }}
                    />
                    <div className="relative space-y-4">
                      <div className="rounded-xl border-2 border-dashed border-primary bg-foreground p-6 text-center text-background shadow-lg">
                        <h3 className="mb-2 text-xl font-semibold">
                          Welcome to My App
                        </h3>
                        <p className="mb-4 text-sm text-background/60">
                          Build something amazing today
                        </p>
                        <span className="inline-block rounded-lg bg-background px-4 py-2 text-sm font-medium text-foreground">
                          Get Started
                        </span>
                      </div>
                      <div className="rounded-lg border border-border bg-muted p-4">
                        <div className="mb-2 h-2 w-3/4 rounded bg-border" />
                        <div className="h-2 w-1/2 rounded bg-border" />
                      </div>
                    </div>
                  </div>
                  <div className="col-span-3 border-l border-border bg-muted/50 p-4">
                    <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Properties
                    </div>
                    <div className="space-y-4">
                      <div>
                        <span className="mb-1.5 block text-xs text-muted-foreground">
                          Background
                        </span>
                        <div className="flex gap-1.5">
                          <div className="size-6 rounded border-2 border-primary bg-foreground" />
                          <div className="size-6 rounded border border-border bg-background" />
                          <div className="size-6 rounded border border-border bg-chart-1" />
                          <div className="size-6 rounded border border-border bg-chart-3" />
                        </div>
                      </div>
                      <div>
                        <span className="mb-1.5 block text-xs text-muted-foreground">
                          Padding
                        </span>
                        <div className="flex items-center gap-2 rounded border border-border bg-card px-2 py-1.5">
                          <span className="text-sm text-card-foreground">
                            24px
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="mb-1.5 block text-xs text-muted-foreground">
                          Border Radius
                        </span>
                        <div className="flex items-center gap-2 rounded border border-border bg-card px-2 py-1.5">
                          <span className="text-sm text-card-foreground">
                            12px
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -right-4 -top-4 rounded-xl border border-border bg-card p-3 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="grid size-8 place-items-center rounded-full bg-chart-2/15">
                    <Check className="size-4 text-chart-2" />
                  </div>
                  <span className="text-sm font-medium text-card-foreground">
                    {toast}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  },
})
