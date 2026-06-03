import type { ReactNode } from "react"
import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * PhotographyKimiPage — a complete, self-contained fine-art / wedding
 * PHOTOGRAPHER PORTFOLIO + booking page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "Elena Vossen Photography"
 * design: an editorial, warm, gallery-first aesthetic on a soft neutral canvas
 * (mapped from stone) with a serif display headline language and generous
 * whitespace. It pairs a full-bleed image hero (kicker + serif headline + dual
 * CTAs + scroll cue) with a "Featured In" logo strip, a split approach band
 * (icon feature list + showcase photo with a floating stat card), a masonry
 * portfolio gallery with hover captions, a 3-tier pricing/services grid plus a
 * portrait-session callout, a split about story with inline stats, a 4-step
 * process, a dark stats band, a 3-up star-rating testimonial grid, an
 * accordion FAQ, a dark image CTA, a split contact section (details + social +
 * a real inquiry form), and a dark footer.
 *
 * Every nav item / CTA / link / social / form submit routes through
 * `useNavigate` (never a dead "#"), and navbar labels match the `nav` array so
 * PageSwitch can swap pages. All content imagery uses the alt-driven <Image>
 * component (never a raw src). Callers supply ONLY content data; rich defaults
 * make it render beautifully with no props at all.
 */
