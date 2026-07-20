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
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import { Image } from '#/lib/img.tsx'
import { cn } from '#/lib/utils.ts'

const DEFAULT_REVIEWS: {
  quote: string
  name: string
  role?: string
  company?: string
  rating?: number
}[] = [
  {
    quote:
      "The team treated Biscuit like he was their own. They were so gentle and patient, and they explained everything in a way that put me completely at ease. We won't go anywhere else.",
    name: 'Sarah Bennett',
    role: 'Dog mom',
    company: 'Biscuit',
    rating: 5,
  },
  {
    quote:
      "When Luna got sick late at night, they saw us right away and stayed calm and kind through the whole scary ordeal. I'm so grateful for their compassion and care.",
    name: 'Marcus Lee',
    role: 'Cat dad',
    company: 'Luna',
    rating: 5,
  },
  {
    quote:
      'Friendly faces, a clean clinic, and a vet who clearly adores animals. Daisy actually wags her tail walking in the door now — that says it all!',
    name: 'Priya Sharma',
    role: 'Dog mom',
    company: 'Daisy',
    rating: 5,
  },
]

export const PetVeterinaryTestimonials = defineCapsule({
  name: 'PetVeterinaryTestimonials',
  description:
    "Warm friendly-clinical social-proof band for a veterinary clinic site, composing the TestimonialGrid kit composite into a staggered grid of chunky rounded-none review cards with hard offset shadows whose middle column steps down on desktop. Under an asymmetric header (left heading + lede, mono review-count meta right), each card opens with a zero-padded mono index numeral opposite a row of five primary stars, followed by a heartfelt pet-parent quote and a hairline-topped footer pairing a hairline-framed round monogram (or alt-driven avatar) with the reviewer's name and a mono role / pet-name meta line. Accepts a public `reviews` prop to override the quotes. Use it to build trust and reassure hesitant pet parents before they book a visit.",
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
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Loved by pets and their people'
    const subheading =
      props.subheading ??
      "Real words from the families and furry friends we're proud to care for."
    const reviews = props.reviews?.length ? props.reviews : DEFAULT_REVIEWS

    const items = reviews.map((r) => ({
      quote: r.quote,
      name: r.name,
      role: r.role,
      company: r.company,
      rating: r.rating ?? 5,
    }))

    const Star = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 0 0-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 0 0 .951-.69l1.07-3.292z" />
      </svg>
    )

    return (
      <section
        className={
          'bg-muted/40 py-20 sm:py-24' +
          (props.className ? ' ' + props.className : '')
        }
      >
        <Container size="xl" className="px-6">
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-16">
            <SectionHeading
              align="left"
              title={heading}
              subtitle={subheading}
              className="max-w-2xl gap-0"
              titleClassName="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem] lg:leading-[1.05]"
              subtitleClassName="mt-4 text-base text-muted-foreground sm:text-lg"
            />
            <MonoTag
              aria-hidden="true"
              tone="faint"
              className="shrink-0 md:pb-1"
            >
              {String(items.length).padStart(2, '0')} / reviews
            </MonoTag>
          </div>
          <TestimonialGrid columns={3}>
            {items.map((t, i) => {
              const __iv__ = t as {
                quote: string
                name: string
                role?: string
                company?: string
                meta?: string
                rating?: number
                avatarAlt?: string
              }
              const metaLabel = __iv__.role || __iv__.company || __iv__.meta
              return (
                <TestimonialCard
                  key={__iv__.name}
                  className={cn(
                    'gap-5 rounded-none border-2 border-foreground/15 bg-card p-6 shadow-[6px_6px_0_0] shadow-foreground/15 transition-transform duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:border-foreground/15 motion-reduce:transform-none sm:p-7',
                    i % 3 === 1 && 'lg:translate-y-8',
                  )}
                >
                  <div className="flex items-center justify-between">
                    <MonoTag aria-hidden="true" tone="faint">
                      {String(i + 1).padStart(2, '0')}
                    </MonoTag>
                    <span
                      aria-hidden="true"
                      className="flex items-center gap-0.5 text-primary"
                    >
                      {Array.from({ length: __iv__.rating ?? 5 }).map(
                        (_, starIndex) => (
                          <Star key={starIndex} className="size-3.5" />
                        ),
                      )}
                    </span>
                  </div>
                  <TestimonialQuote className="text-sm leading-relaxed text-foreground sm:text-base">
                    {__iv__.quote}
                  </TestimonialQuote>
                  <TestimonialAuthor className="border-t-2 border-foreground/10 pt-4">
                    {__iv__.avatarAlt ? (
                      <Image
                        alt={__iv__.avatarAlt}
                        w={80}
                        h={80}
                        loading="lazy"
                        className="size-9 rounded-full border-2 border-foreground/15 object-cover"
                      />
                    ) : (
                      <span
                        aria-hidden="true"
                        className="grid size-9 shrink-0 place-items-center rounded-full border-2 border-foreground/15 bg-secondary text-sm font-bold text-secondary-foreground"
                      >
                        {__iv__.name.charAt(0)}
                      </span>
                    )}
                    <span className="flex min-w-0 flex-col">
                      <TestimonialName>{__iv__.name}</TestimonialName>
                      {metaLabel && (
                        <TestimonialMeta className="font-mono text-[10px] uppercase tracking-[0.12em]">
                          {metaLabel}
                        </TestimonialMeta>
                      )}
                    </span>
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
