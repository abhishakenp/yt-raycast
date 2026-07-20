import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Watermark, MonoTag } from '#/section-kit/Decor.tsx'
import { HeroSection, HeroMediaPanel } from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'
import {
  AutoLeadActionButton,
  AutoMutationSpinner,
} from './auto-dealership-interactions.tsx'
import { autoDealershipLakebed } from './auto-dealership-lakebed.ts'
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * AutoDealershipHero — bold showroom-kinetic hero for an auto dealership /
 * used-car landing page. A full-bleed dark inversion band (bg-foreground) with
 * a diagonal bottom seam, faint diagonal speed-line texture and a giant italic
 * ghost "DRIVE" watermark. Asymmetric 7:5 split: left column carries a mono
 * annotation rail (primary skew tick + eyebrow), a giant uppercase font-black
 * headline whose final word is outlined italic (text-stroke ghost), a
 * hairline-ruled lead paragraph, dual skewed parallelogram CTAs (solid primary
 * inventory navigation + hairline outline Lakebed test-drive action, both with
 * press feedback), and a collapsed-border KPI strip of giant italic spec
 * numerals (inventory count / starting APR / Google rating). Right column: a
 * showroom photo plate with a diagonal-cut corner over an offset hairline
 * frame, finished with a mono stock-label caption row. Inventory CTA routes
 * through section-kit route links; test-drive CTA writes a Lakebed lead
 * intent. Use as the top hero for car dealerships, used-car lots, certified
 * pre-owned sellers, or EV/hybrid showrooms. Renders fully with no props via
 * baked-in defaults.
 */
