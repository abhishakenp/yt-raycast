import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import { TopicGrid, TopicCard } from '#/section-kit/TopicGrid.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * NewsTopics — browse-by-section index for a news outlet, in a full newsprint
 * idiom. On a card surface: a serif heading with a mono "view all" arrow-link
 * on a heavy double masthead rule, then a responsive grid of section plates.
 * Each plate is a sharp rounded-none hairline-framed grayscale photograph (it
 * regains color on hover) carrying a mono "Sec. 01" corner stamp and a solid
 * inverted (bg-foreground/text-background) caption bar with the section name in
 * serif, a one-line blurb and a mono story count — World, Politics, Business,
 * Tech, Culture, Science, Health, Sports and the like. The view-all link and
 * every plate route through section-kit route links. Use as a section-discovery
 * band on a newspaper, magazine or publication homepage to let readers jump
 * into top sections. Renders fully with no props via baked-in defaults.
 */
export const NewsTopics = defineCapsule({
  name: 'NewsTopics',
  description:
    "Browse-by-section index for a news outlet in a full newsprint idiom: on a card surface, a serif heading with a mono 'view all' arrow-link on a heavy double masthead rule, then a responsive grid of section plates. Each plate is a sharp rounded-none hairline-framed grayscale photograph (regains color on hover) with a mono 'Sec. 01' corner stamp and a solid inverted (bg-foreground/text-background) caption bar holding the section name in serif, a one-line blurb and a mono story count (World, Politics, Business, Tech, Culture, Science, Health, Sports). The view-all link and every plate route through section-kit route links. Use as a section-discovery band on a newspaper, magazine or publication homepage so readers can jump straight into top sections.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** View-all link label. */
    viewAll: z.string().optional(),
    /** Topic tiles. */
    items: z
      .array(
        z.object({
          name: z.string(),
          blurb: z.string().optional(),
          count: z.string(),
          imageAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Browse by Topic'
    const viewAll = props.viewAll ?? 'View all sections'
    const items = props.items?.length
      ? props.items
      : [
          {
            name: 'World',
            blurb: 'Global affairs, conflict and diplomacy',
            count: '1,247 stories',
            imageAlt: 'World map with connected city points across continents',
          },
          {
            name: 'Politics',
            blurb: 'Campaigns, policy and the halls of power',
            count: '892 stories',
            imageAlt: 'United States Capitol building dome in Washington DC',
          },
          {
            name: 'Business',
            blurb: 'Markets, deals and the global economy',
            count: '654 stories',
            imageAlt:
              'Business analytics dashboard with financial charts and graphs',
          },
          {
            name: 'Technology',
            blurb: 'Innovation, AI and the platforms shaping life',
            count: '1,532 stories',
            imageAlt: 'Computer circuit board with glowing processor chip',
          },
          {
            name: 'Culture',
            blurb: 'Film, music, books and the arts',
            count: '421 stories',
            imageAlt:
              'Movie theater with red velvet seats and classic cinema interior',
          },
          {
            name: 'Science',
            blurb: 'Discovery, research and the natural world',
            count: '378 stories',
            imageAlt:
              'Scientific laboratory with researcher examining microscope samples',
          },
          {
            name: 'Health',
            blurb: 'Medicine, wellbeing and public health',
            count: '536 stories',
            imageAlt:
              'Doctor reviewing patient charts in a bright modern clinic',
          },
          {
            name: 'Sports',
            blurb: 'Scores, transfers and the big games',
            count: '987 stories',
            imageAlt:
              'Floodlit stadium packed with fans during an evening match',
          },
        ]

    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    )

    return (
      <section
        className={cn('bg-card pt-20 pb-16 lg:pt-24 lg:pb-20', props.className)}
      >
        <Container>
          {/* Masthead header on a heavy double rule. */}
          <div className="mb-8 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3 border-b-2 border-foreground pb-3 shadow-[0_3px_0_-2px] shadow-border">
            <div className="flex items-baseline gap-4">
              <MonoTag tone="faint" className="hidden shrink-0 sm:block">
                Index
              </MonoTag>
              <SectionHeading
                align="left"
                title={heading}
                className="gap-0"
                titleClassName="font-serif text-3xl font-black tracking-tight text-foreground sm:text-4xl"
              />
            </div>
            <NavbarRouteLink
              className="group inline-flex items-center gap-2 border-b border-foreground pb-0.5 font-mono text-[11px] uppercase tracking-[0.16em] text-foreground transition-colors hover:border-primary hover:text-primary active:translate-y-px"
              href={viewAll}
            >
              {viewAll}
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
            </NavbarRouteLink>
          </div>

          <TopicGrid cols="2-3-4" className="gap-4">
            {items.map((topic, i) => (
              <TopicCard asChild key={topic.name}>
                <NavbarRouteLink
                  className="group relative block aspect-[4/3] overflow-hidden rounded-none border border-foreground/25 bg-muted text-left"
                  href={topic.name}
                >
                  <Image
                    alt={topic.imageAlt}
                    w={300}
                    h={225}
                    loading="lazy"
                    className="size-full object-cover grayscale transition-[filter,transform] duration-500 group-hover:scale-105 group-hover:grayscale-0"
                  />
                  {/* Corner section stamp. */}
                  <span className="absolute left-0 top-0 bg-foreground px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-background">
                    Sec. {String(i + 1).padStart(2, '0')}
                  </span>
                  {/* Solid inverted caption bar. */}
                  <div className="absolute inset-x-0 bottom-0 bg-foreground/95 p-3 text-background">
                    <h3 className="font-serif text-base font-black leading-none tracking-tight lg:text-lg">
                      {topic.name}
                    </h3>
                    {topic.blurb ? (
                      <p className="mt-1 line-clamp-1 text-xs text-background/70">
                        {topic.blurb}
                      </p>
                    ) : null}
                    <p className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-background/60">
                      {topic.count}
                    </p>
                  </div>
                </NavbarRouteLink>
              </TopicCard>
            ))}
          </TopicGrid>
        </Container>
      </section>
    )
  },
})
