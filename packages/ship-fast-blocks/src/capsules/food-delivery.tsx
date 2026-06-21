import { useState, type ReactNode } from 'react'
import { z } from 'zod/v4'
import { defineCapsule } from './openui.ts'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'
import { number, string, table } from '@ship-fast/lakebed/server'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '#/components/ui/command.tsx'
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
 * FoodDeliveryKimiPage — a complete, self-contained food-delivery marketplace
 * LANDING page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "Nosh" design: a clean,
 * bright, neutral-canvas consumer aesthetic with rounded-full pills, soft
 * card borders, and inverted (foreground-on-background) dark bands for
 * emphasis. It pairs a split hero (headline + delivery-address search bar +
 * food photo with a floating "Order Confirmed" tracking card) with a
 * trusted-by restaurant-logo strip, a 3-up features grid (real-time tracking,
 * curated selection, saved favorites), a popular-restaurants gallery of
 * cuisine cards (rating badge, cuisine chip, delivery time + fee), a
 * numbered 1-2-3 "how it works" band, an inverted stats strip, a 3-up
 * star-rated testimonials grid with avatars, an inverted app-download CTA
 * (App Store / Google Play), and a multi-column footer with social links.
 *
 * The block owns ALL layout, spacing, type hierarchy and the bright/inverted
 * surface rhythm. Every nav item / CTA / link / form-submit routes through
 * `useNavigate` (never a dead "#"), and the navbar labels match the `nav`
 * array so PageSwitch can swap pages. All content imagery uses the alt-driven
 * <Image> component (never a raw src). Callers supply ONLY content data; rich
 * defaults make it render great with no props at all.
 */
