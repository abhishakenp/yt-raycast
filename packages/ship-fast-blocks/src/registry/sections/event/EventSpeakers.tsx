import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import {
  PersonCard,
  PersonCardName,
  PersonCardRole,
  PersonCardBio,
} from '#/section-kit/PersonCard.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { ResponsiveGrid } from '#/section-kit/ResponsiveGrid.tsx'
import { Watermark } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * EventSpeakers — kinetic-poster speaker roster for a conference or event page. A
 * muted band cut by a giant ghost "LIVE" watermark, opened by an asymmetric
 * header: a mono index eyebrow + oversized heading + lede on the left and a
 * mono "view all" route link (with arrow) pinned bottom-right. Beneath sits a
 * 4-up grid of clickable speaker cards — each a bordered rounded-2xl button with
 * a mono lineup numeral, a circular alt-driven headshot, the name, a mono
 * uppercase role, and a short bio — that lift on hover with press feedback and
 * route through section-kit route links. Use to headline keynote and session
 * speakers on tech conference, summit, meetup, festival, or workshop pages.
 */
export const EventSpeakers = defineCapsule({
  name: 'EventSpeakers',
  description:
    "Kinetic-poster featured-speakers roster for a conference or event page: a muted band with a giant ghost watermark and an asymmetric header (mono index eyebrow + oversized heading + lede on the left, a mono 'view all' route link with an arrow bottom-right), above a 4-up grid of clickable bordered rounded-2xl speaker cards. Each card is a button carrying a mono lineup numeral, a circular alt-driven headshot, the speaker name, a mono uppercase role, and a short bio, lifts on hover with press feedback, and routes through section-kit route links on click. Use to headline keynote and session speakers on tech conference, summit, meetup, festival, or workshop pages.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting description beneath the heading. */
    description: z.string().optional(),
    /** "View all" link label (top-right). */
    viewAll: z.string().optional(),
    /** Speaker cards. */
    items: z
      .array(
        z.object({
          name: z.string(),
          role: z.string(),
          bio: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Featured Speakers'
    const description =
      props.description ??
      'Learn from the engineers and designers shaping the future of web development.'
    const viewAll = props.viewAll ?? 'View full agenda'
    const items = props.items?.length
      ? props.items
      : [
          {
            name: 'Sarah Chen',
            role: 'Design Systems Lead',
            bio: 'Previously led design systems at Airbnb and Pinterest. Author of "Scaling Design Systems."',
          },
          {
            name: 'Marcus Rodriguez',
            role: 'Frontend Architect',
            bio: 'Core contributor to React and Next.js. Previously engineering lead at Vercel.',
          },
          {
            name: 'Emily Watson',
            role: 'VP of Product Design',
            bio: 'Leading design at Linear. Previously built design teams at Dropbox and Figma.',
          },
          {
            name: 'David Park',
            role: 'Staff Engineer',
            bio: 'Web performance expert at Shopify. Created widely-adopted performance tooling.',
          },
          {
            name: 'James Mitchell',
            role: 'Design Engineering',
            bio: 'Pioneering design-to-code workflows at Framer. Formerly at Apple Special Projects.',
          },
          {
            name: 'Priya Sharma',
            role: 'Accessibility Lead',
            bio: 'Accessibility advocate at Microsoft. W3C contributor and conference keynote speaker.',
          },
          {
            name: 'Alex Thompson',
            role: 'Creative Developer',
            bio: 'Award-winning creative technologist. Awwwards Site of the Day x12 recipient.',
          },
          {
            name: 'Lisa Nakamura',
            role: 'UX Research Director',
            bio: 'Leading user research at Notion. Stanford HCI PhD, published researcher.',
          },
        ]

    const ArrowRight = () => (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <line x1="3" y1="12" x2="21" y2="12" />
        <polyline points="14 5 21 12 14 19" />
      </svg>
    )

    return (
      <section
        className={cn(
          'relative overflow-hidden bg-muted py-20 lg:py-28',
          props.className,
        )}
      >
        <Watermark className="-right-6 top-6 text-[9rem] leading-none sm:text-[13rem] lg:text-[18rem]">
          LIVE
        </Watermark>
        <Container size="lg" className="relative">
          <div className="mb-12 flex flex-col gap-6 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              align="left"
              eyebrow="02 / Lineup"
              title={heading}
              subtitle={description}
              className="gap-0"
              eyebrowClassName="mb-4 text-muted-foreground"
              titleClassName="mb-4 text-4xl font-extrabold tracking-tight sm:text-5xl"
              subtitleClassName="max-w-xl text-lg text-muted-foreground"
            />
            <NavbarRouteLink
              className="group inline-flex w-fit items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-foreground transition-colors hover:text-primary"
              href={viewAll}
            >
              {viewAll}
              <span className="transition-transform group-hover:translate-x-1">
                <ArrowRight />
              </span>
            </NavbarRouteLink>
          </div>
          <ResponsiveGrid cols="1-2-4" className="gap-6">
            {items.map((sp, i) => (
              <PersonCard
                key={sp.name}
                asChild
                variant="outlined"
                className="rounded-2xl border-border bg-card transition-all duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-[8px_8px_0_0] hover:shadow-foreground/10 active:translate-y-0 active:shadow-none"
              >
                <NavbarRouteLink asChild href={sp.name}>
                  <button type="button" className="group block p-6 text-left">
                    <div className="mb-4 flex items-center justify-between">
                      <Image
                        alt={`Professional headshot portrait of ${sp.name}, ${sp.role}`}
                        w={200}
                        h={200}
                        className="size-16 rounded-full object-cover"
                      />
                      <span
                        aria-hidden="true"
                        className="font-mono text-sm tabular-nums text-muted-foreground/50"
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <PersonCardName className="text-lg font-bold tracking-tight text-card-foreground">
                      {sp.name}
                    </PersonCardName>
                    <PersonCardRole className="mb-3 font-mono text-[11px] uppercase tracking-[0.14em] text-primary">
                      {sp.role}
                    </PersonCardRole>
                    <PersonCardBio className="leading-relaxed">
                      {sp.bio}
                    </PersonCardBio>
                  </button>
                </NavbarRouteLink>
              </PersonCard>
            ))}
          </ResponsiveGrid>
        </Container>
      </section>
    )
  },
})
