import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { commerceCartLakebed } from '../commerce/cart-lakebed.ts'
import {
  CommerceAddItemButton,
  CommerceMutationSpinner,
  commerceProduct,
  useSyncCommerceCatalog,
} from '../commerce/commerce-interactions.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * CafeHero — warm newsprint front-page hero for a neighborhood cafe / coffee
 * shop landing page. Opens with a hairline-ruled masthead dateline row: the
 * open-now availability text as a mono stamp with a pulsing primary dot, a
 * hairline rule, and a mono edition label. Below, an asymmetric 7:5 editorial
 * split — left holds a giant serif headline with an italic primary highlight
 * word (echoed as a giant serif ghost watermark behind the section), the
 * supporting paragraph, two sharp square newsprint CTAs (inverted primary +
 * hairline secondary, hard invert on hover with press feedback), a
 * dashed-border "today's pick" add-to-cart stamp chip, and a collapsed-border
 * three-cell KPI ledger strip with serif numerals over mono labels. Right
 * holds the tall interior photo in a kraft-washed hairline frame plate with a
 * mono "Fig. 01" caption row and a slightly rotated press-clipping review
 * card (serif quote, avatar, mono attribution) overlapping its bottom-left
 * corner. Every CTA routes through section-kit route links. Use as the
 * opening hero for cafes, bakeries, tea houses, brunch spots, or any warm
 * food-and-drink small business. Renders fully with no props via baked-in
 * "Little Owl Coffee" defaults.
 */
