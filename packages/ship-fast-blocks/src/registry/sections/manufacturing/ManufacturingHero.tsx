import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  HeroSection,
  HeroHeading,
  HeroSubheading,
  HeroActions,
  HeroCta,
  HeroMediaPanel,
} from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'

/**
 * ManufacturingHero — heavy-industrial split hero band for a precision-
 * manufacturing / industrial-fabrication landing page. An asymmetric 7/5 layout:
 * on the left a mono model-index eyebrow, a hard-bordered certification status
 * chip (pulsing accent dot + label), a giant extrabold headline, a supporting
 * paragraph, dual squared CTA slabs with mechanical press feedback, and a
 * collapsed-border KPI spec ledger (mono labels + tabular-nums numerals); on the
 * right a tall CNC machining photo framed as a hard-bordered slab with an offset
 * shadow, a floating quality-badge slab, and a giant ghost watermark bleeding
 * behind. Tech-brutalist, industrial B2B aesthetic; CTAs route through section-kit
 * route links and the photo uses the alt-driven Image component. Use as the
 * opening hero for CNC machine shops, metal fabricators, contract manufacturers
 * or industrial engineering firms. Renders fully with no props via baked-in
 * "Vertex Manufacturing" defaults.
 */
export const ManufacturingHero = defineCapsule({
  name: 'ManufacturingHero',
  description:
    'Heavy-industrial split hero band for a precision-manufacturing / industrial-fabrication landing page: an asymmetric 7/5 layout with a mono model-index eyebrow, a hard-bordered certification status chip (pulsing accent dot + label), a giant extrabold headline, a supporting paragraph, dual squared CTA slabs with mechanical press feedback, and a collapsed-border KPI spec ledger (mono labels + tabular-nums numerals) on the left, and a tall CNC machining photo framed as a hard-bordered slab with an offset shadow plus a floating quality-badge slab and a giant ghost watermark on the right. Tech-brutalist industrial B2B aesthetic; CTAs route through section-kit route links and the photo uses the alt-driven Image component. Use as the opening hero for CNC machine shops, metal fabricators, contract manufacturers or industrial engineering firms.',
  props: z.object({
    badge: z.string().optional(),
    heading: z.string().optional(),
    subheading: z.string().optional(),
    primaryCta: z.string().optional(),
    secondaryCta: z.string().optional(),
    imageAlt: z.string().optional(),
    floatingTitle: z.string().optional(),
    floatingSubtitle: z.string().optional(),
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const badge = props.badge ?? 'ISO 9001:2015 Certified'
    const heading =
      props.heading ?? 'Precision Manufacturing for Complex Industries'
    const subheading =
      props.subheading ??
      'Vertex Manufacturing Solutions delivers aerospace-grade CNC machining, metal fabrication, and industrial engineering. From prototype to production, we transform raw materials into mission-critical components with tolerances as tight as ±0.0005".'
    const primaryCta = props.primaryCta ?? 'Request a Quote'
    const secondaryCta = props.secondaryCta ?? 'View Our Work'
    const imageAlt =
      props.imageAlt ??
      'CNC machining center cutting precision metal parts with coolant spray in industrial manufacturing facility'
    const floatingTitle = props.floatingTitle ?? 'AS9100D Certified'
    const floatingSubtitle =
      props.floatingSubtitle ?? 'Aerospace Quality Standard'
    const stats = props.stats?.length
      ? props.stats
      : [
          { value: '50+', label: 'CNC Machines' },
          { value: '35', label: 'Years Experience' },
          { value: '99.7%', label: 'Quality Rate' },
        ]

    return (
      <HeroSection
        className={cn(
          'relative overflow-hidden bg-background',
          props.className,
        )}
      >
        <Watermark className="-right-6 top-6 text-[8rem] leading-none sm:text-[12rem] lg:text-[15rem]">
          CNC
        </Watermark>
        <Container size="xl" className="relative pb-20 pt-14 lg:pb-28 lg:pt-20">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-7">
              <div className="flex flex-wrap items-center gap-4">
                <MonoTag>001 / Precision Manufacturing</MonoTag>
                <span className="inline-flex items-center gap-2 rounded-none border-2 border-foreground bg-background px-3 py-1">
                  <span className="size-2 rounded-full bg-primary motion-safe:animate-pulse" />
                  <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground">
                    {badge}
                  </span>
                </span>
              </div>
              <HeroHeading className="mt-6 font-extrabold uppercase tracking-tight text-foreground">
                {heading}
              </HeroHeading>
              <HeroSubheading className="mt-5 max-w-xl">
                {subheading}
              </HeroSubheading>
              <HeroActions className="mt-8 gap-4">
                <HeroCta
                  asChild
                  className="rounded-none border-2 border-foreground bg-foreground px-6 py-3 text-sm font-bold uppercase tracking-wide text-background shadow-[5px_5px_0_0] shadow-foreground transition-[transform,box-shadow] duration-150 hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[7px_7px_0_0] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none motion-reduce:transform-none"
                >
                  <NavbarRouteLink href={primaryCta}>
                    {primaryCta}
                  </NavbarRouteLink>
                </HeroCta>
                <HeroCta
                  asChild
                  variant="outline"
                  className="rounded-none border-2 border-foreground bg-background px-6 py-3 text-sm font-bold uppercase tracking-wide text-foreground shadow-[5px_5px_0_0] shadow-foreground transition-[transform,box-shadow] duration-150 hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[7px_7px_0_0] hover:bg-muted active:translate-x-[3px] active:translate-y-[3px] active:shadow-none motion-reduce:transform-none"
                >
                  <NavbarRouteLink href={secondaryCta}>
                    {secondaryCta}
                  </NavbarRouteLink>
                </HeroCta>
              </HeroActions>
              <div className="mt-10 grid grid-cols-3 border-2 border-foreground">
                {stats.map((s, i) => (
                  <div
                    key={s.label}
                    className={cn(
                      'p-4 sm:p-5',
                      i > 0 && 'border-l-2 border-foreground',
                    )}
                  >
                    <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                      {s.label}
                    </p>
                    <p className="mt-1 text-2xl font-extrabold tabular-nums tracking-tight text-foreground sm:text-3xl">
                      {s.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative lg:col-span-5">
              <HeroMediaPanel
                alt={imageAlt}
                w={800}
                h={500}
                className="h-[360px] w-full rounded-none border-2 border-foreground shadow-[8px_8px_0_0] shadow-foreground lg:h-[480px]"
              />
              <div className="absolute -bottom-5 -left-5 hidden rounded-none border-2 border-foreground bg-background p-4 shadow-[6px_6px_0_0] shadow-primary sm:block">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-none border-2 border-foreground bg-foreground text-background">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                  <div>
                    <p className="text-sm font-bold uppercase tracking-tight text-foreground">
                      {floatingTitle}
                    </p>
                    <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                      {floatingSubtitle}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </HeroSection>
    )
  },
})
