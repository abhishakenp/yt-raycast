import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  PortfolioGrid,
  PortfolioMedia,
  PortfolioCaption,
} from '#/section-kit/PortfolioGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * WriterAuthorWork — a literary-editorial "Selected works" bibliography for an
 * author site. A left-aligned SectionHeading (uppercase "Books" eyebrow over a
 * serif title) with a mono catalog count sits above a staggered grid of book
 * plates: each pairs a tall 2:3 cover in a sharp rounded-none frame that lifts
 * onto a hard offset shadow on hover, a mono catalog index numeral, a serif
 * title, a mono "year · NOVEL" line with tabular figures, and a "Buy" link that
 * presses on click and routes through section-kit route links. Alternate cards
 * drop on a staggered vertical rhythm for a bookshelf feel. Tuned for
 * novelists, essayists, poets, and memoirists showcasing a backlist with
 * restrained serif typography. Ships with five baked-in titles so it renders
 * fully with no props.
 */
export const WriterAuthorWork = defineCapsule({
  name: 'WriterAuthorWork',
  description:
    "A literary-editorial 'Selected works' bibliography for an author website: a left-aligned SectionHeading (uppercase 'Books' eyebrow over a serif title) with a mono catalog count above a staggered grid of book plates. Each plate pairs a tall 2:3 cover in a sharp rounded-none frame that lifts onto a hard offset shadow on hover, a mono catalog index numeral, a serif book title, a mono 'year · NOVEL' line with tabular figures, and a 'Buy' link that presses on click and routes through section-kit route links; alternate cards sit on a staggered vertical rhythm for a bookshelf feel. Built for novelists, essayists, poets, and memoirists presenting a backlist with restrained, elegant serif typography. Renders fully with no props via five baked-in titles.",
  props: z.object({
    /** Serif title rendered in the heading block. */
    heading: z.string().optional(),
    /** Supporting subtitle under the heading. */
    subheading: z.string().optional(),
    /** Books to render as cards. */
    books: z
      .array(
        z.object({
          title: z.string(),
          year: z.string(),
          coverAlt: z.string(),
          target: z.string().optional(),
        }),
      )
      .optional(),
    /** Label for the per-book buy button. */
    buyLabel: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const buyLabel = props.buyLabel ?? 'Buy'
    const books = props.books ?? [
      {
        title: 'The Salt Houses',
        year: '2023',
        coverAlt:
          'minimalist serif cover in muted ivory tones, literary fiction novel book cover',
      },
      {
        title: 'A Quiet Inheritance',
        year: '2021',
        coverAlt:
          'moody seascape with hand-set type, contemporary literary fiction novel book cover',
      },
      {
        title: "The Cartographer's Daughter",
        year: '2018',
        coverAlt:
          'antique map detail under elegant serif lettering, historical literary fiction book cover',
      },
      {
        title: 'Letters to the North',
        year: '2015',
        coverAlt:
          'weathered letter and pressed flower still life, epistolary literary fiction book cover',
      },
      {
        title: 'Where the Light Falls',
        year: '2012',
        coverAlt:
          'soft window light across an empty chair, debut literary fiction novel book cover',
      },
    ]

    return (
      <section
        className={cn(
          'bg-background pt-28 pb-20 sm:pt-32 sm:pb-24',
          props.className,
        )}
      >
        <Container size="xl" className="px-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              align="left"
              eyebrow="Books"
              title={props.heading ?? 'Selected works'}
              subtitle={
                props.subheading ??
                'A decade of novels exploring memory, place, and the quiet weight of family.'
              }
              className="max-w-xl"
              eyebrowClassName="tracking-[0.2em]"
              titleClassName="font-serif text-3xl font-normal tracking-tight sm:text-4xl"
            />
            <MonoTag
              aria-hidden="true"
              tone="faint"
              className="shrink-0 tabular-nums"
            >
              {String(books.length).padStart(2, '0')} Titles
            </MonoTag>
          </div>

          <PortfolioGrid cols="1-2-3" className="mt-12">
            {books.map((book, i) => (
              <div
                key={book.title}
                className={cn(
                  'group flex flex-col',
                  i % 2 === 1 && 'sm:translate-y-8',
                )}
              >
                <PortfolioMedia
                  aspect="2-3"
                  className="w-full rounded-none border-2 border-foreground/15 transition-transform duration-200 group-hover:-translate-x-1 group-hover:-translate-y-1 group-hover:shadow-[8px_8px_0_0] group-hover:shadow-primary/25"
                >
                  <Image
                    alt={book.coverAlt}
                    w={300}
                    h={450}
                    className="size-full object-cover"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-0 border-b-2 border-r-2 border-foreground/15 bg-background px-2 py-1 font-mono text-[11px] tabular-nums text-muted-foreground"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </PortfolioMedia>
                <PortfolioCaption className="mt-4 border-t border-border pt-3">
                  <h3 className="font-serif text-xl text-foreground">
                    {book.title}
                  </h3>
                  <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground tabular-nums">
                    {book.year} &middot; Novel
                  </p>
                  <NavbarRouteLink
                    className="mt-3 self-start font-mono text-[11px] uppercase tracking-[0.16em] text-primary underline-offset-4 transition-transform duration-100 hover:underline active:translate-y-px"
                    href={book.target ?? 'Books'}
                  >
                    {buyLabel}
                  </NavbarRouteLink>
                </PortfolioCaption>
              </div>
            ))}
          </PortfolioGrid>
        </Container>
      </section>
    )
  },
})
