import type { ReactNode } from "react"
import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"

/**
 * InvestingFeatures — capabilities grid for an investing / fintech page. A muted
 * section band with a centered heading + lead above a responsive 1/2/3-column
 * grid of hover-lift cards; each card has a rounded tinted icon tile (rotating
 * inline line-icons in rotating token tints), a title and a description. Tokens
 * only, no links. Use to present a brokerage's core features — advanced
 * charting, zero commission, AI insights, security, social investing,
 * auto-invest — or any "everything you need" feature block. Renders fully with
 * no props via six baked-in default features.
 */
export const InvestingFeatures = defineComponent({
  name: "InvestingFeatures",
  description:
    "Capabilities grid for an investing / fintech page: a muted section band with a centered heading + lead above a responsive 1/2/3-column grid of hover-lift cards, each with a rounded tinted icon tile (rotating inline line-icons in rotating token tints), a title and a description. Tokens only, no links. Use to present a brokerage's core features (advanced charting, zero commission, AI insights, security, social investing, auto-invest) or any 'everything you need' feature block.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Feature cards: title + description. */
    items: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? "Everything you need to invest smarter"
    const description =
      props.description ??
      "Professional-grade tools made simple. From first-time investors to seasoned traders."
    const items = props.items?.length
      ? props.items
      : [
          {
            title: "Advanced Charting",
            description:
              "Technical analysis with 50+ indicators, drawing tools, and customizable timeframes. Spot trends before they happen.",
          },
          {
            title: "Zero Commission",
            description:
              "Trade stocks, ETFs, and options without commission fees. Keep more of what you earn with every transaction.",
          },
          {
            title: "AI Insights",
            description:
              "Machine learning algorithms analyze your portfolio and market conditions to suggest optimizations and opportunities.",
          },
          {
            title: "Bank-Grade Security",
            description:
              "256-bit encryption, biometric authentication, and SIPC insurance up to $500,000 protect your assets.",
          },
          {
            title: "Social Investing",
            description:
              "Follow top investors, share strategies, and learn from a community of over 2 million active traders.",
          },
          {
            title: "Auto-Invest",
            description:
              "Set up recurring deposits and automatically invest in your preferred assets. Build wealth passively.",
          },
        ]

    const featureIcons: ReactNode[] = [
      <svg key="chart" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>,
      <svg key="coin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      <svg key="ai" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>,
      <svg key="lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>,
      <svg key="social" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>,
      <svg key="auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>,
    ]
    const featureIconTones = [
      "bg-chart-1/15 text-chart-1",
      "bg-primary/15 text-primary",
      "bg-chart-5/15 text-chart-5",
      "bg-chart-4/20 text-chart-4",
      "bg-chart-3/20 text-chart-3",
      "bg-chart-2/15 text-chart-2",
    ]

    return (
      <section id="features" className={cn("bg-muted/50 py-24", props.className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl">{heading}</h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {items.map((f, i) => (
              <div
                key={f.title}
                className="rounded-xl border border-border bg-card p-8 text-card-foreground transition-shadow hover:shadow-lg"
              >
                <div
                  className={cn(
                    "mb-6 grid size-12 place-items-center rounded-xl [&>svg]:size-6",
                    featureIconTones[i % featureIconTones.length],
                  )}
                >
                  {featureIcons[i % featureIcons.length]}
                </div>
                <h3 className="mb-3 text-xl font-semibold">{f.title}</h3>
                <p className="leading-relaxed text-muted-foreground">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
