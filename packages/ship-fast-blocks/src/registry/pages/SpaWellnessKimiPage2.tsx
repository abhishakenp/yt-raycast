import { useState } from "react"
import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * SpaWellnessKimiPage2 — a complete, self-contained luxury spa & wellness-retreat
 * LANDING page. A faithful Tailwind v4 port of a Kimi-generated "Solace Springs"
 * design and a visually DISTINCT alternative / second-style sibling to
 * SpaWellnessKimiPage. Where the sibling is sand-and-sage editorial, THIS variant
 * is a bright sand-surface, teal-accent layout: a full-screen photographic hero
 * with a left-aligned gradient scrim and a two-tone display headline, a text
 * "as seen in" publication wordmark row, a 6-up treatments grid where each card
 * shows duration + price and a "Book Treatment" arrow link, a centered 4-step
 * journey with circular numbers, a dark masonry gallery with one large feature
 * tile, a teal stats band, a 3-tier packages block with a dark featured middle
 * tier, a 5-card two-row testimonials section (3 + 2) with star ratings and
 * avatars, a 6-item native disclosure-style FAQ list, a centered booking card
 * floating over a dark water-texture background, and a dark 4-column footer with
 * social icons and a contact column.
 *
 * The block owns ALL layout, spacing, type hierarchy and tokenized color.
 * Every nav item / CTA / link / social / form-submit routes through `useNavigate`
 * (never a dead "#"). All imagery uses the alt-driven <Image> component (never a
 * raw src). Callers supply ONLY content data; rich defaults from the source copy
 * make it render great with no props at all.
 */
