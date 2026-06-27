import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

/**
 * DatingAppTestimonials — a 3-up "love stories" testimonial grid for a dating /
 * matchmaking app. A centered heading + supporting paragraph above a responsive
 * 1/2/3-column grid of soft muted cards, each with a round couple avatar beside the
 * pair's names and a "matched" date, a row of five primary stars, and an italic
 * quote. All avatars are alt-driven <Image>. Use as social proof / success stories
 * for dating apps, singles platforms, or relationship products. Renders fully with
 * no props via baked-in couple-story defaults.
 */
export const DatingAppTestimonials = defineCapsule({
  name: 'DatingAppTestimonials',
  description:
    "3-up 'love stories' testimonial grid for a dating / matchmaking app: a centered heading + supporting paragraph above a responsive 1/2/3-column grid of soft muted cards, each with a round couple avatar beside the pair's names and a 'matched' date, a row of five primary stars, and an italic quote. Avatars are alt-driven <Image>. Use as social proof / success stories for dating apps, singles platforms, or relationship products.",
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    items: z
      .array(
        z.object({
          names: z.string(),
          meta: z.string(),
          quote: z.string(),
          avatarAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const testimonialsHeading =
      props.heading ?? 'Love stories that started here'
    const testimonialsDesc =
      props.description ?? 'Real couples who found each other on HeartLink.'
    const testimonialItems = props.items?.length
      ? props.items
      : [
          {
            names: 'Jessica & Marcus',
            meta: 'Matched March 2024',
            quote:
              "The compatibility quiz actually worked! We discovered we both love hiking and craft beer before we even met. First date was at a brewery—now we're planning our wedding there.",
            avatarAlt:
              'happy couple portrait of Jessica and Marcus smiling together',
          },
          {
            names: 'David & Priya',
            meta: 'Matched January 2024',
            quote:
              "I was skeptical about dating apps until HeartLink. The video date feature let us connect before meeting. Six months later, we're moving in together!",
            avatarAlt: 'happy couple portrait of David and Priya at a park',
          },
          {
            names: 'Michael & Elena',
            meta: 'Matched November 2023',
            quote:
              "We met at a HeartLink singles mixer in Austin. The app made me feel safe enough to try meeting in person, and I'm so glad I did. Best decision ever!",
            avatarAlt:
              'happy couple portrait of Michael and Elena embracing outdoors',
          },
        ]

    const Star = () => (
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className="size-5 text-primary"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    return (
      <section className={cn('bg-background py-24', props.className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
              {testimonialsHeading}
            </h2>
            <p className="text-lg text-muted-foreground">{testimonialsDesc}</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {testimonialItems.map((t) => (
              <div key={t.names} className="rounded-2xl bg-muted p-8">
                <div className="mb-6 flex items-center gap-4">
                  <Image
                    alt={t.avatarAlt}
                    w={200}
                    h={200}
                    className="size-16 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-foreground">{t.names}</p>
                    <p className="text-sm text-muted-foreground">{t.meta}</p>
                  </div>
                </div>
                <div className="mb-4 flex gap-1">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} />
                  ))}
                </div>
                <p className="italic leading-relaxed text-muted-foreground">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
