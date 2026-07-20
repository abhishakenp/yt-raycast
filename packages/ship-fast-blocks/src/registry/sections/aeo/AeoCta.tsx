import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
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
 * AeoCta — "Answer Terminal" closing conversion band for an Answer-Engine-
 * Optimization (AEO) SaaS on a primary surface: a bracketed mono eyebrow, an
 * oversized fluid display headline, a supporting line, and Lakebed-backed
 * actions — a hard-offset-shadow inverted block plus a bracketed mono ghost
 * button — over a giant ghost "[1]" citation watermark with hairline top and
 * bottom edge rules. Use as the closing conversion band on AEO,
 * generative-search visibility, or brand-citation landing pages. Renders fully
 * with no props.
 */
export const AeoCta = defineCapsule({
  name: 'AeoCta',
  description:
    "Terminal-styled full-width closing CTA band for an Answer-Engine-Optimization (AEO) product backed by shared Lakebed conversion state: a bracketed mono eyebrow, an oversized fluid display headline about winning the AI answer, a supporting subtitle, and scoped fullstack actions (hard-offset-shadow inverted 'Start Free' block + bracketed mono ghost 'Book demo') on a primary surface with a giant ghost '[1]' citation watermark. Use as the closing conversion band on AEO, generative-search visibility, or brand-citation landing pages.",
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
      <CtaBand
        tone="primary"
        className={cn('relative overflow-hidden', props.className)}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-3 -top-5 select-none font-mono text-[8rem] font-bold leading-none text-primary-foreground/[0.06] sm:-right-6 sm:-top-10 sm:text-[14rem]"
        >
          [1]
        </span>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 border-t border-primary-foreground/20"
        />
        <CtaBandInner
          align={props.align ?? 'center'}
          className="relative py-16 sm:py-24"
        >
          <CtaBandEyebrow className="font-mono text-[11px] tracking-[0.2em] opacity-70">
            <span aria-hidden="true">[ </span>
            {props.eyebrow ?? 'Answer Engine Optimization'}
            <span aria-hidden="true"> ]</span>
          </CtaBandEyebrow>
          <CtaBandTitle className="text-[clamp(2.5rem,6vw,5rem)] font-semibold leading-[0.95] tracking-tighter">
            {props.title ?? 'Win the AI answer'}
          </CtaBandTitle>
          <CtaBandSubtitle>
            {props.subtitle ??
              'Start tracking how AI engines describe your brand today — and turn AI answers into your next growth channel.'}
          </CtaBandSubtitle>
          <div className="grid w-full grid-cols-2 items-center gap-3 sm:flex sm:w-auto sm:flex-row sm:justify-center">
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
                  className={cn(
                    'inline-flex min-w-0 items-center justify-center gap-2 rounded-none px-3 py-3 font-mono text-sm font-semibold uppercase tracking-[0.12em] transition-[background-color,box-shadow,transform] duration-150 active:translate-y-px disabled:pointer-events-none disabled:opacity-70 sm:min-w-40 sm:px-6',
                    isPrimary
                      ? 'bg-primary-foreground text-primary shadow-[5px_5px_0_0] shadow-primary-foreground/25 hover:bg-primary-foreground/90 active:shadow-none'
                      : 'border border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground hover:text-primary',
                  )}
                >
                  {isPrimary ? (
                    action.label
                  ) : (
                    <>
                      <span aria-hidden="true">[</span>
                      {action.label}
                      <span aria-hidden="true">]</span>
                    </>
                  )}
                </SaasPlanActionButton>
              )
            })}
          </div>
        </CtaBandInner>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 border-b border-primary-foreground/20"
        />
      </CtaBand>
    )
  },
})
