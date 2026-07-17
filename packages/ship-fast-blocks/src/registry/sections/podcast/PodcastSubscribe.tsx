import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { NewsletterCta } from '#/section-kit/NewsletterCta.tsx'

export const PodcastSubscribe = defineCapsule({
  name: 'PodcastSubscribe',
  description:
    'Subscribe-everywhere call-to-action band for a podcast site, set on a warm accent-tinted background. It centers a heading and subtitle above a wrapping row of platform pill buttons (Apple Podcasts, Spotify, Overcast, RSS, YouTube) that route via useNavigate. Use it to convert listeners by sending them to the show on whichever podcast app they already use.',
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
    const go = useNavigate()
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
      <NewsletterCta
        className={cn(
          'bg-accent/10 py-20 text-foreground lg:py-28',
          props.className,
        )}
      >
        <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
          <SectionHeading
            eyebrow={eyebrow}
            title={heading}
            subtitle={subheading}
          />
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            {platforms.map((platform, i) => (
              <button
                key={`${platform.label}-${i}`}
                type="button"
                onClick={() => go(platform.target)}
                className="rounded-full border border-border bg-card px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                {platform.label}
              </button>
            ))}
          </div>
        </div>
      </NewsletterCta>
    )
  },
})
