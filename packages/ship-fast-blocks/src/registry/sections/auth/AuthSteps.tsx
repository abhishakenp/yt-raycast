import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { StepBadge, StepTimeline, StepItem } from '#/section-kit/StepTimeline.tsx'

/**
 * AuthSteps — three-step handshake sequence for Authly, a developer
 * authentication product. A left-aligned heading sits beside a "path preview"
 * console card; below, a
 * responsive asymmetric grid of step cards, each pairing a filled mono numeral
 * tile with a title, a short description, a terminal-style command snippet
 * with a prompt glyph, and a progress meter whose filled segments advance with
 * the step — the sequence itself is the structure. Baked steps walk through
 * installing the SDK, adding the provider, and shipping protected routes. Use
 * to show how fast an auth platform, identity API, or login SDK integrates.
 * Renders fully with no props.
 */
export const AuthSteps = defineCapsule({
  name: 'AuthSteps',
  description:
    "Three-step handshake sequence for a developer-auth product: a left-aligned heading ('Drop-in auth in three steps') beside a 'path preview' console card, above a responsive asymmetric grid of step cards — filled mono numeral tiles, titles, descriptions, terminal-style command snippets with prompt glyphs, and per-step progress meters whose filled segments advance with the step. Baked steps walk through installing the SDK, adding the provider, and shipping protected routes. Use to show how fast an auth platform, identity API, or login SDK integrates.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting subheading. */
    subheading: z.string().optional(),
    /** Steps: title, description, optional mono command snippet. */
    steps: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
          snippet: z.string().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Drop-in auth in three steps'
    const subheading =
      props.subheading ??
      'Go from zero to a secure, production-ready login flow in a single afternoon.'
    const steps = props.steps?.length
      ? props.steps
      : [
          {
            title: 'Install the SDK',
            description:
              'Add Authly to your project with a single command. Framework adapters ship for React, Next.js, and Node.',
            snippet: 'npm i @authly/sdk',
          },
          {
            title: 'Add the provider',
            description:
              'Wrap your app in <AuthProvider> and point it at your API key. Sessions, tokens, and refresh are handled for you.',
            snippet: '<AuthProvider apiKey={KEY}>',
          },
          {
            title: 'Ship protected routes',
            description:
              'Guard any page or API route with a hook or middleware. Authly resolves the user and enforces your access rules.',
            snippet: 'const { user } = useAuth()',
          },
        ]
    const stepLayouts = [
      'md:col-span-3 xl:col-span-4 xl:-rotate-1',
      'md:col-span-3 xl:col-span-4 xl:translate-y-6 xl:rotate-1',
      'md:col-span-6 xl:col-span-4 xl:-rotate-[0.5deg]',
    ]

    return (
      <StepTimeline
        className={cn('overflow-hidden bg-background', props.className)}
      >
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-end">
            <div>
              <SectionHeading
                title={heading}
                subtitle={subheading}
                align="left"
                className="max-w-3xl"
                titleClassName="text-balance text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[2.6rem] lg:leading-[1.12]"
                subtitleClassName="text-pretty leading-7"
              />
            </div>
            <div className="rounded-2xl border border-border bg-muted/60 p-4 font-mono text-xs text-muted-foreground shadow-sm shadow-foreground/5">
              <div className="flex items-center justify-between border-b border-border pb-3 uppercase tracking-[0.14em]">
                <span>path preview</span>
                <span>{steps.length} steps</span>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {steps.slice(0, 3).map((step, index) => (
                  <div
                    key={step.title}
                    className="rounded-xl border border-border bg-background px-3 py-2"
                  >
                    <span className="block text-primary">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="line-clamp-2 text-foreground/80">
                      {step.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-1 items-start gap-5 md:grid-cols-6 xl:grid-cols-12 lg:gap-6">
            {steps.filter(Boolean).map((step, i) => (
              <StepItem
                key={step.title}
                className={cn(
                  'relative min-w-0 overflow-hidden rounded-2xl border bg-card p-6 shadow-sm shadow-foreground/5 sm:p-7',
                  stepLayouts[i % stepLayouts.length],
                )}
              >
                <span className="-mx-6 -mt-6 mb-6 block w-fit rounded-br-xl border-b border-r border-border bg-muted/70 px-4 py-2 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground sm:-mx-7 sm:-mt-7">
                  step {String(i + 1).padStart(2, '0')}
                </span>
                <StepBadge
                  index={i}
                  pad
                  variant="filled-square"
                  className="size-14 rounded-lg border-[3px] border-double border-foreground/70 bg-transparent font-mono text-lg font-bold text-foreground"
                />
                <h3 className="mt-6 text-lg font-semibold leading-7 text-balance text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-pretty text-muted-foreground">
                  {step.description}
                </p>
                {step.snippet && (
                  <code
                    translate="no"
                    className="mt-6 flex min-w-0 items-center gap-2.5 overflow-x-auto rounded-xl border border-border bg-muted/70 px-3.5 py-3 font-mono text-xs text-foreground"
                  >
                    <span
                      aria-hidden="true"
                      className="shrink-0 select-none font-semibold text-primary"
                    >
                      ❯
                    </span>
                    <span className="whitespace-nowrap">{step.snippet}</span>
                  </code>
                )}
                <div className="mt-6 flex gap-1.5" aria-hidden="true">
                  {steps.map((_, segment) => (
                    <span
                      key={segment}
                      className={cn(
                        'h-1 flex-1 rounded-full',
                        segment <= i ? 'bg-primary' : 'bg-border',
                      )}
                    />
                  ))}
                </div>
              </StepItem>
            ))}
          </div>
        </div>
      </StepTimeline>
    )
  },
})
