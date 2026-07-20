import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { DotGrid, MonoTag } from '#/section-kit/Decor.tsx'
import {
  SaasMutationSpinner,
  SaasPlanActionButton,
} from '../saas/saas-interactions.tsx'
import { saasLakebed } from '../saas/saas-lakebed.ts'

const CTA_BARS = [
  'h-10',
  'h-14',
  'h-12',
  'h-20',
  'h-16',
  'h-24',
  'h-28',
  'h-36',
]

/**
 * AnalyticsCta — inverted Swiss closing band for an analytics product. A full
 * ink-inversion band (bg-foreground/text-background) that cuts in on a slanted
 * top seam over a faint dot grid, with an asymmetric split: the left column
 * stacks a mono eyebrow with a primary square tick, a giant tight-tracking
 * headline, a supporting subtitle, and a row of sharp-cornered actions with
 * press feedback — an inverted-fill "Start Free Trial" button plus a hairline
 * "Book a demo" button, both scoped Lakebed mutations; the right column
 * carries an ascending div-built bar chart whose final bar flips to primary,
 * over tabular axis ticks. Use as the final band near the footer of any
 * analytics, BI, or data-product site. Renders with no props.
 */
export const AnalyticsCta = defineCapsule({
  name: 'AnalyticsCta',
  description:
    "Inverted Swiss closing call-to-action band for an analytics product backed by shared Lakebed conversion state: a full ink-inversion band cutting in on a slanted top seam over a faint dot grid, with a mono eyebrow, giant tight-tracking headline, supporting subtitle, and sharp scoped mutation actions — an inverted-fill 'Start Free Trial' button plus a hairline 'Book a demo' button — beside an ascending div-built bar chart whose final bar flips to primary. Use as the final band near the footer of any analytics, BI, or data-product site.",
  props: z.object({
    eyebrow: z.string().optional(),
    headline: z.string().optional(),
    subheading: z.string().optional(),
    primaryCta: z.string().optional(),
    primaryTarget: z.string().optional(),
    secondaryCta: z.string().optional(),
    secondaryTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: saasLakebed,
  component: ({ props, lakebed }) => {
    const eyebrow = props.eyebrow ?? 'Ready when you are'
    const headline = props.headline ?? 'See your data clearly'
    const subheading =
      props.subheading ??
      'Spin up your first dashboard in minutes. No credit card, no setup calls — just answers.'
    const primaryCta = props.primaryCta ?? 'Start Free Trial'
    const primaryTarget = props.primaryTarget ?? 'Pricing'
    const secondaryCta = props.secondaryCta ?? 'Book a demo'
    const secondaryTarget = props.secondaryTarget ?? 'Contact'

    return (
      <section
        className={cn(
          'relative overflow-hidden bg-foreground py-16 pt-24 text-background [clip-path:polygon(0_3rem,100%_0,100%_100%,0_100%)] sm:py-20 sm:pt-28 lg:py-24 lg:pt-32',
          props.className,
        )}
      >
        <DotGrid
          className="inset-0 text-background/10"
          density="loose"
          fade="left"
        />
        <Container size="xl" className="relative px-6">
          <div className="grid items-end gap-12 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <MonoTag className="flex items-center gap-2.5 text-background/60">
                <span
                  aria-hidden="true"
                  className="size-1.5 bg-background/80"
                />
                {eyebrow}
              </MonoTag>
              <h2 className="mt-5 max-w-2xl text-[clamp(2.25rem,5vw,4rem)] font-bold leading-[1.02] tracking-tight text-background">
                {headline}
              </h2>
              <p className="mt-4 max-w-xl text-lg leading-relaxed text-background/60">
                {subheading}
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <SaasPlanActionButton
                  lakebed={lakebed}
                  intentLabel={primaryTarget}
                  plan={primaryCta}
                  source="cta"
                  pendingChildren={
                    <>
                      <SaasMutationSpinner className="size-4" />
                      Starting
                    </>
                  }
                  className="inline-flex min-w-40 items-center justify-center gap-2 rounded-none bg-background px-7 py-3.5 text-sm font-semibold text-foreground transition-[background-color,transform] duration-150 hover:bg-background/90 active:translate-y-px disabled:pointer-events-none disabled:opacity-70"
                >
                  {primaryCta}
                </SaasPlanActionButton>
                <SaasPlanActionButton
                  lakebed={lakebed}
                  intentLabel={secondaryTarget}
                  plan={secondaryCta}
                  source="cta"
                  pendingChildren={
                    <>
                      <SaasMutationSpinner className="size-4" />
                      Sending
                    </>
                  }
                  className="inline-flex min-w-40 items-center justify-center gap-2 rounded-none border border-background/30 px-7 py-3.5 text-sm font-semibold text-background transition-[border-color,background-color,transform] duration-150 hover:border-background/60 hover:bg-background/10 active:translate-y-px disabled:pointer-events-none disabled:opacity-70"
                >
                  {secondaryCta}
                </SaasPlanActionButton>
              </div>
            </div>
            <div
              aria-hidden="true"
              className="pointer-events-none hidden select-none lg:col-span-4 lg:block"
            >
              <div className="flex items-end justify-end gap-1.5">
                {CTA_BARS.map((h, i) => (
                  <span
                    key={i}
                    className={cn(
                      'w-7',
                      h,
                      i === CTA_BARS.length - 1
                        ? 'bg-background/80'
                        : 'bg-background/15',
                    )}
                  />
                ))}
              </div>
              <div className="mt-3 flex items-center justify-end gap-6 border-t border-background/15 pt-2 font-mono text-[10px] tabular-nums text-background/40">
                <span>Q1</span>
                <span>Q2</span>
                <span>Q3</span>
                <span>Q4</span>
              </div>
            </div>
          </div>
        </Container>
      </section>
    )
  },
})
