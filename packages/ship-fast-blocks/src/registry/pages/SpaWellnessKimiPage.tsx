import { useState, type ReactNode } from "react"
import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * SpaWellnessKimiPage — a complete, self-contained luxury spa & wellness-retreat
 * LANDING page. A faithful Tailwind v4 port of a Kimi-generated "Serenity
 * Springs" design: a calm, editorial, sand-and-sage aesthetic with serif
 * display headings, generous whitespace, full-bleed photographic hero, soft
 * rounded cards and a tranquil natural mood.
 *
 * Sections, in order: a fixed translucent navbar with a circular brand mark;
 * a full-bleed hero with an overlaid photo, eyebrow, serif headline, dual CTAs
 * and a rating/awards trust strip; a "recognized excellence" certification
 * logo row; a 6-up treatments grid (photo + duration/price + bullet inclusions);
 * a 4-step "wellness journey" timeline; a dark masonry-style gallery of
 * sanctuary spaces; a 3-tier wellness-packages pricing block (middle tier
 * featured); a 4-up stats band; a 3-up guest-testimonials grid with star
 * ratings and avatars; a 6-item FAQ accordion-style list; a split booking CTA
 * with contact details and a real reservation form; and a 4-column dark footer
 * with social icons and link columns.
 *
 * The block owns ALL layout, spacing, type hierarchy and tokenized color.
 * Every nav item / CTA / link / social / form-submit routes through
 * `useNavigate` (never a dead "#"). All imagery uses the alt-driven <Image>
 * component (never a raw src). Callers supply ONLY content data; rich defaults
 * from the source copy make it render great with no props at all.
 */
