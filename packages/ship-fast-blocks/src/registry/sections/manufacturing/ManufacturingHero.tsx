import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import {
  HeroSection,
  HeroHeading,
  HeroSubheading,
  HeroActions,
  HeroMediaPanel,
} from '#/section-kit/HeroSection.tsx'

/**
 * ManufacturingHero — split hero band for a precision-manufacturing /
 * industrial-fabrication landing page. A two-column layout: on the left a
 * certification status pill (pulsing dot + label), a large semibold headline, a
 * supporting paragraph, dual CTAs (filled + outlined) and a divided KPI stat
 * strip; on the right a tall CNC machining photo with a floating quality-badge
 * card (check icon + title + subtitle). Clean, neutral, industrial B2B
 * aesthetic. CTAs route through useNavigate and the photo uses the alt-driven
 * Image component. Use as the opening hero for CNC machine shops, metal
 * fabricators, contract manufacturers or industrial engineering firms. Renders
 * fully with no props via baked-in "Vertex Manufacturing" defaults.
 */
export const ManufacturingHero = defineCapsule({
  name: 'ManufacturingHero',
  description:
    'Split hero band for a precision-manufacturing / industrial-fabrication landing page: two-column layout with a certification status pill (pulsing dot + label), a large semibold headline, a supporting paragraph, dual CTAs (filled + outlined) and a divided KPI stat strip on the left, and a tall CNC machining photo with a floating quality-badge card (check icon + title + subtitle) on the right. Clean, neutral, industrial B2B aesthetic; CTAs route through useNavigate and the photo uses the alt-driven Image component. Use as the opening hero for CNC machine shops, metal fabricators, contract manufacturers or industrial engineering firms.',
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
    const go = useNavigate()
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
      <HeroSection className={cn('relative bg-background', props.className)}>
        <div className="mx-auto max-w-7xl px-4 pb-24 pt-16 sm:px-6 lg:px-8 lg:pb-32 lg:pt-24">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1">
                <span className="size-2 rounded-full bg-chart-2" />
                <span className="text-xs font-medium text-muted-foreground">
                  {badge}
                </span>
              </div>
              <HeroHeading className="font-semibold">{heading}</HeroHeading>
              <HeroSubheading className="max-w-xl">{subheading}</HeroSubheading>
              <HeroActions className="gap-4">
                <button
                  type="button"
                  onClick={() => go(primaryCta)}
                  className="inline-flex items-center rounded-md bg-foreground px-6 py-3 font-medium text-background transition-colors hover:bg-foreground/90"
                >
                  {primaryCta}
                </button>
                <button
                  type="button"
                  onClick={() => go(secondaryCta)}
                  className="inline-flex items-center rounded-md border border-border px-6 py-3 font-medium text-foreground transition-colors hover:bg-muted"
                >
                  {secondaryCta}
                </button>
              </HeroActions>
              <div className="flex items-center gap-6 border-t border-border pt-4">
                {stats.map((s, i) => (
                  <div key={s.label} className="flex items-center gap-6">
                    {i > 0 && <span className="h-10 w-px bg-border" />}
                    <div>
                      <p className="text-2xl font-semibold text-foreground">
                        {s.value}
                      </p>
                      <p className="text-sm text-muted-foreground">{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <HeroMediaPanel
                alt={imageAlt}
                w={800}
                h={500}
                className="h-[400px] w-full rounded-lg shadow-xl lg:h-[500px]"
              />
              <div className="absolute -bottom-6 -left-6 hidden rounded-lg bg-card p-4 shadow-lg sm:block">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-full bg-muted text-foreground">
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
                    <p className="text-sm font-medium text-card-foreground">
                      {floatingTitle}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {floatingSubtitle}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </HeroSection>
    )
  },
})
