import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'

/**
 * LawFirmHero — split, two-column hero for a corporate / trial law firm. On the
 * left: a tracked-uppercase eyebrow, a large serif headline whose second line is
 * an italic muted highlight, a lead paragraph, dual CTAs (solid primary +
 * bordered secondary), and a phone / office-address contact row with line
 * icons. On the right: a tall office photo with a floating success-rate stat
 * card overlapping its lower-left corner. Refined, authoritative, serif-driven
 * editorial aesthetic on a warm neutral canvas. CTAs and contact links route
 * through useNavigate; the photo uses the alt-driven Image component. Use as the
 * opening hero for law firms, attorneys, legal practices, corporate counsel,
 * litigation boutiques or any premium professional-services landing page.
 * Renders fully with no props via baked-in defaults.
 */
export const LawFirmHero = defineCapsule({
  name: 'LawFirmHero',
  description:
    'Split two-column hero for a corporate / trial law firm: left column has a tracked-uppercase eyebrow, a large serif headline with an italic muted highlight on the second line, a lead paragraph, dual CTAs (solid primary + bordered secondary) and a phone / office-address contact row with line icons; right column shows a tall office photo with a floating success-rate stat card overlapping its lower-left corner. Refined, authoritative, serif-driven editorial aesthetic on a warm neutral canvas with sharp squared corners. CTAs and contact links route through useNavigate; imagery uses the alt-driven Image component. Use as the opening hero for law firms, attorneys, legal practices, corporate counsel, litigation boutiques, estate-planning or tax practices, or any premium professional-services landing page.',
  props: z.object({
    eyebrow: z.string().optional(),
    headingTop: z.string().optional(),
    /** Phrase rendered as the italic highlight on the second line. */
    highlight: z.string().optional(),
    subheading: z.string().optional(),
    primaryCta: z.string().optional(),
    secondaryCta: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    imageAlt: z.string().optional(),
    statValue: z.string().optional(),
    statLabel: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const eyebrow = props.eyebrow ?? 'Corporate & Trial Law Since 1987'
    const headingTop = props.headingTop ?? 'Strategic Counsel.'
    const highlight = props.highlight ?? 'Decisive Results.'
    const subheading =
      props.subheading ??
      'Reinhart & Associates provides sophisticated legal representation to Fortune 500 companies, emerging enterprises, and private clients. Our 34 attorneys deliver measurable outcomes in corporate transactions, complex litigation, and regulatory matters.'
    const primaryCta = props.primaryCta ?? 'Schedule Consultation'
    const secondaryCta = props.secondaryCta ?? 'Explore Services'
    const phone = props.phone ?? '(212) 555-0147'
    const address = props.address ?? '450 Lexington Ave, New York, NY'
    const imageAlt =
      props.imageAlt ??
      'Modern executive law office with floor-to-ceiling windows overlooking Manhattan skyline'
    const statValue = props.statValue ?? '94%'
    const statLabel =
      props.statLabel ??
      'Success rate in commercial litigation matters resolved since 2020'

    const PhoneIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
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
        <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    )

    const MapPinIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
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
        <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )

    return (
      <section className={cn('bg-background py-24 lg:py-32', props.className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div>
              <p className="mb-4 text-sm uppercase tracking-widest text-muted-foreground">
                {eyebrow}
              </p>
              <h1 className="mb-6 font-serif text-4xl leading-tight text-foreground lg:text-6xl">
                {headingTop}
                <br />
                <span className="italic text-muted-foreground">
                  {highlight}
                </span>
              </h1>
              <p className="mb-8 max-w-xl text-lg leading-relaxed text-muted-foreground">
                {subheading}
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(primaryCta)}
                  className="bg-primary px-8 py-4 text-center font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {primaryCta}
                </button>
                <button
                  type="button"
                  onClick={() => go(secondaryCta)}
                  className="border border-border px-8 py-4 text-center font-medium text-foreground transition-colors hover:border-foreground/40"
                >
                  {secondaryCta}
                </button>
              </div>
              <div className="mt-12 flex flex-col gap-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:gap-8">
                <button
                  type="button"
                  onClick={() => go(phone)}
                  className="flex items-center gap-2 transition-colors hover:text-foreground"
                >
                  <PhoneIcon className="size-5" />
                  <span>{phone}</span>
                </button>
                <button
                  type="button"
                  onClick={() => go(secondaryCta)}
                  className="flex items-center gap-2 text-left transition-colors hover:text-foreground"
                >
                  <MapPinIcon className="size-5 shrink-0" />
                  <span>{address}</span>
                </button>
              </div>
            </div>
            <div className="relative">
              <Image
                alt={imageAlt}
                w={800}
                h={600}
                loading="eager"
                className="h-[500px] w-full rounded-sm object-cover shadow-2xl"
              />
              <div className="absolute -bottom-8 -left-8 hidden max-w-xs bg-card p-6 shadow-xl lg:block">
                <p className="mb-2 font-serif text-2xl text-foreground">
                  {statValue}
                </p>
                <p className="text-sm text-muted-foreground">{statLabel}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  },
})
