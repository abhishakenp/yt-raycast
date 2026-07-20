import { defineCapsule } from '#/capsules/openui.ts'
import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { z } from 'zod/v4'

import { MonoTag } from '#/section-kit/Decor.tsx'
import {
  TestimonialGrid,
  TestimonialCard,
  TestimonialQuote,
  TestimonialAuthor,
  TestimonialName,
  TestimonialMeta,
} from '#/section-kit/TestimonialGrid.tsx'

export const WeddingTestimonials = defineCapsule({
  name: 'WeddingTestimonials',
  description:
    "Romantic-editorial well-wishes band for a wedding site on the shared TestimonialGrid composite: an asymmetric header (mono index eyebrow + serif-italic heading + intro, mono count meta on the right) above a staggered three-column grid of sharp hairline-framed cards whose middle column steps down on desktop. Each card opens with a giant ghost serif quotation mark, a serif-italic well-wish, and a hairline-topped footer pairing the sender's name with a mono relationship label. No star ratings — just heartfelt messages. Use to share blessings and congratulations on a wedding invitation or celebration page.",
  props: z.object({
    heading: z.string().optional(),
    wishes: z
      .array(
        z.object({
          quote: z.string(),
          name: z.string(),
          relation: z.string().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Well wishes'
    const wishes = props.wishes?.length
      ? props.wishes
      : [
          {
            quote:
              "Watching you two grow together has been the greatest joy. You bring out the very best in each other, and I couldn't be happier to call him family.",
            name: 'Sophie',
            relation: "Bride's sister",
          },
          {
            quote:
              'From late-night talks in our tiny dorm to your wedding day — I always knew your heart would find someone who deserves it. Wishing you a lifetime of love.',
            name: 'Maya',
            relation: 'College roommate',
          },
          {
            quote:
              "A son could not have chosen better. You've welcomed our family with open arms and an even bigger heart. Here's to forever, with all our love.",
            name: 'Robert',
            relation: "Groom's father",
          },
        ]

    return (
      <section
        className={cn(
          'bg-background pt-28 pb-20 lg:pt-32 lg:pb-28',
          props.className,
        )}
      >
        <Container>
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-16">
            <div className="max-w-2xl">
              <MonoTag className="mb-4 block">Kind Words</MonoTag>
              <h2 className="font-serif text-4xl font-normal italic leading-[1.05] tracking-tight text-foreground sm:text-5xl">
                {heading}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Notes from our favorite people
              </p>
            </div>
            <MonoTag
              aria-hidden="true"
              tone="faint"
              className="shrink-0 tabular-nums md:pb-2"
            >
              {String(wishes.length).padStart(2, '0')} / notes
            </MonoTag>
          </div>
          <TestimonialGrid columns={3}>
            {wishes
              .map((w) => ({
                quote: w.quote,
                name: w.name,
                role: w.relation,
              }))
              .map((t, i) => {
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
                  <TestimonialCard
                    key={__iv__.name}
                    className={cn(
                      'relative gap-6 overflow-hidden rounded-none border-border bg-background p-7 sm:p-8',
                      i % 3 === 1 && 'lg:translate-y-8',
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -top-6 right-4 select-none font-serif text-[7rem] italic leading-none text-foreground/[0.06]"
                    >
                      &rdquo;
                    </span>
                    <TestimonialQuote className="relative font-serif text-lg font-normal italic leading-relaxed tracking-tight text-foreground">
                      {__iv__.quote}
                    </TestimonialQuote>
                    <TestimonialAuthor className="mt-auto items-baseline justify-between border-t border-border pt-5">
                      <TestimonialName className="text-sm font-semibold text-foreground">
                        {__iv__.name}
                      </TestimonialName>
                      {(__iv__.role || __iv__.company || __iv__.meta) && (
                        <TestimonialMeta className="font-mono text-[10px] uppercase tracking-[0.15em]">
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
