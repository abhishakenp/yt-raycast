import { useState, type ReactNode } from 'react'
import { z } from 'zod/v4'
import { defineCapsule } from './openui.ts'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'
import { string, table } from '@ship-fast/lakebed/server'
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
 * PropertyListingKimiPage2 — dramatic, cinematic dark-hero luxury real-estate
 * single-property listing page (variant 2).
 *
 * Faithful token port of a Kimi-generated "Glass Pavilion" design: immersive
 * full-bleed hero with stat bar, publication logo strip, icon-driven feature
 * cards, numbered dark-card process steps, 7-image gallery with wide-span hero
 * image, dual pricing cards (sale + lease), statistics band, testimonial cards
 * with headshot avatars, FAQ accordion, dark email-capture CTA, and rich
 * multi-column footer.
 *
 * The second style sibling to PropertyListingKimiPage — use when you want a
 * moodier, editorial, contrast-heavy layout with dark hero/steps/CTA bands and
 * light content sections, versus the bright split-hero variant. Ideal for
 * high-end estates, architectural masterpieces, off-market listings, or
 * broker showcase pages.
 *
 * Full-stack features: Saved properties drawer with heart icon toggle, tour
 * request form submission to Lakebed, Google auth for account menu with saved
 * properties/tour requests navigation, and reactive query/mutation wiring.
 * Every nav item / CTA / footer link / social / form-submit routes via
 * `useNavigate` (never a dead "#"). All imagery uses the alt-driven <Image>
 * component. Rich defaults render the full page beautifully on zero args.
 */
