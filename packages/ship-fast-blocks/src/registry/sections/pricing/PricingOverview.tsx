import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import { Image } from '#/lib/img.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/** Square-cut check glyph for the included-feature comparison rows. */
const FeatureCheck = () => (
  <svg
    viewBox="0 0 16 16"
    aria-hidden="true"
    className="mt-0.5 size-3.5 shrink-0 text-primary"
  >
    <path
      d="M13 4 6.5 12 3 8.2"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
    />
  </svg>
)

/**
 * PricingOverview — Swiss-comparison pricing hero for the Pricing page family.
 * A mono meta rule (index-numeral eyebrow left, tabular line count right) sits
 * above an asymmetric 7:5 split: the left rail carries a primary mono brand
 * kicker, a giant clamp font-extrabold heading, a supporting lede, a
 * hairline-divided feature-comparison checklist (square check marks + tabular
 * row indexes), and a square-cornered dual CTA pair — an inverted
 * bg-foreground primary button with a hard offset shadow and mechanical press
 * feedback beside a hairline outline button — both routed through section-kit
 * route links. The right rail is a sharp-cornered hairline comparison card: a
 * mono caption bar, an alt-driven photo whose bottom edge cuts on a diagonal
 * seam into a collapsed-border price ledger of giant tabular-nums values with
 * mono labels, one cell inverting to bg-foreground/text-background as the
 * recommended standout. A giant ghost brand watermark anchors the field.
 * Binary rounded-none radius, accent used sparingly. Use as the opening
 * viewport of a pricing page or as a focused pricing band inside a larger
 * generated site. Renders fully with no props.
 */
