import { useState } from 'react'
import { z } from 'zod/v4'
import { defineCapsule } from './openui.ts'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'
import { number, string, table } from '@ship-fast/lakebed/server'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '#/components/ui/sheet.tsx'
import { Button } from '#/components/ui/button.tsx'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '#/components/ui/popover.tsx'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar.tsx'

/**
 * ProductDetailKimiPage2 — a complete, self-contained e-commerce PRODUCT DETAIL page
 * in a BOLD, energetic streetwear / sneaker-drop style ("KICKS").
 *
 * This is the second, visually DISTINCT alternative to ProductDetailKimiPage (which is a
 * clean minimalist editorial PDP). Where the sibling is quiet and monochrome, this variant
 * is loud and punchy: ultra-heavy black display type, a hot accent color for the brand badge,
 * star ratings and primary CTAs, rounded card surfaces with soft shadows, a "NEW RELEASE"
 * badge + SKU, a strikethrough sale price, a feature-card grid with icons, a sticky cart
 * summary rail, review cards carrying size/fit metadata, and a high-energy newsletter CTA
 * band before a dark multi-column footer with circular social icons.
 *
 * Faithful Tailwind v4 port of a Kimi-generated design, fully token-compliant (theme-injectable).
 * The block owns ALL layout, spacing and type. Every nav item, swatch, size, CTA, social and
 * link routes through `useNavigate` (never a dead "#"). All product/avatar imagery uses the
 * alt-driven <Image> component. Callers supply ONLY content; rich defaults render the full page.
 */
