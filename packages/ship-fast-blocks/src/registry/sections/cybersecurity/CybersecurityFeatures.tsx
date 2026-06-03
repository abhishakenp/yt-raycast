import type { ReactNode } from "react"
import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * CybersecurityFeatures — security-capability grid. A light section with a
 * centered heading + supporting paragraph above a responsive 2-to-3 column grid
 * of bordered cards. Each card has a rounded icon tile (cycling through a set of
 * security glyphs that invert color on hover), a bold title, a descriptive
 * paragraph, and an arrowed "Learn more" link that routes through useNavigate.
 * Use to lay out core platform capabilities for cybersecurity vendors,
 * SOC/MDR/XDR providers, zero-trust, cloud-security, or compliance-automation
 * products. Renders fully with no props via baked-in capability defaults.
 */
export const CybersecurityFeatures = defineComponent({
  name: "CybersecurityFeatures",
  description:
    "Security-capability grid: a light section with a centered heading + supporting paragraph above a responsive 2-to-3 column grid of bordered cards, each with a rounded icon tile (cycling security glyphs that invert color on hover), a bold title, a description, and an arrowed 'Learn more' link routing through useNavigate. Use to lay out core platform capabilities for cybersecurity vendors, SOC/MDR/XDR providers, zero-trust, cloud-security, or compliance-automation products.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting description under the heading. */
    description: z.string().optional(),
    /** Per-card link label. */
    cta: z.string().optional(),
    /** Capability cards. */
    items: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heading = props.heading ?? "Complete security coverage"
    const description =
      props.description ??
      "From endpoint to cloud, our unified platform protects every layer of your digital infrastructure with enterprise-grade precision."
    const cta = props.cta ?? "Learn more"
    const items = props.items?.length
      ? props.items
      : [
          {
            title: "AI Threat Detection",
            description:
              "Machine learning models trained on 50B+ security events detect anomalies in real-time with 99.7% accuracy. Identifies zero-day exploits before they spread.",
          },
          {
            title: "Zero Trust Architecture",
            description:
              "Never trust, always verify. Multi-factor authentication, device posture checks, and least-privilege access for every user and endpoint.",
          },
          {
            title: "Cloud Security Posture",
            description:
              "Continuous monitoring of AWS, Azure, and GCP configurations. Auto-remediation for 500+ compliance checks including CIS benchmarks.",
          },
          {
            title: "24/7 SOC Monitoring",
            description:
              "Expert security analysts in 4 global centers monitor your environment around the clock. Average alert-to-response time under 15 minutes.",
          },
          {
            title: "Compliance Automation",
            description:
              "Automated evidence collection and reporting for SOC 2, ISO 27001, PCI DSS, HIPAA, and GDPR. Reduce audit prep time by 80%.",
          },
          {
            title: "API Security",
            description:
              "Protect your APIs from OWASP Top 10 threats. Real-time schema validation, anomaly detection, and bot mitigation for GraphQL and REST.",
          },
        ]

    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        className={className}
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

    const featureIcons: ReactNode[] = [
      <path
        key="shield"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />,
      <path
        key="lock"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      />,
      <path
        key="cloud"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
      />,
      <path
        key="chart"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />,
      <path
        key="doc"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />,
      <path
        key="code"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
      />,
    ]

    return (
      <section className={cn("bg-background py-24", props.className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">{heading}</h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item, i) => (
              <div
                key={item.title}
                className="group rounded-2xl border border-border bg-card p-8 transition-all hover:border-border/80 hover:shadow-lg"
              >
                <div className="mb-6 flex size-14 items-center justify-center rounded-xl bg-muted transition-colors group-hover:bg-primary">
                  <svg
                    className="size-7 text-foreground transition-colors group-hover:text-primary-foreground"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    {featureIcons[i % featureIcons.length]}
                  </svg>
                </div>
                <h3 className="mb-3 text-xl font-bold text-card-foreground">
                  {item.title}
                </h3>
                <p className="mb-4 text-muted-foreground">{item.description}</p>
                <button
                  type="button"
                  onClick={() => go(item.title)}
                  className="flex items-center gap-1 font-medium text-foreground hover:underline"
                >
                  {cta}
                  <ArrowRight className="size-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
