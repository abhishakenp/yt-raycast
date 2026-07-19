import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import {
  HeroSection,
  HeroHeading,
  HeroSubheading,
  HeroActions,
  HeroCta,
  HeroMediaPanel,
} from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'

const PodcastHeroProps = z.object({
  eyebrow: z.string().optional().describe('Small pill above the heading'),
  heading: z.string().optional().describe('Show name / main heading'),
  subheading: z.string().optional().describe('Tagline under the heading'),
  primaryCta: z.string().optional().describe('Primary button label'),
  primaryTarget: z.string().optional().describe('Primary button route label'),
  secondaryCta: z.string().optional().describe('Outline button label'),
  secondaryTarget: z.string().optional().describe('Outline button route label'),
  coverAlt: z.string().optional().describe('Cover-art image search query'),
  platforms: z
    .array(z.string())
    .optional()
    .describe('Platform badge labels rendered as static pills'),
  className: z.string().optional(),
})

export const PodcastHero = defineCapsule({
  name: 'PodcastHero',
  description:
    'A two-column warm podcast hero with text on the left and square album-style cover art on the right. It pairs a show name, tagline, and dual call-to-action buttons (filled Listen Now plus outline Subscribe) with a row of platform badge pills (Apple Podcasts, Spotify, Overcast, RSS). Ideal as the opening section of a podcast or audio-show landing page.',
  props: PodcastHeroProps,
  component: ({ props }) => {
    const go = useNavigate()

    const eyebrow = props.eyebrow ?? 'New season out now'
    const heading = props.heading ?? 'Signal & Static'
    const subheading =
      props.subheading ??
      'Warm, late-night conversations on sound, story, and the noise in between. A new episode every Thursday.'
    const primaryCta = props.primaryCta ?? 'Listen Now'
    const primaryTarget = props.primaryTarget ?? 'Episodes'
    const secondaryCta = props.secondaryCta ?? 'Subscribe'
    const secondaryTarget = props.secondaryTarget ?? 'Subscribe'
    const coverAlt =
      props.coverAlt ??
      'podcast cover art, warm vintage microphone on deep moody background, square album-style artwork'
    const platforms = props.platforms ?? [
      'Apple Podcasts',
      'Spotify',
      'Overcast',
      'RSS',
    ]

    return (
      <HeroSection
        className={cn(
          'bg-gradient-to-br from-accent/10 via-background to-background',
          props.className,
        )}
      >
        <Container className="grid items-center gap-12 py-20 lg:grid-cols-2 lg:gap-16 lg:py-28">
          <div className="flex flex-col items-start gap-6">
            {eyebrow ? (
              <span className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
                {eyebrow}
              </span>
            ) : null}

            <HeroHeading className="text-5xl sm:text-6xl">
              {heading}
            </HeroHeading>

            <HeroSubheading className="max-w-xl mt-0">
              {subheading}
            </HeroSubheading>

            <HeroActions className="flex-col gap-4 sm:flex-row">
              <HeroCta
                asChild
                variant="primary"
                className="rounded-full px-8 py-4 font-medium"
              >
                <button type="button" onClick={() => go(primaryTarget)}>
                  {primaryCta}
                </button>
              </HeroCta>
              <HeroCta
                asChild
                variant="outline"
                className="rounded-full bg-card px-8 py-4 font-medium"
              >
                <button type="button" onClick={() => go(secondaryTarget)}>
                  {secondaryCta}
                </button>
              </HeroCta>
            </HeroActions>

            <div className="flex flex-wrap gap-2 pt-2">
              {platforms.filter(Boolean).map((platform: string) => (
                <span
                  key={platform}
                  className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
                >
                  {platform}
                </span>
              ))}
            </div>
          </div>

          <div className="relative">
            <div
              aria-hidden="true"
              className="absolute -inset-6 rounded-3xl bg-primary/10 blur-2xl"
            />
            <div className="relative">
              <HeroMediaPanel
                alt={coverAlt}
                w={640}
                h={640}
                rounded="2xl"
                className="relative aspect-square border border-border shadow-2xl"
              />
            </div>
          </div>
        </Container>
      </HeroSection>
    )
  },
})