export const PricingOverview = defineCapsule({
  name: 'PricingOverview',
  description:
    'Swiss-comparison pricing hero for the Pricing page family: a mono meta rule (index-numeral eyebrow left, tabular line count right) above an asymmetric 7:5 split — a left rail with a primary mono brand kicker, a giant clamp font-extrabold heading, a lede, a hairline-divided feature-comparison checklist with square check marks and tabular row indexes, and a square-cornered dual CTA pair (inverted hard-shadow primary with press feedback beside a hairline outline button) routed through section-kit route links; and a right hairline comparison card with a mono caption bar, an alt-driven photo whose diagonal bottom seam cuts into a collapsed-border ledger of giant tabular-nums price values with mono labels, one cell inverting to bg-foreground/text-background as the recommended standout, all under a giant ghost brand watermark with binary rounded-none radius. Use when composing a pricing page or adding a focused pricing band to a larger generated site.',
  props: z.object({
    brand: z.string().optional(),
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    subheading: z.string().optional(),
    primaryCta: z.string().optional(),
    secondaryCta: z.string().optional(),
    imageAlt: z.string().optional(),
    features: z.array(z.string()).optional(),
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'Pricing'
    const eyebrow = props.eyebrow ?? 'Pricing section'
    const heading = props.heading ?? 'Pricing experience, ready to customize'
    const subheading =
      props.subheading ??
      'A reusable overview section derived from the existing Pricing page family, built for prompts that need a polished first viewport without creating new HTML.'
    const primaryCta = props.primaryCta ?? 'View plans'
    const secondaryCta = props.secondaryCta ?? 'Learn more'
    const imageAlt = props.imageAlt ?? 'Pricing website experience'
    const features = props.features?.length
      ? props.features
      : [
          'Purpose-built pricing layout',
          'Token-based styling',
          'Prompt-safe content props',
        ]
    const stats = props.stats?.length
      ? props.stats
      : [
          {
            value: '01',
            label: 'Reusable section',
          },
          {
            value: '100%',
            label: 'Token compliant',
          },
          {
            value: '0',
            label: 'Image URLs',
          },
        ]
    const featuredStat = stats.length > 1 ? 1 : 0

    return (
      <section
        className={cn(
          'relative overflow-hidden bg-background py-16 text-foreground sm:py-20 lg:py-24',
          props.className,
        )}
      >
        <Watermark className="-bottom-10 -left-4 select-none text-[7rem] uppercase sm:text-[11rem] lg:text-[16rem]">
          {brand}
        </Watermark>

        <Container size="xl" className="relative">
          {/* Mono meta rule: index-numeral eyebrow left, tabular count right. */}
          <div className="mb-10 flex items-center justify-between gap-4 border-b border-border pb-4 sm:mb-14">
            <MonoTag className="flex items-center gap-3">
              <span aria-hidden="true" className="tabular-nums text-primary">
                01
              </span>
              {eyebrow}
            </MonoTag>
            <MonoTag aria-hidden="true" tone="faint" className="tabular-nums">
              [ compare ] {String(features.length).padStart(2, '0')} lines
            </MonoTag>
          </div>

          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
            {/* Left rail — kicker, heading, lede, feature ledger, CTAs. */}
            <div className="flex flex-col">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
                {brand}
              </p>
              <h2 className="mt-4 text-4xl font-extrabold leading-[1.02] tracking-tight text-balance sm:text-5xl lg:text-6xl">
                {heading}
              </h2>
              <p className="mt-5 max-w-xl text-lg leading-8 text-muted-foreground text-pretty">
                {subheading}
              </p>

              <ul className="mt-8 border-t border-border">
                {features.map((feature: string, i: number) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 border-b border-border py-3"
                  >
                    <FeatureCheck />
                    <span className="text-foreground/85">{feature}</span>
                    <span
                      aria-hidden="true"
                      className="ml-auto font-mono text-[11px] uppercase tracking-[0.2em] tabular-nums text-muted-foreground/60"
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <NavbarRouteLink
                  href={primaryCta}
                  className="inline-flex min-h-11 items-center justify-center rounded-none bg-foreground px-7 py-3 text-sm font-semibold text-background shadow-[5px_5px_0_0] shadow-border transition-[transform,box-shadow,background-color] duration-150 hover:bg-foreground/90 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {primaryCta}
                </NavbarRouteLink>
                <NavbarRouteLink
                  href={secondaryCta}
                  className="inline-flex min-h-11 items-center justify-center rounded-none border border-border bg-background px-7 py-3 text-sm font-semibold text-foreground transition-[transform,background-color] duration-150 hover:bg-muted active:translate-y-px motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {secondaryCta}
                </NavbarRouteLink>
              </div>
            </div>

            {/* Right rail — hairline comparison card: photo → price ledger. */}
            <div className="relative rounded-none border border-border bg-card">
              <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-3 sm:px-6">
                <MonoTag>{brand}</MonoTag>
                <MonoTag
                  aria-hidden="true"
                  tone="faint"
                  className="tabular-nums"
                >
                  {String(stats.length).padStart(2, '0')} / metrics
                </MonoTag>
              </div>

              {/* Alt-driven photo with a diagonal bottom seam into the ledger. */}
              <div className="relative overflow-hidden bg-card [clip-path:polygon(0_0,100%_0,100%_100%,0_calc(100%-1.75rem))]">
                <Image
                  alt={imageAlt}
                  w={900}
                  h={620}
                  className="aspect-[16/10] w-full object-cover"
                />
              </div>

              {/* Collapsed-border price ledger; one cell inverts as standout. */}
              <div className="-mt-px border-t border-border">
                {stats.map(
                  (stat: { value: string; label: string }, i: number) => {
                    const inverted = i === featuredStat
                    return (
                      <div
                        key={stat.label}
                        className={cn(
                          'flex items-baseline justify-between gap-4 border-b border-border px-5 py-4 last:border-b-0 sm:px-6',
                          inverted
                            ? 'bg-foreground text-background'
                            : 'bg-card',
                        )}
                      >
                        <span
                          className={cn(
                            'font-mono text-[11px] uppercase tracking-[0.2em]',
                            inverted
                              ? 'text-background/60'
                              : 'text-muted-foreground',
                          )}
                        >
                          {stat.label}
                        </span>
                        <span
                          className={cn(
                            'text-[clamp(1.75rem,4vw,2.75rem)] font-extrabold leading-none tracking-tight tabular-nums',
                            inverted ? 'text-background' : 'text-foreground',
                          )}
                        >
                          {stat.value}
                        </span>
                      </div>
                    )
                  },
                )}
              </div>
            </div>
          </div>
        </Container>
      </section>
    )
  },
})
