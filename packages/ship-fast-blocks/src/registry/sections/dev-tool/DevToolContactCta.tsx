import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  SaasMutationSpinner,
  SaasPlanActionButton,
} from '../saas/saas-interactions.tsx'
import { saasLakebed } from '../saas/saas-lakebed.ts'

/**
 * DevToolContactCta — a dark closing call-to-action band for a developer tool /
 * API platform. A centered rounded inverted panel (dark foreground surface) with
 * a bold headline, a supporting paragraph, dual CTAs (filled primary + outline-
 * on-dark secondary), and a small footnote. Both CTAs route through useNavigate.
 * Use as the final conversion section before the footer for developer tools,
 * API platforms, backend-as-a-service, or technical SaaS.
 */
export const DevToolContactCta = defineCapsule({
  name: 'DevToolContactCta',
  description:
    'Dark closing call-to-action band for a developer tool / API platform backed by shared Lakebed conversion state: a centered rounded inverted panel with a bold headline, supporting paragraph, dual scoped fullstack CTAs, and a small footnote. Use as the final conversion section before the footer for developer tools, API platforms, backend-as-a-service, or technical SaaS.',
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    primaryCta: z.string().optional(),
    secondaryCta: z.string().optional(),
    footnote: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: saasLakebed,
  component: ({ props, lakebed }) => {
    const heading = props.heading ?? 'Ready to ship faster?'
    const description =
      props.description ??
      'Join 50,000+ developers building with DevStack. Start free, scale as you grow. No credit card required.'
    const primaryCta = props.primaryCta ?? 'Start Building Free'
    const secondaryCta = props.secondaryCta ?? 'Talk to Sales'
    const footnote =
      props.footnote ?? 'Free forever plan includes 10,000 requests/month'

    return (
      <section
        className={cn('py-20 lg:py-28', props.className)}
        aria-labelledby="cta-heading"
      >
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-foreground p-8 text-center lg:p-16">
            <h2
              id="cta-heading"
              className="mb-4 text-3xl font-bold text-background sm:text-4xl"
            >
              {heading}
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-background/70">
              {description}
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
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
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-8 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-70"
              >
                {primaryCta}
              </SaasPlanActionButton>
              <SaasPlanActionButton
                lakebed={lakebed}
                intentLabel={secondaryCta}
                plan={secondaryCta}
                source="cta"
                pendingChildren={
                  <>
                    <SaasMutationSpinner className="size-4" />
                    Sending
                  </>
                }
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-background/30 bg-transparent px-8 py-3 font-semibold text-background transition-colors hover:bg-background/10 disabled:pointer-events-none disabled:opacity-70"
              >
                {secondaryCta}
              </SaasPlanActionButton>
            </div>
            <p className="mt-6 text-sm text-background/50">{footnote}</p>
          </div>
        </div>
      </section>
    )
  },
})
