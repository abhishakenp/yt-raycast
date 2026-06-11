import { useState, type ReactNode } from "react"
import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * DentalKimiPage2 — SECOND, visually DISTINCT dental-practice template (an
 * alternative/sibling to DentalKimiPage). A faithful Tailwind v4 port of a
 * Kimi-generated "BrightSmile Dental — Modern Family Dentistry" design.
 *
 * Where DentalKimiPage is a cool, minimal mint clinical site, THIS variant is
 * warm, playful and family-friendly: a soft pastel gradient hero (teal→orange
 * blur blobs, "Your Smile, Our Passion" headline with a gradient-accent word, a
 * floating treatment-room photo with Same-Day / Open-Today badge chips and a
 * stacked-avatar 4.9-star trust cluster), a colorful 6-up services grid where
 * each card uses a different accent tint and a "From $89" price line, a vivid
 * teal stats band, a 4-up team grid with hover-zoom headshots and LinkedIn/email
 * circles, a captioned six-tile office gallery with hover overlays, a numbered
 * 3-step "Your First Visit" process with connector lines, a 6-up testimonials
 * grid, a centered 3-tier pricing block with a raised "Most Popular" teal plan,
 * a 6-item FAQ, and a two-column CTA with full appointment request FORM (name /
 * email / phone / service select / date / message) plus a dark 4-column footer.
 */
