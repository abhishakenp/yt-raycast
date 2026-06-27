import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  SaasMutationSpinner,
  SaasPlanActionButton,
} from '../saas/saas-interactions.tsx'
import { saasLakebed } from '../saas/saas-lakebed.ts'

/**
 * AiProductSteps — a numbered onboarding / how-it-works timeline for a clean,
 * light AI SaaS / product page. Sits on a subtle muted band: a centered heading
 * + paragraph above a responsive 3-column grid of steps, each with a large
 * near-black rounded numbered tile, a title, and a description, connected by a
 * faint vertical rule on desktop, with a centered near-black CTA button below.
 * The CTA routes through useNavigate. Use to explain a simple sign-up-to-value
 * flow for AI tools, SaaS apps, or any product with quick onboarding. Renders
 * fully with no props via a built-in 3-step flow.
 */
export const AiProductSteps = defineCapsule({
  name: 'AiProductSteps',
  description:
    'Numbered onboarding / how-it-works timeline for a clean, light AI SaaS / product page on a subtle muted band: a centered heading and paragraph above a responsive 3-column grid of steps, each with a large near-black rounded numbered tile, a title, and a description, connected by a faint vertical rule on desktop, with a centered near-black fullstack CTA button below. The CTA writes to shared Lakebed conversion state. Use to explain a simple sign-up-to-value flow for AI tools, SaaS apps, or any product with quick onboarding.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    description: z.string().optional(),
    /** Centered CTA button label below the steps. */
    cta: z.string().optional(),
    /** Steps (title + description), rendered with auto-incrementing numbers. */
    items: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: saasLakebed,
  component: ({ props, lakebed }) => {
    const heading = props.heading ?? 'Start writing smarter in 3 steps'
    const description =
      props.description ??
      'From signup to your first AI-assisted document in under 5 minutes.'
    const cta = props.cta ?? "Get started now — it's free"
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Create your account',
            description:
              'Sign up with your email or Google account. No credit card required for the 14-day trial. Choose your primary use case during onboarding.',
          },
          {
            title: 'Set your preferences',
            description:
              'Tell us about your writing style, preferred tone, and industry. The AI learns from examples you provide to match your unique voice.',
          },
          {
            title: 'Start creating',
            description:
              'Open the editor, pick a template or start from scratch, and experience AI-assisted writing. Export to any format or publish directly.',
          },
        ]

    return (
      <section className={cn('bg-muted/50 py-20 lg:py-32', props.className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-3xl text-center lg:mb-20">
            <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
            {items.map((step, i) => (
              <div key={step.title} className="relative">
                {i < items.length - 1 && (
                  <div
                    aria-hidden="true"
                    className="absolute left-8 top-0 hidden h-full w-px bg-border md:block"
                  />
                )}
                <div className="relative flex items-start gap-6 md:block md:gap-0">
                  <div className="z-10 grid size-16 shrink-0 place-items-center rounded-2xl bg-foreground md:mb-6">
                    <span className="text-2xl font-bold text-background">
                      {i + 1}
                    </span>
                  </div>
                  <div>
                    <h3 className="mb-2 mt-4 text-lg font-semibold text-foreground md:mt-0">
                      {step.title}
                    </h3>
                    <p className="leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-16 text-center">
            <SaasPlanActionButton
              lakebed={lakebed}
              intentLabel={cta}
              plan={cta}
              source="steps"
              pendingChildren={
                <>
                  <SaasMutationSpinner className="size-5" />
                  Starting
                </>
              }
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-foreground px-8 py-4 text-base font-medium text-background transition-colors hover:bg-foreground/90 disabled:pointer-events-none disabled:opacity-70"
            >
              {cta}
            </SaasPlanActionButton>
          </div>
        </div>
      </section>
    )
  },
})
