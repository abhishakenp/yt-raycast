import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  HeroSection,
  HeroHeading,
  HeroSubheading,
  HeroActions,
  HeroCta,
  HeroMediaPanel,
} from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { DotGrid, Watermark } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/** Div-built token waveform — rows of varying-height bars, an audio motif. */
const WAVEFORM_BARS = [
  'h-3',
  'h-6',
  'h-4',
  'h-8',
  'h-5',
  'h-10',
  'h-6',
  'h-4',
  'h-7',
  'h-3',
  'h-9',
  'h-5',
  'h-6',
  'h-8',
  'h-4',
  'h-7',
  'h-10',
  'h-5',
  'h-3',
  'h-6',
  'h-8',
  'h-4',
  'h-9',
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
            i % 7 === 3 ? 'bg-primary' : 'bg-foreground/20',
          )}
        />
      ))}
    </div>
  )
}

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
    'An audio-editorial podcast hero with an asymmetric 7/5 split: a mono episode-index meta rule, a giant show-name display, a tagline, and dual square call-to-action buttons (filled Listen Now plus outline Subscribe with play-button press feedback) sit on the left above a hairline-bounded mono platform strip; a square album-style cover plate with a hard offset shadow, a div-built token waveform accent, and a giant ghost watermark sits on the right. Ideal as the opening section of a podcast or audio-show landing page.',
  props: PodcastHeroProps,
  component: ({ props }) => {
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
          'relative overflow-hidden bg-background text-foreground',
          props.className,
        )}
      >
        <DotGrid
          density="loose"
          tone="faint"
          fade="bottom"
          className="inset-x-0 top-0 h-64"
        />
        <Watermark className="-right-6 top-24 hidden text-[13rem] leading-none lg:block">
          ON AIR
        </Watermark>

        <Container className="relative grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-12 lg:gap-14 lg:py-28">
          <div className="flex flex-col items-start gap-6 lg:col-span-7">
            <div className="flex items-center gap-3 border-y border-border py-2.5">
              <span
                aria-hidden="true"
                className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary"
              >
                EP 047
              </span>
              {eyebrow ? (
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  {eyebrow}
                </span>
              ) : null}
            </div>

            <HeroHeading className="max-w-2xl text-5xl font-extrabold leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
              {heading}
            </HeroHeading>

            <HeroSubheading className="mt-0 max-w-xl text-pretty">
              {subheading}
            </HeroSubheading>

            <Waveform className="h-10" />

            <HeroActions className="mt-2 w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <HeroCta
                asChild
                variant="primary"
                className="rounded-none bg-foreground px-8 py-4 font-medium text-background transition-transform duration-150 hover:bg-foreground/90 active:translate-y-px"
              >
                <NavbarRouteLink href={primaryTarget}>
                  {primaryCta}
                </NavbarRouteLink>
              </HeroCta>
              <HeroCta
                asChild
                variant="outline"
                className="rounded-none border-foreground bg-background px-8 py-4 font-medium text-foreground transition-transform duration-150 hover:bg-muted active:translate-y-px"
              >
                <NavbarRouteLink href={secondaryTarget}>
                  {secondaryCta}
                </NavbarRouteLink>
              </HeroCta>
            </HeroActions>

            <div className="mt-2 flex w-full flex-wrap items-center gap-x-4 gap-y-1 border-t border-border pt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              <span className="text-foreground/70">Listen on</span>
              {platforms.filter(Boolean).map((platform: string) => (
                <span key={platform} className="whitespace-nowrap">
                  {platform}
                </span>
              ))}
            </div>
          </div>

          <div className="relative w-full lg:col-span-5">
            <span
              aria-hidden="true"
              className="absolute -top-3 left-0 z-10 bg-primary px-2 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-primary-foreground"
            >
              S3 · E12
            </span>
            <div className="relative border border-foreground bg-card shadow-[10px_10px_0_0] shadow-foreground/15">
              <HeroMediaPanel
                alt={coverAlt}
                w={640}
                h={640}
                className="relative aspect-square rounded-none"
              />
              <div className="flex items-center justify-between gap-3 border-t border-foreground px-4 py-3">
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  48:20
                </span>
                <Waveform className="h-5 flex-1 justify-end overflow-hidden" />
              </div>
            </div>
          </div>
        </Container>
      </HeroSection>
    )
  },
})
