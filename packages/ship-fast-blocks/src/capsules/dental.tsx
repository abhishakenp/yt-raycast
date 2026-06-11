import { useState, type ReactNode } from "react"
import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * DentalKimiPage — a complete, self-contained dental-practice / dentist LANDING page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "Bright Smile Dental" design:
 * a clean, calming, light clinical aesthetic with a mint/primary accent on a
 * soft slate-neutral canvas. It pairs a split hero (new-patients pill, big
 * headline with an accented word, dual call/book CTAs, trust badges, and a
 * floating ratings card over a treatment-room photo) with an insurance-provider
 * logo strip, a 6-up services grid (preventive, cosmetic, implants, ortho,
 * restorative, emergency), a numbered "why choose us" split, an office-tour
 * photo gallery, a 4-up meet-the-team grid, a 3-tier pricing/membership block,
 * a dark stats band, a 6-up patient-testimonials grid with star ratings, a FAQ
 * accordion, a mint CTA banner with phone/booking, and a rich 4-column footer.
 *
 * Tokens only: mint/green accents map to `primary`, dark slate to
 * `bg-foreground`/`bg-card`, soft bands to `bg-muted`. Every nav item / CTA /
 * link / form-submit routes through `useNavigate` (never a dead "#"). All
 * imagery (hero, gallery, dentist headshots, patient avatars) uses the
 * alt-driven <Image> component. Callers supply ONLY content; rich defaults make
 * it render the full page with no props at all.
 */
