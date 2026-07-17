import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { TestimonialGrid } from '#/section-kit/TestimonialGrid.tsx'

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

    return (
      <TestimonialGrid
        eyebrow={eyebrow}
        heading={heading}
        items={items.map((t) => ({
          quote: t.quote,
          name: t.name,
          role: t.role,
          rating: 5,
          avatarAlt: t.avatarAlt,
        }))}
        columns={3}
        cardClassName="border-0 bg-transparent p-0"
        className={cn(
          'px-4 pt-28 pb-20 sm:px-6 md:pt-32 md:pb-28 lg:px-8',
          props.className,
        )}
      />
    )
  },
})
