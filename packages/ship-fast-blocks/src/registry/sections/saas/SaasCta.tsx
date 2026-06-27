import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  SaasMutationSpinner,
  SaasPlanActionButton,
} from './saas-interactions.tsx'
import { saasLakebed } from './saas-lakebed.ts'

/**
 * SaasCta — a full-width conversion band for the bottom of a SaaS / AI-product
 * landing page. Thin configuration over the shared `CtaBand` composite at
 * tone="primary": a centered headline + supporting line over a primary surface,
 * a high-contrast "Start free trial" pill (auto-inverted on the primary band),
 * an outlined "Book demo" pill, and a small reassurance note carried in the
 * eyebrow. Both CTAs route through useNavigate. Use as the closing
 * call-to-action for SaaS, API, or B2B product pages. Renders fully with no
 * props via baked-in defaults.
 */
export const SaasCta = defineCapsule({
  name: 'SaasCta',
  description:
    "Full-width conversion band for the bottom of a SaaS / AI-product landing page backed by shared Lakebed conversion state: a centered headline + supporting line over a primary surface, a high-contrast 'Start free trial' pill, an outlined 'Book demo' pill, and a small reassurance note in the eyebrow. CTA buttons record trial/demo intent instead of dead route-only navigation. Use as the closing call-to-action for SaaS, API, or B2B product pages.",
  props: z.object({
    /** Centered headline on the band. */
    heading: z.string().optional(),
    /** Supporting line under the headline. */
    subheading: z.string().optional(),
    /** Primary contrast CTA label. */
    primaryCta: z.string().optional(),
    /** Optional outlined secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Small reassurance note shown as the band eyebrow. */
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: saasLakebed,
  component: ({ props, lakebed }) => {
    const heading = props.heading ?? 'Ready to reclaim your day?'
    const subheading =
      props.subheading ??
      'Join 12,000+ professionals who let Chronos AI handle the scheduling. Get started in under two minutes — no setup, no hassle.'
    const primaryCta = props.primaryCta ?? 'Start free trial'
    const secondaryCta = props.secondaryCta ?? 'Book demo'
    const note = props.note ?? 'No credit card required • 14-day free trial'

    return (
      <section
        className={cn(
          'bg-primary py-20 text-primary-foreground',
          props.className,
        )}
      >
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-7 px-6 text-center">
          <p className="text-sm font-medium text-primary-foreground/80">
            {note}
          </p>
          <div className="flex flex-col gap-4">
            <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">
              {heading}
            </h2>
            <p className="mx-auto max-w-2xl text-base text-primary-foreground/80 md:text-lg">
              {subheading}
            </p>
          </div>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <SaasPlanActionButton
              lakebed={lakebed}
              intentLabel={primaryCta}
              plan={primaryCta}
              source="cta"
              pendingChildren={
                <>
                  <SaasMutationSpinner className="size-4" />
                  Starting
                </>
              }
              className="inline-flex min-w-40 items-center justify-center gap-2 rounded-full bg-primary-foreground px-6 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary-foreground/90 disabled:pointer-events-none disabled:opacity-70"
            >
              {primaryCta}
            </SaasPlanActionButton>
            {secondaryCta ? (
              <SaasPlanActionButton
                lakebed={lakebed}
                intentLabel={secondaryCta}
                source="cta"
                pendingChildren={
                  <>
                    <SaasMutationSpinner className="size-4" />
                    Sending
                  </>
                }
                className="inline-flex min-w-40 items-center justify-center gap-2 rounded-full border border-primary-foreground/35 px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10 disabled:pointer-events-none disabled:opacity-70"
              >
                {secondaryCta}
              </SaasPlanActionButton>
            ) : null}
          </div>
        </div>
      </section>
    )
  },
})