export const DentalKimiPage2 = defineCapsule({
  name: "DentalKimiPage2",
  description:
    "SECOND / ALTERNATIVE dental-practice / dentist / dental-clinic LANDING page — a warm, playful, family-friendly sibling style to DentalKimiPage (use this when a second, visually distinct dental variant is wanted, or for a more colorful, approachable family-dentistry feel rather than the cool minimal clinical look). Faithful port of a Kimi 'BrightSmile Dental — Modern Family Dentistry' design with a teal primary + orange/multicolor accents on a soft pastel canvas. Includes a split pastel-gradient hero (Now-Accepting-New-Patients pulse pill, big 'Your Smile, Our Passion' headline with a gradient-accent word, Book-Your-Visit + Explore-Services CTAs, a stacked-avatar 4.9-from-847-reviews trust cluster, and a floating treatment-room photo with Same-Day Emergency Care and Open Today badge chips), a colorful 6-up services grid (Preventive Care, Teeth Whitening, Cosmetic Dentistry, Dental Implants, Family Dentistry, Emergency Care) each with a tinted icon tile and a price line, a vivid teal stats band (years, patients, dentists, rating), a 4-up meet-the-team grid of dentists with hover-zoom headshots and LinkedIn/email circles, a captioned six-tile office-tour gallery with hover overlays (reception, treatment rooms, X-ray suite, sterilization, pediatric room, consultation suite), a numbered 3-step 'Your First Visit' process (Book Online, Comprehensive Exam, Personalized Plan), a 6-up patient-testimonials grid with five-star ratings and avatars, a centered 3-tier transparent-pricing block with a raised 'Most Popular' BrightSmile Membership plan, a 6-item FAQ accordion, a two-column call-to-action with contact details and a full appointment-request FORM (first/last name, email, phone, service select, preferred date, message), and a dark 4-column footer with quick links, services, contact, and socials. Use as the ROOT/home page for dentists, dental offices, family or pediatric dental clinics, orthodontists, cosmetic dentistry, and oral surgeons wanting a friendly, conversion-focused, appointment-driven site. Supply content only — brand, nav, hero, services, stats, team, gallery, steps, testimonials, pricing, faq, contact, footer; the block owns all layout and styling.",
  props: z.object({
    /** Practice / brand name shown in navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content. */
    hero: z
      .object({
        badge: z.string().optional(),
        headingPre: z.string().optional(),
        /** Accented word inside the headline (rendered with a gradient). */
        highlight: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        imageAlt: z.string().optional(),
        rating: z.string().optional(),
        reviewsLabel: z.string().optional(),
        avatarAlts: z.array(z.string()).optional(),
        avatarMore: z.string().optional(),
        badgeOne: z.object({ title: z.string(), sub: z.string() }).optional(),
        badgeTwo: z.object({ title: z.string(), sub: z.string() }).optional(),
      })
      .optional(),
    /** Services grid. */
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
            }),
          )
          .optional(),
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
    /** Meet-the-team grid. */
    team: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        members: z
          .array(
            z.object({
              name: z.string(),
              role: z.string(),
              bio: z.string(),
              imageAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Office-tour photo gallery (alt doubles as the hover caption). */
    gallery: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ caption: z.string(), imageAlt: z.string() }))
          .optional(),
      })
      .optional(),
    /** Numbered "first visit" process. */
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
    /** Patient testimonials grid. */
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
              meta: z.string(),
              avatarAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Pricing / membership block. */
    pricing: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        plans: z
          .array(
            z.object({
              name: z.string(),
              tagline: z.string(),
              price: z.string(),
              period: z.string(),
              features: z.array(z.string()),
              cta: z.string(),
              featured: z.boolean().optional(),
              badge: z.string().optional(),
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
        items: z
          .array(z.object({ question: z.string(), answer: z.string() }))
          .optional(),
      })
      .optional(),
    /** Bottom CTA with contact info + appointment form. */
    contact: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        phoneLabel: z.string().optional(),
        phone: z.string().optional(),
        addressLabel: z.string().optional(),
        address: z.string().optional(),
        hoursLabel: z.string().optional(),
        hours: z.string().optional(),
        formHeading: z.string().optional(),
        services: z.array(z.string()).optional(),
        submitCta: z.string().optional(),
        formNote: z.string().optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        tagline: z.string().optional(),
        linksHeading: z.string().optional(),
        quickLinks: z.array(z.string()).optional(),
        servicesHeading: z.string().optional(),
        serviceLinks: z.array(z.string()).optional(),
        contactHeading: z.string().optional(),
        address: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        socials: z.array(z.string()).optional(),
        copyright: z.string().optional(),
        legal: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const brand = props.brand ?? "BrightSmile"
    const nav = props.nav?.length
      ? props.nav
      : ["Services", "Our Team", "Reviews", "FAQ", "Book Appointment"]

    const heroBadge = props.hero?.badge ?? "Now Accepting New Patients"
    const heroPre = props.hero?.headingPre ?? "Your Smile,"
    const heroHighlight = props.hero?.highlight ?? "Our Passion"
    const heroSub =
      props.hero?.subheading ??
      "Experience modern dentistry with a gentle touch. From routine cleanings to complete smile makeovers, we create beautiful, healthy smiles for the whole family."
    const heroPrimary = props.hero?.primaryCta ?? "Book Your Visit"
    const heroSecondary = props.hero?.secondaryCta ?? "Explore Services"
    const heroImageAlt =
      props.hero?.imageAlt ??
      "Modern dental clinic treatment room with advanced equipment"
    const heroReviews = props.hero?.reviewsLabel ?? "4.9 from 847+ reviews"
    const heroAvatarAlts = props.hero?.avatarAlts?.length
      ? props.hero.avatarAlts
      : [
          "Happy dental patient with bright smile",
          "Patient with confident smile",
          "Satisfied dental patient",
        ]
    const heroAvatarMore = props.hero?.avatarMore ?? "+2k"
    const heroBadgeOne = props.hero?.badgeOne ?? {
      title: "Same-Day",
      sub: "Emergency Care",
    }
    const heroBadgeTwo = props.hero?.badgeTwo ?? {
      title: "Open Today",
      sub: "8:00 AM - 6:00 PM",
    }

    const servicesEyebrow = props.services?.eyebrow ?? "Comprehensive Care"
    const servicesHeading = props.services?.heading ?? "Services We Offer"
    const servicesDesc =
      props.services?.description ??
      "From preventive care to advanced cosmetic procedures, we provide everything your smile needs under one roof."
    const serviceItems = props.services?.items?.length
      ? props.services.items
      : [
          {
            title: "Preventive Care",
            description:
              "Regular checkups, professional cleanings, and early detection to keep your smile healthy year-round.",
            price: "From $89",
          },
          {
            title: "Teeth Whitening",
            description:
              "Professional whitening treatments that brighten your smile up to 8 shades in a single session.",
            price: "From $299",
          },
          {
            title: "Cosmetic Dentistry",
            description:
              "Veneers, bonding, and smile makeovers designed to give you the confident smile you deserve.",
            price: "Consultation Free",
          },
          {
            title: "Dental Implants",
            description:
              "Permanent tooth replacement solutions that look, feel, and function like natural teeth.",
            price: "From $2,499",
          },
          {
            title: "Family Dentistry",
            description:
              "Gentle, patient-centered care for patients of all ages—from toddlers to grandparents.",
            price: "Kids Under 3 Free",
          },
          {
            title: "Emergency Care",
            description:
              "Same-day appointments for dental emergencies. We're here when you need us most.",
            price: "24/7 Hotline",
          },
        ]

    const statsItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "15+", label: "Years Experience" },
          { value: "15k+", label: "Happy Patients" },
          { value: "8", label: "Expert Dentists" },
          { value: "4.9", label: "Google Rating" },
        ]

    const teamEyebrow = props.team?.eyebrow ?? "Meet Our Experts"
    const teamHeading = props.team?.heading ?? "Our Dental Team"
    const teamDesc =
      props.team?.description ??
      "Highly trained professionals dedicated to providing gentle, compassionate care for your entire family."
    const teamMembers = props.team?.members?.length
      ? props.team.members
      : [
          {
            name: "Dr. Sarah Mitchell",
            role: "Lead Dentist & Founder",
            bio: "Harvard Dental School graduate with 15+ years of experience in cosmetic and restorative dentistry.",
            imageAlt:
              "Professional headshot of Dr. Sarah Mitchell lead dentist with warm confident smile",
          },
          {
            name: "Dr. James Chen",
            role: "Orthodontist",
            bio: "Specialist in Invisalign and traditional braces. Creating beautiful smiles for teens and adults.",
            imageAlt:
              "Professional headshot of Dr. James Chen orthodontist specialist with friendly expression",
          },
          {
            name: "Dr. Emily Rodriguez",
            role: "Pediatric Dentist",
            bio: "Board-certified pediatric specialist making dental visits fun and stress-free for children.",
            imageAlt:
              "Professional headshot of Dr. Emily Rodriguez pediatric dentist with welcoming smile",
          },
          {
            name: "Dr. Michael Park",
            role: "Oral Surgeon",
            bio: "Expert in dental implants, wisdom teeth extraction, and advanced oral surgical procedures.",
            imageAlt:
              "Professional headshot of Dr. Michael Park oral surgeon with confident professional expression",
          },
        ]

    const galleryEyebrow = props.gallery?.eyebrow ?? "Our Office"
    const galleryHeading =
      props.gallery?.heading ?? "State-of-the-Art Facility"
    const galleryDesc =
      props.gallery?.description ??
      "A welcoming, modern environment designed for your comfort and care."
    const galleryItems = props.gallery?.items?.length
      ? props.gallery.items
      : [
          {
            caption: "Welcoming Reception",
            imageAlt:
              "Modern dental clinic reception area with comfortable seating and warm lighting",
          },
          {
            caption: "Advanced Treatment Rooms",
            imageAlt:
              "Advanced dental treatment room with modern equipment and comfortable patient chair",
          },
          {
            caption: "Digital X-Ray & 3D Imaging",
            imageAlt:
              "Digital x-ray and 3d imaging technology suite for accurate diagnostics",
          },
          {
            caption: "Sterilization Center",
            imageAlt:
              "Sterile modern dental equipment and instruments in organized workspace",
          },
          {
            caption: "Pediatric Care Room",
            imageAlt:
              "Pediatric dentistry room with child-friendly decor and comfortable seating",
          },
          {
            caption: "Private Consultation Suite",
            imageAlt:
              "Dental consultation room with comfortable chairs for discussing treatment plans",
          },
        ]

    const stepsEyebrow = props.steps?.eyebrow ?? "Simple Process"
    const stepsHeading = props.steps?.heading ?? "Your First Visit"
    const stepsDesc =
      props.steps?.description ??
      "We've made booking and receiving care seamless and stress-free."
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: "Book Online",
            description:
              "Choose your preferred time slot through our 24/7 online booking system. Same-day appointments often available.",
          },
          {
            title: "Comprehensive Exam",
            description:
              "Meet your dentist, discuss your goals, and receive a thorough examination with digital X-rays included.",
          },
          {
            title: "Personalized Plan",
            description:
              "Receive a customized treatment plan with transparent pricing and flexible payment options.",
          },
        ]

    const testimonialsEyebrow =
      props.testimonials?.eyebrow ?? "Patient Stories"
    const testimonialsHeading =
      props.testimonials?.heading ?? "What Our Patients Say"
    const testimonialsDesc =
      props.testimonials?.description ??
      "Real experiences from real patients who trust us with their smiles."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "I used to be terrified of the dentist until I found BrightSmile. Dr. Mitchell and her team are incredibly gentle and understanding. My smile has never looked better!",
            name: "Jennifer Walsh",
            meta: "Dental Implants Patient",
            avatarAlt:
              "Headshot of patient testimonial author Jennifer Walsh smiling",
          },
          {
            quote:
              "My kids actually look forward to dental visits now! Dr. Rodriguez is amazing with children. The office is bright, fun, and the staff treats us like family.",
            name: "Amanda Thompson",
            meta: "Family Patient - 5 Years",
            avatarAlt:
              "Headshot of patient testimonial author Amanda Thompson mother of three children",
          },
          {
            quote:
              "After years of hiding my smile in photos, I finally got veneers at BrightSmile. The results exceeded my expectations. Best investment I've ever made in myself!",
            name: "Marcus Johnson",
            meta: "Veneers Patient",
            avatarAlt:
              "Headshot of patient testimonial author Marcus Johnson after cosmetic dentistry treatment",
          },
          {
            quote:
              "Emergency root canal on a Sunday—saved my weekend! The team fit me in within 2 hours of calling. Truly exceptional service when I needed it most.",
            name: "Robert Chen",
            meta: "Emergency Care Patient",
            avatarAlt:
              "Headshot of patient testimonial author Robert Chen grateful for emergency dental care",
          },
          {
            quote:
              "Finally finished my Invisalign journey! Dr. Chen was patient and thorough throughout the entire 18-month process. My teeth are perfectly straight now!",
            name: "Sophia Martinez",
            meta: "Invisalign Patient",
            avatarAlt:
              "Headshot of patient testimonial author Sophia Martinez showing her straight teeth after orthodontic treatment",
          },
          {
            quote:
              "The transparent pricing and flexible payment plans made it possible for me to get the care I needed. No hidden fees, no surprises—just honest, quality dentistry.",
            name: "Lisa Park",
            meta: "Long-term Patient - 3 Years",
            avatarAlt:
              "Headshot of patient testimonial author Lisa Park appreciating transparent dental pricing",
          },
        ]

    const pricingEyebrow = props.pricing?.eyebrow ?? "Transparent Pricing"
    const pricingHeading =
      props.pricing?.heading ?? "Investment in Your Smile"
    const pricingDesc =
      props.pricing?.description ??
      "Clear, upfront pricing with flexible payment options and membership plans."
    const pricingPlans = props.pricing?.plans?.length
      ? props.pricing.plans
      : [
          {
            name: "New Patient Exam",
            tagline: "Comprehensive first visit",
            price: "$89",
            period: " one-time",
            features: [
              "Complete oral examination",
              "Digital X-rays included",
              "Personalized treatment plan",
              "Oral cancer screening",
            ],
            cta: "Book Now",
          },
          {
            name: "BrightSmile Membership",
            tagline: "Annual preventive care",
            price: "$39",
            period: "/month",
            features: [
              "2 cleanings per year",
              "Annual comprehensive exam",
              "20% off all procedures",
              "Priority appointment scheduling",
              "Kids under 3 included FREE",
            ],
            cta: "Join Now",
            featured: true,
            badge: "Most Popular",
          },
          {
            name: "Teeth Whitening",
            tagline: "Professional brightening",
            price: "$299",
            period: " per session",
            features: [
              "Up to 8 shades brighter",
              "60-minute in-office treatment",
              "Take-home maintenance kit",
              "Results guaranteed",
            ],
            cta: "Book Consultation",
          },
        ]

    const faqEyebrow = props.faq?.eyebrow ?? "Got Questions?"
    const faqHeading = props.faq?.heading ?? "Frequently Asked Questions"
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: "Do you accept dental insurance?",
            answer:
              "Yes! We accept most major dental insurance plans including Delta Dental, Cigna, Aetna, MetLife, and United Healthcare. Our team will verify your benefits before your visit and help maximize your coverage. For uninsured patients, we offer our membership plan and flexible payment options.",
          },
          {
            question: "Is teeth whitening safe for sensitive teeth?",
            answer:
              "Absolutely. We use professional-grade whitening systems that are formulated to minimize sensitivity. During your consultation, we'll assess your sensitivity levels and customize the treatment accordingly. We also provide desensitizing treatments before and after whitening to ensure your comfort.",
          },
          {
            question: "How often should I visit the dentist?",
            answer:
              "We recommend visiting every six months for routine checkups and cleanings. However, some patients with specific conditions like gum disease may benefit from more frequent visits (every 3-4 months). We'll create a personalized schedule based on your individual needs.",
          },
          {
            question: "What should I do in a dental emergency?",
            answer:
              "Call our 24/7 emergency hotline at (555) 123-4567 immediately. For knocked-out teeth, handle by the crown (not the root), rinse gently, and try to reinsert or store in milk. For severe pain, swelling, or bleeding, seek immediate care. We reserve same-day slots for emergencies.",
          },
          {
            question: "Do you offer financing options?",
            answer:
              "Yes, we partner with CareCredit and LendingClub to offer 0% interest financing for qualifying patients. We also offer in-house payment plans for treatments over $500. Our goal is to make quality dental care accessible to everyone, regardless of budget.",
          },
          {
            question: "At what age should my child first see a dentist?",
            answer:
              "The American Dental Association recommends children visit a dentist by their first birthday or within 6 months after their first tooth appears. Early visits help us monitor development, provide preventive care, and establish positive dental habits that last a lifetime.",
          },
        ]

    const contactHeading =
      props.contact?.heading ?? "Ready for Your Brightest Smile?"
    const contactDesc =
      props.contact?.description ??
      "Book your appointment today and take the first step toward the healthy, beautiful smile you deserve. New patients receive a comprehensive exam and digital X-rays for just $89."
    const contactPhoneLabel = props.contact?.phoneLabel ?? "Call Us"
    const contactPhone = props.contact?.phone ?? "(555) 123-4567"
    const contactAddressLabel = props.contact?.addressLabel ?? "Visit Us"
    const contactAddress =
      props.contact?.address ??
      "1245 Smile Avenue, Suite 200, San Francisco, CA 94102"
    const contactHoursLabel = props.contact?.hoursLabel ?? "Hours"
    const contactHours =
      props.contact?.hours ?? "Mon-Fri 8am-6pm | Sat 9am-2pm"
    const contactFormHeading =
      props.contact?.formHeading ?? "Request Appointment"
    const contactServices = props.contact?.services?.length
      ? props.contact.services
      : [
          "General Checkup & Cleaning",
          "Teeth Whitening",
          "Dental Implants",
          "Invisalign Consultation",
          "Emergency Care",
          "Other",
        ]
    const contactSubmit = props.contact?.submitCta ?? "Request Appointment"
    const contactFormNote =
      props.contact?.formNote ??
      "We'll confirm your appointment within 2 hours during business hours."

    const footerTagline =
      props.footer?.tagline ??
      "Creating beautiful, healthy smiles for the whole family. Your comfort and care are our top priorities."
    const footerLinksHeading = props.footer?.linksHeading ?? "Quick Links"
    const footerQuickLinks = props.footer?.quickLinks?.length
      ? props.footer.quickLinks
      : ["Services", "Our Team", "Testimonials", "FAQ", "Contact"]
    const footerServicesHeading = props.footer?.servicesHeading ?? "Services"
    const footerServiceLinks = props.footer?.serviceLinks?.length
      ? props.footer.serviceLinks
      : [
          "Preventive Care",
          "Teeth Whitening",
          "Dental Implants",
          "Invisalign",
          "Emergency Care",
        ]
    const footerContactHeading = props.footer?.contactHeading ?? "Contact"
    const footerAddress =
      props.footer?.address ??
      "1245 Smile Avenue, Suite 200, San Francisco, CA 94102"
    const footerPhone = props.footer?.phone ?? "(555) 123-4567"
    const footerEmail = props.footer?.email ?? "hello@brightsmile.dental"
    const footerSocials = props.footer?.socials?.length
      ? props.footer.socials
      : ["Facebook", "Instagram", "Twitter"]
    const footerCopyright =
      props.footer?.copyright ?? "BrightSmile Dental. All rights reserved."
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Privacy Policy", "Terms of Service", "Accessibility"]

    // Decorative tooth/smile glyph (inline svg, currentColor).
    const ToothMark = () => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M14.828 14.828a4 4 0 0 1-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
      </svg>
    )

    const LogoBadge = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "grid place-items-center rounded-xl bg-primary text-primary-foreground",
          className,
        )}
        aria-hidden="true"
      >
        <ToothMark />
      </span>
    )

    const Star = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 0 0-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 0 0 .951-.69l1.07-3.292z" />
      </svg>
    )

    const Check = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M5 13l4 4L19 7" />
      </svg>
    )

    const PhoneIcon = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M3 5a2 2 0 0 1 2-2h3.28a1 1 0 0 1 .948.684l1.498 4.493a1 1 0 0 1-.502 1.21l-2.257 1.13a11.042 11.042 0 0 0 5.516 5.516l1.13-2.257a1 1 0 0 1 1.21-.502l4.493 1.498a1 1 0 0 1 .684.949V19a2 2 0 0 1-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    )

    const PinIcon = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 0 1-2.827 0l-4.244-4.243a8 8 0 1 1 11.314 0z" />
        <path d="M15 11a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
      </svg>
    )

    const MailIcon = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z" />
      </svg>
    )

    const ClockIcon = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
      </svg>
    )

    // 6 service icons, each tinted with a different token accent for the
    // playful multicolor grid (rotates primary / accent / chart-1..5).
    const serviceIcons: ReactNode[] = [
      // shield check (preventive)
      <svg
        key="shield"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-8"
        aria-hidden="true"
      >
        <path d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
      </svg>,
      // bolt (whitening)
      <svg
        key="bolt"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-8"
        aria-hidden="true"
      >
        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>,
      // sparkle (cosmetic)
      <svg
        key="sparkle"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-8"
        aria-hidden="true"
      >
        <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>,
      // heart/implant
      <svg
        key="heart"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-8"
        aria-hidden="true"
      >
        <path d="M4.318 6.318a4.5 4.5 0 0 0 0 6.364L12 20.364l7.682-7.682a4.5 4.5 0 0 0-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 0 0-6.364 0z" />
      </svg>,
      // family (group)
      <svg
        key="family"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-8"
        aria-hidden="true"
      >
        <path d="M12 4.354a4 4 0 1 1 0 5.292M15 21H3v-1a6 6 0 0 1 12 0v1zm0 0h6v-1a6 6 0 0 0-9-5.197M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z" />
      </svg>,
      // alert (emergency)
      <svg
        key="alert"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-8"
        aria-hidden="true"
      >
        <path d="M12 8v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
      </svg>,
    ]
    // tinted icon-tile + price color per service card (token accents only).
    const serviceTints = [
      { tile: "bg-primary", price: "text-primary" },
      { tile: "bg-accent", price: "text-accent-foreground" },
      { tile: "bg-chart-1", price: "text-chart-1" },
      { tile: "bg-chart-2", price: "text-chart-2" },
      { tile: "bg-chart-4", price: "text-chart-4" },
      { tile: "bg-chart-5", price: "text-chart-5" },
    ]
    // numbered-step accents (token-only rotation).
    const stepAccents = [
      { border: "border-primary", chip: "bg-primary/10 text-primary" },
      { border: "border-accent", chip: "bg-accent text-accent-foreground" },
      { border: "border-chart-1", chip: "bg-chart-1/10 text-chart-1" },
    ]

    return (
      <div
        className={cn(
          "min-h-svh bg-background font-sans text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
          <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => go(nav[0])}
              className="flex items-center gap-3 text-left"
            >
              <LogoBadge className="size-10" />
              <span className="text-2xl font-bold text-primary">{brand}</span>
            </button>
            <div className="hidden items-center gap-8 md:flex">
              {nav.slice(0, -1).map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => go(label)}
                  className="font-medium text-muted-foreground transition-colors hover:text-primary"
                >
                  {label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => go(nav[nav.length - 1])}
                className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground transition-all hover:scale-105 hover:bg-primary/90"
              >
                {nav[nav.length - 1]}
              </button>
            </div>
            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              onClick={() => setMobileOpen((v: boolean) => !v)}
              className="p-2 text-muted-foreground md:hidden"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="size-6"
                aria-hidden="true"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
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
          <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/20">
            <div aria-hidden="true" className="absolute inset-0 opacity-30">
              <div className="absolute left-10 top-20 size-72 rounded-full bg-primary/40 blur-3xl" />
              <div className="absolute bottom-20 right-10 size-96 rounded-full bg-accent/50 blur-3xl" />
            </div>
            <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
              <div className="grid items-center gap-12 lg:grid-cols-2">
                <div className="space-y-8">
                  <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                    <span className="size-2 animate-pulse rounded-full bg-primary" />
                    {heroBadge}
                  </div>
                  <h1 className="text-5xl font-extrabold leading-tight text-foreground lg:text-7xl">
                    {heroPre}
                    <br />
                    <span className="bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent">
                      {heroHighlight}
                    </span>
                  </h1>
                  <p className="max-w-lg text-xl leading-relaxed text-muted-foreground">
                    {heroSub}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-lg font-bold text-primary-foreground transition-all hover:scale-105 hover:shadow-xl"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="size-5"
                        aria-hidden="true"
                      >
                        <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" />
                      </svg>
                      {heroPrimary}
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="inline-flex items-center gap-2 rounded-full border-2 border-border bg-background px-8 py-4 text-lg font-bold text-primary transition-all hover:bg-muted"
                    >
                      {heroSecondary}
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="size-5"
                        aria-hidden="true"
                      >
                        <path d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex items-center gap-6 pt-4">
                    <div className="flex -space-x-3">
                      {heroAvatarAlts.map((alt) => (
                        <Image
                          key={alt}
                          alt={alt}
                          w={100}
                          h={100}
                          className="size-12 rounded-full border-2 border-background object-cover"
                        />
                      ))}
                      <div className="grid size-12 place-items-center rounded-full border-2 border-background bg-primary text-sm font-bold text-primary-foreground">
                        {heroAvatarMore}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-primary">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className="size-5" />
                        ))}
                      </div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {heroReviews}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="relative flex items-center justify-center lg:h-[600px]">
                  <div className="relative">
                    <div
                      aria-hidden="true"
                      className="absolute left-1/2 top-1/2 size-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-2xl lg:size-96"
                    />
                    <div className="relative size-80 overflow-hidden rounded-3xl shadow-2xl lg:size-96">
                      <Image
                        alt={heroImageAlt}
                        w={800}
                        h={800}
                        className="size-full object-cover"
                      />
                    </div>
                    <div className="absolute -bottom-6 -left-6 rounded-2xl bg-card p-4 shadow-xl">
                      <div className="flex items-center gap-3">
                        <div className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
                          <Check className="size-6" />
                        </div>
                        <div>
                          <p className="font-bold text-card-foreground">
                            {heroBadgeOne.title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {heroBadgeOne.sub}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="absolute -right-6 -top-6 rounded-2xl bg-card p-4 shadow-xl">
                      <div className="flex items-center gap-3">
                        <div className="grid size-12 place-items-center rounded-full bg-accent text-accent-foreground">
                          <ClockIcon className="size-6" />
                        </div>
                        <div>
                          <p className="font-bold text-card-foreground">
                            {heroBadgeTwo.title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {heroBadgeTwo.sub}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Services */}
          <section className="bg-background py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-accent px-4 py-1 text-sm font-semibold text-accent-foreground">
                  {servicesEyebrow}
                </span>
                <h2 className="mb-4 text-4xl font-bold text-foreground lg:text-5xl">
                  {servicesHeading}
                </h2>
                <p className="text-xl text-muted-foreground">{servicesDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {serviceItems.map((item, i) => {
                  const tint = serviceTints[i % serviceTints.length]
                  return (
                    <div
                      key={item.title}
                      className="group rounded-2xl border border-border bg-card p-8 transition-all hover:-translate-y-1 hover:shadow-xl"
                    >
                      <div
                        className={cn(
                          "mb-6 grid size-16 place-items-center rounded-2xl text-primary-foreground transition-transform group-hover:scale-110",
                          tint.tile,
                        )}
                      >
                        {serviceIcons[i % serviceIcons.length]}
                      </div>
                      <h3 className="mb-3 text-2xl font-bold text-card-foreground">
                        {item.title}
                      </h3>
                      <p className="mb-4 text-muted-foreground">
                        {item.description}
                      </p>
                      <p className={cn("font-semibold", tint.price)}>
                        {item.price}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>

          {/* Stats band */}
          <section className="bg-gradient-to-r from-primary to-primary/80 py-16 text-primary-foreground">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
                {statsItems.map((s) => (
                  <div key={s.label}>
                    <p className="mb-2 text-5xl font-bold lg:text-6xl">
                      {s.value}
                    </p>
                    <p className="font-medium text-primary-foreground/80">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Team */}
          <section className="bg-muted py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1 text-sm font-semibold text-primary">
                  {teamEyebrow}
                </span>
                <h2 className="mb-4 text-4xl font-bold text-foreground lg:text-5xl">
                  {teamHeading}
                </h2>
                <p className="text-xl text-muted-foreground">{teamDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                {teamMembers.map((m) => (
                  <div
                    key={m.name}
                    className="group overflow-hidden rounded-2xl bg-card shadow-lg transition-all hover:shadow-2xl"
                  >
                    <div className="h-80 overflow-hidden">
                      <Image
                        alt={m.imageAlt}
                        w={400}
                        h={500}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="mb-1 text-xl font-bold text-card-foreground">
                        {m.name}
                      </h3>
                      <p className="mb-3 font-semibold text-primary">
                        {m.role}
                      </p>
                      <p className="mb-4 text-sm text-muted-foreground">
                        {m.bio}
                      </p>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          aria-label={`LinkedIn profile of ${m.name}`}
                          onClick={() => go(`${m.name} on LinkedIn`)}
                          className="grid size-10 place-items-center rounded-full bg-secondary text-secondary-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="size-5"
                            aria-hidden="true"
                          >
                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          aria-label={`Email ${m.name}`}
                          onClick={() => go(`Email ${m.name}`)}
                          className="grid size-10 place-items-center rounded-full bg-secondary text-secondary-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                        >
                          <MailIcon className="size-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Office gallery */}
          <section className="bg-background py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-accent px-4 py-1 text-sm font-semibold text-accent-foreground">
                  {galleryEyebrow}
                </span>
                <h2 className="mb-4 text-4xl font-bold text-foreground lg:text-5xl">
                  {galleryHeading}
                </h2>
                <p className="text-xl text-muted-foreground">{galleryDesc}</p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {galleryItems.map((g, i) => (
                  <div
                    key={g.caption}
                    className={cn(
                      "group relative overflow-hidden rounded-2xl",
                      (i === 1 || i === 2 || i === 5) && "lg:col-span-2",
                    )}
                  >
                    <Image
                      alt={g.imageAlt}
                      w={i === 1 || i === 2 || i === 5 ? 1000 : 600}
                      h={400}
                      loading="lazy"
                      className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 flex items-end bg-gradient-to-t from-foreground/60 to-transparent p-6 opacity-0 transition-opacity group-hover:opacity-100">
                      <p className="font-semibold text-background">
                        {g.caption}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Steps — Your First Visit */}
          <section className="bg-gradient-to-b from-muted to-background py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1 text-sm font-semibold text-primary">
                  {stepsEyebrow}
                </span>
                <h2 className="mb-4 text-4xl font-bold text-foreground lg:text-5xl">
                  {stepsHeading}
                </h2>
                <p className="text-xl text-muted-foreground">{stepsDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-3">
                {stepItems.map((step, i) => {
                  const accent = stepAccents[i % stepAccents.length]
                  return (
                    <div key={step.title} className="relative">
                      <div
                        className={cn(
                          "rounded-2xl border-t-4 bg-card p-8 text-center shadow-lg",
                          accent.border,
                        )}
                      >
                        <div
                          className={cn(
                            "mx-auto mb-6 grid size-20 place-items-center rounded-full text-3xl font-bold",
                            accent.chip,
                          )}
                        >
                          {i + 1}
                        </div>
                        <h3 className="mb-3 text-2xl font-bold text-card-foreground">
                          {step.title}
                        </h3>
                        <p className="text-muted-foreground">
                          {step.description}
                        </p>
                      </div>
                      {i < stepItems.length - 1 ? (
                        <div
                          aria-hidden="true"
                          className="absolute -right-4 top-1/2 hidden h-0.5 w-8 bg-primary/40 md:block"
                        />
                      ) : null}
                    </div>
                  )
                })}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="bg-gradient-to-br from-primary/10 to-accent/20 py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-card px-4 py-1 text-sm font-semibold text-primary">
                  {testimonialsEyebrow}
                </span>
                <h2 className="mb-4 text-4xl font-bold text-foreground lg:text-5xl">
                  {testimonialsHeading}
                </h2>
                <p className="text-xl text-muted-foreground">
                  {testimonialsDesc}
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {testimonialItems.map((t) => (
                  <div
                    key={t.name}
                    className="rounded-2xl bg-card p-8 shadow-lg"
                  >
                    <div className="mb-4 flex items-center gap-1 text-primary">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="size-5" />
                      ))}
                    </div>
                    <p className="mb-6 leading-relaxed text-card-foreground">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-4">
                      <Image
                        alt={t.avatarAlt}
                        w={100}
                        h={100}
                        loading="lazy"
                        className="size-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-bold text-card-foreground">
                          {t.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {t.meta}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="bg-background py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1 text-sm font-semibold text-primary">
                  {pricingEyebrow}
                </span>
                <h2 className="mb-4 text-4xl font-bold text-foreground lg:text-5xl">
                  {pricingHeading}
                </h2>
                <p className="text-xl text-muted-foreground">{pricingDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-3">
                {pricingPlans.map((plan) => (
                  <div
                    key={plan.name}
                    className={cn(
                      "relative rounded-2xl p-8 shadow-lg",
                      plan.featured
                        ? "bg-gradient-to-b from-primary to-primary/80 text-primary-foreground shadow-xl md:-translate-y-4"
                        : "border border-border bg-card",
                    )}
                  >
                    {plan.badge ? (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-accent px-4 py-1 text-sm font-semibold text-accent-foreground">
                        {plan.badge}
                      </div>
                    ) : null}
                    <h3
                      className={cn(
                        "mb-2 text-2xl font-bold",
                        plan.featured ? "" : "text-card-foreground",
                      )}
                    >
                      {plan.name}
                    </h3>
                    <p
                      className={cn(
                        "mb-6",
                        plan.featured
                          ? "text-primary-foreground/80"
                          : "text-muted-foreground",
                      )}
                    >
                      {plan.tagline}
                    </p>
                    <div className="mb-6">
                      <span
                        className={cn(
                          "text-5xl font-bold",
                          plan.featured ? "" : "text-card-foreground",
                        )}
                      >
                        {plan.price}
                      </span>
                      <span
                        className={
                          plan.featured
                            ? "text-primary-foreground/80"
                            : "text-muted-foreground"
                        }
                      >
                        {plan.period}
                      </span>
                    </div>
                    <ul className="mb-8 space-y-3">
                      {plan.features.map((f) => (
                        <li
                          key={f}
                          className={cn(
                            "flex items-center gap-3",
                            plan.featured ? "" : "text-muted-foreground",
                          )}
                        >
                          <Check
                            className={cn(
                              "size-5 shrink-0",
                              plan.featured
                                ? "text-primary-foreground/80"
                                : "text-primary",
                            )}
                          />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => go(plan.cta)}
                      className={cn(
                        "block w-full rounded-full py-4 text-center font-semibold transition-colors",
                        plan.featured
                          ? "bg-background text-primary hover:bg-muted"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                      )}
                    >
                      {plan.cta}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-gradient-to-b from-muted to-background py-20">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <span className="mb-4 inline-block rounded-full bg-accent px-4 py-1 text-sm font-semibold text-accent-foreground">
                  {faqEyebrow}
                </span>
                <h2 className="text-4xl font-bold text-foreground lg:text-5xl">
                  {faqHeading}
                </h2>
              </div>
              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.question}
                    className="group overflow-hidden rounded-xl bg-card shadow-md"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between px-6 py-5">
                      <span className="pr-8 text-lg font-semibold text-card-foreground">
                        {item.question}
                      </span>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="size-5 shrink-0 text-primary transition group-open:rotate-180"
                        aria-hidden="true"
                      >
                        <path d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="px-6 pb-5 leading-relaxed text-muted-foreground">
                      {item.answer}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* CTA + appointment form */}
          <section className="relative overflow-hidden bg-gradient-to-br from-primary to-primary/80 py-20">
            <div aria-hidden="true" className="absolute inset-0 opacity-10">
              <div className="absolute left-1/4 top-0 size-96 rounded-full bg-primary-foreground blur-3xl" />
              <div className="absolute bottom-0 right-1/4 size-96 rounded-full bg-accent blur-3xl" />
            </div>
            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-12 lg:grid-cols-2">
                <div className="text-primary-foreground">
                  <h2 className="mb-6 text-4xl font-bold lg:text-5xl">
                    {contactHeading}
                  </h2>
                  <p className="mb-8 text-xl leading-relaxed text-primary-foreground/80">
                    {contactDesc}
                  </p>
                  <div className="mb-8 space-y-4">
                    <button
                      type="button"
                      onClick={() => go(`Call ${contactPhone}`)}
                      className="flex w-full items-center gap-4 text-left"
                    >
                      <span className="grid size-12 shrink-0 place-items-center rounded-full bg-primary-foreground/20">
                        <PhoneIcon className="size-6" />
                      </span>
                      <span>
                        <span className="block text-sm text-primary-foreground/70">
                          {contactPhoneLabel}
                        </span>
                        <span className="block text-lg font-semibold">
                          {contactPhone}
                        </span>
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => go(contactAddress)}
                      className="flex w-full items-center gap-4 text-left"
                    >
                      <span className="grid size-12 shrink-0 place-items-center rounded-full bg-primary-foreground/20">
                        <PinIcon className="size-6" />
                      </span>
                      <span>
                        <span className="block text-sm text-primary-foreground/70">
                          {contactAddressLabel}
                        </span>
                        <span className="block text-lg font-semibold">
                          {contactAddress}
                        </span>
                      </span>
                    </button>
                    <div className="flex items-center gap-4">
                      <span className="grid size-12 shrink-0 place-items-center rounded-full bg-primary-foreground/20">
                        <ClockIcon className="size-6" />
                      </span>
                      <span>
                        <span className="block text-sm text-primary-foreground/70">
                          {contactHoursLabel}
                        </span>
                        <span className="block text-lg font-semibold">
                          {contactHours}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl bg-card p-8 shadow-2xl">
                  <h3 className="mb-6 text-2xl font-bold text-card-foreground">
                    {contactFormHeading}
                  </h3>
                  <form
                    className="space-y-4"
                    onSubmit={(e) => {
                      e.preventDefault()
                      go(contactSubmit)
                    }}
                  >
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label
                          htmlFor="bs2-first"
                          className="mb-1 block text-sm font-medium text-foreground"
                        >
                          First Name
                        </label>
                        <input
                          id="bs2-first"
                          type="text"
                          required
                          placeholder="John"
                          className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="bs2-last"
                          className="mb-1 block text-sm font-medium text-foreground"
                        >
                          Last Name
                        </label>
                        <input
                          id="bs2-last"
                          type="text"
                          required
                          placeholder="Smith"
                          className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring"
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="bs2-email"
                        className="mb-1 block text-sm font-medium text-foreground"
                      >
                        Email
                      </label>
                      <input
                        id="bs2-email"
                        type="email"
                        required
                        placeholder="john@example.com"
                        className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="bs2-phone"
                        className="mb-1 block text-sm font-medium text-foreground"
                      >
                        Phone
                      </label>
                      <input
                        id="bs2-phone"
                        type="tel"
                        required
                        placeholder="(555) 123-4567"
                        className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="bs2-service"
                        className="mb-1 block text-sm font-medium text-foreground"
                      >
                        Service Needed
                      </label>
                      <select
                        id="bs2-service"
                        className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring"
                      >
                        {contactServices.map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor="bs2-date"
                        className="mb-1 block text-sm font-medium text-foreground"
                      >
                        Preferred Date
                      </label>
                      <input
                        id="bs2-date"
                        type="date"
                        className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="bs2-message"
                        className="mb-1 block text-sm font-medium text-foreground"
                      >
                        Message (Optional)
                      </label>
                      <textarea
                        id="bs2-message"
                        rows={3}
                        placeholder="Tell us about your dental concerns..."
                        className="w-full resize-none rounded-lg border border-input bg-background px-4 py-3 text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full rounded-lg bg-primary py-4 text-lg font-bold text-primary-foreground transition-all hover:scale-[1.02] hover:shadow-lg"
                    >
                      {contactSubmit}
                    </button>
                    <p className="text-center text-sm text-muted-foreground">
                      {contactFormNote}
                    </p>
                  </form>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-foreground py-16 text-background">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-12 md:grid-cols-2 lg:grid-cols-4">
              {/* Brand */}
              <div>
                <div className="mb-6 flex items-center gap-3">
                  <LogoBadge className="size-10" />
                  <span className="text-2xl font-bold">{brand}</span>
                </div>
                <p className="mb-6 leading-relaxed text-background/60">
                  {footerTagline}
                </p>
                <div className="flex gap-4">
                  {footerSocials.map((social) => (
                    <button
                      key={social}
                      type="button"
                      aria-label={social}
                      onClick={() => go(social)}
                      className="grid size-10 place-items-center rounded-full bg-background/10 text-background/70 transition-colors hover:bg-primary hover:text-primary-foreground"
                    >
                      <span className="text-sm font-bold">
                        {social.charAt(0)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick links */}
              <div>
                <h4 className="mb-6 text-lg font-bold">{footerLinksHeading}</h4>
                <ul className="space-y-3">
                  {footerQuickLinks.map((link) => (
                    <li key={link}>
                      <button
                        type="button"
                        onClick={() => go(link)}
                        className="text-background/60 transition-colors hover:text-background"
                      >
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Services */}
              <div>
                <h4 className="mb-6 text-lg font-bold">
                  {footerServicesHeading}
                </h4>
                <ul className="space-y-3">
                  {footerServiceLinks.map((link) => (
                    <li key={link}>
                      <button
                        type="button"
                        onClick={() => go(link)}
                        className="text-background/60 transition-colors hover:text-background"
                      >
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Contact */}
              <div>
                <h4 className="mb-6 text-lg font-bold">
                  {footerContactHeading}
                </h4>
                <ul className="space-y-3 text-background/60">
                  <li className="flex items-start gap-3">
                    <PinIcon className="mt-0.5 size-5 shrink-0 text-primary" />
                    <span>{footerAddress}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <PhoneIcon className="size-5 shrink-0 text-primary" />
                    <button
                      type="button"
                      onClick={() => go(`Call ${footerPhone}`)}
                      className="transition-colors hover:text-background"
                    >
                      {footerPhone}
                    </button>
                  </li>
                  <li className="flex items-center gap-3">
                    <MailIcon className="size-5 shrink-0 text-primary" />
                    <button
                      type="button"
                      onClick={() => go(`Email ${footerEmail}`)}
                      className="transition-colors hover:text-background"
                    >
                      {footerEmail}
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col items-center justify-between gap-4 border-t border-background/20 pt-8 md:flex-row">
              <p className="text-background/50">
                © {new Date().getFullYear()} {footerCopyright}
              </p>
              <div className="flex gap-6">
                {footerLegal.map((link) => (
                  <button
                    key={link}
                    type="button"
                    onClick={() => go(link)}
                    className="text-sm text-background/50 transition-colors hover:text-background"
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