export const CafeHero = defineCapsule({
  name: 'CafeHero',
  description:
    "Warm newsprint front-page hero for a cozy cafe / coffee shop landing page: a hairline-ruled masthead dateline row holds the availability text as a mono stamp with pulsing dot plus a mono edition label; below, an asymmetric 7:5 editorial split pairs a giant serif headline with an italic primary highlight word (echoed as a giant serif ghost watermark) over the supporting paragraph, two sharp square newsprint CTAs with hard invert hovers and press feedback, a dashed-border add-to-cart stamp chip for today's pick, and a collapsed-border three-cell KPI ledger strip with serif numerals over mono labels; the right column frames the tall interior photo in a kraft-washed hairline plate with a mono 'Fig. 01' caption and a slightly rotated press-clipping review card (serif quote, avatar, mono attribution) overlapping its corner. CTAs route through section-kit route links. Use as the opening hero for cafes, bakeries, tea houses, brunch spots, or warm food-and-drink businesses.",
  lakebed: commerceCartLakebed,
  props: z.object({
    /** Availability / status pill text. */
    badge: z.string().optional(),
    /** First heading line (before the highlight). */
    headingTop: z.string().optional(),
    /** Phrase rendered with the amber italic highlight. */
    highlight: z.string().optional(),
    /** Trailing heading text after the highlight. */
    headingBottom: z.string().optional(),
    /** Supporting paragraph under the headline. */
    subheading: z.string().optional(),
    /** Filled primary CTA label. */
    primaryCta: z.string().optional(),
    /** Outlined secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Featured shoppable cafe item name. */
    featuredItemName: z.string().optional(),
    /** Featured shoppable cafe item price. */
    featuredItemPrice: z.string().optional(),
    /** Alt text driving the tall hero interior photo. */
    imageAlt: z.string().optional(),
    /** Floating customer-review card over the hero photo — quote text. */
    quote: z.string().optional(),
    /** Quote attribution name. */
    quoteName: z.string().optional(),
    /** Quote attribution role. */
    quoteRole: z.string().optional(),
    /** Alt text driving the quote avatar image. */
    quoteAvatarAlt: z.string().optional(),
    /** Inline KPI strip beneath the hero copy. */
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props, lakebed }) => {
    const badge = props.badge ?? 'Now Open — 7am to 7pm Daily'
    const headingTop = props.headingTop ?? 'Coffee that feels like'
    const highlight = props.highlight ?? 'home'
    const headingBottom = props.headingBottom ?? ''
    const subheading =
      props.subheading ??
      "Specialty coffee, house-made pastries, and a cozy corner for your morning ritual. Located in the heart of Portland's Pearl District since 2018."
    const primaryCta = props.primaryCta ?? 'View Menu'
    const secondaryCta = props.secondaryCta ?? 'Find Us'
    const featuredItemName = props.featuredItemName ?? 'Oat Flat White'
    const featuredItemPrice = props.featuredItemPrice ?? '$5.50'
    const imageAlt =
      props.imageAlt ??
      'Cozy coffee shop interior with warm wood tables, exposed brick walls, and soft morning light streaming through large windows'
    const quote = props.quote ?? 'Best latte in Portland, hands down.'
    const quoteName = props.quoteName ?? 'Sarah Chen'
    const quoteRole = props.quoteRole ?? 'Verified Google Review'
    const quoteAvatarAlt =
      props.quoteAvatarAlt ??
      'Professional headshot of Sarah Chen, a smiling customer with short dark hair'
    const stats = props.stats?.length
      ? props.stats
      : [
          { value: '4.9', label: 'Google Rating' },
          { value: '6', label: 'Years Serving' },
          { value: '12', label: 'Coffee Origins' },
        ]
    useSyncCommerceCatalog(lakebed, [
      commerceProduct({
        imageAlt,
        label: featuredItemName,
        price: featuredItemPrice,
        subtitle: badge,
      }),
    ])

    return (
      <section
        className={cn(
          'relative overflow-hidden bg-background px-6 pt-24 pb-20 lg:px-8 lg:pt-32 lg:pb-28',
          props.className,
        )}
      >
        {/* Giant serif ghost of the highlight word — the front page's watermark. */}
        <Watermark className="top-16 right-[-4%] font-serif text-[6rem] font-medium italic tracking-tight text-foreground/[0.05] sm:text-[10rem] lg:top-10 lg:text-[16rem]">
          {highlight}
        </Watermark>

        <Container size="xl" className="relative">
          {/* Masthead dateline row. */}
          <div className="flex items-center gap-4 border-y border-foreground/15 py-3">
            <span className="inline-flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-foreground">
              <span
                aria-hidden="true"
                className="size-1.5 shrink-0 animate-pulse rounded-full bg-primary"
              />
              {badge}
            </span>
            <span
              aria-hidden="true"
              className="hidden h-px flex-1 bg-foreground/15 sm:block"
            />
            <MonoTag tone="faint" className="hidden sm:inline">
              No. 01 — Front Page
            </MonoTag>
          </div>

          <div className="mt-10 grid gap-14 lg:mt-14 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-7">
              <h1 className="font-serif text-5xl font-medium leading-[1.02] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
                {headingTop}{' '}
                <span className="italic text-primary">{highlight}</span>
                {headingBottom ? ` ${headingBottom}` : null}
              </h1>
              <p className="mt-6 max-w-lg border-l-2 border-primary/40 pl-5 text-lg leading-relaxed text-muted-foreground">
                {subheading}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <NavbarRouteLink
                  className="inline-flex items-center justify-center border border-foreground bg-foreground px-8 py-4 font-mono text-xs font-semibold uppercase tracking-[0.15em] text-background transition-colors duration-150 hover:bg-background hover:text-foreground active:translate-y-px"
                  href={primaryCta}
                >
                  {primaryCta}
                </NavbarRouteLink>
                <NavbarRouteLink
                  className="inline-flex items-center justify-center border border-foreground/30 bg-transparent px-8 py-4 font-mono text-xs font-semibold uppercase tracking-[0.15em] text-foreground transition-colors duration-150 hover:border-foreground hover:bg-foreground hover:text-background active:translate-y-px"
                  href={secondaryCta}
                >
                  {secondaryCta}
                </NavbarRouteLink>
              </div>
              <CommerceAddItemButton
                lakebed={lakebed}
                item={{ label: featuredItemName, price: featuredItemPrice }}
                aria-label={`Add ${featuredItemName} to cart`}
                pendingChildren={
                  <>
                    <CommerceMutationSpinner />
                    Adding
                  </>
                }
                className="mt-4 inline-flex items-center justify-center gap-2 border border-dashed border-primary/50 px-5 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-primary transition-colors duration-150 hover:border-primary hover:bg-primary hover:text-primary-foreground active:translate-y-px disabled:pointer-events-none disabled:opacity-70"
              >
                Add today&apos;s pick · {featuredItemPrice}
              </CommerceAddItemButton>

              {/* Collapsed-border KPI ledger strip. */}
              <div className="mt-10 grid grid-cols-3 divide-x divide-foreground/15 border-y border-foreground/15">
                {stats.map((s) => (
                  <div key={s.label} className="px-4 py-5 first:pl-0 sm:px-6">
                    <p className="font-serif text-3xl font-medium text-foreground sm:text-4xl">
                      {s.value}
                    </p>
                    <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground sm:text-[11px]">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Framed photo plate + press-clipping review card. */}
            <div className="relative pb-14 lg:col-span-5 lg:pb-0">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 translate-x-3 translate-y-3 bg-muted/60"
              />
              <div className="relative border border-foreground/20 bg-card p-2.5">
                <div className="aspect-[4/5] overflow-hidden">
                  <Image
                    alt={imageAlt}
                    w={800}
                    h={1000}
                    className="size-full object-cover"
                  />
                </div>
                <div className="flex items-center justify-between gap-3 px-1 pt-2.5 pb-0.5">
                  <MonoTag tone="faint" className="text-[10px]">
                    Fig. 01 — The Room
                  </MonoTag>
                  <span aria-hidden="true" className="h-px flex-1 bg-border" />
                </div>
              </div>
              <figure className="absolute -bottom-2 -left-2 max-w-[85%] -rotate-1 border border-foreground/20 bg-background p-5 shadow-[4px_4px_0_0] shadow-foreground/10 sm:-left-5 sm:max-w-xs lg:-bottom-6">
                <blockquote className="font-serif text-lg italic leading-snug text-foreground">
                  &ldquo;{quote}&rdquo;
                </blockquote>
                <figcaption className="mt-3 flex items-center gap-3 border-t border-border pt-3">
                  <Image
                    alt={quoteAvatarAlt}
                    w={100}
                    h={100}
                    className="size-9 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {quoteName}
                    </p>
                    <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                      {quoteRole}
                    </p>
                  </div>
                </figcaption>
              </figure>
            </div>
          </div>
        </Container>
      </section>
    )
  },
})
