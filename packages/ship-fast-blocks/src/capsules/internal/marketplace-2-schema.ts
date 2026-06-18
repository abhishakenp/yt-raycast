import { z } from 'zod/v4'

export const marketplace2Props = z.object({
  /** Brand / marketplace name shown in the navbar, hero and footer. */
  brand: z.string().optional(),
  /** Primary navbar link labels (this page's nav is an inline list style). */
  nav: z.array(z.string()).optional(),
  /** Sticky navbar: search placeholder, cart count, sell CTA. */
  navbar: z
    .object({
      searchPlaceholder: z.string().optional(),
      cartCount: z.string().optional(),
      sellCta: z.string().optional(),
    })
    .optional(),
  /** Dark hero section. */
  hero: z
    .object({
      badge: z.string().optional(),
      headingLead: z.string().optional(),
      /** Word rendered in the accent color. */
      highlight: z.string().optional(),
      headingTail: z.string().optional(),
      subheading: z.string().optional(),
      primaryCta: z.string().optional(),
      secondaryCta: z.string().optional(),
      /** Alt text for the stacked customer avatars. */
      avatars: z.array(z.string()).optional(),
      proof: z.string().optional(),
      /** Floating product cards in the collage. */
      products: z
        .array(
          z.object({ name: z.string(), price: z.string(), alt: z.string() }),
        )
        .optional(),
    })
    .optional(),
  /** Press / "featured in" logo strip. */
  press: z
    .object({
      caption: z.string().optional(),
      logos: z.array(z.string()).optional(),
    })
    .optional(),
  /** "Shop by Category" image-tile grid. */
  categories: z
    .object({
      eyebrow: z.string().optional(),
      heading: z.string().optional(),
      description: z.string().optional(),
      viewAll: z.string().optional(),
      items: z
        .array(
          z.object({ title: z.string(), count: z.string(), alt: z.string() }),
        )
        .optional(),
    })
    .optional(),
  /** Accent statistics band. */
  stats: z.array(z.object({ value: z.string(), label: z.string() })).optional(),
  /** "Featured Sellers" grid. */
  sellers: z
    .object({
      eyebrow: z.string().optional(),
      heading: z.string().optional(),
      description: z.string().optional(),
      viewAll: z.string().optional(),
      items: z
        .array(
          z.object({
            name: z.string(),
            shop: z.string(),
            rating: z.string(),
            reviews: z.string(),
            location: z.string(),
            avatarAlt: z.string(),
            thumbs: z.array(z.string()),
          }),
        )
        .optional(),
    })
    .optional(),
  /** "Trending Products" grid. */
  products: z
    .object({
      eyebrow: z.string().optional(),
      heading: z.string().optional(),
      description: z.string().optional(),
      cta: z.string().optional(),
      items: z
        .array(
          z.object({
            title: z.string(),
            seller: z.string(),
            price: z.string(),
            compareAt: z.string().optional(),
            badge: z.string().optional(),
            alt: z.string(),
          }),
        )
        .optional(),
    })
    .optional(),
  /** "Why us" feature grid. */
  features: z
    .object({
      eyebrow: z.string().optional(),
      heading: z.string().optional(),
      items: z
        .array(z.object({ title: z.string(), body: z.string() }))
        .optional(),
    })
    .optional(),
  /** Numbered "start selling" steps. */
  steps: z
    .object({
      eyebrow: z.string().optional(),
      heading: z.string().optional(),
      description: z.string().optional(),
      cta: z.string().optional(),
      note: z.string().optional(),
      items: z
        .array(z.object({ title: z.string(), body: z.string() }))
        .optional(),
    })
    .optional(),
  /** Testimonials grid. */
  testimonials: z
    .object({
      eyebrow: z.string().optional(),
      heading: z.string().optional(),
      items: z
        .array(
          z.object({
            quote: z.string(),
            name: z.string(),
            role: z.string(),
            avatarAlt: z.string(),
          }),
        )
        .optional(),
    })
    .optional(),
  /** FAQ accordion. */
  faq: z
    .object({
      eyebrow: z.string().optional(),
      heading: z.string().optional(),
      items: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
    })
    .optional(),
  /** Dark final call-to-action band. */
  cta: z
    .object({
      heading: z.string().optional(),
      subheading: z.string().optional(),
      primaryCta: z.string().optional(),
      secondaryCta: z.string().optional(),
      note: z.string().optional(),
    })
    .optional(),
  /** Footer content. */
  footer: z
    .object({
      blurb: z.string().optional(),
      columns: z
        .array(z.object({ title: z.string(), links: z.array(z.string()) }))
        .optional(),
      copyright: z.string().optional(),
      legal: z.array(z.string()).optional(),
      locale: z.string().optional(),
    })
    .optional(),
  className: z.string().optional(),
})
