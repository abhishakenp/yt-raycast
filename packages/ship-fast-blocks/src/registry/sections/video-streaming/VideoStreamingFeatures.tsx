import { defineCapsule } from '#/capsules/openui.ts'
import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
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
 * VideoStreamingFeatures — a 4-column feature grid for a video-streaming
 * landing page. Thin configuration over the shared `FeatureGrid` composite: a
 * centered heading + subheading above a responsive grid of feature cards, each
 * pairing an inline stroke-SVG glyph (cycled per index) with a bold title and a
 * muted blurb. Use to spell out the streaming value props — 4K Ultra HD,
 * offline downloads, watch on any device, zero ads, Dolby Atmos, profiles —
 * beneath a streaming hero. Renders fully with no props via baked-in defaults.
 */
const ICONS: ReactNode[] = [
  // 4K / monitor
  <>
    <rect x="2" y="4" width="20" height="14" rx="2" />
    <path d="M8 21h8M12 18v3" />
  </>,
  // downloads / arrow into tray
  <>
    <path d="M12 3v12M7 10l5 5 5-5" />
    <path d="M5 21h14" />
  </>,
  // any device / phone + tablet
  <>
    <rect x="3" y="4" width="12" height="16" rx="2" />
    <path d="M17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-3" />
  </>,
  // zero ads / shield-off
  <>
    <path d="M12 2l8 4v6c0 5-3.4 7.7-8 10-4.6-2.3-8-5-8-10V6l8-4Z" />
    <path d="M4.5 4.5l15 15" />
  </>,
  // dolby / sound waves
  <>
    <path d="M3 10v4M7 7v10M12 4v16M17 7v10M21 10v4" />
  </>,
  // profiles / users
  <>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
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

export const VideoStreamingFeatures = defineCapsule({
  name: 'VideoStreamingFeatures',
  description:
    'A 4-column feature grid for a video-streaming landing page built on the shared FeatureGrid composite: a centered heading + subheading above a responsive grid of feature cards, each pairing an inline stroke-SVG glyph (cycled per index) with a bold title and a muted blurb. Use to spell out streaming value props — 4K Ultra HD, offline downloads, watch on any device, zero ads, Dolby Atmos, profiles — beneath a streaming hero.',
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
    const heading = props.heading ?? "Everything you'd expect — and more"
    const subheading =
      props.subheading ??
      'One subscription, every screen, zero compromises. Stream in stunning quality, take it offline, and never sit through an ad.'
    const features = props.features?.length
      ? props.features
      : [
          {
            title: '4K Ultra HD',
            description:
              'Watch in crisp 4K with HDR on supported titles — every frame mastered to look exactly as the creators intended.',
          },
          {
            title: 'Offline Downloads',
            description:
              'Save shows and movies to any device and watch on the plane, the subway, or anywhere the signal drops.',
          },
          {
            title: 'Watch on Any Device',
            description:
              'Pick up right where you left off across phone, tablet, laptop, and smart TV — your place follows you everywhere.',
          },
          {
            title: 'Zero Ads',
            description:
              'No interruptions, ever. Press play and stay in the story from the opening scene to the final credits.',
          },
          {
            title: 'Dolby Atmos Sound',
            description:
              'Immersive, theater-grade audio that moves around you for the moments that deserve to be heard, not just watched.',
          },
          {
            title: 'Up to 5 Profiles',
            description:
              'Give everyone their own space with personalized recommendations, watchlists, and a dedicated Kids mode.',
          },
        ]

    return (
      <section
        className={cn(
          'bg-background pt-28 pb-20 lg:pt-32 lg:pb-28',
          props.className,
        )}
      >
        <Container>
          <FeatureGrid heading={heading} subheading={subheading} columns={4}>
            {features
              .map((f, i) => ({
                title: f.title,
                description: f.description,
                icon: <FeatureIcon glyph={ICONS[i % ICONS.length]} />,
              }))
              .map((f) => {
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
                    {__iv__.icon && (
                      <KitFeatureIcon>{__iv__.icon}</KitFeatureIcon>
                    )}
                    <FeatureTitle>{__iv__.title}</FeatureTitle>
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
