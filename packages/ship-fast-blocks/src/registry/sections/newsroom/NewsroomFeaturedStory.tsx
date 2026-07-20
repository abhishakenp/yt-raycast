import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { useSyncPublicationArticles } from '../blog/publication-interactions.tsx'
import { publicationLakebed } from '../blog/publication-lakebed.ts'

import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { Watermark } from '#/section-kit/Decor.tsx'
import {
  FeaturedArticleMedia,
  FeaturedArticleContent,
  FeaturedArticleMeta,
} from '#/section-kit/FeaturedArticle.tsx'
import { StorySection } from '#/section-kit/StorySection.tsx'
import { PullQuoteText } from '#/section-kit/PullQuote.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * NewsroomFeaturedStory — full newsprint "Editor's Pick" long-read band for a
 * digital newsroom or magazine. An asymmetric split on a muted paper wash: a
 * large grayscale, hairline-framed feature photograph with a mono plate caption
 * on one side, and on the other a mono eyebrow, a serif headline, a drop-capped
 * excerpt, a "key points" list set as index-numbered collapsed-border ledger
 * rows, a set-off serif pull-quote over a giant ghost quotation watermark, a
 * mono byline (author • date) and a hard-offset "Continue reading" CTA with
 * press feedback that routes through section-kit route links. Magazine-grade,
 * unhurried, long-form feel with binary square corners. Use to spotlight a
 * featured analysis, cover story or editor-selected long read on news,
 * magazine, blog or publication homepages. Renders fully with no props.
 */
export const NewsroomFeaturedStory = defineCapsule({
  name: 'NewsroomFeaturedStory',
  description:
    "Full newsprint 'Editor's Pick' long-read band for a digital newsroom or magazine: an asymmetric split on a muted paper wash with a large grayscale hairline-framed feature photograph and a mono plate caption on one side and, on the other, a mono eyebrow, a serif headline, a drop-capped excerpt, a 'key points' list set as index-numbered collapsed-border ledger rows, a set-off serif pull-quote over a giant ghost quotation watermark, a mono byline (author • date) and a hard-offset 'Continue reading' CTA with press feedback that routes through section-kit route links. Magazine-grade, unhurried, long-form aesthetic with binary square corners. Use to spotlight a featured analysis, cover story or editor-selected long read on news sites, magazines, blogs or publication homepages.",
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
        className={cn('bg-muted/40 py-20 lg:py-28', props.className)}
      >
        <Container>
          <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-16">
            <FeaturedArticleMedia className="order-2 lg:order-1 lg:col-span-5">
              <figure>
                <Image
                  alt={imageAlt}
                  w={1200}
                  h={900}
                  loading="lazy"
                  className="aspect-[4/3] w-full border border-border object-cover grayscale"
                />
                <figcaption className="mt-3 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  Fig.&nbsp;2 — The port at dusk
                </figcaption>
              </figure>
            </FeaturedArticleMedia>
            <FeaturedArticleContent className="order-1 lg:order-2 lg:col-span-7">
              <SectionHeading
                align="left"
                eyebrow={eyebrow}
                title={headline}
                subtitle={excerpt}
                className="gap-0"
                titleId="newsroom-featured-story-heading"
                eyebrowClassName="mb-4 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-primary"
                titleClassName="mb-5 font-serif text-3xl font-bold leading-tight tracking-tight text-balance text-foreground sm:text-4xl lg:text-5xl"
                subtitleClassName="mb-8 text-lg leading-relaxed text-pretty text-muted-foreground first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:font-serif first-letter:text-5xl first-letter:font-bold first-letter:leading-[0.7] first-letter:text-foreground"
              />
              <ul className="mb-8 border-t border-border">
                {points.map((point, i) => (
                  <li
                    key={point}
                    className="flex gap-4 border-b border-border py-3 leading-relaxed text-foreground"
                  >
                    <span
                      aria-hidden="true"
                      className="shrink-0 font-mono text-[11px] tabular-nums text-primary"
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
              <div className="relative mb-8">
                <Watermark className="-left-2 -top-10 text-[8rem] leading-none">
                  &ldquo;
                </Watermark>
                <PullQuoteText className="relative border-l-2 border-primary pl-5 font-serif text-xl italic leading-relaxed text-foreground">
                  {quote}
                </PullQuoteText>
              </div>
              <FeaturedArticleMeta className="mb-8 font-mono text-[11px] uppercase tracking-[0.14em]">
                <span className="font-medium text-foreground">By {author}</span>
                <span aria-hidden="true">•</span>
                <span>{date}</span>
              </FeaturedArticleMeta>
              <NavbarRouteLink
                className="inline-flex items-center rounded-none bg-foreground px-6 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-background shadow-[5px_5px_0_0] shadow-foreground/20 transition-transform hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                href={cta}
              >
                {cta}
              </NavbarRouteLink>
            </FeaturedArticleContent>
          </div>
        </Container>
      </StorySection>
    )
  },
})
