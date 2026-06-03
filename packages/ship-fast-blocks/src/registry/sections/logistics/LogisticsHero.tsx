import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * LogisticsHero — a split hero for a global-logistics / freight-forwarding
 * company on a subtle muted band. Left column: a large two-line headline (the
 * second line in muted tone), a supporting paragraph, a bordered card holding a
 * real-time shipment-tracking widget (labelled input + icon "Track" button + hint
 * line), and a row of check-marked trust chips. Right column: a rounded cargo-port
 * photo with a floating, shadowed on-time delivery-rate badge overlapping the
 * lower-left corner. Clean, corporate and trust-forward on a light surface with a
 * deep slate primary. The tracking form submit routes through useNavigate. Use as
 * the top hero for logistics providers, freight forwarders, shipping carriers,
 * courier or cargo/transport companies. Renders fully with no props.
 */
export const LogisticsHero = defineComponent({
  name: "LogisticsHero",
  description:
    "Split hero for a global-logistics / freight-forwarding company on a subtle muted band: a left column with a large two-line headline (second line in muted tone), a supporting paragraph, a bordered card holding a real-time shipment-tracking widget (labelled input + icon 'Track' button + hint line), and a row of check-marked trust chips; a right column with a rounded cargo-port photo and a floating, shadowed on-time delivery-rate badge overlapping the lower-left corner. Clean, corporate and trust-forward on a light surface with a deep slate primary; the tracking form routes through useNavigate. Use as the top hero for logistics providers, freight forwarders, shipping carriers, courier, supply-chain or cargo/transport companies.",
  props: z.object({
    headingTop: z.string().optional(),
    /** Highlighted second line under the heading (muted tone). */
    highlight: z.string().optional(),
    subheading: z.string().optional(),
    trackLabel: z.string().optional(),
    trackPlaceholder: z.string().optional(),
    trackButton: z.string().optional(),
    trackHint: z.string().optional(),
    /** Navigation target when the tracking form is submitted. */
    trackTarget: z.string().optional(),
    /** Trust chips beneath the tracking widget. */
    chips: z.array(z.string()).optional(),
    imageAlt: z.string().optional(),
    badgeValue: z.string().optional(),
    badgeLabel: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const headingTop = props.headingTop ?? "Global logistics,"
    const highlight = props.highlight ?? "simplified."
    const subheading =
      props.subheading ??
      "Ship to 180+ countries with real-time tracking and guaranteed delivery. From Shenzhen to Chicago, Amsterdam to São Paulo—we move what matters."
    const trackLabel = props.trackLabel ?? "Track your shipment"
    const trackPlaceholder =
      props.trackPlaceholder ?? "Enter tracking number (e.g., SF-7823-9912)"
    const trackButton = props.trackButton ?? "Track"
    const trackHint =
      props.trackHint ?? "Try demo: SF-2024-8841, SF-2024-7752, SF-2024-9931"
    const trackTarget = props.trackTarget ?? "Track"
    const chips = props.chips?.length
      ? props.chips
      : ["Real-time tracking", "Insurance included", "24/7 support"]
    const imageAlt =
      props.imageAlt ??
      "Aerial view of a large commercial shipping port with colorful cargo containers and cranes at sunset"
    const badgeValue = props.badgeValue ?? "98.7% on-time"
    const badgeLabel = props.badgeLabel ?? "Delivery rate in 2024"

    const Check = ({ className }: { className?: string }) => (
      <svg
        className={cn("size-5 shrink-0", className)}
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

    return (
      <section
        className={cn("bg-muted/50 py-16 lg:py-24", props.className)}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                  {headingTop}
                  <br />
                  <span className="text-muted-foreground">{highlight}</span>
                </h1>
                <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
                  {subheading}
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  go(trackTarget)
                }}
                className="rounded-2xl border border-border bg-card p-6 shadow-sm"
              >
                <label
                  htmlFor="logistics-hero-track"
                  className="mb-3 block text-sm font-medium text-card-foreground"
                >
                  {trackLabel}
                </label>
                <div className="flex gap-3">
                  <input
                    id="logistics-hero-track"
                    type="text"
                    placeholder={trackPlaceholder}
                    className="flex-1 rounded-xl border border-input bg-muted/50 px-4 py-3 text-foreground placeholder:text-muted-foreground transition-all focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
                  />
                  <button
                    type="submit"
                    className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>{trackButton}</span>
                  </button>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">{trackHint}</p>
              </form>

              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                {chips.map((chip) => (
                  <div key={chip} className="flex items-center gap-2">
                    <Check className="text-primary" />
                    <span>{chip}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
                <Image
                  alt={imageAlt}
                  w={800}
                  h={600}
                  className="size-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 rounded-xl border border-border bg-card p-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
                    <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-card-foreground">
                      {badgeValue}
                    </p>
                    <p className="text-xs text-muted-foreground">{badgeLabel}</p>
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
