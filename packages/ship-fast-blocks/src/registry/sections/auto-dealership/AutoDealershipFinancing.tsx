import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { Watermark, MonoTag } from '#/section-kit/Decor.tsx'
import {
  StatGrid,
  StatItem,
  StatValue,
  StatLabel,
} from '#/section-kit/StatGrid.tsx'
import {
  AutoLeadActionButton,
  AutoMutationSpinner,
} from './auto-dealership-interactions.tsx'
import { autoDealershipLakebed } from './auto-dealership-lakebed.ts'

import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  FinancingCalculator,
  FinancingDisplay,
} from '#/section-kit/FinancingCalculator.tsx'

/**
 * AutoDealershipFinancing — showroom-kinetic financing / pre-approval section
 * for an auto dealership page under a giant italic ghost "FINANCE" watermark.
 * Asymmetric 7:5 split: the left column has a mono index rail ("[ 04 ] —
 * Financing"), a font-black uppercase heading + lead, a collapsed-border
 * ledger of numbered steps (Apply Online, Compare Offers, Drive Away) led by
 * skewed inverted step chips, a dark inverted APR strip whose 3-up
 * collapsed-border stats carry giant italic tabular numerals (starting APR /
 * max months / down options), and a skewed parallelogram primary CTA with
 * press feedback. The right column holds a chamfer-clipped finance photo over
 * an offset hairline frame with a mono caption row. The CTA writes a Lakebed
 * financing lead and the photo uses the alt-driven Image component. Use as the
 * financing / get-pre-approved section for car dealerships, used-car lots, or
 * auto sales groups. Renders fully with no props via baked-in defaults.
 */
