import { useState, type ReactNode } from 'react'
import { z } from 'zod/v4'
import { defineCapsule } from './openui.ts'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'
import { string, table } from '@ship-fast/lakebed/server'
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
} from '#/components/ui/sheet.tsx'
import { Button } from '#/components/ui/button.tsx'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '#/components/ui/popover.tsx'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar.tsx'

/**
 * LogisticsKimiPage — a complete, self-contained global-logistics / freight-forwarding
 * LANDING page. A faithful Tailwind v4 port of a Kimi-generated "SwiftFreight"
 * design: a clean, corporate, trust-forward aesthetic on a light surface with a
 * deep slate primary, generous whitespace, rounded cards and soft shadows.
 *
 * It pairs a split hero (headline + shipment-tracking input + trust chips +
 * floating on-time-rate badge over a port photo) with a logo trust strip, a
 * 4-up KPI stat band, a 6-up services grid (air/ocean/ground/warehousing/
 * customs/last-mile with per-card prices), a numbered "how it works" flow next
 * to a warehouse photo, a 6-image global-network gallery, a 3-tier pricing
 * table (Standard / Priority / Express), three star-rated testimonials, an
 * accordion FAQ, a high-contrast closing CTA, and a rich multi-column footer.
 *
 * The block owns ALL layout, spacing, type hierarchy and color (semantic theme
 * tokens only). Every nav item / CTA / link / form submit routes through
 * `useNavigate` (never a dead "#"), and the navbar labels match the `nav`
 * array so PageSwitch can swap pages. All content imagery uses the alt-driven
 * <Image> component (never a raw src). Callers supply ONLY content data; rich
 * defaults make it render great with no props at all.
 */
