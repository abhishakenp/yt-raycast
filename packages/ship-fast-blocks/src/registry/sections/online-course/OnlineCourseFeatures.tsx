import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import type { ReactNode } from 'react'

import { cn } from '#/lib/utils.ts'
import {
  FeatureCard,
  FeatureTitle,
  FeatureDescription,
} from '#/section-kit/FeatureGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'

const iconClass = 'size-4'
const baseIconProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  className: iconClass,
  'aria-hidden': true,
}

const ICONS: ReactNode[] = [
  <svg key="i0" {...baseIconProps}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>,
  <svg key="i1" {...baseIconProps}>
    <circle cx="12" cy="8" r="6" />
    <path d="M8.5 13.5 7 22l5-3 5 3-1.5-8.5" />
  </svg>,
  <svg key="i2" {...baseIconProps}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>,
  <svg key="i3" {...baseIconProps}>
    <path d="M16 18 22 12 16 6" />
    <path d="M8 6 2 12 8 18" />
  </svg>,
  <svg key="i4" {...baseIconProps}>
    <rect x="5" y="2" width="14" height="20" rx="2" />
    <path d="M12 18h.01" />
  </svg>,
  <svg key="i5" {...baseIconProps}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <path d="M7 10l5 5 5-5" />
    <path d="M12 15V3" />
  </svg>,
]

/**
 * OnlineCourseFeatures — "Curriculum LMS" what's-included ledger for an
 * online-course page. An asymmetric header (left-aligned SectionHeading beside
 * a mono "[ what's included ]" meta tag) sits above a sharp-cornered,
 * collapsed-border 1/2/3-column grid of benefit cells (lifetime access,
 * certificate of completion, community access, hands-on projects, mobile
 * learning, downloadable resources): each cell pairs a mono `INC 01` index +
 * small line icon with a ghost corner numeral, a title, and a one-line
 * description, filling on hover. A giant ghost "INCLUDED" watermark bleeds
 * behind. Use to summarize the concrete perks of enrolling on an e-learning,
 * bootcamp, or academy landing page. Renders fully with no props.
 */
export const OnlineCourseFeatures = defineCapsule({
  name: 'OnlineCourseFeatures',
  description:
    "Curriculum-LMS what's-included ledger for an online-course page: an asymmetric header (left-aligned heading beside a mono \"[ what's included ]\" meta tag) above a sharp-cornered collapsed-border 1/2/3-column grid of benefit cells (lifetime access, certificate of completion, community access, hands-on projects, mobile learning, downloadable resources). Each cell pairs a mono 'INC 01' index + small line icon with a ghost corner numeral, a title, and a one-line description, over a giant ghost 'INCLUDED' watermark. Use to summarize the perks of enrolling on an e-learning, bootcamp, or academy landing page.",
  props: z.object({
    heading: z.string().optional(),
    subheading: z.string().optional(),
    features: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Everything you need to learn'
    const subheading =
      props.subheading ??
      'Enroll once and get the full experience — from your first lesson to a credential you can share.'
    const baseFeatures = props.features?.length
      ? props.features
      : [
          {
            title: 'Lifetime access',
            description:
              'Buy once and revisit every lesson forever, including all future updates to the course.',
          },
          {
            title: 'Certificate of completion',
            description:
              'Earn a shareable certificate you can add to LinkedIn and your résumé.',
          },
          {
            title: 'Community access',
            description:
              'Join a private community of learners and mentors to ask questions and stay accountable.',
          },
          {
            title: 'Hands-on projects',
            description:
              'Build real, portfolio-ready projects in every module — not just watch and forget.',
          },
          {
            title: 'Learn on any device',
            description:
              'Stream lessons on web, tablet, or phone and pick up exactly where you left off.',
          },
          {
            title: 'Downloadable resources',
            description:
              'Get source code, cheat sheets, and templates to keep long after the course ends.',
          },
        ]

    const features = baseFeatures.map((f, i) => ({
      ...f,
      icon: ICONS[i % ICONS.length],
    }))

    return (
      <section
        className={cn(
          'relative overflow-hidden bg-muted/40 py-16 text-foreground lg:py-24',
          props.className,
        )}
      >
        <Watermark className="-left-4 bottom-2 font-mono text-[6rem] sm:text-[13rem]">
          INCLUDED
        </Watermark>
        <Container className="relative">
          <div className="mb-10 grid items-end gap-6 lg:mb-12 lg:grid-cols-12">
            <SectionHeading
              align="left"
              title={heading}
              subtitle={subheading}
              className="max-w-2xl gap-0 lg:col-span-8"
              titleClassName="mb-4 text-3xl font-bold tracking-tight sm:text-4xl"
              subtitleClassName="text-base text-muted-foreground"
            />
            <MonoTag tone="faint" className="lg:col-span-4 lg:justify-self-end">
              [ what's included ]
            </MonoTag>
          </div>
          <div className="grid border-l border-t border-border sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => {
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
                  className="relative gap-0 rounded-none border-0 border-b border-r border-border bg-transparent p-6 transition-colors hover:bg-background lg:p-7"
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute right-4 top-3 select-none font-mono text-5xl font-bold leading-none text-foreground/[0.05]"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="flex items-center gap-2 text-primary">
                    <MonoTag tone="primary">
                      inc {String(i + 1).padStart(2, '0')}
                    </MonoTag>
                    {__iv__.icon}
                  </div>
                  <FeatureTitle className="mt-5 text-lg font-semibold tracking-tight">
                    {__iv__.title}
                  </FeatureTitle>
                  <FeatureDescription className="mt-2">
                    {__iv__.description}
                  </FeatureDescription>
                </FeatureCard>
              )
            })}
          </div>
        </Container>
      </section>
    )
  },
})
