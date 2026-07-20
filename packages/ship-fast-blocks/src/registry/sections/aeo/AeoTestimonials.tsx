import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import {
  TestimonialGrid,
  TestimonialCard,
  TestimonialQuote,
  TestimonialAuthor,
  TestimonialName,
  TestimonialMeta,
} from '#/section-kit/TestimonialGrid.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { Container } from '#/section-kit/Container.tsx'

const DEFAULT_REVIEWS: {
  quote: string
  name: string
  role?: string
  company?: string
  rating?: number
}[] = [
  {
    quote:
      'Within a quarter, Citeable got us cited in ChatGPT and Perplexity for our top buying-intent prompts. AI answers are now our fastest-growing source of qualified demos.',
    name: 'Priya Nair',
    role: 'VP Marketing',
    company: 'Latchwork',
    rating: 5,
  },
  {
    quote:
      'We finally have a number for AI visibility. The share-of-voice tracking showed us exactly where competitors were winning the answer, and the rewrites flipped it.',
    name: 'Marcus Bell',
    role: 'Head of Growth',
    company: 'Northstar Analytics',
    rating: 5,
  },
  {
    quote:
      'The change alerts are worth the subscription alone. The moment Google AI Overviews dropped our citation, we knew — and had it back within a week.',
    name: 'Elena Cruz',
    role: 'Content Director',
    company: 'Brightpath',
    rating: 5,
  },
]

/**
 * AeoTestimonials — "Answer Terminal" social-proof band for an Answer-Engine-
 * Optimization (AEO) SaaS. An asymmetric header (title left, mono meta right)
 * sits above staggered rounded-none quote cards styled as cited answers: each
 * card opens with a mono "[SOURCE 01] — role" citation header, sets the
 * results-focused quote over a hairline rule, renders the star rating as a row
 * of primary squares, and closes with the reviewer's name and role/company.
 * Accepts a public `reviews` prop to override the quotes. Use to build trust
 * on AEO, generative-search visibility, or brand-citation analytics pages.
 */
export const AeoTestimonials = defineCapsule({
  name: 'AeoTestimonials',
  description:
    "Terminal-styled social-proof band for an Answer-Engine-Optimization (AEO) SaaS: an asymmetric mono-labeled header above staggered rounded-none quote cards styled as cited answers — each with a mono '[SOURCE 01]' citation header, a results-focused quote about earning AI citations and share-of-voice, a rating row of primary squares, and the reviewer's name, role, and company. Accepts a public `reviews` prop to override the quotes. Use to build trust on AEO, generative-search visibility, or brand-citation analytics landing pages.",
  props: z.object({
    heading: z.string().optional(),
    subheading: z.string().optional(),
    reviews: z
      .array(
        z.object({
          quote: z.string(),
          name: z.string(),
          role: z.string().optional(),
          company: z.string().optional(),
          rating: z.number().optional(),
        }),
      )
      .optional(),
    columns: z.union([z.literal(2), z.literal(3)]).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading =
      props.heading ?? 'Marketing teams trust Citeable to win the answer'
    const subheading =
      props.subheading ??
      "From series-A startups to enterprise brands — here's what happens when AI engines start citing you."
    const reviews = props.reviews?.length ? props.reviews : DEFAULT_REVIEWS

    const items = reviews.map((r) => ({
      quote: r.quote,
      name: r.name,
      role: r.role,
      company: r.company,
      rating: r.rating ?? 5,
    }))

    return (
      <section
        className={
          'bg-muted py-14 sm:py-20 lg:py-28' +
          (props.className ? ' ' + props.className : '')
        }
      >
        <Container size="xl" className="px-6">
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              align="left"
              title={heading}
              subtitle={subheading}
              className="max-w-2xl gap-2"
              titleClassName="text-3xl font-semibold tracking-tight md:text-4xl"
            />
            <p
              aria-hidden="true"
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60"
            >
              [ cited sources ]
            </p>
          </div>
          <TestimonialGrid columns={props.columns ?? 3}>
            {items.map((t, index) => {
              const __iv__ = t as {
                quote: string
                name: string
                role?: string
                company?: string
                meta?: string
                rating?: number
                avatarAlt?: string
              }
              const sourceMeta = __iv__.role || __iv__.company || __iv__.meta
              const rating = Math.max(
                0,
                Math.min(5, Math.round(__iv__.rating ?? 5)),
              )
              return (
                <TestimonialCard
                  key={`${__iv__.name}-${index}`}
                  className="rounded-none border-border bg-card p-5 transition-[border-color,transform] duration-150 hover:-translate-y-0.5 hover:border-primary max-md:odd:mr-7 max-md:even:ml-7 sm:p-6 md:even:mt-8 md:last:odd:col-span-2 lg:last:odd:col-span-1"
                >
                  <span className="flex items-baseline gap-2 border-b border-border pb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    <span className="text-primary">
                      [source {String(index + 1).padStart(2, '0')}]
                    </span>
                    {sourceMeta ? <span>— {sourceMeta}</span> : null}
                  </span>
                  <TestimonialQuote className="text-base leading-relaxed">
                    {__iv__.quote}
                  </TestimonialQuote>
                  <span aria-hidden="true" className="flex items-center gap-1">
                    {Array.from({ length: rating }, (_, star) => (
                      <span key={star} className="size-2 bg-primary" />
                    ))}
                  </span>
                  <TestimonialAuthor>
                    <TestimonialName>{__iv__.name}</TestimonialName>
                    {sourceMeta && (
                      <TestimonialMeta className="font-mono text-[11px] uppercase tracking-[0.12em]">
                        {sourceMeta}
                      </TestimonialMeta>
                    )}
                  </TestimonialAuthor>
                </TestimonialCard>
              )
            })}
          </TestimonialGrid>
        </Container>
      </section>
    )
  },
})
