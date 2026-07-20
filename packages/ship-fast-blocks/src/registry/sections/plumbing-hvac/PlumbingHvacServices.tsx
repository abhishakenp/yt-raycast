import { defineCapsule } from '#/capsules/openui.ts'
import type { ReactNode } from 'react'
import { z } from 'zod/v4'

import {
  FeatureGrid,
  FeatureCard,
  FeatureIcon,
  FeatureTitle,
  FeatureDescription,
} from '#/section-kit/FeatureGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'

/**
 * PlumbingHvacServices — a trade-industrial services ledger for a plumbing &
 * HVAC site. Thin configuration over the shared `FeatureGrid` composite in a
 * tech-brutalist-lite key: a left-aligned mono index header (heading +
 * supporting subheading) above a responsive grid of squared border-2 service
 * cards, each led by a giant ghost index numeral over a mono service label, a
 * stroke-SVG glyph (cycled per index) in a squared foreground tile, an extrabold
 * slab title, and a muted blurb, with a hard offset shadow lifting on hover and
 * press feedback. Defaults cover the four pillars of the trade — Repair,
 * Installation, Maintenance, and 24/7 Emergency Service. Use to showcase what a
 * plumber or HVAC contractor offers beneath the hero. Renders fully with no
 * props via baked-in defaults.
 */
const ICONS: ReactNode[] = [
  // repair / wrench
  <>
    <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4 2.6-2.6Z" />
  </>,
  // installation / tools
  <>
    <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4 2.6-2.6Z" />
    <path d="M16 16l5 5" />
  </>,
  // maintenance / gear
  <>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
  </>,
  // emergency / clock-alert
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </>,
  // droplet / water
  <>
    <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5S12 5 12 2C12 5 9 7 7 9.5S5 13 5 15a7 7 0 0 0 7 7Z" />
  </>,
  // thermostat / hvac
  <>
    <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0Z" />
  </>,
]

function ServiceIcon({ glyph }: { glyph: ReactNode }) {
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

export const PlumbingHvacServices = defineCapsule({
  name: 'PlumbingHvacServices',
  description:
    'Trade-industrial services ledger for a plumbing & HVAC site built on the shared FeatureGrid composite: a left-aligned mono index header (heading + supporting subheading) above a responsive grid of squared border-2 service cards, each led by a giant ghost index numeral over a mono service label, a stroke-SVG glyph (cycled per index) in a squared foreground tile, an extrabold slab title, and a muted blurb, with a hard offset shadow on hover and press feedback. Defaults cover the four pillars of the trade — Repair, Installation, Maintenance, and 24/7 Emergency Service. Use to showcase what a plumber or HVAC contractor offers beneath the hero.',
  props: z.object({
    /** Centered section heading above the grid. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    subheading: z.string().optional(),
    /** Service cells: each with a title and a short description blurb. */
    features: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
        }),
      )
      .optional(),
    /** Grid column count (2/3/4). */
    columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Plumbing & HVAC services you can count on'
    const subheading =
      props.subheading ??
      'From a leaky faucet to a full system replacement, our licensed and insured techs handle it all — backed by upfront pricing and a satisfaction guarantee.'
    const features = props.features?.length
      ? props.features
      : [
          {
            title: 'Repair',
            description:
              'Leaky pipes, clogged drains, broken water heaters, and failing AC or furnace units — diagnosed and fixed right the first time.',
          },
          {
            title: 'Installation',
            description:
              'Expert installation of water heaters, sump pumps, furnaces, air conditioners, and complete plumbing fixtures, built to last.',
          },
          {
            title: 'Maintenance',
            description:
              'Seasonal tune-ups and preventive maintenance plans that keep your systems efficient and head off costly breakdowns.',
          },
          {
            title: 'Emergency Service',
            description:
              'Burst pipes, no heat, no AC, or flooding? Our 24/7 emergency crew is on call every day of the year, holidays included.',
          },
        ]

    return (
      <section className="bg-background pt-28 pb-20 lg:pt-32 lg:pb-28">
        <Container size="xl">
          <div className="mb-12 max-w-3xl">
            <span className="mb-5 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
              <span className="tabular-nums">[ 02 ]</span>
              <span className="text-muted-foreground">What we do</span>
            </span>
            <h2 className="text-balance text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
              {heading}
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              {subheading}
            </p>
          </div>
          <FeatureGrid columns={props.columns ?? 4} className={props.className}>
            {features
              .map((f, i) => ({
                title: f.title,
                description: f.description,
                icon: <ServiceIcon glyph={ICONS[i % ICONS.length]} />,
              }))
              .map((f, i) => {
                const __iv__ = f as {
                  title: string
                  description: string
                  icon?: React.ReactNode
                  points?: string[]
                  cta?: string
                  price?: string
                  imageAlt?: string
                }
                return (
                  <FeatureCard
                    key={__iv__.title}
                    className="relative gap-4 overflow-hidden rounded-none border-2 border-foreground p-6 transition-all duration-150 hover:-translate-y-1 hover:border-foreground hover:shadow-[8px_8px_0_0] hover:shadow-foreground active:translate-y-0 active:shadow-[3px_3px_0_0] motion-reduce:transform-none"
                  >
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -right-2 -top-4 select-none font-mono text-7xl font-extrabold leading-none tabular-nums text-foreground/[0.06]"
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
                      Service {String(i + 1).padStart(2, '0')}
                    </span>
                    {__iv__.icon && (
                      <FeatureIcon className="rounded-none bg-foreground text-background">
                        {__iv__.icon}
                      </FeatureIcon>
                    )}
                    <FeatureTitle className="text-xl font-extrabold tracking-tight">
                      {__iv__.title}
                    </FeatureTitle>
                    <FeatureDescription>
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
