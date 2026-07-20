import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  FeaturedArticleMedia,
  FeaturedArticleContent,
  FeaturedArticleMeta,
} from '#/section-kit/FeaturedArticle.tsx'
import { StorySection } from '#/section-kit/StorySection.tsx'
import { Card } from '#/section-kit/Card.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/** Div-built token waveform accent — an audio motif built from bars. */
const WAVEFORM_BARS = [
  'h-2',
  'h-5',
  'h-3',
  'h-7',
  'h-4',
  'h-8',
  'h-5',
  'h-3',
  'h-6',
  'h-2',
  'h-8',
  'h-4',
  'h-6',
  'h-3',
  'h-7',
  'h-5',
]

function Waveform({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn('flex items-center gap-[3px]', className)}
    >
      {WAVEFORM_BARS.map((h, i) => (
        <span
          key={i}
          className={cn(
            'w-[3px] shrink-0 rounded-none',
            h,
            i % 6 === 2 ? 'bg-primary' : 'bg-foreground/20',
          )}
        />
      ))}
    </div>
  )
}

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
    'A latest-episode feature that spotlights one podcast episode inside a square hard-shadowed ledger card with an asymmetric 5/7 split. A mono episode-index meta rule and a left-aligned section heading sit above the card; inside, a warm studio cover image fills the left while the right stacks a mono episode label, a bold title, a duration and publish-date meta row in tabular-nums, short show notes, a div-built token waveform, and a square Play episode button with play-button press feedback. Best used directly below a podcast hero to surface the freshest release.',
  props: PodcastFeaturedStoryProps,
  component: ({ props }) => {
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
      <StorySection
        className={cn(
          'bg-background py-16 text-foreground sm:py-20 lg:py-28',
          props.className,
        )}
      >
        <Container size="lg" className="px-6 lg:px-6">
          <div className="mb-8 flex items-center justify-between gap-4 border-b border-border pb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            <span className="flex items-center gap-3">
              <span aria-hidden="true" className="size-2 bg-primary" />
              {eyebrow}
            </span>
            <span className="tabular-nums text-foreground/60">EP 042</span>
          </div>

          <SectionHeading
            align="left"
            title={heading}
            className="max-w-3xl"
            titleClassName="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl"
          />

          <Card
            variant="outline"
            className="mt-10 grid overflow-hidden rounded-none border-foreground p-0 shadow-[10px_10px_0_0] shadow-foreground/10 md:grid-cols-12"
          >
            <FeaturedArticleMedia className="relative min-h-64 border-b border-foreground md:col-span-5 md:min-h-full md:border-b-0 md:border-r">
              <Image
                alt={imageAlt}
                w={960}
                h={720}
                loading="lazy"
                className="h-full w-full object-cover"
              />
              <span
                aria-hidden="true"
                className="absolute left-4 top-4 bg-foreground px-2 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-background"
              >
                Now Playing
              </span>
            </FeaturedArticleMedia>

            <FeaturedArticleContent className="gap-5 p-8 md:col-span-7 lg:p-12">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
                {episodeLabel}
              </span>

              <h3 className="text-3xl font-extrabold tracking-tight text-card-foreground lg:text-4xl">
                {title}
              </h3>

              <FeaturedArticleMeta className="gap-3 font-mono text-[11px] uppercase tracking-[0.16em] tabular-nums">
                <span>{duration}</span>
                <span aria-hidden="true" className="text-muted-foreground/50">
                  /
                </span>
                <span>{date}</span>
              </FeaturedArticleMeta>

              <p className="text-base leading-relaxed text-muted-foreground">
                {showNotes}
              </p>

              <Waveform className="h-8" />

              <div className="pt-2">
                <NavbarRouteLink
                  className="inline-flex items-center gap-2 rounded-none bg-foreground px-7 py-3 font-medium text-background transition-transform duration-150 hover:bg-foreground/90 active:translate-y-px"
                  href={ctaTarget}
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
                </NavbarRouteLink>
              </div>
            </FeaturedArticleContent>
          </Card>
        </Container>
      </StorySection>
    )
  },
})
