import { defineCapsule } from '#/capsules/openui.ts'
import type { ReactNode } from 'react'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { Watermark, MonoTag } from '#/section-kit/Decor.tsx'

import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  SplitStory,
  SplitStoryGrid,
  SplitStoryContent,
} from '#/section-kit/SplitStory.tsx'

/**
 * ArchitectureFirmPhilosophy — blueprint approach / philosophy spread for an
 * architecture-studio / design-practice page. Behind a giant ghost "02"
 * numeral: a mono annotation rail ("02 /" + eyebrow + hairline rule) above a
 * huge ultra-thin heading, then an asymmetric 7:5 editorial split. The wide
 * column lists approach points as a hairline-ruled ledger — each row led by a
 * mono "A.01" index and a sharp hairline-framed line icon beside a light
 * title + paragraph. The narrow column carries a grayscale studio/model
 * photograph that regains color on hover inside a hairline frame over an
 * offset outline, a measurement dimension line beneath it, and a sharp
 * ink-bordered "years-of-practice" stat plate — mono caption under a giant
 * thin numeral — overlapping the plate's lower-left corner. Precise,
 * monochrome, drafting-table calm. Tokens-only, no links. Use as a
 * philosophy / approach / values / "how we think" section for architecture
 * firms, design studios, interior designers or any practice that wants to
 * articulate its design principles. Renders fully with no props via three
 * baked-in approach points.
 */
export const ArchitectureFirmPhilosophy = defineCapsule({
  name: 'ArchitectureFirmPhilosophy',
  description:
    'Blueprint approach / philosophy spread for an architecture-studio / design-practice page: behind a giant ghost "02" numeral, a mono annotation rail (index + eyebrow + hairline rule) above a huge ultra-thin heading, then an asymmetric 7:5 split — approach points as a hairline-ruled ledger (each row led by a mono "A.01" index and a sharp hairline-framed line icon beside a light title + paragraph) on the wide side, and a grayscale studio/model photograph that regains color on hover inside a hairline frame over an offset outline, with a measurement dimension line and a sharp ink-bordered years-of-practice stat plate (mono caption under a giant thin numeral) overlapping its lower-left corner on the narrow side. Precise, monochrome, drafting-table calm. Tokens-only, no links. Use as a philosophy / approach / values / "how we think" section for architecture firms, design studios, interior designers or any practice articulating its design principles.',
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
        className="size-4"
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
        className="size-4"
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
        className="size-4"
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
        className={cn(
          'relative overflow-hidden bg-card py-16 sm:py-24 lg:py-28',
          props.className,
        )}
      >
        <Watermark className="-bottom-6 -right-2 text-[8rem] font-extralight sm:text-[13rem] lg:-bottom-14 lg:text-[20rem]">
          02
        </Watermark>
        <Container className="relative">
          {/* Mono annotation rail: section index — eyebrow — hairline rule. */}
          <div className="mb-8 flex items-center gap-4">
            <MonoTag className="shrink-0 text-foreground">02 /</MonoTag>
            <MonoTag className="shrink-0">{eyebrow}</MonoTag>
            <span aria-hidden="true" className="h-px flex-1 bg-border" />
            <MonoTag
              aria-hidden="true"
              className="hidden text-muted-foreground/50 sm:inline"
            >
              Dwg. Series A
            </MonoTag>
          </div>

          <SectionHeading
            align="left"
            title={heading}
            titleId="architecture-firm-philosophy-heading"
            className="mb-12 max-w-3xl gap-0 lg:mb-16"
            titleClassName="text-3xl font-extralight leading-[1.05] tracking-tight text-foreground sm:text-4xl lg:text-5xl"
          />

          <SplitStoryGrid className="items-start gap-12 lg:grid-cols-12 lg:gap-16">
            <SplitStoryContent className="space-y-0 lg:col-span-7">
              <div className="border-t border-border">
                {points.map((point, i) => (
                  <div
                    key={point.title}
                    className="grid grid-cols-[auto_1fr] gap-x-4 border-b border-border py-7 sm:gap-x-6 sm:py-8"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <MonoTag className="text-foreground">
                        A.{String(i + 1).padStart(2, '0')}
                      </MonoTag>
                      <span className="flex size-9 items-center justify-center border border-border text-muted-foreground">
                        {icons[i % icons.length]}
                      </span>
                    </div>
                    <div>
                      <h3 className="mb-2 text-xl font-light tracking-tight text-foreground">
                        {point.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                        {point.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </SplitStoryContent>

            <div className="relative lg:col-span-5">
              <div className="relative">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 translate-x-3 translate-y-3 border border-border"
                />
                <Image
                  alt={imageAlt}
                  w={800}
                  h={1000}
                  loading="lazy"
                  className="relative aspect-[4/5] w-full border border-foreground/30 object-cover grayscale transition-[filter] duration-500 hover:grayscale-0"
                />
                <div className="absolute -bottom-6 -left-2 border border-foreground bg-background px-6 py-5 sm:-left-6">
                  <p className="text-4xl font-extralight tabular-nums tracking-tight text-foreground sm:text-5xl">
                    {statValue}
                  </p>
                  <MonoTag className="mt-2 block">{statLabel}</MonoTag>
                </div>
              </div>
              {/* Measurement dimension line beneath the plate. */}
              <span
                aria-hidden="true"
                className="mt-12 flex items-center gap-2 text-border"
              >
                <span className="h-2.5 w-px bg-current" />
                <span className="h-px flex-1 bg-current" />
                <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Massing study — 1:50
                </span>
                <span className="h-px flex-1 bg-current" />
                <span className="h-2.5 w-px bg-current" />
              </span>
            </div>
          </SplitStoryGrid>
        </Container>
      </SplitStory>
    )
  },
})
