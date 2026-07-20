import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import { EventList } from '#/section-kit/EventList.tsx'
import { ImageTile } from '#/section-kit/ImageTile.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * ChurchEvents — serene editorial featured-events grid for a church or
 * faith-community site. A generous, airy section with a giant ghost serif
 * "This Season" watermark: the header row pairs a mono metadata rail
 * (eyebrow — hairline rule) and serif heading on the left with a quiet
 * mono "View all" link on the right. Events sit in a gently staggered
 * 3-column grid (middle column drifts down on desktop, alternate cards drift
 * on tablet) — each card a hairline-framed photo plate with a faint serif
 * index numeral chip, then a mono date/time ledger row under a hairline rule,
 * a serif title, description, and an uppercase-mono CTA with arrow. Images
 * lazily load and scale softly on hover. All CTAs route through section-kit
 * route links. Use for upcoming events, classes, workshops, baptisms, or
 * outreach drives on church, ministry, or community organization pages.
 * Renders fully with no props via baked-in defaults.
 */
export const ChurchEvents = defineCapsule({
  name: 'ChurchEvents',
  description:
    "Serene editorial featured-events grid for a church or faith-community site: an airy section with a giant ghost serif 'This Season' watermark, a header row pairing a mono metadata rail + serif heading (left) with a quiet mono 'View all' link (right), and a gently staggered 3-column grid whose middle column drifts down on desktop. Each card is a hairline-framed photo plate with a faint serif index numeral chip, a mono date/time ledger row under a hairline rule, a serif title, description, and an uppercase-mono CTA with arrow. Images lazily load and scale softly on hover. All CTAs route through section-kit route links. Use for upcoming events, classes, workshops, baptisms, or outreach drives on church, ministry, or community organization pages.",
  props: z.object({
    /** Small uppercase eyebrow above the heading. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Label for the top-right 'View all' link. */
    viewAll: z.string().optional(),
    /** Event cards; each has date, time, title, description, CTA label, and image alt. */
    items: z
      .array(
        z.object({
          date: z.string(),
          time: z.string(),
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
    const eyebrow = props.eyebrow ?? 'Coming Up'
    const heading = props.heading ?? 'Featured Events'
    const viewAll = props.viewAll ?? 'View all events'
    const items = props.items?.length
      ? props.items
      : [
          {
            date: 'June 15, 2025',
            time: '2:00 PM',
            title: 'Summer Baptism Celebration',
            description:
              'Join us at Sellwood Riverfront Park as we celebrate new life in Christ. Picnic and fellowship to follow.',
            cta: 'Register free',
            imageAlt:
              'Outdoor summer baptism celebration at a lake with people gathered on the shore',
          },
          {
            date: 'June 22, 2025',
            time: '6:00 PM',
            title: 'Parenting Teens Workshop',
            description:
              'A three-hour interactive seminar with licensed counselor Sarah Mitchell. Childcare provided.',
            cta: '$15 per family',
            imageAlt:
              'Parents and teenagers having discussion in a circle at a youth group meeting',
          },
          {
            date: 'July 5, 2025',
            time: '8:00 AM',
            title: 'CityServe Food Drive',
            description:
              'Our quarterly citywide service day. Help distribute 5,000 meals to families in need across Portland.',
            cta: 'Sign up to serve',
            imageAlt:
              'Volunteers packing boxes of food donations at a community food bank',
          },
          {
            date: 'July 18-19, 2025',
            time: 'Evening sessions',
            title: 'Worship Nights Conference',
            description:
              'Two nights of extended worship with special guests Phil Wickham and Charity Gayle. Free admission.',
            cta: 'Reserve seats',
            imageAlt:
              'Worship band performing on stage with warm stage lighting and raised hands in the audience',
          },
          {
            date: 'August 9, 2025',
            time: '11:00 AM',
            title: "Men's BBQ & Fellowship",
            description:
              "Annual men's gathering at Mount Tabor Park. Bring your own meat; sides and drinks provided.",
            cta: 'RSVP required',
            imageAlt:
              'Fathers and children enjoying a picnic barbecue together on a sunny day',
          },
          {
            date: 'September 8, 2025',
            time: '6:30 PM',
            title: 'Bible Study Launch Night',
            description:
              'Fall semester small groups kickoff. Meet leaders, preview studies, and find your group for the season.',
            cta: 'Learn more',
            imageAlt:
              'Woman reading Bible in morning light with coffee cup nearby',
          },
        ]

    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    )

    return (
      <section
        className={cn(
          'relative overflow-hidden py-20 lg:py-28',
          props.className,
        )}
      >
        <Watermark className="-top-8 right-0 font-serif text-[5rem] font-medium italic text-foreground/[0.04] sm:text-[8rem] lg:text-[11rem]">
          This Season
        </Watermark>
        <Container size="xl" className="relative px-6">
          <div className="mb-14 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-xl">
              <div className="mb-5 flex items-center gap-4">
                <MonoTag tone="primary" className="shrink-0">
                  {eyebrow}
                </MonoTag>
                <span
                  aria-hidden="true"
                  className="h-px w-16 bg-border sm:w-24"
                />
              </div>
              <SectionHeading
                align="left"
                title={heading}
                className="gap-0"
                titleClassName="font-serif text-4xl font-medium leading-[1.08] tracking-tight text-foreground sm:text-5xl"
              />
            </div>
            <NavbarRouteLink
              className="inline-flex items-center gap-1.5 border-b border-foreground/40 pb-1 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground transition-colors hover:border-foreground hover:text-muted-foreground"
              href={viewAll}
            >
              {viewAll}
              <ArrowRight className="size-3.5" />
            </NavbarRouteLink>
          </div>
          <EventList
            variant="card"
            className="grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3"
          >
            {items.map((ev, i) => (
              <NavbarRouteLink
                key={ev.title}
                className={cn(
                  'group block w-full cursor-pointer text-left',
                  // Gentle stagger: middle column drifts down on desktop,
                  // right column drifts on tablet.
                  i % 3 === 1 && 'lg:translate-y-10',
                  i % 2 === 1 && 'sm:max-lg:translate-y-8',
                )}
                href={ev.title}
              >
                <div className="relative">
                  <ImageTile className="aspect-[16/10] rounded-none border border-border bg-muted">
                    <Image
                      alt={ev.imageAlt}
                      w={800}
                      h={500}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </ImageTile>
                  {/* Faint serif index chip breaching the plate's corner. */}
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-4 right-4 border border-border bg-background px-2.5 py-1 font-serif text-lg font-medium italic leading-none text-muted-foreground"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <div className="mt-6 flex items-baseline gap-3 border-t border-border pt-4">
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-foreground">
                    {ev.date}
                  </span>
                  <span aria-hidden="true" className="h-px w-4 bg-border" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    {ev.time}
                  </span>
                </div>
                <h3 className="mt-3 font-serif text-xl font-medium tracking-tight text-foreground transition-colors group-hover:text-muted-foreground sm:text-2xl">
                  {ev.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {ev.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground">
                  {ev.cta}
                  <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </NavbarRouteLink>
            ))}
          </EventList>
        </Container>
      </section>
    )
  },
})
