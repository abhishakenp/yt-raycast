import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { Eyebrow } from '#/section-kit/Eyebrow.tsx'
import { Card } from '#/section-kit/Card.tsx'
import {
  AboutSection,
  AboutGrid,
  AboutContent,
  AboutBody,
} from '#/section-kit/AboutSection.tsx'
import { PullQuoteText } from '#/section-kit/PullQuote.tsx'
import { Container } from '#/section-kit/Container.tsx'

/**
 * AboutStory — magazine-spread "our story" band for a modern company / ABOUT
 * page. A mono metadata rail ("· OUR STORY —— CH. 02") with a hairline rule
 * and chapter index sits above a huge black tight-tracked heading and lead,
 * over a giant faint "02" watermark numeral. Below, an asymmetric 5:7
 * editorial grid: on the left the alt-driven 4:3 photo in a sharp
 * double-framed card tilted -1deg with a primary-tinted offset frame block
 * behind it and a rotated mono "founded" sticker chip (calendar icon, hard
 * primary offset shadow) overlapping its top-right corner; on the right the
 * narrative paragraphs opening with an oversized drop cap, then — under a
 * hairline rule and behind a giant faint serif quotation mark — an oversized
 * italic serif pull-quote that stretches wider than the text column on
 * desktop. Tokens-only, no links. Use for an about page's origin story /
 * company history / mission narrative paired with a team or office photo.
 * Renders fully with no props via baked-in "Kinetic Labs" defaults.
 */
