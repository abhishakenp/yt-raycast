import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { useSyncPublicationArticles } from '../blog/publication-interactions.tsx'
import { publicationLakebed } from '../blog/publication-lakebed.ts'

import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  FeaturedArticleMedia,
  FeaturedArticleContent,
  FeaturedArticleMeta,
} from '#/section-kit/FeaturedArticle.tsx'
import { StorySection } from '#/section-kit/StorySection.tsx'
import { PullQuoteText } from '#/section-kit/PullQuote.tsx'

/**
 * NewsroomFeaturedStory — editorial "Editor's Pick" featured long-read band for
 * a digital newsroom or magazine. A two-column split: a large feature
 * photograph on one side, and on the other a wide letter-spaced eyebrow
 * ("EDITOR'S PICK"), a serif headline, a two-to-three sentence excerpt, a short
 * bulleted "key points" list, a set-off pull-quote, a byline (author • date)
 * and a "Continue reading" CTA that routes through useNavigate. Magazine-grade,
 * unhurried, long-form feel. Use to spotlight a featured analysis, cover story
 * or editor-selected long read on news, magazine, blog or publication
 * homepages. Renders fully with no props.
 */
export const NewsroomFeaturedStory = defineCapsule({
  name: 'NewsroomFeaturedStory',
  description:
    "Editorial 'Editor's Pick' featured long-read band for a digital newsroom or magazine: a two-column split with a large feature photograph on one side and, on the other, a wide letter-spaced eyebrow label, a serif headline, a two-to-three sentence excerpt, a short bulleted 'key points' list, a set-off pull-quote, a byline (author • date) and a 'Continue reading' CTA that routes through useNavigate. Magazine-grade, unhurried, long-form aesthetic. Use to spotlight a featured analysis, cover story or editor-selected long read on news sites, magazines, blogs or publication homepages.",
  props: z.object({
    /** Wide letter-spaced eyebrow label above the headline. */
    eyebrow: z.string().optional(),
    /** Serif headline of the featured story. */
    headline: z.string().optional(),
    /** Two-to-three sentence excerpt under the headline. */
    excerpt: z.string().optional(),
    /** Short bulleted "key points" list. */
    points: z.array(z.string()).optional(),
    /** Set-off pull-quote from the story. */
    quote: z.string().optional(),
    /** Byline author name. */
    author: z.string().optional(),
    /** Publication date string. */
    date: z.string().optional(),
    /** Alt text driving the feature photograph. */
    imageAlt: z.string().optional(),
    /** Continue-reading CTA label. */
    cta: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: publicationLakebed,
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const eyebrow = props.eyebrow ?? "EDITOR'S PICK"
    const headline =
      props.headline ?? 'The Quiet Reordering of the Global Supply Chain'
    const excerpt =
      props.excerpt ??
      "For two decades, manufacturers chased the lowest possible cost across a single, sprawling network. A pandemic, a war and a wave of tariffs have rewritten that logic. This is the story of how the world's factories are being redrawn, region by region."
    const points = props.points?.length
      ? props.points
      : [
          'Nearshoring has doubled in three of the four largest manufacturing hubs since 2021.',
          "Inventory buffers are up 18% on average as 'just-in-time' gives way to 'just-in-case'.",
          'Smaller suppliers, long squeezed out, are quietly winning back regional contracts.',
        ]
    const quote =
      props.quote ??
      'We stopped optimizing for the cheapest mile and started optimizing for the mile we can count on.'
    const author = props.author ?? 'Mara Delacroix'
    const date = props.date ?? 'June 18, 2026'
    const imageAlt =
      props.imageAlt ??
      'Aerial view of a busy container port at dusk with cranes and stacked shipping containers'
    const cta = props.cta ?? 'Continue reading'
    useSyncPublicationArticles(lakebed, [
      {
        author,
        category: eyebrow,
        date,
        excerpt,
        target: cta,
        title: headline,
      },
    ])

    return (
      <StorySection
        aria-labelledby="newsroom-featured-story-heading"
        className={cn('bg-background py-20 lg:py-28', props.className)}
      >
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <FeaturedArticleMedia className="order-2 lg:order-1">
              <Image
                alt={imageAlt}
                w={1200}
                h={900}
                loading="lazy"
                className="aspect-[4/3] w-full rounded-lg object-cover"
              />
            </FeaturedArticleMedia>
            <FeaturedArticleContent className="order-1 lg:order-2">
              <SectionHeading
                align="left"
                eyebrow={eyebrow}
                title={headline}
                subtitle={excerpt}
                className="gap-0"
                titleId="newsroom-featured-story-heading"
                eyebrowClassName="mb-4 text-xs font-semibold uppercase tracking-widest text-accent"
                titleClassName="mb-5 font-serif text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl"
                subtitleClassName="mb-6 text-lg leading-relaxed text-muted-foreground"
              />
              <ul className="mb-8 space-y-2">
                {points.map((point) => (
                  <li
                    key={point}
                    className="flex gap-3 leading-relaxed text-foreground"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-2.5 size-1.5 shrink-0 rounded-full bg-primary"
                    />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
              <PullQuoteText className="mb-8 border-l-2 border-border pl-5 font-serif text-xl italic leading-relaxed">
                “{quote}”
              </PullQuoteText>
              <FeaturedArticleMeta className="mb-8">
                <span className="font-medium text-foreground">{author}</span>
                <span aria-hidden="true">•</span>
                <span>{date}</span>
              </FeaturedArticleMeta>
              <button
                type="button"
                onClick={() => go(cta)}
                className="inline-flex items-center bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {cta}
              </button>
            </FeaturedArticleContent>
          </div>
        </Container>
      </StorySection>
    )
  },
})
