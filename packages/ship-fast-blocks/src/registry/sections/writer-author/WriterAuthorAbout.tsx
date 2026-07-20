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
import { Watermark, MonoTag } from '#/section-kit/Decor.tsx'

/**
 * WriterAuthorAbout — literary-editorial "About the author" band. A mono
 * manuscript rail ("· ABOUT THE AUTHOR —— BIO") sits above a huge faint ghost
 * initial watermark; below, an asymmetric 5/7 book-spread grid pairs a black-
 * and-white portrait in a sharp -1deg-tilted double-framed plate (hairline
 * offset frame behind, a rotated mono "novelist" chip on a hard offset shadow
 * overlapping its corner) on the left with a left-aligned SectionHeading and a
 * stack of generous serif prose paragraphs — the first opening with an
 * oversized serif drop-cap initial — on the right. Columns stack on small
 * screens and sit side by side on large ones. Designed for novelists,
 * essayists, and memoirists who want a calm, reading biography section.
 * Renders fully with no props via baked-in copy for the novelist Eleanor Vance.
 */
export const WriterAuthorAbout = defineCapsule({
  name: 'WriterAuthorAbout',
  description:
    "A literary-editorial 'About the author' band for a novelist website: a mono manuscript rail with a hairline rule and 'BIO' index above a huge faint ghost initial watermark, then an asymmetric 5/7 book-spread grid pairing a black-and-white author portrait in a sharp -1deg-tilted double-framed plate (hairline offset frame behind, a rotated mono 'novelist' chip on a hard offset shadow overlapping its corner) on the left with a left-aligned SectionHeading (uppercase 'About' eyebrow over a serif title) and a stack of generous serif prose paragraphs — the first opening with an oversized serif drop-cap initial — on the right. Columns stack on small screens and sit side by side on large screens. Built for novelists, essayists, and memoirists who want a calm, reading biography section. Renders fully with no props via baked-in copy for the novelist Eleanor Vance.",
  props: z.object({
    /** Uppercase eyebrow above the title. */
    eyebrow: z.string().optional(),
    /** Serif title in the heading block. */
    heading: z.string().optional(),
    /** Biography paragraphs rendered as serif prose. */
    paragraphs: z.array(z.string()).optional(),
    /** Alt text driving the portrait image. */
    portraitAlt: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'On writing and a life of letters'
    const paragraphs = props.paragraphs ?? [
      'Eleanor Vance is a novelist whose work moves quietly between coastlines, old houses, and the unspoken histories that bind families together. Over the past decade she has published five novels, each preoccupied with memory, inheritance, and the small acts of tenderness that survive long silences.',
      'Born in a fishing town on the northern coast, she trained as a cartographer before turning to fiction, and the discipline of mapping still shapes her prose: precise, patient, and attentive to the contours of a place. Her novels have been translated into a dozen languages and shortlisted for several international literary prizes.',
      "She writes from a converted lighthouse keeper's cottage, where the same grey light that fills her stories spills across her desk each morning. When she is not writing, she teaches, walks the cliffs, and answers far too few of the letters readers send her.",
    ]
    const initial = heading.trim().charAt(0) || 'A'

    return (
      <AboutSection
        className={cn(
          'relative overflow-hidden bg-background pt-28 pb-20 sm:pt-32 sm:pb-24',
          props.className,
        )}
      >
        <Watermark className="-bottom-16 -left-6 font-serif text-[14rem] leading-none sm:text-[20rem] lg:text-[26rem]">
          {initial}
        </Watermark>

        <Container size="xl" className="relative px-6 lg:px-6">
          <div className="flex items-center gap-4">
            <MonoTag tone="primary">
              {props.eyebrow ?? 'About'} the author
            </MonoTag>
            <span aria-hidden="true" className="h-px flex-1 bg-border" />
            <MonoTag aria-hidden="true" tone="faint">
              Bio
            </MonoTag>
          </div>

          <AboutGrid className="mt-12 items-start gap-12 md:grid-cols-12 lg:grid-cols-12 lg:gap-16">
            <div className="relative -rotate-1 md:col-span-5">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 translate-x-3 translate-y-3 border-2 border-primary/25"
              />
              <Image
                alt={props.portraitAlt ?? 'author portrait black and white'}
                w={640}
                h={800}
                className="relative w-full rounded-none border-2 border-foreground/20 object-cover grayscale"
              />
              <span
                aria-hidden="true"
                className="absolute -right-3 -top-4 rotate-2 border-2 border-foreground bg-background px-3.5 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground shadow-[4px_4px_0_0] shadow-primary/30"
              >
                Novelist
              </span>
            </div>

            <AboutContent className="space-y-0 md:col-span-7">
              <SectionHeading
                align="left"
                eyebrow={props.eyebrow ?? 'About'}
                title={heading}
                eyebrowClassName="tracking-[0.2em]"
                titleClassName="font-serif text-3xl font-normal tracking-tight sm:text-4xl lg:text-5xl"
              />
              <AboutBody className="mt-8 space-y-5 font-serif text-lg leading-relaxed text-muted-foreground sm:columns-2 sm:gap-10 sm:space-y-0 [&>p]:break-inside-avoid sm:[&>p+p]:mt-5">
                {paragraphs.map((paragraph, i) => (
                  <p
                    key={i}
                    className={cn(
                      i === 0 &&
                        'first-letter:float-left first-letter:mr-3 first-letter:font-serif first-letter:text-6xl first-letter:font-medium first-letter:leading-[0.72] first-letter:text-foreground',
                    )}
                  >
                    {paragraph}
                  </p>
                ))}
              </AboutBody>
            </AboutContent>
          </AboutGrid>
        </Container>
      </AboutSection>
    )
  },
})
