import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * InvestingTestimonials — star-rated testimonial wall for an investing / fintech
 * page. A muted section band with a centered heading + lead above a responsive
 * 1/2/3-column grid of review cards; each card has a five-star rating row, a
 * quote, and an investor avatar with name + role. Tokens only, no links. Use to
 * present social proof from customers of a brokerage, trading app, robo-advisor
 * or crypto exchange. Renders fully with no props via six baked-in reviews.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  TestimonialGrid,
  TestimonialCard,
  TestimonialQuote,
  TestimonialAuthor,
  TestimonialName,
  TestimonialMeta,
} from '#/section-kit/TestimonialGrid.tsx'
export const InvestingTestimonials = defineCapsule({
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
    return (
      <section
        id="reviews"
        className={cn('bg-muted/50 py-24', props.className)}
      >
        <Container>
          <SectionHeading
            title={heading}
            subtitle={description}
            className="mb-16 max-w-2xl gap-0"
            titleClassName="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl"
            subtitleClassName="text-lg text-muted-foreground"
          />
          <TestimonialGrid columns={3}>
            {items.map((t) => {
              const __iv__ = t as {
                quote: string
                name: string
                role?: string
                company?: string
                meta?: string
                rating?: number
                avatarAlt?: string
              }
              return (
                <TestimonialCard key={__iv__.name}>
                  <TestimonialQuote>{__iv__.quote}</TestimonialQuote>
                  <TestimonialAuthor>
                    <TestimonialName>{__iv__.name}</TestimonialName>
                    {(__iv__.role || __iv__.company || __iv__.meta) && (
                      <TestimonialMeta>
                        {__iv__.role || __iv__.company || __iv__.meta}
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
