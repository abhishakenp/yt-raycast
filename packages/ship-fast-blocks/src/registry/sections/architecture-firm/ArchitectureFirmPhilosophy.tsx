import { defineCapsule } from '#/capsules/openui.ts'
import type { ReactNode } from 'react'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  SplitStory,
  SplitStoryGrid,
  SplitStoryContent,
} from '#/section-kit/SplitStory.tsx'

/**
 * ArchitectureFirmPhilosophy — split approach / philosophy section for an
 * architecture-studio / design-practice page. On a subtle card surface: a
 * two-column layout with an eyebrow + light heading and a vertical list of
 * approach points (each a round muted icon tile beside a title + paragraph) on
 * one side, and a tall studio/model photograph with a floating
 * "years-of-practice" stat card overlapping its lower-left corner on the other.
 * Calm, editorial, monochrome. Tokens-only, no links. Use as a philosophy /
 * approach / values / "how we think" section for architecture firms, design
 * studios, interior designers or any practice that wants to articulate its
 * design principles. Renders fully with no props via three baked-in approach
 * points.
 */
export const ArchitectureFirmPhilosophy = defineCapsule({
  name: 'ArchitectureFirmPhilosophy',
  description:
    "Split approach / philosophy section for an architecture-studio / design-practice page: on a subtle card surface, a two-column layout with an eyebrow + light heading and a vertical list of approach points (each a round muted icon tile beside a title + paragraph) on one side, and a tall studio/model photograph with a floating 'years-of-practice' stat card overlapping its lower-left corner on the other. Calm, editorial, monochrome. Tokens-only, no links. Use as a philosophy / approach / values / 'how we think' section for architecture firms, design studios, interior designers or any practice articulating its design principles.",
  props: z.object({
    /** Wide letter-spaced eyebrow label. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Approach points: title + description (icons rotate automatically). */
    points: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    /** Alt text driving the studio/model photo. */
    imageAlt: z.string().optional(),
    /** Large value shown in the floating stat card. */
    statValue: z.string().optional(),
    /** Label under the floating stat value. */
    statLabel: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Our Approach'
    const heading =
      props.heading ??
      'Architecture as a conversation between place and purpose'
    const points = props.points?.length
      ? props.points
      : [
          {
            title: 'Contextual Sensitivity',
            description:
              "Every site tells a story. We listen to the landscape, the neighborhood's rhythm, and the existing built environment before drawing a single line. Our buildings respond to their place rather than imposing upon it.",
          },
          {
            title: 'Daylight & Material',
            description:
              'Natural light is our primary material. We choreograph how daylight moves through spaces across seasons, pairing this with honest materials that age gracefully—stone, wood, steel, and glass selected for longevity.',
          },
          {
            title: 'Human-Centered Design',
            description:
              'Buildings exist for people. We design for the subtle rituals of daily life—the quality of morning light in a kitchen, the acoustics of conversation, the threshold between public and private.',
          },
        ]
    const imageAlt =
      props.imageAlt ??
      'Architectural model on work table showing building massing study with natural lighting'
    const statValue = props.statValue ?? '12'
    const statLabel = props.statLabel ?? 'Years of practice'

    // Approach-point icons (decorative; tint via currentColor token).
    const icons: ReactNode[] = [
      // share / network (contextual sensitivity)
      <svg
        key="context"
        className="size-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064"
        />
      </svg>,
      // sun (daylight & material)
      <svg
        key="daylight"
        className="size-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>,
      // heart (human-centered design)
      <svg
        key="human"
        className="size-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>,
    ]

    return (
      <SplitStory
        aria-labelledby="architecture-firm-philosophy-heading"
        className={cn('bg-card py-24 lg:py-28', props.className)}
      >
        <Container>
          <SplitStoryGrid className="gap-16 lg:gap-24">
            <SplitStoryContent className="space-y-0">
              <SectionHeading
                align="left"
                eyebrow={eyebrow}
                title={heading}
                titleId="architecture-firm-philosophy-heading"
                className="mb-8 gap-0"
                eyebrowClassName="mb-4 text-xs uppercase tracking-widest text-muted-foreground"
                titleClassName="text-3xl font-light text-foreground sm:text-4xl"
              />

              <div className="space-y-8">
                {points.map((point, i) => (
                  <div key={point.title} className="flex gap-5">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                      {icons[i % icons.length]}
                    </div>
                    <div>
                      <h3 className="mb-2 text-lg font-medium text-foreground">
                        {point.title}
                      </h3>
                      <p className="leading-relaxed text-muted-foreground">
                        {point.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </SplitStoryContent>

            <div className="relative">
              <Image
                alt={imageAlt}
                w={800}
                h={1000}
                loading="lazy"
                className="h-auto w-full object-cover"
              />
              <div className="absolute -bottom-8 -left-8 hidden bg-background p-6 shadow-lg sm:block">
                <p className="text-3xl font-light text-foreground">
                  {statValue}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {statLabel}
                </p>
              </div>
            </div>
          </SplitStoryGrid>
        </Container>
      </SplitStory>
    )
  },
})
