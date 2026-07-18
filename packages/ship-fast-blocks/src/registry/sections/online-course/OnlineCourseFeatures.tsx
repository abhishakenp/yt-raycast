import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import type { ReactNode } from 'react'

import { cn } from '#/lib/utils.ts'
import {
  FeatureGrid,
  FeatureCard,
  FeatureIcon,
  FeatureTitle,
  FeatureDescription,
} from '#/section-kit/FeatureGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'

const iconClass = 'size-5'
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
 * OnlineCourseFeatures — a "what's included" benefits band for an online-course
 * page. Thin configuration over the shared FeatureGrid composite: a heading
 * over a four-column grid of benefit cards (lifetime access, certificate of
 * completion, community access, hands-on projects, mobile learning, and
 * downloadable resources), each with a small line icon, a title, and a one-line
 * description. Use to summarize the concrete perks of enrolling on an
 * e-learning, bootcamp, or academy landing page. Renders fully with no props.
 */
export const OnlineCourseFeatures = defineCapsule({
  name: 'OnlineCourseFeatures',
  description:
    "A 'what's included' benefits band for an online-course page built on the shared FeatureGrid composite: a heading over a four-column grid of benefit cards (lifetime access, certificate of completion, community access, hands-on projects, mobile learning, downloadable resources), each with a small line icon, a title, and a one-line description. Use to summarize the perks of enrolling on an e-learning, bootcamp, or academy landing page.",
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
          'bg-muted py-20 text-foreground lg:py-28',
          props.className,
        )}
      >
        <Container size="lg" className="px-6 lg:px-6">
          <FeatureGrid heading={heading} subheading={subheading} columns={4}>
            {features.map((f) => {
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
                <FeatureCard key={__iv__.title}>
                  {__iv__.icon && <FeatureIcon>{__iv__.icon}</FeatureIcon>}
                  <FeatureTitle>{__iv__.title}</FeatureTitle>
                  <FeatureDescription>{__iv__.description}</FeatureDescription>
                </FeatureCard>
              )
            })}
          </FeatureGrid>
        </Container>
      </section>
    )
  },
})
