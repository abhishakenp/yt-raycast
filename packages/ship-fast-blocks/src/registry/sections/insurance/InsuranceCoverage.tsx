import { defineCapsule } from '#/capsules/openui.ts'
import type { ReactNode } from 'react'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

/**
 * InsuranceCoverage — 4-up coverage product grid for an insurance page. A
 * centered eyebrow chip + heading + lede above a responsive grid of coverage
 * cards (Home / Auto / Life / Health), each with a tinted line-icon tile, a
 * title, a description, a starting price and a per-card feature checklist with
 * check bullets. Cards lift and brighten on hover. Icons rotate through a small
 * token-colored set. Use as the main "what we cover" section for insurance
 * carriers, insurtech, brokers, or financial-protection products. Renders fully
 * with no props via baked-in defaults.
 */
export const InsuranceCoverage = defineCapsule({
  name: 'InsuranceCoverage',
  description:
    "4-up coverage product grid for an insurance page: a centered eyebrow chip + heading + lede above a responsive grid of coverage cards (e.g. Home / Auto / Life / Health), each with a tinted line-icon tile, a title, a description with a starting price, and a per-card feature checklist with check bullets. Cards lift and brighten on hover; icons rotate through a small token-colored set. Use as the main 'what we cover' section for insurance carriers, insurtech startups, brokers, or financial-protection products.",
  props: z.object({
    /** Eyebrow chip above the heading. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Lede paragraph under the heading. */
    description: z.string().optional(),
    /** Coverage cards. */
    items: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
          features: z.array(z.string()),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Comprehensive Protection'
    const heading = props.heading ?? 'Coverage designed for modern life'
    const description =
      props.description ??
      'From your first car to your forever home, we have you covered with flexible plans that grow with you.'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Home Insurance',
            description:
              'Protect your home and belongings from fire, theft, and natural disasters. Coverage starts at just $42/month.',
            features: [
              'Dwelling coverage up to $2M',
              'Personal property protection',
              'Liability coverage included',
            ],
          },
          {
            title: 'Auto Insurance',
            description:
              'Complete protection for every drive. From liability to comprehensive, we cover what matters on the road.',
            features: [
              'Collision & comprehensive',
              'Roadside assistance 24/7',
              'Uninsured motorist coverage',
            ],
          },
          {
            title: 'Life Insurance',
            description:
              "Secure your family's financial future. Term and whole life options with guaranteed rates.",
            features: [
              'Term: 10-30 year options',
              'Whole life cash value',
              'No medical exam options',
            ],
          },
          {
            title: 'Health Insurance',
            description:
              'Quality healthcare coverage that fits your budget. Individual, family, and supplemental plans available.',
            features: [
              '$0 preventive care visits',
              'Prescription coverage',
              'Mental health benefits',
            ],
          },
        ]

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

    const coverageIcons: ReactNode[] = [
      <svg
        key="home"
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
        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>,
      <svg
        key="auto"
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
        <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
        <path d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1" />
      </svg>,
      <svg
        key="life"
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
        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>,
      <svg
        key="health"
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
        <path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>,
    ]

    return (
      <section className={cn('bg-background py-20 lg:py-28', props.className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <span className="mb-4 inline-block rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-accent-foreground">
              {eyebrow}
            </span>
            <h2 className="mb-6 text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {items.map((item, i) => (
              <div
                key={item.title}
                className="group rounded-2xl border border-transparent bg-muted p-6 transition-all hover:border-border hover:bg-card hover:shadow-xl lg:p-8"
              >
                <div className="mb-6 grid size-12 place-items-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                  {coverageIcons[i % coverageIcons.length]}
                </div>
                <h3 className="mb-3 text-xl font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mb-4 leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {item.features.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <Check className="size-4 shrink-0 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