export const DentalKimiPage = defineCapsule({
  name: "DentalKimiPage",
  description:
    "Complete dental-practice / dentist / dental-clinic LANDING page with a clean, calming, light clinical aesthetic and a mint-green primary accent on a soft neutral canvas. Includes a split hero (now-accepting-new-patients badge, big headline with an accented word, Schedule-Your-Visit + click-to-call CTAs, trust badges for same-day emergencies / insurance accepted / pain-free, and a floating 4.9-star ratings card over a treatment-room photo), an insurance-provider logo strip (Delta Dental, Cigna, Aetna, MetLife, Guardian, Humana), a 6-up services grid (Preventive Care, Cosmetic Dentistry, Dental Implants, Orthodontics, Restorative Dentistry, Emergency Care) with icons and bullet lists, a numbered why-choose-us split (advanced technology, pain-free techniques, transparent pricing, family-friendly), an office-tour photo gallery, a 4-up meet-the-team grid of board-certified dentists with headshots and LinkedIn, a 3-tier transparent pricing / in-house membership block, a dark stats band (years, patients, rating, satisfaction), a 6-up patient-testimonials grid with five-star ratings and patient avatars, a FAQ accordion, a mint call-to-action banner with phone and online booking, and a 4-column footer with services, office hours, and contact info. Use as the ROOT/home page for dentists, dental offices, orthodontists, cosmetic or pediatric dental clinics, oral surgeons, and family dental care when a trustworthy, conversion-focused, appointment-driven medical site is wanted. Supply content only — brand, nav, hero, services, team, pricing, testimonials, faq, contact, footer; the block owns all layout and styling.",
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
        /** Accented word inside the headline (rendered in the primary color). */
        highlight: z.string().optional(),
        headingPost: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        phone: z.string().optional(),
        imageAlt: z.string().optional(),
        rating: z.string().optional(),
        reviewsLabel: z.string().optional(),
        badges: z.array(z.string()).optional(),
      })
      .optional(),
    /** Insurance-provider logo strip. */
    logos: z
      .object({
        label: z.string().optional(),
        items: z.array(z.string()).optional(),
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
              points: z.array(z.string()),
            }),
          )
          .optional(),
      })
      .optional(),
    /** "Why choose us" numbered split. */
    why: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        imageAlt: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Office-tour photo gallery. */
    gallery: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        images: z.array(z.string()).optional(),
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
    /** Pricing / membership block. */
    pricing: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        note: z.string().optional(),
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
    /** Dark stats band. */
    stats: z
      .object({
        items: z
          .array(z.object({ value: z.string(), label: z.string() }))
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
    /** FAQ accordion. */
    faq: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ question: z.string(), answer: z.string() }))
          .optional(),
      })
      .optional(),
    /** Bottom CTA banner. */
    contact: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        callCta: z.string().optional(),
        bookCta: z.string().optional(),
        perks: z.array(z.string()).optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        tagline: z.string().optional(),
        servicesHeading: z.string().optional(),
        serviceLinks: z.array(z.string()).optional(),
        hoursHeading: z.string().optional(),
        hours: z
          .array(z.object({ day: z.string(), time: z.string() }))
          .optional(),
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
    const brand = props.brand ?? "Bright Smile"
    const nav = props.nav?.length
      ? props.nav
      : ["Services", "Our Team", "Reviews", "FAQ", "Book Appointment"]

    const heroBadge = props.hero?.badge ?? "Now accepting new patients"
    const heroPre = props.hero?.headingPre ?? "Your smile deserves"
    const heroHighlight = props.hero?.highlight ?? "exceptional"
    const heroPost = props.hero?.headingPost ?? "care"
    const heroSub =
      props.hero?.subheading ??
      "Experience modern, gentle dentistry at Bright Smile Dental. Our Portland practice combines cutting-edge technology with compassionate care for the whole family."
    const heroPrimary = props.hero?.primaryCta ?? "Schedule Your Visit"
    const heroPhone = props.hero?.phone ?? "(503) 555-0142"
    const heroImageAlt =
      props.hero?.imageAlt ??
      "Modern dental office treatment room with dental chair and equipment"
    const heroRating = props.hero?.rating ?? "4.9"
    const heroReviews = props.hero?.reviewsLabel ?? "From 324 reviews"
    const heroBadges = props.hero?.badges?.length
      ? props.hero.badges
      : ["Same-day emergencies", "Insurance accepted", "Pain-free techniques"]

    const logosLabel =
      props.logos?.label ?? "Trusted by leading insurance providers"
    const logoItems = props.logos?.items?.length
      ? props.logos.items
      : ["Delta Dental", "Cigna", "Aetna", "MetLife", "Guardian", "Humana"]

    const servicesEyebrow = props.services?.eyebrow ?? "Our Services"
    const servicesHeading =
      props.services?.heading ??
      "Comprehensive dental care for your entire family"
    const servicesDesc =
      props.services?.description ??
      "From routine cleanings to advanced cosmetic procedures, we provide a full spectrum of dental services using the latest technology."
    const serviceItems = props.services?.items?.length
      ? props.services.items
      : [
          {
            title: "Preventive Care",
            description:
              "Regular checkups, professional cleanings, fluoride treatments, and dental sealants to keep your smile healthy and catch issues early.",
            points: [
              "Comprehensive exams",
              "Digital X-rays",
              "Oral cancer screenings",
            ],
          },
          {
            title: "Cosmetic Dentistry",
            description:
              "Transform your smile with veneers, professional whitening, bonding, and smile makeovers designed to boost your confidence.",
            points: [
              "Porcelain veneers",
              "Professional whitening",
              "Invisalign clear aligners",
            ],
          },
          {
            title: "Dental Implants",
            description:
              "Permanent tooth replacement solutions that look, feel, and function like natural teeth. From single implants to full-arch restorations.",
            points: [
              "Single tooth implants",
              "All-on-4 full arch",
              "Implant-supported bridges",
            ],
          },
          {
            title: "Orthodontics",
            description:
              "Straighten your teeth with modern orthodontic solutions including Invisalign, ceramic braces, and traditional braces for all ages.",
            points: [
              "Invisalign treatment",
              "Clear ceramic braces",
              "Retainers and night guards",
            ],
          },
          {
            title: "Restorative Dentistry",
            description:
              "Repair damaged or missing teeth with crowns, bridges, fillings, and dentures crafted to match your natural smile perfectly.",
            points: [
              "CEREC same-day crowns",
              "Tooth-colored fillings",
              "Custom dentures",
            ],
          },
          {
            title: "Emergency Care",
            description:
              "Dental emergencies can't wait. We offer same-day appointments for toothaches, broken teeth, knocked-out teeth, and other urgent issues.",
            points: [
              "Same-day appointments",
              "Root canal therapy",
              "Tooth extractions",
            ],
          },
        ]

    const whyEyebrow = props.why?.eyebrow ?? "Why Choose Us"
    const whyHeading = props.why?.heading ?? "Experience dentistry reimagined"
    const whyDesc =
      props.why?.description ??
      "At Bright Smile Dental, we've created an environment where advanced technology meets genuine human care. Your comfort and results are our top priorities."
    const whyImageAlt =
      props.why?.imageAlt ??
      "Female dentist performing gentle dental examination on comfortable patient in modern dental clinic"
    const whyItems = props.why?.items?.length
      ? props.why.items
      : [
          {
            title: "Advanced Technology",
            description:
              "Digital X-rays with 90% less radiation, 3D imaging, laser dentistry, and CEREC same-day crowns for precise, efficient care.",
          },
          {
            title: "Pain-Free Techniques",
            description:
              "Nitrous oxide, oral sedation, and The Wand computer-assisted anesthesia ensure your comfort throughout every procedure.",
          },
          {
            title: "Transparent Pricing",
            description:
              "No surprise bills. We provide upfront cost estimates, accept all major insurance plans, and offer flexible financing options.",
          },
          {
            title: "Family-Friendly",
            description:
              "From toddlers to grandparents, we create personalized care plans for every age with a gentle, patient-centered approach.",
          },
        ]

    const galleryEyebrow = props.gallery?.eyebrow ?? "Our Office"
    const galleryHeading =
      props.gallery?.heading ??
      "A welcoming space designed for your comfort"
    const galleryDesc =
      props.gallery?.description ??
      "Step into our modern, calming environment where every detail is designed to make your dental visit as pleasant as possible."
    const galleryImages = props.gallery?.images?.length
      ? props.gallery.images
      : [
          "Spacious modern dental clinic reception area with comfortable seating and natural light",
          "Modern dental examination room with advanced dental equipment and patient chair",
          "State-of-the-art digital dental x-ray machine in clean modern clinic",
          "Bright clean dental treatment room with advanced technology and ergonomic patient chair",
          "Welcoming dental office waiting area with plants and comfortable modern furniture",
        ]

    const teamEyebrow = props.team?.eyebrow ?? "Meet Our Team"
    const teamHeading = props.team?.heading ?? "Expert dentists who truly care"
    const teamDesc =
      props.team?.description ??
      "Our board-certified dentists bring decades of combined experience and a genuine passion for helping patients achieve their healthiest, most confident smiles."
    const teamMembers = props.team?.members?.length
      ? props.team.members
      : [
          {
            name: "Dr. Sarah Chen, DDS",
            role: "Founder & Lead Dentist",
            bio: "Harvard School of Dental Medicine graduate with 15+ years of experience in cosmetic and restorative dentistry.",
            imageAlt:
              "Professional headshot of Dr. Sarah Chen, female dentist in white coat with warm smile",
          },
          {
            name: "Dr. Michael Torres, DMD",
            role: "Orthodontist",
            bio: "Board-certified orthodontist specializing in Invisalign and complex bite corrections for patients of all ages.",
            imageAlt:
              "Professional headshot of Dr. Michael Torres, male dentist with friendly confident expression",
          },
          {
            name: "Dr. Emily Watson, DDS",
            role: "Pediatric Specialist",
            bio: "Certified pediatric dentist creating positive dental experiences for children from their first tooth through their teens.",
            imageAlt:
              "Professional headshot of Dr. Emily Watson, female dentist with warm approachable smile",
          },
          {
            name: "Dr. James Park, MD",
            role: "Oral Surgeon",
            bio: "Oral and maxillofacial surgeon specializing in dental implants, wisdom teeth extraction, and reconstructive procedures.",
            imageAlt:
              "Professional headshot of Dr. James Park, male oral surgeon with confident professional demeanor",
          },
        ]

    const pricingEyebrow = props.pricing?.eyebrow ?? "Pricing & Membership"
    const pricingHeading =
      props.pricing?.heading ?? "Transparent pricing for every budget"
    const pricingDesc =
      props.pricing?.description ??
      "We accept most insurance plans and offer an in-house membership plan for uninsured patients. No hidden fees, ever."
    const pricingNote =
      props.pricing?.note ??
      "All major credit cards, HSA/FSA, and CareCredit financing accepted. Insurance claims filed on your behalf."
    const pricingPlans = props.pricing?.plans?.length
      ? props.pricing.plans
      : [
          {
            name: "New Patient Exam",
            tagline: "Comprehensive first visit",
            price: "$99",
            period: " one-time",
            features: [
              "Complete oral examination",
              "Digital X-rays (4 bitewings)",
              "Oral cancer screening",
              "Personalized treatment plan",
            ],
            cta: "Book Now",
          },
          {
            name: "Annual Membership",
            tagline: "For uninsured patients",
            price: "$39",
            period: "/month",
            features: [
              "2 professional cleanings/year",
              "Annual exam & X-rays",
              "15% off all procedures",
              "Emergency visit included",
              "No waiting periods",
            ],
            cta: "Enroll Today",
            featured: true,
            badge: "Popular",
          },
          {
            name: "Professional Whitening",
            tagline: "In-office treatment",
            price: "$499",
            period: " one-time",
            features: [
              "Up to 8 shades lighter",
              "90-minute single session",
              "Take-home touch-up kit",
              "Results last 1-3 years",
            ],
            cta: "Book Consultation",
          },
        ]

    const statsItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "15+", label: "Years of Excellence" },
          { value: "10K+", label: "Happy Patients" },
          { value: "4.9", label: "Average Rating" },
          { value: "98%", label: "Patient Satisfaction" },
        ]

    const testimonialsEyebrow =
      props.testimonials?.eyebrow ?? "Patient Stories"
    const testimonialsHeading =
      props.testimonials?.heading ?? "What our patients are saying"
    const testimonialsDesc =
      props.testimonials?.description ??
      "Don't just take our word for it — hear from real patients who have transformed their smiles with us."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "I used to be terrified of the dentist, but Dr. Chen and her team completely changed that. The office is so calming, and they explain every step. I actually look forward to my cleanings now!",
            name: "Jennifer Martinez",
            meta: "Portland, OR • Patient since 2021",
            avatarAlt:
              "Portrait of Jennifer Martinez, female patient with bright confident smile",
          },
          {
            quote:
              "Got my Invisalign done here with Dr. Torres and the results are incredible! The process was smooth, payments were manageable, and my teeth look amazing. Best decision I made for my confidence.",
            name: "David Thompson",
            meta: "Beaverton, OR • Patient since 2022",
            avatarAlt:
              "Portrait of David Thompson, male patient with healthy white smile",
          },
          {
            quote:
              "Dr. Watson is amazing with kids! My 5-year-old was nervous for her first filling, but Dr. Watson made it fun and painless. The whole family comes here now — our 3 kids love the treasure box!",
            name: "Amanda Foster",
            meta: "Lake Oswego, OR • Patient since 2020",
            avatarAlt:
              "Portrait of Amanda Foster, mother and patient with warm genuine smile",
          },
          {
            quote:
              "Had a dental implant done by Dr. Park after losing a tooth in a bike accident. The procedure was way easier than I expected, and the new tooth looks completely natural. Highly recommend!",
            name: "Robert Chen",
            meta: "Hillsboro, OR • Patient since 2023",
            avatarAlt:
              "Portrait of Robert Chen, active male patient with athletic appearance",
          },
          {
            quote:
              "As someone without dental insurance, the membership plan has been a lifesaver. I get regular cleanings and save money on my fillings. The team never makes me feel judged about my budget.",
            name: "Sarah Williams",
            meta: "Portland, OR • Member since 2022",
            avatarAlt:
              "Portrait of Sarah Williams, young professional patient with natural smile",
          },
          {
            quote:
              "Came in for a same-day emergency appointment when I cracked my tooth on a Friday evening. They fit me in within an hour and fixed it that same visit. The care and speed were incredible!",
            name: "Michael Brooks",
            meta: "Tigard, OR • Patient since 2024",
            avatarAlt:
              "Portrait of Michael Brooks, professional male patient with grateful expression",
          },
        ]

    const faqEyebrow = props.faq?.eyebrow ?? "FAQ"
    const faqHeading = props.faq?.heading ?? "Common questions answered"
    const faqDesc =
      props.faq?.description ??
      "Everything you need to know about your visit to Bright Smile Dental."
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: "Do you accept dental insurance?",
            answer:
              "Yes! We accept all major dental insurance plans including Delta Dental, Cigna, Aetna, MetLife, Guardian, and Humana. We also file claims on your behalf and work to maximize your benefits. For uninsured patients, we offer an affordable in-house membership plan.",
          },
          {
            question: "How often should I visit the dentist?",
            answer:
              "We recommend visiting every 6 months for routine cleanings and checkups. However, some patients with specific conditions like gum disease may benefit from more frequent visits (every 3-4 months). We'll create a personalized schedule based on your individual needs.",
          },
          {
            question: "Is teeth whitening safe?",
            answer:
              "Absolutely! Professional teeth whitening performed by our dental team is safe and effective. We use clinically proven whitening agents and protective measures to minimize sensitivity. During your consultation, we'll assess your oral health to ensure whitening is right for you.",
          },
          {
            question: "What should I do in a dental emergency?",
            answer:
              "Call us immediately at (503) 555-0142. We reserve same-day appointments for emergencies including severe toothaches, knocked-out teeth, broken crowns, or dental trauma. If you have a life-threatening emergency, please call 911 or visit the nearest emergency room.",
          },
          {
            question: "Do you offer sedation dentistry?",
            answer:
              "Yes! We offer multiple sedation options to ensure your comfort: nitrous oxide (laughing gas) for mild anxiety, oral conscious sedation for moderate anxiety, and can arrange IV sedation for complex procedures. We'll discuss your options during your consultation.",
          },
          {
            question: "How long do dental implants last?",
            answer:
              "With proper care, dental implants can last a lifetime. The implant itself (the titanium post) is permanent, while the crown may need replacement after 10-15 years due to normal wear. Regular checkups, good oral hygiene, and avoiding smoking help ensure the longevity of your implants.",
          },
        ]

    const contactHeading = props.contact?.heading ?? "Ready to love your smile?"
    const contactDesc =
      props.contact?.description ??
      "Schedule your first visit today and experience the difference of truly patient-centered dental care. New patient exams are just $99."
    const contactCallCta = props.contact?.callCta ?? "Call (503) 555-0142"
    const contactBookCta = props.contact?.bookCta ?? "Book Online"
    const contactPerks = props.contact?.perks?.length
      ? props.contact.perks
      : ["Open 6 days a week", "Free parking available", "Evening appointments"]

    const footerTagline =
      props.footer?.tagline ??
      "Modern, compassionate dental care for the whole family. Your smile is our passion."
    const footerServicesHeading = props.footer?.servicesHeading ?? "Services"
    const footerServiceLinks = props.footer?.serviceLinks?.length
      ? props.footer.serviceLinks
      : [
          "Preventive Care",
          "Cosmetic Dentistry",
          "Dental Implants",
          "Orthodontics",
          "Emergency Care",
        ]
    const footerHoursHeading = props.footer?.hoursHeading ?? "Office Hours"
    const footerHours = props.footer?.hours?.length
      ? props.footer.hours
      : [
          { day: "Monday - Thursday", time: "8am - 6pm" },
          { day: "Friday", time: "8am - 4pm" },
          { day: "Saturday", time: "9am - 2pm" },
          { day: "Sunday", time: "Closed" },
        ]
    const footerContactHeading = props.footer?.contactHeading ?? "Contact"
    const footerAddress =
      props.footer?.address ?? "1847 NW Lovejoy St, Portland, OR 97209"
    const footerPhone = props.footer?.phone ?? "(503) 555-0142"
    const footerEmail = props.footer?.email ?? "hello@brightsmiledental.com"
    const footerSocials = props.footer?.socials?.length
      ? props.footer.socials
      : ["Facebook", "Instagram", "Google"]
    const footerCopyright =
      props.footer?.copyright ?? "Bright Smile Dental. All rights reserved."
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Privacy Policy", "Terms of Service", "Accessibility"]

    // Tooth/smile brand glyph (decorative inline svg, currentColor).
    const ToothMark = () => (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
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

    const Check = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 0 1 0 1.414l-8 8a1 1 0 0 1-1.414 0l-4-4a1 1 0 0 1 1.414-1.414L8 12.586l7.293-7.293a1 1 0 0 1 1.414 0z"
          clipRule="evenodd"
        />
      </svg>
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
        className="size-7"
        aria-hidden="true"
      >
        <path d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
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
        className="size-7"
        aria-hidden="true"
      >
        <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>,
      // implant (lightning/tooth)
      <svg
        key="implant"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-7"
        aria-hidden="true"
      >
        <path d="M19.428 15.428a2 2 0 0 0-1.022-.547l-2.387-.477a6 6 0 0 0-3.86.517l-.318.158a6 6 0 0 1-3.86.517L6.05 15.21a2 2 0 0 0-1.806.547M8 4h8l-1 1v5.172a2 2 0 0 0 .586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 0 0 9 10.172V5L8 4z" />
      </svg>,
      // smile (ortho)
      <svg
        key="smile"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-7"
        aria-hidden="true"
      >
        <path d="M14.828 14.828a4 4 0 0 1-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
      </svg>,
      // crown/restore
      <svg
        key="restore"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-7"
        aria-hidden="true"
      >
        <path d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
      </svg>,
      // emergency (alert)
      <svg
        key="emergency"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-7"
        aria-hidden="true"
      >
        <path d="M12 8v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
      </svg>,
    ]

    return (
      <div
        className={cn(
          "min-h-svh bg-background text-foreground antialiased",
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
              <span className="leading-tight">
                <span className="block text-xl font-semibold text-foreground">
                  {brand}
                </span>
                <span className="-mt-1 block text-sm text-muted-foreground">
                  Dental Care
                </span>
              </span>
            </button>
            <div className="hidden items-center gap-8 md:flex">
              {nav.slice(0, -1).map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => go(label)}
                  className="font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => go(nav[nav.length - 1])}
                className="rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
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
          <section className="relative overflow-hidden bg-muted">
            <div aria-hidden="true" className="absolute inset-0 opacity-30">
              <div className="absolute -right-40 -top-40 size-96 rounded-full bg-primary/20 blur-3xl" />
              <div className="absolute -left-20 top-20 size-72 rounded-full bg-secondary/40 blur-3xl" />
            </div>
            <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="text-center lg:text-left">
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-background px-4 py-2 shadow-sm">
                    <span className="size-2 animate-pulse rounded-full bg-primary" />
                    <span className="text-sm font-medium text-muted-foreground">
                      {heroBadge}
                    </span>
                  </div>
                  <h1 className="mb-6 text-4xl font-bold leading-tight text-foreground sm:text-5xl lg:text-6xl">
                    {heroPre} <span className="text-primary">{heroHighlight}</span>{" "}
                    {heroPost}
                  </h1>
                  <p className="mx-auto mb-8 max-w-xl text-lg leading-relaxed text-muted-foreground lg:mx-0">
                    {heroSub}
                  </p>
                  <div className="flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      {heroPrimary}
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
                        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => go(`Call ${heroPhone}`)}
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-8 py-4 text-lg font-semibold text-foreground transition-colors hover:bg-muted"
                    >
                      <PhoneIcon className="size-5" />
                      {heroPhone}
                    </button>
                  </div>
                  <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground lg:justify-start">
                    {heroBadges.map((b) => (
                      <div key={b} className="flex items-center gap-2">
                        <svg
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="size-5 text-primary"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm3.707-9.293a1 1 0 0 0-1.414-1.414L9 10.586 7.707 9.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <div className="aspect-[4/3] overflow-hidden rounded-3xl shadow-2xl">
                    <Image
                      alt={heroImageAlt}
                      w={1200}
                      h={900}
                      className="size-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-6 -left-6 max-w-xs rounded-2xl bg-background p-6 shadow-xl">
                    <div className="flex items-center gap-4">
                      <div className="flex -space-x-3">
                        {teamMembers.slice(0, 3).map((m) => (
                          <Image
                            key={m.name}
                            alt={m.imageAlt}
                            w={100}
                            h={100}
                            className="size-10 rounded-full border-2 border-background object-cover"
                          />
                        ))}
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          <Star className="size-5 text-primary" />
                          <span className="font-bold text-foreground">
                            {heroRating}
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {heroReviews}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Insurance logos */}
          <section className="border-b border-border bg-background py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
                {logosLabel}
              </p>
              <div className="grid grid-cols-2 items-center gap-8 opacity-60 md:grid-cols-4 lg:grid-cols-6">
                {logoItems.map((logo) => (
                  <button
                    key={logo}
                    type="button"
                    onClick={() => go(logo)}
                    className="flex h-12 items-center justify-center font-semibold text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {logo}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Services */}
          <section className="bg-background py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-wider text-primary">
                  {servicesEyebrow}
                </span>
                <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                  {servicesHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{servicesDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {serviceItems.map((item, i) => (
                  <div
                    key={item.title}
                    className="group rounded-2xl border border-transparent bg-muted p-8 transition-all hover:border-border hover:bg-card hover:shadow-xl"
                  >
                    <div className="mb-6 grid size-14 place-items-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                      {serviceIcons[i % serviceIcons.length]}
                    </div>
                    <h3 className="mb-3 text-xl font-bold text-foreground">
                      {item.title}
                    </h3>
                    <p className="mb-4 leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {item.points.map((p) => (
                        <li key={p} className="flex items-center gap-2">
                          <Check className="size-4 shrink-0 text-primary" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Why choose us */}
          <section className="bg-muted py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-16 lg:grid-cols-2">
                <div className="order-2 lg:order-1">
                  <div className="aspect-[4/5] overflow-hidden rounded-3xl shadow-xl">
                    <Image
                      alt={whyImageAlt}
                      w={800}
                      h={1000}
                      loading="lazy"
                      className="size-full object-cover"
                    />
                  </div>
                </div>
                <div className="order-1 lg:order-2">
                  <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-wider text-primary">
                    {whyEyebrow}
                  </span>
                  <h2 className="mb-6 text-3xl font-bold text-foreground sm:text-4xl">
                    {whyHeading}
                  </h2>
                  <p className="mb-10 text-lg leading-relaxed text-muted-foreground">
                    {whyDesc}
                  </p>
                  <div className="space-y-8">
                    {whyItems.map((item, i) => (
                      <div key={item.title} className="flex gap-4">
                        <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary font-bold text-primary-foreground">
                          {String(i + 1).padStart(2, "0")}
                        </div>
                        <div>
                          <h3 className="mb-2 text-lg font-bold text-foreground">
                            {item.title}
                          </h3>
                          <p className="text-muted-foreground">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Office gallery */}
          <section className="bg-background py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-wider text-primary">
                  {galleryEyebrow}
                </span>
                <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                  {galleryHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{galleryDesc}</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {galleryImages.map((alt, i) => (
                  <div
                    key={alt}
                    className={cn(
                      "overflow-hidden rounded-2xl",
                      i === 0
                        ? "sm:col-span-2 lg:col-span-2 lg:row-span-2"
                        : "h-64",
                    )}
                  >
                    <Image
                      alt={alt}
                      w={i === 0 ? 800 : 600}
                      h={i === 0 ? 600 : 400}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Team */}
          <section className="bg-muted py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-wider text-primary">
                  {teamEyebrow}
                </span>
                <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                  {teamHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{teamDesc}</p>
              </div>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {teamMembers.map((m) => (
                  <div
                    key={m.name}
                    className="overflow-hidden rounded-2xl bg-card shadow-sm transition-shadow hover:shadow-xl"
                  >
                    <div className="aspect-[3/4] overflow-hidden">
                      <Image
                        alt={m.imageAlt}
                        w={600}
                        h={800}
                        loading="lazy"
                        className="size-full object-cover"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="mb-1 text-xl font-bold text-card-foreground">
                        {m.name}
                      </h3>
                      <p className="mb-3 font-medium text-primary">{m.role}</p>
                      <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                        {m.bio}
                      </p>
                      <button
                        type="button"
                        aria-label={`LinkedIn profile of ${m.name}`}
                        onClick={() => go(`${m.name} on LinkedIn`)}
                        className="grid size-8 place-items-center rounded-full bg-secondary text-secondary-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="size-4"
                          aria-hidden="true"
                        >
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.14-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="bg-background py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-wider text-primary">
                  {pricingEyebrow}
                </span>
                <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                  {pricingHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{pricingDesc}</p>
              </div>
              <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
                {pricingPlans.map((plan) => (
                  <div
                    key={plan.name}
                    className={cn(
                      "relative overflow-hidden rounded-2xl p-8",
                      plan.featured
                        ? "bg-primary text-primary-foreground"
                        : "border border-border bg-muted",
                    )}
                  >
                    {plan.badge ? (
                      <div className="absolute right-4 top-4 rounded-full bg-primary-foreground/20 px-3 py-1 text-sm font-medium">
                        {plan.badge}
                      </div>
                    ) : null}
                    <h3
                      className={cn(
                        "mb-2 text-xl font-bold",
                        plan.featured ? "" : "text-foreground",
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
                          "text-4xl font-bold",
                          plan.featured ? "" : "text-foreground",
                        )}
                      >
                        {plan.price}
                      </span>
                      <span
                        className={cn(
                          plan.featured
                            ? "text-primary-foreground/80"
                            : "text-muted-foreground",
                        )}
                      >
                        {plan.period}
                      </span>
                    </div>
                    <ul className="mb-8 space-y-3">
                      {plan.features.map((f) => (
                        <li
                          key={f}
                          className={cn(
                            "flex items-start gap-3",
                            plan.featured
                              ? ""
                              : "text-muted-foreground",
                          )}
                        >
                          <Check
                            className={cn(
                              "mt-0.5 size-5 shrink-0",
                              plan.featured ? "" : "text-primary",
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
                        "block w-full rounded-xl py-3 text-center font-semibold transition-colors",
                        plan.featured
                          ? "bg-background text-primary hover:bg-muted"
                          : "border-2 border-border bg-background text-foreground hover:border-primary hover:text-primary",
                      )}
                    >
                      {plan.cta}
                    </button>
                  </div>
                ))}
              </div>
              <p className="mt-8 text-center text-sm text-muted-foreground">
                {pricingNote}
              </p>
            </div>
          </section>

          {/* Stats band */}
          <section className="bg-foreground py-20 text-background">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
                {statsItems.map((s) => (
                  <div key={s.label}>
                    <div className="mb-2 text-4xl font-bold text-primary sm:text-5xl">
                      {s.value}
                    </div>
                    <div className="text-background/70">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="bg-muted py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-wider text-primary">
                  {testimonialsEyebrow}
                </span>
                <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                  {testimonialsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {testimonialsDesc}
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {testimonialItems.map((t) => (
                  <div
                    key={t.name}
                    className="rounded-2xl bg-card p-8 shadow-sm"
                  >
                    <div className="mb-4 flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="size-5 text-primary" />
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
                        <div className="font-semibold text-card-foreground">
                          {t.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {t.meta}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-background py-24">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-wider text-primary">
                  {faqEyebrow}
                </span>
                <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                  {faqHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{faqDesc}</p>
              </div>
              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.question}
                    className="group rounded-xl bg-muted"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between p-6">
                      <span className="pr-8 font-semibold text-foreground">
                        {item.question}
                      </span>
                      <span className="transition group-open:rotate-180">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="size-5 text-muted-foreground"
                          aria-hidden="true"
                        >
                          <path d="M19 9l-7 7-7-7" />
                        </svg>
                      </span>
                    </summary>
                    <div className="px-6 pb-6 leading-relaxed text-muted-foreground">
                      {item.answer}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* CTA banner */}
          <section className="relative overflow-hidden bg-primary py-24 text-primary-foreground">
            <div aria-hidden="true" className="absolute inset-0 opacity-10">
              <div className="absolute left-0 top-0 size-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-foreground blur-3xl" />
              <div className="absolute bottom-0 right-0 size-96 translate-x-1/2 translate-y-1/2 rounded-full bg-primary-foreground blur-3xl" />
            </div>
            <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2 className="mb-6 text-3xl font-bold sm:text-4xl lg:text-5xl">
                {contactHeading}
              </h2>
              <p className="mx-auto mb-10 max-w-2xl text-xl text-primary-foreground/80">
                {contactDesc}
              </p>
              <div className="mb-12 flex flex-col justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(contactCallCta)}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-background px-8 py-4 text-lg font-semibold text-primary transition-colors hover:bg-muted"
                >
                  <PhoneIcon className="size-5" />
                  {contactCallCta}
                </button>
                <button
                  type="button"
                  onClick={() => go(contactBookCta)}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-foreground/15 px-8 py-4 text-lg font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/25"
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
                  {contactBookCta}
                </button>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-primary-foreground/80">
                {contactPerks.map((perk) => (
                  <div key={perk} className="flex items-center gap-2">
                    <svg
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="size-5"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm3.707-9.293a1 1 0 0 0-1.414-1.414L9 10.586 7.707 9.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {perk}
                  </div>
                ))}
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
                  <span className="leading-tight">
                    <span className="block text-xl font-semibold">{brand}</span>
                    <span className="-mt-1 block text-sm text-background/60">
                      Dental Care
                    </span>
                  </span>
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
                      className="grid size-10 place-items-center rounded-lg bg-background/10 text-background/60 transition-colors hover:bg-primary hover:text-primary-foreground"
                    >
                      <span className="text-sm font-bold">
                        {social.charAt(0)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Services */}
              <div>
                <h4 className="mb-6 text-lg font-semibold">
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

              {/* Hours */}
              <div>
                <h4 className="mb-6 text-lg font-semibold">
                  {footerHoursHeading}
                </h4>
                <ul className="space-y-3 text-background/60">
                  {footerHours.map((h) => (
                    <li key={h.day} className="flex justify-between gap-4">
                      <span>{h.day}</span>
                      <span className="text-background">{h.time}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Contact */}
              <div>
                <h4 className="mb-6 text-lg font-semibold">
                  {footerContactHeading}
                </h4>
                <ul className="space-y-4 text-background/60">
                  <li className="flex items-start gap-3">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mt-0.5 size-5 shrink-0 text-primary"
                      aria-hidden="true"
                    >
                      <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 0 1-2.827 0l-4.244-4.243a8 8 0 1 1 11.314 0z" />
                      <path d="M15 11a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                    </svg>
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
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="size-5 shrink-0 text-primary"
                      aria-hidden="true"
                    >
                      <path d="M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z" />
                    </svg>
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
              <p className="text-sm text-background/50">
                © {new Date().getFullYear()} {footerCopyright}
              </p>
              <div className="flex gap-6 text-sm">
                {footerLegal.map((link) => (
                  <button
                    key={link}
                    type="button"
                    onClick={() => go(link)}
                    className="text-background/50 transition-colors hover:text-background"
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