export const PhotographyKimiPage = defineComponent({
  name: "PhotographyKimiPage",
  description:
    "Complete fine-art WEDDING & PORTRAIT PHOTOGRAPHER portfolio + booking page with an editorial, warm, gallery-first aesthetic: soft neutral canvas, elegant serif display headlines, generous whitespace and timeless documentary mood. Includes a full-bleed photo hero (kicker, serif headline, dual CTAs, scroll cue), a 'Featured In' publication logo strip, a split approach band (icon feature list + showcase image with a floating years-experience stat), a masonry PORTFOLIO GALLERY with hover-reveal captions for shot stories, a 3-tier pricing/packages grid with a featured 'Most Popular' card plus a portrait-session callout, a split photographer about/bio with inline stats and signature, a 4-step working-process timeline, a dark stats band, a 3-up star-rating client testimonial grid, an accordion FAQ, a dark image-overlay CTA, and a split contact section (email/phone/studio address, Instagram/Pinterest/Facebook socials, and a real wedding inquiry form with date, venue, package select). Use as the ROOT/home page for wedding photographers, portrait/family/maternity photographers, elopement and documentary shooters, photography studios, videographers, or any visual creative whose work and gallery should lead. Supply content only — brand, nav, hero, approach, gallery, services, about, process, stats, testimonials, faq, cta, contact, footer; the block owns all layout and styling.",
  props: z.object({
    /** Photographer / studio name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Full-bleed hero section. */
    hero: z
      .object({
        kicker: z.string().optional(),
        heading: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        imageAlt: z.string().optional(),
      })
      .optional(),
    /** "Featured In" publication logo strip. */
    logos: z
      .object({
        label: z.string().optional(),
        items: z.array(z.string()).optional(),
      })
      .optional(),
    /** Split "Our Approach" band: feature list + showcase photo + floating stat. */
    approach: z
      .object({
        kicker: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        imageAlt: z.string().optional(),
        statValue: z.string().optional(),
        statLabel: z.string().optional(),
        features: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Masonry portfolio gallery. */
    gallery: z
      .object({
        kicker: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        viewAll: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              location: z.string(),
              imageAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Pricing / packages grid + portrait-session callout. */
    services: z
      .object({
        kicker: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        packages: z
          .array(
            z.object({
              priceLabel: z.string(),
              price: z.string(),
              title: z.string(),
              description: z.string(),
              features: z.array(z.string()),
              cta: z.string(),
              featured: z.boolean().optional(),
              badge: z.string().optional(),
            }),
          )
          .optional(),
        portraitTitle: z.string().optional(),
        portraitDescription: z.string().optional(),
        portraitCta: z.string().optional(),
      })
      .optional(),
    /** Split photographer about / bio. */
    about: z
      .object({
        kicker: z.string().optional(),
        heading: z.string().optional(),
        imageAlt: z.string().optional(),
        signatureAlt: z.string().optional(),
        paragraphs: z.array(z.string()).optional(),
        stats: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** 4-step working process. */
    process: z
      .object({
        kicker: z.string().optional(),
        heading: z.string().optional(),
        steps: z
          .array(z.object({ title: z.string(), description: z.string() }))
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
    /** Star-rating testimonial grid. */
    testimonials: z
      .object({
        kicker: z.string().optional(),
        heading: z.string().optional(),
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
    /** Accordion FAQ. */
    faq: z
      .object({
        kicker: z.string().optional(),
        heading: z.string().optional(),
        items: z
          .array(z.object({ question: z.string(), answer: z.string() }))
          .optional(),
      })
      .optional(),
    /** Dark image-overlay CTA. */
    cta: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        imageAlt: z.string().optional(),
      })
      .optional(),
    /** Split contact section: details, socials, inquiry form. */
    contact: z
      .object({
        kicker: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        socials: z.array(z.string()).optional(),
        packageOptions: z.array(z.string()).optional(),
        newsletterLabel: z.string().optional(),
        submit: z.string().optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        tagline: z.string().optional(),
        links: z.array(z.string()).optional(),
        note: z.string().optional(),
        legal: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "Elena Vossen"
    const nav = props.nav?.length
      ? props.nav
      : ["Work", "Services", "About", "Testimonials", "Contact"]

    const heroKicker = props.hero?.kicker ?? "Fine Art Photography"
    const heroHeading =
      props.hero?.heading ?? "Capturing authentic moments that last forever"
    const heroSub =
      props.hero?.subheading ??
      "Documentary wedding and portrait photography for couples who value emotion over perfection. Based in Portland, available worldwide."
    const heroPrimary = props.hero?.primaryCta ?? "View Portfolio"
    const heroSecondary = props.hero?.secondaryCta ?? "Book a Session"
    const heroImageAlt =
      props.hero?.imageAlt ??
      "Dramatic mountain landscape at golden hour with photographer silhouette"

    const logosLabel = props.logos?.label ?? "Featured In"
    const logoItems = props.logos?.items?.length
      ? props.logos.items
      : [
          "Vogue",
          "Harper's Bazaar",
          "The Knot",
          "Martha Stewart Weddings",
          "Style Me Pretty",
          "Green Wedding Shoes",
        ]

    const approachKicker = props.approach?.kicker ?? "Our Approach"
    const approachHeading =
      props.approach?.heading ?? "Photography that feels like you"
    const approachDesc =
      props.approach?.description ??
      "I believe the best photographs happen when you forget the camera exists. My approach is documentary-first: observing, anticipating, and capturing the genuine emotions, quiet glances, and unscripted joy that make your story uniquely yours."
    const approachImageAlt =
      props.approach?.imageAlt ??
      "Bride holding wildflower bouquet in soft window light"
    const approachStatValue = props.approach?.statValue ?? "8+"
    const approachStatLabel = props.approach?.statLabel ?? "Years Experience"
    const approachFeatures = props.approach?.features?.length
      ? props.approach.features
      : [
          {
            title: "Emotion-First Editing",
            description:
              "Every image is hand-edited to preserve authentic color and genuine feeling.",
          },
          {
            title: "Unhurried Sessions",
            description:
              "No rushing, no posing marathons. Just natural moments captured with patience.",
          },
          {
            title: "Film & Digital Hybrid",
            description:
              "Contemporary digital precision meets the timeless quality of analog film.",
          },
        ]

    const galleryKicker = props.gallery?.kicker ?? "Selected Work"
    const galleryHeading = props.gallery?.heading ?? "Recent Stories"
    const galleryDesc =
      props.gallery?.description ??
      "A curated selection of weddings, elopements, and intimate portraits from the past year."
    const galleryViewAll = props.gallery?.viewAll ?? "View Complete Portfolio"
    const galleryItems = props.gallery?.items?.length
      ? props.gallery.items
      : [
          {
            title: "Morgan & James",
            location: "Willamette Valley, Oregon",
            imageAlt: "Bride and groom first dance in barn venue with string lights",
          },
          {
            title: "Sarah & David",
            location: "Big Sur, California",
            imageAlt:
              "Intimate outdoor wedding ceremony on cliff overlooking ocean",
          },
          {
            title: "Detail Collection",
            location: "Rings & Florals",
            imageAlt: "Close-up of hands exchanging wedding rings",
          },
          {
            title: "Emma & Thomas",
            location: "Palouse, Washington",
            imageAlt: "Couple walking through golden wheat field at sunset",
          },
          {
            title: "The Chen Wedding",
            location: "Private Estate, Napa",
            imageAlt:
              "Wedding reception tent interior with hanging greenery and candlelight",
          },
          {
            title: "Bridal Portrait",
            location: "St. Johns Bridge, Portland",
            imageAlt:
              "Bride portrait in vintage lace wedding dress with cathedral veil",
          },
          {
            title: "Getting Ready",
            location: "Detail Stories",
            imageAlt: "Groom adjusting cufflinks while getting ready",
          },
          {
            title: "Reception Joy",
            location: "Dancing & Celebration",
            imageAlt:
              "Wedding guests dancing at outdoor reception under string lights",
          },
          {
            title: "Lily & Marcus",
            location: "Mt. Rainier Elopement",
            imageAlt: "Elopement couple embracing on misty mountain peak",
          },
        ]

    const servicesKicker = props.services?.kicker ?? "Investment"
    const servicesHeading = props.services?.heading ?? "Photography Services"
    const servicesDesc =
      props.services?.description ??
      "Transparent pricing, no hidden fees. Every package includes edited digital images with full personal use rights."
    const packages = props.services?.packages?.length
      ? props.services.packages
      : [
          {
            priceLabel: "Starting at",
            price: "$4,200",
            title: "Wedding Essentials",
            description:
              "Perfect for intimate celebrations and courthouse weddings with a small reception.",
            features: [
              "6 hours of coverage",
              "One photographer",
              "400+ edited photos",
              "Online gallery with downloads",
              "Print release included",
            ],
            cta: "Inquire About This Package",
          },
          {
            priceLabel: "Starting at",
            price: "$6,800",
            title: "The Full Story",
            description:
              "Complete coverage for traditional weddings, from getting ready through the last dance.",
            features: [
              "10 hours of coverage",
              "Two photographers",
              "800+ edited photos",
              "Engagement session included",
              "Heirloom photo album",
              "Sneak peek within 72 hours",
            ],
            cta: "Inquire About This Package",
            featured: true,
            badge: "Most Popular",
          },
          {
            priceLabel: "Starting at",
            price: "$8,500",
            title: "Destination & Multi-Day",
            description:
              "For celebrations that span multiple days or require travel to extraordinary locations.",
            features: [
              "Full weekend coverage",
              "Two photographers",
              "1200+ edited photos",
              "Engagement + rehearsal dinner",
              "Luxury album + prints",
              "Travel included",
            ],
            cta: "Inquire About This Package",
          },
        ]
    const portraitTitle = props.services?.portraitTitle ?? "Portrait Sessions"
    const portraitDesc =
      props.services?.portraitDescription ??
      "Engagement, family, maternity, and personal branding sessions starting at $650"
    const portraitCta = props.services?.portraitCta ?? "Book a Portrait Session"

    const aboutKicker = props.about?.kicker ?? "About Elena"
    const aboutHeading =
      props.about?.heading ?? "Photographer, storyteller, moment collector"
    const aboutImageAlt =
      props.about?.imageAlt ??
      "Professional headshot of female photographer with camera in natural light studio"
    const aboutSignatureAlt =
      props.about?.signatureAlt ?? "Elena Vossen handwritten signature"
    const aboutParagraphs = props.about?.paragraphs?.length
      ? props.about.paragraphs
      : [
          "I picked up my first camera at fifteen, shooting on film in my parents' backyard darkroom. What started as curiosity became obsession, then vocation. For the past eight years, I've documented over 200 weddings across six countries and countless portrait sessions that have become family heirlooms.",
          "My work lives at the intersection of documentary honesty and editorial beauty. I believe your wedding photos should feel like memories, not performances. That means stepping back when the moment speaks for itself and guiding gently when you need direction.",
          "When I'm not photographing, you'll find me hiking the Columbia River Gorge, hunting for the perfect vintage film camera, or tending to my small but mighty collection of houseplants.",
        ]
    const aboutStats = props.about?.stats?.length
      ? props.about.stats
      : [
          { value: "200+", label: "Weddings" },
          { value: "6", label: "Countries" },
          { value: "8", label: "Years" },
        ]

    const processKicker = props.process?.kicker ?? "The Experience"
    const processHeading = props.process?.heading ?? "How We Work Together"
    const processSteps = props.process?.steps?.length
      ? props.process.steps
      : [
          {
            title: "Initial Consultation",
            description:
              "We'll hop on a video call to discuss your vision, timeline, and what matters most to you. This helps us both determine if we're the right fit.",
          },
          {
            title: "Booking & Planning",
            description:
              "Once you decide to move forward, a 50% retainer secures your date. I'll send you a detailed questionnaire and planning guide.",
          },
          {
            title: "The Wedding Day",
            description:
              "You celebrate, I document. I'll arrive early, stay invisible during key moments, and ensure every important detail is captured.",
          },
          {
            title: "Delivery & Keepsakes",
            description:
              "Sneak peek within 72 hours. Full gallery delivery in 6-8 weeks. Your heirloom album arrives shortly after you make your selections.",
          },
        ]

    const statsItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "200+", label: "Weddings Captured" },
          { value: "50k+", label: "Photos Delivered" },
          { value: "6", label: "Countries" },
          { value: "100%", label: "Happy Couples" },
        ]

    const testimonialsKicker = props.testimonials?.kicker ?? "Kind Words"
    const testimonialsHeading =
      props.testimonials?.heading ?? "From Our Couples"
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "Elena captured moments we didn't even know were happening. Looking at our photos feels like reliving the day exactly as it was—the joy, the tears, the quiet in-between moments. She has an incredible gift for being present without being intrusive.",
            name: "Morgan Chen",
            meta: "Married June 2024",
            avatarAlt:
              "Professional headshot of a smiling bride with brown hair and warm smile",
          },
          {
            quote:
              "We were nervous about being photographed, but Elena made us feel completely at ease. Our engagement photos in Forest Park look like they're from a magazine, but they still feel authentically us. Worth every penny and more.",
            name: "James Morrison",
            meta: "Married August 2024",
            avatarAlt:
              "Professional headshot of a groom with short beard and friendly expression",
          },
          {
            quote:
              "Elena traveled to Italy for our destination wedding and somehow captured every single moment while being nearly invisible. Our album is the most treasured possession we own. Friends still ask about her years later.",
            name: "Sarah Bennett",
            meta: "Married September 2023",
            avatarAlt:
              "Professional headshot of a bride with blonde hair and elegant smile",
          },
        ]

    const faqKicker = props.faq?.kicker ?? "FAQ"
    const faqHeading = props.faq?.heading ?? "Common Questions"
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: "How far in advance should we book?",
            answer:
              "For weddings, I recommend booking 12-18 months in advance, especially for peak season (May-October). Elopements and portrait sessions can typically be booked 2-3 months ahead. I occasionally have last-minute availability, so it's always worth reaching out.",
          },
          {
            question: "Do you travel for destination weddings?",
            answer:
              "Absolutely! I've photographed weddings across the US, Mexico, Italy, France, and Japan. Destination packages include my travel and accommodation. I typically arrive 1-2 days early to scout locations and account for any travel delays.",
          },
          {
            question: "How many photos will we receive?",
            answer:
              "Every wedding is different, but you can expect approximately 50-100 edited photos per hour of coverage. A full 10-hour wedding typically yields 600-900 images. All photos are individually edited for color, exposure, and consistency—no batch filters or shortcuts.",
          },
          {
            question: "What's your editing style?",
            answer:
              "My editing style is true-to-color with a warm, timeless quality. I aim for images that look like fond memories feel—nostalgic but not dated, romantic but not overdone. I avoid heavy filters or trendy editing that will look dated in a few years.",
          },
          {
            question: "Can we meet before booking?",
            answer:
              "Of course! I offer complimentary video consultations for all potential clients. This gives us a chance to connect, discuss your vision, and make sure we're a good fit. Chemistry matters—you'll spend more time with your photographer on your wedding day than almost anyone else.",
          },
        ]

    const ctaHeading =
      props.cta?.heading ?? "Let's create something beautiful together"
    const ctaDesc =
      props.cta?.description ??
      "Currently booking weddings for 2025 and 2026. Limited availability remains for peak season weekends."
    const ctaPrimary = props.cta?.primaryCta ?? "Check Availability"
    const ctaSecondary = props.cta?.secondaryCta ?? "Explore More Work"
    const ctaImageAlt =
      props.cta?.imageAlt ?? "Romantic wedding couple silhouette at sunset"

    const contactKicker = props.contact?.kicker ?? "Get In Touch"
    const contactHeading = props.contact?.heading ?? "Let's talk about your day"
    const contactDesc =
      props.contact?.description ??
      "Tell me about your vision, your venue, and what matters most to you. I typically respond to inquiries within 24 hours during the week."
    const contactEmail = props.contact?.email ?? "hello@elenavossen.com"
    const contactPhone = props.contact?.phone ?? "(503) 555-1234"
    const contactAddress =
      props.contact?.address ?? "1425 NW Lovejoy St, Suite 300, Portland, OR 97209"
    const contactSocials = props.contact?.socials?.length
      ? props.contact.socials
      : ["Instagram", "Pinterest", "Facebook"]
    const packageOptions = props.contact?.packageOptions?.length
      ? props.contact.packageOptions
      : [
          "Select a package...",
          "Wedding Essentials - $4,200",
          "The Full Story - $6,800",
          "Destination & Multi-Day - $8,500",
          "Portrait Session - $650",
          "Not sure yet",
        ]
    const newsletterLabel =
      props.contact?.newsletterLabel ??
      "Send me occasional updates about availability, behind-the-scenes content, and photography tips."
    const contactSubmit = props.contact?.submit ?? "Send Inquiry"

    const footerTagline = props.footer?.tagline ?? "Fine Art Photography"
    const footerLinks = props.footer?.links?.length
      ? props.footer.links
      : ["Work", "Services", "About", "Contact", "Client Gallery"]
    const footerNote =
      props.footer?.note ??
      `© ${new Date().getFullYear()} ${brand} Photography. All rights reserved.`
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Privacy Policy", "Terms of Service"]

    const contactCta = nav[nav.length - 1]

    const Check = () => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mt-0.5 shrink-0"
        aria-hidden="true"
      >
        <path d="M5 13l4 4L19 7" />
      </svg>
    )

    const ArrowRight = () => (
      <svg
        width="16"
        height="16"
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
    )

    const approachIcons = [
      // heart
      <svg
        key="heart"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>,
      // clock
      <svg
        key="clock"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      // camera
      <svg
        key="camera"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      </svg>,
    ]

    const Star = () => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    const socialIcons: Record<string, ReactNode> = {
      Instagram: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
      Pinterest: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 0c-6.627 0-12 5.372-12 12 0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.345 2.317.535 3.55.535 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
        </svg>
      ),
      Facebook: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    }

    const inputCls =
      "w-full border border-input bg-muted px-4 py-3 text-foreground placeholder:text-muted-foreground transition-colors focus:border-ring focus:outline-none"

    return (
      <div
        className={cn(
          "min-h-svh bg-background font-sans text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/90 backdrop-blur-sm">
          <nav
            className="mx-auto max-w-7xl px-6 lg:px-8"
            aria-label="Main navigation"
          >
            <div className="flex h-20 items-center justify-between">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="font-serif text-2xl font-medium tracking-tight text-foreground"
              >
                {brand}
              </button>
              <div className="hidden items-center space-x-12 md:flex">
                {nav.map((label, i) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => go(label)}
                    className={cn(
                      "text-sm font-medium transition-colors",
                      i === nav.length - 1
                        ? "border-b-2 border-foreground pb-0.5 text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                aria-label="Open menu"
                onClick={() => go(nav[0])}
                className="p-2 text-muted-foreground hover:text-foreground md:hidden"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </nav>
        </header>

        <main>
          {/* Hero */}
          <section
            className="relative h-screen w-full overflow-hidden"
            aria-label="Hero"
          >
            <div className="absolute inset-0">
              <Image
                alt={heroImageAlt}
                w={1920}
                h={1280}
                className="size-full object-cover"
              />
              <div className="absolute inset-0 bg-foreground/30" />
            </div>
            <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-6 pb-24 lg:px-8 lg:pb-32">
              <div className="max-w-3xl">
                <p className="mb-4 text-sm font-medium uppercase tracking-widest text-background/80">
                  {heroKicker}
                </p>
                <h1 className="mb-6 font-serif text-5xl font-medium leading-tight text-background md:text-6xl lg:text-7xl">
                  {heroHeading}
                </h1>
                <p className="mb-10 max-w-xl text-lg leading-relaxed text-background/80 md:text-xl">
                  {heroSub}
                </p>
                <div className="flex flex-col gap-4 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => go(heroPrimary)}
                    className="inline-flex items-center justify-center bg-background px-8 py-4 text-sm font-medium tracking-wide text-foreground transition-colors hover:bg-muted"
                  >
                    {heroPrimary}
                  </button>
                  <button
                    type="button"
                    onClick={() => go(heroSecondary)}
                    className="inline-flex items-center justify-center border border-background px-8 py-4 text-sm font-medium tracking-wide text-background transition-colors hover:bg-background/10"
                  >
                    {heroSecondary}
                  </button>
                </div>
              </div>
            </div>
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-background/60">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="animate-bounce"
                aria-hidden="true"
              >
                <path d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </section>

          {/* Featured In */}
          <section
            className="border-b border-border bg-card py-16 lg:py-20"
            aria-label="Featured publications"
          >
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <p className="mb-12 text-center text-sm font-medium uppercase tracking-widest text-muted-foreground">
                {logosLabel}
              </p>
              <div className="grid grid-cols-2 items-center gap-8 opacity-60 md:grid-cols-4 lg:grid-cols-6 lg:gap-12">
                {logoItems.map((logo, i) => (
                  <button
                    key={logo}
                    type="button"
                    onClick={() => go(logo)}
                    className={cn(
                      "mx-auto font-serif text-lg font-medium tracking-tight text-muted-foreground transition-colors hover:text-foreground",
                      i >= 4 && "hidden md:block",
                    )}
                  >
                    {logo}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Our Approach */}
          <section className="bg-background py-24 lg:py-32" aria-label="Why choose us">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-24">
                <div>
                  <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
                    {approachKicker}
                  </p>
                  <h2 className="mb-6 font-serif text-4xl font-medium leading-tight text-foreground md:text-5xl">
                    {approachHeading}
                  </h2>
                  <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
                    {approachDesc}
                  </p>
                  <div className="space-y-4">
                    {approachFeatures.map((f, i) => (
                      <div key={f.title} className="flex items-start gap-4">
                        <div className="grid size-12 shrink-0 place-items-center rounded-full bg-muted text-foreground">
                          {approachIcons[i % approachIcons.length]}
                        </div>
                        <div>
                          <h3 className="mb-1 font-medium text-foreground">
                            {f.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {f.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <Image
                    alt={approachImageAlt}
                    w={800}
                    h={600}
                    loading="lazy"
                    className="h-[600px] w-full object-cover"
                  />
                  <div className="absolute -bottom-6 -left-6 bg-card p-6 shadow-xl">
                    <p className="font-serif text-4xl font-medium text-card-foreground">
                      {approachStatValue}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {approachStatLabel}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Portfolio gallery */}
          <section className="bg-card py-24 lg:py-32" aria-label="Portfolio gallery">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
                  {galleryKicker}
                </p>
                <h2 className="mb-6 font-serif text-4xl font-medium text-card-foreground md:text-5xl">
                  {galleryHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{galleryDesc}</p>
              </div>

              <div className="columns-1 gap-6 space-y-6 md:columns-2 lg:columns-3">
                {galleryItems.map((item) => (
                  <div key={item.title} className="break-inside-avoid">
                    <button
                      type="button"
                      onClick={() => go(item.title)}
                      className="group relative block w-full overflow-hidden text-left"
                    >
                      <Image
                        alt={item.imageAlt}
                        w={800}
                        h={1000}
                        loading="lazy"
                        className="h-auto w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-foreground/0 transition-colors duration-500 group-hover:bg-foreground/40" />
                      <div className="absolute inset-x-0 bottom-0 translate-y-full p-6 transition-transform duration-500 group-hover:translate-y-0">
                        <p className="font-medium text-background">{item.title}</p>
                        <p className="text-sm text-background/70">
                          {item.location}
                        </p>
                      </div>
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-16 text-center">
                <button
                  type="button"
                  onClick={() => go(galleryViewAll)}
                  className="inline-flex items-center gap-2 border-b-2 border-foreground pb-1 font-medium text-foreground transition-colors hover:border-muted-foreground hover:text-muted-foreground"
                >
                  {galleryViewAll}
                  <ArrowRight />
                </button>
              </div>
            </div>
          </section>

          {/* Services / pricing */}
          <section
            className="bg-muted py-24 lg:py-32"
            aria-label="Services and pricing"
          >
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
                  {servicesKicker}
                </p>
                <h2 className="mb-6 font-serif text-4xl font-medium text-foreground md:text-5xl">
                  {servicesHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{servicesDesc}</p>
              </div>

              <div className="grid gap-8 md:grid-cols-3">
                {packages.map((pkg) => (
                  <div
                    key={pkg.title}
                    className={cn(
                      "relative p-8 lg:p-10",
                      pkg.featured
                        ? "bg-primary text-primary-foreground"
                        : "bg-card text-card-foreground",
                    )}
                  >
                    {pkg.badge ? (
                      <div className="absolute right-0 top-0 bg-background px-4 py-2 text-xs font-medium text-foreground">
                        {pkg.badge}
                      </div>
                    ) : null}
                    <p
                      className={cn(
                        "mb-2 text-sm font-medium uppercase tracking-widest",
                        pkg.featured
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground",
                      )}
                    >
                      {pkg.priceLabel}
                    </p>
                    <p
                      className={cn(
                        "mb-6 font-serif text-4xl",
                        pkg.featured
                          ? "text-primary-foreground"
                          : "text-card-foreground",
                      )}
                    >
                      {pkg.price}
                    </p>
                    <h3
                      className={cn(
                        "mb-4 text-xl font-medium",
                        pkg.featured
                          ? "text-primary-foreground"
                          : "text-card-foreground",
                      )}
                    >
                      {pkg.title}
                    </h3>
                    <p
                      className={cn(
                        "mb-8 leading-relaxed",
                        pkg.featured
                          ? "text-primary-foreground/80"
                          : "text-muted-foreground",
                      )}
                    >
                      {pkg.description}
                    </p>
                    <ul
                      className={cn(
                        "mb-8 space-y-3",
                        pkg.featured
                          ? "text-primary-foreground/80"
                          : "text-muted-foreground",
                      )}
                    >
                      {pkg.features.map((feat) => (
                        <li key={feat} className="flex items-start gap-3">
                          <span
                            className={
                              pkg.featured
                                ? "text-primary-foreground/60"
                                : "text-muted-foreground/70"
                            }
                          >
                            <Check />
                          </span>
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => go(pkg.title)}
                      className={cn(
                        "w-full py-4 text-sm font-medium tracking-wide transition-colors",
                        pkg.featured
                          ? "bg-background text-foreground hover:bg-muted"
                          : "border border-border text-foreground hover:border-foreground",
                      )}
                    >
                      {pkg.cta}
                    </button>
                  </div>
                ))}
              </div>

              {/* Portrait session */}
              <div className="mt-16 flex flex-col items-center justify-between gap-8 bg-card p-8 lg:flex-row lg:p-12">
                <div className="flex items-center gap-6">
                  <div className="grid size-16 shrink-0 place-items-center rounded-full bg-muted text-foreground">
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="mb-1 text-xl font-medium text-card-foreground">
                      {portraitTitle}
                    </h3>
                    <p className="text-muted-foreground">{portraitDesc}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => go(portraitCta)}
                  className="shrink-0 bg-primary px-8 py-4 text-sm font-medium tracking-wide text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {portraitCta}
                </button>
              </div>
            </div>
          </section>

          {/* About */}
          <section
            className="bg-background py-24 lg:py-32"
            aria-label="About the photographer"
          >
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-24">
                <div className="order-2 lg:order-1">
                  <Image
                    alt={aboutImageAlt}
                    w={800}
                    h={600}
                    loading="lazy"
                    className="h-[500px] w-full object-cover lg:h-[600px]"
                  />
                </div>
                <div className="order-1 lg:order-2">
                  <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
                    {aboutKicker}
                  </p>
                  <h2 className="mb-6 font-serif text-4xl font-medium leading-tight text-foreground md:text-5xl">
                    {aboutHeading}
                  </h2>
                  <div className="mb-8 space-y-4 leading-relaxed text-muted-foreground">
                    {aboutParagraphs.map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                  <div className="mb-8 flex items-center gap-8">
                    {aboutStats.map((s, i) => (
                      <div key={s.label} className="flex items-center gap-8">
                        {i > 0 ? <div className="h-12 w-px bg-border" /> : null}
                        <div>
                          <p className="font-serif text-3xl text-foreground">
                            {s.value}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {s.label}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Image
                    alt={aboutSignatureAlt}
                    w={400}
                    h={120}
                    loading="lazy"
                    className="h-12 w-auto opacity-60"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Process */}
          <section
            className="bg-muted py-24 lg:py-32"
            aria-label="Working process"
          >
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
                  {processKicker}
                </p>
                <h2 className="mb-6 font-serif text-4xl font-medium text-foreground md:text-5xl">
                  {processHeading}
                </h2>
              </div>

              <div className="grid gap-8 md:grid-cols-4 lg:gap-12">
                {processSteps.map((step, i) => (
                  <div key={step.title} className="text-center md:text-left">
                    <div className="mx-auto mb-6 grid size-16 place-items-center rounded-full bg-card text-foreground md:mx-0">
                      <span className="font-serif text-2xl text-foreground">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <h3 className="mb-3 text-lg font-medium text-foreground">
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

          {/* Stats band */}
          <section
            className="bg-primary py-20 text-primary-foreground"
            aria-label="Statistics"
          >
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4 lg:gap-12">
                {statsItems.map((s) => (
                  <div key={s.label}>
                    <p className="mb-2 font-serif text-5xl text-primary-foreground lg:text-6xl">
                      {s.value}
                    </p>
                    <p className="text-sm uppercase tracking-widest text-primary-foreground/70">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section
            className="bg-background py-24 lg:py-32"
            aria-label="Client testimonials"
          >
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
                  {testimonialsKicker}
                </p>
                <h2 className="mb-6 font-serif text-4xl font-medium text-foreground md:text-5xl">
                  {testimonialsHeading}
                </h2>
              </div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {testimonialItems.map((t) => (
                  <div key={t.name} className="bg-muted p-8">
                    <div className="mb-6 flex gap-1 text-muted-foreground">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} />
                      ))}
                    </div>
                    <p className="mb-6 leading-relaxed text-foreground">
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
                        <p className="font-medium text-foreground">{t.name}</p>
                        <p className="text-sm text-muted-foreground">{t.meta}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section
            className="bg-muted py-24 lg:py-32"
            aria-label="Frequently asked questions"
          >
            <div className="mx-auto max-w-3xl px-6 lg:px-8">
              <div className="mb-16 text-center">
                <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
                  {faqKicker}
                </p>
                <h2 className="mb-6 font-serif text-4xl font-medium text-foreground md:text-5xl">
                  {faqHeading}
                </h2>
              </div>

              <div className="space-y-6">
                {faqItems.map((item) => (
                  <details key={item.question} className="group bg-card p-6">
                    <summary className="flex cursor-pointer list-none items-center justify-between">
                      <h3 className="text-lg font-medium text-card-foreground">
                        {item.question}
                      </h3>
                      <span className="text-muted-foreground transition-transform group-open:rotate-180">
                        <svg
                          width="20"
                          height="20"
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
                    <p className="mt-4 leading-relaxed text-muted-foreground">
                      {item.answer}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section
            className="relative overflow-hidden bg-primary py-24 lg:py-32"
            aria-label="Call to action"
          >
            <div className="absolute inset-0 opacity-20">
              <Image
                alt={ctaImageAlt}
                w={1920}
                h={1080}
                loading="lazy"
                className="size-full object-cover"
              />
            </div>
            <div className="relative z-10 mx-auto max-w-4xl px-6 text-center lg:px-8">
              <h2 className="mb-6 font-serif text-4xl font-medium leading-tight text-primary-foreground md:text-5xl lg:text-6xl">
                {ctaHeading}
              </h2>
              <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-primary-foreground/80 md:text-xl">
                {ctaDesc}
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(ctaPrimary)}
                  className="inline-flex items-center justify-center bg-background px-8 py-4 text-sm font-medium tracking-wide text-foreground transition-colors hover:bg-muted"
                >
                  {ctaPrimary}
                </button>
                <button
                  type="button"
                  onClick={() => go(ctaSecondary)}
                  className="inline-flex items-center justify-center border border-primary-foreground px-8 py-4 text-sm font-medium tracking-wide text-primary-foreground transition-colors hover:bg-primary-foreground/10"
                >
                  {ctaSecondary}
                </button>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section
            className="bg-background py-24 lg:py-32"
            aria-label="Contact form"
          >
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
                <div>
                  <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
                    {contactKicker}
                  </p>
                  <h2 className="mb-6 font-serif text-4xl font-medium leading-tight text-foreground md:text-5xl">
                    {contactHeading}
                  </h2>
                  <p className="mb-10 text-lg leading-relaxed text-muted-foreground">
                    {contactDesc}
                  </p>

                  <div className="mb-10 space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="grid size-12 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="mb-1 font-medium text-foreground">Email</p>
                        <button
                          type="button"
                          onClick={() => go(contactEmail)}
                          className="text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {contactEmail}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="grid size-12 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground">
                        <svg
                          width="20"
                          height="20"
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
                      </div>
                      <div>
                        <p className="mb-1 font-medium text-foreground">Phone</p>
                        <button
                          type="button"
                          onClick={() => go(contactPhone)}
                          className="text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {contactPhone}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="grid size-12 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="mb-1 font-medium text-foreground">Studio</p>
                        <p className="text-muted-foreground">{contactAddress}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    {contactSocials.map((social) => (
                      <button
                        key={social}
                        type="button"
                        aria-label={social}
                        onClick={() => go(social)}
                        className="grid size-10 place-items-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                      >
                        {socialIcons[social] ?? (
                          <span className="text-xs font-medium">
                            {social.charAt(0)}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <form
                  className="space-y-6"
                  aria-label="Contact form"
                  onSubmit={(e) => {
                    e.preventDefault()
                    go(contactCta)
                  }}
                >
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="photo-name"
                        className="mb-2 block text-sm font-medium text-foreground"
                      >
                        Your Names
                      </label>
                      <input
                        id="photo-name"
                        type="text"
                        required
                        placeholder="Jordan & Casey"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="photo-email"
                        className="mb-2 block text-sm font-medium text-foreground"
                      >
                        Email Address
                      </label>
                      <input
                        id="photo-email"
                        type="email"
                        required
                        placeholder="you@example.com"
                        className={inputCls}
                      />
                    </div>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="photo-date"
                        className="mb-2 block text-sm font-medium text-foreground"
                      >
                        Event Date
                      </label>
                      <input id="photo-date" type="date" className={inputCls} />
                    </div>
                    <div>
                      <label
                        htmlFor="photo-location"
                        className="mb-2 block text-sm font-medium text-foreground"
                      >
                        Venue / Location
                      </label>
                      <input
                        id="photo-location"
                        type="text"
                        placeholder="Ceremony location"
                        className={inputCls}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="photo-package"
                      className="mb-2 block text-sm font-medium text-foreground"
                    >
                      Interested In
                    </label>
                    <select
                      id="photo-package"
                      className={cn(inputCls, "appearance-none")}
                    >
                      {packageOptions.map((opt) => (
                        <option key={opt} className="bg-background">
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="photo-message"
                      className="mb-2 block text-sm font-medium text-foreground"
                    >
                      Tell Me About Your Day
                    </label>
                    <textarea
                      id="photo-message"
                      rows={5}
                      placeholder="Share your vision, what's most important to you, and any questions you have..."
                      className={cn(inputCls, "resize-none")}
                    />
                  </div>

                  <div className="flex items-start gap-3">
                    <input
                      id="photo-newsletter"
                      type="checkbox"
                      className="mt-1 size-4 rounded border-input accent-primary"
                    />
                    <label
                      htmlFor="photo-newsletter"
                      className="text-sm text-muted-foreground"
                    >
                      {newsletterLabel}
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-primary py-4 text-sm font-medium tracking-wide text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    {contactSubmit}
                  </button>
                </form>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer
          className="border-t border-border bg-primary py-12"
          aria-label="Footer"
        >
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center gap-2"
              >
                <span className="font-serif text-xl font-medium text-primary-foreground">
                  {brand}
                </span>
                <span className="text-primary-foreground/50">|</span>
                <span className="text-sm text-primary-foreground/70">
                  {footerTagline}
                </span>
              </button>
              <nav
                className="flex flex-wrap items-center justify-center gap-8"
                aria-label="Footer navigation"
              >
                {footerLinks.map((link) => (
                  <button
                    key={link}
                    type="button"
                    onClick={() => go(link)}
                    className="text-sm text-primary-foreground/70 transition-colors hover:text-primary-foreground"
                  >
                    {link}
                  </button>
                ))}
              </nav>
            </div>
            <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-primary-foreground/20 pt-8 md:flex-row">
              <p className="text-sm text-primary-foreground/60">{footerNote}</p>
              <div className="flex items-center gap-6">
                {footerLegal.map((legal) => (
                  <button
                    key={legal}
                    type="button"
                    onClick={() => go(legal)}
                    className="text-sm text-primary-foreground/60 transition-colors hover:text-primary-foreground"
                  >
                    {legal}
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
