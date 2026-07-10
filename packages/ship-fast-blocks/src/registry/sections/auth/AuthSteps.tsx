import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Card } from '#/section-kit/Card.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'

/**
 * AuthSteps — bespoke three-step drop-in integration guide for Authly, a developer
 * authentication product. A centered SectionHeading ("Drop-in auth in three
 * steps") sits above a responsive 3-column grid of numbered step cards; each card
 * pairs a big token-circle number with a title, a short description, and a small
 * font-mono command snippet line. Baked steps walk through installing the SDK,
 * adding the provider, and shipping protected routes. Use to show how fast an
 * auth platform, identity API, or login SDK integrates. Renders fully with no
 * props.
 */
export const AuthSteps = defineCapsule({
  name: 'AuthSteps',
  description:
    "Bespoke three-step drop-in integration guide for a developer-auth product: a centered SectionHeading ('Drop-in auth in three steps') above a responsive 3-column grid of numbered step cards, each pairing a big token-circle number with a title, a short description, and a small font-mono command snippet line. Baked steps walk through installing the SDK, adding the provider, and shipping protected routes. Use to show how fast an auth platform, identity API, or login SDK integrates.",
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

    return (
      <section className={cn('bg-background', props.className)}>
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-24">
          <SectionHeading
            title={heading}
            subtitle={subheading}
            align="center"
          />

          <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3">
            {steps.filter(Boolean).map((step, i) => (
              <Card
                key={step.title}
                padding="none"
                className="flex flex-col p-7"
              >
                <span className="inline-flex size-11 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-accent">
                  {i + 1}
                </span>
                <h3 className="mt-5 text-lg font-semibold tracking-tight text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
                {step.snippet && (
                  <code className="mt-5 block rounded-md border border-border bg-muted px-3 py-2 font-mono text-xs text-foreground">
                    {step.snippet}
                  </code>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
