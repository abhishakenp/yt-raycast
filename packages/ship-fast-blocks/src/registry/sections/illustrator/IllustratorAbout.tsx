import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  SplitStory,
  SplitStoryGrid,
  SplitStoryContent,
  SplitStoryBody,
} from '#/section-kit/SplitStory.tsx'
import { Container } from '#/section-kit/Container.tsx'

/**
 * IllustratorAbout — a split about / bio band for an illustrator / visual-artist
 * portfolio on a subtle muted band. Left: a tall 3:4 portrait photo with a
 * floating years-of-experience stat badge card anchored to the bottom-right.
 * Right: an uppercase accent eyebrow, serif heading, a stack of bio paragraphs,
 * and a bordered recognition / awards list with accent arrow bullets. Use to
 * tell the artist's personal story and surface awards. Renders fully with no
 * props via baked-in "Mira" defaults.
 */
export const IllustratorAbout = defineCapsule({
  name: 'IllustratorAbout',
  description:
    "Split about / bio band for an illustrator / visual-artist portfolio on a subtle muted band: left a tall 3:4 portrait photo with a floating years-of-experience stat badge card anchored bottom-right; right an uppercase accent eyebrow, serif heading, a stack of bio paragraphs, and a bordered recognition / awards list with accent arrow bullets. Use to tell the artist's personal story and surface awards and honors.",
  props: z.object({
    /** Uppercase accent eyebrow label. */
    eyebrow: z.string().optional(),
    /** Serif section heading. */
    heading: z.string().optional(),
    /** Alt text driving the portrait photo. */
    imageAlt: z.string().optional(),
    /** Big number on the floating stat badge. */
    badgeValue: z.string().optional(),
    /** Caption beneath the badge value. */
    badgeLabel: z.string().optional(),
    /** Bio paragraphs. */
    paragraphs: z.array(z.string()).optional(),
    /** Recognition list heading. */
    recognitionHeading: z.string().optional(),
    /** Recognition / awards line items. */
    recognition: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'About Me'
    const heading = props.heading ?? "Hi, I'm Mira"
    const imageAlt =
      props.imageAlt ??
      'Portrait of Mira Chen, illustrator, holding a paintbrush in her sunlit studio surrounded by artwork'
    const badgeValue = props.badgeValue ?? '8+'
    const badgeLabel =
      props.badgeLabel ??
      'Years creating illustrations for beloved brands and books'
    const paragraphs = props.paragraphs?.length
      ? props.paragraphs
      : [
          'I grew up between Taipei and Portland, collecting visual inspiration from bustling night markets and misty Pacific Northwest forests. After studying illustration at Rhode Island School of Design, I spent three years in New York working with publishers before returning to Oregon to build my independent studio.',
          "My work blends traditional watercolor techniques with digital refinement, creating illustrations that feel both hand-crafted and contemporary. I'm drawn to themes of nature, childhood wonder, and quiet everyday moments that deserve celebration.",
          "When I'm not illustrating, you'll find me tending to my herb garden, browsing local bookstores, or hiking the Columbia River Gorge with my rescue mutt, Basil.",
        ]
    const recognitionHeading = props.recognitionHeading ?? 'Recognition'
    const recognition = props.recognition?.length
      ? props.recognition
      : [
          'Society of Illustrators Gold Medal, 2023',
          'Communication Arts Illustration Award, 2022',
          "New York Times Best Illustrated Children's Books, 2021",
        ]

    return (
      <SplitStory
        className={cn(
          'bg-muted/50 px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-28',
          props.className,
        )}
      >
        <Container size="xl">
          <SplitStoryGrid>
            <div className="relative">
              <div className="aspect-[3/4] overflow-hidden rounded-xl">
                <Image
                  alt={imageAlt}
                  w={700}
                  h={933}
                  loading="lazy"
                  className="size-full object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 hidden max-w-xs rounded-lg bg-card p-6 shadow-lg sm:block">
                <p className="mb-1 font-serif text-2xl text-card-foreground">
                  {badgeValue}
                </p>
                <p className="text-sm text-muted-foreground">{badgeLabel}</p>
              </div>
            </div>
            <SplitStoryContent className="space-y-0">
              <SectionHeading
                eyebrow={eyebrow}
                title={heading}
                align="left"
                eyebrowClassName="text-chart-1 tracking-wider"
                titleClassName="font-serif text-3xl sm:text-4xl lg:text-5xl"
                className="mb-6 gap-4"
              />
              <SplitStoryBody className="space-y-4 leading-relaxed text-muted-foreground">
                {paragraphs.map((para) => (
                  <p key={para.slice(0, 24)}>{para}</p>
                ))}
              </SplitStoryBody>
              <div className="mt-8 border-t border-border/60 pt-8">
                <h3 className="mb-4 font-serif text-lg">
                  {recognitionHeading}
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {recognition.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="text-chart-2">&rarr;</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </SplitStoryContent>
          </SplitStoryGrid>
        </Container>
      </SplitStory>
    )
  },
})