export const AboutStory = defineCapsule({
  name: 'AboutStory',
  description:
    "Magazine-spread 'our story' band for a modern company / ABOUT page: a mono metadata rail with hairline rule and 'CH. 02' chapter index above a huge black tight-tracked heading and lead, over a giant faint '02' watermark numeral; then an asymmetric 5:7 editorial grid with the alt-driven 4:3 photo in a sharp -1deg-tilted double-framed card (primary-tinted offset frame behind, rotated mono 'founded' sticker chip with calendar icon and hard primary offset shadow overlapping its corner) on the left, and narrative paragraphs opening with an oversized drop cap plus an oversized italic serif pull-quote behind a giant faint quotation mark stretching wider than the text column on the right. Tokens-only, no links. Use for an about page's origin story / company history / mission narrative paired with a team or office photo.",
  props: z.object({
    /** Eyebrow pill text above the heading. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Alt text driving the story photo. */
    imageAlt: z.string().optional(),
    /** Small badge over the photo, e.g. "Founded in 2016". */
    badge: z.string().optional(),
    /** Narrative paragraphs on the right. */
    paragraphs: z.array(z.string()).optional(),
    /** Pull-quote shown beneath the narrative. */
    quote: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Our Story'
    const heading =
      props.heading ?? 'From a garage experiment to a global studio'
    const description =
      props.description ??
      'What started as late-night prototypes turned into a team obsessed with one question: how do we make software feel effortless?'
    const imageAlt =
      props.imageAlt ??
      'Team collaborating at a long table in a bright modern office'
    const badge = props.badge ?? 'Founded in 2016'
    const paragraphs = props.paragraphs?.length
      ? props.paragraphs
      : [
          "In 2016, we were three designers and engineers shipping side projects out of a small garage in Portland. We didn't have a playbook—just a shared belief that great products are built at the intersection of deep user empathy and technical excellence.",
          "Today, Kinetic Labs is a distributed team of strategists, designers, and engineers across 12 time zones. We've shipped products used by millions, but our process remains the same: start with people, iterate with data, and polish until it feels inevitable.",
        ]
    const quote = props.quote ?? "We don't chase trends. We chase outcomes."

    const SmallIcon = ({ children }: { children?: React.ReactNode }) => (
      <svg
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {children}
      </svg>
    )

    return (
      <AboutSection
        className={cn(
          // Subtle tonal band with a slanted top edge — the story chapter cuts
          // in on a diagonal seam (clip-path is neighbor-independent).
          'relative overflow-hidden bg-muted/40 py-16 pt-24 [clip-path:polygon(0_2.5rem,100%_0,100%_100%,0_100%)] sm:py-24 sm:pt-32 lg:py-32 lg:pt-40',
          props.className,
        )}
      >
        {/* Giant faint chapter watermark, continuing the hero's "01" grammar. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
        >
          <span className="absolute -bottom-10 -left-4 select-none font-extrabold leading-none tracking-tighter text-foreground/[0.04] text-[10rem] sm:text-[14rem] lg:text-[18rem]">
            02
          </span>
        </div>

        <Container size="lg" className="relative px-6 sm:px-8 lg:px-12">
          {/* Mono metadata rail: eyebrow label — hairline rule — chapter index. */}
          <div className="flex items-center gap-4">
            <Eyebrow
              variant="text"
              icon={
                <span
                  aria-hidden="true"
                  className="size-1.5 shrink-0 bg-primary"
                />
              }
              className="rounded-none font-mono text-[11px] font-normal tracking-[0.3em] text-muted-foreground"
            >
              {eyebrow}
            </Eyebrow>
            <span aria-hidden="true" className="h-px flex-1 bg-border" />
            <span
              aria-hidden="true"
              className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground"
            >
              Ch. 02
            </span>
          </div>

          <div className="mt-8 max-w-3xl">
            <h2 className="text-4xl font-extrabold leading-[0.95] tracking-tighter text-foreground sm:text-5xl lg:text-6xl">
              {heading}
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>

          <AboutGrid className="mt-10 items-start gap-12 sm:mt-14 md:grid-cols-12 md:gap-10 lg:mt-16 lg:grid-cols-12 lg:gap-12">
            {/* Tilted photo plate with offset frame + rotated sticker chip. */}
            <div className="relative -mx-1 -rotate-1 sm:mx-0 md:col-span-5">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 translate-x-3 translate-y-3 border-2 border-primary/30 bg-primary/5"
              />
              <Card
                variant="muted"
                className="relative overflow-hidden rounded-none border-2 border-foreground/20 p-0 shadow-none"
              >
                <Image
                  alt={imageAlt}
                  w={1200}
                  h={760}
                  loading="lazy"
                  className="aspect-[4/3] size-full object-cover"
                />
              </Card>
              <span className="absolute -right-3 -top-4 inline-flex rotate-2 items-center gap-2 rounded-none border-2 border-foreground bg-background px-3.5 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground shadow-[4px_4px_0_0] shadow-primary/30">
                <SmallIcon>
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </SmallIcon>
                {badge}
              </span>
            </div>

            <AboutContent className="space-y-0 md:col-span-7">
              <AboutBody className="space-y-0">
                {paragraphs.map((para, i) => (
                  <p
                    key={i}
                    className={cn(
                      'leading-relaxed text-muted-foreground',
                      i === 0 &&
                        'first-letter:float-left first-letter:mr-3 first-letter:text-6xl first-letter:font-extrabold first-letter:leading-[0.8] first-letter:tracking-tight first-letter:text-foreground',
                      i > 0 && 'mt-5',
                    )}
                  >
                    {para}
                  </p>
                ))}
              </AboutBody>
              {/* Oversized serif pull-quote, breaking wider than the text column. */}
              <div className="relative mt-8 border-t border-border pt-8 sm:mt-10 sm:pt-10 lg:-ml-24">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-3 left-0 select-none font-serif text-[8rem] leading-none text-primary/10"
                >
                  &ldquo;
                </span>
                <PullQuoteText className="relative block font-serif text-3xl font-medium italic leading-[1.15] tracking-tight text-foreground sm:text-4xl">
                  &ldquo;{quote}&rdquo;
                </PullQuoteText>
              </div>
            </AboutContent>
          </AboutGrid>
        </Container>
      </AboutSection>
    )
  },
})