export const LogisticsKimiPage = defineCapsule({
  name: 'LogisticsKimiPage',
  description:
    "Complete global-logistics, freight-forwarding and shipping-company LANDING page with a clean, corporate, trust-forward aesthetic: light surface, deep slate primary, rounded cards, soft shadows and generous whitespace. Includes a split hero (headline, real-time shipment-tracking input with a tracking-number field, trust chips and a floating on-time delivery-rate badge over a cargo-port photo), a client logo trust strip, a 4-up KPI stat band (countries served, shipments delivered, years, team), a 6-up services grid (Air Freight, Ocean Freight, Ground Transport, Warehousing, Customs Brokerage, Last-Mile Delivery — each with an icon and starting price), a numbered four-step 'how it works' flow beside a warehouse photo, a 6-image global-network gallery, a 3-tier pricing table (Standard / Priority / Express with feature lists and a Popular highlight), three five-star customer testimonials with avatars, an accordion FAQ, a high-contrast closing CTA, and a rich multi-column footer with services/company/contact columns and social links. Use as the ROOT/home page for logistics providers, freight forwarders, shipping carriers, supply-chain, courier, warehousing, customs-brokerage, fulfillment or cargo/transport companies when a professional, conversion-focused page with shipment tracking, service catalog, pricing and social proof is wanted. Supply content only — brand, nav, hero, logos, stats, services, steps, gallery, pricing, testimonials, faq, cta, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand / company name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content + shipment-tracking widget. */
    hero: z
      .object({
        headingTop: z.string().optional(),
        /** Highlighted phrase under the heading. */
        highlight: z.string().optional(),
        subheading: z.string().optional(),
        trackLabel: z.string().optional(),
        trackPlaceholder: z.string().optional(),
        trackButton: z.string().optional(),
        trackHint: z.string().optional(),
        /** Trust chips beneath the tracking widget. */
        chips: z.array(z.string()).optional(),
        imageAlt: z.string().optional(),
        badgeValue: z.string().optional(),
        badgeLabel: z.string().optional(),
        primaryCta: z.string().optional(),
      })
      .optional(),
    /** Client logo trust strip. */
    logos: z
      .object({
        heading: z.string().optional(),
        items: z.array(z.string()).optional(),
      })
      .optional(),
    /** KPI stat band. */
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    /** Services / capabilities grid. */
    services: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
              price: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** "How it works" numbered flow. */
    steps: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
        imageAlt: z.string().optional(),
        badgeLabel: z.string().optional(),
        badgeValue: z.string().optional(),
      })
      .optional(),
    /** Global-network image gallery. */
    gallery: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        images: z.array(z.string()).optional(),
      })
      .optional(),
    /** Pricing / service tiers. */
    pricing: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        footnote: z.string().optional(),
        tiers: z
          .array(
            z.object({
              name: z.string(),
              tagline: z.string(),
              price: z.string(),
              unit: z.string(),
              features: z.array(z.string()),
              cta: z.string(),
              badge: z.string().optional(),
              featured: z.boolean().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Customer testimonials. */
    testimonials: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
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
    /** Accordion FAQ. */
    faq: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
      })
      .optional(),
    /** Closing CTA band. */
    cta: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        primary: z.string().optional(),
        secondary: z.string().optional(),
        note: z.string().optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        blurb: z.string().optional(),
        servicesTitle: z.string().optional(),
        servicesLinks: z.array(z.string()).optional(),
        companyTitle: z.string().optional(),
        companyLinks: z.array(z.string()).optional(),
        contactTitle: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        copyright: z.string().optional(),
        legalLinks: z.array(z.string()).optional(),
        socials: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: {
    schema: {
      shipments: table({
        trackingNumber: string(),
        origin: string(),
        destination: string(),
        status: string(),
        estimatedDelivery: string(),
        weight: string(),
        service: string(),
      }),
      quoteRequests: table({
        origin: string(),
        destination: string(),
        weight: string(),
        service: string(),
        email: string(),
      }),
    },
    queries: {
      shipments: ({ db }) => db.shipments.orderBy('createdAt').all(),
      quoteRequests: ({ db }) => db.quoteRequests.orderBy('createdAt').all(),
    },
    mutations: {
      addShipment: (
        { db },
        trackingNumber: string,
        origin: string,
        destination: string,
        service: string,
        weight: string,
      ) => {
        db.shipments.insert({
          trackingNumber,
          origin,
          destination,
          status: 'In Transit',
          estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
          weight,
          service,
        })
        return db.shipments.all()
      },
      updateShipmentStatus: (
        { db },
        trackingNumber: string,
        status: string,
      ) => {
        const shipment = db.shipments
          .where('trackingNumber', trackingNumber)
          .all()[0]
        if (shipment) {
          db.shipments.update(shipment.id, { status })
        }
        return db.shipments.all()
      },
      removeShipment: ({ db }, trackingNumber: string) => {
        const shipment = db.shipments
          .where('trackingNumber', trackingNumber)
          .all()[0]
        if (shipment) {
          db.shipments.delete(shipment.id)
        }
        return db.shipments.all()
      },
      submitQuoteRequest: (
        { db },
        origin: string,
        destination: string,
        weight: string,
        service: string,
        email: string,
      ) => {
        db.quoteRequests.insert({
          origin,
          destination,
          weight,
          service,
          email,
        })
        return db.quoteRequests.all()
      },
      clearQuoteRequests: ({ db }) => {
        for (const item of db.quoteRequests.all()) {
          db.quoteRequests.delete(item.id)
        }
        return []
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [trackingOpen, setTrackingOpen] = useState(false)
    const [quoteOpen, setQuoteOpen] = useState(false)
    const [searchOpen, setSearchOpen] = useState(false)
    const [trackingInput, setTrackingInput] = useState('')
    const [quoteForm, setQuoteForm] = useState({
      origin: '',
      destination: '',
      weight: '',
      service: 'Air Freight',
      email: '',
    })
    const brand = props.brand ?? 'SwiftFreight'

    const shipments = lakebed.useQuery('shipments')
    const quoteRequests = lakebed.useQuery('quoteRequests')
    const auth = lakebed.useAuth()
    const addShipment = lakebed.useMutation('addShipment')
    const updateShipmentStatus = lakebed.useMutation('updateShipmentStatus')
    const removeShipment = lakebed.useMutation('removeShipment')
    const submitQuoteRequest = lakebed.useMutation('submitQuoteRequest')
    const clearQuoteRequests = lakebed.useMutation('clearQuoteRequests')

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

    const handleTrackSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      if (trackingInput.trim()) {
        void addShipment(
          trackingInput.trim(),
          'Shenzhen',
          'Los Angeles',
          'Air Freight',
          '500kg',
        )
        setTrackingOpen(true)
        setTrackingInput('')
      }
    }

    const handleQuoteSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      if (
        quoteForm.origin &&
        quoteForm.destination &&
        quoteForm.weight &&
        quoteForm.email
      ) {
        void submitQuoteRequest(
          quoteForm.origin,
          quoteForm.destination,
          quoteForm.weight,
          quoteForm.service,
          quoteForm.email,
        )
        setQuoteOpen(true)
        setQuoteForm({
          origin: '',
          destination: '',
          weight: '',
          service: 'Air Freight',
          email: '',
        })
      }
    }

    const safeShipments = shipments ?? []
    const safeQuoteRequests = quoteRequests ?? []
    const nav = props.nav?.length
      ? props.nav
      : ['Services', 'Track', 'About', 'Pricing', 'Contact']

    const headingTop = props.hero?.headingTop ?? 'Global logistics,'
    const heroHighlight = props.hero?.highlight ?? 'simplified.'
    const heroSub =
      props.hero?.subheading ??
      'Ship to 180+ countries with real-time tracking and guaranteed delivery. From Shenzhen to Chicago, Amsterdam to São Paulo—we move what matters.'
    const trackLabel = props.hero?.trackLabel ?? 'Track your shipment'
    const trackPlaceholder =
      props.hero?.trackPlaceholder ??
      'Enter tracking number (e.g., SF-7823-9912)'
    const trackButton = props.hero?.trackButton ?? 'Track'
    const trackHint =
      props.hero?.trackHint ??
      'Try demo: SF-2024-8841, SF-2024-7752, SF-2024-9931'
    const heroChips = props.hero?.chips?.length
      ? props.hero.chips
      : ['Real-time tracking', 'Insurance included', '24/7 support']
    const heroImageAlt =
      props.hero?.imageAlt ??
      'Aerial view of a large commercial shipping port with colorful cargo containers and cranes at sunset'
    const heroBadgeValue = props.hero?.badgeValue ?? '98.7% on-time'
    const heroBadgeLabel = props.hero?.badgeLabel ?? 'Delivery rate in 2024'
    const heroPrimary = props.hero?.primaryCta ?? 'Get a Quote'

    const logosHeading = props.logos?.heading ?? 'Trusted by industry leaders'
    const logoItems = props.logos?.items?.length
      ? props.logos.items
      : ['TechFlow', 'Globex', 'Acme Corp', 'Stark Ind', 'Wayne Ent', 'Oscorp']

    const statItems = props.stats?.length
      ? props.stats
      : [
          { value: '180+', label: 'Countries served' },
          { value: '2.4M', label: 'Shipments delivered (2024)' },
          { value: '24', label: 'Years in operation' },
          { value: '4,200', label: 'Team members worldwide' },
        ]

    const servicesHeading =
      props.services?.heading ?? 'Complete logistics solutions'
    const servicesDesc =
      props.services?.description ??
      "From factory floor to customer's door—every mode, every mile, managed seamlessly."
    const serviceItems = props.services?.items?.length
      ? props.services.items
      : [
          {
            title: 'Air Freight',
            description:
              'Express and standard air cargo to 500+ airports. Next-flight-out options for urgent shipments. Typical transit: 1-5 days.',
            price: 'From $4.20/kg',
          },
          {
            title: 'Ocean Freight',
            description:
              'FCL and LCL shipping to major ports worldwide. Full container loads or consolidated cargo. Typical transit: 15-45 days.',
            price: 'From $85/CBM',
          },
          {
            title: 'Ground Transport',
            description:
              'Full truckload (FTL) and less-than-truckload (LTL) across North America and Europe. Real-time GPS tracking included.',
            price: 'From $1.45/mile',
          },
          {
            title: 'Warehousing',
            description:
              '42 facilities across 18 countries. Climate-controlled storage, pick-and-pack, kitting, and inventory management via our WMS.',
            price: 'From $0.45/unit/day',
          },
          {
            title: 'Customs Brokerage',
            description:
              'Licensed customs brokers in 38 countries. Documentation, duty calculation, and compliance management for smooth clearance.',
            price: 'From $125/shipment',
          },
          {
            title: 'Last-Mile Delivery',
            description:
              'White-glove delivery, installation services, and residential delivery with SMS/email notifications and photo confirmation.',
            price: 'From $12.50/delivery',
          },
        ]

    const stepsHeading = props.steps?.heading ?? 'How it works'
    const stepsDesc =
      props.steps?.description ??
      "From quote to delivery in four simple steps. Our platform handles the complexity so you don't have to."
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: 'Get an instant quote',
            description:
              'Enter origin, destination, and cargo details. Our algorithm compares rates across air, ocean, and ground to find your best option.',
          },
          {
            title: 'Book and schedule',
            description:
              'Confirm your booking online. Choose pickup date, add insurance, and select any additional services like customs brokerage.',
          },
          {
            title: 'We handle pickup & transit',
            description:
              'Our drivers collect your cargo. Track every mile in real-time via GPS, EDI updates, and milestone notifications.',
          },
          {
            title: 'Delivery confirmation',
            description:
              'Cargo arrives with photo proof of delivery. Access POD, BOL, and invoice instantly in your shipment history.',
          },
        ]
    const stepsImageAlt =
      props.steps?.imageAlt ??
      'A professional logistics worker in a warehouse scanning a package barcode with a handheld device'
    const stepsBadgeLabel = props.steps?.badgeLabel ?? 'Average booking time'
    const stepsBadgeValue = props.steps?.badgeValue ?? '3 min'

    const galleryHeading = props.gallery?.heading ?? 'Our global network'
    const galleryDesc =
      props.gallery?.description ??
      'Facilities, fleet, and infrastructure that keep the world moving.'
    const galleryImages = props.gallery?.images?.length
      ? props.gallery.images
      : [
          'Large commercial cargo ship loaded with colorful shipping containers sailing at sea',
          'Modern warehouse interior with tall shelves of packages and automated conveyor systems',
          'Fleet of white commercial delivery trucks parked at a distribution center',
          'Cargo airplane being loaded with freight containers at an airport tarmac',
          'Workers in safety vests coordinating logistics operations at a busy freight terminal',
          'Aerial view of a massive container port with cranes and stacked shipping containers',
        ]

    const pricingHeading = props.pricing?.heading ?? 'Service tiers'
    const pricingDesc =
      props.pricing?.description ??
      'Choose the service level that matches your timeline and budget.'
    const pricingFootnote =
      props.pricing?.footnote ??
      'Ocean freight rates from $85/CBM. Ground transport from $1.45/mile. Volume discounts available.'
    const pricingTiers = props.pricing?.tiers?.length
      ? props.pricing.tiers
      : [
          {
            name: 'Standard',
            tagline: 'Economy shipping for non-urgent cargo',
            price: '$2.80',
            unit: '/kg air',
            features: [
              '5-7 day air transit',
              'Standard tracking',
              '$100 insurance included',
              'Email support',
            ],
            cta: 'Get a quote',
          },
          {
            name: 'Priority',
            tagline: 'Best balance of speed and cost',
            price: '$4.50',
            unit: '/kg air',
            features: [
              '2-4 day air transit',
              'Real-time GPS tracking',
              '$500 insurance included',
              '24/7 phone & email support',
              'Customs brokerage',
            ],
            cta: 'Get a quote',
            badge: 'Popular',
            featured: true,
          },
          {
            name: 'Express',
            tagline: 'When every hour counts',
            price: '$8.90',
            unit: '/kg air',
            features: [
              'Next-flight-out (NFO)',
              'Real-time GPS + EDI',
              '$2,500 insurance included',
              'Dedicated account manager',
              'Charter options available',
            ],
            cta: 'Contact sales',
          },
        ]

    const testimonialsHeading =
      props.testimonials?.heading ?? 'Trusted by shippers worldwide'
    const testimonialsDesc =
      props.testimonials?.description ??
      'What our customers say about working with SwiftFreight.'
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "SwiftFreight has been our logistics partner for 6 years. Their real-time tracking and proactive communication have eliminated the 'where's my shipment?' anxiety completely.",
            name: 'Sarah Chen',
            role: 'VP Operations, TechFlow Inc.',
            avatarAlt:
              'Professional headshot of a smiling businesswoman in a navy blazer',
          },
          {
            quote:
              "When we needed to move 40 containers from Ningbo to Rotterdam in 48 hours, SwiftFreight chartered a vessel. That level of responsiveness is why we've tripled our volume with them.",
            name: 'Marcus Weber',
            role: 'Director of Logistics, Globex Trading',
            avatarAlt:
              'Professional headshot of a middle-aged businessman with glasses and a confident smile',
          },
          {
            quote:
              "Their customs brokerage team saved us from a $15,000 duty miscalculation. They caught the HS code error before the shipment left Shanghai. That's partnership.",
            name: 'Elena Rodriguez',
            role: 'Import Manager, Acme Corporation',
            avatarAlt:
              'Professional headshot of a young woman with dark hair wearing a white blouse',
          },
        ]

    const faqHeading = props.faq?.heading ?? 'Frequently asked questions'
    const faqDesc =
      props.faq?.description ??
      'Everything you need to know about shipping with SwiftFreight.'
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            q: 'How do I track my shipment?',
            a: "Enter your tracking number in the search bar at the top of our website or in our mobile app. You'll see real-time location updates, estimated delivery time, and any customs clearance milestones. You can also opt in for SMS or email notifications at every stage.",
          },
          {
            q: 'What are your transit times?',
            a: 'Air freight typically takes 1-5 days depending on the route. Ocean freight ranges from 15-45 days. Ground transport within North America is 1-7 days, and within Europe 1-5 days. Express/next-flight-out options are available for urgent shipments.',
          },
          {
            q: 'Do you handle customs clearance?',
            a: 'Yes. Our licensed customs brokers operate in 38 countries. We handle documentation, duty calculation, and ensure compliance with local regulations. Customs brokerage is included in Priority and Express tiers, and available as an add-on for Standard shipments.',
          },
          {
            q: 'What cargo types do you accept?',
            a: 'We handle general cargo, electronics, automotive parts, fashion/apparel, pharmaceuticals (GDP-compliant), perishables (temperature-controlled), and project cargo. Restricted items include hazardous materials without proper classification, weapons, and illegal goods per IATA/IMDG regulations.',
          },
          {
            q: 'Is my shipment insured?',
            a: 'All shipments include basic liability coverage. Standard tier includes $100, Priority includes $500, and Express includes $2,500. Additional cargo insurance is available up to the full declared value. Claims are processed within 14 business days with proper documentation.',
          },
          {
            q: 'How do I get a quote?',
            a: "Use our online quote tool by entering origin, destination, dimensions, weight, and cargo type. You'll receive instant rates for all service tiers. For complex shipments (project cargo, charters, or oversized freight), contact our sales team directly at sales@swiftfreight.com or call +1 (555) 234-5678.",
          },
        ]

    const ctaHeading = props.cta?.heading ?? 'Ready to ship smarter?'
    const ctaDesc =
      props.cta?.description ??
      'Join 3,400+ companies that trust SwiftFreight to move their cargo. Get your first quote in under 3 minutes.'
    const ctaPrimary = props.cta?.primary ?? 'Get instant quote'
    const ctaSecondary = props.cta?.secondary ?? 'Talk to sales'
    const ctaNote =
      props.cta?.note ??
      'No account required for quotes. Volume discounts available for 50+ shipments/month.'

    const footerBlurb =
      props.footer?.blurb ??
      'Global logistics made simple. Air, ocean, and ground freight to 180+ countries with real-time tracking and guaranteed delivery.'
    const footerServicesTitle = props.footer?.servicesTitle ?? 'Services'
    const footerServicesLinks = props.footer?.servicesLinks?.length
      ? props.footer.servicesLinks
      : [
          'Air Freight',
          'Ocean Freight',
          'Ground Transport',
          'Warehousing',
          'Customs Brokerage',
          'Last-Mile Delivery',
        ]
    const footerCompanyTitle = props.footer?.companyTitle ?? 'Company'
    const footerCompanyLinks = props.footer?.companyLinks?.length
      ? props.footer.companyLinks
      : [
          'About Us',
          'Careers',
          'Press',
          'Partners',
          'Sustainability',
          'Security',
        ]
    const footerContactTitle = props.footer?.contactTitle ?? 'Contact'
    const footerEmail = props.footer?.email ?? 'support@swiftfreight.com'
    const footerPhone = props.footer?.phone ?? '+1 (555) 234-5678'
    const footerAddress =
      props.footer?.address ??
      '450 Lexington Ave, Suite 2800, New York, NY 10017'
    const footerCopyright =
      props.footer?.copyright ??
      'SwiftFreight Logistics Inc. All rights reserved.'
    const footerLegalLinks = props.footer?.legalLinks?.length
      ? props.footer.legalLinks
      : ['Privacy Policy', 'Terms of Service', 'Cookie Settings']
    const footerSocials = props.footer?.socials?.length
      ? props.footer.socials
      : ['LinkedIn', 'Twitter', 'Facebook']

    // Brand logo tile — bolt mark on a primary tile (decorative brand asset).
    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          'grid shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground',
          className,
        )}
        aria-hidden="true"
      >
        <svg
          className="size-[60%]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </span>
    )

    const Check = ({ className }: { className?: string }) => (
      <svg
        className={cn('size-5 shrink-0', className)}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M5 13l4 4L19 7" />
      </svg>
    )

    const Star = ({ className }: { className?: string }) => (
      <svg
        className={cn('size-5', className)}
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
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

    // Per-service icons; tints rotate through tokens (never raw palette).
    const serviceIcons: ReactNode[] = [
      // plane / air
      <svg
        key="air"
        className="size-7"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
      </svg>,
      // ocean / info circle
      <svg
        key="ocean"
        className="size-7"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      // truck / ground
      <svg
        key="ground"
        className="size-7"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
        <path d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1" />
      </svg>,
      // warehouse / building
      <svg
        key="warehouse"
        className="size-7"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>,
      // customs / document
      <svg
        key="customs"
        className="size-7"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>,
      // last-mile / location
      <svg
        key="lastmile"
        className="size-7"
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
      </svg>,
    ]
    const iconTints = [
      'bg-primary/10 text-primary',
      'bg-accent text-accent-foreground',
      'bg-secondary text-secondary-foreground',
      'bg-chart-2/15 text-chart-2',
      'bg-chart-4/15 text-chart-4',
      'bg-destructive/10 text-destructive',
    ]

    return (
      <div
        className={cn(
          'min-h-svh bg-background text-foreground antialiased',
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between lg:h-20">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center gap-2"
              >
                <LogoMark className="size-8" />
                <span className="text-xl font-semibold tracking-tight">
                  {brand}
                </span>
              </button>

              <nav className="hidden items-center gap-8 lg:flex">
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
              </nav>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  className="hidden items-center gap-2 text-muted-foreground transition-colors hover:text-foreground sm:flex"
                >
                  <svg
                    className="size-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <span className="text-sm font-medium">Search</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTrackingOpen(true)}
                  className="hidden items-center gap-2 text-muted-foreground transition-colors hover:text-foreground sm:flex"
                >
                  <svg
                    className="size-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span className="text-sm font-medium">Track</span>
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
                          onClick={() => go('Shipments')}
                          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          Shipments
                          <ArrowRight />
                        </button>
                        <button
                          type="button"
                          onClick={() => go('Quotes')}
                          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          Quote Requests
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
                  onClick={() => go(heroPrimary)}
                  className="hidden items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:inline-flex"
                >
                  {heroPrimary}
                </button>
                <button
                  type="button"
                  aria-label="Open menu"
                  aria-expanded={mobileOpen}
                  aria-controls="mobile-menu"
                  onClick={() => setMobileOpen((v: boolean) => !v)}
                  className="p-2 text-muted-foreground transition-colors hover:text-foreground lg:hidden"
                >
                  <svg
                    className="size-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M4 6h16M4 12h16M4 18h16" />
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

        {/* Search Dialog */}
        <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
          <CommandInput placeholder={`Search ${brand} shipments...`} />
          <CommandList className="max-h-[420px]">
            <CommandEmpty>No shipments found.</CommandEmpty>
            <CommandGroup heading="Shipments">
              {safeShipments.map((shipment) => (
                <CommandItem
                  key={shipment.id}
                  value={`${shipment.trackingNumber} ${shipment.origin} ${shipment.destination} ${shipment.service}`}
                  onSelect={() => {
                    setSearchOpen(false)
                    setTrackingOpen(true)
                  }}
                  className="gap-3 py-3"
                >
                  <div className="size-12 overflow-hidden rounded-md bg-muted">
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                      <svg
                        className="size-6"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                        <path d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1" />
                      </svg>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {shipment.trackingNumber}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {shipment.origin} → {shipment.destination}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'rounded-full px-2 py-1 text-xs font-semibold',
                      shipment.status === 'Delivered'
                        ? 'bg-primary/10 text-primary'
                        : shipment.status === 'In Transit'
                          ? 'bg-chart-2/15 text-chart-2'
                          : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {shipment.status}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </CommandDialog>

        <main>
          {/* Hero */}
          <section className="bg-muted/50 py-16 lg:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="space-y-8">
                  <div className="space-y-4">
                    <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                      {headingTop}
                      <br />
                      <span className="text-muted-foreground">
                        {heroHighlight}
                      </span>
                    </h1>
                    <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
                      {heroSub}
                    </p>
                  </div>

                  <form
                    onSubmit={handleTrackSubmit}
                    className="rounded-2xl border border-border bg-card p-6 shadow-sm"
                  >
                    <label
                      htmlFor="logistics-track"
                      className="mb-3 block text-sm font-medium text-card-foreground"
                    >
                      {trackLabel}
                    </label>
                    <div className="flex gap-3">
                      <input
                        id="logistics-track"
                        type="text"
                        placeholder={trackPlaceholder}
                        value={trackingInput}
                        onChange={(e) => setTrackingInput(e.target.value)}
                        className="flex-1 rounded-xl border border-input bg-muted/50 px-4 py-3 text-foreground placeholder:text-muted-foreground transition-all focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
                      />
                      <button
                        type="submit"
                        className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                      >
                        <svg
                          className="size-5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <span>{trackButton}</span>
                      </button>
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">
                      {trackHint}
                    </p>
                  </form>

                  <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                    {heroChips.map((chip) => (
                      <div key={chip} className="flex items-center gap-2">
                        <Check className="text-primary" />
                        <span>{chip}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
                    <Image
                      alt={heroImageAlt}
                      w={800}
                      h={600}
                      className="size-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-6 -left-6 rounded-xl border border-border bg-card p-4 shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
                        <svg
                          className="size-6"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-card-foreground">
                          {heroBadgeValue}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {heroBadgeLabel}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Logos */}
          <section className="border-b border-border py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
                {logosHeading}
              </p>
              <div className="grid grid-cols-2 items-center gap-8 opacity-60 md:grid-cols-3 lg:grid-cols-6">
                {logoItems.map((logo) => (
                  <button
                    key={logo}
                    type="button"
                    onClick={() => go(logo)}
                    className="flex h-12 items-center justify-center"
                  >
                    <span className="text-xl font-bold text-foreground/80">
                      {logo}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="py-16 lg:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-12">
                {statItems.map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="text-4xl font-semibold lg:text-5xl">
                      {s.value}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Services */}
          <section className="bg-muted/50 py-16 lg:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <h2 className="mb-4 text-3xl font-semibold tracking-tight lg:text-4xl">
                  {servicesHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{servicesDesc}</p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {serviceItems.map((item, i) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-border bg-card p-8 transition-shadow hover:shadow-lg"
                  >
                    <div
                      className={cn(
                        'mb-6 grid size-14 place-items-center rounded-xl',
                        iconTints[i % iconTints.length],
                      )}
                    >
                      {serviceIcons[i % serviceIcons.length]}
                    </div>
                    <h3 className="mb-3 text-xl font-semibold text-card-foreground">
                      {item.title}
                    </h3>
                    <p className="mb-4 leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                    <p className="text-sm font-medium text-card-foreground">
                      {item.price}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* How it works */}
          <section className="py-16 lg:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-16 lg:grid-cols-2">
                <div>
                  <h2 className="mb-6 text-3xl font-semibold tracking-tight lg:text-4xl">
                    {stepsHeading}
                  </h2>
                  <p className="mb-12 text-lg text-muted-foreground">
                    {stepsDesc}
                  </p>

                  <div className="space-y-8">
                    {stepItems.map((step, i) => (
                      <div key={step.title} className="flex gap-5">
                        <div className="grid size-10 shrink-0 place-items-center rounded-full bg-primary font-semibold text-primary-foreground">
                          {i + 1}
                        </div>
                        <div>
                          <h3 className="mb-2 text-lg font-semibold">
                            {step.title}
                          </h3>
                          <p className="text-muted-foreground">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-muted">
                    <Image
                      alt={stepsImageAlt}
                      w={800}
                      h={1000}
                      loading="lazy"
                      className="size-full object-cover"
                    />
                  </div>
                  <div className="absolute right-6 top-6 rounded-xl border border-border bg-card p-4 shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="grid size-10 place-items-center rounded-full bg-primary text-primary-foreground">
                        <svg
                          className="size-5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-card-foreground">
                          {stepsBadgeLabel}
                        </p>
                        <p className="text-2xl font-semibold text-card-foreground">
                          {stepsBadgeValue}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Gallery */}
          <section className="bg-muted/50 py-16 lg:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-12 max-w-2xl text-center">
                <h2 className="mb-4 text-3xl font-semibold tracking-tight lg:text-4xl">
                  {galleryHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{galleryDesc}</p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {galleryImages.map((alt) => (
                  <div
                    key={alt}
                    className="aspect-[4/3] overflow-hidden rounded-2xl bg-muted"
                  >
                    <Image
                      alt={alt}
                      w={600}
                      h={450}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="py-16 lg:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <h2 className="mb-4 text-3xl font-semibold tracking-tight lg:text-4xl">
                  {pricingHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{pricingDesc}</p>
              </div>

              <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
                {pricingTiers.map((tier) => {
                  const featured = tier.featured
                  return (
                    <div
                      key={tier.name}
                      className={cn(
                        'relative rounded-2xl p-8',
                        featured
                          ? 'bg-primary text-primary-foreground'
                          : 'border border-border bg-card',
                      )}
                    >
                      {tier.badge ? (
                        <div className="absolute right-6 top-0 -translate-y-1/2 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                          {tier.badge}
                        </div>
                      ) : null}
                      <h3
                        className={cn(
                          'mb-2 text-lg font-semibold',
                          featured
                            ? 'text-primary-foreground'
                            : 'text-card-foreground',
                        )}
                      >
                        {tier.name}
                      </h3>
                      <p
                        className={cn(
                          'mb-6 text-sm',
                          featured
                            ? 'text-primary-foreground/70'
                            : 'text-muted-foreground',
                        )}
                      >
                        {tier.tagline}
                      </p>
                      <div className="mb-6">
                        <span
                          className={cn(
                            'text-4xl font-semibold',
                            featured
                              ? 'text-primary-foreground'
                              : 'text-card-foreground',
                          )}
                        >
                          {tier.price}
                        </span>
                        <span
                          className={cn(
                            featured
                              ? 'text-primary-foreground/70'
                              : 'text-muted-foreground',
                          )}
                        >
                          {tier.unit}
                        </span>
                      </div>
                      <ul
                        className={cn(
                          'mb-8 space-y-3 text-sm',
                          featured
                            ? 'text-primary-foreground/90'
                            : 'text-muted-foreground',
                        )}
                      >
                        {tier.features.map((feature) => (
                          <li key={feature} className="flex items-center gap-2">
                            <Check
                              className={
                                featured
                                  ? 'text-primary-foreground'
                                  : 'text-primary'
                              }
                            />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <button
                        type="button"
                        onClick={() => go(tier.cta)}
                        className={cn(
                          'w-full rounded-xl py-3 font-medium transition-colors',
                          featured
                            ? 'bg-background text-foreground hover:bg-muted'
                            : 'border border-primary text-primary hover:bg-muted/50',
                        )}
                      >
                        {tier.cta}
                      </button>
                    </div>
                  )
                })}
              </div>

              <p className="mt-8 text-center text-sm text-muted-foreground">
                {pricingFootnote}
              </p>
            </div>
          </section>

          {/* Testimonials */}
          <section className="bg-muted/50 py-16 lg:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <h2 className="mb-4 text-3xl font-semibold tracking-tight lg:text-4xl">
                  {testimonialsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {testimonialsDesc}
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {testimonialItems.map((t) => (
                  <div
                    key={t.name}
                    className="rounded-2xl border border-border bg-card p-8"
                  >
                    <div className="mb-4 flex items-center gap-1 text-chart-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} />
                      ))}
                    </div>
                    <p className="mb-6 leading-relaxed text-card-foreground/90">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-4">
                      <Image
                        alt={t.avatarAlt}
                        w={100}
                        h={100}
                        className="size-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold text-card-foreground">
                          {t.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {t.role}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="py-16 lg:py-24">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <div className="mb-12 text-center">
                <h2 className="mb-4 text-3xl font-semibold tracking-tight lg:text-4xl">
                  {faqHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{faqDesc}</p>
              </div>

              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.q}
                    className="group rounded-xl bg-muted/50"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between p-6">
                      <span className="font-semibold">{item.q}</span>
                      <span className="flex size-5 flex-shrink-0 items-center justify-center">
                        <ChevronDown />
                      </span>
                    </summary>
                    <div className="px-6 pb-6 text-muted-foreground">
                      {item.a}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-primary py-16 text-primary-foreground lg:py-24">
            <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2 className="mb-4 text-3xl font-semibold tracking-tight lg:text-4xl">
                {ctaHeading}
              </h2>
              <p className="mx-auto mb-8 max-w-2xl text-lg text-primary-foreground/70">
                {ctaDesc}
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(ctaPrimary)}
                  className="inline-flex items-center rounded-xl bg-background px-8 py-4 font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  {ctaPrimary}
                  <svg
                    className="ml-2 size-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => setQuoteOpen(true)}
                  className="inline-flex items-center rounded-xl border border-primary-foreground/40 px-8 py-4 font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10"
                >
                  {ctaSecondary}
                </button>
              </div>
              <p className="mt-6 text-sm text-primary-foreground/60">
                {ctaNote}
              </p>
            </div>
          </section>
        </main>

        {/* Shipment Tracking Drawer */}
        <Sheet open={trackingOpen} onOpenChange={setTrackingOpen}>
          <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
            <SheetHeader className="border-b border-border p-6">
              <SheetTitle className="text-xl">Track Shipments</SheetTitle>
              <SheetDescription>
                {safeShipments.length > 0
                  ? `${safeShipments.length} shipment${safeShipments.length === 1 ? '' : 's'} tracked.`
                  : 'No shipments tracked yet.'}
              </SheetDescription>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {safeShipments.length ? (
                <div className="space-y-5">
                  {safeShipments.map((shipment) => (
                    <div
                      key={shipment.id}
                      className="grid grid-cols-[72px_1fr] gap-4 border-b border-border pb-5 last:border-0"
                    >
                      <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                          <svg
                            className="size-8"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                            <path d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1" />
                          </svg>
                        </div>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                              {shipment.service}
                            </p>
                            <h3 className="line-clamp-2 text-sm font-semibold text-card-foreground">
                              {shipment.trackingNumber}
                            </h3>
                          </div>
                          <span
                            className={cn(
                              'rounded-full px-2 py-1 text-xs font-semibold',
                              shipment.status === 'Delivered'
                                ? 'bg-primary/10 text-primary'
                                : shipment.status === 'In Transit'
                                  ? 'bg-chart-2/15 text-chart-2'
                                  : 'bg-muted text-muted-foreground',
                            )}
                          >
                            {shipment.status}
                          </span>
                        </div>
                        <div className="mt-4 space-y-1 text-xs text-muted-foreground">
                          <p>From: {shipment.origin}</p>
                          <p>To: {shipment.destination}</p>
                          <p>Est. Delivery: {shipment.estimatedDelivery}</p>
                          <p>Weight: {shipment.weight}</p>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() =>
                              void updateShipmentStatus(
                                shipment.trackingNumber,
                                shipment.status === 'In Transit'
                                  ? 'Delivered'
                                  : 'In Transit',
                              )
                            }
                            className="text-xs font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                          >
                            Update Status
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              void removeShipment(shipment.trackingNumber)
                            }
                            className="text-xs font-semibold text-muted-foreground underline-offset-4 hover:text-destructive hover:underline"
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
                    No shipments tracked
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Enter a tracking number above to start tracking shipments.
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
                  Close
                </Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        {/* Quote Request Drawer */}
        <Sheet open={quoteOpen} onOpenChange={setQuoteOpen}>
          <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
            <SheetHeader className="border-b border-border p-6">
              <SheetTitle className="text-xl">Quote Requests</SheetTitle>
              <SheetDescription>
                {safeQuoteRequests.length > 0
                  ? `${safeQuoteRequests.length} quote request${safeQuoteRequests.length === 1 ? '' : 's'} submitted.`
                  : 'No quote requests yet.'}
              </SheetDescription>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <form onSubmit={handleQuoteSubmit} className="mb-6 space-y-4">
                <div>
                  <label
                    htmlFor="quote-origin"
                    className="mb-2 block text-sm font-medium text-card-foreground"
                  >
                    Origin
                  </label>
                  <input
                    id="quote-origin"
                    type="text"
                    placeholder="e.g., Shenzhen"
                    value={quoteForm.origin}
                    onChange={(e) =>
                      setQuoteForm({ ...quoteForm, origin: e.target.value })
                    }
                    className="w-full rounded-xl border border-input bg-muted/50 px-4 py-3 text-foreground placeholder:text-muted-foreground transition-all focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="quote-destination"
                    className="mb-2 block text-sm font-medium text-card-foreground"
                  >
                    Destination
                  </label>
                  <input
                    id="quote-destination"
                    type="text"
                    placeholder="e.g., Los Angeles"
                    value={quoteForm.destination}
                    onChange={(e) =>
                      setQuoteForm({
                        ...quoteForm,
                        destination: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-input bg-muted/50 px-4 py-3 text-foreground placeholder:text-muted-foreground transition-all focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="quote-weight"
                    className="mb-2 block text-sm font-medium text-card-foreground"
                  >
                    Weight
                  </label>
                  <input
                    id="quote-weight"
                    type="text"
                    placeholder="e.g., 500kg"
                    value={quoteForm.weight}
                    onChange={(e) =>
                      setQuoteForm({ ...quoteForm, weight: e.target.value })
                    }
                    className="w-full rounded-xl border border-input bg-muted/50 px-4 py-3 text-foreground placeholder:text-muted-foreground transition-all focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="quote-service"
                    className="mb-2 block text-sm font-medium text-card-foreground"
                  >
                    Service
                  </label>
                  <select
                    id="quote-service"
                    value={quoteForm.service}
                    onChange={(e) =>
                      setQuoteForm({ ...quoteForm, service: e.target.value })
                    }
                    className="w-full rounded-xl border border-input bg-muted/50 px-4 py-3 text-foreground transition-all focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
                  >
                    <option value="Air Freight">Air Freight</option>
                    <option value="Ocean Freight">Ocean Freight</option>
                    <option value="Ground Transport">Ground Transport</option>
                    <option value="Warehousing">Warehousing</option>
                    <option value="Customs Brokerage">Customs Brokerage</option>
                    <option value="Last-Mile Delivery">
                      Last-Mile Delivery
                    </option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="quote-email"
                    className="mb-2 block text-sm font-medium text-card-foreground"
                  >
                    Email
                  </label>
                  <input
                    id="quote-email"
                    type="email"
                    placeholder="your@email.com"
                    value={quoteForm.email}
                    onChange={(e) =>
                      setQuoteForm({ ...quoteForm, email: e.target.value })
                    }
                    className="w-full rounded-xl border border-input bg-muted/50 px-4 py-3 text-foreground placeholder:text-muted-foreground transition-all focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
                    required
                  />
                </div>
                <Button type="submit" className="w-full rounded-full">
                  Submit Quote Request
                </Button>
              </form>

              {safeQuoteRequests.length > 0 && (
                <div className="space-y-5">
                  <div className="border-t border-border pt-5">
                    <h3 className="mb-4 text-sm font-semibold text-foreground">
                      Recent Requests
                    </h3>
                  </div>
                  {safeQuoteRequests.map((request) => (
                    <div
                      key={request.id}
                      className="rounded-xl border border-border bg-card p-4"
                    >
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            {request.service}
                          </p>
                          <h3 className="text-sm font-semibold text-card-foreground">
                            {request.origin} → {request.destination}
                          </h3>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {request.weight}
                        </span>
                      </div>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <p>Email: {request.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <SheetFooter className="border-t border-border p-6">
              {safeQuoteRequests.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full"
                  onClick={() => void clearQuoteRequests()}
                >
                  Clear All
                </Button>
              )}
              <SheetClose asChild>
                <Button
                  type="button"
                  variant="secondary"
                  className="rounded-full"
                >
                  Close
                </Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        {/* Footer */}
        <footer className="border-t border-border py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-12 md:grid-cols-2 lg:grid-cols-4">
              <div className="lg:col-span-1">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 flex items-center gap-2"
                >
                  <LogoMark className="size-8" />
                  <span className="text-xl font-semibold tracking-tight">
                    {brand}
                  </span>
                </button>
                <p className="mb-4 text-sm text-muted-foreground">
                  {footerBlurb}
                </p>
                <div className="flex items-center gap-4">
                  {footerSocials.map((social) => (
                    <button
                      key={social}
                      type="button"
                      aria-label={social}
                      onClick={() => go(social)}
                      className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {social}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="mb-4 font-semibold">{footerServicesTitle}</h4>
                <ul className="space-y-3 text-sm">
                  {footerServicesLinks.map((link) => (
                    <li key={link}>
                      <button
                        type="button"
                        onClick={() => go(link)}
                        className="text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="mb-4 font-semibold">{footerCompanyTitle}</h4>
                <ul className="space-y-3 text-sm">
                  {footerCompanyLinks.map((link) => (
                    <li key={link}>
                      <button
                        type="button"
                        onClick={() => go(link)}
                        className="text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="mb-4 font-semibold">{footerContactTitle}</h4>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <svg
                      className="mt-0.5 size-5 shrink-0 text-muted-foreground"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <button
                      type="button"
                      onClick={() => go(footerEmail)}
                      className="text-left transition-colors hover:text-foreground"
                    >
                      {footerEmail}
                    </button>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg
                      className="mt-0.5 size-5 shrink-0 text-muted-foreground"
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
                    <button
                      type="button"
                      onClick={() => go(footerPhone)}
                      className="text-left transition-colors hover:text-foreground"
                    >
                      {footerPhone}
                    </button>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg
                      className="mt-0.5 size-5 shrink-0 text-muted-foreground"
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
                    <span>{footerAddress}</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} {footerCopyright}
              </p>
              <div className="flex items-center gap-6 text-sm">
                {footerLegalLinks.map((link) => (
                  <button
                    key={link}
                    type="button"
                    onClick={() => go(link)}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link}
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
