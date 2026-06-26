import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * ManufacturingCta — a dark closing call-to-action band for a precision-
 * manufacturing site. On a foreground-colored, centered block: a large heading,
 * a supporting paragraph, dual CTAs (a solid background-on-foreground button plus
 * an outlined button) and a small note line beneath. Both CTAs route through
 * useNavigate. Bold, industrial, conversion-focused. Use as the final
 * conversion prompt before the footer on machine-shop, fabricator or contract-
 * manufacturer pages. Renders fully with no props via baked-in defaults.
 */
export const ManufacturingCta = defineComponent({
  name: 'ManufacturingCta',
  description:
    'A dark closing call-to-action band for a precision-manufacturing site: on a foreground-colored centered block, a large heading, a supporting paragraph, dual CTAs (a solid background-on-foreground button plus an outlined button) and a small note line beneath. Both CTAs route through useNavigate. Bold, industrial, conversion-focused. Use as the final conversion prompt before the footer on machine-shop, fabricator or contract-manufacturer pages.',
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    primaryCta: z.string().optional(),
    secondaryCta: z.string().optional(),
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heading = props.heading ?? 'Ready to Start Your Project?'
    const description =
      props.description ??
      'Get a detailed quote within 24 hours. Our engineers review every submission for manufacturability and will suggest cost-saving alternatives when possible.'
    const primaryCta = props.primaryCta ?? 'Request a Quote'
    const secondaryCta = props.secondaryCta ?? 'Call (206) 555-1234'
    const note =
      props.note ??
      'Located in Kent, Washington • Serving customers nationwide since 1989'

    return (
      <section className={cn('bg-foreground py-20 lg:py-28', props.className)}>
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-semibold tracking-tight text-background sm:text-4xl">
            {heading}
          </h2>
          <p className="mt-4 text-lg text-background/70">{description}</p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <button
              type="button"
              onClick={() => go(primaryCta)}
              className="inline-flex items-center justify-center rounded-md bg-background px-8 py-4 font-medium text-foreground transition-colors hover:bg-background/90"
            >
              {primaryCta}
            </button>
            <button
              type="button"
              onClick={() => go(secondaryCta)}
              className="inline-flex items-center justify-center rounded-md border border-border px-8 py-4 font-medium text-background transition-colors hover:bg-background/10"
            >
              {secondaryCta}
            </button>
          </div>
          <p className="mt-6 text-sm text-background/60">{note}</p>
        </div>
      </section>
    )
  },
})