export const FoodDeliveryKimiPage = defineCapsule({
  name: 'FoodDeliveryKimiPage',
  description:
    "Complete food-delivery / restaurant-marketplace LANDING page with a clean, bright, consumer aesthetic: neutral canvas, rounded-full pills, soft-bordered cards, and inverted dark bands for punch. Includes a split hero (big headline, delivery-address search input with a Find Food button, serving-cities note, food photo with a floating 'Order Confirmed / arriving in N min' tracking card), a trusted-by restaurant-logo strip, a 3-up features grid (real-time GPS tracking, curated/vetted selection, saved favorites with icons), a popular-restaurants gallery of cuisine cards (food photo, cuisine chip, rating badge, delivery time + delivery fee), a numbered 1-2-3 'how it works' band, an inverted KPI stats strip (customers, partners, cities, avg delivery time), a 3-up star-rated testimonials grid with avatars, an inverted app-download CTA with App Store and Google Play buttons, and a multi-column footer with company/resources/legal links plus social icons. Use as the ROOT/home page for food-delivery apps, restaurant aggregators, online ordering platforms, ghost-kitchen/meal-delivery startups, grocery or takeout services when a friendly, conversion-focused page with restaurant discovery and social proof is wanted. Supply content only — brand, nav, hero, logos, features, restaurants, steps, stats, testimonials, cta, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content. */
    hero: z
      .object({
        headingTop: z.string().optional(),
        headingBottom: z.string().optional(),
        subheading: z.string().optional(),
        addressPlaceholder: z.string().optional(),
        searchCta: z.string().optional(),
        serving: z.string().optional(),
        imageAlt: z.string().optional(),
        badgeTitle: z.string().optional(),
        badgeSubtitle: z.string().optional(),
        signIn: z.string().optional(),
        getStarted: z.string().optional(),
      })
      .optional(),
    /** Trusted-by logo strip. */
    logos: z
      .object({
        heading: z.string().optional(),
        items: z.array(z.string()).optional(),
      })
      .optional(),
    /** Features grid. */
    features: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Popular-restaurants gallery. */
    restaurants: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        viewAll: z.string().optional(),
        items: z
          .array(
            z.object({
              name: z.string(),
              cuisine: z.string(),
              category: z.string(),
              rating: z.string(),
              time: z.string(),
              delivery: z.string(),
              imageAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Numbered "how it works" band. */
    steps: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Inverted KPI stats strip. */
    stats: z
      .object({
        items: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** Testimonials grid. */
    testimonials: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              quote: z.string(),
              name: z.string(),
              location: z.string(),
              avatarAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Inverted app-download CTA. */
    cta: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        appStore: z.string().optional(),
        googlePlay: z.string().optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        description: z.string().optional(),
        note: z.string().optional(),
        columns: z
          .array(z.object({ heading: z.string(), links: z.array(z.string()) }))
          .optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: {
    schema: {
      restaurants: table({
        category: string(),
        cuisine: string(),
        delivery: string(),
        imageAlt: string(),
        name: string(),
        rating: string(),
        time: string(),
      }),
      orderItems: table({
        restaurantId: string(),
        quantity: number(),
      }),
      favorites: table({
        restaurantName: string(),
      }),
    },
    queries: {
      restaurants: ({ db }) => db.restaurants.orderBy('createdAt').all(),
      orderLines: ({ db }) =>
        db.orderItems.all().flatMap((item) => {
          const restaurant = db.restaurants.get(item.restaurantId)
          return restaurant ? [{ ...item, restaurant }] : []
        }),
      favoriteRestaurantNames: ({ db }) =>
        new Set(db.favorites.all().map((favorite) => favorite.restaurantName)),
    },
    mutations: {
      addToOrder: ({ db }, restaurantName: string) => {
        const restaurant = db.restaurants.where('name', restaurantName).all()[0]
        if (!restaurant) return db.orderItems.all()

        const existingItem = db.orderItems
          .where('restaurantId', restaurant.id)
          .all()[0]

        if (existingItem) {
          db.orderItems.update(existingItem.id, {
            quantity: existingItem.quantity + 1,
          })
        } else {
          db.orderItems.insert({
            restaurantId: restaurant.id,
            quantity: 1,
          })
        }

        return db.orderItems.all()
      },
      updateOrderQuantity: ({ db }, restaurantId: string, quantity: number) => {
        const nextQuantity = Math.max(0, Math.floor(quantity))

        for (const item of db.orderItems
          .where('restaurantId', restaurantId)
          .all()) {
          if (nextQuantity) {
            db.orderItems.update(item.id, { quantity: nextQuantity })
          } else {
            db.orderItems.delete(item.id)
          }
        }

        return db.orderItems.all()
      },
      removeFromOrder: ({ db }, restaurantId: string) => {
        for (const item of db.orderItems
          .where('restaurantId', restaurantId)
          .all()) {
          db.orderItems.delete(item.id)
        }

        return db.orderItems.all()
      },
      clearOrder: ({ db }) => {
        for (const item of db.orderItems.all()) {
          db.orderItems.delete(item.id)
        }

        return []
      },
      toggleFavorite: ({ db }, restaurantName: string) => {
        const existingFavorite = db.favorites
          .where('restaurantName', restaurantName)
          .all()[0]

        if (existingFavorite) {
          db.favorites.delete(existingFavorite.id)
          return false
        }

        db.favorites.insert({ restaurantName })
        return true
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [searchOpen, setSearchOpen] = useState(false)
    const [orderOpen, setOrderOpen] = useState(false)
    const brand = props.brand ?? 'nosh'
    const nav = props.nav?.length
      ? props.nav
      : ['Restaurants', 'How it Works', 'About']

    const headingTop = props.hero?.headingTop ?? 'Your favorite food,'
    const headingBottom = props.hero?.headingBottom ?? 'delivered in minutes'
    const heroSub =
      props.hero?.subheading ??
      'From local favorites to national chains, Nosh brings the best restaurants in your city straight to your door. Track your order in real-time, every time.'
    const addressPlaceholder =
      props.hero?.addressPlaceholder ?? 'Enter your delivery address'
    const searchCta = props.hero?.searchCta ?? 'Find Food'
    const serving =
      props.hero?.serving ??
      'Serving San Francisco, Los Angeles, New York & 40+ cities nationwide'
    const heroImageAlt =
      props.hero?.imageAlt ??
      'Overhead view of colorful gourmet dishes arranged on marble table with fresh vegetables and herbs'
    const badgeTitle = props.hero?.badgeTitle ?? 'Order Confirmed'
    const badgeSubtitle = props.hero?.badgeSubtitle ?? 'Arriving in 24 min'

    const logosHeading =
      props.logos?.heading ?? 'Trusted by leading restaurants nationwide'
    const logoItems = props.logos?.items?.length
      ? props.logos.items
      : [
          'Partner restaurant logo - rustic burger joint',
          'Partner restaurant logo - artisan pizza place',
          'Partner restaurant logo - upscale dining',
          'Partner restaurant logo - sweet bakery',
          'Partner restaurant logo - fresh sushi bar',
          'Partner restaurant logo - breakfast cafe',
        ]

    const featuresHeading = props.features?.heading ?? 'Everything you need'
    const featuresDesc =
      props.features?.description ??
      'We have thought through every detail to make your food delivery experience effortless.'
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: 'Real-Time Tracking',
            description:
              'Know exactly where your order is with live GPS tracking from restaurant to your doorstep. Get updates at every step.',
          },
          {
            title: 'Curated Selection',
            description:
              'Every restaurant is vetted for quality. We partner only with kitchens that meet our high standards for food and service.',
          },
          {
            title: 'Saved Favorites',
            description:
              'Reorder your go-to meals in seconds. Your favorite dishes and restaurants are always just one tap away.',
          },
        ]

    const restaurantsHeading =
      props.restaurants?.heading ?? 'Popular restaurants'
    const restaurantsDesc =
      props.restaurants?.description ?? 'Top-rated spots in your neighborhood'
    const restaurantsViewAll =
      props.restaurants?.viewAll ?? 'View all 240+ restaurants'
    const restaurantItems = props.restaurants?.items?.length
      ? props.restaurants.items
      : [
          {
            name: "Mario's Pizzeria",
            cuisine: 'Italian',
            category: 'Pizza, Pasta, Italian',
            rating: '4.8',
            time: '25-35 min',
            delivery: '$2.49 delivery',
            imageAlt:
              'Wood-fired Neapolitan pizza with melted mozzarella and fresh basil on rustic wooden table',
          },
          {
            name: 'Sakura Sushi Bar',
            cuisine: 'Japanese',
            category: 'Sushi, Ramen, Japanese',
            rating: '4.9',
            time: '30-45 min',
            delivery: '$3.99 delivery',
            imageAlt:
              'Fresh salmon sushi rolls and sashimi platter on black slate serving board',
          },
          {
            name: 'The Burger Joint',
            cuisine: 'American',
            category: 'Burgers, Fries, Shakes',
            rating: '4.7',
            time: '20-30 min',
            delivery: 'Free delivery',
            imageAlt:
              'Juicy gourmet beef burger with melted cheese and caramelized onions on brioche bun',
          },
          {
            name: 'Thai Orchid',
            cuisine: 'Thai',
            category: 'Thai, Noodles, Curry',
            rating: '4.6',
            time: '35-50 min',
            delivery: '$2.99 delivery',
            imageAlt:
              'Steaming bowl of authentic Thai pad thai with shrimp and crushed peanuts',
          },
          {
            name: 'Olive Garden',
            cuisine: 'Mediterranean',
            category: 'Mediterranean, Greek',
            rating: '4.8',
            time: '25-40 min',
            delivery: '$2.49 delivery',
            imageAlt:
              'Colorful Mediterranean mezze platter with hummus falafel and pita bread',
          },
          {
            name: 'Wing King',
            cuisine: 'Wings',
            category: 'Chicken Wings, BBQ',
            rating: '4.5',
            time: '20-35 min',
            delivery: '$1.99 delivery',
            imageAlt:
              'Crispy golden fried chicken wings with buffalo sauce and celery sticks',
          },
          {
            name: 'Curry House',
            cuisine: 'Indian',
            category: 'Indian, Curry, Tandoori',
            rating: '4.7',
            time: '40-55 min',
            delivery: '$3.49 delivery',
            imageAlt:
              'Rich creamy Indian butter chicken curry with naan bread and rice',
          },
          {
            name: 'Sweet Treats Bakery',
            cuisine: 'Desserts',
            category: 'Cakes, Pastries, Coffee',
            rating: '4.9',
            time: '15-25 min',
            delivery: '$2.99 delivery',
            imageAlt:
              'Decadent chocolate cake with berries and powdered sugar dusting',
          },
        ]
    const normalizedRestaurantItems = restaurantItems.map((restaurant) => ({
      category: restaurant.category,
      cuisine: restaurant.cuisine,
      delivery: restaurant.delivery,
      imageAlt: restaurant.imageAlt,
      name: restaurant.name,
      rating: restaurant.rating,
      time: restaurant.time,
    }))
    const storedRestaurants = lakebed.useQuery('restaurants')
    const orderLines = lakebed.useQuery('orderLines')
    const favoriteRestaurantNames = lakebed.useQuery('favoriteRestaurantNames')
    const auth = lakebed.useAuth()
    const addToOrder = lakebed.useMutation('addToOrder')
    const updateOrderQuantity = lakebed.useMutation('updateOrderQuantity')
    const removeFromOrder = lakebed.useMutation('removeFromOrder')
    const clearOrder = lakebed.useMutation('clearOrder')
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
    const displayRestaurants =
      storedRestaurants && storedRestaurants.length > 0
        ? storedRestaurants
        : normalizedRestaurantItems
    const safeOrderLines = orderLines ?? []
    const orderItemCount = safeOrderLines.reduce(
      (total, item) => total + item.quantity,
      0,
    )

    const stepsHeading = props.steps?.heading ?? 'How it works'
    const stepsDesc =
      props.steps?.description ??
      'Getting your favorite food delivered is as easy as 1-2-3.'
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: 'Choose your restaurant',
            description:
              'Browse hundreds of local restaurants filtered by cuisine, price, and delivery time to find your perfect match.',
          },
          {
            title: 'Build your order',
            description:
              'Select your dishes, customize toppings and sides, add special instructions, and review your cart.',
          },
          {
            title: 'Track and enjoy',
            description:
              'Watch your order from kitchen prep to doorstep delivery in real-time on our live map.',
          },
        ]

    const statItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: '2M+', label: 'Happy customers' },
          { value: '500+', label: 'Restaurant partners' },
          { value: '45', label: 'Cities served' },
          { value: '15min', label: 'Avg. delivery time' },
        ]

    const testimonialsHeading =
      props.testimonials?.heading ?? 'What people are saying'
    const testimonialsDesc =
      props.testimonials?.description ??
      'Real reviews from real customers across the country.'
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              'Nosh has completely changed how I order food. The tracking feature is incredible, and I have never had a late delivery. The app is so easy to use!',
            name: 'Sarah Mitchell',
            location: 'San Francisco, CA',
            avatarAlt:
              'Professional headshot of a smiling young woman with shoulder-length brown hair',
          },
          {
            quote:
              'As a restaurant owner, partnering with Nosh increased our delivery orders by 40%. Their driver network is reliable and the commission rates are fair.',
            name: 'Marcus Chen',
            location: 'Owner, Sakura Sushi',
            avatarAlt:
              'Professional headshot of a smiling man in his 40s with short dark hair and glasses',
          },
          {
            quote:
              'I use Nosh 3-4 times a week. The saved favorites feature makes reordering my usual lunch from work incredibly fast. Highly recommended!',
            name: 'David Rodriguez',
            location: 'Austin, TX',
            avatarAlt:
              'Professional headshot of a smiling middle-aged man with beard and casual attire',
          },
        ]

    const ctaHeading = props.cta?.heading ?? 'Ready to order?'
    const ctaDesc =
      props.cta?.description ??
      'Download the app and get your first delivery fee waived. Join over 2 million happy customers today.'
    const ctaAppStore = props.cta?.appStore ?? 'App Store'
    const ctaGooglePlay = props.cta?.googlePlay ?? 'Google Play'

    const footerDesc =
      props.footer?.description ??
      'Your favorite food, delivered fast. Connecting you with the best local restaurants since 2020.'
    const footerNote = props.footer?.note ?? 'All rights reserved.'
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            heading: 'Company',
            links: ['About Us', 'Careers', 'Press', 'Contact'],
          },
          {
            heading: 'Resources',
            links: ['Partner with Us', 'Driver Jobs', 'Help Center', 'Blog'],
          },
          {
            heading: 'Legal',
            links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy'],
          },
        ]

    // Pin-style brand mark (decorative inline SVG, token-colored).
    const PinMark = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
      </svg>
    )

    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M9 5l7 7-7 7" />
      </svg>
    )

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

    const StarIcon = () => (
      <svg
        className="size-5 fill-primary text-primary"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    )

    const featureIcons: ReactNode[] = [
      // clock — real-time tracking
      <svg
        key="clock"
        className="size-6 text-foreground"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      // check-badge — curated selection
      <svg
        key="check"
        className="size-6 text-foreground"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      // heart — saved favorites
      <svg
        key="heart"
        className="size-6 text-foreground"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>,
    ]

    return (
      <div
        className={cn(
          'min-h-svh bg-background font-sans text-foreground antialiased',
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between lg:h-20">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center gap-2"
              >
                <PinMark className="size-8 text-foreground" />
                <span className="text-xl font-semibold tracking-tight">
                  {brand}
                </span>
              </button>
              <div className="hidden items-center gap-8 md:flex">
                {nav.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => go(label)}
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  aria-label="Search"
                  className="hidden items-center gap-2 text-muted-foreground transition-colors hover:text-foreground sm:flex"
                >
                  <svg
                    className="size-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
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
                <Sheet open={orderOpen} onOpenChange={setOrderOpen}>
                  <SheetTrigger asChild>
                    <button
                      type="button"
                      aria-label="Your Order"
                      className="relative flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <svg
                        className="size-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        viewBox="0 0 24 24"
                      >
                        <path d="M9 20a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
                        <path d="M20 20a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                      </svg>
                      {orderItemCount > 0 ? (
                        <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-foreground text-[0.625rem] font-bold text-background">
                          {orderItemCount}
                        </span>
                      ) : null}
                    </button>
                  </SheetTrigger>
                  <SheetContent
                    side="right"
                    className="w-full gap-0 p-0 sm:max-w-md"
                  >
                    <SheetHeader className="border-b border-border p-6">
                      <SheetTitle className="text-xl">Your order</SheetTitle>
                      <SheetDescription>
                        {orderItemCount > 0
                          ? `${orderItemCount} restaurant${orderItemCount === 1 ? '' : 's'} in your order.`
                          : 'Your order is empty.'}
                      </SheetDescription>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto px-6 py-5">
                      {safeOrderLines.length ? (
                        <div className="space-y-5">
                          {safeOrderLines.map((item) => (
                            <div
                              key={item.id}
                              className="grid grid-cols-[72px_1fr] gap-4 border-b border-border pb-5 last:border-0"
                            >
                              <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                                <Image
                                  alt={item.restaurant.imageAlt}
                                  w={180}
                                  h={180}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                      {item.restaurant.cuisine}
                                    </p>
                                    <h3 className="line-clamp-2 text-sm font-semibold text-foreground">
                                      {item.restaurant.name}
                                    </h3>
                                  </div>
                                  <p className="text-sm font-bold text-foreground">
                                    {item.restaurant.delivery}
                                  </p>
                                </div>
                                <div className="mt-4 flex items-center justify-between">
                                  <div className="inline-flex h-9 items-center rounded-full border border-border bg-background">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        void updateOrderQuantity(
                                          item.restaurantId,
                                          item.quantity - 1,
                                        )
                                      }
                                      className="grid size-9 place-items-center text-muted-foreground hover:text-foreground"
                                      aria-label={`Decrease ${item.restaurant.name} quantity`}
                                    >
                                      -
                                    </button>
                                    <span className="min-w-8 text-center text-sm font-semibold">
                                      {item.quantity}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        void updateOrderQuantity(
                                          item.restaurantId,
                                          item.quantity + 1,
                                        )
                                      }
                                      className="grid size-9 place-items-center text-muted-foreground hover:text-foreground"
                                      aria-label={`Increase ${item.restaurant.name} quantity`}
                                    >
                                      +
                                    </button>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      void removeFromOrder(item.restaurantId)
                                    }
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
                            No restaurants in order
                          </p>
                          <p className="mt-2 text-sm text-muted-foreground">
                            Add a restaurant from Popular restaurants to start
                            an order for this session.
                          </p>
                        </div>
                      )}
                    </div>
                    <SheetFooter className="border-t border-border p-6">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-muted-foreground">
                          <span>Restaurants</span>
                          <span>{orderItemCount}</span>
                        </div>
                      </div>
                      <Button
                        type="button"
                        disabled={!safeOrderLines.length}
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
                          onClick={() => void clearOrder()}
                          disabled={!safeOrderLines.length}
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
                <button
                  type="button"
                  aria-label="Open menu"
                  aria-expanded={mobileOpen}
                  aria-controls="mobile-menu"
                  onClick={() => setMobileOpen((v: boolean) => !v)}
                  className="p-2 text-muted-foreground hover:text-foreground lg:hidden"
                >
                  <svg
                    className="size-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                  >
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </svg>
                </button>
              </div>
            </div>
            {mobileOpen && (
              <div
                id="mobile-menu"
                className="flex flex-col border-t border-border bg-background px-4 py-6 pb-8 md:hidden gap-4"
              >
                {nav.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => {
                      setMobileOpen(false)
                      go(label)
                    }}
                    className="text-base font-medium text-foreground/90 transition-colors hover:text-foreground text-left"
                  >
                    {label}
                  </button>
                ))}
                <div className="mt-2 rounded-xl border border-border bg-muted/40 p-3">
                  {isSignedIn ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Avatar size="lg">
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
                            {authEmail ?? 'Signed in'}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        onClick={() => {
                          setMobileOpen(false)
                          handleSignOut()
                        }}
                        className="w-full rounded-full"
                      >
                        Sign out
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => {
                        setMobileOpen(false)
                        handleSignIn()
                      }}
                      disabled={auth.isLoading}
                      className="w-full rounded-full"
                    >
                      <span className="mr-2 grid size-5 place-items-center rounded-full bg-background text-xs font-black text-foreground">
                        G
                      </span>
                      {authLabel}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </header>

        <CommandDialog
          open={searchOpen}
          onOpenChange={setSearchOpen}
          title="Search restaurants"
          description="Search the restaurants seeded for this session."
          className="max-w-xl"
        >
          <CommandInput placeholder={`Search ${brand} restaurants...`} />
          <CommandList className="max-h-[420px]">
            <CommandEmpty>No restaurants found.</CommandEmpty>
            <CommandGroup heading="Restaurants">
              {displayRestaurants.map((restaurant) => (
                <CommandItem
                  key={restaurant.name}
                  value={`${restaurant.cuisine} ${restaurant.name} ${restaurant.rating}`}
                  onSelect={() => {
                    setSearchOpen(false)
                    go(restaurant.name)
                  }}
                  className="gap-3 py-3"
                >
                  <div className="size-12 overflow-hidden rounded-md bg-muted">
                    <Image
                      alt={restaurant.imageAlt}
                      w={120}
                      h={120}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {restaurant.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {restaurant.cuisine}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-foreground">
                    {restaurant.rating}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </CommandDialog>

        <main>
          {/* Hero */}
          <section className="pb-16 pt-32 lg:pb-24 lg:pt-40">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="max-w-2xl">
                  <h1 className="text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                    {headingTop}
                    <br />
                    {headingBottom}
                  </h1>
                  <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
                    {heroSub}
                  </p>
                  <form
                    className="mt-8 flex flex-col gap-3 sm:flex-row"
                    onSubmit={(e) => {
                      e.preventDefault()
                      go(searchCta)
                    }}
                  >
                    <div className="relative max-w-sm flex-1">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                        <svg
                          className="size-5 text-muted-foreground"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        aria-label={addressPlaceholder}
                        placeholder={addressPlaceholder}
                        className="w-full rounded-full border border-input bg-background py-3.5 pl-11 pr-4 text-foreground placeholder-muted-foreground transition-all focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                      />
                    </div>
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center rounded-full bg-foreground px-6 py-3.5 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
                    >
                      {searchCta}
                    </button>
                  </form>
                  <p className="mt-4 text-sm text-muted-foreground">
                    {serving}
                  </p>
                </div>
                <div className="relative">
                  <Image
                    alt={heroImageAlt}
                    w={800}
                    h={600}
                    className="aspect-[4/3] w-full rounded-xl object-cover shadow-2xl"
                  />
                  <div className="absolute -bottom-6 -left-6 flex items-center gap-3 rounded-xl bg-card p-4 shadow-lg">
                    <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
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
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-card-foreground">
                        {badgeTitle}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {badgeSubtitle}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Logos */}
          <section className="border-y border-border bg-card py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-sm font-medium text-muted-foreground">
                {logosHeading}
              </p>
              <div className="grid grid-cols-3 items-center gap-8 opacity-60 md:grid-cols-6">
                {logoItems.map((logo) => (
                  <Image
                    key={logo}
                    alt={logo}
                    w={120}
                    h={40}
                    loading="lazy"
                    className="mx-auto h-8 w-auto object-contain grayscale transition-all hover:grayscale-0"
                  />
                ))}
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {featuresHeading}
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  {featuresDesc}
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
                {featureItems.map((item, i) => (
                  <div
                    key={item.title}
                    className="rounded-xl border border-border bg-card p-8"
                  >
                    <div className="mb-6 flex size-12 items-center justify-center rounded-lg bg-muted">
                      {featureIcons[i % featureIcons.length]}
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-card-foreground">
                      {item.title}
                    </h3>
                    <p className="leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Popular restaurants */}
          <section className="bg-card py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                    {restaurantsHeading}
                  </h2>
                  <p className="mt-2 text-lg text-muted-foreground">
                    {restaurantsDesc}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => go(restaurantsViewAll)}
                  className="flex items-center gap-1 text-sm font-medium text-foreground transition-colors hover:text-muted-foreground"
                >
                  {restaurantsViewAll}
                  <ArrowRight className="size-4" />
                </button>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {displayRestaurants.map((r) => {
                  const isFavorite =
                    favoriteRestaurantNames?.has(r.name) ?? false

                  return (
                    <article key={r.name} className="group">
                      <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-xl bg-background">
                        <Image
                          alt={r.imageAlt}
                          w={400}
                          h={300}
                          loading="lazy"
                          className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <span className="absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium text-foreground backdrop-blur-sm">
                          {r.cuisine}
                        </span>
                        <span className="absolute right-3 top-3 rounded-full bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground">
                          {r.rating}
                        </span>
                        <button
                          type="button"
                          onClick={() => void toggleFavorite(r.name)}
                          aria-pressed={isFavorite}
                          aria-label={
                            isFavorite
                              ? `Remove ${r.name} from favorites`
                              : `Add ${r.name} to favorites`
                          }
                          className={cn(
                            'absolute bottom-3 right-3 grid size-10 place-items-center rounded-full shadow-md transition-all hover:scale-105 group-hover:opacity-100',
                            isFavorite
                              ? 'bg-primary text-primary-foreground opacity-100'
                              : 'bg-background/90 text-foreground opacity-0 hover:bg-background',
                          )}
                        >
                          <HeartIcon active={isFavorite} />
                        </button>
                      </div>
                      <div className="p-5 rounded-xl border border-border bg-background transition-shadow hover:shadow-lg">
                        <h3 className="font-semibold text-foreground">
                          {r.name}
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {r.category}
                        </p>
                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            {r.time}
                          </span>
                          <span className="text-sm font-medium text-foreground">
                            {r.delivery}
                          </span>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          className="w-full rounded-full mt-4"
                          onClick={() => {
                            void addToOrder(r.name)
                            setOrderOpen(true)
                          }}
                        >
                          Add to order
                        </Button>
                      </div>
                    </article>
                  )
                })}
              </div>
            </div>
          </section>

          {/* How it works */}
          <section className="py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {stepsHeading}
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  {stepsDesc}
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
                {stepItems.map((step, i) => (
                  <div key={step.title} className="text-center">
                    <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-foreground text-2xl font-bold text-background">
                      {i + 1}
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-foreground">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="bg-foreground py-16 text-background">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
                {statItems.map((s) => (
                  <div key={s.label}>
                    <div className="text-4xl font-bold lg:text-5xl">
                      {s.value}
                    </div>
                    <div className="mt-2 text-background/70">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="bg-card py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {testimonialsHeading}
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  {testimonialsDesc}
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-3">
                {testimonialItems.map((t) => (
                  <div
                    key={t.name}
                    className="rounded-xl border border-border bg-background p-8"
                  >
                    <div className="mb-4 flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <StarIcon key={i} />
                      ))}
                    </div>
                    <p className="mb-6 leading-relaxed text-foreground/80">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-3">
                      <Image
                        alt={t.avatarAlt}
                        w={100}
                        h={100}
                        loading="lazy"
                        className="size-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {t.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {t.location}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="py-20 lg:py-28">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
              <div className="rounded-xl bg-foreground p-8 text-center sm:p-12 lg:p-16">
                <h2 className="text-3xl font-semibold tracking-tight text-background sm:text-4xl">
                  {ctaHeading}
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-lg text-background/70">
                  {ctaDesc}
                </p>
                <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => go(ctaAppStore)}
                    className="inline-flex items-center gap-2 rounded-lg bg-background px-6 py-3 font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    <svg
                      className="size-6"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.84-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                    </svg>
                    {ctaAppStore}
                  </button>
                  <button
                    type="button"
                    onClick={() => go(ctaGooglePlay)}
                    className="inline-flex items-center gap-2 rounded-lg bg-background px-6 py-3 font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    <svg
                      className="size-6"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M3,20.5V3.5C3,2.91 3.4,2.38 4,2.2L13.69,12.5L4,22.8C3.4,22.63 3,22.09 3,21.5V20.5M13.69,12.5L22.18,4.41C22.69,3.91 23.5,3.99 23.91,4.58C24.03,4.75 24.09,4.95 24.09,5.16V18.84C24.09,19.26 23.86,19.65 23.5,19.87C23.22,20.03 22.88,20.06 22.57,19.95L13.69,15.4V12.5M4,2.2L16.58,8.86L13.69,11.5L4,2.2Z" />
                    </svg>
                    {ctaGooglePlay}
                  </button>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-muted py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5 lg:gap-12">
              <div className="col-span-2 lg:col-span-2">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 flex items-center gap-2"
                >
                  <PinMark className="size-8 text-foreground" />
                  <span className="text-xl font-semibold tracking-tight">
                    {brand}
                  </span>
                </button>
                <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                  {footerDesc}
                </p>
              </div>
              {footerColumns.map((col) => (
                <div key={col.heading}>
                  <h4 className="mb-4 font-semibold text-foreground">
                    {col.heading}
                  </h4>
                  <ul className="space-y-3">
                    {col.links.map((link) => (
                      <li key={link}>
                        <button
                          type="button"
                          onClick={() => go(link)}
                          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {link}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} {brand}, Inc. {footerNote}
              </p>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  aria-label="Twitter"
                  onClick={() => go('Twitter')}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  <svg
                    className="size-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </button>
                <button
                  type="button"
                  aria-label="Instagram"
                  onClick={() => go('Instagram')}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  <svg
                    className="size-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </footer>
      </div>
    )
  },
})