export const AutoDealershipHero = defineCapsule({
  name: 'AutoDealershipHero',
  description:
    'Bold showroom-kinetic hero for an auto dealership / used-car landing page: a full-bleed dark inversion band with a diagonal bottom seam, faint speed-line texture and a giant italic ghost "DRIVE" watermark. Asymmetric 7:5 split — left column has a mono annotation rail with primary skew tick and eyebrow, a giant uppercase font-black headline with the final word outlined italic, a hairline-ruled lead, dual skewed parallelogram CTAs (solid primary inventory navigation + hairline outline Lakebed test-drive action) and a collapsed-border KPI strip of giant italic spec numerals (inventory count / starting APR / Google rating); right column has a diagonal-cut showroom photo plate over an offset hairline frame with a mono stock-label caption. The photo uses the alt-driven Image component. Use as the top hero for car dealerships, used-car lots, certified pre-owned sellers, or EV/hybrid showrooms.',
  props: z.object({
    /** Uppercase eyebrow above the headline. */
    eyebrow: z.string().optional(),
    /** Large hero headline. */
    heading: z.string().optional(),
    /** Lead paragraph under the headline. */
    subheading: z.string().optional(),
    /** Solid primary CTA label. */
    primaryCta: z.string().optional(),
    /** Outlined secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Alt text driving the showroom hero photo. */
    imageAlt: z.string().optional(),
    /** Inline KPI strip stats. */
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: autoDealershipLakebed,
  component: ({ props, lakebed }) => {
    const eyebrow = props.eyebrow ?? 'Premium Pre-Owned Vehicles'
    const heading = props.heading ?? 'Find Your Perfect Drive'
    const subheading =
      props.subheading ??
      'Over 200 certified pre-owned vehicles. Competitive financing from 3.9% APR. 7-day money-back guarantee on every purchase.'
    const primaryCta = props.primaryCta ?? 'Browse Inventory'
    const secondaryCta = props.secondaryCta ?? 'Schedule Test Drive'
    const imageAlt =
      props.imageAlt ??
      'Premium white sedan parked in modern showroom with floor-to-ceiling windows'
    const stats = props.stats?.length
      ? props.stats
      : [
          { value: '200+', label: 'Vehicles in Stock' },
          { value: '3.9%', label: 'Starting APR' },
          { value: '4.9', label: 'Google Rating' },
        ]
    const words = heading.split(' ')
    const lastWord = words.length > 1 ? words[words.length - 1] : null
    const leadWords = lastWord ? words.slice(0, -1).join(' ') : heading

    return (
      <HeroSection
        className={cn(
          'relative overflow-hidden bg-foreground text-background [clip-path:polygon(0_0,100%_0,100%_calc(100%-3.5rem),0_100%)]',
          props.className,
        )}
      >
        {/* Diagonal speed-line texture sweeping in from the right. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-2/3 bg-[repeating-linear-gradient(115deg,currentColor,currentColor_1px,transparent_1px,transparent_18px)] text-background/[0.08] [mask-image:linear-gradient(to_left,black,transparent)]"
        />
        <Watermark className="-bottom-4 -left-2 italic text-background/[0.05] text-[6.5rem] sm:text-[11rem] lg:-bottom-10 lg:text-[17rem]">
          DRIVE
        </Watermark>

        <Container
          size="xl"
          className="relative py-14 pb-24 sm:py-16 sm:pb-28 lg:py-24 lg:pb-36"
        >
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-7">
              {/* Mono annotation rail: skew tick — eyebrow — hairline. */}
              <div className="mb-7 flex items-center gap-4">
                <span
                  aria-hidden="true"
                  className="inline-block h-2.5 w-8 shrink-0 -skew-x-12 bg-primary"
                />
                <MonoTag tone="inverted" className="min-w-0">
                  {eyebrow}
                </MonoTag>
                <span
                  aria-hidden="true"
                  className="hidden h-px flex-1 bg-background/20 sm:block"
                />
              </div>
              <h1 className="mb-7 text-[clamp(2.75rem,7vw,6.25rem)] font-black uppercase leading-[0.9] tracking-tight">
                {leadWords}
                {lastWord ? (
                  <>
                    {' '}
                    <span className="italic [-webkit-text-fill-color:transparent] [-webkit-text-stroke-width:2px]">
                      {lastWord}
                    </span>
                  </>
                ) : null}
              </h1>
              <p className="mb-9 max-w-xl border-l-2 border-primary pl-5 text-base leading-relaxed text-background/70 sm:text-lg">
                {subheading}
              </p>
              <div className="mb-12 grid grid-cols-1 gap-3 sm:flex sm:flex-wrap sm:gap-4">
                <NavbarRouteLink
                  className="inline-flex -skew-x-12 items-center justify-center rounded-none bg-primary px-8 py-4 text-sm font-bold uppercase tracking-[0.15em] text-primary-foreground ring-1 ring-background/50 transition-all duration-150 hover:bg-primary/90 active:translate-y-px"
                  href={primaryCta}
                >
                  <span className="inline-block skew-x-12">{primaryCta}</span>
                </NavbarRouteLink>
                <AutoLeadActionButton
                  lakebed={lakebed}
                  action="test_drive"
                  label={secondaryCta}
                  intentKey="hero-test-drive"
                  source="hero"
                  pendingChildren={
                    <span className="inline-flex skew-x-12 items-center gap-2">
                      <AutoMutationSpinner />
                      Sending
                    </span>
                  }
                  className="inline-flex -skew-x-12 items-center justify-center rounded-none border border-background/40 px-8 py-4 text-sm font-bold uppercase tracking-[0.15em] text-background transition-colors duration-150 hover:bg-background hover:text-foreground active:translate-y-px disabled:pointer-events-none disabled:opacity-70"
                >
                  <span className="inline-block skew-x-12">{secondaryCta}</span>
                </AutoLeadActionButton>
              </div>
              {/* Collapsed-border KPI strip: giant italic spec numerals. */}
              <div className="grid max-w-xl grid-cols-3 border-y border-background/20">
                {stats.map((s, i) => (
                  <div
                    key={s.label}
                    className={cn(
                      'py-5 pr-3',
                      i > 0 && 'border-l border-background/20 pl-4 sm:pl-6',
                    )}
                  >
                    <p className="text-[clamp(1.5rem,3vw,2.75rem)] font-black italic leading-none tracking-tight tabular-nums">
                      {s.value}
                    </p>
                    <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-background/60">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative">
                {/* Offset hairline frame behind the plate. */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 translate-x-3 translate-y-3 border border-background/25"
                />
                <HeroMediaPanel
                  alt={imageAlt}
                  w={800}
                  h={600}
                  className="relative aspect-[4/3] w-full rounded-none [clip-path:polygon(2.5rem_0,100%_0,100%_100%,0_100%)] lg:aspect-[4/5]"
                />
              </div>
              {/* Mono stock-label caption row. */}
              <span
                aria-hidden="true"
                className="mt-6 flex items-center gap-3 text-background/30"
              >
                <span className="inline-block h-1.5 w-6 -skew-x-12 bg-primary" />
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-background/50">
                  Stock № 0248 — Showroom A
                </span>
                <span className="h-px flex-1 bg-current" />
              </span>
            </div>
          </div>
        </Container>
      </HeroSection>
    )
  },
})