export const SpaWellnessKimiPage2 = defineComponent({
  name: "SpaWellnessKimiPage2",
  description:
    "Complete luxury spa, wellness-retreat & holistic-healing LANDING page in a bright sand-surface, teal-accent style — a visually DISTINCT alternative / second-style sibling to SpaWellnessKimiPage (use this variant when you want a lighter, airier teal look instead of the sand-and-sage editorial original). Includes a fixed translucent navbar with a leaf brand mark, a full-screen photographic hero with a left gradient scrim, a two-tone display headline, dual CTAs and a rating + hours trust strip; an 'as seen in' publication wordmark row; a 6-up treatments/services grid (photo + duration & price + 'Book Treatment' arrow link); a centered 4-step wellness-journey with circular numbers; a dark masonry gallery of sanctuary spaces with a large feature tile; a teal stats band; a 3-tier retreat-packages block with a dark featured 'Most Popular' middle tier and checklist features; a 5-card two-row testimonials section with star ratings and avatars; a 6-item disclosure-style FAQ list; a centered booking card floating over a dark water-texture background with a real reservation form (first/last name, email, phone, service/package select, date, notes); and a dark 4-column footer with social icons, treatment links, experience links and a contact column. Use as the ROOT/home page for a spa, day spa, wellness retreat, massage studio, sauna/salt cave/bathhouse, med-spa, holistic healing center, yoga or meditation sanctuary, or any serene beauty/relaxation/self-care business wanting a premium, tranquil, conversion-focused site with a treatment menu, packages, booking and social proof. Supply content only — brand, nav, hero, logos, treatments, journey, gallery, stats, packages, testimonials, faq, booking, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand / retreat name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content. */
    hero: z
      .object({
        eyebrow: z.string().optional(),
        headingTop: z.string().optional(),
        headingAccent: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        bookCta: z.string().optional(),
        imageAlt: z.string().optional(),
        trust: z.array(z.string()).optional(),
      })
      .optional(),
    /** "As seen in" publication wordmark row. */
    logos: z
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
              duration: z.string(),
              price: z.string(),
              description: z.string(),
              imageAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Wellness-journey 4-step section. */
    journey: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
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
    /** Teal stats band. */
    stats: z
      .object({
        items: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** Retreat-packages pricing block. */
    packages: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              name: z.string(),
              price: z.string(),
              unit: z.string(),
              tagline: z.string(),
              features: z.array(z.string()),
              cta: z.string(),
              featured: z.boolean().optional(),
              badge: z.string().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Guest testimonials section. */
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
    /** FAQ list. */
    faq: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
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
        phoneLabel: z.string().optional(),
        phone: z.string().optional(),
        backgroundAlt: z.string().optional(),
        submit: z.string().optional(),
        formNote: z.string().optional(),
        policyLink: z.string().optional(),
        serviceOptions: z.array(z.string()).optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        about: z.string().optional(),
        columns: z
          .array(z.object({ title: z.string(), links: z.array(z.string()) }))
          .optional(),
        contact: z
          .object({
            address: z.string().optional(),
            phone: z.string().optional(),
            email: z.string().optional(),
            hoursLabel: z.string().optional(),
            hours: z.string().optional(),
          })
          .optional(),
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
    const brand = props.brand ?? "Solace Springs"
    const nav = props.nav?.length
      ? props.nav
      : ["Treatments", "Gallery", "Packages", "Reviews", "FAQ"]

    const heroEyebrow =
      props.hero?.eyebrow ?? "Est. 2008 · Award-Winning Wellness"
    const heroTop = props.hero?.headingTop ?? "Where Serenity"
    const heroAccent = props.hero?.headingAccent ?? "Meets Science"
    const heroSub =
      props.hero?.subheading ??
      "Discover transformative treatments at Solace Springs, Austin's premier wellness sanctuary. From therapeutic massages to rejuvenating facials, experience healing that transcends the ordinary."
    const heroPrimary = props.hero?.primaryCta ?? "Reserve Your Escape"
    const heroSecondary = props.hero?.secondaryCta ?? "Explore Treatments"
    const heroBook = props.hero?.bookCta ?? "Book Now"
    const heroImageAlt =
      props.hero?.imageAlt ??
      "Luxurious spa interior with bamboo decor, natural stone water feature, and soft ambient lighting"
    const heroTrust = props.hero?.trust?.length
      ? props.hero.trust
      : ["4.9/5 (2,847 Reviews)", "Open 7 Days"]

    const logosHeading =
      props.logos?.heading ?? "Recognized by Leading Publications"
    const logoItems = props.logos?.items?.length
      ? props.logos.items
      : ["Forbes", "Vogue", "Conde Nast", "Travel + Leisure", "SpaFinder"]

    const treatEyebrow = props.treatments?.eyebrow ?? "Our Treatments"
    const treatHeading =
      props.treatments?.heading ?? "Healing Rituals Crafted for You"
    const treatDesc =
      props.treatments?.description ??
      "Each treatment combines ancient wisdom with modern techniques, using organic, locally-sourced ingredients for transformative results."
    const treatCta = props.treatments?.cta ?? "Book Treatment"
    const treatItems = props.treatments?.items?.length
      ? props.treatments.items
      : [
          {
            title: "Thermal Stone Therapy",
            duration: "60 / 90 min",
            price: "$145 / $195",
            description:
              "Heated volcanic basalt stones melt tension while cool marble stones reduce inflammation. A deeply grounding experience.",
            imageAlt:
              "Hot stone massage therapy with smooth black basalt stones arranged on a person's back",
          },
          {
            title: "24K Gold Renewal Facial",
            duration: "75 min",
            price: "$225",
            description:
              "Pure gold leaf infusion combined with hyaluronic acid and vitamin C. Brightens, firms, and restores youthful radiance.",
            imageAlt:
              "Luxury facial treatment with gold collagen masks and aromatherapy candles",
          },
          {
            title: "Therapeutic Deep Tissue",
            duration: "60 / 90 min",
            price: "$165 / $245",
            description:
              "Targeted pressure release for chronic tension and sports recovery. Our master therapists customize each session.",
            imageAlt:
              "Deep tissue massage therapist working on shoulder muscles in a candlelit room",
          },
          {
            title: "Aromatherapy Journey",
            duration: "90 min",
            price: "$275",
            description:
              "Personalized essential oil blends from our apothecary. Includes scalp massage, full-body treatment, and guided breathing.",
            imageAlt:
              "Aromatherapy session with essential oil diffusers and fresh lavender sprigs on a wooden table",
          },
          {
            title: "Himalayan Salt Cave",
            duration: "45 min",
            price: "$85",
            description:
              "Halotherapy in our microclimate-controlled salt cave. Breathe easier, reduce inflammation, and boost immunity naturally.",
            imageAlt:
              "Himalayan salt cave therapy room with glowing pink salt walls and comfortable loungers",
          },
          {
            title: "Detox Body Ritual",
            duration: "90 min",
            price: "$295",
            description:
              "Dry brush exfoliation, seaweed body mask, and Vichy shower finale. Complete with lymphatic drainage massage.",
            imageAlt:
              "Body wrap treatment with white clay application on back in a tropical spa setting",
          },
        ]

    const journeyEyebrow = props.journey?.eyebrow ?? "Your Journey"
    const journeyHeading =
      props.journey?.heading ?? "A Seamless Path to Renewal"
    const journeySteps = props.journey?.steps?.length
      ? props.journey.steps
      : [
          {
            title: "Consultation",
            description:
              "Share your wellness goals with our intake specialists. We'll match you with the perfect treatments.",
          },
          {
            title: "Preparation",
            description:
              "Slip into a plush robe and enjoy our relaxation lounge with herbal tea and organic light bites.",
          },
          {
            title: "Treatment",
            description:
              "Experience your personalized ritual in one of our 12 private treatment suites with soundscapes.",
          },
          {
            title: "Integration",
            description:
              "Extend your bliss in our meditation garden or saltwater infinity pool. Take home product recommendations.",
          },
        ]

    const galleryEyebrow = props.gallery?.eyebrow ?? "Our Sanctuary"
    const galleryHeading =
      props.gallery?.heading ?? "Spaces Designed for Tranquility"
    const galleryDesc =
      props.gallery?.description ??
      "12,000 square feet of intentional design where every corner invites stillness and renewal."
    const galleryItems = props.gallery?.items?.length
      ? props.gallery.items
      : [
          "Expansive spa reception area with bamboo flooring, floor-to-ceiling windows, and zen garden views",
          "Private treatment suite with heated massage table, soft linens, and orchid arrangements",
          "Relaxation lounge with white daybeds, flowing curtains, and natural light streaming through skylights",
          "Outdoor saltwater infinity pool surrounded by native Texas landscaping and limestone decking",
          "Steam room interior with cedar benches and aromatherapy misters creating a misty atmosphere",
          "Meditation garden with koi pond, Japanese maple trees, and stone pathways",
          "Luxury couples suite with dual massage tables, candlelit ambiance, and champagne service",
          "Nail care station with modern minimalist design and leather pedicure chairs",
          "Retail boutique with organic skincare products and herbal wellness items on wooden shelves",
        ]

    const statsItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "16", label: "Years of Excellence" },
          { value: "47K+", label: "Guests Served" },
          { value: "12", label: "Treatment Suites" },
          { value: "14", label: "Industry Awards" },
        ]

    const pkgEyebrow = props.packages?.eyebrow ?? "Retreat Packages"
    const pkgHeading =
      props.packages?.heading ?? "Curated Wellness Experiences"
    const pkgDesc =
      props.packages?.description ??
      "Save up to 25% when you book a complete day of renewal. All packages include full-day facility access."
    const pkgItems = props.packages?.items?.length
      ? props.packages.items
      : [
          {
            name: "Half-Day Escape",
            price: "$395",
            unit: "/person",
            tagline:
              "Perfect for a lunch break reset. 3 hours of curated treatments.",
            features: [
              "60-min Custom Massage",
              "Express Facial (30 min)",
              "Salt Cave Session",
              "Pool & Steam Access",
              "Organic Tea & Snacks",
            ],
            cta: "Reserve Package",
          },
          {
            name: "Full Day Renewal",
            price: "$795",
            unit: "/person",
            tagline:
              "Our signature experience. 6 hours of complete transformation.",
            features: [
              "90-min Thermal Stone Therapy",
              "Gold Renewal Facial (75 min)",
              "Detox Body Wrap",
              "Meditation Garden Lunch",
              "Gift Bag ($125 value)",
            ],
            cta: "Reserve Package",
            featured: true,
            badge: "Most Popular",
          },
          {
            name: "Couples Retreat",
            price: "$1,595",
            unit: "/pair",
            tagline:
              "Share the journey. Side-by-side treatments in our couples suite.",
            features: [
              "Couples Stone Massage (90 min)",
              "Dual Facials (60 min each)",
              "Private Pool Cabana (2 hrs)",
              "Champagne & Chocolate",
              "Rose Petal Bath Experience",
            ],
            cta: "Reserve Package",
          },
        ]

    const tEyebrow = props.testimonials?.eyebrow ?? "Guest Stories"
    const tHeading =
      props.testimonials?.heading ?? "Experiences That Transform"
    const tItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "I've visited spas around the world—from Bali to Switzerland—and Solace Springs stands among the very best. The Thermal Stone Therapy released tension I didn't know I was carrying. Truly exceptional.",
            name: "Margaret Chen",
            role: "CEO, Austin Tech Ventures",
            avatarAlt:
              "Professional headshot of a smiling woman with dark hair wearing business attire",
          },
          {
            quote:
              "The Couples Retreat package was our anniversary gift to ourselves. The private cabana, synchronized massages, and rose petal bath created memories we'll cherish forever. Already booked our return.",
            name: "David & Sarah Park",
            role: "Annual Members since 2021",
            avatarAlt:
              "Professional headshot of a man with short brown hair and a warm smile in casual clothing",
          },
          {
            quote:
              "As a professional athlete, my body takes a beating. The Deep Tissue therapy here is unmatched—the therapists understand anatomy in a way that produces real results. My recovery time has improved dramatically.",
            name: "Marcus Thompson",
            role: "Professional Triathlete",
            avatarAlt:
              "Professional headshot of an athletic man with short hair and light beard stubble",
          },
          {
            quote:
              "The Gold Renewal Facial completely transformed my skin. After years of sun damage, I finally have the glow I thought was gone forever. The estheticians here are true skincare scientists.",
            name: "Jennifer Walsh",
            role: "Interior Designer",
            avatarAlt:
              "Professional headshot of a middle-aged woman with blonde hair and warm smile",
          },
          {
            quote:
              "The salt cave has been life-changing for my asthma. I visit twice a month and my pulmonologist is amazed at my improvement. This place heals on multiple levels.",
            name: "Robert Mitchell",
            role: "Retired Professor",
            avatarAlt:
              "Professional headshot of an older gentleman with glasses and gray hair",
          },
        ]

    const faqEyebrow = props.faq?.eyebrow ?? "Common Questions"
    const faqHeading = props.faq?.heading ?? "What Guests Ask"
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            q: "What should I wear to my appointment?",
            a: "Arrive in comfortable clothing. We provide plush robes, slippers, and lockers for your belongings. For massage treatments, you may undress to your comfort level—our therapists are trained in professional draping techniques. For facials, we provide wraps. You may want to bring a swimsuit if you plan to use our saltwater pool.",
          },
          {
            q: "How early should I arrive?",
            a: "We recommend arriving 20-30 minutes before your first treatment to check in, change into your robe, and enjoy our relaxation lounge with complimentary herbal tea and organic snacks. Arriving rushed diminishes the experience—give yourself time to transition into a state of calm.",
          },
          {
            q: "What's your cancellation policy?",
            a: "We require 24 hours notice for cancellations or rescheduling. Cancellations within 24 hours incur a 50% charge. No-shows are charged the full treatment amount. We understand life happens—if you're feeling unwell, please call us and we'll work with you to reschedule without penalty.",
          },
          {
            q: "Do you offer gift certificates?",
            a: "Yes! Gift certificates are available in any denomination and never expire. They can be purchased online, by phone, or in-person and delivered via elegant physical cards or email. Corporate gift programs are also available with volume discounts for orders over $2,500.",
          },
          {
            q: "Are your products organic and cruelty-free?",
            a: "Absolutely. We exclusively use products that are organic, sustainably sourced, and Leaping Bunny certified cruelty-free. Many of our botanical ingredients come from Texas farms within 100 miles. We also maintain a fragrance-free policy in common areas for guests with sensitivities.",
          },
          {
            q: "Is parking available?",
            a: "We offer complimentary valet parking for all guests. Simply pull up to our entrance and our attendants will take care of your vehicle. For guests preferring to self-park, we have a dedicated lot with 80 spaces. Electric vehicle charging stations are available.",
          },
        ]

    const bookEyebrow = props.booking?.eyebrow ?? "Begin Your Journey"
    const bookHeading = props.booking?.heading ?? "Book Your Experience"
    const bookPhoneLabel =
      props.booking?.phoneLabel ?? "Reserve your preferred time or call us at"
    const bookPhone = props.booking?.phone ?? "(512) 555-1234"
    const bookBgAlt =
      props.booking?.backgroundAlt ??
      "Background texture of flowing water ripples creating a calming pattern"
    const bookSubmit = props.booking?.submit ?? "Request Reservation"
    const bookFormNote =
      props.booking?.formNote ??
      "Our concierge team will confirm availability within 2 hours."
    const bookPolicyLink =
      props.booking?.policyLink ?? "View our full cancellation policy"
    const serviceOptions = props.booking?.serviceOptions?.length
      ? props.booking.serviceOptions
      : [
          "Select a service",
          "Thermal Stone Therapy",
          "24K Gold Renewal Facial",
          "Therapeutic Deep Tissue",
          "Aromatherapy Journey",
          "Himalayan Salt Cave",
          "Detox Body Ritual",
          "Half-Day Escape Package",
          "Full Day Renewal Package",
          "Couples Retreat Package",
        ]

    const footerAbout =
      props.footer?.about ??
      "Austin's premier wellness sanctuary since 2008. Where ancient healing meets modern luxury."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Treatments",
            links: [
              "Thermal Stone Therapy",
              "Gold Renewal Facial",
              "Deep Tissue Massage",
              "Aromatherapy Journey",
              "Himalayan Salt Cave",
              "Detox Body Ritual",
            ],
          },
          {
            title: "Experience",
            links: [
              "Our Sanctuary",
              "Retreat Packages",
              "Gift Certificates",
              "Membership",
              "Corporate Wellness",
              "Private Events",
            ],
          },
        ]
    const footerContact = props.footer?.contact ?? {}
    const contactAddress =
      footerContact.address ?? "3400 Wellness Way, Austin, TX 78746"
    const contactPhone = footerContact.phone ?? "(512) 555-1234"
    const contactEmail = footerContact.email ?? "hello@solacesprings.com"
    const contactHoursLabel = footerContact.hoursLabel ?? "Hours"
    const contactHours = footerContact.hours ?? "Mon–Sun: 9am – 9pm"
    const footerCopyright =
      props.footer?.copyright ??
      "Solace Springs Spa & Wellness. All rights reserved."
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Privacy Policy", "Terms of Service", "Accessibility"]
    const footerSocial = props.footer?.social?.length
      ? props.footer.social
      : ["Instagram", "Facebook"]

    // Decorative leaf brand mark (inline SVG).
    const LeafMark = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path d="M12 2C9.5 2 7.5 4 7.5 6.5c0 2 1.5 3.5 3 5 1.5-1.5 3-3 3-5C13.5 4 14.5 2 12 2zm0 18c-3 0-5.5-2.5-5.5-5.5 0-2.5 1.5-4.5 3.5-6 1 1.5 2 3 2 5.5 0 1.5 1 2.5 2.5 2.5s2.5-1 2.5-2.5c0-2.5 1-4 2-5.5 2 1.5 3.5 3.5 3.5 6C17.5 17.5 15 20 12 20z" />
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

    const Arrow = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5l7 7-7 7"
        />
      </svg>
    )

    const socialIcons: Record<string, string> = {
      Instagram:
        "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
      Facebook:
        "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
    }

    const inputCls =
      "w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground transition-all outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
    const labelCls = "block text-sm font-medium text-foreground/80 mb-2"

    return (
      <div
        className={cn(
          "min-h-svh bg-muted text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
          <nav
            className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
            aria-label="Main navigation"
          >
            <div className="flex h-20 items-center justify-between">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center gap-2"
              >
                <LeafMark className="h-8 w-8 text-primary" />
                <span className="font-serif text-xl font-semibold tracking-tight text-foreground">
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
                  className="hidden rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 sm:inline-flex"
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
                    stroke="currentColor"
                    viewBox="0 0 24 24"
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
            className="relative flex min-h-screen items-center overflow-hidden pt-20"
            aria-labelledby="hero-heading"
          >
            <div className="absolute inset-0 z-0">
              <Image
                alt={heroImageAlt}
                w={1920}
                h={1080}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent" />
            </div>
            <div className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
              <div className="max-w-2xl">
                <span className="mb-4 inline-block text-sm font-bold uppercase tracking-widest text-primary">
                  {heroEyebrow}
                </span>
                <h1
                  id="hero-heading"
                  className="mb-6 font-serif text-5xl font-bold leading-tight text-background sm:text-6xl lg:text-7xl"
                >
                  {heroTop}
                  <span className="block text-primary">{heroAccent}</span>
                </h1>
                <p className="mb-8 max-w-xl text-lg leading-relaxed text-background/80 sm:text-xl">
                  {heroSub}
                </p>
                <div className="flex flex-wrap gap-4">
                  <button
                    type="button"
                    onClick={() => go(heroPrimary)}
                    className="inline-flex items-center rounded-full bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground transition-all hover:scale-105 hover:bg-primary/90"
                  >
                    {heroPrimary}
                    <svg
                      className="ml-2 h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => go(heroSecondary)}
                    className="inline-flex items-center rounded-full border border-background/30 bg-background/10 px-8 py-4 text-lg font-semibold text-background backdrop-blur-sm transition-all hover:bg-background/20"
                  >
                    {heroSecondary}
                  </button>
                </div>
                <div className="mt-12 flex items-center gap-8 text-background/80">
                  {heroTrust.map((t) => (
                    <div key={t} className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium">{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Logos */}
          <section
            className="border-b border-border bg-background py-12"
            aria-label="Publications"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
                {logosHeading}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-8 opacity-60 md:gap-16">
                {logoItems.map((name) => (
                  <span
                    key={name}
                    className="font-serif text-xl font-semibold text-muted-foreground"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Treatments */}
          <section
            className="bg-muted py-20 lg:py-28"
            aria-labelledby="treatments-heading"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="text-sm font-bold uppercase tracking-widest text-primary">
                  {treatEyebrow}
                </span>
                <h2
                  id="treatments-heading"
                  className="mb-6 mt-4 font-serif text-4xl font-bold text-foreground sm:text-5xl"
                >
                  {treatHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{treatDesc}</p>
              </div>

              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {treatItems.map((item) => (
                  <article
                    key={item.title}
                    className="group overflow-hidden rounded-2xl bg-card shadow-sm transition-shadow hover:shadow-xl"
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
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-sm font-semibold text-primary">
                          {item.duration}
                        </span>
                        <span className="font-bold text-card-foreground">
                          {item.price}
                        </span>
                      </div>
                      <h3 className="mb-2 font-serif text-xl font-semibold text-card-foreground">
                        {item.title}
                      </h3>
                      <p className="mb-4 text-sm text-muted-foreground">
                        {item.description}
                      </p>
                      <button
                        type="button"
                        onClick={() => go(treatCta)}
                        className="inline-flex items-center text-sm font-semibold text-primary transition-colors hover:text-primary/80"
                      >
                        {treatCta}
                        <Arrow className="ml-1 h-4 w-4" />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Journey */}
          <section
            className="bg-background py-20 lg:py-28"
            aria-labelledby="journey-heading"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="text-sm font-bold uppercase tracking-widest text-primary">
                  {journeyEyebrow}
                </span>
                <h2
                  id="journey-heading"
                  className="mb-6 mt-4 font-serif text-4xl font-bold text-foreground sm:text-5xl"
                >
                  {journeyHeading}
                </h2>
              </div>

              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {journeySteps.map((step, i) => (
                  <div key={step.title} className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                      <span className="text-2xl font-bold text-primary">
                        {i + 1}
                      </span>
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-foreground">
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Gallery */}
          <section
            className="bg-foreground py-20 lg:py-28"
            aria-labelledby="gallery-heading"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="text-sm font-bold uppercase tracking-widest text-primary">
                  {galleryEyebrow}
                </span>
                <h2
                  id="gallery-heading"
                  className="mb-6 mt-4 font-serif text-4xl font-bold text-background sm:text-5xl"
                >
                  {galleryHeading}
                </h2>
                <p className="text-lg text-background/60">{galleryDesc}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {galleryItems.map((alt, i) => (
                  <div
                    key={alt}
                    className={cn(
                      "overflow-hidden rounded-xl",
                      i === 0 && "col-span-2 row-span-2",
                      (i === 3 || i === 6) && "col-span-2",
                    )}
                  >
                    <Image
                      alt={alt}
                      w={i === 0 ? 1200 : 600}
                      h={i === 0 ? 1200 : 600}
                      loading="lazy"
                      className={cn(
                        "w-full object-cover transition-transform duration-500 hover:scale-105",
                        i === 0 ? "h-full" : "h-48 sm:h-64",
                      )}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="bg-primary py-16" aria-label="Spa statistics">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 text-center text-primary-foreground lg:grid-cols-4">
                {statsItems.map((s) => (
                  <div key={s.label}>
                    <div className="font-serif text-4xl font-bold sm:text-5xl">
                      {s.value}
                    </div>
                    <div className="mt-2 text-sm font-medium uppercase tracking-wider text-primary-foreground/80">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Packages */}
          <section
            className="bg-muted py-20 lg:py-28"
            aria-labelledby="pricing-heading"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="text-sm font-bold uppercase tracking-widest text-primary">
                  {pkgEyebrow}
                </span>
                <h2
                  id="pricing-heading"
                  className="mb-6 mt-4 font-serif text-4xl font-bold text-foreground sm:text-5xl"
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
                      "relative flex flex-col rounded-2xl p-8",
                      pkg.featured
                        ? "bg-foreground shadow-xl"
                        : "bg-card shadow-sm",
                    )}
                  >
                    {pkg.badge ? (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-bold uppercase tracking-wider text-primary-foreground">
                        {pkg.badge}
                      </div>
                    ) : null}
                    <div className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">
                      {pkg.name}
                    </div>
                    <div className="mb-4 flex items-baseline gap-1">
                      <span
                        className={cn(
                          "font-serif text-5xl font-bold",
                          pkg.featured ? "text-background" : "text-card-foreground",
                        )}
                      >
                        {pkg.price}
                      </span>
                      <span
                        className={cn(
                          pkg.featured
                            ? "text-background/60"
                            : "text-muted-foreground",
                        )}
                      >
                        {pkg.unit}
                      </span>
                    </div>
                    <p
                      className={cn(
                        "mb-6",
                        pkg.featured
                          ? "text-background/80"
                          : "text-muted-foreground",
                      )}
                    >
                      {pkg.tagline}
                    </p>
                    <ul className="mb-8 flex-grow space-y-3">
                      {pkg.features.map((f) => (
                        <li key={f} className="flex items-start gap-3">
                          <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                          <span
                            className={cn(
                              "text-sm",
                              pkg.featured
                                ? "text-background/80"
                                : "text-muted-foreground",
                            )}
                          >
                            {f}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => go(pkg.cta)}
                      className={cn(
                        "block w-full rounded-xl py-3 text-center font-semibold transition-colors",
                        pkg.featured
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                      )}
                    >
                      {pkg.cta}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section
            className="bg-background py-20 lg:py-28"
            aria-labelledby="testimonials-heading"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="text-sm font-bold uppercase tracking-widest text-primary">
                  {tEyebrow}
                </span>
                <h2
                  id="testimonials-heading"
                  className="mb-6 mt-4 font-serif text-4xl font-bold text-foreground sm:text-5xl"
                >
                  {tHeading}
                </h2>
              </div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {tItems.slice(0, 3).map((t) => (
                  <blockquote key={t.name} className="rounded-2xl bg-muted p-8">
                    <div className="mb-4 flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-chart-4" />
                      ))}
                    </div>
                    <p className="mb-6 leading-relaxed text-foreground/80">
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
                        <cite className="font-semibold not-italic text-foreground">
                          {t.name}
                        </cite>
                        <p className="text-sm text-muted-foreground">{t.role}</p>
                      </div>
                    </footer>
                  </blockquote>
                ))}
              </div>

              {tItems.length > 3 ? (
                <div className="mx-auto mt-8 grid max-w-4xl gap-8 md:grid-cols-2">
                  {tItems.slice(3).map((t) => (
                    <blockquote
                      key={t.name}
                      className="rounded-2xl bg-muted p-8"
                    >
                      <div className="mb-4 flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className="h-5 w-5 text-chart-4" />
                        ))}
                      </div>
                      <p className="mb-6 leading-relaxed text-foreground/80">
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
                          <cite className="font-semibold not-italic text-foreground">
                            {t.name}
                          </cite>
                          <p className="text-sm text-muted-foreground">
                            {t.role}
                          </p>
                        </div>
                      </footer>
                    </blockquote>
                  ))}
                </div>
              ) : null}
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-muted py-20 lg:py-28" aria-labelledby="faq-heading">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <span className="text-sm font-bold uppercase tracking-widest text-primary">
                  {faqEyebrow}
                </span>
                <h2
                  id="faq-heading"
                  className="mb-6 mt-4 font-serif text-4xl font-bold text-foreground sm:text-5xl"
                >
                  {faqHeading}
                </h2>
              </div>

              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.q}
                    className="group overflow-hidden rounded-xl bg-card"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between p-6">
                      <span className="text-lg font-semibold text-card-foreground">
                        {item.q}
                      </span>
                      <span className="text-primary transition-transform group-open:rotate-180">
                        <svg
                          className="h-6 w-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </span>
                    </summary>
                    <div className="px-6 pb-6 leading-relaxed text-muted-foreground">
                      {item.a}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* Booking */}
          <section
            className="relative overflow-hidden bg-foreground py-20 lg:py-28"
            aria-labelledby="booking-heading"
          >
            <div className="absolute inset-0 opacity-20">
              <Image
                alt={bookBgAlt}
                w={1920}
                h={1080}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="rounded-3xl bg-card p-8 shadow-2xl sm:p-12">
                <div className="mb-10 text-center">
                  <span className="text-sm font-bold uppercase tracking-widest text-primary">
                    {bookEyebrow}
                  </span>
                  <h2
                    id="booking-heading"
                    className="mb-4 mt-4 font-serif text-3xl font-bold text-card-foreground sm:text-4xl"
                  >
                    {bookHeading}
                  </h2>
                  <p className="text-muted-foreground">
                    {bookPhoneLabel}{" "}
                    <button
                      type="button"
                      onClick={() => go(bookPhone)}
                      className="font-semibold text-primary hover:underline"
                    >
                      {bookPhone}
                    </button>
                  </p>
                </div>

                <form
                  className="space-y-6"
                  onSubmit={(e) => {
                    e.preventDefault()
                    go(bookSubmit)
                  }}
                >
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="spa2-first" className={labelCls}>
                        First Name
                      </label>
                      <input
                        id="spa2-first"
                        type="text"
                        required
                        placeholder="Your first name"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label htmlFor="spa2-last" className={labelCls}>
                        Last Name
                      </label>
                      <input
                        id="spa2-last"
                        type="text"
                        required
                        placeholder="Your last name"
                        className={inputCls}
                      />
                    </div>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="spa2-email" className={labelCls}>
                        Email
                      </label>
                      <input
                        id="spa2-email"
                        type="email"
                        required
                        placeholder="you@example.com"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label htmlFor="spa2-phone" className={labelCls}>
                        Phone
                      </label>
                      <input
                        id="spa2-phone"
                        type="tel"
                        required
                        placeholder="(555) 123-4567"
                        className={inputCls}
                      />
                    </div>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="spa2-service" className={labelCls}>
                        Service or Package
                      </label>
                      <select
                        id="spa2-service"
                        required
                        className={inputCls}
                      >
                        {serviceOptions.map((s) => (
                          <option key={s} className="bg-background">
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="spa2-date" className={labelCls}>
                        Preferred Date
                      </label>
                      <input
                        id="spa2-date"
                        type="date"
                        required
                        className={inputCls}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="spa2-notes" className={labelCls}>
                      Special Requests or Notes
                    </label>
                    <textarea
                      id="spa2-notes"
                      rows={3}
                      placeholder="Allergies, preferences, occasion, etc."
                      className={cn(inputCls, "resize-none")}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-xl bg-primary py-4 text-lg font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    {bookSubmit}
                  </button>

                  <p className="text-center text-sm text-muted-foreground">
                    {bookFormNote}{" "}
                    <button
                      type="button"
                      onClick={() => go(bookPolicyLink)}
                      className="text-primary hover:underline"
                    >
                      {bookPolicyLink}
                    </button>
                  </p>
                </form>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-foreground py-16 text-background/60">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 flex items-center gap-2"
                >
                  <LeafMark className="h-8 w-8 text-primary" />
                  <span className="font-serif text-xl font-semibold tracking-tight text-background">
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
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-background/10 transition-colors hover:bg-primary"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d={socialIcons[s] ?? socialIcons.Instagram} />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>

              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h4 className="mb-4 font-semibold text-background">
                    {col.title}
                  </h4>
                  <ul className="space-y-3 text-sm">
                    {col.links.map((link) => (
                      <li key={link}>
                        <button
                          type="button"
                          onClick={() => go(link)}
                          className="transition-colors hover:text-primary"
                        >
                          {link}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              <div>
                <h4 className="mb-4 font-semibold text-background">Contact</h4>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-3">
                    <svg
                      className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span>{contactAddress}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <svg
                      className="h-5 w-5 flex-shrink-0 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    <button
                      type="button"
                      onClick={() => go(contactPhone)}
                      className="transition-colors hover:text-primary"
                    >
                      {contactPhone}
                    </button>
                  </li>
                  <li className="flex items-center gap-3">
                    <svg
                      className="h-5 w-5 flex-shrink-0 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <button
                      type="button"
                      onClick={() => go(contactEmail)}
                      className="transition-colors hover:text-primary"
                    >
                      {contactEmail}
                    </button>
                  </li>
                </ul>
                <div className="mt-4">
                  <p className="mb-2 text-sm font-semibold text-background">
                    {contactHoursLabel}
                  </p>
                  <p className="text-sm">{contactHours}</p>
                </div>
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
                    className="transition-colors hover:text-primary"
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