export const SpaWellnessKimiPage = defineComponent({
  name: "SpaWellnessKimiPage",
  description:
    "Complete luxury spa, wellness-retreat & holistic-healing LANDING page with a calm, editorial sand-and-sage aesthetic: serif display headings, generous whitespace, a full-bleed photographic hero with overlay, and soft rounded cards. Includes a fixed translucent navbar with a circular brand mark, a hero (eyebrow + serif headline + dual CTAs + rating/awards trust strip), a 'recognized excellence' certification logo row, a 6-up treatments/services grid (photo + duration & price + inclusion bullets), a 4-step wellness-journey timeline, a dark gallery of sanctuary spaces, a 3-tier wellness-packages pricing block with a featured middle tier, a 4-up stats band, a 3-up guest-testimonials grid with star ratings and avatars, a 6-item FAQ list, a split booking CTA with phone/email/address contact details plus a real reservation form (name, email, phone, date, guests, package, requests), and a dark 4-column footer with social icons. Use as the ROOT/home page for a spa, day spa, wellness retreat, massage studio, sauna/bathhouse, med-spa, holistic healing center, yoga or meditation sanctuary, or any serene beauty/relaxation/self-care business wanting a premium, tranquil, conversion-focused site with treatment menu, packages, booking and social proof. Supply content only — brand, nav, hero, certifications, treatments, journey, gallery, packages, stats, testimonials, faq, booking, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand / retreat name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content. */
    hero: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        bookCta: z.string().optional(),
        imageAlt: z.string().optional(),
        trust: z.array(z.string()).optional(),
      })
      .optional(),
    /** "Recognized excellence" certification logo row. */
    certifications: z
      .object({
        heading: z.string().optional(),
        items: z.array(z.string()).optional(),
      })
      .optional(),
    /** Treatments / signature offerings grid. */
    treatments: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        cta: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              meta: z.string(),
              description: z.string(),
              features: z.array(z.string()),
              imageAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Wellness-journey 4-step timeline. */
    journey: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        steps: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Dark gallery of sanctuary spaces. */
    gallery: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z.array(z.string()).optional(),
      })
      .optional(),
    /** Wellness-packages pricing block. */
    packages: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        note: z.string().optional(),
        items: z
          .array(
            z.object({
              name: z.string(),
              tagline: z.string(),
              price: z.string(),
              unit: z.string(),
              features: z.array(z.string()),
              cta: z.string(),
              featured: z.boolean().optional(),
              badge: z.string().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Stats band. */
    stats: z
      .object({
        items: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** Guest testimonials grid. */
    testimonials: z
      .object({
        eyebrow: z.string().optional(),
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
    /** FAQ list. */
    faq: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ q: z.string(), a: z.string() }))
          .optional(),
      })
      .optional(),
    /** Booking CTA + reservation form. */
    booking: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        address: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        formHeading: z.string().optional(),
        submit: z.string().optional(),
        formNote: z.string().optional(),
        guestOptions: z.array(z.string()).optional(),
        packageOptions: z.array(z.string()).optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        about: z.string().optional(),
        columns: z
          .array(
            z.object({ title: z.string(), links: z.array(z.string()) }),
          )
          .optional(),
        contact: z.array(z.string()).optional(),
        copyright: z.string().optional(),
        legal: z.array(z.string()).optional(),
        social: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const brand = props.brand ?? "Serenity Springs"
    const nav = props.nav?.length
      ? props.nav
      : ["Treatments", "Gallery", "Packages", "Reviews", "FAQ"]

    const heroEyebrow = props.hero?.eyebrow ?? "Est. 2008 · Napa Valley"
    const heroHeading =
      props.hero?.heading ?? "Where Mind, Body & Spirit Find Harmony"
    const heroSub =
      props.hero?.subheading ??
      "Escape to Serenity Springs, an award-winning wellness sanctuary offering transformative treatments, ancient healing traditions, and modern therapeutic techniques in a pristine natural setting."
    const heroPrimary = props.hero?.primaryCta ?? "Reserve Your Retreat"
    const heroSecondary = props.hero?.secondaryCta ?? "Explore Treatments"
    const heroBook = props.hero?.bookCta ?? "Book Now"
    const heroImageAlt =
      props.hero?.imageAlt ??
      "Serene spa interior with candlelight reflecting on water basin surrounded by smooth river stones"
    const heroTrust = props.hero?.trust?.length
      ? props.hero.trust
      : ["4.9 Rating", "Spa Awards 2024 Winner"]

    const certHeading =
      props.certifications?.heading ?? "Recognized Excellence"
    const certItems = props.certifications?.items?.length
      ? props.certifications.items
      : [
          "Forbes Travel Guide",
          "AAA Five Diamond",
          "Conde Nast Traveler",
          "SpaFinder Wellness",
        ]

    const treatEyebrow =
      props.treatments?.eyebrow ?? "Our Signature Offerings"
    const treatHeading =
      props.treatments?.heading ?? "Curated Treatments for Complete Renewal"
    const treatDesc =
      props.treatments?.description ??
      "Each therapy is designed by our master practitioners, combining time-honored traditions with contemporary wellness science."
    const treatCta = props.treatments?.cta ?? "View Full Treatment Menu"
    const treatItems = props.treatments?.items?.length
      ? props.treatments.items
      : [
          {
            title: "Hot Stone Therapy",
            meta: "90 min · $295",
            description:
              "Warm basalt stones melt away tension as our therapists use ancient techniques to restore energy flow and deep muscle relief.",
            features: [
              "Volcanic basalt stones",
              "Aromatherapy oils included",
            ],
            imageAlt:
              "Hot stone massage therapy with smooth black basalt stones arranged on a client's back in warm candlelight",
          },
          {
            title: "Honey & Gold Facial",
            meta: "75 min · $245",
            description:
              "Luxurious Manuka honey combined with 24k gold-infused serums brighten, hydrate, and restore youthful radiance.",
            features: [
              "Organic Manuka honey UMF 20+",
              "Collagen-boosting treatment",
            ],
            imageAlt:
              "Luxury facial treatment with golden honey mask being applied using natural brush tools",
          },
          {
            title: "Deep Tissue Renewal",
            meta: "60 min · $195",
            description:
              "Intensive therapeutic massage targeting chronic tension, sports recovery, and postural alignment with custom pressure.",
            features: [
              "Therapeutic-grade essential oils",
              "Post-treatment stretching guide",
            ],
            imageAlt:
              "Therapeutic deep tissue massage in progress on a spa treatment table with white linens",
          },
          {
            title: "Guided Meditation",
            meta: "45 min · $125",
            description:
              "Personalized mindfulness sessions in our Zen garden, combining breathwork, visualization, and sound healing for mental clarity.",
            features: ["Tibetan singing bowls", "Take-home meditation guide"],
            imageAlt:
              "Zen meditation garden with raked sand patterns and meditation cushion in bamboo grove",
          },
          {
            title: "Halotherapy Sanctuary",
            meta: "60 min · $165",
            description:
              "Breathe easier in our Himalayan salt cave. Micro-particles cleanse respiratory passages and skin while you recline in zero-gravity chairs.",
            features: [
              "100% pure Himalayan salt",
              "Respiratory wellness focus",
            ],
            imageAlt:
              "Himalayan salt room with pink salt bricks glowing warmly and comfortable lounge seating",
          },
          {
            title: "Herbal Detox Wrap",
            meta: "90 min · $275",
            description:
              "Full-body treatment using organic seaweed, clay, and essential oils to eliminate toxins, reduce cellulite, and restore skin vitality.",
            features: [
              "Irish moss & kelp extracts",
              "Infrared heat therapy included",
            ],
            imageAlt:
              "Aromatic herbal body wrap with fresh eucalyptus and lavender botanicals on white spa linens",
          },
        ]
    const normalizedTreatItems = treatItems.map((item) => ({
      ...item,
      features:
        Array.isArray(item.features) && item.features.length > 0
          ? item.features
          : ["Personalized consultation", "Expert practitioner care"],
    }))

    const journeyEyebrow = props.journey?.eyebrow ?? "Your Wellness Journey"
    const journeyHeading = props.journey?.heading ?? "From Arrival to Renewal"
    const journeyDesc =
      props.journey?.description ??
      "We've perfected every moment of your experience for seamless tranquility."
    const journeySteps = props.journey?.steps?.length
      ? props.journey.steps
      : [
          {
            title: "Reserve Online",
            description:
              "Book your preferred treatments and arrival time through our seamless booking system. Receive instant confirmation and pre-visit guidance.",
          },
          {
            title: "Arrive & Unwind",
            description:
              "Enjoy complimentary valet parking, herbal welcome tea, and a personalized consultation with your wellness concierge upon arrival.",
          },
          {
            title: "Transform",
            description:
              "Experience your curated treatments in private suites with premium amenities, temperature-controlled environments, and expert therapists.",
          },
          {
            title: "Extend Serenity",
            description:
              "Relax in our tranquility lounge with light refreshments. Depart with personalized wellness recommendations and exclusive product samples.",
          },
        ]

    const galleryEyebrow = props.gallery?.eyebrow ?? "Visual Journey"
    const galleryHeading = props.gallery?.heading ?? "Sanctuary Spaces"
    const galleryDesc =
      props.gallery?.description ??
      "Experience the environments crafted for your complete restoration."
    const galleryItems = props.gallery?.items?.length
      ? props.gallery.items
      : [
          "Luxury spa treatment room with massage table draped in white linens and soft natural lighting",
          "Infinity pool overlooking vineyard hills with teak lounge chairs and white umbrellas at golden hour",
          "Relaxation lounge with comfortable daybeds, sheer curtains, and calming water feature",
          "Private outdoor soaking tub surrounded by bamboo and tropical plants for open-air bathing",
          "Steam room interior with marble benches and soft ambient lighting creating a misty atmosphere",
          "Massage therapy in progress with warm towels and essential oil diffusers creating aromatherapy ambiance",
          "Spa product display with artisanal soaps, botanical oils, and natural skincare arranged on marble",
          "Yoga pavilion with wooden floors overlooking lush gardens for morning wellness classes",
          "Reception area with living plant wall, natural wood accents, and welcoming seating area",
        ]

    const pkgEyebrow = props.packages?.eyebrow ?? "Wellness Packages"
    const pkgHeading = props.packages?.heading ?? "Curated Experiences"
    const pkgDesc =
      props.packages?.description ??
      "Choose the journey that speaks to your wellness goals. All packages include full-day facility access."
    const pkgNote =
      props.packages?.note ??
      "All packages include complimentary robe, slippers, and locker. Gratuity not included. 24-hour cancellation policy applies."
    const pkgItems = props.packages?.items?.length
      ? props.packages.items
      : [
          {
            name: "Essential Escape",
            tagline: "Half-day renewal",
            price: "$395",
            unit: "/person",
            features: [
              "60-minute Swedish massage",
              "45-minute express facial",
              "Sauna & steam access (4 hours)",
              "Organic light lunch",
              "Wellness elixir tasting",
            ],
            cta: "Book Essential Escape",
          },
          {
            name: "Signature Retreat",
            tagline: "Full-day transformation",
            price: "$795",
            unit: "/person",
            features: [
              "90-minute hot stone massage",
              "75-minute honey & gold facial",
              "60-minute halotherapy session",
              "Private meditation session",
              "Gourmet wellness lunch & wine",
              "Take-home product gift set ($150 value)",
            ],
            cta: "Book Signature Retreat",
            featured: true,
            badge: "Most Popular",
          },
          {
            name: "Ultimate Sanctuary",
            tagline: "Two-day immersion",
            price: "$1,595",
            unit: "/person",
            features: [
              "Everything in Signature Retreat",
              "90-minute herbal detox wrap",
              "Private yoga instruction",
              "Overnight suite accommodation",
              "Champagne breakfast in bed",
              "Personalized wellness roadmap",
            ],
            cta: "Book Ultimate Sanctuary",
          },
        ]

    const statsItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "16", label: "Years of Excellence" },
          { value: "50K+", label: "Treatments Delivered" },
          { value: "28", label: "Expert Therapists" },
          { value: "4.9", label: "Average Rating" },
        ]

    const tEyebrow = props.testimonials?.eyebrow ?? "Guest Stories"
    const tHeading = props.testimonials?.heading ?? "Words of Tranquility"
    const tDesc =
      props.testimonials?.description ??
      "Hear from those who have experienced the Serenity Springs difference."
    const tItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "The Signature Retreat was absolutely transformative. From the moment I arrived, every detail was attended to. The hot stone massage melted years of tension, and the facial left my skin glowing for weeks. This is now my annual pilgrimage.",
            name: "Eleanor Whitfield",
            role: "Marketing Director, San Francisco",
            avatarAlt:
              "Professional headshot of a smiling woman with shoulder-length brown hair and warm expression",
          },
          {
            quote:
              "As a physician, I'm particular about wellness practices. The halotherapy sessions here significantly improved my respiratory issues. The medical-grade approach combined with genuine hospitality makes Serenity Springs truly exceptional.",
            name: "Dr. Marcus Chen",
            role: "Pulmonologist, Palo Alto",
            avatarAlt:
              "Professional headshot of a middle-aged man with glasses and friendly confident expression",
          },
          {
            quote:
              "I surprised my wife with the Ultimate Sanctuary package for our anniversary. Two days of pure bliss. The private yoga instruction and personalized wellness roadmap were unexpected highlights. We're already planning our return.",
            name: "James Morrison",
            role: "Tech Executive, Menlo Park",
            avatarAlt:
              "Professional headshot of a smiling man with short dark hair and business casual attire",
          },
        ]

    const faqEyebrow = props.faq?.eyebrow ?? "Common Questions"
    const faqHeading = props.faq?.heading ?? "Planning Your Visit"
    const faqDesc =
      props.faq?.description ??
      "Everything you need to know before your wellness journey begins."
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            q: "What should I bring to my appointment?",
            a: "We provide everything you need: plush robes, organic cotton slippers, premium skincare products, and hair care amenities. Simply arrive with yourself—we'll handle the rest. If you have specific skincare sensitivities, you're welcome to bring your own products.",
          },
          {
            q: "How early should I arrive before my treatment?",
            a: "We recommend arriving 30 minutes prior to your first appointment to complete your wellness consultation, change into your robe, and enjoy our tranquil relaxation lounge with complimentary herbal tea.",
          },
          {
            q: "What is your cancellation policy?",
            a: "We require 24 hours notice for cancellations or rescheduling. Cancellations within 24 hours may be subject to a 50% charge. No-shows will be charged the full treatment amount.",
          },
          {
            q: "Are gratuities included in package prices?",
            a: "Gratuities are not included. While never expected, if you wish to recognize exceptional service, our staff graciously accepts gratuities. A 20% gratuity is customary for exceptional service.",
          },
          {
            q: "Do you accommodate special dietary needs?",
            a: "Absolutely. Our culinary team prepares organic, locally-sourced meals that accommodate vegan, vegetarian, gluten-free, dairy-free, and allergy-specific requirements. Please inform us of any needs when booking.",
          },
          {
            q: "Is there a minimum age requirement?",
            a: "Our spa environment is designed for adults 18 and older. We offer select teen treatments (ages 14-17) when accompanied by a parent or guardian. Please inquire about our Teen Wellness offerings.",
          },
        ]

    const bookEyebrow = props.booking?.eyebrow ?? "Begin Your Journey"
    const bookHeading =
      props.booking?.heading ?? "Reserve Your Sanctuary Experience"
    const bookDesc =
      props.booking?.description ??
      "Transformative wellness awaits. Our concierge team is ready to curate your perfect retreat. Book online instantly or contact us for personalized package recommendations."
    const bookPhone = props.booking?.phone ?? "(707) 555-Serenity (555-737-3689)"
    const bookEmail =
      props.booking?.email ?? "reservations@serenitysprings.com"
    const bookAddress =
      props.booking?.address ??
      "1425 Spring Mountain Road, St. Helena, CA 94574"
    const bookPrimary = props.booking?.primaryCta ?? "Book Online Now"
    const bookSecondary = props.booking?.secondaryCta ?? "Request Consultation"
    const bookFormHeading = props.booking?.formHeading ?? "Quick Reservation"
    const bookSubmit = props.booking?.submit ?? "Request Reservation"
    const bookFormNote =
      props.booking?.formNote ??
      "Our concierge will confirm availability within 2 hours. No payment required to reserve."
    const guestOptions = props.booking?.guestOptions?.length
      ? props.booking.guestOptions
      : ["1 Guest", "2 Guests", "3 Guests", "4+ Guests"]
    const packageOptions = props.booking?.packageOptions?.length
      ? props.booking.packageOptions
      : [
          "Select a package",
          "Essential Escape - $395",
          "Signature Retreat - $795",
          "Ultimate Sanctuary - $1,595",
          "Custom Treatment Menu",
        ]

    const footerAbout =
      props.footer?.about ??
      "A sanctuary of wellness nestled in the heart of Napa Valley, offering transformative treatments since 2008."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Explore",
            links: ["Treatments", "Packages", "Gallery", "Reviews", "Gift Cards"],
          },
          {
            title: "Company",
            links: ["Our Story", "Careers", "Press", "Sustainability", "FAQ"],
          },
        ]
    const footerContact = props.footer?.contact?.length
      ? props.footer.contact
      : [
          "1425 Spring Mountain Road",
          "St. Helena, CA 94574",
          "(707) 555-7373",
          "reservations@serenitysprings.com",
          "Open Daily: 9am - 8pm",
        ]
    const footerCopyright =
      props.footer?.copyright ??
      "Serenity Springs Wellness Retreat. All rights reserved."
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Privacy Policy", "Terms of Service", "Accessibility"]
    const footerSocial = props.footer?.social?.length
      ? props.footer.social
      : ["Instagram", "Facebook", "Pinterest"]

    // Circular brand mark (decorative inline SVG — checkmark inside a disc).
    const BrandMark = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
      </svg>
    )

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

    const Check = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
    )

    const certIcons: ReactNode[] = [
      <svg key="award" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>,
      <svg key="diamond" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
      </svg>,
      <svg key="heart" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>,
      <svg key="cert" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
      </svg>,
    ]

    const socialIcons: Record<string, ReactNode> = {
      Instagram: (
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      ),
      Facebook: (
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      ),
      Pinterest: (
        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z" />
      ),
    }

    const inputCls =
      "w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
    const labelCls = "block text-sm font-medium text-foreground/80 mb-1.5"

    return (
      <div
        className={cn(
          "min-h-svh bg-background text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
          <nav
            className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
            aria-label="Main navigation"
          >
            <div className="flex h-20 items-center justify-between">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center gap-3"
              >
                <BrandMark className="h-8 w-8 text-primary" />
                <span className="font-serif text-xl font-medium text-foreground">
                  {brand}
                </span>
              </button>

              <div className="hidden items-center gap-8 md:flex">
                {nav.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => go(label)}
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => go(heroBook)}
                  className="hidden items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:inline-flex"
                >
                  {heroBook}
                </button>
                <button
                  type="button"
                  aria-label="Open menu"
                  aria-expanded={mobileOpen}
                  aria-controls="mobile-menu"
                  onClick={() => setMobileOpen((v: boolean) => !v)}
                  className="p-2 text-muted-foreground md:hidden"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
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
              </div>
            )}
          </nav>
        </header>

        <main>
          {/* Hero */}
          <section
            className="relative flex min-h-screen items-center pt-20"
            aria-labelledby="hero-heading"
          >
            <div className="absolute inset-0 -z-10">
              <Image
                alt={heroImageAlt}
                w={1920}
                h={1080}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-foreground/30" />
            </div>

            <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
              <div className="max-w-2xl">
                <p className="mb-4 text-sm font-medium uppercase tracking-widest text-background/90">
                  {heroEyebrow}
                </p>
                <h1
                  id="hero-heading"
                  className="mb-6 font-serif text-4xl font-medium leading-tight text-background sm:text-5xl lg:text-6xl"
                >
                  {heroHeading}
                </h1>
                <p className="mb-8 max-w-xl text-lg leading-relaxed text-background/90 sm:text-xl">
                  {heroSub}
                </p>
                <div className="flex flex-wrap gap-4">
                  <button
                    type="button"
                    onClick={() => go(heroPrimary)}
                    className="inline-flex items-center justify-center rounded-full bg-background px-8 py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                  >
                    {heroPrimary}
                  </button>
                  <button
                    type="button"
                    onClick={() => go(heroSecondary)}
                    className="inline-flex items-center justify-center rounded-full border border-background/40 px-8 py-3.5 text-sm font-medium text-background transition-colors hover:bg-background/10"
                  >
                    {heroSecondary}
                  </button>
                </div>
                <div className="mt-12 flex items-center gap-8 text-sm text-background/80">
                  {heroTrust.map((t) => (
                    <div key={t} className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-primary" />
                      <span>{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Certifications */}
          <section
            className="border-b border-border bg-card py-16"
            aria-label="Certifications and awards"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
                {certHeading}
              </p>
              <div className="grid grid-cols-2 items-center justify-items-center gap-8 opacity-70 md:grid-cols-4">
                {certItems.map((name, i) => (
                  <div
                    key={name}
                    className="flex items-center gap-2 font-medium text-muted-foreground"
                  >
                    <span className="h-8 w-8 text-primary [&>svg]:h-8 [&>svg]:w-8">
                      {certIcons[i % certIcons.length]}
                    </span>
                    <span>{name}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Treatments */}
          <section
            className="bg-background py-24"
            aria-labelledby="treatments-heading"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <p className="mb-3 text-sm font-medium uppercase tracking-wider text-primary">
                  {treatEyebrow}
                </p>
                <h2
                  id="treatments-heading"
                  className="mb-4 font-serif text-3xl font-medium text-foreground sm:text-4xl"
                >
                  {treatHeading}
                </h2>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {treatDesc}
                </p>
              </div>

              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {normalizedTreatItems.map((item) => (
                  <article
                    key={item.title}
                    className="group overflow-hidden rounded-xl bg-card shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="aspect-[4/3] overflow-hidden">
                      <Image
                        alt={item.imageAlt}
                        w={800}
                        h={600}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-6">
                      <div className="mb-2 flex items-center justify-between">
                        <h3 className="font-serif text-xl font-medium text-card-foreground">
                          {item.title}
                        </h3>
                        <span className="text-sm font-medium text-primary">
                          {item.meta}
                        </span>
                      </div>
                      <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                        {item.description}
                      </p>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {item.features.map((f) => (
                          <li key={f} className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </article>
                ))}
              </div>

              <div className="mt-12 text-center">
                <button
                  type="button"
                  onClick={() => go(treatCta)}
                  className="inline-flex items-center justify-center rounded-full border-2 border-primary px-8 py-3.5 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  {treatCta}
                </button>
              </div>
            </div>
          </section>

          {/* Journey */}
          <section className="bg-card py-24" aria-labelledby="journey-heading">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <p className="mb-3 text-sm font-medium uppercase tracking-wider text-primary">
                  {journeyEyebrow}
                </p>
                <h2
                  id="journey-heading"
                  className="mb-4 font-serif text-3xl font-medium text-card-foreground sm:text-4xl"
                >
                  {journeyHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{journeyDesc}</p>
              </div>

              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {journeySteps.map((step, i) => (
                  <div key={step.title} className="relative">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <span className="font-serif text-xl font-medium text-primary">
                        {i + 1}
                      </span>
                    </div>
                    <h3 className="mb-2 font-medium text-card-foreground">
                      {step.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Gallery */}
          <section
            className="bg-foreground py-24"
            aria-labelledby="gallery-heading"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <p className="mb-3 text-sm font-medium uppercase tracking-wider text-primary">
                  {galleryEyebrow}
                </p>
                <h2
                  id="gallery-heading"
                  className="mb-4 font-serif text-3xl font-medium text-background sm:text-4xl"
                >
                  {galleryHeading}
                </h2>
                <p className="text-lg text-background/70">{galleryDesc}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {galleryItems.map((alt, i) => (
                  <div
                    key={alt}
                    className={cn(
                      "aspect-square overflow-hidden rounded-lg",
                      i === 1 && "row-span-2",
                      i === 8 && "hidden md:block",
                    )}
                  >
                    <Image
                      alt={alt}
                      w={600}
                      h={600}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Packages */}
          <section
            className="bg-background py-24"
            aria-labelledby="pricing-heading"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <p className="mb-3 text-sm font-medium uppercase tracking-wider text-primary">
                  {pkgEyebrow}
                </p>
                <h2
                  id="pricing-heading"
                  className="mb-4 font-serif text-3xl font-medium text-foreground sm:text-4xl"
                >
                  {pkgHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{pkgDesc}</p>
              </div>

              <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
                {pkgItems.map((pkg) => (
                  <div
                    key={pkg.name}
                    className={cn(
                      "relative flex flex-col rounded-xl p-8",
                      pkg.featured
                        ? "bg-primary shadow-lg"
                        : "bg-card shadow-sm",
                    )}
                  >
                    {pkg.badge ? (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="rounded-full bg-background px-4 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                          {pkg.badge}
                        </span>
                      </div>
                    ) : null}
                    <div className="mb-6">
                      <h3
                        className={cn(
                          "mb-2 font-serif text-2xl font-medium",
                          pkg.featured
                            ? "text-primary-foreground"
                            : "text-card-foreground",
                        )}
                      >
                        {pkg.name}
                      </h3>
                      <p
                        className={cn(
                          "text-sm",
                          pkg.featured
                            ? "text-primary-foreground/80"
                            : "text-muted-foreground",
                        )}
                      >
                        {pkg.tagline}
                      </p>
                    </div>
                    <div className="mb-6">
                      <span
                        className={cn(
                          "font-serif text-4xl font-medium",
                          pkg.featured
                            ? "text-primary-foreground"
                            : "text-card-foreground",
                        )}
                      >
                        {pkg.price}
                      </span>
                      <span
                        className={cn(
                          pkg.featured
                            ? "text-primary-foreground/80"
                            : "text-muted-foreground",
                        )}
                      >
                        {pkg.unit}
                      </span>
                    </div>
                    <ul
                      className={cn(
                        "mb-8 flex-grow space-y-3 text-sm",
                        pkg.featured
                          ? "text-primary-foreground/90"
                          : "text-muted-foreground",
                      )}
                    >
                      {pkg.features.map((f) => (
                        <li key={f} className="flex items-start gap-3">
                          <Check
                            className={cn(
                              "h-5 w-5 flex-shrink-0",
                              pkg.featured
                                ? "text-primary-foreground"
                                : "text-primary",
                            )}
                          />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => go(pkg.cta)}
                      className={cn(
                        "inline-flex w-full items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition-colors",
                        pkg.featured
                          ? "bg-background text-primary hover:bg-muted"
                          : "border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground",
                      )}
                    >
                      {pkg.cta}
                    </button>
                  </div>
                ))}
              </div>

              <p className="mt-8 text-center text-sm text-muted-foreground">
                {pkgNote}
              </p>
            </div>
          </section>

          {/* Stats */}
          <section
            className="border-y border-border bg-card py-16"
            aria-label="Spa statistics"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
                {statsItems.map((s) => (
                  <div key={s.label}>
                    <div className="mb-2 font-serif text-4xl font-medium text-primary sm:text-5xl">
                      {s.value}
                    </div>
                    <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section
            className="bg-background py-24"
            aria-labelledby="testimonials-heading"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <p className="mb-3 text-sm font-medium uppercase tracking-wider text-primary">
                  {tEyebrow}
                </p>
                <h2
                  id="testimonials-heading"
                  className="mb-4 font-serif text-3xl font-medium text-foreground sm:text-4xl"
                >
                  {tHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{tDesc}</p>
              </div>

              <div className="grid gap-8 md:grid-cols-3">
                {tItems.map((t) => (
                  <blockquote
                    key={t.name}
                    className="rounded-xl bg-card p-8 shadow-sm"
                  >
                    <div className="mb-4 flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-chart-4" />
                      ))}
                    </div>
                    <p className="mb-6 leading-relaxed text-muted-foreground">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <footer className="flex items-center gap-4">
                      <Image
                        alt={t.avatarAlt}
                        w={100}
                        h={100}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                      <div>
                        <cite className="font-medium not-italic text-card-foreground">
                          {t.name}
                        </cite>
                        <p className="text-sm text-muted-foreground">{t.role}</p>
                      </div>
                    </footer>
                  </blockquote>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-card py-24" aria-labelledby="faq-heading">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <p className="mb-3 text-sm font-medium uppercase tracking-wider text-primary">
                  {faqEyebrow}
                </p>
                <h2
                  id="faq-heading"
                  className="mb-4 font-serif text-3xl font-medium text-card-foreground sm:text-4xl"
                >
                  {faqHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{faqDesc}</p>
              </div>

              <dl className="space-y-4">
                {faqItems.map((item) => (
                  <div
                    key={item.q}
                    className="rounded-xl border border-border p-6"
                  >
                    <dt className="mb-2 font-medium text-card-foreground">
                      {item.q}
                    </dt>
                    <dd className="leading-relaxed text-muted-foreground">
                      {item.a}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>

          {/* Booking CTA */}
          <section className="bg-primary py-24" aria-labelledby="booking-heading">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-16 lg:grid-cols-2">
                <div>
                  <p className="mb-3 text-sm font-medium uppercase tracking-wider text-primary-foreground/80">
                    {bookEyebrow}
                  </p>
                  <h2
                    id="booking-heading"
                    className="mb-6 font-serif text-3xl font-medium text-primary-foreground sm:text-4xl lg:text-5xl"
                  >
                    {bookHeading}
                  </h2>
                  <p className="mb-8 text-lg leading-relaxed text-primary-foreground/90">
                    {bookDesc}
                  </p>

                  <div className="mb-8 space-y-4">
                    <button
                      type="button"
                      onClick={() => go(bookPhone)}
                      className="flex items-center gap-4 text-primary-foreground/90 transition-colors hover:text-primary-foreground"
                    >
                      <svg
                        className="h-5 w-5 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                      >
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                      <span>{bookPhone}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => go(bookEmail)}
                      className="flex items-center gap-4 text-primary-foreground/90 transition-colors hover:text-primary-foreground"
                    >
                      <svg
                        className="h-5 w-5 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                      >
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                      <span>{bookEmail}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => go(bookAddress)}
                      className="flex items-center gap-4 text-left text-primary-foreground/90 transition-colors hover:text-primary-foreground"
                    >
                      <svg
                        className="h-5 w-5 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>{bookAddress}</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    <button
                      type="button"
                      onClick={() => go(bookPrimary)}
                      className="inline-flex items-center justify-center rounded-full bg-background px-8 py-3.5 text-sm font-semibold text-primary transition-colors hover:bg-muted"
                    >
                      {bookPrimary}
                    </button>
                    <button
                      type="button"
                      onClick={() => go(bookSecondary)}
                      className="inline-flex items-center justify-center rounded-full border-2 border-primary-foreground/40 px-8 py-3.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-foreground/10"
                    >
                      {bookSecondary}
                    </button>
                  </div>
                </div>

                <div className="rounded-xl bg-card p-8 shadow-lg">
                  <h3 className="mb-6 font-serif text-2xl font-medium text-card-foreground">
                    {bookFormHeading}
                  </h3>
                  <form
                    className="space-y-4"
                    onSubmit={(e) => {
                      e.preventDefault()
                      go(bookSubmit)
                    }}
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="spa-first" className={labelCls}>
                          First Name
                        </label>
                        <input
                          id="spa-first"
                          type="text"
                          required
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label htmlFor="spa-last" className={labelCls}>
                          Last Name
                        </label>
                        <input
                          id="spa-last"
                          type="text"
                          required
                          className={inputCls}
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="spa-email" className={labelCls}>
                        Email
                      </label>
                      <input
                        id="spa-email"
                        type="email"
                        required
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label htmlFor="spa-phone" className={labelCls}>
                        Phone
                      </label>
                      <input id="spa-phone" type="tel" className={inputCls} />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="spa-date" className={labelCls}>
                          Preferred Date
                        </label>
                        <input
                          id="spa-date"
                          type="date"
                          required
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label htmlFor="spa-guests" className={labelCls}>
                          Guests
                        </label>
                        <select id="spa-guests" className={inputCls}>
                          {guestOptions.map((g) => (
                            <option key={g} className="bg-background">
                              {g}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="spa-package" className={labelCls}>
                        Interested Package
                      </label>
                      <select id="spa-package" className={inputCls}>
                        {packageOptions.map((p) => (
                          <option key={p} className="bg-background">
                            {p}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="spa-notes" className={labelCls}>
                        Special Requests
                      </label>
                      <textarea
                        id="spa-notes"
                        rows={3}
                        placeholder="Allergies, accessibility needs, occasion celebration..."
                        className={cn(inputCls, "resize-none")}
                      />
                    </div>
                    <button
                      type="submit"
                      className="inline-flex w-full items-center justify-center rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      {bookSubmit}
                    </button>
                    <p className="text-center text-xs text-muted-foreground">
                      {bookFormNote}
                    </p>
                  </form>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-foreground py-16 text-background/70">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid grid-cols-2 gap-8 md:grid-cols-4 lg:gap-12">
              <div className="col-span-2 md:col-span-1">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 flex items-center gap-3"
                >
                  <BrandMark className="h-8 w-8 text-primary" />
                  <span className="font-serif text-xl font-medium text-background">
                    {brand}
                  </span>
                </button>
                <p className="mb-4 text-sm leading-relaxed">{footerAbout}</p>
                <div className="flex gap-4">
                  {footerSocial.map((s) => (
                    <button
                      key={s}
                      type="button"
                      aria-label={s}
                      onClick={() => go(s)}
                      className="text-background/70 transition-colors hover:text-background"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        {socialIcons[s] ?? socialIcons.Instagram}
                      </svg>
                    </button>
                  ))}
                </div>
              </div>

              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h4 className="mb-4 font-medium text-background">
                    {col.title}
                  </h4>
                  <ul className="space-y-2 text-sm">
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
                <h4 className="mb-4 font-medium text-background">Contact</h4>
                <ul className="space-y-2 text-sm">
                  {footerContact.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
              <p className="text-sm">
                © {new Date().getFullYear()} {footerCopyright}
              </p>
              <div className="flex gap-6 text-sm">
                {footerLegal.map((link) => (
                  <button
                    key={link}
                    type="button"
                    onClick={() => go(link)}
                    className="transition-colors hover:text-background"
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
