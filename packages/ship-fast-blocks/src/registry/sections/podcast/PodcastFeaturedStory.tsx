import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  FeaturedArticle,
  FeaturedArticleMedia,
  FeaturedArticleContent,
  FeaturedArticleMeta,
} from '#/section-kit/FeaturedArticle.tsx'
import { Card } from '#/section-kit/Card.tsx'
import { Container } from '#/section-kit/Container.tsx'

const PodcastFeaturedStoryProps = z.object({
  eyebrow: z.string().optional().describe('Section eyebrow above the heading'),
  heading: z.string().optional().describe('Section title under the eyebrow'),
  episodeLabel: z
    .string()
    .optional()
    .describe('Accent episode label, e.g. Episode 42'),
  title: z.string().optional().describe('Episode title'),
  duration: z.string().optional().describe('Episode duration, e.g. 48 min'),
  date: z.string().optional().describe('Publish date'),
  showNotes: z.string().optional().describe('Short show-notes paragraph'),
  ctaLabel: z.string().optional().describe('Play button label'),
  ctaTarget: z.string().optional().describe('Play button route label'),
  imageAlt: z.string().optional().describe('Episode image search query'),
  className: z.string().optional(),
})

export const PodcastFeaturedStory = defineCapsule({
  name: 'PodcastFeaturedStory',
  description:
    'A latest-episode feature section that spotlights one podcast episode inside a prominent two-column card. The left side shows a warm studio cover image while the right side stacks an episode-number eyebrow, a bold title, a duration and publish-date meta row, short show notes, and a rounded Play episode button. Best used directly below a podcast hero to surface the freshest release.',
  props: PodcastFeaturedStoryProps,
  component: ({ props }) => {
    const go = useNavigate()

    const eyebrow = props.eyebrow ?? 'Latest episode'
    const heading = props.heading ?? 'Fresh from the booth'
    const episodeLabel = props.episodeLabel ?? 'Episode 42'
    const title = props.title ?? 'The Sound of Silence'
    const duration = props.duration ?? '48 min'
    const date = props.date ?? 'June 12, 2026'
    const showNotes =
      props.showNotes ??
      'We sit down to unpack the quiet spaces between words and why the best stories breathe. From field recordings to studio hush, we trace how silence shapes a listen. Stay through the end for a few favorite tape moments.'
    const ctaLabel = props.ctaLabel ?? 'Play episode'
    const ctaTarget = props.ctaTarget ?? 'Episodes'
    const imageAlt =
      props.imageAlt ??
      'podcast recording studio with warm lighting, microphone and headphones on a wooden desk'

    return (
      <FeaturedArticle
        size="none"
        className={cn(
          'bg-background py-20 text-foreground lg:py-28',
          props.className,
        )}
      >
        <Container size="lg" className="px-6 lg:px-6">
          <SectionHeading eyebrow={eyebrow} title={heading} align="center" />

          <Card
            rounded="2xl"
            padding="none"
            className="mt-12 grid overflow-hidden md:grid-cols-2"
          >
            <FeaturedArticleMedia className="relative min-h-64 md:min-h-full">
              <Image
                alt={imageAlt}
                w={960}
                h={720}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </FeaturedArticleMedia>

            <FeaturedArticleContent className="gap-5 p-8 lg:p-12">
              <span className="text-sm font-semibold uppercase tracking-wide text-accent">
                {episodeLabel}
              </span>

              <h3 className="font-serif text-3xl font-bold tracking-tight text-card-foreground lg:text-4xl">
                {title}
              </h3>

              <FeaturedArticleMeta className="gap-3">
                <span>{duration}</span>
                <span
                  aria-hidden="true"
                  className="inline-block h-1 w-1 rounded-full bg-muted-foreground/60"
                />
                <span>{date}</span>
              </FeaturedArticleMeta>

              <p className="text-base text-muted-foreground">{showNotes}</p>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => go(ctaTarget)}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-4 w-4"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  {ctaLabel}
                </button>
              </div>
            </FeaturedArticleContent>
          </Card>
        </Container>
      </FeaturedArticle>
    )
  },
})
