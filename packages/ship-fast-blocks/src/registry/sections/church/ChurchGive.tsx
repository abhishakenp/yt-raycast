import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'
import { FeatureListItem } from '#/section-kit/FeatureListItem.tsx'
import { ImageTile } from '#/section-kit/ImageTile.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { DonationBand } from '#/section-kit/DonationBand.tsx'

/**
 * ChurchGive — generosity / give split section for a church or faith-community site.
 * Left column: eyebrow, heading, description, icon-accented giving-method list, and
 * dual pill CTAs. Right column: a staggered 2-column photo collage with two images
 * and two stat cards (one on muted bg, one on primary bg). Warm, mission-focused,
 * and action-oriented. CTAs route through useNavigate. Use as the giving / donate
 * section for churches, worship centers, ministries, or religious nonprofits.
 * Renders fully with no props via baked-in defaults.
 */
export const ChurchGive = defineCapsule({
  name: 'ChurchGive',
  description:
    'Generosity / give split section for a church or faith-community site: left column with eyebrow, heading, description, icon-accented giving-method list, and dual pill CTAs; right column with a staggered 2-column photo collage and two stat cards (one on muted bg, one on primary bg). Warm, mission-focused, and action-oriented. CTAs route through useNavigate. Use as the giving / donate section for churches, worship centers, ministries, or religious nonprofits.',
  props: z.object({
    /** Small uppercase eyebrow above the heading. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Paragraph under the heading. */
    description: z.string().optional(),
    /** Giving-method bullets; each has a title and a detail line. */
    points: z
      .array(z.object({ title: z.string(), detail: z.string() }))
      .optional(),
    /** Filled primary CTA label. */
    primaryCta: z.string().optional(),
    /** Outlined secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Alt text for the first (top-left) collage image. */
    imageAltOne: z.string().optional(),
    /** Alt text for the second (bottom-right) collage image. */
    imageAltTwo: z.string().optional(),
    /** First stat card (shown on muted bg). */
    statOne: z.object({ value: z.string(), label: z.string() }).optional(),
    /** Second stat card (shown on primary bg). */
    statTwo: z.object({ value: z.string(), label: z.string() }).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const eyebrow = props.eyebrow ?? 'Generosity'
    const heading = props.heading ?? 'Give with purpose'
    const description =
      props.description ??
      'Your generosity fuels our mission to love God and serve our city. Every dollar given supports community outreach, global missions, youth programs, and caring for those in need.'
    const points = props.points?.length
      ? props.points
      : [
          {
            title: 'Secure online giving',
            detail: 'One-time or recurring. Bank transfer has no fees.',
          },
          {
            title: 'Year-end statements',
            detail: 'Tax receipts emailed automatically in January.',
          },
          {
            title: 'Other ways to give',
            detail: 'Text, mail, or stock transfer available.',
          },
        ]
    const primaryCta = props.primaryCta ?? 'Give Online'
    const secondaryCta = props.secondaryCta ?? 'Text to Give'
    const imageAltOne =
      props.imageAltOne ??
      'Volunteers helping distribute supplies at a homeless outreach event'
    const imageAltTwo =
      props.imageAltTwo ??
      'Mission team building a school classroom in a rural community'
    const statOne = props.statOne ?? {
      value: '$1.2M',
      label: 'Given to local outreach in 2024',
    }
    const statTwo = props.statTwo ?? {
      value: '12',
      label: 'Global mission partners supported',
    }

    const giveIcons = [
      <svg
        key="currency"
        className="size-5 text-foreground"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      <svg
        key="clipboard"
        className="size-5 text-foreground"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>,
      <svg
        key="people"
        className="size-5 text-foreground"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>,
    ]

    return (
      <DonationBand asChild>
        <section className={cn('pt-28 pb-24 lg:pt-32 lg:pb-28', props.className)}>
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div>
              <SectionHeading
                eyebrow={eyebrow}
                title={heading}
                subtitle={description}
                align="left"
                eyebrowClassName="text-muted-foreground tracking-widest"
                titleClassName="text-3xl font-medium tracking-tight sm:text-4xl"
                subtitleClassName="text-lg leading-relaxed"
                className="mb-8 gap-4"
              />
              <div className="mb-10 space-y-4">
                {points.map((point, i) => (
                  <FeatureListItem
                    key={point.title}
                    icon={giveIcons[i % giveIcons.length]}
                    title={point.title}
                    description={point.detail}
                    iconShape="circle"
                    iconSize="md"
                  />
                ))}
              </div>
              <div className="flex flex-col gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(primaryCta)}
                  className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {primaryCta}
                </button>
                <button
                  type="button"
                  onClick={() => go(secondaryCta)}
                  className="inline-flex items-center justify-center rounded-full border border-border bg-card px-8 py-4 text-sm font-medium text-card-foreground transition-colors hover:bg-accent"
                >
                  {secondaryCta}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <ImageTile treatment="4-5-xl-muted">
                  <Image
                    alt={imageAltOne}
                    w={600}
                    h={750}
                    loading="lazy"
                    className="size-full object-cover"
                  />
                </ImageTile>
                <div className="rounded-xl bg-muted p-6">
                  <p className="mb-1 text-3xl font-medium text-foreground">
                    {statOne.value}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {statOne.label}
                  </p>
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="rounded-xl bg-primary p-6 text-primary-foreground">
                  <p className="mb-1 text-3xl font-medium">{statTwo.value}</p>
                  <p className="text-sm text-primary-foreground/80">
                    {statTwo.label}
                  </p>
                </div>
                <ImageTile treatment="4-5-xl-muted">
                  <Image
                    alt={imageAltTwo}
                    w={600}
                    h={750}
                    loading="lazy"
                    className="size-full object-cover"
                  />
                </ImageTile>
              </div>
            </div>
          </div>
        </div>
        </section>
      </DonationBand>
    )
  },
})
