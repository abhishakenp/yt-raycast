import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { ProcessTimeline } from '#/section-kit/ProcessTimeline.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'

/**
 * CafeProcess — inverted "farm to cup" newsprint process band for a cozy cafe
 * / coffee shop page. A full-bleed foreground-on-background band whose top
 * edge is cut on a diagonal clip-path seam, with a giant serif italic ghost
 * watermark of the heading behind. Inside: a mono dateline rail (cap stamp,
 * hairline rule, step count) above an asymmetric 7:5 pairing of the serif
 * heading with the right-aligned description. The steps run as a
 * collapsed-border ledger grid (2-up small screens, 4-up desktop, shared
 * hairlines in the inverted tone): each cell stacks a giant serif italic
 * numeral ("01"–"04"), a serif title, and a muted description. No links. Use
 * as a credibility / craft-process block for cafes, roasteries, bakeries, or
 * artisan food brands. Renders fully with no props via baked-in defaults.
 */
export const CafeProcess = defineCapsule({
  name: 'CafeProcess',
  description:
    "Inverted 'farm to cup' newsprint process band for a cozy cafe page: a full-bleed foreground-on-background band with a diagonal clip-path top seam and a giant serif italic ghost watermark of the heading. A mono dateline rail (cap stamp, hairline rule, step count) sits above an asymmetric 7:5 serif heading + right-aligned description pairing; steps run as a collapsed-border ledger grid (2-up small screens, 4-up desktop) where each cell stacks a giant serif italic numeral, serif title, and muted description. No links. Use as a credibility / craft-process block for cafes, roasteries, bakeries, or artisan food brands.",
  props: z.object({
    /** Eyebrow / cap text. */
    cap: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    description: z.string().optional(),
    /** Process steps: title + description. */
    steps: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const cap = props.cap ?? 'The Process'
    const heading = props.heading ?? 'From farm to cup'
    const description =
      props.description ??
      "Every step matters. We obsess over the details so you don't have to."
    const steps = props.steps?.length
      ? props.steps
      : [
          {
            title: 'Source',
            description:
              'Direct relationships with small-lot farmers in coffee belt regions',
          },
          {
            title: 'Roast',
            description:
              'Small-batch roasting on our Diedrich IR-12, profiles dialed to origin',
          },
          {
            title: 'Brew',
            description:
              'Precision extraction using refractometers and taste panels',
          },
          {
            title: 'Serve',
            description:
              'Hand-delivered with care, every drink crafted to order',
          },
        ]

    return (
      <ProcessTimeline
        variant="inverted"
        className={cn(
          'relative overflow-hidden pt-24 pb-16 [clip-path:polygon(0_3rem,100%_0,100%_100%,0_100%)] lg:pt-32 lg:pb-24',
          props.className,
        )}
      >
        <Watermark className="-bottom-6 right-[-3%] font-serif text-[5rem] italic tracking-tight text-background/[0.06] sm:text-[8rem] lg:text-[12rem]">
          {heading}
        </Watermark>

        <Container size="xl" className="relative px-6">
          <div className="flex items-center gap-4">
            <MonoTag tone="inverted">{cap}</MonoTag>
            <span aria-hidden="true" className="h-px flex-1 bg-background/20" />
            <MonoTag
              tone="inverted"
              className="hidden text-background/50 sm:inline"
            >
              04 Steps
            </MonoTag>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-12 lg:items-end lg:gap-10">
            <h2 className="font-serif text-4xl font-medium tracking-tight sm:text-5xl lg:col-span-7">
              {heading}
            </h2>
            <p className="max-w-md text-base leading-relaxed text-background/70 lg:col-span-5 lg:justify-self-end lg:text-right">
              {description}
            </p>
          </div>

          {/* Collapsed-border step ledger. */}
          <div className="mt-12 grid grid-cols-1 border-t border-l border-background/20 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">
            {steps.map((step, i) => (
              <div
                key={step.title}
                className="border-r border-b border-background/20 p-6 sm:p-8"
              >
                <p
                  aria-hidden="true"
                  className="font-serif text-5xl font-medium italic leading-none text-background/25 sm:text-6xl"
                >
                  {String(i + 1).padStart(2, '0')}
                </p>
                <h3 className="mt-5 font-serif text-xl font-medium tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-background/60">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </ProcessTimeline>
    )
  },
})
