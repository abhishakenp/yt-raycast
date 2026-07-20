import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import {
  PricingGrid,
  PricingTier,
  PricingTierName,
  PricingTierPrice,
  PricingTierTagline,
} from '#/section-kit/PricingGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { CtaAction } from '#/section-kit/CtaBand.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import { cn } from '#/lib/utils.ts'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * InteriorDesignPricing — the page's inverted (ink-surface) services + pricing
 * ledger for an upscale interior-design / architecture studio. A dramatic band on
 * the dark foreground surface, cut in on a slanted clip-path seam with a giant
 * ghost "&" watermark bleeding behind: an asymmetric 5:7 split pairs a mono
 * "05 / SERVICES" rail, a light-weight heading, a supporting paragraph and a
 * square inverted CTA with press feedback on the left, with a hairline-divided
 * vertical list of service tiers on the right — each a mono index, a title, a
 * right-aligned tabular price and a short description. Editorial, refined, high-
 * contrast, binary radius. The CTA routes through section-kit route links. Use to
 * present service packages and pricing for interior designers, design studios or
 * architecture firms. Renders fully with no props via baked-in defaults.
 */
export const InteriorDesignPricing = defineCapsule({
  name: 'InteriorDesignPricing',
  description:
    "The page's inverted (ink-surface) services + pricing ledger for an upscale interior-design / architecture studio: a dramatic band on the dark foreground surface, cut in on a slanted clip-path seam with a giant ghost '&' watermark, pairing an asymmetric 5:7 split — a mono '05 / SERVICES' rail, light-weight heading, supporting paragraph and a square inverted CTA with press feedback on the left, and a hairline-divided vertical list of service tiers (mono index, title, right-aligned tabular price, short description) on the right. Editorial, refined, high-contrast, binary radius; the CTA routes through section-kit route links. Use to present service packages and pricing for interior designers, design studios or architecture firms.",
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    description: z.string().optional(),
    cta: z.string().optional(),
    items: z
      .array(
        z.object({
          title: z.string(),
          price: z.string(),
          description: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Services'
    const heading = props.heading ?? 'Comprehensive design services'
    const description =
      props.description ??
      'From initial concept to final installation, we offer a full spectrum of interior design services tailored to projects of every scale.'
    const cta = props.cta ?? 'Request Service Guide'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Full-Service Design',
            price: 'From $25,000',
            description:
              'Complete interior design from concept through installation. Includes space planning, material selection, custom furniture design, and project management.',
          },
          {
            title: 'Design Consultation',
            price: '$500/hour',
            description:
              'Professional guidance for DIY projects or renovation planning. Includes detailed recommendations, material suggestions, and vendor referrals.',
          },
          {
            title: 'Furniture Procurement',
            price: 'Project-based',
            description:
              'Access to trade-only furniture and decor with designer discounts. We source, procure, and coordinate delivery and placement.',
          },
          {
            title: 'Styling & Accessories',
            price: 'From $5,000',
            description:
              'The finishing touches that make a house a home. Art curation, accessory selection, and professional styling for photography or living.',
          },
        ]

    return (
      <section
        className={cn(
          // Slanted top seam: the inverted band cuts in on a diagonal
          // (clip-path is neighbor-independent), with compensating top pad.
          'relative overflow-hidden bg-foreground py-20 pt-28 text-background [clip-path:polygon(0_3rem,100%_0,100%_100%,0_100%)] md:py-28 md:pt-36',
          props.className,
        )}
      >
        <Watermark
          aria-hidden="true"
          className="-bottom-16 -right-4 text-background/[0.05] text-[16rem] leading-none sm:text-[22rem] lg:text-[30rem]"
        >
          &amp;
        </Watermark>
        <Container size="xl" className="relative">
          <PricingGrid className="grid-cols-1 items-start gap-12 md:grid-cols-1 lg:grid-cols-12 lg:gap-20 xl:grid-cols-12">
            <div className="lg:col-span-5">
              <MonoTag
                tone="inverted"
                className="mb-6 flex items-center gap-3 tracking-[0.2em]"
              >
                <span aria-hidden="true" className="size-2 bg-primary" />
                05 / {eyebrow}
              </MonoTag>
              <h2 className="mb-6 max-w-md text-balance text-3xl font-light tracking-tight text-background md:text-5xl">
                {heading}
              </h2>
              <p className="mb-12 max-w-md text-pretty leading-relaxed text-background/70">
                {description}
              </p>
              <CtaAction
                variant="primary"
                invert
                className="rounded-none px-8 py-4 text-sm font-medium transition-all duration-150 active:translate-y-px"
                asChild
              >
                <NavbarRouteLink href={cta}>{cta}</NavbarRouteLink>
              </CtaAction>
            </div>

            <div className="border-t border-background/20 lg:col-span-7">
              {items.map((item, i) => (
                <PricingTier
                  key={item.title}
                  className="gap-0 rounded-none border-0 border-b border-background/20 bg-transparent p-0 py-8 shadow-none"
                >
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div className="flex items-baseline gap-4">
                      <span
                        aria-hidden="true"
                        className="font-mono text-[11px] tabular-nums tracking-[0.2em] text-background/40"
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <PricingTierName className="text-xl font-medium tracking-tight text-background">
                        {item.title}
                      </PricingTierName>
                    </div>
                    <PricingTierPrice className="whitespace-nowrap font-mono text-sm font-normal tabular-nums tracking-tight text-background/60">
                      {item.price}
                    </PricingTierPrice>
                  </div>
                  <PricingTierTagline className="max-w-xl pl-9 text-sm leading-relaxed text-background/70">
                    {item.description}
                  </PricingTierTagline>
                </PricingTier>
              ))}
            </div>
          </PricingGrid>
        </Container>
      </section>
    )
  },
})
