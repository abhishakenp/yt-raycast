import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

/**
 * DentalTestimonials — patient-testimonials grid for a dental practice site. On a
 * soft muted band: a centered eyebrow + heading + lede above a responsive
 * 1-to-3 column grid of card-framed reviews, each with a five-star primary
 * rating row, a quoted testimonial, and a footer pairing a round patient avatar
 * with the patient name and a location / since-date meta line. Avatars use the
 * alt-driven Image component. Use to surface social proof for dentists, dental
 * offices, orthodontists, or clinics.
 */
export const DentalTestimonials = defineComponent({
  name: 'DentalTestimonials',
  description:
    'Patient-testimonials grid for a dental practice site on a soft muted band: a centered eyebrow + heading + lede above a responsive 1-to-3 column grid of card-framed reviews, each with a five-star primary rating row, a quoted testimonial, and a footer pairing a round patient avatar with the patient name and a location / since-date meta line. Avatars use the Image component. Use to surface social proof for dentists, dental offices, orthodontists, or clinics.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    description: z.string().optional(),
    items: z
      .array(
        z.object({
          quote: z.string(),
          name: z.string(),
          meta: z.string(),
          avatarAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const testimonialsEyebrow = props.eyebrow ?? 'Patient Stories'
    const testimonialsHeading = props.heading ?? 'What our patients are saying'
    const testimonialsDesc =
      props.description ??
      "Don't just take our word for it — hear from real patients who have transformed their smiles with us."
    const testimonialItems = props.items?.length
      ? props.items
      : [
          {
            quote:
              'I used to be terrified of the dentist, but Dr. Chen and her team completely changed that. The office is so calming, and they explain every step. I actually look forward to my cleanings now!',
            name: 'Jennifer Martinez',
            meta: 'Portland, OR • Patient since 2021',
            avatarAlt:
              'Portrait of Jennifer Martinez, female patient with bright confident smile',
          },
          {
            quote:
              'Got my Invisalign done here with Dr. Torres and the results are incredible! The process was smooth, payments were manageable, and my teeth look amazing. Best decision I made for my confidence.',
            name: 'David Thompson',
            meta: 'Beaverton, OR • Patient since 2022',
            avatarAlt:
              'Portrait of David Thompson, male patient with healthy white smile',
          },
          {
            quote:
              'Dr. Watson is amazing with kids! My 5-year-old was nervous for her first filling, but Dr. Watson made it fun and painless. The whole family comes here now — our 3 kids love the treasure box!',
            name: 'Amanda Foster',
            meta: 'Lake Oswego, OR • Patient since 2020',
            avatarAlt:
              'Portrait of Amanda Foster, mother and patient with warm genuine smile',
          },
          {
            quote:
              'Had a dental implant done by Dr. Park after losing a tooth in a bike accident. The procedure was way easier than I expected, and the new tooth looks completely natural. Highly recommend!',
            name: 'Robert Chen',
            meta: 'Hillsboro, OR • Patient since 2023',
            avatarAlt:
              'Portrait of Robert Chen, active male patient with athletic appearance',
          },
          {
            quote:
              'As someone without dental insurance, the membership plan has been a lifesaver. I get regular cleanings and save money on my fillings. The team never makes me feel judged about my budget.',
            name: 'Sarah Williams',
            meta: 'Portland, OR • Member since 2022',
            avatarAlt:
              'Portrait of Sarah Williams, young professional patient with natural smile',
          },
          {
            quote:
              'Came in for a same-day emergency appointment when I cracked my tooth on a Friday evening. They fit me in within an hour and fixed it that same visit. The care and speed were incredible!',
            name: 'Michael Brooks',
            meta: 'Tigard, OR • Patient since 2024',
            avatarAlt:
              'Portrait of Michael Brooks, professional male patient with grateful expression',
          },
        ]

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
      <section className={cn('bg-muted py-24', props.className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-wider text-primary">
              {testimonialsEyebrow}
            </span>
            <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
              {testimonialsHeading}
            </h2>
            <p className="text-lg text-muted-foreground">{testimonialsDesc}</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {testimonialItems.map((t) => (
              <div key={t.name} className="rounded-2xl bg-card p-8 shadow-sm">
                <div className="mb-4 flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="size-5 text-primary" />
                  ))}
                </div>
                <p className="mb-6 leading-relaxed text-card-foreground">
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
                    <div className="font-semibold text-card-foreground">
                      {t.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {t.meta}
                    </div>
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
