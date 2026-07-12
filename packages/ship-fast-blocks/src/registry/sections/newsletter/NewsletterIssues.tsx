import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'

/**
 * NewsletterIssues — recent-issues archive grid for an editorial newsletter.
 * A centered serif heading + lede over a 1/2/3-column grid of bordered article
 * cards: each card has a 16:10 cover photo that zooms on hover, an issue-number ·
 * date meta line, a serif title, a short blurb, and a "Read issue" link with a
 * trailing arrow; a centered outlined "View all" button closes the section.
 * Warm, calm, literary mood on a paper-toned surface. Covers use the alt-driven
 * Image component; titles, read links, and the view-all button route through
 * useNavigate. Use to showcase a back-catalog for newsletters, publications,
 * blogs, or content creators. Renders fully with no props via baked-in defaults.
 */
export const NewsletterIssues = defineCapsule({
  name: 'NewsletterIssues',
  description:
    "Recent-issues archive grid for an editorial newsletter: a centered serif heading + lede over a 1/2/3-column grid of bordered article cards, each with a 16:10 cover photo that zooms on hover, an issue-number-and-date meta line, a serif title, a short blurb, and a 'Read issue' link with a trailing arrow; a centered outlined 'View all' button closes the section. Warm, calm, literary mood on a paper-toned surface. Covers use the alt-driven Image component; titles, read links, and the view-all button route through useNavigate. Use to showcase a back-catalog for newsletters, publications, blogs, or content creators.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting lede under the heading. */
    description: z.string().optional(),
    /** Label + target of the centered view-all button. */
    viewAll: z.string().optional(),
    /** Read-link label inside each card. */
    readLabel: z.string().optional(),
    /** Archive items shown as cards. */
    items: z
      .array(
        z.object({
          number: z.string(),
          date: z.string(),
          title: z.string(),
          blurb: z.string(),
          imageAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heading = props.heading ?? 'Recent Issues'
    const description =
      props.description ??
      'A selection of our most-read essays from the past few months.'
    const viewAll = props.viewAll ?? 'View All 156 Issues'
    const readLabel = props.readLabel ?? 'Read issue'
    const items = props.items?.length
      ? props.items
      : [
          {
            number: 'Issue #156',
            date: 'May 25, 2026',
            title: 'The Art of Digital Slowing',
            blurb:
              'On the paradox of building tools for focus in an age of infinite distraction—and why the answer might not be another app.',
            imageAlt:
              'minimal workspace desk with open notebook, coffee cup, and soft natural morning light',
          },
          {
            number: 'Issue #155',
            date: 'May 18, 2026',
            title: 'When AI Writes the Code',
            blurb:
              'What happens to craft when the tools get too good? A meditation on writing, coding, and the value of struggle.',
            imageAlt:
              'futuristic humanoid robot arm reaching toward glowing light representing AI and human interaction',
          },
          {
            number: 'Issue #154',
            date: 'May 11, 2026',
            title: 'The Remote Work Bet',
            blurb:
              "Five years in, the data is finally clear. What we got right, what we lost, and where we're headed next.",
            imageAlt:
              'diverse group of colleagues collaborating around a table with laptops in a modern office space',
          },
          {
            number: 'Issue #153',
            date: 'May 4, 2026',
            title: 'Writing as Thinking',
            blurb:
              'The lost art of using prose to clarify thought. Why the best product minds I know are obsessive note-takers.',
            imageAlt:
              'vintage typewriter with blank page representing the craft of thoughtful writing',
          },
          {
            number: 'Issue #152',
            date: 'April 27, 2026',
            title: 'Privacy After the Breach',
            blurb:
              'A personal account of having my data leaked—and the broader implications for how we build trust online.',
            imageAlt:
              'cybersecurity concept with digital lock and binary code overlay on dark background',
          },
          {
            number: 'Issue #151',
            date: 'April 20, 2026',
            title: 'The Cult of Productivity',
            blurb:
              'Why optimizing every moment might be making us miserable. A case for intentional inefficiency.',
            imageAlt:
              'serene mountain landscape at golden hour representing the search for meaning and perspective',
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
      <section className={cn('py-16 md:py-24 lg:py-28', props.className)}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-2xl text-center md:mb-16">
            <h2 className="mb-4 font-serif text-3xl font-medium text-foreground sm:text-4xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {items.map((issue) => (
              <article
                key={issue.number}
                className="group overflow-hidden rounded-2xl border border-border bg-card text-card-foreground transition-colors hover:border-muted-foreground/40"
              >
                <div className="aspect-[16/10] overflow-hidden">
                  <Image
                    alt={issue.imageAlt}
                    w={600}
                    h={375}
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <div className="mb-3 flex items-center gap-3 text-sm text-muted-foreground">
                    <span>{issue.number}</span>
                    <span className="size-1 rounded-full bg-muted-foreground/50" />
                    <span>{issue.date}</span>
                  </div>
                  <h3 className="mb-2 font-serif text-xl font-medium text-foreground transition-colors group-hover:text-foreground/70">
                    {issue.title}
                  </h3>
                  <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                    {issue.blurb}
                  </p>
                  <button
                    type="button"
                    onClick={() => go(issue.title)}
                    className="inline-flex items-center text-sm font-medium text-foreground transition-colors hover:text-muted-foreground"
                  >
                    {readLabel}
                    <ArrowRight className="ml-1 size-4" />
                  </button>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-12 text-center">
            <button
              type="button"
              onClick={() => go(viewAll)}
              className="inline-flex items-center justify-center rounded-lg border border-border px-6 py-3 font-medium text-foreground transition-colors hover:border-foreground hover:text-foreground"
            >
              {viewAll}
              <ArrowRight className="ml-2 size-4" />
            </button>
          </div>
        </div>
      </section>
    )
  },
})
