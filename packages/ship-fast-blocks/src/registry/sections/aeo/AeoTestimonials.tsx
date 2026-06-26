import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { TestimonialGrid } from '#/section-kit/TestimonialGrid.tsx'

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

export const AeoTestimonials = defineComponent({
  name: 'AeoTestimonials',
  description:
    "Social-proof band for an Answer-Engine-Optimization (AEO) SaaS, composing the shared TestimonialGrid composite into a row of customer reviews. Each card shows a star rating, a results-focused quote about earning AI citations and share-of-voice, and an avatar with the reviewer's name, role, and company. Accepts a public `reviews` prop to override the quotes. Use to build trust on AEO, generative-search visibility, or brand-citation analytics landing pages.",
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
          'bg-muted py-20 lg:py-28' +
          (props.className ? ' ' + props.className : '')
        }
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <TestimonialGrid
            heading={heading}
            subheading={subheading}
            items={items}
            columns={props.columns ?? 3}
          />
        </div>
      </section>
    )
  },
})
