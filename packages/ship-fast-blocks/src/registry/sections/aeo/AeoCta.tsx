import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import {
  CtaBand,
  CtaBandInner,
  CtaBandEyebrow,
  CtaBandTitle,
  CtaBandSubtitle,
} from '#/section-kit/CtaBand.tsx'
import {
  SaasMutationSpinner,
  SaasPlanActionButton,
} from '../saas/saas-interactions.tsx'
import { saasLakebed } from '../saas/saas-lakebed.ts'

/**
 * AeoCta — full-width primary call-to-action band for an Answer-Engine-
 * Optimization (AEO) SaaS. Thin configuration over the shared CtaBand composite:
 * an eyebrow, a conversion headline ("Win the AI answer"), a supporting line,
 * and two routable pill actions (filled "Start Free" + outlined "Book demo") on
 * a primary surface. Use as the closing conversion band on AEO, generative-search
 * visibility, or brand-citation landing pages. Renders fully with no props.
 */
export const AeoCta = defineCapsule({
  name: 'AeoCta',
  description:
    "Full-width primary call-to-action band for an Answer-Engine-Optimization (AEO) product backed by shared Lakebed conversion state: an eyebrow, a conversion headline about winning the AI answer, a supporting subtitle, and scoped fullstack pill actions (filled 'Start Free' + outlined 'Book demo') on a primary surface. Use as the closing conversion band on AEO, generative-search visibility, or brand-citation landing pages.",
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
  lakebed: saasLakebed,
  component: ({ props, lakebed }) => {
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
      <CtaBand tone="primary" className={props.className}>
        <CtaBandInner align={props.align ?? 'center'}>
          <CtaBandEyebrow>
            {props.eyebrow ?? 'Answer Engine Optimization'}
          </CtaBandEyebrow>
          <CtaBandTitle>{props.title ?? 'Win the AI answer'}</CtaBandTitle>
          <CtaBandSubtitle>
            {props.subtitle ??
              'Start tracking how AI engines describe your brand today — and turn AI answers into your next growth channel.'}
          </CtaBandSubtitle>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            {actions.map((action) => {
              const target = action.target ?? action.label
              const isPrimary = (action.variant ?? 'primary') === 'primary'
              return (
                <SaasPlanActionButton
                  key={`${action.label}:${target}`}
                  lakebed={lakebed}
                  intentLabel={target}
                  plan={action.label}
                  source="cta"
                  pendingChildren={
                    <>
                      <SaasMutationSpinner className="size-4" />
                      {isPrimary ? 'Starting' : 'Sending'}
                    </>
                  }
                  className={`inline-flex min-w-40 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-colors disabled:pointer-events-none disabled:opacity-70 ${
                    isPrimary
                      ? 'bg-primary-foreground text-primary hover:bg-primary-foreground/90'
                      : 'border border-primary-foreground/35 text-primary-foreground hover:bg-primary-foreground/10'
                  }`}
                >
                  {action.label}
                </SaasPlanActionButton>
              )
            })}
          </div>
        </CtaBandInner>
      </CtaBand>
    )
  },
})