export const ProductDetailKimiPage2 = defineCapsule({
  name: 'ProductDetailKimiPage2',
  description:
    "Complete e-commerce PRODUCT DETAIL / product page (PDP) for a single item in a BOLD streetwear sneaker-drop style ('KICKS') — the loud, high-energy ALTERNATIVE / second style sibling to the minimalist ProductDetailKimiPage. Heavy black display type, a hot accent color used for the 'NEW RELEASE' badge, star ratings and Add-to-Cart CTAs, rounded cards with soft shadows. Includes a sticky shop navbar (search + cart with item-count badge), the core product layout (square image gallery with selectable thumbnails beside product info: release badge + SKU, big title, star rating with review count, sale price with strikethrough original, description, color swatch selector, US size grid with selected/sold-out states, quantity stepper, Add to Cart + wishlist, free-shipping line), a Product Details band (feature cards with icons + a specifications grid + a sticky cart-summary rail), a Customer Reviews section (big average score, star breakdown bars, verified-buyer review cards with avatars and size/fit tags, view-all link), a 'You Might Also Like' related-products grid, a newsletter CTA band, and a dark multi-column footer with circular social icons + legal links. Use as the ROOT page for any hyped single-product retail view — sneakers, streetwear, hype apparel, electronics drops, limited-edition DTC goods — when you want a punchy, conversion-focused PDP rather than a quiet editorial one. Supply content only — brand, nav, product, details, reviews, related, newsletter, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand / store name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Core product info + gallery + variant pickers. */
    product: z
      .object({
        badge: z.string().optional(),
        sku: z.string().optional(),
        title: z.string().optional(),
        rating: z.number().optional(),
        ratingLabel: z.string().optional(),
        price: z.string().optional(),
        comparePrice: z.string().optional(),
        summary: z.string().optional(),
        /** Gallery: first image is the main view, rest are thumbnails. */
        images: z.array(z.string()).optional(),
        colorLabel: z.string().optional(),
        /** Selectable color names (first is selected by default). */
        colors: z.array(z.string()).optional(),
        sizeLabel: z.string().optional(),
        sizes: z.array(z.string()).optional(),
        soldOutSizes: z.array(z.string()).optional(),
        selectedSize: z.string().optional(),
        addToCart: z.string().optional(),
        shipping: z.string().optional(),
      })
      .optional(),
    /** Product details: feature cards + specifications + sticky cart summary. */
    details: z
      .object({
        heading: z.string().optional(),
        features: z
          .array(z.object({ title: z.string(), body: z.string() }))
          .optional(),
        specsHeading: z.string().optional(),
        specs: z
          .array(z.object({ label: z.string(), value: z.string() }))
          .optional(),
        summaryTitle: z.string().optional(),
        summaryMeta: z.string().optional(),
        summaryTotalLabel: z.string().optional(),
        summaryTotal: z.string().optional(),
        summaryCta: z.string().optional(),
        summaryNote: z.string().optional(),
        summaryImageAlt: z.string().optional(),
      })
      .optional(),
    /** Customer reviews section. */
    reviews: z
      .object({
        heading: z.string().optional(),
        writeCta: z.string().optional(),
        average: z.number().optional(),
        countLabel: z.string().optional(),
        /** Distribution from 5-star down to 1-star, as percentages. */
        breakdown: z
          .array(z.object({ stars: z.number(), percent: z.number() }))
          .optional(),
        items: z
          .array(
            z.object({
              name: z.string(),
              meta: z.string(),
              rating: z.number(),
              title: z.string(),
              body: z.string(),
              size: z.string(),
              fit: z.string(),
              avatarAlt: z.string(),
            }),
          )
          .optional(),
        viewAll: z.string().optional(),
      })
      .optional(),
    /** Related "You Might Also Like" products. */
    related: z
      .object({
        heading: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              price: z.string(),
              imageAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Newsletter CTA band. */
    newsletter: z
      .object({
        heading: z.string().optional(),
        body: z.string().optional(),
        placeholder: z.string().optional(),
        cta: z.string().optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        tagline: z.string().optional(),
        columns: z
          .array(z.object({ title: z.string(), links: z.array(z.string()) }))
          .optional(),
        socials: z.array(z.string()).optional(),
        note: z.string().optional(),
        legal: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: {
    schema: {
      cartItems: table({
        productId: string(),
        quantity: number(),
        size: string(),
        color: string(),
      }),
      favorites: table({
        productName: string(),
      }),
    },
    queries: {
      cartLines: ({ db }) =>
        db.cartItems.all().map((item) => ({
          ...item,
          product: {
            id: item.productId,
            name: item.productId,
            price: '225.00',
            alt: 'Featured product on a clean studio background',
          },
        })),
      favoriteProductNames: ({ db }) =>
        new Set(db.favorites.all().map((favorite) => favorite.productName)),
    },
    mutations: {
      addToCart: (
        { db },
        productName: string,
        size: string,
        color: string,
        quantity: number,
      ) => {
        const existingItem = db.cartItems
          .where('productId', productName)
          .where('size', size)
          .where('color', color)
          .all()[0]

        if (existingItem) {
          db.cartItems.update(existingItem.id, {
            quantity: existingItem.quantity + quantity,
          })
        } else {
          db.cartItems.insert({
            productId: productName,
            quantity,
            size,
            color,
          })
        }

        return db.cartItems.all()
      },
      updateCartQuantity: ({ db }, itemId: string, quantity: number) => {
        const nextQuantity = Math.max(0, Math.floor(quantity))

        for (const item of db.cartItems.where('id', itemId).all()) {
          if (nextQuantity) {
            db.cartItems.update(item.id, { quantity: nextQuantity })
          } else {
            db.cartItems.delete(item.id)
          }
        }

        return db.cartItems.all()
      },
      removeFromCart: ({ db }, itemId: string) => {
        for (const item of db.cartItems.where('id', itemId).all()) {
          db.cartItems.delete(item.id)
        }

        return db.cartItems.all()
      },
      clearCart: ({ db }) => {
        for (const item of db.cartItems.all()) {
          db.cartItems.delete(item.id)
        }

        return []
      },
      toggleFavorite: ({ db }, productName: string) => {
        const existingFavorite = db.favorites
          .where('productName', productName)
          .all()[0]

        if (existingFavorite) {
          db.favorites.delete(existingFavorite.id)
          return false
        }

        db.favorites.insert({ productName })
        return true
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [cartOpen, setCartOpen] = useState(false)
    const [selectedColor, setSelectedColor] = useState('Classic')
    const [selectedSize, setSelectedSize] = useState('M')
    const [quantity, setQuantity] = useState(1)

    const cartLines = lakebed.useQuery('cartLines')
    const favoriteProductNames = lakebed.useQuery('favoriteProductNames')
    const auth = lakebed.useAuth()
    const addCartItem = lakebed.useMutation('addToCart')
    const updateCartQuantity = lakebed.useMutation('updateCartQuantity')
    const removeFromCart = lakebed.useMutation('removeFromCart')
    const clearCart = lakebed.useMutation('clearCart')
    const toggleFavorite = lakebed.useMutation('toggleFavorite')

    const isSignedIn = auth.isAuthenticated && !auth.isGuest
    const authEmail = auth.email || auth.user?.email
    const authPicture = auth.picture || auth.user?.picture
    const authDisplayName =
      auth.displayName || auth.user?.displayName || authEmail || 'Account'
    const authInitials =
      authDisplayName
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('') || 'ME'
    const authLabel = auth.isLoading
      ? 'Checking...'
      : isSignedIn
        ? authDisplayName
        : 'Sign in'

    const handleSignIn = () => {
      if (auth.isLoading) return
      void lakebed.signInWithGoogle()
    }

    const handleSignOut = () => {
      lakebed.signOut()
    }

    const safeCartLines = cartLines ?? []
    const cartItemCount = safeCartLines.reduce(
      (total, item) => total + item.quantity,
      0,
    )

    const priceAmount = (price: string) => {
      const amount = Number.parseFloat(price.replace(/[^0-9.]+/g, ''))
      return Number.isFinite(amount) ? amount : 0
    }

    const formatCurrency = (amount: number) =>
      new Intl.NumberFormat('en-US', {
        currency: 'USD',
        style: 'currency',
      }).format(amount)

    const cartSubtotal = safeCartLines.reduce(
      (total, item) => total + priceAmount(item.product.price) * item.quantity,
      0,
    )
    const cartShipping = cartSubtotal > 0 && cartSubtotal < 150 ? 12 : 0
    const cartTotal = cartSubtotal + cartShipping

    const brand = props.brand ?? 'Storefront'
    const nav = props.nav?.length
      ? props.nav
      : ['New Arrivals', 'Shop', 'Collections', 'About', 'Sale']

    const p = props.product ?? {}
    const badge = p.badge ?? 'NEW RELEASE'
    const sku = p.sku ?? 'SKU: PR-0001'
    const productTitle = p.title ?? 'Signature Series'
    const rating = p.rating ?? 4.9
    const ratingLabel = p.ratingLabel ?? '4.9 (2,847 reviews)'
    const price = p.price ?? '$225.00'
    const comparePrice = p.comparePrice ?? '$280.00'
    const summary =
      p.summary ??
      'Our Signature Series brings together premium materials and refined craftsmanship in a design built to last. Thoughtfully made, endlessly versatile, and finished to the highest standard.'
    const images = p.images?.length
      ? p.images
      : [
          'Featured product on a clean studio background',
          'Front angle of the product on a neutral background',
          'Close-up product detail on a neutral background',
          'Underside detail of the product on a neutral background',
        ]
    const colors = p.colors?.length
      ? p.colors
      : ['Classic', 'Neutral', 'Slate', 'Signature']
    const sizeLabel = p.sizeLabel ?? 'Select Option'
    const sizes = p.sizes?.length ? p.sizes : ['XS', 'S', 'M', 'L', 'XL', 'XXL']
    const soldOutSizes = p.soldOutSizes?.length ? p.soldOutSizes : ['XXL']
    const addToCartLabel = p.addToCart ?? `Add to Cart — ${price}`
    const shippingCopy =
      p.shipping ??
      'Free shipping on orders over $150. Arrives in 3-5 business days.'

    const det = props.details ?? {}
    const detailsHeading = det.heading ?? 'Product Details'
    const features = det.features?.length
      ? det.features
      : [
          {
            title: 'Built for Comfort',
            body: 'Thoughtful construction provides lightweight, responsive comfort for all-day wear.',
          },
          {
            title: 'Premium Materials',
            body: 'Crafted from premium materials chosen for durability and a refined feel.',
          },
          {
            title: 'Signature Details',
            body: 'Considered finishing touches and signature detailing set this piece apart.',
          },
          {
            title: 'Timeless Design',
            body: 'A versatile, enduring design that stays relevant season after season.',
          },
        ]
    const specsHeading = det.specsHeading ?? 'Specifications'
    const specs = det.specs?.length
      ? det.specs
      : [
          { label: 'Release Date', value: 'Latest Release' },
          { label: 'Product Code', value: 'PR-0001' },
          { label: 'Finish', value: 'Classic' },
          { label: 'Collection', value: 'Signature Series' },
          { label: 'Warranty', value: '1 Year' },
          { label: 'Origin', value: 'Ethically Made' },
        ]
    const summaryTitle = det.summaryTitle ?? productTitle
    const summaryTotalLabel = det.summaryTotalLabel ?? 'Total'
    const summaryTotal =
      det.summaryTotal ?? formatCurrency(priceAmount(price) * quantity)
    const summaryCta = det.summaryCta ?? 'Add to Cart'
    const summaryNote = det.summaryNote ?? 'Free shipping on orders over $150'
    const summaryImageAlt =
      det.summaryImageAlt ??
      'Featured product thumbnail on a neutral background'

    const r = props.reviews ?? {}
    const reviewsHeading = r.heading ?? 'Customer Reviews'
    const writeCta = r.writeCta ?? 'Write a Review'
    const reviewAverage = r.average ?? 4.9
    const countLabel = r.countLabel ?? 'Based on 2,847 reviews'
    const breakdown = r.breakdown?.length
      ? r.breakdown
      : [
          { stars: 5, percent: 92 },
          { stars: 4, percent: 5 },
          { stars: 3, percent: 2 },
          { stars: 2, percent: 1 },
          { stars: 1, percent: 0 },
        ]
    const reviewItems = r.items?.length
      ? r.items
      : [
          {
            name: 'Marcus Chen',
            meta: 'Verified Buyer • Recently',
            rating: 5,
            title: 'Worth every penny!',
            body: "Hands down one of the best purchases I've made. The quality is premium and the finish is flawless. Comfortable for everyday use and I've already gotten compliments. Highly recommend!",
            size: 'Option: L',
            fit: 'Quality: Excellent',
            avatarAlt:
              'Professional headshot of Marcus Chen, a young man with short dark hair wearing a casual blue shirt',
          },
          {
            name: 'Sarah Williams',
            meta: 'Verified Buyer • Recently',
            rating: 5,
            title: 'Even better than expected',
            body: 'The materials feel premium, the construction is solid, and the details are spot on. Shipping was fast and the packaging was perfect. Will definitely buy again!',
            size: 'Option: S',
            fit: 'Quality: Excellent',
            avatarAlt:
              'Professional headshot of Sarah Williams, a smiling woman with shoulder-length brown hair wearing a cream blouse',
          },
          {
            name: 'James Rodriguez',
            meta: 'Verified Buyer • Recently',
            rating: 4,
            title: 'Great value, modern quality',
            body: "A must-have for anyone who appreciates good design. Refined without being loud. Only giving 4 stars because I'd have liked one more option, but otherwise perfect!",
            size: 'Option: XL',
            fit: 'Quality: Very Good',
            avatarAlt:
              'Professional headshot of James Rodriguez, a bearded man in his 30s wearing a black t-shirt',
          },
          {
            name: 'Emily Zhang',
            meta: 'Verified Buyer • Recently',
            rating: 5,
            title: 'My new favorite',
            body: "I've bought from a lot of brands and this is by far one of the best. The finish is beautiful and the materials are top notch. Thank you for the fast shipping and great customer service!",
            size: 'Option: XS',
            fit: 'Quality: Excellent',
            avatarAlt:
              'Professional headshot of Emily Zhang, an Asian woman with glasses and a warm smile wearing a navy blazer',
          },
        ]
    const viewAll = r.viewAll ?? 'View all 2,847 reviews →'

    const rel = props.related ?? {}
    const relatedHeading = rel.heading ?? 'You Might Also Like'
    const relatedItems = rel.items?.length
      ? rel.items
      : [
          {
            title: 'Everyday Essential',
            price: '$180.00',
            imageAlt: 'Everyday Essential product on a clean studio background',
          },
          {
            title: 'Classic Edition',
            price: '$210.00',
            imageAlt: 'Classic Edition product on a neutral background',
          },
          {
            title: 'Limited Release',
            price: '$225.00',
            imageAlt: 'Limited Release product on a clean studio background',
          },
          {
            title: 'Premium Pick',
            price: '$200.00',
            imageAlt: 'Premium Pick product detail on a neutral background',
          },
        ]

    const nl = props.newsletter ?? {}
    const newsletterHeading = nl.heading ?? 'Join Our Community'
    const newsletterBody =
      nl.body ??
      'Get exclusive launches, early access to new releases, and member-only discounts. No spam, just the good stuff.'
    const newsletterPlaceholder = nl.placeholder ?? 'Enter your email'
    const newsletterCta = nl.cta ?? 'Subscribe'

    const foot = props.footer ?? {}
    const footerTagline =
      foot.tagline ??
      'Your destination for quality products. New releases, classics, and everything in between.'
    const footerColumns = foot.columns?.length
      ? foot.columns
      : [
          {
            title: 'Shop',
            links: [
              'New Arrivals',
              'Best Sellers',
              'Collections',
              'Featured',
              'Sale',
            ],
          },
          {
            title: 'Support',
            links: ['FAQ', 'Shipping', 'Returns', 'Order Guide', 'Contact Us'],
          },
        ]
    const socials = foot.socials?.length
      ? foot.socials
      : ['Instagram', 'Twitter', 'TikTok']
    const footerNote = foot.note ?? 'All rights reserved.'
    const legal = foot.legal?.length
      ? foot.legal
      : ['Privacy Policy', 'Terms of Service', 'Cookie Settings']

    // ---- Decorative inline icons (token-colored via currentColor) ----
    const Star = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    const Stars = ({
      value,
      size = 'size-5',
    }: {
      value: number
      size?: string
    }) => (
      <div className="flex items-center" aria-label={`${value} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={cn(
              size,
              i <= Math.round(value)
                ? 'text-primary'
                : 'text-muted-foreground/30',
            )}
          />
        ))}
      </div>
    )

    const featureIcons = [
      'M13 10V3L4 14h7v7l9-11h-7z',
      'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
      'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
      'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    ]

    const socialIcons: Record<string, string> = {
      Instagram:
        'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z',
      Twitter:
        'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
      TikTok:
        'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z',
    }

    // Swatch background tokens cycle through theme colors (no raw palette).
    const swatchTokens = [
      'bg-foreground',
      'bg-secondary',
      'bg-primary',
      'bg-destructive',
    ]

    // ---- Shared sub-components ----
    const HeartIcon = ({ active = false }: { active?: boolean }) => (
      <svg
        className={cn(
          'size-5',
          active ? 'text-primary-foreground' : 'text-foreground',
        )}
        fill={active ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    )

    const ChevronDown = () => (
      <svg
        className="size-5 text-muted-foreground group-open:rotate-180 transition-transform"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    )

    const ArrowRight = () => (
      <svg
        className="size-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
    )

    return (
      <div
        className={cn(
          'min-h-svh bg-muted text-foreground antialiased',
          props.className,
        )}
      >
        {/* Navbar */}
        <nav className="sticky top-0 z-50 border-b border-border bg-card">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center gap-8">
                <button
                  type="button"
                  onClick={() => go(brand)}
                  className="text-2xl font-black tracking-tighter"
                >
                  {brand}
                </button>
                <div className="hidden items-center gap-6 text-sm font-medium md:flex">
                  {nav.map((label, i) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => go(label)}
                      className={cn(
                        'transition-colors hover:text-primary',
                        i === 0 ? 'text-foreground' : 'text-muted-foreground',
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  aria-label="Search"
                  onClick={() => go('Search')}
                  className="rounded-full p-2 transition-colors hover:bg-accent"
                >
                  <svg
                    className="size-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
                {isSignedIn ? (
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        aria-label="Open account menu"
                        className="hidden h-10 max-w-48 items-center gap-2 rounded-full border border-border bg-background/90 px-2 py-1 text-foreground shadow-sm transition hover:border-foreground/20 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:inline-flex"
                      >
                        <Avatar
                          size="sm"
                          className="ring-2 ring-background"
                          aria-hidden="true"
                        >
                          {authPicture ? (
                            <AvatarImage
                              src={authPicture}
                              alt={authDisplayName}
                            />
                          ) : null}
                          <AvatarFallback className="bg-foreground text-[0.65rem] font-bold text-background">
                            {authInitials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="hidden max-w-24 truncate text-sm font-semibold md:block">
                          {authDisplayName}
                        </span>
                        <ChevronDown />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      align="end"
                      sideOffset={10}
                      className="w-72 overflow-hidden rounded-xl border-border bg-background p-0 shadow-xl"
                    >
                      <div className="bg-muted/40 px-4 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar size="lg" className="ring-2 ring-background">
                            {authPicture ? (
                              <AvatarImage
                                src={authPicture}
                                alt={authDisplayName}
                              />
                            ) : null}
                            <AvatarFallback className="bg-foreground text-sm font-bold text-background">
                              {authInitials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-foreground">
                              {authDisplayName}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {authEmail ?? 'Signed in to this session'}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="p-2">
                        <button
                          type="button"
                          onClick={() => go('Account')}
                          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          Account
                          <ArrowRight />
                        </button>
                        <button
                          type="button"
                          onClick={() => go('Orders')}
                          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          Orders
                          <ArrowRight />
                        </button>
                      </div>
                      <div className="border-t border-border p-2">
                        <button
                          type="button"
                          onClick={handleSignOut}
                          className="flex w-full items-center justify-center rounded-lg bg-foreground px-3 py-2 text-sm font-semibold text-background transition-colors hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          Sign out
                        </button>
                      </div>
                    </PopoverContent>
                  </Popover>
                ) : (
                  <button
                    type="button"
                    onClick={handleSignIn}
                    disabled={auth.isLoading}
                    aria-label="Sign in with Google"
                    className="hidden h-10 items-center gap-2 rounded-full bg-foreground px-4 text-sm font-semibold text-background shadow-sm transition hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 sm:inline-flex"
                  >
                    <span className="grid size-5 place-items-center rounded-full bg-background text-xs font-black text-foreground">
                      G
                    </span>
                    <span>{authLabel}</span>
                  </button>
                )}
                <Sheet open={cartOpen} onOpenChange={setCartOpen}>
                  <SheetTrigger asChild>
                    <button
                      type="button"
                      aria-label="Shopping cart"
                      className="relative rounded-full p-2 transition-colors hover:bg-accent"
                    >
                      <svg
                        className="size-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      {cartItemCount > 0 ? (
                        <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                          {cartItemCount}
                        </span>
                      ) : null}
                    </button>
                  </SheetTrigger>
                  <SheetContent
                    side="right"
                    className="w-full gap-0 p-0 sm:max-w-md"
                  >
                    <SheetHeader className="border-b border-border p-6">
                      <SheetTitle className="text-xl">Shopping cart</SheetTitle>
                      <SheetDescription>
                        {cartItemCount > 0
                          ? `${cartItemCount} item${cartItemCount === 1 ? '' : 's'} ready for checkout.`
                          : 'Your cart is empty.'}
                      </SheetDescription>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto px-6 py-5">
                      {safeCartLines.length ? (
                        <div className="space-y-5">
                          {safeCartLines.map((item) => (
                            <div
                              key={item.id}
                              className="grid grid-cols-[72px_1fr] gap-4 border-b border-border pb-5 last:border-0"
                            >
                              <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                                <Image
                                  alt={item.product.alt}
                                  w={180}
                                  h={180}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                      {brand}
                                    </p>
                                    <h3 className="line-clamp-2 text-sm font-semibold text-foreground">
                                      {item.product.name}
                                    </h3>
                                    <p className="text-xs text-muted-foreground">
                                      {item.color} • {item.size}
                                    </p>
                                  </div>
                                  <p className="text-sm font-bold text-foreground">
                                    {formatCurrency(
                                      priceAmount(item.product.price) *
                                        item.quantity,
                                    )}
                                  </p>
                                </div>
                                <div className="mt-4 flex items-center justify-between">
                                  <div className="inline-flex h-9 items-center rounded-full border border-border bg-background">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        void updateCartQuantity(
                                          item.id,
                                          item.quantity - 1,
                                        )
                                      }
                                      className="grid size-9 place-items-center text-muted-foreground hover:text-foreground"
                                      aria-label={`Decrease ${item.product.name} quantity`}
                                    >
                                      -
                                    </button>
                                    <span className="min-w-8 text-center text-sm font-semibold">
                                      {item.quantity}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        void updateCartQuantity(
                                          item.id,
                                          item.quantity + 1,
                                        )
                                      }
                                      className="grid size-9 place-items-center text-muted-foreground hover:text-foreground"
                                      aria-label={`Increase ${item.product.name} quantity`}
                                    >
                                      +
                                    </button>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => void removeFromCart(item.id)}
                                    className="text-xs font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 px-6 text-center">
                          <p className="text-base font-semibold text-foreground">
                            No products in cart
                          </p>
                          <p className="mt-2 text-sm text-muted-foreground">
                            Add an item from the product details to start a cart
                            for this session.
                          </p>
                        </div>
                      )}
                    </div>
                    <SheetFooter className="border-t border-border p-6">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-muted-foreground">
                          <span>Subtotal</span>
                          <span>{formatCurrency(cartSubtotal)}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>Shipping</span>
                          <span>
                            {cartShipping
                              ? formatCurrency(cartShipping)
                              : 'Free'}
                          </span>
                        </div>
                        <div className="flex justify-between pt-2 text-base font-bold text-foreground">
                          <span>Total</span>
                          <span>{formatCurrency(cartTotal)}</span>
                        </div>
                      </div>
                      <Button
                        type="button"
                        disabled={!safeCartLines.length}
                        className="w-full rounded-full"
                        onClick={() => go('Checkout')}
                      >
                        Checkout
                      </Button>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-full"
                          onClick={() => void clearCart()}
                          disabled={!safeCartLines.length}
                        >
                          Clear
                        </Button>
                        <SheetClose asChild>
                          <Button
                            type="button"
                            variant="secondary"
                            className="rounded-full"
                          >
                            Continue
                          </Button>
                        </SheetClose>
                      </div>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </nav>

        {/* Product hero (gallery + info) */}
        <section className="bg-card text-card-foreground">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:grid lg:grid-cols-2 lg:gap-12 lg:px-8 lg:py-12">
            {/* Gallery */}
            <div className="space-y-4">
              <div className="aspect-square overflow-hidden rounded-2xl bg-muted">
                <Image
                  alt={images[0]}
                  w={800}
                  h={800}
                  className="size-full object-cover"
                />
              </div>
              <div className="grid grid-cols-4 gap-3">
                {images.map((img, i) => (
                  <button
                    key={img}
                    type="button"
                    onClick={() => go(productTitle)}
                    aria-label={`View image ${i + 1} of ${productTitle}`}
                    className={cn(
                      'aspect-square overflow-hidden rounded-xl bg-muted ring-offset-2 ring-offset-card transition-all',
                      i === 0
                        ? 'ring-2 ring-primary'
                        : 'hover:ring-2 hover:ring-border',
                    )}
                  >
                    <Image
                      alt={img}
                      w={200}
                      h={200}
                      loading="lazy"
                      className="size-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Info */}
            <div className="mt-8 lg:mt-0">
              <div className="mb-4 flex items-center gap-2">
                <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                  {badge}
                </span>
                <span className="text-sm text-muted-foreground">{sku}</span>
              </div>

              <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                {productTitle}
              </h1>

              <div className="mb-6 mt-4 flex items-center gap-4">
                <Stars value={rating} />
                <span className="text-sm font-medium text-muted-foreground">
                  {ratingLabel}
                </span>
              </div>

              <p className="mb-6 text-3xl font-black">
                {price}{' '}
                <span className="text-lg font-normal text-muted-foreground line-through">
                  {comparePrice}
                </span>
              </p>

              <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
                {summary}
              </p>

              {/* Color */}
              <div className="mb-6">
                <p className="mb-3 block text-sm font-bold">
                  Color:{' '}
                  <span className="font-normal text-muted-foreground">
                    {selectedColor}
                  </span>
                </p>
                <div className="flex gap-3">
                  {colors.map((color, i) => (
                    <button
                      key={color}
                      type="button"
                      aria-label={`${color} colorway`}
                      title={color}
                      onClick={() => setSelectedColor(color)}
                      className={cn(
                        'size-12 rounded-full ring-offset-2 ring-offset-card',
                        swatchTokens[i % swatchTokens.length],
                        color === selectedColor
                          ? 'ring-2 ring-primary'
                          : 'hover:ring-2 hover:ring-border',
                      )}
                    />
                  ))}
                </div>
              </div>

              {/* Size */}
              <div className="mb-8">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-bold">{sizeLabel}</p>
                  <button
                    type="button"
                    onClick={() => go('Size Guide')}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Size Guide
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                  {sizes.map((size) => {
                    const soldOut = soldOutSizes.includes(size)
                    const selected = size === selectedSize
                    return (
                      <button
                        key={size}
                        type="button"
                        disabled={soldOut}
                        onClick={() => setSelectedSize(size)}
                        className={cn(
                          'rounded-lg border-2 px-4 py-3 transition-colors',
                          soldOut
                            ? 'cursor-not-allowed border-border font-medium text-muted-foreground/50'
                            : selected
                              ? 'border-primary bg-accent font-bold text-foreground ring-2 ring-primary ring-offset-2 ring-offset-card'
                              : 'border-border font-medium text-muted-foreground hover:border-foreground hover:text-foreground',
                        )}
                      >
                        {size}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Quantity + Add to cart */}
              <div className="mb-8 flex gap-4">
                <div className="flex items-center rounded-lg border-2 border-border">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-4 font-bold text-muted-foreground transition-colors hover:bg-accent"
                  >
                    -
                  </button>
                  <span className="px-4 font-bold">{quantity}</span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-4 font-bold text-muted-foreground transition-colors hover:bg-accent"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    void addCartItem(
                      productTitle,
                      selectedSize,
                      selectedColor,
                      quantity,
                    )
                    setCartOpen(true)
                  }}
                  className="flex-1 rounded-lg bg-primary px-8 py-4 text-lg font-bold text-primary-foreground shadow-lg shadow-primary/30 transition-colors hover:bg-primary/90"
                >
                  {addToCartLabel}
                </button>
                <button
                  type="button"
                  aria-label="Add to wishlist"
                  onClick={() => void toggleFavorite(productTitle)}
                  className="rounded-lg border-2 border-border p-4 transition-colors hover:border-foreground"
                >
                  <HeartIcon
                    active={favoriteProductNames?.has(productTitle) ?? false}
                  />
                </button>
              </div>

              {/* Shipping */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <svg
                  className="size-5 text-primary"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M5 13l4 4L19 7" />
                </svg>
                <span>{shippingCopy}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Product details */}
        <section className="bg-muted py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:grid lg:grid-cols-3 lg:gap-12 lg:px-8">
            <div className="lg:col-span-2">
              <h2 className="mb-8 text-3xl font-black">{detailsHeading}</h2>

              <div className="mb-12 grid gap-6 sm:grid-cols-2">
                {features.map((feature, i) => (
                  <div
                    key={feature.title}
                    className="rounded-xl bg-card p-6 text-card-foreground shadow-sm"
                  >
                    <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-primary/10">
                      <svg
                        className="size-6 text-primary"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d={featureIcons[i % featureIcons.length]} />
                      </svg>
                    </div>
                    <h3 className="mb-2 font-bold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.body}
                    </p>
                  </div>
                ))}
              </div>

              <div className="rounded-xl bg-card p-6 text-card-foreground shadow-sm">
                <h3 className="mb-4 font-bold">{specsHeading}</h3>
                <dl className="grid grid-cols-2 gap-4 text-sm">
                  {specs.map((spec) => (
                    <div key={spec.label}>
                      <dt className="mb-1 text-muted-foreground">
                        {spec.label}
                      </dt>
                      <dd className="font-medium">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>

            {/* Sticky cart summary */}
            <div className="mt-8 hidden lg:mt-0 lg:block">
              <div className="sticky top-24 rounded-xl border border-border bg-card p-6 text-card-foreground shadow-sm">
                <Image
                  alt={summaryImageAlt}
                  w={300}
                  h={300}
                  className="mb-4 size-20 rounded-lg object-cover"
                />
                <h3 className="mb-1 font-bold">{summaryTitle}</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  {selectedColor} • {selectedSize}
                </p>
                <div className="mb-4 flex items-center justify-between text-lg font-bold">
                  <span>{summaryTotalLabel}</span>
                  <span>{summaryTotal}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    void addCartItem(
                      productTitle,
                      selectedSize,
                      selectedColor,
                      quantity,
                    )
                    setCartOpen(true)
                  }}
                  className="w-full rounded-lg bg-primary py-3 font-bold text-primary-foreground shadow-lg shadow-primary/30 transition-colors hover:bg-primary/90"
                >
                  {summaryCta}
                </button>
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  {summaryNote}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Reviews */}
        <section className="bg-card py-16 text-card-foreground">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-3xl font-black">{reviewsHeading}</h2>
              <button
                type="button"
                onClick={() => go(writeCta)}
                className="rounded-lg bg-foreground px-6 py-3 font-bold text-background transition-colors hover:bg-foreground/90"
              >
                {writeCta}
              </button>
            </div>

            {/* Summary */}
            <div className="mb-12 rounded-2xl bg-muted p-8">
              <div className="grid items-center gap-8 sm:grid-cols-3">
                <div className="text-center sm:text-left">
                  <div className="text-6xl font-black">{reviewAverage}</div>
                  <div className="my-2 flex justify-center sm:justify-start">
                    <Stars value={reviewAverage} />
                  </div>
                  <p className="text-muted-foreground">{countLabel}</p>
                </div>
                <div className="sm:col-span-2">
                  <div className="space-y-2">
                    {breakdown.map((b) => (
                      <div key={b.stars} className="flex items-center gap-3">
                        <span className="w-12 text-sm font-medium">
                          {b.stars} star
                        </span>
                        <div className="h-3 flex-1 overflow-hidden rounded-full bg-border">
                          <div
                            className="h-3 rounded-full bg-primary"
                            style={{ width: `${b.percent}%` }}
                          />
                        </div>
                        <span className="w-12 text-sm text-muted-foreground">
                          {b.percent}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Individual reviews */}
            <div className="grid gap-6 md:grid-cols-2">
              {reviewItems.map((review) => (
                <div
                  key={review.name + review.title}
                  className="rounded-xl border border-border p-6"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Image
                        alt={review.avatarAlt}
                        w={100}
                        h={100}
                        className="size-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-bold">{review.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {review.meta}
                        </p>
                      </div>
                    </div>
                    <Stars value={review.rating} size="size-4" />
                  </div>
                  <h4 className="mb-2 font-bold">{review.title}</h4>
                  <p className="mb-4 text-muted-foreground">{review.body}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">{review.size}</span>
                    <span className="text-muted-foreground">{review.fit}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={() => go(viewAll)}
                className="font-bold text-primary hover:underline"
              >
                {viewAll}
              </button>
            </div>
          </div>
        </section>

        {/* Related products */}
        <section className="bg-muted py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-8 text-3xl font-black">{relatedHeading}</h2>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {relatedItems.map((item) => (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => go(item.title)}
                  className="group text-left"
                >
                  <div className="overflow-hidden rounded-xl bg-card shadow-sm transition-shadow group-hover:shadow-lg">
                    <div className="aspect-square bg-muted">
                      <Image
                        alt={item.imageAlt}
                        w={400}
                        h={400}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="mb-1 font-bold text-card-foreground">
                        {item.title}
                      </h3>
                      <p className="font-bold text-primary">{item.price}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="bg-primary py-16 text-primary-foreground">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="mb-4 text-3xl font-black sm:text-4xl">
              {newsletterHeading}
            </h2>
            <p className="mb-8 text-lg text-primary-foreground/90">
              {newsletterBody}
            </p>
            <form
              className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row"
              onSubmit={(e) => {
                e.preventDefault()
                go(newsletterCta)
              }}
            >
              <input
                type="email"
                placeholder={newsletterPlaceholder}
                className="flex-1 rounded-lg bg-background px-6 py-4 font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="submit"
                className="rounded-lg bg-foreground px-8 py-4 font-bold text-background transition-colors hover:bg-foreground/90"
              >
                {newsletterCta}
              </button>
            </form>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-foreground py-12 text-background">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid grid-cols-2 gap-8 md:grid-cols-4">
              <div>
                <button
                  type="button"
                  onClick={() => go(brand)}
                  className="mb-4 block text-xl font-black"
                >
                  {brand}
                </button>
                <p className="text-sm text-background/60">{footerTagline}</p>
              </div>

              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h4 className="mb-4 font-bold">{col.title}</h4>
                  <ul className="space-y-2 text-sm text-background/60">
                    {col.links.map((link) => (
                      <li key={link}>
                        <button
                          type="button"
                          onClick={() => go(link)}
                          className="transition-colors hover:text-background"
                        >
                          {link}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              <div>
                <h4 className="mb-4 font-bold">Follow Us</h4>
                <div className="flex gap-4">
                  {socials.map((social) => (
                    <button
                      key={social}
                      type="button"
                      aria-label={social}
                      onClick={() => go(social)}
                      className="flex size-10 items-center justify-center rounded-full bg-background/10 transition-colors hover:bg-primary"
                    >
                      <svg
                        className="size-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          d={socialIcons[social] ?? socialIcons.Instagram}
                        />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-between gap-4 border-t border-background/10 pt-8 sm:flex-row">
              <p className="text-sm text-background/50">
                © {new Date().getFullYear()} {brand}. {footerNote}
              </p>
              <div className="flex gap-6 text-sm text-background/50">
                {legal.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => go(item)}
                    className="transition-colors hover:text-background"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </footer>
      </div>
    )
  },
})
