import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

/**
 * NewsletterFeatures — "What You Get" value grid for an editorial newsletter.
 * A centered serif heading + lede introduces a 3-up grid of feature cards, each
 * with a rounded muted icon tile (rotating book / links / chat line icons), a
 * serif title, and a relaxed description; a bordered divider then opens a 2-up /
 * 4-up checklist of smaller perks, each a circular check badge beside a bold
 * title and muted sub-line. Warm, calm, literary mood on a paper-toned surface.
 * Use to explain what lands in subscribers' inbox for newsletters, publications,
 * blogs, or content creators. Renders fully with no props via baked-in defaults.
 */
export const NewsletterFeatures = defineCapsule({
  name: 'NewsletterFeatures',
  description:
    "'What You Get' value grid for an editorial newsletter: a centered serif heading + lede introduces a 3-up grid of feature cards, each with a rounded muted icon tile (rotating book / links / chat line icons), a serif title, and a relaxed description; a bordered divider then opens a 2-up / 4-up checklist of smaller perks, each a circular check badge beside a bold title and muted sub-line. Warm, calm, literary mood on a paper-toned surface. Use to explain what lands in subscribers' inbox for newsletters, publications, blogs, essayists, or content creators.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting lede under the heading. */
    description: z.string().optional(),
    /** Primary feature cards. */
    items: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    /** Smaller checklist perks below the divider. */
    perks: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'What You Get'
    const description =
      props.description ??
      "Every issue is crafted with care. Here's what lands in your inbox each Sunday."
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'One Deep Essay',
            description:
              "A 1,500-2,000 word essay exploring a single topic with nuance. No listicles. No clickbait. Just thoughtful analysis on technology's impact on our lives.",
          },
          {
            title: 'Curated Links',
            description:
              'Five carefully selected articles, books, and podcasts that informed my thinking this week. Each with a personal note on why it matters.',
          },
          {
            title: 'Community Replies',
            description:
              "Every email is a conversation. Reply directly and I'll respond. The best reader insights get featured (anonymously) in the next issue.",
          },
        ]
    const perks = props.perks?.length
      ? props.perks
      : [
          { title: 'Archive Access', description: 'All 156 past issues' },
          { title: 'Audio Versions', description: 'Listen on the go' },
          { title: 'No Ads', description: 'Reader-supported only' },
          { title: 'Private Discord', description: 'Join the conversation' },
        ]

    const Check = ({ className }) => (
      <svg
        className={className}
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M5 13l4 4L19 7" />
      </svg>
    )

    const featureIcons = [
      <svg
        key="book"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>,
      <svg
        key="links"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
      </svg>,
      <svg
        key="chat"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>,
    ]

    return (
      <section className={cn('py-16 md:py-24 lg:py-28', props.className)}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-2xl text-center md:mb-20">
            <h2 className="mb-4 font-serif text-3xl font-medium text-foreground sm:text-4xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
            {items.map((item, i) => (
              <div key={item.title} className="group">
                <div className="mb-5 grid size-12 place-items-center rounded-xl bg-muted text-foreground transition-colors group-hover:bg-accent">
                  {featureIcons[i % featureIcons.length]}
                </div>
                <h3 className="mb-3 font-serif text-xl font-medium text-foreground">
                  {item.title}
                </h3>
                <p className="leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-16 border-t border-border pt-16 md:mt-20 md:pt-20">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {perks.map((perk) => (
                <div key={perk.title} className="flex items-start gap-3">
                  <span className="mt-0.5 grid size-5 flex-shrink-0 place-items-center rounded-full bg-muted text-foreground">
                    <Check className="size-3" />
                  </span>
                  <div>
                    <p className="font-medium text-foreground">{perk.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {perk.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  },
})
