import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { CtaBand } from '#/section-kit/CtaBand.tsx'

/**
 * AeoCta — full-width primary call-to-action band for an Answer-Engine-
 * Optimization (AEO) SaaS. Thin configuration over the shared CtaBand composite:
 * an eyebrow, a conversion headline ("Win the AI answer"), a supporting line,
 * and two routable pill actions (filled "Start Free" + outlined "Book demo") on
 * a primary surface. Use as the closing conversion band on AEO, generative-search
 * visibility, or brand-citation landing pages. Renders fully with no props.
 */
export const AeoCta = defineComponent({
  name: 'AeoCta',
  description:
    "Full-width primary call-to-action band for an Answer-Engine-Optimization (AEO) product built on the shared CtaBand composite: an eyebrow, a conversion headline about winning the AI answer, a supporting subtitle, and two routable pill actions (filled 'Start Free' + outlined 'Book demo') on a primary surface. Use as the closing conversion band on AEO, generative-search visibility, or brand-citation landing pages.",
  props: z.object({
    eyebrow: z.string().optional(),
    title: z.string().optional(),
    subtitle: z.string().optional(),
    actions: z
      .array(
        z.object({
          label: z.string(),
          target: z.string().optional(),
          variant: z
            .union([
              z.literal('primary'),
              z.literal('outline'),
              z.literal('ghost'),
            ])
            .optional(),
        }),
      )
      .optional(),
    align: z.union([z.literal('center'), z.literal('left')]).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const actions = props.actions?.length
      ? props.actions
      : [
          {
            label: 'Start Free',
            target: 'Start Free',
            variant: 'primary' as const,
          },
          {
            label: 'Book demo',
            target: 'Book demo',
            variant: 'outline' as const,
          },
        ]

    return (
      <CtaBand
        tone="primary"
        eyebrow={props.eyebrow ?? 'Answer Engine Optimization'}
        title={props.title ?? 'Win the AI answer'}
        subtitle={
          props.subtitle ??
          'Start tracking how AI engines describe your brand today — and turn AI answers into your next growth channel.'
        }
        actions={actions}
        align={props.align ?? 'center'}
        className={props.className}
      />
    )
  },
})
