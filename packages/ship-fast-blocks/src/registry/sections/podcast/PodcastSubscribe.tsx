import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { Container } from '#/section-kit/Container.tsx'
import {
  SubscribeBand,
  SubscribeForm,
  SubscribeInput,
} from '#/section-kit/SubscribeBand.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/** Div-built token waveform on the inverted band (background-toned bars). */
const WAVEFORM_BARS = [
  'h-2',
  'h-5',
  'h-3',
  'h-7',
  'h-4',
  'h-9',
  'h-5',
  'h-3',
  'h-7',
  'h-2',
  'h-6',
  'h-4',
  'h-8',
  'h-3',
  'h-6',
  'h-5',
  'h-9',
  'h-4',
  'h-2',
  'h-7',
]

function Waveform({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn('flex items-center justify-center gap-[3px]', className)}
    >
      {WAVEFORM_BARS.map((h, i) => (
        <span
          key={i}
          className={cn('w-[3px] shrink-0 rounded-none bg-background/25', h)}
        />
      ))}
    </div>
  )
}

export const PodcastSubscribe = defineCapsule({
  name: 'PodcastSubscribe',
  description:
    'Subscribe-everywhere call-to-action band for a podcast site, rendered as one inverted (bg-foreground text-background) band that opens on a slanted clip-path seam and carries a div-built token waveform. It centers a mono eyebrow, heading, and subtitle above a wrapping row of square platform buttons (Apple Podcasts, Spotify, Overcast, RSS, YouTube) that route via section-kit route links, plus an email capture form with a square light submit button and press feedback. Use it to convert listeners by sending them to the show on whichever podcast app they already use.',
  props: z.object({
    /** Small uppercase eyebrow above the heading. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    subheading: z.string().optional(),
    /** Platform pill buttons: label + navigation target. */
    platforms: z
      .array(z.object({ label: z.string(), target: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Listen anywhere'
    const heading = props.heading ?? 'Subscribe everywhere you listen'
    const subheading =
      props.subheading ??
      'New episodes drop weekly. Tap your favorite app and never miss a transmission.'
    const platforms = props.platforms?.length
      ? props.platforms
      : [
          { label: 'Apple Podcasts', target: 'Subscribe' },
          { label: 'Spotify', target: 'Subscribe' },
          { label: 'Overcast', target: 'Subscribe' },
          { label: 'RSS', target: 'Subscribe' },
          { label: 'YouTube', target: 'Subscribe' },
        ]

    return (
      <SubscribeBand
        variant="inverted"
        className={cn(
          'relative overflow-hidden py-20 pt-28 [clip-path:polygon(0_3rem,100%_0,100%_100%,0_100%)] lg:py-28 lg:pt-36',
          props.className,
        )}
      >
        <Container size="4xl" className="px-6 text-center">
          <Waveform className="mx-auto mb-8 h-9" />
          <SectionHeading
            eyebrow={eyebrow}
            title={heading}
            subtitle={subheading}
            eyebrowClassName="font-mono tracking-[0.22em] text-background/60"
            titleClassName="text-3xl font-extrabold tracking-tight text-background md:text-4xl"
            subtitleClassName="text-background/70"
          />
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            {platforms.map((platform, i) => (
              <NavbarRouteLink
                key={`${platform.label}-${i}`}
                className="rounded-none border border-background/30 bg-transparent px-5 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-background transition-colors duration-150 hover:bg-background hover:text-foreground active:translate-y-px"
                href={platform.target}
              >
                {platform.label}
              </NavbarRouteLink>
            ))}
          </div>
          <SubscribeForm className="mx-auto mt-8 flex w-full max-w-md flex-col items-stretch gap-3 sm:flex-row">
            <SubscribeInput
              placeholder="you@example.com"
              className="rounded-none border-background/30 bg-transparent text-background placeholder-background/50 focus:border-background focus:ring-background/30"
            />
            <button
              type="submit"
              className="shrink-0 rounded-none bg-background px-6 py-3 font-medium text-foreground transition-transform duration-150 hover:bg-background/90 active:translate-y-px"
            >
              Subscribe
            </button>
          </SubscribeForm>
        </Container>
      </SubscribeBand>
    )
  },
})
