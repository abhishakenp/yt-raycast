import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { Eyebrow } from '#/section-kit/Eyebrow.tsx'
import { Card } from '#/section-kit/Card.tsx'
import {
  SplitStory,
  SplitStoryGrid,
  SplitStoryContent,
  SplitStoryBody,
} from '#/section-kit/SplitStory.tsx'
import { PullQuoteText } from '#/section-kit/PullQuote.tsx'
import { Container } from '#/section-kit/Container.tsx'

/**
 * AboutStory — "our story" split band for a modern company / ABOUT page. A
 * left-aligned eyebrow pill + heading + lead above a two-column layout: on the
 * left an alt-driven 4:3 photo wrapped in a soft-shadowed token card with a
 * floating "founded" badge pill (calendar icon) over its bottom-left corner; on
 * the right one or more narrative paragraphs followed by an indigo-accented
 * pull-quote in a left-bordered tinted blockquote. Tokens-only, no links. Use
 * for an about page's origin story / company history / mission narrative paired
 * with a team or office photo. Renders fully with no props via baked-in
 * "Kinetic Labs" defaults.
 */
export const AboutStory = defineCapsule({
  name: 'AboutStory',
  description:
    "'Our story' split band for a modern company / ABOUT page: a left-aligned eyebrow pill + heading + lead above a two-column layout with an alt-driven 4:3 photo in a soft-shadowed token card and a floating 'founded' badge pill (calendar icon) on the left, and one or more narrative paragraphs plus an indigo-accented left-bordered pull-quote on the right. Tokens-only, no links. Use for an about page's origin story / company history / mission narrative paired with a team or office photo.",
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
        width="14"
        height="14"
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
      <SplitStory className={cn('py-16 sm:py-20 lg:py-24', props.className)}>
        <Container size="lg" className="px-6 sm:px-8 lg:px-12">
          <div className="mb-10 max-w-2xl">
            <Eyebrow
              variant="primary"
              icon={
                <SmallIcon>
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </SmallIcon>
              }
            >
              {eyebrow}
            </Eyebrow>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              {heading}
            </h2>
            <p className="mt-2.5 text-lg leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>
          <SplitStoryGrid className="items-center gap-10">
            <Card
              variant="muted"
              className="relative overflow-hidden shadow-[0_20px_50px_rgba(15,23,42,0.12)] rounded-2xl p-0"
            >
              <Image
                alt={imageAlt}
                w={1200}
                h={760}
                loading="lazy"
                className="aspect-[4/3] size-full object-cover"
              />
              <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-lg border border-border/50 bg-background/90 px-3.5 py-2.5 text-sm font-bold text-foreground shadow-sm backdrop-blur">
                <SmallIcon>
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </SmallIcon>
                {badge}
              </span>
            </Card>
            <SplitStoryContent className="space-y-0">
              <SplitStoryBody className="space-y-0">
                {paragraphs.map((para, i) => (
                  <p
                    key={i}
                    className={cn(
                      'leading-relaxed text-muted-foreground',
                      i > 0 && 'mt-4',
                    )}
                  >
                    {para}
                  </p>
                ))}
              </SplitStoryBody>
              <PullQuoteText className="mt-5 block rounded-r-xl border-l-[3px] border-primary bg-primary/[0.06] px-4 py-4 font-semibold text-foreground">
                &ldquo;{quote}&rdquo;
              </PullQuoteText>
            </SplitStoryContent>
          </SplitStoryGrid>
        </Container>
      </SplitStory>
    )
  },
})