export const PropertyListingKimiPage2 = defineCapsule({
  name: 'PropertyListingKimiPage2',
  description:
    'A dramatic, cinematic dark-hero luxury real-estate single-property listing page with an immersive full-bleed hero, media publication logo strip, icon-driven feature grid, numbered dark-card process steps, a 7-image gallery with wide-span hero images, dual pricing cards (sale vs lease), statistics band, testimonial cards with headshot avatars, FAQ accordion, a dark email-capture CTA, and a multi-column footer. Full-stack with Lakebed: saved properties drawer with heart toggle, tour request form submission, Google auth for account menu. The second style sibling to PropertyListingKimiPage — use when you want a moodier, editorial, contrast-heavy layout with dark hero/steps/CTA bands and light content sections, versus the bright split-hero variant. Ideal for high-end estates, architectural masterpieces, off-market listings, or broker showcase pages. Supply content only — brand, nav, hero, logos, features, steps, gallery, pricing, stats, testimonials, faq, tour, footer; the block owns all layout and styling.',
  props: z.object({
    brand: z.string().optional(),
    nav: z.array(z.string()).optional(),
    hero: z
      .object({
        eyebrow: z.string().optional(),
        title: z.string().optional(),
        description: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        imageAlt: z.string().optional(),
        stats: z
          .array(
            z.object({
              label: z.string(),
              value: z.string(),
              unit: z.string().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    logos: z
      .object({
        label: z.string().optional(),
        items: z.array(z.string()).optional(),
      })
      .optional(),
    features: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    steps: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              number: z.string(),
              title: z.string(),
              description: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    gallery: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        items: z
          .array(
            z.object({
              imageAlt: z.string(),
              caption: z.string(),
              wide: z.boolean().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    pricing: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        sale: z
          .object({
            title: z.string().optional(),
            description: z.string().optional(),
            price: z.string().optional(),
            features: z.array(z.string()).optional(),
            cta: z.string().optional(),
          })
          .optional(),
        lease: z
          .object({
            title: z.string().optional(),
            description: z.string().optional(),
            price: z.string().optional(),
            unit: z.string().optional(),
            features: z.array(z.string()).optional(),
            cta: z.string().optional(),
          })
          .optional(),
      })
      .optional(),
    stats: z
      .object({
        items: z
          .array(
            z.object({
              value: z.string(),
              label: z.string(),
              sublabel: z.string().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
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
    faq: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              question: z.string(),
              answer: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    tour: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        submitLabel: z.string().optional(),
        phone: z.string().optional(),
        imageAlt: z.string().optional(),
      })
      .optional(),
    footer: z
      .object({
        description: z.string().optional(),
        propertyLinks: z.array(z.string()).optional(),
        companyLinks: z.array(z.string()).optional(),
        contactLabel: z.string().optional(),
        contactLines: z.array(z.string()).optional(),
        copyright: z.string().optional(),
        socials: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: {
    schema: {
      savedProperties: table({
        propertyTitle: string(),
        propertyAddress: string(),
        propertyPrice: string(),
      }),
      tourRequests: table({
        email: string(),
        propertyTitle: string(),
        preferredDate: string(),
        status: string(),
      }),
    },
    queries: {
      savedProperties: ({ db }) =>
        db.savedProperties.orderBy('createdAt').all(),
      tourRequests: ({ db }) => db.tourRequests.orderBy('createdAt').all(),
    },
    mutations: {
      saveProperty: (
        { db },
        propertyTitle: string,
        propertyAddress: string,
        propertyPrice: string,
      ) => {
        const existing = db.savedProperties
          .where('propertyTitle', propertyTitle)
          .all()[0]
        if (existing) {
          db.savedProperties.delete(existing.id)
          return false
        }
        db.savedProperties.insert({
          propertyTitle,
          propertyAddress,
          propertyPrice,
        })
        return true
      },
      submitTourRequest: (
        { db },
        email: string,
        propertyTitle: string,
        preferredDate: string,
      ) => {
        db.tourRequests.insert({
          email,
          propertyTitle,
          preferredDate,
          status: 'pending',
        })
        return db.tourRequests.all()
      },
      removeSavedProperty: ({ db }, id: string) => {
        db.savedProperties.delete(id)
        return db.savedProperties.all()
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'PAVILION'
    const nav = props.nav?.length
      ? props.nav
      : ['About', 'Gallery', 'Features', 'Tour', 'FAQ']

    const hero = {
      eyebrow: props.hero?.eyebrow ?? 'Bel Air · Los Angeles',
      title: props.hero?.title ?? 'The Glass Pavilion',
      description:
        props.hero?.description ??
        'An architectural triumph of steel and glass set across 1.2 private acres. Twelve-thousand five-hundred square feet of calibrated luxury living, canyon light, and uninterrupted horizon.',
      primaryCta: props.hero?.primaryCta ?? 'Schedule Private Tour',
      secondaryCta: props.hero?.secondaryCta ?? 'View Gallery',
      imageAlt:
        props.hero?.imageAlt ??
        'Aerial sunset view of a modern glass-walled luxury villa perched on a Los Angeles hillside',
      stats: props.hero?.stats?.length
        ? props.hero.stats
        : [
            { label: 'Asking Price', value: '$28.5M' },
            { label: 'Living Space', value: '12,500', unit: 'sqft' },
            { label: 'Bed / Bath', value: '6 / 9' },
            { label: 'Lot Size', value: '1.2', unit: 'ac' },
          ],
    }

    const logos = {
      label:
        props.logos?.label ?? "Recognized by the world's leading publications",
      items: props.logos?.items?.length
        ? props.logos.items
        : [
            'Forbes',
            'Wall Street Journal',
            'Architectural Digest',
            'Dwell',
            'Dezeen',
          ],
    }

    const features = {
      eyebrow: props.features?.eyebrow ?? 'Features & Amenities',
      heading: props.features?.heading ?? 'Every detail, considered.',
      description:
        props.features?.description ??
        'From climate-controlled wine walls to a dedicated wellness wing, the estate is engineered for modern living at the highest level.',
      items: props.features?.items?.length
        ? props.features.items
        : [
            {
              title: 'Great Room Living',
              description:
                'Double-height ceilings with disappearing Fleetwood glass walls that open the entire west wing to the canyon terrace and zero-edge pool.',
            },
            {
              title: "Chef's Kitchen",
              description:
                'Dual island Calacatta marble kitchen with Gaggenau appliances, walk-in cold pantry, and a dedicated catering entrance for seamless entertaining.',
            },
            {
              title: 'Smart Estate OS',
              description:
                'Savant Pro automation controls lighting, climate, shading, and security across 32 zones, with dedicated home-network fiber and EV charging.',
            },
            {
              title: '250-Bottle Wine Wall',
              description:
                'Climate-controlled glass wine cellar with automated racking, tasting niche, and humidity-buffered storage for investment-grade collecting.',
            },
            {
              title: 'Private Theater',
              description:
                '14-seat Dolby Atmos cinema with 4K projection, acoustic isolation, and tiered Italian-leather seating for premiere-level home viewing.',
            },
            {
              title: 'Wellness Wing',
              description:
                'Dedicated spa level with dry sauna, steam room, cold plunge, and a private Pilates studio with biophilic garden views and natural ventilation.',
            },
          ],
    }

    const steps = {
      eyebrow: props.steps?.eyebrow ?? 'How It Works',
      heading: props.steps?.heading ?? 'Three steps to your private tour.',
      description:
        props.steps?.description ??
        'We keep the process discreet, efficient, and tailored to your schedule.',
      items: props.steps?.items?.length
        ? props.steps.items
        : [
            {
              number: '01',
              title: 'Request a Viewing',
              description:
                'Submit your preferred date and time through our secure calendar. We confirm within 90 minutes during business hours.',
            },
            {
              number: '02',
              title: 'Concierge Confirmation',
              description:
                'Our estate team verifies ID, arranges gated access credentials, and assigns a private agent to guide you through every room.',
            },
            {
              number: '03',
              title: 'Experience the Estate',
              description:
                'Arrive at the private Bel Air entrance. Tours last 90 minutes and include full access to grounds, amenities, and Q&A with our architects.',
            },
          ],
    }

    const gallery = {
      eyebrow: props.gallery?.eyebrow ?? 'Gallery',
      heading: props.gallery?.heading ?? 'Walk the rooms before you arrive.',
      items: props.gallery?.items?.length
        ? props.gallery.items
        : [
            {
              imageAlt:
                'Bright open-concept living room with floor-to-ceiling glass walls overlooking a canyon',
              caption: 'Great Room',
              wide: false,
            },
            {
              imageAlt:
                'Infinity-edge swimming pool reflecting sunset sky with modern patio furniture',
              caption: 'Zero-Edge Pool',
              wide: false,
            },
            {
              imageAlt:
                'Modern gourmet kitchen with marble countertops and stainless steel appliances',
              caption: "Chef's Kitchen",
              wide: false,
            },
            {
              imageAlt:
                'Expansive master bedroom suite with king bed and panoramic glass windows',
              caption: 'Master Suite',
              wide: false,
            },
            {
              imageAlt:
                'Minimalist luxury bathroom with freestanding soaking tub and natural stone walls',
              caption: 'Spa Bath',
              wide: false,
            },
            {
              imageAlt:
                'Outdoor terrace lounge area with modern seating and hillside garden views',
              caption: 'Canyon Terrace',
              wide: false,
            },
            {
              imageAlt:
                'Nighttime exterior view of a contemporary multi-level villa glowing with warm interior light',
              caption: 'Evening Facade',
              wide: true,
            },
            {
              imageAlt:
                'Glass-walled home gym with cardio equipment and garden views',
              caption: 'Fitness Studio',
              wide: false,
            },
          ],
    }

    const pricing = {
      eyebrow: props.pricing?.eyebrow ?? 'Pricing & Availability',
      heading: props.pricing?.heading ?? 'Ownership, simplified.',
      sale: {
        title: props.pricing?.sale?.title ?? 'Sale Price',
        description:
          props.pricing?.sale?.description ??
          'Close in 30 days with an all-cash offer or pre-approved creative financing.',
        price: props.pricing?.sale?.price ?? '$28,500,000',
        features: props.pricing?.sale?.features?.length
          ? props.pricing.sale.features
          : [
              'No transfer taxes — seller concession included',
              'Fully furnished option (+$1.2M)',
              '1-year builder warranty & Smart OS support',
              'Gated entry with biometric access',
            ],
        cta: props.pricing?.sale?.cta ?? 'Request Sale Disclosure',
      },
      lease: {
        title: props.pricing?.lease?.title ?? 'Private Lease Trial',
        description:
          props.pricing?.lease?.description ??
          'Experience the estate before committing. 6-month minimum commitment.',
        price: props.pricing?.lease?.price ?? '$125,000',
        unit: props.pricing?.lease?.unit ?? '/mo',
        features: props.pricing?.lease?.features?.length
          ? props.pricing.lease.features
          : [
              'All utilities, landscaping & smart-system included',
              'Dedicated estate manager on call 24/7',
              '80% of lease credited toward purchase',
              'Private security patrol & camera monitoring',
            ],
        cta: props.pricing?.lease?.cta ?? 'Apply for Lease Preview',
      },
    }

    const stats = {
      items: props.stats?.items?.length
        ? props.stats.items
        : [
            {
              value: '+18%',
              label: 'Bel Air YoY appreciation',
              sublabel: 'Outperforming LA County median by 4×',
            },
            {
              value: '6 min',
              label: 'To Beverly Hills Hotel',
              sublabel: 'Via Stone Canyon Road',
            },
            {
              value: 'A+',
              label: 'Local school rating',
              sublabel: 'Warner Avenue & Roscomare',
            },
            {
              value: '0',
              label: 'Days on market',
              sublabel: 'Off-market private listing',
            },
          ],
    }

    const testimonials = {
      eyebrow: props.testimonials?.eyebrow ?? 'Testimonials',
      heading:
        props.testimonials?.heading ?? 'Trusted by the people who built it.',
      items: props.testimonials?.items?.length
        ? props.testimonials.items
        : [
            {
              quote:
                'The Glass Pavilion is the most camera-ready property I have represented in twenty years. Every angle works because the architecture dissolves into the landscape. We have already registered three qualified all-cash buyers in the first week.',
              name: 'James Caldwell',
              role: 'Principal, The Agency',
              avatarAlt:
                'Professional headshot of a smiling male real estate broker in a navy suit',
            },
            {
              quote:
                'We curated the entire furnishing package around the play of light at golden hour. The floor-to-ceiling glazing turns each room into a living canvas. It is rare to find a home that asks for so little decoration because the architecture itself is the art.',
              name: 'Sarah Whitman',
              role: 'Founder, Studio Whitman',
              avatarAlt:
                'Professional headshot of a smiling female interior designer with blonde hair',
            },
            {
              quote:
                'We engineered the cantilevered terrace to float above the canyon without a single visible support. The result is a sense of weightlessness you can only understand once you stand on it. This project represents the best work our studio has produced.',
              name: 'David Chen',
              role: 'Principal, Chen Architects',
              avatarAlt:
                'Professional headshot of a confident architect with glasses and a beard',
            },
          ],
    }

    const faq = {
      eyebrow: props.faq?.eyebrow ?? 'FAQ',
      heading: props.faq?.heading ?? 'Questions & Answers',
      description:
        props.faq?.description ??
        'Everything you need to know before your visit.',
      items: props.faq?.items?.length
        ? props.faq.items
        : [
            {
              question: 'Is the property part of a homeowner association?',
              answer:
                'No. The Glass Pavilion sits on its own tax parcel with no HOA fees or shared governance. You retain full autonomy over landscaping, exterior modifications, and gate access.',
            },
            {
              question: 'What is included in the sale?',
              answer:
                'The sale includes the structure, all built-in smart systems, pool equipment, and landscaping irrigation. A fully furnished package is available for an additional $1.2 million, curated by Studio Whitman.',
            },
            {
              question: 'Are there any pending assessments or liens?',
              answer:
                'The title is clean and transfer-ready. A preliminary title report dated May 15, 2026 is available to qualified buyers under NDA.',
            },
            {
              question: 'Can I rent the property short-term?',
              answer:
                'Short-term rentals under 30 days are prohibited by Bel Air covenant. However, the 6-month lease-preview program is structured as a licensed residential use and is fully compliant.',
            },
            {
              question: 'How is the home secured?',
              answer:
                'Perimeter walls are concrete-cast with biometric vehicle and pedestrian gates. The smart system includes 24 camera feeds, motion-zoning, and direct integration with Bel Air private patrol.',
            },
            {
              question: 'What are property taxes?',
              answer:
                'Annual property taxes are approximately $342,000 based on the current assessed valuation. A 5-year tax history is included in the disclosure packet.',
            },
          ],
    }

    const tour = {
      eyebrow: props.tour?.eyebrow ?? 'Book Your Tour',
      heading: props.tour?.heading ?? 'See it for yourself.',
      description:
        props.tour?.description ??
        'Tours are private, discreet, and available seven days a week. We never host overlapping viewings. Select a time and our estate team will confirm within 90 minutes.',
      submitLabel: props.tour?.submitLabel ?? 'Request Tour',
      phone: props.tour?.phone ?? '(310) 555-0184',
      imageAlt:
        props.tour?.imageAlt ??
        'Twilight exterior of a sleek modern mansion with illuminated pool and patio',
    }

    const footer = {
      description:
        props.footer?.description ??
        'Representing the finest architectural homes in Los Angeles. Discretion, craft, and results since 2008.',
      propertyLinks: props.footer?.propertyLinks?.length
        ? props.footer.propertyLinks
        : ['Overview', 'Gallery', 'Features', 'Pricing'],
      companyLinks: props.footer?.companyLinks?.length
        ? props.footer.companyLinks
        : ['About Us', 'Our Agents', 'Past Sales', 'Press'],
      contactLabel: props.footer?.contactLabel ?? 'Contact',
      contactLines: props.footer?.contactLines?.length
        ? props.footer.contactLines
        : [
            '1845 Bel Air Road',
            'Los Angeles, CA 90077',
            '(310) 555-0184',
            'estates@pavilion.la',
          ],
      copyright:
        props.footer?.copyright ??
        '© 2026 Pavilion Estates. All rights reserved.',
      socials: props.footer?.socials?.length
        ? props.footer.socials
        : ['Instagram', 'LinkedIn'],
    }

    const featureIcons = [
      <svg
        key="f1"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001 1h12a1 1 0 001-1v-5H9m-3 0v5a1 1 0 001 1h12"
        />
      </svg>,
      <svg
        key="f2"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>,
      <svg
        key="f3"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>,
      <svg
        key="f4"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20 7l-8-4-8 4m16 0v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        />
      </svg>,
      <svg
        key="f5"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 10l4.553-4.553A1 1 0 0121 6v12a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>,
      <svg
        key="f6"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>,
    ]

    const socialIcons: Record<string, ReactNode> = {
      Instagram: (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16 12a4 4 0 10-8 0 4 4 0 008 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 12a9 9 0 1118 0 9 9 0 01-18 0z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 7.5v0" />
        </svg>
      ),
      LinkedIn: (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 8.25v10.5a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18.75V8.25m18 0A2.25 2.25 0 0018.75 6H5.25A2.25 2.25 0 003 8.25m18 0v2.25a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 10.5V8.25"
          />
        </svg>
      ),
    }

    const CalendarIcon = () => (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    )

    const [savedOpen, setSavedOpen] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)

    const savedProperties = lakebed.useQuery('savedProperties')
    const saveProperty = lakebed.useMutation('saveProperty')
    const submitTourRequest = lakebed.useMutation('submitTourRequest')
    const removeSavedProperty = lakebed.useMutation('removeSavedProperty')
    const auth = lakebed.useAuth()

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

    const savedCount = savedProperties?.length ?? 0
    const isPropertySaved =
      savedProperties?.some((p) => p.propertyTitle === hero.title) ?? false

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
          'min-h-svh bg-background font-sans text-foreground antialiased',
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="fixed inset-x-0 top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
          <nav
            className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8"
            aria-label="Global"
          >
            <button
              type="button"
              onClick={() => go(nav[0])}
              className="flex items-center gap-2"
            >
              <span className="text-xl font-bold tracking-tight text-foreground">
                {brand}
              </span>
              <span className="inline-flex h-2 w-2 rounded-full bg-primary" />
            </button>
            <div className="hidden md:flex md:items-center md:gap-8">
              {nav.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => go(label)}
                  className="text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <Sheet open={savedOpen} onOpenChange={setSavedOpen}>
                <SheetTrigger asChild>
                  <button
                    type="button"
                    aria-label="Saved properties"
                    className="relative flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <HeartIcon active={isPropertySaved} />
                    {savedCount > 0 ? (
                      <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-foreground text-[0.625rem] font-bold text-background">
                        {savedCount}
                      </span>
                    ) : null}
                  </button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-full gap-0 p-0 sm:max-w-md"
                >
                  <SheetHeader className="border-b border-border p-6">
                    <SheetTitle className="text-xl">
                      Saved Properties
                    </SheetTitle>
                    <SheetDescription>
                      {savedCount > 0
                        ? `${savedCount} property${savedCount === 1 ? '' : 'ies'} saved to your favorites.`
                        : 'No saved properties yet.'}
                    </SheetDescription>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto px-6 py-5">
                    {savedProperties && savedProperties.length > 0 ? (
                      <div className="space-y-5">
                        {savedProperties.map((property) => (
                          <div
                            key={property.id}
                            className="grid grid-cols-[72px_1fr] gap-4 border-b border-border pb-5 last:border-0"
                          >
                            <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                              <Image
                                alt={property.propertyTitle}
                                w={180}
                                h={180}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    {property.propertyAddress}
                                  </p>
                                  <h3 className="line-clamp-2 text-sm font-semibold text-foreground">
                                    {property.propertyTitle}
                                  </h3>
                                </div>
                                <p className="text-sm font-bold text-foreground">
                                  {property.propertyPrice}
                                </p>
                              </div>
                              <div className="mt-4 flex items-center justify-between">
                                <button
                                  type="button"
                                  onClick={() =>
                                    void removeSavedProperty(property.id)
                                  }
                                  className="text-xs font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                                >
                                  Remove
                                </button>
                                <Button
                                  type="button"
                                  size="sm"
                                  className="rounded-full"
                                  onClick={() => {
                                    setSavedOpen(false)
                                    go('Tour')
                                  }}
                                >
                                  Book Tour
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 px-6 text-center">
                        <p className="text-base font-semibold text-foreground">
                          No saved properties
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Save properties to your favorites to view them here.
                        </p>
                      </div>
                    )}
                  </div>
                  <SheetFooter className="border-t border-border p-6">
                    <SheetClose asChild>
                      <Button
                        type="button"
                        variant="secondary"
                        className="rounded-full"
                      >
                        Continue
                      </Button>
                    </SheetClose>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
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
                        onClick={() => go('Saved Properties')}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        Saved Properties
                        <ArrowRight />
                      </button>
                      <button
                        type="button"
                        onClick={() => go('Tour Requests')}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        Tour Requests
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
              <button
                type="button"
                onClick={() => go('Tour')}
                className="hidden sm:inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors"
              >
                Book a Tour
              </button>
              <button
                type="button"
                onClick={() => go('Tour')}
                className="sm:hidden rounded-full bg-primary p-2.5 text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors"
                aria-label="Book a tour"
              >
                <CalendarIcon />
              </button>
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
          </nav>
        </header>

        <main>
          {/* Hero */}
          <section className="relative isolate overflow-hidden bg-foreground pt-32 pb-20 sm:pt-40 sm:pb-24 lg:pt-48 lg:pb-32">
            <div className="absolute inset-0 -z-10">
              <Image
                alt={hero.imageAlt}
                w={2400}
                h={1600}
                className="h-full w-full object-cover opacity-40"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/60 to-transparent" />
            </div>
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-3xl text-center">
                <p className="text-sm font-bold uppercase tracking-widest text-primary mb-6">
                  {hero.eyebrow}
                </p>
                <h1 className="text-5xl font-extrabold tracking-tight text-background sm:text-7xl lg:text-8xl">
                  {hero.title}
                </h1>
                <p className="mt-6 text-lg leading-8 text-background/70 sm:text-xl">
                  {hero.description}
                </p>
                <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => go(hero.primaryCta)}
                    className="w-full sm:w-auto rounded-full bg-primary px-8 py-4 text-base font-bold text-primary-foreground shadow-xl shadow-primary/25 hover:bg-primary/90 transition-colors"
                  >
                    {hero.primaryCta}
                  </button>
                  <button
                    type="button"
                    onClick={() => go(hero.secondaryCta)}
                    className="w-full sm:w-auto rounded-full bg-background/10 px-8 py-4 text-base font-bold text-background backdrop-blur-sm hover:bg-background/20 transition-colors border border-background/10"
                  >
                    {hero.secondaryCta}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      void saveProperty(
                        hero.title,
                        hero.eyebrow,
                        hero.stats[0]?.value || '',
                      )
                    }
                    aria-pressed={isPropertySaved}
                    aria-label={
                      isPropertySaved
                        ? 'Remove from saved properties'
                        : 'Save to properties'
                    }
                    className={cn(
                      'w-full sm:w-auto rounded-full px-8 py-4 text-base font-bold backdrop-blur-sm transition-colors border',
                      isPropertySaved
                        ? 'bg-primary/20 text-primary border-primary/30'
                        : 'bg-background/10 text-background border-background/10 hover:bg-background/20',
                    )}
                  >
                    {isPropertySaved ? 'Saved' : 'Save Property'}
                  </button>
                </div>
                <dl className="mt-16 grid grid-cols-2 gap-8 border-t border-background/10 pt-8 sm:grid-cols-4 sm:gap-x-12">
                  {hero.stats.map((s) => (
                    <div key={s.label}>
                      <dt className="text-sm font-medium text-background/60">
                        {s.label}
                      </dt>
                      <dd className="mt-2 text-3xl font-extrabold tracking-tight text-background">
                        {s.value}
                        {s.unit && (
                          <span className="text-xl font-semibold text-background/60">
                            {' '}
                            {s.unit}
                          </span>
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </section>

          {/* Logos */}
          <section className="bg-muted py-14 border-b border-border">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <p className="text-center text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-10">
                {logos.label}
              </p>
              <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:grid-cols-5 items-center justify-items-center opacity-70">
                {logos.items.map((item) => (
                  <span
                    key={item}
                    className="text-xl font-serif font-bold text-foreground tracking-tight"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="py-24 sm:py-32 bg-background">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-2xl text-center">
                <h2 className="text-base font-bold uppercase tracking-widest text-primary mb-3">
                  {features.eyebrow}
                </h2>
                <p className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
                  {features.heading}
                </p>
                <p className="mt-6 text-lg leading-8 text-muted-foreground">
                  {features.description}
                </p>
              </div>
              <div className="mx-auto mt-16 grid max-w-7xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {features.items.map((item, i) => (
                  <div
                    key={item.title}
                    className="rounded-3xl border border-border bg-card p-8 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="mb-6 inline-flex rounded-2xl bg-primary/10 p-4 text-primary">
                      {featureIcons[i % featureIcons.length]}
                    </div>
                    <h3 className="text-lg font-bold text-foreground">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-base leading-7 text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Steps */}
          <section className="bg-foreground py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-2xl text-center">
                <h2 className="text-base font-bold uppercase tracking-widest text-primary mb-3">
                  {steps.eyebrow}
                </h2>
                <p className="text-4xl font-extrabold tracking-tight text-background sm:text-5xl">
                  {steps.heading}
                </p>
                <p className="mt-6 text-lg leading-8 text-background/70">
                  {steps.description}
                </p>
              </div>
              <div className="mx-auto mt-16 grid max-w-7xl grid-cols-1 gap-10 sm:grid-cols-3">
                {steps.items.map((item) => (
                  <div
                    key={item.number}
                    className="relative rounded-3xl bg-card p-8 border border-border"
                  >
                    <span className="absolute -top-6 left-8 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                      {item.number}
                    </span>
                    <h3 className="mt-4 text-xl font-bold text-foreground">
                      {item.title}
                    </h3>
                    <p className="mt-4 text-base leading-7 text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Gallery */}
          <section className="py-24 sm:py-32 bg-background">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-2xl text-center">
                <h2 className="text-base font-bold uppercase tracking-widest text-primary mb-3">
                  {gallery.eyebrow}
                </h2>
                <p className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
                  {gallery.heading}
                </p>
              </div>
              <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {gallery.items.map((item) => (
                  <figure
                    key={item.caption}
                    className={cn(
                      'group relative overflow-hidden rounded-3xl',
                      item.wide && 'sm:col-span-2 lg:col-span-2',
                    )}
                  >
                    <Image
                      alt={item.imageAlt}
                      w={item.wide ? 1600 : 1200}
                      h={800}
                      className="h-72 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <figcaption className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-foreground/70 to-transparent px-6 pb-5 pt-10">
                      <span className="text-sm font-bold text-background">
                        {item.caption}
                      </span>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="bg-muted py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-2xl text-center">
                <h2 className="text-base font-bold uppercase tracking-widest text-primary mb-3">
                  {pricing.eyebrow}
                </h2>
                <p className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
                  {pricing.heading}
                </p>
              </div>
              <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 lg:grid-cols-2">
                {/* Sale */}
                <div className="rounded-3xl bg-card p-10 shadow-sm ring-1 ring-border flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-foreground">
                      {pricing.sale.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {pricing.sale.description}
                    </p>
                    <p className="mt-6 text-5xl font-extrabold tracking-tight text-foreground">
                      {pricing.sale.price}
                    </p>
                    <ul className="mt-8 space-y-4 text-base text-muted-foreground">
                      {pricing.sale.features.map((f) => (
                        <li key={f} className="flex items-start gap-3">
                          <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">
                            ✓
                          </span>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button
                    type="button"
                    onClick={() => go(pricing.sale.cta)}
                    className="mt-10 block w-full rounded-full bg-foreground px-6 py-4 text-center text-base font-bold text-background hover:bg-foreground/90 transition-colors"
                  >
                    {pricing.sale.cta}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      void saveProperty(
                        hero.title,
                        hero.eyebrow,
                        pricing.sale.price,
                      )
                    }
                    aria-pressed={isPropertySaved}
                    aria-label={
                      isPropertySaved
                        ? 'Remove from saved properties'
                        : 'Save to properties'
                    }
                    className={cn(
                      'mt-3 block w-full rounded-full px-6 py-3 text-center text-sm font-semibold transition-colors border',
                      isPropertySaved
                        ? 'bg-primary/20 text-primary border-primary/30'
                        : 'bg-background/10 text-foreground border-border hover:bg-muted',
                    )}
                  >
                    {isPropertySaved ? 'Saved' : 'Save Property'}
                  </button>
                </div>
                {/* Lease */}
                <div className="rounded-3xl bg-foreground p-10 shadow-lg flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-background">
                      {pricing.lease.title}
                    </h3>
                    <p className="mt-2 text-sm text-background/70">
                      {pricing.lease.description}
                    </p>
                    <p className="mt-6 text-5xl font-extrabold tracking-tight text-background">
                      {pricing.lease.price}
                      <span className="text-xl font-semibold text-background/70">
                        {' '}
                        {pricing.lease.unit}
                      </span>
                    </p>
                    <ul className="mt-8 space-y-4 text-base text-background/70">
                      {pricing.lease.features.map((f) => (
                        <li key={f} className="flex items-start gap-3">
                          <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                            ✓
                          </span>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button
                    type="button"
                    onClick={() => go(pricing.lease.cta)}
                    className="mt-10 block w-full rounded-full bg-primary px-6 py-4 text-center text-base font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    {pricing.lease.cta}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      void saveProperty(
                        hero.title,
                        hero.eyebrow,
                        pricing.lease.price,
                      )
                    }
                    aria-pressed={isPropertySaved}
                    aria-label={
                      isPropertySaved
                        ? 'Remove from saved properties'
                        : 'Save to properties'
                    }
                    className={cn(
                      'mt-3 block w-full rounded-full px-6 py-3 text-center text-sm font-semibold transition-colors border',
                      isPropertySaved
                        ? 'bg-primary/20 text-primary-foreground border-primary/30'
                        : 'bg-background/10 text-background border-background/10 hover:bg-background/20',
                    )}
                  >
                    {isPropertySaved ? 'Saved' : 'Save Property'}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="py-24 sm:py-32 bg-background border-y border-border">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="grid grid-cols-1 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
                {stats.items.map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="text-5xl font-extrabold tracking-tight text-primary">
                      {s.value}
                    </p>
                    <p className="mt-2 text-base font-semibold text-foreground">
                      {s.label}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {s.sublabel}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="py-24 sm:py-32 bg-muted">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-2xl text-center">
                <h2 className="text-base font-bold uppercase tracking-widest text-primary mb-3">
                  {testimonials.eyebrow}
                </h2>
                <p className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
                  {testimonials.heading}
                </p>
              </div>
              <div className="mx-auto mt-16 grid max-w-7xl grid-cols-1 gap-8 lg:grid-cols-3">
                {testimonials.items.map((t) => (
                  <div
                    key={t.name}
                    className="rounded-3xl bg-card p-8 shadow-sm ring-1 ring-border"
                  >
                    <div className="flex items-center gap-4">
                      <Image
                        alt={t.avatarAlt}
                        w={120}
                        h={120}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-bold text-foreground">
                          {t.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t.role}
                        </p>
                      </div>
                    </div>
                    <p className="mt-6 text-base leading-7 text-muted-foreground">
                      “{t.quote}”
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="py-24 sm:py-32 bg-background">
            <div className="mx-auto max-w-4xl px-6 lg:px-8">
              <div className="text-center">
                <h2 className="text-base font-bold uppercase tracking-widest text-primary mb-3">
                  {faq.eyebrow}
                </h2>
                <p className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
                  {faq.heading}
                </p>
                <p className="mt-6 text-lg leading-8 text-muted-foreground">
                  {faq.description}
                </p>
              </div>
              <dl className="mt-16 space-y-6">
                {faq.items.map((item) => (
                  <div
                    key={item.question}
                    className="rounded-2xl border border-border p-6"
                  >
                    <dt className="text-base font-bold text-foreground">
                      {item.question}
                    </dt>
                    <dd className="mt-3 text-base leading-7 text-muted-foreground">
                      {item.answer}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>

          {/* CTA / Tour */}
          <section className="relative isolate overflow-hidden bg-foreground py-24 sm:py-32">
            <div className="absolute inset-0 -z-10">
              <Image
                alt={tour.imageAlt}
                w={2400}
                h={1600}
                className="h-full w-full object-cover opacity-30"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-foreground via-foreground/80 to-foreground/40" />
            </div>
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-2xl text-center">
                <h2 className="text-base font-bold uppercase tracking-widest text-primary mb-4">
                  {tour.eyebrow}
                </h2>
                <p className="text-4xl font-extrabold tracking-tight text-background sm:text-5xl">
                  {tour.heading}
                </p>
                <p className="mt-6 text-lg leading-8 text-background/70">
                  {tour.description}
                </p>
                <form
                  className="mt-10 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-center sm:gap-4"
                  onSubmit={(e) => {
                    e.preventDefault()
                    const email = (
                      e.currentTarget.elements.namedItem(
                        'tour-email',
                      ) as HTMLInputElement
                    ).value
                    void submitTourRequest(
                      email,
                      hero.title,
                      new Date().toISOString(),
                    )
                    go(tour.submitLabel)
                  }}
                >
                  <label htmlFor="tour-email" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="tour-email"
                    type="email"
                    required
                    placeholder="Enter your email"
                    className="w-full sm:w-80 rounded-full bg-background/10 px-6 py-4 text-base text-background placeholder:text-background/60 backdrop-blur-sm outline-none ring-1 ring-background/20 focus:ring-2 focus:ring-primary border border-background/10"
                  />
                  <button
                    type="submit"
                    className="w-full sm:w-auto rounded-full bg-primary px-8 py-4 text-base font-bold text-primary-foreground shadow-xl shadow-primary/25 hover:bg-primary/90 transition-colors"
                  >
                    {tour.submitLabel}
                  </button>
                </form>
                <p className="mt-4 text-sm text-background/60">
                  Or call directly:{' '}
                  <button
                    type="button"
                    onClick={() => go(tour.phone)}
                    className="font-semibold text-background hover:text-primary transition-colors"
                  >
                    {tour.phone}
                  </button>
                </p>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-foreground border-t border-border">
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
            <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="flex items-center gap-2"
                >
                  <span className="text-lg font-bold tracking-tight text-background">
                    {brand}
                  </span>
                  <span className="inline-flex h-2 w-2 rounded-full bg-primary" />
                </button>
                <p className="mt-4 text-sm leading-6 text-background/60">
                  {footer.description}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-bold uppercase tracking-widest text-background mb-4">
                  Property
                </h4>
                <ul className="space-y-3 text-sm text-background/60">
                  {footer.propertyLinks.map((link) => (
                    <li key={link}>
                      <button
                        type="button"
                        onClick={() => go(link)}
                        className="hover:text-primary transition-colors"
                      >
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-bold uppercase tracking-widest text-background mb-4">
                  Company
                </h4>
                <ul className="space-y-3 text-sm text-background/60">
                  {footer.companyLinks.map((link) => (
                    <li key={link}>
                      <button
                        type="button"
                        onClick={() => go(link)}
                        className="hover:text-primary transition-colors"
                      >
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-bold uppercase tracking-widest text-background mb-4">
                  {footer.contactLabel}
                </h4>
                <ul className="space-y-3 text-sm text-background/60">
                  {footer.contactLines.map((line) => (
                    <li key={line}>
                      <button
                        type="button"
                        onClick={() => go(line)}
                        className="hover:text-primary transition-colors"
                      >
                        {line}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-16 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border pt-8">
              <p className="text-xs text-background/60">{footer.copyright}</p>
              <div className="flex items-center gap-6">
                {footer.socials.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => go(s)}
                    className="text-background/60 hover:text-background transition-colors"
                    aria-label={s}
                  >
                    {socialIcons[s]}
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
