import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  PortfolioGrid,
  PortfolioMedia,
  PortfolioCaption,
} from '#/section-kit/PortfolioGrid.tsx'

/**
 * WriterAuthorWork — a "Selected works" books grid for a literary author site.
 * Opens with a centered SectionHeading (uppercase "Books" eyebrow over a serif
 * title) and lays out a responsive grid of book cards, each pairing a tall
 * 2:3 cover image with the title, publication year, and a "Buy" link button
 * that routes through useNavigate. Tuned for novelists, essayists, poets, and
 * memoirists who want to showcase a backlist with quiet, elegant typography.
 * Ships with five baked-in titles so it renders fully with no props.
 */
export const WriterAuthorWork = defineCapsule({
  name: 'WriterAuthorWork',
  description:
    "A 'Selected works' books grid for a literary author website: a centered SectionHeading (uppercase 'Books' eyebrow over a serif title) above a responsive grid of book cards. Each card pairs a tall 2:3 cover image with the book title, publication year, and a 'Buy' link button that routes through useNavigate. Built for novelists, essayists, poets, and memoirists presenting a backlist with restrained, elegant serif typography. Renders fully with no props via five baked-in titles.",
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
    const go = useNavigate()
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
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeading
            eyebrow="Books"
            title={props.heading ?? 'Selected works'}
            subtitle={
              props.subheading ??
              'A decade of novels exploring memory, place, and the quiet weight of family.'
            }
          />

          <PortfolioGrid cols="1-2-3" className="mt-12">
            {books.map((book) => (
              <div key={book.title} className="flex flex-col">
                <PortfolioMedia
                  aspect="2-3"
                  className="w-full rounded-lg border border-border"
                >
                  <Image
                    alt={book.coverAlt}
                    w={300}
                    h={450}
                    className="size-full object-cover"
                  />
                </PortfolioMedia>
                <PortfolioCaption className="mt-4">
                  <h3 className="font-serif text-xl text-foreground">
                    {book.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{book.year}</p>
                  <button
                    type="button"
                    onClick={() => go(book.target ?? 'Books')}
                    className="mt-2 self-start text-sm font-medium text-primary hover:underline"
                  >
                    {buyLabel}
                  </button>
                </PortfolioCaption>
              </div>
            ))}
          </PortfolioGrid>
        </div>
      </section>
    )
  },
})
