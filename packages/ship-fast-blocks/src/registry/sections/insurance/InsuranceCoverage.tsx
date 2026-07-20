import { defineCapsule } from '#/capsules/openui.ts'
import type { ReactNode } from 'react'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * InsuranceCoverage — Swiss-trust coverage ledger for an insurance page. An
 * asymmetric header (mono eyebrow + left-aligned heading + lede, mono coverage
 * count right) sits above a sharp-cornered, collapsed-border 4-column grid whose
 * cells share hairline rules (binary radius, no gaps); each cell carries a mono
 * index numeral, a small line icon, a coverage title and description, and a
 * hairline-divided feature checklist with tabular check bullets, the ink
 * hairline thickening on hover. Use as the main "what we cover" section for
 * insurance carriers, insurtech, brokers, or financial-protection products.
 * Renders fully with no props via baked-in defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import {
  FeatureGrid,
  FeatureCard,
  FeatureIcon,
  FeatureTitle,
  FeatureDescription,
} from '#/section-kit/FeatureGrid.tsx'
export const InsuranceCoverage = defineCapsule({
  name: 'InsuranceCoverage',
  description:
    "Swiss-trust coverage ledger for an insurance page: an asymmetric header (mono eyebrow + left-aligned heading + lede, mono coverage count right) above a sharp-cornered, collapsed-border 4-column grid whose cells share hairline rules and carry a mono index numeral, a small line icon, a coverage title and description (with a starting price), and a hairline-divided feature checklist with tabular check bullets, the ink hairline thickening on hover. Use as the main 'what we cover' section for insurance carriers, insurtech startups, brokers, or financial-protection products.",
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
    const CheckMark = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M5 13l4 4L19 7" />
      </svg>
    )
    return (
      <section className={cn('bg-background py-20 lg:py-28', props.className)}>
        <Container>
          <div className="mb-12 flex flex-col gap-6 border-b border-border pb-6 md:flex-row md:items-end md:justify-between lg:mb-14">
            <div className="max-w-2xl">
              <MonoTag className="mb-4 block">
                {eyebrow}
                <span aria-hidden="true" className="text-primary">
                  {' '}
                  / cover
                </span>
              </MonoTag>
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground text-balance sm:text-4xl lg:text-5xl">
                {heading}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground text-pretty">
                {description}
              </p>
            </div>
            <MonoTag
              aria-hidden="true"
              tone="faint"
              className="shrink-0 tabular-nums"
            >
              [ {String(items.length).padStart(2, '0')} lines ]
            </MonoTag>
          </div>
          <FeatureGrid
            columns={4}
            className="gap-0 border-l border-t border-border"
          >
            {items
              .map((item, i) => ({
                title: item.title,
                description: item.description,
                features: item.features,
                icon: coverageIcons[i % coverageIcons.length],
              }))
              .map((f, i) => {
                const __iv__ = f as {
                  title: string
                  description: string
                  icon?: React.ReactNode
                  features?: string[]
                  points?: string[]
                  cta?: string
                  price?: string
                  imageAlt?: string
                }
                const features = __iv__.features ?? __iv__.points ?? []
                return (
                  <FeatureCard
                    key={__iv__.title}
                    className="gap-3 rounded-none border-0 border-b border-r border-border bg-transparent p-7 transition-colors duration-150 hover:border-foreground/30 hover:bg-muted/30 sm:p-8"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        aria-hidden="true"
                        className="font-mono text-[11px] font-semibold tabular-nums tracking-[0.2em] text-primary"
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span
                        aria-hidden="true"
                        className="h-px flex-1 bg-border"
                      />
                      {__iv__.icon && (
                        <FeatureIcon className="size-8 rounded-none bg-transparent text-primary">
                          {__iv__.icon}
                        </FeatureIcon>
                      )}
                    </div>
                    <FeatureTitle className="text-lg font-semibold tracking-tight">
                      {__iv__.title}
                    </FeatureTitle>
                    <FeatureDescription className="leading-relaxed">
                      {__iv__.description}
                    </FeatureDescription>
                    {features.length > 0 && (
                      <ul className="mt-2 divide-y divide-border border-t border-border">
                        {features.map((feat) => (
                          <li
                            key={feat}
                            className="flex items-start gap-2 py-2.5 text-sm text-foreground/85"
                          >
                            <CheckMark className="mt-0.5 size-4 shrink-0 text-primary" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </FeatureCard>
                )
              })}
          </FeatureGrid>
        </Container>
      </section>
    )
  },
})
