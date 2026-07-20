import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  AboutSection,
  AboutGrid,
  AboutContent,
  AboutBody,
} from '#/section-kit/AboutSection.tsx'
import { Container } from '#/section-kit/Container.tsx'

/**
 * IllustratorAbout — a split bio band for an illustrator / visual-artist
 * portfolio on a paper-wash muted surface. Left (5 cols): a tall 3:4 portrait
 * pinned in a hand-drawn dashed frame over an offset paper frame, with a rotated
 * taped years-of-experience label. Right (7 cols): a mono index micro-label,
 * serif heading, a stack of bio paragraphs, and a dashed-ruled recognition
 * ledger whose rows carry mono index numerals. Use to tell the artist's personal
 * story and surface awards. Renders fully with no props via baked-in "Mira"
 * defaults.
 */
export const IllustratorAbout = defineCapsule({
  name: 'IllustratorAbout',
  description:
    "Split bio band for an illustrator / visual-artist portfolio on a paper-wash muted surface: left a tall 3:4 portrait pinned in a hand-drawn dashed frame over an offset paper frame with a rotated taped years-of-experience label; right a mono index micro-label, serif heading, a stack of bio paragraphs, and a dashed-ruled recognition ledger whose rows carry mono index numerals. Use to tell the artist's personal story and surface awards and honors.",
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
      <AboutSection
        className={cn(
          'bg-muted/30 px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-28',
          props.className,
        )}
      >
        <Container size="xl">
          <AboutGrid className="items-start lg:grid-cols-12">
            <div className="relative lg:col-span-5">
              <div
                aria-hidden="true"
                className="absolute inset-0 translate-x-3 translate-y-3 rounded-none border-2 border-dashed border-border"
              />
              <div className="relative aspect-[3/4] overflow-hidden rounded-none border-2 border-foreground">
                <Image
                  alt={imageAlt}
                  w={700}
                  h={933}
                  loading="lazy"
                  className="size-full object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 hidden max-w-xs -rotate-3 rounded-none border-2 border-dashed border-foreground bg-background p-6 shadow-[5px_5px_0_0_var(--color-foreground)] sm:block">
                <p className="mb-1 font-serif text-3xl tabular-nums text-foreground">
                  {badgeValue}
                </p>
                <p className="text-sm text-muted-foreground">{badgeLabel}</p>
              </div>
            </div>
            <AboutContent className="space-y-0 lg:col-span-7">
              <SectionHeading
                eyebrow={eyebrow}
                title={heading}
                align="left"
                eyebrowClassName="font-mono text-[11px] uppercase tracking-[0.2em] text-primary"
                titleClassName="font-serif text-3xl sm:text-4xl lg:text-5xl"
                className="mb-6 gap-3"
              />
              <AboutBody className="space-y-4 leading-relaxed text-muted-foreground">
                {paragraphs.map((para) => (
                  <p key={para.slice(0, 24)}>{para}</p>
                ))}
              </AboutBody>
              <div className="mt-8 border-t-2 border-dashed border-border pt-8">
                <h3 className="mb-4 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  <span aria-hidden="true" className="text-primary">
                    *
                  </span>
                  {recognitionHeading}
                </h3>
                <ul className="divide-y divide-dashed divide-border border-y border-dashed border-border">
                  {recognition.map((item, i) => (
                    <li
                      key={item}
                      className="flex items-baseline gap-4 py-3 text-sm text-muted-foreground"
                    >
                      <span
                        aria-hidden="true"
                        className="font-mono text-xs tabular-nums text-primary"
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </AboutContent>
          </AboutGrid>
        </Container>
      </AboutSection>
    )
  },
})
