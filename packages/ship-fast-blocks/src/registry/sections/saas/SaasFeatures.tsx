import { defineCapsule } from '#/capsules/openui.ts'
import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import type { ReactNode } from 'react'
import { z } from 'zod/v4'

import {
  FeatureGrid,
  FeatureCard,
  FeatureIcon as KitFeatureIcon,
  FeatureTitle,
  FeatureDescription,
} from '#/section-kit/FeatureGrid.tsx'

/**
 * SaasFeatures — kinetic-SaaS collapsed-border capability grid for a B2B SaaS /
 * AI-product landing page. An asymmetric header (marker-highlighted heading
 * left, mono "[ CORE ]" meta right) above a sharp 3-column grid of
 * hairline-collapsed feature cells: each cell pairs a mono index numeral and a
 * bordered inline stroke-SVG glyph (cycled per index) with a bold title and a
 * muted blurb, and washes to muted on hover. Use to showcase a product's core
 * capabilities — scheduling, integrations, analytics, security, automation,
 * collaboration — beneath a SaaS hero. Renders fully with no props via baked-in
 * defaults.
 */
const ICONS: ReactNode[] = [
  // calendar / scheduling
  <>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </>,
  // integrations / puzzle
  <>
    <path d="M4 7h3a2 2 0 0 0 2-2V4a2 2 0 1 1 4 0v1a2 2 0 0 0 2 2h3v3a2 2 0 0 0 2 2h0a2 2 0 1 1 0 4h0a2 2 0 0 0-2 2v3h-3a2 2 0 0 1-2-2v0a2 2 0 0 0-4 0v0a2 2 0 0 1-2 2H4v-3a2 2 0 0 0-2-2H2a2 2 0 1 1 0-4h0a2 2 0 0 0 2-2V7Z" />
  </>,
  // analytics / chart
  <>
    <path d="M3 3v18h18" />
    <path d="M7 15l4-5 3 3 5-7" />
  </>,
  // security / shield
  <>
    <path d="M12 2l8 4v6c0 5-3.4 7.7-8 10-4.6-2.3-8-5-8-10V6l8-4Z" />
    <path d="M9 12l2 2 4-4" />
  </>,
  // automation / zap
  <>
    <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8Z" />
  </>,
  // collaboration / users
  <>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </>,
]

function FeatureIcon({ glyph }: { glyph: ReactNode }) {
  return (
    <svg
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
      {glyph}
    </svg>
  )
}

export const SaasFeatures = defineCapsule({
  name: 'SaasFeatures',
  description:
    "Kinetic-SaaS collapsed-border capability grid for a B2B SaaS / AI-product landing page: an asymmetric marker-highlighted header with mono meta above a sharp 3-column grid of hairline-collapsed feature cells, each pairing a mono index numeral and a bordered inline stroke-SVG glyph (cycled per index) with a bold title and a muted blurb, washing to muted on hover. Use to showcase a product's core capabilities — scheduling, integrations, analytics, security, automation, collaboration — beneath a SaaS hero.",
  props: z.object({
    /** Centered section heading above the grid. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    subheading: z.string().optional(),
    /** Feature cells: each with a title and a short description blurb. */
    features: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Everything you need to ship faster'
    const subheading =
      props.subheading ??
      'A complete toolkit that adapts to how your team already works — no rip-and-replace, no steep learning curve, just measurable results from day one.'
    const features = props.features?.length
      ? props.features
      : [
          {
            title: 'AI scheduling',
            description:
              'Let intelligent agents read your calendar and book meetings at the perfect time, automatically resolving conflicts before they happen.',
          },
          {
            title: 'Native integrations',
            description:
              'Connect Slack, Notion, GitHub, and 80+ tools in a single click so your data and workflows stay perfectly in sync.',
          },
          {
            title: 'Real-time analytics',
            description:
              'Track adoption, velocity, and ROI with live dashboards that turn raw activity into decisions your whole team can trust.',
          },
          {
            title: 'Enterprise security',
            description:
              'SOC 2 Type II, SSO, and granular role-based access keep every byte encrypted and every action auditable end to end.',
          },
          {
            title: 'Smart automation',
            description:
              'Trigger multi-step workflows from any event and let recurring busywork run itself while your team focuses on what matters.',
          },
          {
            title: 'Team collaboration',
            description:
              "Shared spaces, inline comments, and live presence keep everyone aligned whether they're across the desk or across the globe.",
          },
        ]

    const headingWords = heading.split(' ')
    const headingLead = headingWords.slice(0, -1).join(' ')
    const headingMark = headingWords.at(-1) ?? ''

    return (
      <section
        className={cn(
          'relative overflow-hidden bg-background py-16 lg:py-24',
          props.className,
        )}
      >
        <Container>
          {/* Asymmetric header: marker-highlighted heading left, mono meta right. */}
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-16">
            <div className="max-w-2xl">
              <MonoTag className="mb-4 block">
                Core
                <span aria-hidden="true" className="text-primary">
                  {' '}
                  · 01—06
                </span>
              </MonoTag>
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                {headingLead}{' '}
                <span className="relative ml-[0.12em] inline-block whitespace-nowrap">
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-[-0.15em] inset-y-[0.05em] -rotate-1 bg-primary"
                  />
                  <span className="relative text-primary-foreground">
                    {headingMark}
                  </span>
                </span>
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">{subheading}</p>
            </div>
            <p
              aria-hidden="true"
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60"
            >
              [ stack ] no rip-and-replace
            </p>
          </div>

          {/* Collapsed-border feature grid — hairline cells, mono indexes. */}
          <FeatureGrid className="gap-0 border-l border-t border-border [&>div]:grid [&>div]:grid-cols-1 [&>div]:gap-0 sm:[&>div]:grid-cols-2 lg:[&>div]:grid-cols-3">
            {features
              .map((f, i) => ({
                title: f.title,
                description: f.description,
                icon: <FeatureIcon glyph={ICONS[i % ICONS.length]} />,
                index: i,
              }))
              .map((f) => {
                const __iv__ = f as {
                  title: string
                  description: string
                  icon?: React.ReactNode
                  index: number
                  points?: string[]
                  cta?: string
                  price?: string
                  imageAlt?: string
                }
                return (
                  <FeatureCard
                    key={__iv__.title}
                    className="gap-0 rounded-none border-0 border-b border-r border-border bg-card p-6 shadow-none transition-colors duration-150 hover:translate-y-0 hover:bg-muted/60 sm:p-8"
                  >
                    <span className="flex items-center justify-between">
                      <span
                        aria-hidden="true"
                        className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
                      >
                        {String(__iv__.index + 1).padStart(2, '0')}
                        <span className="text-primary"> /</span>
                      </span>
                      {__iv__.icon && (
                        <KitFeatureIcon className="size-11 rounded-none border border-border bg-background text-foreground">
                          {__iv__.icon}
                        </KitFeatureIcon>
                      )}
                    </span>
                    <FeatureTitle className="mt-4 text-xl font-bold tracking-tight">
                      {__iv__.title}
                    </FeatureTitle>
                    <FeatureDescription className="mt-2 max-w-md text-sm leading-6">
                      {__iv__.description}
                    </FeatureDescription>
                  </FeatureCard>
                )
              })}
          </FeatureGrid>
        </Container>
      </section>
    )
  },
})
