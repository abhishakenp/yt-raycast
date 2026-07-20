import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import {
  FeatureListItem,
  FeatureListItemIcon,
  FeatureListItemTitle,
  FeatureListItemDescription,
  FeatureListItemBody,
} from '#/section-kit/FeatureListItem.tsx'
import { ImageTile } from '#/section-kit/ImageTile.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { DonationBand } from '#/section-kit/DonationBand.tsx'
import { ResponsiveGrid } from '#/section-kit/ResponsiveGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * ChurchGive — serene editorial generosity / give section for a church or
 * faith-community site, with a giant ghost serif "Give" watermark. An
 * asymmetric 7:5 grid: the left column opens with a mono metadata rail
 * (eyebrow — hairline rule — "2 Cor. 9:7" verse index), a large serif heading,
 * and a hairline-ruled description, then lists the giving methods as quiet
 * ledger rows (hairline top rule, faint serif index numeral, title + detail),
 * and closes with dual sharp uppercase-mono CTAs (solid foreground + hairline
 * outline inverting on hover, press feedback). The right column is a
 * staggered 2-column collage of hairline-framed photo plates and two ledger
 * stat cards — one on a soft muted wash, one inverted foreground-on-background
 * with a serif value. CTAs route through section-kit route links. Use as the
 * giving / donate section for churches, worship centers, ministries, or
 * religious nonprofits. Renders fully with no props via baked-in defaults.
 */
export const ChurchGive = defineCapsule({
  name: 'ChurchGive',
  description:
    "Serene editorial generosity / give section for a church or faith-community site with a giant ghost serif 'Give' watermark. Asymmetric 7:5 grid: left column with a mono metadata rail (eyebrow, hairline rule, '2 Cor. 9:7' verse index), large serif heading, hairline-ruled description, giving methods as quiet ledger rows (hairline top rule, faint serif index numeral, title + detail), and dual sharp uppercase-mono CTAs (solid foreground + hairline outline inverting on hover, press feedback); right column with a staggered 2-column collage of hairline-framed photo plates and two ledger stat cards — one on a soft muted wash, one inverted foreground-on-background with a serif value. CTAs route through section-kit route links. Use as the giving / donate section for churches, worship centers, ministries, or religious nonprofits.",
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

    return (
      <DonationBand asChild>
        <section
          className={cn(
            'relative overflow-hidden py-20 lg:py-28',
            props.className,
          )}
        >
          <Watermark className="-bottom-8 -left-4 font-serif text-[7rem] font-medium italic text-foreground/[0.04] sm:text-[10rem] lg:text-[14rem]">
            Give
          </Watermark>
          <Container size="xl" className="relative px-6">
            <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-7">
                <div className="mb-8 flex items-center gap-4">
                  <MonoTag tone="primary" className="shrink-0">
                    {eyebrow}
                  </MonoTag>
                  <span aria-hidden="true" className="h-px flex-1 bg-border" />
                  <MonoTag tone="faint" className="hidden shrink-0 sm:inline">
                    2 Cor. 9:7
                  </MonoTag>
                </div>
                <SectionHeading
                  title={heading}
                  subtitle={description}
                  align="left"
                  className="mb-10 gap-0"
                  titleClassName="mb-6 font-serif text-4xl font-medium leading-[1.08] tracking-tight text-foreground sm:text-5xl"
                  subtitleClassName="max-w-lg border-l border-border pl-5 text-base leading-relaxed text-muted-foreground sm:text-lg"
                />
                <div className="mb-10">
                  {points.map((point, i) => (
                    <FeatureListItem
                      key={point.title}
                      className="items-start gap-5 border-t border-border py-5 sm:gap-8"
                    >
                      <FeatureListItemIcon
                        shape="circle"
                        className="size-auto rounded-none bg-transparent pt-0.5 font-serif text-2xl font-medium italic leading-none text-muted-foreground/40"
                      >
                        {String(i + 1).padStart(2, '0')}
                      </FeatureListItemIcon>
                      <FeatureListItemBody>
                        <FeatureListItemTitle className="font-serif text-lg font-medium tracking-tight">
                          {point.title}
                        </FeatureListItemTitle>
                        <FeatureListItemDescription className="mt-1 leading-relaxed">
                          {point.detail}
                        </FeatureListItemDescription>
                      </FeatureListItemBody>
                    </FeatureListItem>
                  ))}
                  <span aria-hidden="true" className="block h-px bg-border" />
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                  <NavbarRouteLink
                    className="inline-flex items-center justify-center rounded-none bg-foreground px-8 py-4 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-background transition-all duration-150 hover:bg-foreground/90 active:translate-y-px"
                    href={primaryCta}
                  >
                    {primaryCta}
                  </NavbarRouteLink>
                  <NavbarRouteLink
                    className="inline-flex items-center justify-center rounded-none border border-foreground/60 bg-transparent px-8 py-4 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground transition-all duration-150 hover:border-foreground hover:bg-foreground hover:text-background active:translate-y-px"
                    href={secondaryCta}
                  >
                    {secondaryCta}
                  </NavbarRouteLink>
                </div>
              </div>
              <ResponsiveGrid cols="2" className="gap-4 lg:col-span-5">
                <div className="space-y-4">
                  <ImageTile
                    treatment="4-5-xl-muted"
                    className="rounded-none border border-border"
                  >
                    <Image
                      alt={imageAltOne}
                      w={600}
                      h={750}
                      loading="lazy"
                      className="size-full object-cover"
                    />
                  </ImageTile>
                  <div className="border border-border bg-muted/40 p-6">
                    <p className="font-serif text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
                      {statOne.value}
                    </p>
                    <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                      {statOne.label}
                    </p>
                  </div>
                </div>
                <div className="space-y-4 pt-10">
                  <div className="bg-foreground p-6 text-background">
                    <p className="font-serif text-3xl font-medium tracking-tight sm:text-4xl">
                      {statTwo.value}
                    </p>
                    <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-background/70">
                      {statTwo.label}
                    </p>
                  </div>
                  <ImageTile
                    treatment="4-5-xl-muted"
                    className="rounded-none border border-border"
                  >
                    <Image
                      alt={imageAltTwo}
                      w={600}
                      h={750}
                      loading="lazy"
                      className="size-full object-cover"
                    />
                  </ImageTile>
                </div>
              </ResponsiveGrid>
            </div>
          </Container>
        </section>
      </DonationBand>
    )
  },
})