export const AutoDealershipFinancing = defineCapsule({
  name: 'AutoDealershipFinancing',
  description:
    'Showroom-kinetic financing / pre-approval section for an auto dealership page under a giant italic ghost "FINANCE" watermark: an asymmetric 7:5 split with a mono index rail, font-black uppercase heading and lead, a collapsed-border ledger of numbered steps (Apply Online, Compare Offers, Drive Away) led by skewed inverted step chips, a dark inverted APR strip of 3-up collapsed-border stats with giant italic tabular numerals (starting APR / max months / down options), and a skewed parallelogram primary CTA, beside a chamfer-clipped finance photo over an offset hairline frame with a mono caption row. The CTA writes a Lakebed financing lead and the photo uses the alt-driven Image component. Use as the financing / get-pre-approved section for car dealerships, used-car lots, or auto sales groups.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Alt text driving the finance photo. */
    imageAlt: z.string().optional(),
    /** Solid primary CTA label. */
    cta: z.string().optional(),
    /** Numbered financing steps. */
    steps: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    /** APR stats panel items. */
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: autoDealershipLakebed,
  component: ({ props, lakebed }) => {
    const heading = props.heading ?? 'Flexible Financing Options'
    const description =
      props.description ??
      'Get pre-approved in minutes with competitive rates from our network of 20+ lenders. We work with all credit situations to find the right payment plan for you.'
    const imageAlt =
      props.imageAlt ??
      'Professional business handshake over desk with documents and calculator'
    const cta = props.cta ?? 'Get Pre-Approved Now'
    const steps = props.steps?.length
      ? props.steps
      : [
          {
            title: 'Apply Online',
            description:
              'Complete our secure 3-minute application. No impact to your credit score.',
          },
          {
            title: 'Compare Offers',
            description:
              'Review personalized rates from multiple lenders side by side.',
          },
          {
            title: 'Drive Away',
            description: 'Sign electronically and take delivery the same day.',
          },
        ]
    const stats = props.stats?.length
      ? props.stats
      : [
          { value: '3.9%', label: 'Starting APR' },
          { value: '84', label: 'Max Months' },
          { value: '$0', label: 'Down Options' },
        ]

    return (
      <FinancingCalculator asChild>
        <section
          className={cn(
            'relative overflow-hidden bg-card py-14 sm:py-16 lg:py-24',
            props.className,
          )}
        >
          <Watermark className="-top-2 right-0 italic text-[4.5rem] sm:text-[7.5rem] lg:text-[11rem]">
            FINANCE
          </Watermark>
          <Container className="relative">
            <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-14">
              <div className="lg:col-span-7">
                <div className="mb-6 flex items-center gap-4">
                  <span
                    aria-hidden="true"
                    className="inline-block h-2 w-6 shrink-0 -skew-x-12 bg-primary"
                  />
                  <MonoTag aria-hidden="true">[ 04 ] — Financing</MonoTag>
                  <span aria-hidden="true" className="h-px flex-1 bg-border" />
                </div>
                <SectionHeading
                  align="left"
                  title={heading}
                  subtitle={description}
                  className="mb-8 gap-3"
                  titleClassName="text-3xl font-black uppercase tracking-tight sm:text-4xl"
                  subtitleClassName="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
                />
                {/* Collapsed-border step ledger with skewed inverted chips. */}
                <div className="border-t border-border">
                  {steps.map((step, i) => (
                    <div
                      key={step.title}
                      className="grid grid-cols-[3.5rem_1fr] items-start gap-4 border-b border-border py-5 sm:grid-cols-[4.25rem_1fr] sm:gap-5"
                    >
                      <span
                        aria-hidden="true"
                        className="inline-flex h-8 w-12 -skew-x-12 items-center justify-center bg-foreground text-sm font-black italic text-background"
                      >
                        <span className="inline-block skew-x-12">0{i + 1}</span>
                      </span>
                      <div>
                        <h4 className="text-base font-black uppercase tracking-tight">
                          {step.title}
                        </h4>
                        <p className="mt-1 max-w-lg text-sm leading-relaxed text-muted-foreground">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Dark inverted APR strip. */}
                <FinancingDisplay className="mt-8 rounded-none bg-foreground p-6 text-left text-background sm:p-7">
                  <StatGrid columns={3} className="grid-cols-3 gap-0">
                    {stats.map((s, i) => (
                      <StatItem
                        key={s.label}
                        align="left"
                        className={cn(
                          'gap-2 pr-3',
                          i > 0 && 'border-l border-background/20 pl-4 sm:pl-6',
                        )}
                      >
                        <StatValue
                          color="inverted"
                          className="mb-0 text-[clamp(1.75rem,3vw,2.75rem)] font-black italic leading-none tracking-tight"
                        >
                          {s.value}
                        </StatValue>
                        <StatLabel
                          color="inverted"
                          className="font-mono text-[10px] uppercase tracking-[0.2em] text-background/60"
                        >
                          {s.label}
                        </StatLabel>
                      </StatItem>
                    ))}
                  </StatGrid>
                </FinancingDisplay>
                <AutoLeadActionButton
                  lakebed={lakebed}
                  action="financing"
                  label={cta}
                  intentKey="financing-application"
                  source="financing"
                  pendingChildren={
                    <span className="inline-flex skew-x-12 items-center gap-2">
                      <AutoMutationSpinner />
                      Sending
                    </span>
                  }
                  className="mt-8 inline-flex -skew-x-12 items-center justify-center rounded-none bg-primary px-8 py-4 text-sm font-bold uppercase tracking-[0.15em] text-primary-foreground transition-all duration-150 hover:bg-primary/90 active:translate-y-px disabled:pointer-events-none disabled:opacity-70"
                >
                  <span className="inline-block skew-x-12">{cta}</span>
                </AutoLeadActionButton>
              </div>

              <div className="lg:col-span-5">
                <div className="relative">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 translate-x-3 translate-y-3 border border-foreground/20"
                  />
                  <Image
                    alt={imageAlt}
                    w={800}
                    h={600}
                    loading="lazy"
                    className="relative aspect-[4/3] w-full rounded-none object-cover [clip-path:polygon(0_0,100%_0,100%_calc(100%-2rem),calc(100%-2rem)_100%,0_100%)] lg:aspect-[4/5]"
                  />
                </div>
                <span
                  aria-hidden="true"
                  className="mt-6 flex items-center gap-3 text-border"
                >
                  <span className="inline-block h-1.5 w-6 -skew-x-12 bg-primary" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    [ Secure ] — 3-min application
                  </span>
                  <span className="h-px flex-1 bg-current" />
                </span>
              </div>
            </div>
          </Container>
        </section>
      </FinancingCalculator>
    )
  },
})
