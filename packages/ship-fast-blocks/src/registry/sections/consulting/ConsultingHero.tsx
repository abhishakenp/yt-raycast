import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'

/**
 * ConsultingHero — two-column hero section for a management-consulting firm
 * landing page. An eyebrow pill, a large headline with a muted-highlight phrase,
 * a supporting paragraph, dual CTAs (filled primary + outlined secondary),
 * inline trust stats with check icons, and a hero photo with a floating
 * client-retention stat card. CTAs route through useNavigate. Use as the
 * opening hero for consulting firms, strategy advisories, professional-services
 * groups, or corporate B2B landing pages. Renders fully with no props via
 * baked-in "Nexus Strategy Partners" defaults.
 */
export const ConsultingHero = defineCapsule({
  name: 'ConsultingHero',
  description:
    'Two-column hero section for a management-consulting firm landing page: an eyebrow pill, a large headline with one phrase rendered in muted highlight, a supporting paragraph, dual CTAs (filled primary and outlined secondary), inline trust stats with check icons, and a hero photo with a floating client-retention stat card. CTAs route through useNavigate. Use as the opening hero for consulting firms, strategy advisories, professional-services groups, or corporate B2B landing pages.',
  props: z.object({
    /** Eyebrow pill text above the headline. */
    eyebrow: z.string().optional(),
    /** Main headline text. */
    heading: z.string().optional(),
    /** Phrase inside the heading rendered with muted highlight color. */
    highlight: z.string().optional(),
    /** Supporting paragraph under the headline. */
    subheading: z.string().optional(),
    /** Filled primary CTA label. */
    primaryCta: z.string().optional(),
    /** Outlined secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Inline trust stats beneath the hero copy. */
    trust: z.array(z.string()).optional(),
    /** Alt text driving the hero photo. */
    imageAlt: z.string().optional(),
    /** Floating stat card value. */
    statValue: z.string().optional(),
    /** Floating stat card title. */
    statTitle: z.string().optional(),
    /** Floating stat card subtitle. */
    statSubtitle: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const eyebrow = props.eyebrow ?? 'Global Management Consulting'
    const heading =
      props.heading ?? 'Transforming Strategy into Sustainable Results'
    const highlight = props.highlight ?? 'Sustainable Results'
    const subheading =
      props.subheading ??
      'For 28 years, Nexus Strategy Partners has helped Fortune 500 companies and emerging leaders navigate complex challenges, unlock growth potential, and build enduring competitive advantage.'
    const primaryCta = props.primaryCta ?? 'Explore Our Services'
    const secondaryCta = props.secondaryCta ?? 'View Case Studies'
    const trust = props.trust?.length
      ? props.trust
      : ['850+ Clients Served', '24 Offices Worldwide']
    const imageAlt =
      props.imageAlt ??
      'Professional consultants collaborating around a conference table reviewing documents and data on laptops'
    const statValue = props.statValue ?? '92%'
    const statTitle = props.statTitle ?? 'Client Retention Rate'
    const statSubtitle = props.statSubtitle ?? 'Average 8-year partnership'

    const CheckIcon = ({ className }) => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
    )

    const renderHeading = () => {
      const idx = highlight ? heading.indexOf(highlight) : -1
      if (idx === -1) return heading
      return (
        <>
          {heading.slice(0, idx)}
          <span className="text-muted-foreground">{highlight}</span>
          {heading.slice(idx + highlight.length)}
        </>
      )
    }

    return (
      <section
        className={cn('relative overflow-hidden bg-muted', props.className)}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-br from-muted via-background to-muted"
        />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="space-y-8">
              <div className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs font-medium uppercase tracking-wide text-secondary-foreground">
                {eyebrow}
              </div>
              <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                {renderHeading()}
              </h1>
              <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
                {subheading}
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={() => go(primaryCta)}
                  className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-base font-medium text-primary-foreground shadow-lg transition-all hover:bg-primary/90"
                >
                  {primaryCta}
                </button>
                <button
                  type="button"
                  onClick={() => go(secondaryCta)}
                  className="inline-flex items-center justify-center rounded-md border border-border bg-background px-6 py-3 text-base font-medium text-foreground transition-all hover:bg-muted"
                >
                  {secondaryCta}
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-8 pt-4 text-sm text-muted-foreground">
                {trust.map((t) => (
                  <div key={t} className="flex items-center gap-2">
                    <CheckIcon className="size-5 text-muted-foreground" />
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div
                aria-hidden="true"
                className="absolute -inset-4 rounded-2xl bg-secondary/60"
              />
              <Image
                alt={imageAlt}
                w={800}
                h={600}
                className="relative aspect-[4/3] w-full rounded-xl object-cover shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 max-w-xs rounded-lg bg-card p-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="grid size-12 place-items-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                    {statValue}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-card-foreground">
                      {statTitle}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {statSubtitle}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  },
})
