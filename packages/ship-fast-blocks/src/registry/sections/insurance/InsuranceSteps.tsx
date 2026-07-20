import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * InsuranceSteps — Swiss-trust "how it works" ledger for an insurance page. On a
 * soft muted canvas: an asymmetric header (mono eyebrow + left-aligned heading +
 * lede, mono step count right) sits above a sharp-cornered, collapsed-border
 * 3-step grid whose cells share hairline rules (binary radius, no gaps); each
 * cell carries a giant tabular-nums step numeral over a hairline rule, a title
 * and a description, the ink hairline thickening on hover. Use to explain a
 * simple get-covered / get-a-quote flow for insurance carriers, insurtech,
 * brokers, or financial-protection products. Renders fully with no props via
 * baked-in defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import {
  StepTimeline,
  StepTimelineGrid,
  StepItem,
} from '#/section-kit/StepTimeline.tsx'
export const InsuranceSteps = defineCapsule({
  name: 'InsuranceSteps',
  description:
    "Swiss-trust 'how it works' ledger for an insurance page on a soft muted canvas: an asymmetric header (mono eyebrow + left-aligned heading + lede, mono step count right) above a sharp-cornered, collapsed-border 3-step grid whose cells share hairline rules and carry a giant tabular-nums step numeral over a hairline rule, a title and a description, the ink hairline thickening on hover. Use to explain a simple get-covered / get-a-quote flow for insurance carriers, insurtech startups, brokers, or financial-protection products.",
  props: z.object({
    /** Eyebrow chip above the heading. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Lede paragraph under the heading. */
    description: z.string().optional(),
    /** Step cards (numbered automatically). */
    items: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Simple Process'
    const heading = props.heading ?? 'Get covered in 3 easy steps'
    const description =
      props.description ??
      'No paperwork, no hassle. Start protecting what matters in under 2 minutes.'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Get Your Quote',
            description:
              'Answer a few quick questions about yourself and what you need to protect. Our smart system instantly calculates your personalized rate.',
          },
          {
            title: 'Customize Coverage',
            description:
              'Adjust deductibles, add riders, and tailor your policy to fit your exact needs and budget. See price changes in real-time.',
          },
          {
            title: "You're Protected",
            description:
              'Purchase instantly and download your policy documents immediately. Coverage begins the moment you need it.',
          },
        ]
    return (
      <StepTimeline className={cn('bg-muted py-20 lg:py-28', props.className)}>
        <Container>
          <div className="mb-12 flex flex-col gap-6 border-b border-border pb-6 md:flex-row md:items-end md:justify-between lg:mb-14">
            <div className="max-w-2xl">
              <MonoTag className="mb-4 block">
                {eyebrow}
                <span aria-hidden="true" className="text-primary">
                  {' '}
                  / flow
                </span>
              </MonoTag>
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground text-balance sm:text-4xl lg:text-5xl">
                {heading}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground text-pretty">
                {description}
              </p>
            </div>
            <MonoTag
              aria-hidden="true"
              tone="faint"
              className="shrink-0 tabular-nums"
            >
              [ {String(items.length).padStart(2, '0')} steps ]
            </MonoTag>
          </div>
          <StepTimelineGrid
            columns={3}
            className="gap-0 border-l border-t border-border"
          >
            {items.map((step, i) => (
              <StepItem
                key={step.title}
                className="border-b border-r border-border bg-background p-7 transition-colors duration-150 hover:border-foreground/30 hover:bg-muted/30 sm:p-8"
              >
                <div className="flex items-baseline gap-3 border-b border-border pb-4">
                  <span className="font-mono text-4xl font-extrabold leading-none tabular-nums tracking-tight text-foreground sm:text-5xl">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span aria-hidden="true" className="h-px flex-1 bg-border" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
                    step
                  </span>
                </div>
                <h3 className="mt-5 text-xl font-semibold tracking-tight text-foreground">
                  {step.title}
                </h3>
                <p className="mt-3 leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </StepItem>
            ))}
          </StepTimelineGrid>
        </Container>
      </StepTimeline>
    )
  },
})
