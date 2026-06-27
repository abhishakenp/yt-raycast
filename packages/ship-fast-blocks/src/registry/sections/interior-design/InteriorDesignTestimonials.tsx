import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

/**
 * InteriorDesignTestimonials — three-up client testimonials grid for an upscale
 * interior-design / architecture studio. A centered uppercase eyebrow + light-
 * weight heading above a responsive three-column grid of quote blocks, each with
 * a five-star row, an italic relaxed-leading quote and an author row pairing a
 * round headshot with a name + role/project line. Editorial, warm and trust-
 * building. Headshots use the alt-driven Image component. Use as social proof
 * for interior designers, design studios or architecture firms. Renders fully
 * with no props via baked-in defaults.
 */
export const InteriorDesignTestimonials = defineCapsule({
  name: 'InteriorDesignTestimonials',
  description:
    'Three-up client testimonials grid for an upscale interior-design / architecture studio: a centered uppercase eyebrow + light-weight heading above a responsive three-column grid of quote blocks, each with a five-star row, an italic relaxed quote and an author row pairing a round headshot with a name + role/project line. Editorial, warm and trust-building; headshots use the alt-driven Image component. Use as social proof for interior designers, design studios or architecture firms.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
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
    const eyebrow = props.eyebrow ?? 'Testimonials'
    const heading = props.heading ?? 'What our clients say'
    const items = props.items?.length
      ? props.items
      : [
          {
            quote:
              'Atelier transformed our Victorian into a space that honors its history while feeling completely contemporary. Their attention to detail and understanding of how we live made all the difference.',
            name: 'Sarah Chen',
            role: 'Pacific Heights Residence',
            avatarAlt:
              'Professional headshot of a smiling woman with shoulder-length dark hair wearing a navy blazer',
          },
          {
            quote:
              'The team at Atelier understood our brand immediately. Our new office space has transformed how we work and how clients perceive us. Truly exceptional work.',
            name: 'Michael Torres',
            role: 'CEO, Meridian Ventures',
            avatarAlt:
              'Professional headshot of a smiling man in his 40s with short gray hair wearing a crisp white dress shirt',
          },
          {
            quote:
              'Working with Atelier on our inn was a dream. They captured the essence of wine country elegance while creating spaces that feel intimate and welcoming.',
            name: 'Emma Richardson',
            role: 'Owner, Calistoga Inn',
            avatarAlt:
              'Professional headshot of a smiling woman with blonde hair wearing a sage green blouse and simple gold jewelry',
          },
        ]

    const Star = () => (
      <svg
        width="16"
        height="16"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="text-foreground"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    return (
      <section
        className={cn('px-4 py-20 sm:px-6 md:py-32 lg:px-8', props.className)}
      >
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-16 max-w-2xl text-center md:mb-24">
            <p className="mb-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {eyebrow}
            </p>
            <h2 className="mb-6 text-3xl font-light text-foreground md:text-4xl">
              {heading}
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3 md:gap-12">
            {items.map((t) => (
              <blockquote key={t.name} className="space-y-6">
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} />
                  ))}
                </div>
                <p className="italic leading-relaxed text-foreground/80">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-4">
                  <Image
                    alt={t.avatarAlt}
                    w={100}
                    h={100}
                    className="size-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium text-foreground">{t.name}</p>
                    <p className="text-sm text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </blockquote>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
