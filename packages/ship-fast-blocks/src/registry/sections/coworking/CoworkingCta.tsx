import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { GridField } from '#/section-kit/motion.tsx'

/**
 * CoworkingCta — luminous closing band for a coworking or shared-workspace
 * page. A full-bleed rounded panel on a deep primary gradient, framed by
 * faint oversized ring outlines. Content is centered: an uppercase eyebrow,
 * a display headline, a short supporting line, and two CTAs — an inverted
 * pill with a shimmer sweep on hover beside a translucent outline pill. Both
 * route through useNavigate. Renders fully with no props via baked-in
 * defaults. Use near the bottom of a coworking, shared-office, or flex-office
 * page to drive tour bookings.
 */
export const CoworkingCta = defineCapsule({
  name: 'CoworkingCta',
  description:
    'Luminous closing CTA band for a coworking or shared-workspace page: a full-bleed rounded panel on a deep primary gradient, framed by faint oversized ring outlines — with an uppercase eyebrow, display headline, short supporting line, and two CTAs (inverted shimmer-sweep pill + translucent outline pill), both routed through useNavigate. Use near the bottom of a coworking, shared-office, or flex-office page to drive tour bookings and pricing views.',
  props: z.object({
    /** Small eyebrow label above the headline. */
    eyebrow: z.string().optional(),
    /** CTA headline (maps to CtaBand title). */
    headline: z.string().optional(),
    /** Short supporting line under the headline (maps to CtaBand subtitle). */
    subheading: z.string().optional(),
    /** High-contrast primary CTA label. */
    primaryCta: z.string().optional(),
    /** Route label the primary CTA navigates to. */
    primaryTarget: z.string().optional(),
    /** Outlined secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Route label the secondary CTA navigates to. */
    secondaryTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const eyebrow =
      typeof props.eyebrow === 'string' && props.eyebrow
        ? props.eyebrow
        : 'Your desk is waiting'
    const headline =
      typeof props.headline === 'string' && props.headline
        ? props.headline
        : 'Come see why members never want to leave'
    const subheading =
      typeof props.subheading === 'string' && props.subheading
        ? props.subheading
        : 'Book a free walkthrough and grab a coffee on us — no pressure, no contracts, just a look at where your best work happens.'
    const primaryCta =
      typeof props.primaryCta === 'string' && props.primaryCta
        ? props.primaryCta
        : 'Tour the space'
    const secondaryCta =
      typeof props.secondaryCta === 'string' && props.secondaryCta
        ? props.secondaryCta
        : 'View pricing'

    return (
      <section
        className={cn(
          'relative isolate overflow-hidden bg-background py-24 sm:py-28',
          props.className,
        )}
      >
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border/60 to-transparent"
        />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary via-primary to-primary/85 shadow-[0_40px_120px_-30px] shadow-primary/50 ring-1 ring-primary/40">
            {/* Inner light: blueprint grid, faint rings. */}
            <GridField
              className="text-primary-foreground/10"
              size={56}
              mask="radial-gradient(ellipse 95% 95% at 50% 50%, black 35%, transparent 88%)"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full border border-primary-foreground/10"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-32 -left-16 size-[26rem] rounded-full border border-primary-foreground/10"
            />

            <div className="relative mx-auto flex max-w-3xl flex-col items-center px-6 py-20 text-center sm:py-24">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-primary-foreground/80">
                {eyebrow}
              </span>
              <h2 className="mt-5 text-4xl font-semibold leading-tight tracking-tight text-primary-foreground sm:text-5xl lg:text-6xl">
                {headline}
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-primary-foreground/85">
                {subheading}
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(props.primaryTarget ?? primaryCta)}
                  className="group relative inline-flex items-center justify-center overflow-hidden rounded-2xl bg-background px-8 py-4 text-base font-semibold text-foreground shadow-lg transition-shadow duration-300 hover:shadow-xl"
                >
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-foreground/10 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
                  />
                  <span className="relative">{primaryCta}</span>
                </button>
                <button
                  type="button"
                  onClick={() => go(props.secondaryTarget ?? secondaryCta)}
                  className="inline-flex items-center justify-center rounded-2xl border border-primary-foreground/30 px-8 py-4 text-base font-medium text-primary-foreground transition-colors duration-300 hover:bg-primary-foreground/10"
                >
                  {secondaryCta}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  },
})
