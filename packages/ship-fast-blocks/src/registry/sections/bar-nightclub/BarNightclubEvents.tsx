import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'

import { Container } from '#/section-kit/Container.tsx'
import { EventList } from '#/section-kit/EventList.tsx'

/**
 * BarNightclubEvents — stacked weekly events list for a cocktail-bar /
 * nightclub page. A left-aligned eyebrow + light-weight heading + lead, then a
 * vertical stack of bordered event rows; each row lays out a day/date block, a
 * title + description, an alt-driven event photo, and an outlined ticket CTA,
 * collapsing to a column on mobile. Moody, editorial, hairline-bordered. Each
 * CTA routes through useNavigate and photos use the alt-driven Image component.
 * Use to showcase an upcoming lineup of DJ nights, live performances, or themed
 * events for bars, nightclubs, lounges, or live-music venues. Renders fully with
 * no props via baked-in defaults.
 */
export const BarNightclubEvents = defineCapsule({
  name: 'BarNightclubEvents',
  description:
    'Stacked weekly events list for a cocktail-bar / nightclub page: a left-aligned eyebrow, light-weight heading and lead, then a vertical stack of hairline-bordered event rows, each laying out a day/date block, a title + description, an alt-driven event photo, and an outlined ticket CTA that collapses to a column on mobile. Moody and editorial; each CTA routes through useNavigate and photos use the alt-driven Image component. Use to showcase an upcoming lineup of DJ nights, live performances, or themed events for bars, nightclubs, lounges, or live-music venues.',
  props: z.object({
    /** Wide letter-spaced uppercase eyebrow. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Event rows. */
    items: z
      .array(
        z.object({
          day: z.string(),
          date: z.string(),
          title: z.string(),
          description: z.string(),
          cta: z.string(),
          imageAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const eyebrow = props.eyebrow ?? 'Upcoming Events'
    const heading = props.heading ?? 'This Week at NOIR'
    const description =
      props.description ??
      'Curated nights featuring resident DJs, live performances, and special themed events. Advance tickets recommended.'
    const items = props.items?.length
      ? props.items
      : [
          {
            day: 'Thursday',
            date: 'June 4, 2026',
            title: 'Deep House Thursdays',
            description:
              'Resident DJ Marcus Chen spins vinyl-only deep house classics. 10 PM — 4 AM.',
            cta: 'Get Tickets',
            imageAlt: 'DJ performing with turntables and mixing equipment',
          },
          {
            day: 'Friday',
            date: 'June 5, 2026',
            title: 'NOIR Presents: Maya Rodriguez',
            description:
              'Underground techno sensation from Berlin. Limited capacity — advance tickets only. 11 PM — 5 AM.',
            cta: 'Get Tickets',
            imageAlt:
              'Techno DJ with headphones performing at underground club',
          },
          {
            day: 'Saturday',
            date: 'June 6, 2026',
            title: 'Disco Inferno',
            description:
              'All-night disco and funk with DJ Collective Soul. Dress code: sequins encouraged. 10 PM — 4 AM.',
            cta: 'Get Tickets',
            imageAlt: 'Crowd dancing under disco ball with colorful lights',
          },
          {
            day: 'Sunday',
            date: 'June 7, 2026',
            title: 'Jazz & Cocktails',
            description:
              'Live jazz quartet with vocalist Sarah Mitchell. Sophisticated evening, no cover. 7 PM — 11 PM.',
            cta: 'Reserve Table',
            imageAlt:
              'Jazz quartet performing on stage with saxophone and piano',
          },
        ]

    const ghostBtn =
      'inline-flex items-center justify-center px-6 py-3 border border-foreground text-sm tracking-wide text-foreground transition-colors hover:bg-foreground hover:text-background'

    return (
      <section
        className={cn(
          'border-t border-border pt-28 pb-24 lg:pt-32 lg:pb-28',
          props.className,
        )}
      >
        <Container>
          <div className="mb-16 max-w-2xl">
            <p className="mb-4 text-sm uppercase tracking-[0.2em] text-muted-foreground">
              {eyebrow}
            </p>
            <h2 className="mb-6 text-3xl font-light sm:text-4xl lg:text-5xl">
              {heading}
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>

          <EventList variant="list">
            {items.map((ev) => (
              <div
                key={ev.title}
                className="flex flex-col gap-6 border border-border p-6 transition-colors hover:border-foreground/40 lg:flex-row lg:items-center lg:gap-12 lg:p-8"
              >
                <div className="shrink-0 lg:w-48">
                  <p className="text-3xl font-light">{ev.day}</p>
                  <p className="text-muted-foreground">{ev.date}</p>
                </div>
                <div className="flex-1">
                  <h3 className="mb-2 text-xl font-medium">{ev.title}</h3>
                  <p className="text-muted-foreground">{ev.description}</p>
                </div>
                <div className="shrink-0 lg:w-64">
                  <Image
                    alt={ev.imageAlt}
                    w={400}
                    h={300}
                    loading="lazy"
                    className="h-32 w-full rounded-sm object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => go(ev.cta)}
                  className={cn(ghostBtn, 'lg:w-40')}
                >
                  {ev.cta}
                </button>
              </div>
            ))}
          </EventList>
        </Container>
      </section>
    )
  },
})
