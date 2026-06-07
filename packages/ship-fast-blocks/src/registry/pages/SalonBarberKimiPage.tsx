import { useState } from "react"
import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * SalonBarberKimiPage — a complete, self-contained barbershop / men's-grooming
 * salon LANDING page. A faithful Tailwind v4 port of a Kimi-generated
 * "Blade & Fade Barbershop" design: a warm, editorial, stone-neutral aesthetic
 * on a light surface with a full-bleed photographic hero, a press-logo strip,
 * a 6-up services menu with prices and durations, a 3-step booking flow, a
 * masonry-style work gallery with hover captions, a 3-column transparent
 * pricing table (with a "Most Popular" plan), a dark stats band, a testimonial
 * grid with star ratings and headshots, an accordion FAQ, a dark booking CTA
 * with hours/location/contact cards, and a multi-column footer with newsletter.
 * Callers supply ONLY content data; rich defaults render the full page with no
 * props at all. Every nav item / CTA / link / form routes through useNavigate
 * (never a dead "#"), and all imagery uses the alt-driven <Image> component.
 */
export const SalonBarberKimiPage = defineComponent({
  name: "SalonBarberKimiPage",
  description:
    "Complete barbershop / men's-grooming salon LANDING page with a warm, premium, editorial stone-neutral aesthetic on a light surface. Includes a full-bleed photographic hero (est. badge, bold headline, dual CTAs, rating + open-hours trust strip), a press / 'featured in' logo wall, a 6-up services menu with per-service price and duration (classic cut, hot towel shave, beard sculpting, fade & taper, full experience, kids cut), a 3-step 'how it works' booking flow, a masonry barber-portfolio gallery with hover style captions and barber credits, a 3-column transparent pricing table with a Most-Popular highlighted plan and add-ons, a dark stat band (years, clients, rating, barbers), a testimonial grid with 5-star ratings and client headshots, an accordion FAQ, a dark booking CTA with hours/location/contact info cards, and a multi-column footer with services links, company links, and a newsletter signup. Use as the ROOT/home page for barbershops, hair salons, men's grooming studios, beauty/spa parlors, nail salons, tattoo studios, or any appointment-based local service business wanting a polished, conversion-focused, booking-driven page with services, gallery, pricing, reviews and FAQ. Supply content only — brand, nav, hero, logos, services, steps, gallery, pricing, stats, testimonials, faq, booking, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand / shop name shown in navbar and footer. */
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
        phone: z.string().optional(),
        rating: z.string().optional(),
        openLine: z.string().optional(),
        imageAlt: z.string().optional(),
      })
      .optional(),
    /** Press / "featured in" logo strip. */
    logos: z
      .object({
        heading: z.string().optional(),
        items: z.array(z.string()).optional(),
      })
      .optional(),
    /** Services menu grid. */
    services: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
              price: z.string(),
              duration: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** How-it-works steps. */
    steps: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Work / portfolio gallery. */
    gallery: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        cta: z.string().optional(),
        items: z
          .array(
            z.object({ title: z.string(), barber: z.string(), alt: z.string() }),
          )
          .optional(),
      })
      .optional(),
    /** Transparent pricing table. */
    pricing: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        footnote: z.string().optional(),
        cta: z.string().optional(),
        popularLabel: z.string().optional(),
        plans: z
          .array(
            z.object({
              name: z.string(),
              tagline: z.string(),
              popular: z.boolean().optional(),
              items: z.array(z.object({ label: z.string(), price: z.string() })),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Dark stats band. */
    stats: z
      .object({
        items: z.array(z.object({ value: z.string(), label: z.string() })).optional(),
      })
      .optional(),
    /** Testimonial grid. */
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
    /** FAQ accordion. */
    faq: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
      })
      .optional(),
    /** Dark booking CTA with info cards. */
    booking: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        callCta: z.string().optional(),
        bookCta: z.string().optional(),
        imageAlt: z.string().optional(),
        hoursTitle: z.string().optional(),
        hours: z.array(z.string()).optional(),
        locationTitle: z.string().optional(),
        location: z.array(z.string()).optional(),
        contactTitle: z.string().optional(),
        contact: z.array(z.string()).optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        about: z.string().optional(),
        servicesTitle: z.string().optional(),
        serviceLinks: z.array(z.string()).optional(),
        companyTitle: z.string().optional(),
        companyLinks: z.array(z.string()).optional(),
        newsletterTitle: z.string().optional(),
        newsletterText: z.string().optional(),
        newsletterCta: z.string().optional(),
        copyright: z.string().optional(),
        legalLinks: z.array(z.string()).optional(),
        socials: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const brand = props.brand ?? "Blade & Fade"
    const nav = props.nav?.length
      ? props.nav
      : ["Services", "Gallery", "Pricing", "Reviews", "FAQ"]

    const heroEyebrow = props.hero?.eyebrow ?? "Est. 2015 — Downtown Portland"
    const heroHeading =
      props.hero?.heading ?? "Where Classic Craftsmanship Meets Modern Style"
    const heroSub =
      props.hero?.subheading ??
      "Experience precision cuts, hot towel shaves, and beard grooming from master barbers with over 50 years of combined experience. Walk in welcome, appointments preferred."
    const heroPrimary = props.hero?.primaryCta ?? "Book Appointment"
    const heroSecondary = props.hero?.secondaryCta ?? "View Services"
    const heroPhone = props.hero?.phone ?? "(555) 123-4567"
    const heroRating = props.hero?.rating ?? "4.9/5 from 800+ reviews"
    const heroOpen = props.hero?.openLine ?? "Open 7 Days"
    const heroImageAlt =
      props.hero?.imageAlt ??
      "interior of a modern upscale barbershop with leather chairs and warm lighting"
    const bookCtaLabel = "Book Now"

    const logosHeading = props.logos?.heading ?? "Featured In & Trusted By"
    const logoItems = props.logos?.items?.length
      ? props.logos.items
      : [
          "GQ STYLE",
          "MEN'S JOURNAL",
          "ESQUIRE",
          "PORTLAND MONTHLY",
          "BARBER CON",
          "YELP ELITE",
        ]

    const servicesEyebrow = props.services?.eyebrow ?? "Our Services"
    const servicesHeading =
      props.services?.heading ?? "Precision Grooming for the Modern Gentleman"
    const servicesDesc =
      props.services?.description ??
      "From classic cuts to contemporary styles, our master barbers deliver exceptional results tailored to your look."
    const serviceItems = props.services?.items?.length
      ? props.services.items
      : [
          {
            title: "Classic Cut & Style",
            description:
              "A precision haircut tailored to your face shape and lifestyle. Includes shampoo, cut, blow-dry, and styling with premium products.",
            price: "$45",
            duration: "45 min",
          },
          {
            title: "Hot Towel Shave",
            description:
              "The ultimate traditional shave. Hot towels, premium oils, straight razor precision, and finishing with aftershave balm for silky smooth skin.",
            price: "$55",
            duration: "45 min",
          },
          {
            title: "Beard Sculpting",
            description:
              "Expert beard trimming, shaping, and conditioning. We'll design the perfect beard shape to complement your facial features.",
            price: "$35",
            duration: "30 min",
          },
          {
            title: "Fade & Taper Specialist",
            description:
              "Low, mid, high, or skin fades executed with precision. Our specialty—perfectly blended transitions that turn heads.",
            price: "$50",
            duration: "50 min",
          },
          {
            title: "The Full Experience",
            description:
              "Haircut, hot towel shave, beard trim, facial treatment, and scalp massage. Two hours of pure relaxation and transformation.",
            price: "$120",
            duration: "2 hrs",
          },
          {
            title: "Kids Cut (Under 12)",
            description:
              "Gentle, patient service for young gentlemen. Includes cut, style, and a lollipop. Parents welcome to accompany.",
            price: "$30",
            duration: "30 min",
          },
        ]

    const stepsEyebrow = props.steps?.eyebrow ?? "How It Works"
    const stepsHeading =
      props.steps?.heading ?? "Book Your Fresh Look in 3 Simple Steps"
    const stepsDesc =
      props.steps?.description ??
      "We've streamlined the booking process so you can focus on what matters—looking your best."
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: "Choose Your Service",
            description:
              "Browse our menu of cuts, shaves, and grooming services. Each includes duration and price upfront—no surprises.",
          },
          {
            title: "Pick Date & Time",
            description:
              "Select your preferred barber and time slot. Same-day appointments often available. Walk-ins welcome for quick trims.",
          },
          {
            title: "Arrive & Relax",
            description:
              "Show up 5 minutes early, grab a complimentary beverage, and enjoy the experience. Leave looking sharper than ever.",
          },
        ]

    const galleryEyebrow = props.gallery?.eyebrow ?? "Portfolio"
    const galleryHeading = props.gallery?.heading ?? "Our Recent Work"
    const galleryDesc =
      props.gallery?.description ??
      "A showcase of cuts, styles, and transformations from our talented team of barbers."
    const galleryCta =
      props.gallery?.cta ?? "Follow @bladeandfade on Instagram for more"
    const galleryItems = props.gallery?.items?.length
      ? props.gallery.items
      : [
          {
            title: "Mid Skin Fade",
            barber: "By Marcus Chen",
            alt: "man with fresh fade haircut and defined lineup in barber chair",
          },
          {
            title: "Beard Sculpting",
            barber: "By James Wilson",
            alt: "bearded man after professional beard trim and shaping",
          },
          {
            title: "Classic Pompadour",
            barber: "By David Park",
            alt: "professional barber giving classic pompadour haircut with scissors",
          },
          {
            title: "Textured Crop",
            barber: "By Marcus Chen",
            alt: "man with textured crop haircut and natural styling",
          },
          {
            title: "Hot Towel Shave",
            barber: "By James Wilson",
            alt: "professional hot towel straight razor shave in progress",
          },
          {
            title: "High Fade Slick Back",
            barber: "By David Park",
            alt: "man with high fade and slicked back top hairstyle",
          },
          {
            title: "Buzz Cut & Lineup",
            barber: "By Marcus Chen",
            alt: "young man with buzz cut and clean lineup edge up",
          },
          {
            title: "Low Fade Curls",
            barber: "By James Wilson",
            alt: "man with low fade haircut and curly top texture",
          },
        ]

    const pricingEyebrow = props.pricing?.eyebrow ?? "Pricing"
    const pricingHeading =
      props.pricing?.heading ?? "Transparent Pricing, Premium Service"
    const pricingDesc =
      props.pricing?.description ??
      "No hidden fees. No upsells. Just honest pricing for exceptional grooming."
    const pricingFootnote =
      props.pricing?.footnote ??
      "Cash and all major credit cards accepted. 20% gratuity added for groups of 3+."
    const pricingCta = props.pricing?.cta ?? "Book Now"
    const popularLabel = props.pricing?.popularLabel ?? "Most Popular"
    const pricingPlans = props.pricing?.plans?.length
      ? props.pricing.plans
      : [
          {
            name: "Essential Cuts",
            tagline: "Quality cuts for everyday sharpness",
            items: [
              { label: "Kids Cut (Under 12)", price: "$30" },
              { label: "Senior Cut (65+)", price: "$35" },
              { label: "Classic Cut & Style", price: "$45" },
              { label: "Fade / Taper Cut", price: "$50" },
              { label: "Buzz Cut (One Length)", price: "$25" },
            ],
          },
          {
            name: "Grooming Services",
            tagline: "The complete gentleman experience",
            popular: true,
            items: [
              { label: "Beard Trim & Shape", price: "$35" },
              { label: "Hot Towel Shave", price: "$55" },
              { label: "Hair + Beard Combo", price: "$75" },
              { label: "Haircut + Shave", price: "$95" },
              { label: "The Full Experience", price: "$120" },
            ],
          },
          {
            name: "Add-Ons",
            tagline: "Enhance your service",
            items: [
              { label: "Shampoo & Condition", price: "+$10" },
              { label: "Scalp Treatment", price: "+$15" },
              { label: "Gray Blending", price: "+$25" },
              { label: "Facial Mask", price: "+$20" },
              { label: "Eyebrow Cleanup", price: "+$12" },
            ],
          },
        ]

    const statItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "9+", label: "Years Experience" },
          { value: "15K+", label: "Happy Clients" },
          { value: "4.9", label: "Google Rating" },
          { value: "6", label: "Expert Barbers" },
        ]

    const testimonialsEyebrow = props.testimonials?.eyebrow ?? "Testimonials"
    const testimonialsHeading =
      props.testimonials?.heading ?? "What Our Clients Say"
    const testimonialsDesc =
      props.testimonials?.description ??
      "Real reviews from real customers who keep coming back."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "I've been coming to Blade & Fade for 3 years now. Marcus always delivers the perfect fade, and the hot towel shave is the most relaxing part of my week. Best barbershop in Portland, hands down.",
            name: "Michael Torres",
            role: "Software Engineer · Regular since 2022",
            avatarAlt:
              "professional headshot of a smiling man with short dark hair",
          },
          {
            quote:
              "Finally found a barbershop that understands curly hair! David took his time, explained the process, and gave me a cut that actually works with my texture. The shop vibe is incredible too—great music, cold beer, and zero pretension.",
            name: "Jason Miller",
            role: "Architect · First visit became regular",
            avatarAlt:
              "professional headshot of a smiling man with curly brown hair and beard",
          },
          {
            quote:
              "I take my two sons here every month. The barbers are amazing with kids—patient, friendly, and somehow manage to get perfect cuts even when my youngest won't sit still. The family atmosphere keeps us coming back.",
            name: "Robert Chen",
            role: "Father of two · Family plan subscriber",
            avatarAlt:
              "professional headshot of a smiling man with glasses and salt-and-pepper hair",
          },
          {
            quote:
              "As someone who's particular about my beard, I've tried dozens of shops. James at Blade & Fade is the only barber I trust now. He sculpts my beard with genuine artistry. Worth every penny and then some.",
            name: "Alex Thompson",
            role: "Creative Director · Monthly visitor",
            avatarAlt:
              "professional headshot of a bearded man in a navy blazer",
          },
          {
            quote:
              "I was nervous about trying a new place for my wedding haircut, but Blade & Fade exceeded all expectations. The attention to detail was incredible—I looked absolutely sharp for the big day. My groomsmen are now all regulars too!",
            name: "Daniel Park",
            role: "Newlywed · Wedding party regular",
            avatarAlt:
              "professional headshot of a smiling groom in formal attire",
          },
          {
            quote:
              "Found this gem when I moved to Portland three years ago. The consistency is what impresses me—every single visit, I leave looking sharp. The online booking is seamless and they always run on time. Rare combo in this business!",
            name: "Marcus Johnson",
            role: "Tech Consultant · 3-year regular",
            avatarAlt:
              "professional headshot of a smiling man with a clean fade haircut",
          },
        ]

    const faqEyebrow = props.faq?.eyebrow ?? "FAQ"
    const faqHeading = props.faq?.heading ?? "Common Questions"
    const faqDesc =
      props.faq?.description ?? "Everything you need to know before your first visit."
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            q: "Do I need an appointment or do you accept walk-ins?",
            a: "We welcome both! Appointments are recommended, especially for weekends and evenings, but we always reserve slots for walk-ins. Download our app or call ahead to check current wait times.",
          },
          {
            q: "How early should I arrive for my appointment?",
            a: "Please arrive 5-10 minutes early to check in and grab a complimentary beverage. First-time clients should arrive 10 minutes early to complete a brief profile form that helps us customize your service.",
          },
          {
            q: "What is your cancellation policy?",
            a: "We ask for 24 hours notice for cancellations or rescheduling. Late cancellations (under 4 hours) may be charged 50% of the service fee. No-shows are charged the full amount. We understand things happen—just give us a call.",
          },
          {
            q: "Do you offer services for women or children?",
            a: "Yes! While we specialize in men's grooming, we welcome anyone seeking our services. We offer kids' cuts for children under 12 at a discounted rate. Women's short cuts, fades, and undercuts are also available with any of our barbers.",
          },
          {
            q: "What COVID-19 safety measures are in place?",
            a: "All tools are sanitized between every client using hospital-grade disinfectant. Capes are laundered after each use. Hand sanitizer is available throughout the shop. Our ventilation system exceeds CDC recommendations. Barbers may wear masks upon request.",
          },
          {
            q: "Can I request a specific barber?",
            a: "Absolutely! When booking online or by phone, you can select your preferred barber. Each barber has their specialties—Marcus is our fade king, James is the beard whisperer, and David specializes in longer styles. View their portfolios on our Instagram.",
          },
        ]

    const bookingHeading = props.booking?.heading ?? "Ready for Your Fresh Cut?"
    const bookingDesc =
      props.booking?.description ??
      "Book your appointment today and experience why Blade & Fade has been Portland's premier barbershop since 2015. Walk-ins welcome, but appointments guarantee your preferred time."
    const bookingCall = props.booking?.callCta ?? "Call (555) 123-4567"
    const bookingBook = props.booking?.bookCta ?? "Book Online"
    const bookingImageAlt =
      props.booking?.imageAlt ??
      "barber tools and equipment arranged on a wooden counter"
    const hoursTitle = props.booking?.hoursTitle ?? "Hours"
    const hours = props.booking?.hours?.length
      ? props.booking.hours
      : ["Mon–Fri: 9am – 8pm", "Saturday: 8am – 6pm", "Sunday: 10am – 4pm"]
    const locationTitle = props.booking?.locationTitle ?? "Location"
    const location = props.booking?.location?.length
      ? props.booking.location
      : ["245 NW 23rd Avenue", "Portland, OR 97210", "Street parking available"]
    const contactTitle = props.booking?.contactTitle ?? "Contact"
    const contact = props.booking?.contact?.length
      ? props.booking.contact
      : ["(555) 123-4567", "hello@bladeandfade.com", "@bladeandfade"]

    const footerAbout =
      props.footer?.about ??
      "Premium men's grooming in the heart of Portland. Classic craftsmanship meets modern style since 2015."
    const footerServicesTitle = props.footer?.servicesTitle ?? "Services"
    const footerServiceLinks = props.footer?.serviceLinks?.length
      ? props.footer.serviceLinks
      : [
          "Classic Cuts",
          "Fades & Tapers",
          "Hot Towel Shaves",
          "Beard Grooming",
          "Kids Cuts",
        ]
    const footerCompanyTitle = props.footer?.companyTitle ?? "Company"
    const footerCompanyLinks = props.footer?.companyLinks?.length
      ? props.footer.companyLinks
      : ["About Us", "Careers", "Gallery", "Gift Cards", "Franchise"]
    const newsletterTitle = props.footer?.newsletterTitle ?? "Newsletter"
    const newsletterText =
      props.footer?.newsletterText ?? "Get style tips and exclusive offers."
    const newsletterCta = props.footer?.newsletterCta ?? "Join"
    const copyright =
      props.footer?.copyright ??
      "© 2025 Blade & Fade Barbershop. All rights reserved."
    const legalLinks = props.footer?.legalLinks?.length
      ? props.footer.legalLinks
      : ["Privacy Policy", "Terms of Service", "Accessibility"]
    const socials = props.footer?.socials?.length
      ? props.footer.socials
      : ["Twitter", "Instagram", "YouTube"]

    // Decorative scissors brand mark.
    const Scissors = ({ className }: { className?: string }) => (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
      </svg>
    )

    const Star = ({ className }: { className?: string }) => (
      <svg
        className={className}
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    )

    return (
      <div
        className={cn(
          "min-h-svh bg-background font-sans text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/90 backdrop-blur-sm">
          <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-20 lg:px-8">
            <button
              type="button"
              onClick={() => go(nav[0])}
              className="flex items-center gap-2"
            >
              <Scissors className="size-8 text-foreground" />
              <span className="text-xl font-semibold tracking-tight text-foreground">
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
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => go(heroPhone)}
                className="hidden items-center text-sm text-muted-foreground transition-colors hover:text-foreground sm:flex"
              >
                <svg
                  className="mr-2 size-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {heroPhone}
              </button>
              <button
                type="button"
                onClick={() => go(bookCtaLabel)}
                className="inline-flex items-center rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {bookCtaLabel}
              </button>
              <button
                type="button"
                aria-label="Open menu"
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
                onClick={() => setMobileOpen((v: boolean) => !v)}
                className="p-2 text-muted-foreground transition-colors hover:text-foreground md:hidden"
              >
                <svg
                  className="size-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M4 6h16M4 12h16M4 18h16" />
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
              </div>
            )}
          </nav>
        </header>

        <main>
          {/* Hero */}
          <section className="relative flex min-h-screen items-center pt-20 lg:pt-0">
            <div className="absolute inset-0 z-0">
              <Image
                alt={heroImageAlt}
                w={1920}
                h={1080}
                className="size-full object-cover"
              />
              <div className="absolute inset-0 bg-foreground/40" />
            </div>
            <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
              <div className="max-w-2xl">
                <p className="mb-4 text-sm font-medium uppercase tracking-wider text-background/80">
                  {heroEyebrow}
                </p>
                <h1 className="mb-6 text-4xl font-bold leading-tight text-background sm:text-5xl lg:text-6xl">
                  {heroHeading}
                </h1>
                <p className="mb-8 max-w-xl text-lg leading-relaxed text-background/80">
                  {heroSub}
                </p>
                <div className="flex flex-col gap-4 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => go(heroPrimary)}
                    className="inline-flex items-center justify-center rounded-lg bg-background px-8 py-4 text-base font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    {heroPrimary}
                    <ArrowRight className="ml-2 size-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => go(heroSecondary)}
                    className="inline-flex items-center justify-center rounded-lg border-2 border-border/40 px-8 py-4 text-base font-medium text-background transition-colors hover:bg-background/10"
                  >
                    {heroSecondary}
                  </button>
                </div>
                <div className="mt-12 flex flex-wrap items-center gap-8 text-background/80">
                  <div className="flex items-center">
                    <Star className="mr-2 size-5 text-primary" />
                    <span className="text-sm font-medium">{heroRating}</span>
                  </div>
                  <div className="flex items-center">
                    <svg
                      className="mr-2 size-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium">{heroOpen}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Logos */}
          <section className="border-b border-border bg-card py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-10 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
                {logosHeading}
              </p>
              <div className="grid grid-cols-2 items-center gap-8 opacity-60 md:grid-cols-4 lg:grid-cols-6">
                {logoItems.map((logo) => (
                  <div key={logo} className="flex items-center justify-center">
                    <span className="text-base font-semibold text-muted-foreground">
                      {logo}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Services */}
          <section className="bg-background py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <p className="mb-3 text-sm font-medium uppercase tracking-wider text-muted-foreground">
                  {servicesEyebrow}
                </p>
                <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                  {servicesHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{servicesDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {serviceItems.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-xl border border-border bg-card p-8 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="mb-6 flex size-14 items-center justify-center rounded-xl bg-muted">
                      <Scissors className="size-7 text-foreground" />
                    </div>
                    <h3 className="mb-3 text-xl font-semibold text-card-foreground">
                      {item.title}
                    </h3>
                    <p className="mb-4 leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                    <p className="text-lg font-semibold text-card-foreground">
                      {item.price}{" "}
                      <span className="text-sm font-normal text-muted-foreground">
                        · {item.duration}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Steps */}
          <section className="bg-card py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <p className="mb-3 text-sm font-medium uppercase tracking-wider text-muted-foreground">
                  {stepsEyebrow}
                </p>
                <h2 className="mb-4 text-3xl font-bold text-card-foreground sm:text-4xl">
                  {stepsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{stepsDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
                {stepItems.map((step, i) => (
                  <div key={step.title} className="text-center">
                    <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-xl bg-primary">
                      <span className="text-2xl font-bold text-primary-foreground">
                        {i + 1}
                      </span>
                    </div>
                    <h3 className="mb-3 text-xl font-semibold text-card-foreground">
                      {step.title}
                    </h3>
                    <p className="leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Gallery */}
          <section className="bg-background py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <p className="mb-3 text-sm font-medium uppercase tracking-wider text-muted-foreground">
                  {galleryEyebrow}
                </p>
                <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                  {galleryHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{galleryDesc}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {galleryItems.map((item) => (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => go(item.title)}
                    className="group relative aspect-[3/4] overflow-hidden rounded-xl"
                  >
                    <Image
                      alt={item.alt}
                      w={600}
                      h={800}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                      <div className="absolute bottom-4 left-4 text-left text-background">
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-background/70">{item.barber}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="mt-12 text-center">
                <button
                  type="button"
                  onClick={() => go(galleryCta)}
                  className="inline-flex items-center rounded-lg border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  <svg
                    className="mr-2 size-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {galleryCta}
                </button>
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="bg-card py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <p className="mb-3 text-sm font-medium uppercase tracking-wider text-muted-foreground">
                  {pricingEyebrow}
                </p>
                <h2 className="mb-4 text-3xl font-bold text-card-foreground sm:text-4xl">
                  {pricingHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{pricingDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {pricingPlans.map((plan) => (
                  <div
                    key={plan.name}
                    className={cn(
                      "relative rounded-xl p-8",
                      plan.popular
                        ? "border-2 border-primary bg-card"
                        : "border border-border bg-card",
                    )}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                          {popularLabel}
                        </span>
                      </div>
                    )}
                    <h3 className="mb-2 text-lg font-semibold text-card-foreground">
                      {plan.name}
                    </h3>
                    <p className="mb-6 text-sm text-muted-foreground">
                      {plan.tagline}
                    </p>
                    <ul className="mb-8 space-y-4">
                      {plan.items.map((row) => (
                        <li
                          key={row.label}
                          className="flex items-center justify-between"
                        >
                          <span className="text-card-foreground/80">
                            {row.label}
                          </span>
                          <span className="font-semibold text-card-foreground">
                            {row.price}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => go(pricingCta)}
                      className={cn(
                        "block w-full rounded-lg px-6 py-3 text-center text-sm font-medium transition-colors",
                        plan.popular
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "border border-border text-card-foreground hover:bg-muted",
                      )}
                    >
                      {pricingCta}
                    </button>
                  </div>
                ))}
              </div>
              <p className="mt-8 text-center text-sm text-muted-foreground">
                {pricingFootnote}
              </p>
            </div>
          </section>

          {/* Stats */}
          <section className="bg-primary py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
                {statItems.map((stat) => (
                  <div key={stat.label}>
                    <p className="mb-2 text-4xl font-bold text-primary-foreground lg:text-5xl">
                      {stat.value}
                    </p>
                    <p className="text-sm uppercase tracking-wider text-primary-foreground/70">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="bg-background py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <p className="mb-3 text-sm font-medium uppercase tracking-wider text-muted-foreground">
                  {testimonialsEyebrow}
                </p>
                <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                  {testimonialsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{testimonialsDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {testimonialItems.map((t) => (
                  <div
                    key={t.name}
                    className="rounded-xl border border-border bg-card p-8 shadow-sm"
                  >
                    <div className="mb-4 flex text-primary">
                      {[0, 1, 2, 3, 4].map((s) => (
                        <Star key={s} className="size-5" />
                      ))}
                    </div>
                    <p className="mb-6 leading-relaxed text-card-foreground/80">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="flex items-center">
                      <Image
                        alt={t.avatarAlt}
                        w={100}
                        h={100}
                        className="mr-4 size-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold text-card-foreground">
                          {t.name}
                        </p>
                        <p className="text-sm text-muted-foreground">{t.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-card py-24 lg:py-32">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <p className="mb-3 text-sm font-medium uppercase tracking-wider text-muted-foreground">
                  {faqEyebrow}
                </p>
                <h2 className="mb-4 text-3xl font-bold text-card-foreground sm:text-4xl">
                  {faqHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{faqDesc}</p>
              </div>
              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.q}
                    className="group rounded-xl border border-border bg-background"
                  >
                    <summary className="flex cursor-pointer items-center justify-between p-6">
                      <span className="font-semibold text-foreground">
                        {item.q}
                      </span>
                      <span className="ml-6 transition-transform group-open:rotate-180">
                        <svg
                          className="size-5 text-muted-foreground"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M19 9l-7 7-7-7" />
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

          {/* Booking CTA */}
          <section className="relative overflow-hidden bg-primary py-24 lg:py-32">
            <div className="absolute inset-0 opacity-20">
              <Image
                alt={bookingImageAlt}
                w={1920}
                h={1080}
                loading="lazy"
                className="size-full object-cover"
              />
            </div>
            <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2 className="mb-6 text-3xl font-bold text-primary-foreground sm:text-4xl lg:text-5xl">
                {bookingHeading}
              </h2>
              <p className="mx-auto mb-10 max-w-2xl text-lg text-primary-foreground/80">
                {bookingDesc}
              </p>
              <div className="mb-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(bookingCall)}
                  className="inline-flex items-center rounded-lg bg-background px-8 py-4 text-base font-medium text-foreground transition-colors hover:bg-muted"
                >
                  <svg
                    className="mr-2 size-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {bookingCall}
                </button>
                <button
                  type="button"
                  onClick={() => go(bookingBook)}
                  className="inline-flex items-center rounded-lg border-2 border-primary-foreground/30 px-8 py-4 text-base font-medium text-primary-foreground transition-colors hover:bg-primary-foreground/10"
                >
                  <svg
                    className="mr-2 size-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {bookingBook}
                </button>
              </div>
              <div className="grid gap-6 text-left sm:grid-cols-3">
                <div className="rounded-xl border border-primary-foreground/10 bg-primary-foreground/5 p-6 backdrop-blur-sm">
                  <p className="mb-2 text-sm uppercase tracking-wider text-primary-foreground/70">
                    {hoursTitle}
                  </p>
                  <ul className="space-y-1 text-sm text-primary-foreground">
                    {hours.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl border border-primary-foreground/10 bg-primary-foreground/5 p-6 backdrop-blur-sm">
                  <p className="mb-2 text-sm uppercase tracking-wider text-primary-foreground/70">
                    {locationTitle}
                  </p>
                  <address className="space-y-1 text-sm not-italic leading-relaxed text-primary-foreground">
                    {location.map((line) => (
                      <div key={line}>{line}</div>
                    ))}
                  </address>
                </div>
                <div className="rounded-xl border border-primary-foreground/10 bg-primary-foreground/5 p-6 backdrop-blur-sm">
                  <p className="mb-2 text-sm uppercase tracking-wider text-primary-foreground/70">
                    {contactTitle}
                  </p>
                  <ul className="space-y-1 text-sm text-primary-foreground">
                    {contact.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-card py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-12 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-6 flex items-center gap-2"
                >
                  <Scissors className="size-8 text-card-foreground" />
                  <span className="text-xl font-semibold text-card-foreground">
                    {brand}
                  </span>
                </button>
                <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                  {footerAbout}
                </p>
                <div className="flex gap-4">
                  {socials.map((social) => (
                    <button
                      key={social}
                      type="button"
                      aria-label={social}
                      onClick={() => go(social)}
                      className="flex size-10 items-center justify-center rounded-lg bg-muted text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      {social.charAt(0)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="mb-4 font-semibold text-card-foreground">
                  {footerServicesTitle}
                </h4>
                <ul className="space-y-3 text-sm">
                  {footerServiceLinks.map((link) => (
                    <li key={link}>
                      <button
                        type="button"
                        onClick={() => go(link)}
                        className="text-muted-foreground transition-colors hover:text-card-foreground"
                      >
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="mb-4 font-semibold text-card-foreground">
                  {footerCompanyTitle}
                </h4>
                <ul className="space-y-3 text-sm">
                  {footerCompanyLinks.map((link) => (
                    <li key={link}>
                      <button
                        type="button"
                        onClick={() => go(link)}
                        className="text-muted-foreground transition-colors hover:text-card-foreground"
                      >
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="mb-4 font-semibold text-card-foreground">
                  {newsletterTitle}
                </h4>
                <p className="mb-4 text-sm text-muted-foreground">
                  {newsletterText}
                </p>
                <form
                  className="flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault()
                    go(newsletterCta)
                  }}
                >
                  <input
                    type="email"
                    required
                    placeholder="Enter email"
                    aria-label="Email address"
                    className="flex-1 rounded-lg border border-input bg-background px-4 py-2 text-sm text-foreground placeholder-muted-foreground focus:border-ring focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    {newsletterCta}
                  </button>
                </form>
              </div>
            </div>
            <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
              <p className="text-sm text-muted-foreground">{copyright}</p>
              <div className="flex gap-6 text-sm">
                {legalLinks.map((link) => (
                  <button
                    key={link}
                    type="button"
                    onClick={() => go(link)}
                    className="text-muted-foreground transition-colors hover:text-card-foreground"
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
