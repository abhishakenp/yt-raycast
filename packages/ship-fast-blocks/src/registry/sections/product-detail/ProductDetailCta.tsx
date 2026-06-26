import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { CtaBand } from '#/section-kit/CtaBand.tsx'

export const ProductDetailCta = defineComponent({
  name: 'ProductDetailCta',
  description:
    'Closing call-to-action band for the Product Detail page family, styled for the premium Aurora brand. Wraps the shared CtaBand composite with a primary tone and centered alignment to drive the final conversion on a single-product detail page for the Aurora Pro Headphones. Exposes optional eyebrow, title, subtitle, and actions props so prompts can retarget the messaging and buttons, while Aurora-branded defaults — free shipping, 30-day returns, and Add to Cart / Learn More actions — keep the section ready to ship. Use as the last band of a product detail page or as a focused CTA inside a larger generated site.',
  props: z.object({
    eyebrow: z.string().optional(),
    title: z.string().optional(),
    subtitle: z.string().optional(),
    actions: z
      .array(
        z.object({
          label: z.string(),
          target: z.string().optional(),
          variant: z.enum(['primary', 'outline', 'ghost']).optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Ready when you are'
    const title = props.title ?? 'Get yours today'
    const subtitle =
      props.subtitle ??
      'Free express shipping and a no-questions 30-day return — premium sound, zero risk.'
    const actions = props.actions?.length
      ? props.actions
      : [
          {
            label: 'Add to Cart',
            target: 'Overview',
            variant: 'primary' as const,
          },
          {
            label: 'Learn More',
            target: 'Features',
            variant: 'outline' as const,
          },
        ]

    return (
      <CtaBand
        eyebrow={eyebrow}
        title={title}
        subtitle={subtitle}
        actions={actions}
        tone="primary"
        align="center"
        className={props.className}
      />
    )
  },
})
