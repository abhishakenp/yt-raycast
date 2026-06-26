import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'

/**
 * EcommerceHero — promotional split hero for a general online store. A two-column
 * (lg:grid-cols-2) layout: on the left a sale eyebrow pill, an oversized bold sans
 * headline, a supporting subheading, dual CTAs (a solid primary "Shop now" + an
 * outlined "Explore"), and a small trust row (free shipping · easy returns · secure
 * checkout); on the right a large hero product Image in a rounded muted card with a
 * floating price/discount badge overlay. Every CTA routes through useNavigate and the
 * product photo uses the alt-driven Image component. Use as the opening hero for
 * general retail storefronts, marketplaces, deal/sale landing pages, or any
 * promotional online shop that wants a balanced text + product-photo split rather
 * than a full-bleed editorial image.
 */
export const EcommerceHero = defineComponent({
  name: 'EcommerceHero',
  description:
    "Promotional split hero for a general online store: a two-column (lg:grid-cols-2) layout with a sale eyebrow pill, an oversized bold sans headline, a supporting subheading, dual CTAs (a solid primary 'Shop now' + an outlined 'Explore'), and a small trust row on the left, plus a large hero product Image in a rounded muted card with a floating price/discount badge overlay on the right. Every CTA routes through useNavigate and the product photo uses the alt-driven Image component. Use as the opening hero for general retail storefronts, marketplaces, deal/sale landing pages, or any promotional online shop that wants a balanced text + product-photo split rather than a full-bleed editorial image.",
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    subheading: z.string().optional(),
    primaryCta: z.string().optional(),
    secondaryCta: z.string().optional(),
    imageAlt: z.string().optional(),
    badgeText: z.string().optional(),
    trust: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heroEyebrow = props.eyebrow ?? 'Summer Sale — Up to 50% Off'
    const heroHeading = props.heading ?? 'Everything you love, now for less'
    const heroSub =
      props.subheading ??
      'Shop thousands of top-rated products across every category. Fresh drops weekly, fast delivery, and prices you will actually love.'
    const heroPrimary = props.primaryCta ?? 'Shop now'
    const heroSecondary = props.secondaryCta ?? 'Explore'
    const heroImageAlt =
      props.imageAlt ??
      'Modern retail product flat-lay featuring a stylish gadget, accessories, and packaging on a clean neutral background'
    const heroBadge = props.badgeText ?? 'Save 40%'
    const heroTrust = props.trust ?? [
      'Free shipping',
      'Easy returns',
      'Secure checkout',
    ]

    return (
      <section
        aria-label="Hero"
        className={cn('bg-background pt-16 lg:pt-20', props.className)}
      >
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:py-24">
          <div className="text-center lg:text-left">
            <span className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              {heroEyebrow}
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              {heroHeading}
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground lg:mx-0">
              {heroSub}
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
              <button
                type="button"
                onClick={() => go(heroPrimary)}
                className="w-full rounded-lg bg-primary px-8 py-4 text-sm font-semibold tracking-wide text-primary-foreground transition-opacity hover:opacity-90 sm:w-auto"
              >
                {heroPrimary}
              </button>
              <button
                type="button"
                onClick={() => go(heroSecondary)}
                className="w-full rounded-lg border border-border px-8 py-4 text-sm font-semibold tracking-wide text-foreground transition-colors hover:bg-muted sm:w-auto"
              >
                {heroSecondary}
              </button>
            </div>
            <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground lg:justify-start">
              {heroTrust.filter(Boolean).map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="size-1.5 rounded-full bg-accent"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-2xl bg-muted">
              <Image
                alt={heroImageAlt}
                w={1200}
                h={1200}
                className="size-full object-cover"
              />
            </div>
            <div className="absolute right-4 top-4 rounded-xl bg-background px-4 py-2 text-sm font-semibold text-foreground shadow-lg sm:right-6 sm:top-6">
              {heroBadge}
            </div>
          </div>
        </div>
      </section>
    )
  },
})
