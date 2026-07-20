import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

import { Container } from '#/section-kit/Container.tsx'
import { EventList } from '#/section-kit/EventList.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * BarNightclubEvents — collapsed-border poster lineup ledger for a
 * cocktail-bar / nightclub page. An asymmetric header (ticket-stub eyebrow
 * chip + giant condensed uppercase heading left, lead paragraph and mono
 * night-count right), then a single 2px-bordered stack of event rows; each row
 * leads with a hollow index numeral and an oversized condensed day, a mono
 * date ticket chip, title + description, a small bordered alt-driven photo
 * plate, and a sharp ticket CTA with press feedback that fills on hover. A
 * giant ghost heading watermark floats behind. Dark-kinetic, hairline-ruled,
 * sharp-cornered. Each CTA routes through section-kit route links and photos
 * use the alt-driven Image component. Use to showcase an upcoming lineup of DJ
 * nights, live performances, or themed events for bars, nightclubs, lounges,
 * or live-music venues. Renders fully with no props via baked-in defaults.
 */
export const BarNightclubEvents = defineCapsule({
  name: 'BarNightclubEvents',
  description:
    'Collapsed-border poster lineup ledger for a cocktail-bar / nightclub page: an asymmetric header (ticket-stub eyebrow chip + giant condensed uppercase heading left, lead paragraph and mono night-count right), then a single 2px-bordered stack of event rows, each leading with a hollow index numeral and oversized condensed day, a mono date ticket chip, title + description, a small bordered alt-driven photo plate, and a sharp ticket CTA that fills on hover. A giant ghost heading watermark floats behind. Dark-kinetic and sharp-cornered; each CTA routes through section-kit route links and photos use the alt-driven Image component. Use to showcase an upcoming lineup of DJ nights, live performances, or themed events for bars, nightclubs, lounges, or live-music venues.',
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

    return (
      <section
        className={cn(
          'relative overflow-hidden border-t-2 border-foreground py-14 sm:py-20 lg:py-24',
          props.className,
        )}
      >
        <Watermark className="-right-8 top-4 text-[5.5rem] uppercase sm:text-[9rem]">
          {eyebrow}
        </Watermark>
        <Container className="relative">
          <div className="mb-10 grid grid-cols-1 gap-6 sm:mb-14 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <span className="inline-flex items-center gap-3 border border-foreground/40 px-3 py-1.5">
                <MonoTag className="text-[10px] text-foreground">
                  {eyebrow}
                </MonoTag>
                <span
                  aria-hidden="true"
                  className="h-3 border-l border-dashed border-foreground/40"
                />
                <span
                  aria-hidden="true"
                  className="size-1.5 rounded-full bg-primary"
                />
              </span>
              <h2 className="mt-4 text-4xl font-black uppercase leading-[0.9] tracking-tighter sm:text-5xl lg:text-6xl">
                {heading}
              </h2>
            </div>
            <div className="lg:col-span-5 lg:pb-1">
              <p className="max-w-md leading-relaxed text-muted-foreground">
                {description}
              </p>
              <MonoTag aria-hidden="true" className="mt-3 block text-[10px]">
                {String(items.length).padStart(2, '0')} / nights
              </MonoTag>
            </div>
          </div>

          <EventList variant="list" className="border-2 border-foreground">
            {items.map((ev, i) => (
              <div
                key={ev.title}
                className={cn(
                  'group grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-4 p-5 transition-colors hover:bg-muted/40 sm:p-6 lg:grid-cols-[11rem_1fr_9rem_auto] lg:gap-8 lg:p-7',
                  i > 0 && 'border-t-2 border-foreground',
                )}
              >
                <div className="min-w-0">
                  <span className="flex items-baseline gap-2">
                    <span
                      aria-hidden="true"
                      className="font-mono text-[10px] font-bold text-primary"
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="truncate text-2xl font-black uppercase leading-none tracking-tighter sm:text-3xl">
                      {ev.day}
                    </span>
                  </span>
                  <span className="mt-2 inline-flex items-center gap-2 border border-foreground/30 px-2 py-0.5">
                    <MonoTag className="text-[9px]">{ev.date}</MonoTag>
                  </span>
                </div>
                <div className="col-span-2 min-w-0 lg:col-span-1">
                  <h3 className="text-lg font-black uppercase tracking-tight sm:text-xl">
                    {ev.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {ev.description}
                  </p>
                </div>
                <div className="order-first col-span-2 -mx-5 -mt-5 border-b-2 border-foreground sm:-mx-6 sm:-mt-6 lg:order-none lg:col-span-1 lg:m-0 lg:border-2">
                  <Image
                    alt={ev.imageAlt}
                    w={400}
                    h={300}
                    loading="lazy"
                    className="h-32 w-full object-cover lg:h-20"
                  />
                </div>
                <NavbarRouteLink
                  className="col-span-2 inline-flex items-center justify-center gap-2 border-2 border-foreground px-5 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-foreground transition-colors duration-100 hover:bg-foreground hover:text-background active:translate-y-px lg:col-span-1 lg:w-40"
                  href={ev.cta}
                >
                  {ev.cta}
                </NavbarRouteLink>
              </div>
            ))}
          </EventList>
        </Container>
      </section>
    )
  },
})
