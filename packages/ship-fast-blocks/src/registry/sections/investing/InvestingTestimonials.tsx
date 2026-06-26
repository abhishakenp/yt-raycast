import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

/**
 * InvestingTestimonials — star-rated testimonial wall for an investing / fintech
 * page. A muted section band with a centered heading + lead above a responsive
 * 1/2/3-column grid of review cards; each card has a five-star rating row, a
 * quote, and an investor avatar with name + role. Tokens only, no links. Use to
 * present social proof from customers of a brokerage, trading app, robo-advisor
 * or crypto exchange. Renders fully with no props via six baked-in reviews.
 */
export const InvestingTestimonials = defineComponent({
  name: 'InvestingTestimonials',
  description:
    'Star-rated testimonial wall for an investing / fintech page: a muted section band with a centered heading + lead above a responsive 1/2/3-column grid of review cards, each with a five-star rating row, a quote, and an investor avatar with name + role. Tokens only, no links. Use to present social proof from customers of a brokerage, trading app, robo-advisor or crypto exchange.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Review cards: quote + name + role + avatar alt. */
    items: z
      .array(
        z.object({
          quote: z.string(),
          name: z.string(),
          role: z.string(),
          avatarAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Loved by investors worldwide'
    const description =
      props.description ??
      'Join millions who have already made the switch to smarter investing.'
    const items = props.items?.length
      ? props.items
      : [
          {
            quote:
              'Vestora completely transformed how I invest. The AI insights helped me identify opportunities I would have missed. My portfolio is up 28% since switching.',
            name: 'Sarah Mitchell',
            role: 'Product Manager, San Francisco',
            avatarAlt:
              'professional headshot of a smiling woman with blonde hair wearing a navy blazer',
          },
          {
            quote:
              "As a day trader, I need speed and precision. Vestora's execution is instant and the charting tools rival professional platforms that cost 10x more.",
            name: 'James Rodriguez',
            role: 'Day Trader, Miami',
            avatarAlt:
              'professional headshot of a man with dark hair and trimmed beard wearing a white dress shirt',
          },
          {
            quote:
              "I was intimidated by investing until I found Vestora. The educational resources and simple interface made it easy to start. Now I'm confidently managing my own portfolio.",
            name: 'Emily Chen',
            role: 'Teacher, Seattle',
            avatarAlt:
              'professional headshot of a woman with shoulder length brown hair and warm smile',
          },
          {
            quote:
              "The auto-invest feature is a game-changer. I set up weekly deposits and forgot about it. Six months later, I've built a diverse portfolio without lifting a finger.",
            name: 'David Park',
            role: 'Software Engineer, Austin',
            avatarAlt:
              'professional headshot of a middle aged man with glasses and graying hair wearing a blue button down shirt',
          },
          {
            quote:
              "Customer support is exceptional. Had a question about options trading at 2 AM and got a helpful response within minutes. That's service you can't put a price on.",
            name: 'Aisha Johnson',
            role: 'Financial Analyst, Chicago',
            avatarAlt:
              'professional headshot of a young woman with curly dark hair and natural makeup',
          },
          {
            quote:
              'The tax optimization features alone paid for my Elite subscription. Vestora automatically harvested losses and saved me thousands on my tax bill.',
            name: 'Michael Torres',
            role: 'Small Business Owner, Denver',
            avatarAlt:
              'professional headshot of a man in his thirties with short dark hair and clean shaven face',
          },
        ]

    const Star = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    return (
      <section
        id="reviews"
        className={cn('bg-muted/50 py-24', props.className)}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {items.map((t) => (
              <div
                key={t.name}
                className="rounded-xl border border-border bg-card p-8 text-card-foreground"
              >
                <div className="mb-4 flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} className="size-5 text-chart-4" />
                  ))}
                </div>
                <p className="mb-6 leading-relaxed text-foreground/80">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-4">
                  <Image
                    alt={t.avatarAlt}
                    w={100}
                    h={100}
                    loading="lazy"
                    className="size-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold">{t.name}</p>
                    <p className="text-sm text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
