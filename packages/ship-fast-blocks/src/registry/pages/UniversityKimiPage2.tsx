import { useState } from "react"
import { z } from "zod/v4"
import { useState } from "react"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * UniversityKimiPage2 — a complete, self-contained higher-education / university
 * marketing + admissions LANDING page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "Westfield University" design,
 * and a visually DISTINCT alternative / second-style sibling to UniversityKimiPage.
 * Where the sibling is a warm, editorial, monochrome stone aesthetic, this variant
 * is bold, energetic and conversion-driven: a colorful primary/secondary brand
 * palette, a two-column gradient hero with a floating brand badge and an inline
 * "virtual campus tour" video card, big bold black type, rounded-2xl image-topped
 * program cards with category chips, a glassy three-up "Why Westfield" feature band
 * on a secondary surface, a campus-life split with icon highlights + photo mosaic,
 * a masonry campus photo gallery, star-rated student-story testimonials, a 3-tier
 * tuition pricing table with a featured "Most Popular" plan, an accordion FAQ, a
 * vibrant gradient apply CTA, and a multi-column footer with social + contact.
 *
 * The block owns ALL layout, spacing, type hierarchy and surfaces, mapped to
 * semantic theme tokens (background/card/muted/primary/secondary/accent/...).
 * Every nav item, CTA, program/footer link, social and submit routes through
 * `useNavigate` (never a dead "#"). All imagery (hero, program thumbnails,
 * gallery, campus mosaic, student headshots) uses the alt-driven <Image>
 * component — no raw <img>, no external src. Callers supply ONLY content data;
 * rich defaults make it render the full page with no props at all.
 */
export const UniversityKimiPage2 = defineComponent({
  name: "UniversityKimiPage2",
  description:
    "Complete higher-education / UNIVERSITY, college or campus marketing + admissions LANDING page in a bold, vibrant, conversion-driven style — the visually DISTINCT alternative / second-style sibling to UniversityKimiPage (which is warm, editorial and monochrome). Includes a fixed navbar with a pill 'Apply Now' CTA, a two-column gradient hero with a live 'applications open' status pill, big black 'Innovate / Create / Lead' headline, dual CTAs, ranking trust badges and an inline image card with a 'Virtual Campus Tour' video overlay plus a floating brand monogram, a 4-up stats band (students, programs, employment, ratio), a 6-up academic-programs grid of rounded image-topped cards with category chips and duration (Computer Science & AI, Biomedical Sciences, Business Administration, Architecture & Design, Education, Law) and a 'View All Programs' button, a campus-life split section with four icon highlights (housing, clubs, wellness, events) and a 4-image photo mosaic plus a virtual-tour button, a glassy three-up 'Why Westfield' feature band on a secondary surface (research excellence, global network, career success), a masonry campus-gallery, a 3-up star-rated student-story testimonial grid with headshots, a 3-tier tuition pricing section (In-State, Out-of-State featured 'Most Popular', Graduate) with checklists and per-tier CTAs, an accordion FAQ (deadlines, test-optional scores, financial aid, campus visits, housing), a vibrant gradient apply CTA with application-fee note, and a multi-column footer (Academics, Admissions, Contact) with address/phone/email and social links. Use as the ROOT/home page for a university, college, school, graduate program, online-degree provider, admissions office, or any education institution that needs an energetic, conversion-focused page driving applications and campus visits. Supply content only — brand, nav, hero, stats, programs, campus, features, gallery, testimonials, tuition, faq, cta, footer; the block owns all layout and styling.",
  props: z.object({
    /** University / institution name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content. */
    hero: z
      .object({
        statusPill: z.string().optional(),
        headingLines: z.array(z.string()).optional(),
        /** Index of the headline line that gets the primary accent color. */
        accentLine: z.number().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        badges: z.array(z.string()).optional(),
        imageAlt: z.string().optional(),
        cardAlt: z.string().optional(),
        cardTitle: z.string().optional(),
        cardSubtitle: z.string().optional(),
      })
      .optional(),
    /** Stats band. */
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    /** Academic programs grid. */
    programs: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        cta: z.string().optional(),
        items: z
          .array(
            z.object({
              tag: z.string(),
              duration: z.string(),
              title: z.string(),
              description: z.string(),
              link: z.string(),
              imageAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Campus-life split section with icon highlights + photo mosaic. */
    campus: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        cta: z.string().optional(),
        highlights: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
        images: z.array(z.string()).optional(),
      })
      .optional(),
    /** "Why Westfield" glassy feature band. */
    features: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Masonry campus photo gallery. */
    gallery: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z.array(z.string()).optional(),
      })
      .optional(),
    /** Star-rated student-story testimonials. */
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
    /** Tuition & financial-aid pricing tiers. */
    tuition: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        note: z.string().optional(),
        noteCta: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
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
    /** Accordion FAQ. */
    faq: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
      })
      .optional(),
    /** Vibrant gradient apply CTA. */
    cta: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        note: z.string().optional(),
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
    const brand = props.brand ?? "Westfield"
    const nav = props.nav?.length
      ? props.nav
      : ["Programs", "Campus Life", "Admissions", "Research", "About"]

    const heroStatus = props.hero?.statusPill ?? "Applications Open for Fall 2025"
    const heroLines = props.hero?.headingLines?.length
      ? props.hero.headingLines
      : ["Innovate.", "Create.", "Lead."]
    const heroAccentLine = props.hero?.accentLine ?? 1
    const heroSub =
      props.hero?.subheading ??
      "Join 15,000+ students at Westfield University. World-class programs, breakthrough research, and a vibrant campus community in the heart of Boston."
    const heroPrimary = props.hero?.primaryCta ?? "Start Your Application"
    const heroSecondary = props.hero?.secondaryCta ?? "Explore Programs"
    const heroBadges = props.hero?.badges?.length
      ? props.hero.badges
      : ["#12 in Research Output", "94% Employment Rate"]
    const heroImageAlt =
      props.hero?.imageAlt ??
      "Aerial view of modern university campus with historic buildings and green quad"
    const heroCardAlt =
      props.hero?.cardAlt ??
      "Students studying together in modern library"
    const heroCardTitle = props.hero?.cardTitle ?? "Virtual Campus Tour"
    const heroCardSubtitle =
      props.hero?.cardSubtitle ?? "Experience Westfield from anywhere"

    const statItems = props.stats?.length
      ? props.stats
      : [
          { value: "15,400+", label: "Students Enrolled" },
          { value: "200+", label: "Degree Programs" },
          { value: "94%", label: "Graduate Employment" },
          { value: "85:1", label: "Student-Faculty Ratio" },
        ]

    const programsEyebrow = props.programs?.eyebrow ?? "Academic Excellence"
    const programsHeading = props.programs?.heading ?? "Discover Your Path"
    const programsDesc =
      props.programs?.description ??
      "Choose from over 200 undergraduate and graduate programs across 8 schools and colleges."
    const programsCta = props.programs?.cta ?? "View All Programs"
    const programItems = props.programs?.items?.length
      ? props.programs.items
      : [
          {
            tag: "STEM",
            duration: "4 years",
            title: "Computer Science & AI",
            description:
              "Master machine learning, software engineering, and data science with industry leaders from Google and Microsoft.",
            link: "Learn more",
            imageAlt:
              "Computer science student working at multi-monitor workstation with code",
          },
          {
            tag: "HEALTH",
            duration: "4 years",
            title: "Biomedical Sciences",
            description:
              "Pioneer breakthroughs in genetics, neuroscience, and public health with our $50M research facility.",
            link: "Learn more",
            imageAlt:
              "Medical students in modern simulation lab practicing procedures",
          },
          {
            tag: "BUSINESS",
            duration: "4 years",
            title: "Business Administration",
            description:
              "Develop leadership skills with Fortune 500 executives. MBA partnerships with Harvard and MIT.",
            link: "Learn more",
            imageAlt:
              "Business professionals in modern conference room discussing strategy",
          },
          {
            tag: "DESIGN",
            duration: "5 years",
            title: "Architecture & Design",
            description:
              "Create sustainable spaces and digital experiences. Accredited by NAAB with global studio opportunities.",
            link: "Learn more",
            imageAlt:
              "Architecture students reviewing building blueprints in design studio",
          },
          {
            tag: "EDUCATION",
            duration: "4 years",
            title: "Education & Teaching",
            description:
              "Shape the next generation. 100% job placement rate for graduates in K-12 education.",
            link: "Learn more",
            imageAlt:
              "Elementary school teacher helping students with art project in colorful classroom",
          },
          {
            tag: "LAW",
            duration: "3 years",
            title: "Law & Policy",
            description:
              "Advocate for justice with our J.D. program. Top 20 law school with clinical practice in immigration and civil rights.",
            link: "Learn more",
            imageAlt:
              "Law students in university courtroom during mock trial session",
          },
        ]

    const campusEyebrow = props.campus?.eyebrow ?? "Campus Life"
    const campusHeading = props.campus?.heading ?? "Live, Learn & Thrive"
    const campusDesc =
      props.campus?.description ??
      "Our 200-acre Boston campus combines historic architecture with cutting-edge facilities. From state-of-the-art labs to vibrant student centers, everything you need is steps away."
    const campusCta = props.campus?.cta ?? "Take Virtual Tour"
    const campusHighlights = props.campus?.highlights?.length
      ? props.campus.highlights
      : [
          {
            title: "Modern Housing",
            description: "12 residence halls with suite-style living",
          },
          {
            title: "300+ Clubs",
            description: "From robotics to rugby, find your community",
          },
          {
            title: "Health & Wellness",
            description: "24/7 health center and fitness complex",
          },
          {
            title: "Night & Weekend",
            description: "Events, concerts, and activities year-round",
          },
        ]
    const campusImages = props.campus?.images?.length
      ? props.campus.images
      : [
          "University library interior with students studying at wooden desks",
          "Students playing basketball in modern campus gymnasium",
          "Modern university science laboratory with equipment",
          "University amphitheater with students attending outdoor event",
        ]

    const featuresEyebrow = props.features?.eyebrow ?? "Why Westfield"
    const featuresHeading =
      props.features?.heading ?? "World-Class Education"
    const featuresDesc =
      props.features?.description ??
      "Experience the difference of learning at a top-tier research university with global impact."
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: "Research Excellence",
            description:
              "$180M annually in research funding. Work alongside Nobel laureates and pioneers in AI, medicine, and climate science.",
          },
          {
            title: "Global Network",
            description:
              "Study abroad in 40+ countries. Partner universities include Oxford, ETH Zurich, and National University of Singapore.",
          },
          {
            title: "Career Success",
            description:
              "94% employed within 6 months. Top employers: Google, Goldman Sachs, Mayo Clinic, Tesla, and McKinsey.",
          },
        ]

    const galleryEyebrow = props.gallery?.eyebrow ?? "Student Life"
    const galleryHeading = props.gallery?.heading ?? "Campus Gallery"
    const galleryDesc =
      props.gallery?.description ??
      "A glimpse into daily life at Westfield University."
    const galleryItems = props.gallery?.items?.length
      ? props.gallery.items
      : [
          "Graduation ceremony with students in caps and gowns celebrating",
          "Group of diverse students studying together in dorm common area",
          "College football game with cheering fans in stadium",
          "Modern university cafeteria with students eating and socializing",
          "Student orchestra performing in concert hall",
          "Students walking across campus in autumn with fall foliage",
        ]

    const testimonialsEyebrow = props.testimonials?.eyebrow ?? "Student Stories"
    const testimonialsHeading =
      props.testimonials?.heading ?? "What Our Students Say"
    const testimonialsDesc =
      props.testimonials?.description ??
      "Hear from the Westfield community about their transformative experiences."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "The AI research program here is incredible. I worked on a neural network project that got published at NeurIPS. The faculty genuinely care about your success.",
            name: "Marcus Chen",
            role: "CS '24 • Now at Google Brain",
            avatarAlt:
              "Professional headshot of Marcus Chen, Computer Science graduate",
          },
          {
            quote:
              "Studying abroad in Copenhagen changed my perspective completely. The international office made everything seamless. Best semester of my life!",
            name: "Sarah Williams",
            role: "Business '25 • Intern at Deloitte",
            avatarAlt:
              "Professional headshot of Sarah Williams, International Business major",
          },
          {
            quote:
              "The pre-med program prepared me so well for MCATs and med school interviews. My advisor helped me secure research at Mass General. Dream come true!",
            name: "Dr. Priya Patel",
            role: "Biology '23 • HMS Medical Student",
            avatarAlt:
              "Professional headshot of Dr. Priya Patel, Biology graduate and medical student",
          },
        ]

    const tuitionEyebrow = props.tuition?.eyebrow ?? "Tuition & Aid"
    const tuitionHeading = props.tuition?.heading ?? "Invest in Your Future"
    const tuitionDesc =
      props.tuition?.description ??
      "Affordable excellence. 78% of students receive financial aid. Average award: $28,500/year."
    const tuitionNote =
      props.tuition?.note ??
      "Additional fees: Student Activity ($450), Technology ($280), Health Services ($180)"
    const tuitionNoteCta = props.tuition?.noteCta ?? "View full cost breakdown"
    const tuitionItems = props.tuition?.items?.length
      ? props.tuition.items
      : [
          {
            title: "In-State",
            price: "$18,450",
            period: "/year",
            features: [
              "Full-time tuition (12-18 credits)",
              "Access to all facilities",
              "Career services included",
              "Merit scholarships available",
            ],
            cta: "Calculate Your Aid",
          },
          {
            title: "Out-of-State",
            price: "$34,200",
            period: "/year",
            features: [
              "Everything in In-State",
              "Priority housing selection",
              "Research assistant opportunities",
              "Study abroad grants up to $5K",
            ],
            cta: "Apply Now",
            featured: true,
            badge: "Most Popular",
          },
          {
            title: "Graduate",
            price: "$24,800",
            period: "/year",
            features: [
              "Master's & PhD programs",
              "Teaching assistantships",
              "Research stipends available",
              "Professional networking",
            ],
            cta: "Explore Graduate Programs",
          },
        ]

    const faqEyebrow = props.faq?.eyebrow ?? "FAQ"
    const faqHeading = props.faq?.heading ?? "Common Questions"
    const faqDesc =
      props.faq?.description ??
      "Everything you need to know about applying to Westfield."
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            q: "What are the application deadlines?",
            a: "Early Decision: November 1 (notification by December 15). Regular Decision: January 15 (notification by April 1). Transfer students: March 1 for Fall, October 1 for Spring. Graduate programs vary by department—check specific program pages for details.",
          },
          {
            q: "What SAT/ACT scores do I need?",
            a: "Westfield is test-optional for Fall 2025 applicants. However, submitting scores can strengthen your application. Typical enrolled students have SAT 1300-1480 or ACT 28-33. International students must submit TOEFL (min 100) or IELTS (min 7.0) scores.",
          },
          {
            q: "How do I apply for financial aid?",
            a: "Complete the FAFSA (code: 002222) and CSS Profile by February 1. Merit scholarships are automatically considered with your application—no separate form needed. Work-study awards are included in financial aid packages for eligible students.",
          },
          {
            q: "Can I visit campus before applying?",
            a: "Absolutely! We offer daily campus tours, open houses each semester, and virtual information sessions. Overnight visits are available for admitted students in April. Book your visit at westfield.edu/visit or call 1-800-WESTFLD.",
          },
          {
            q: "What housing options are available?",
            a: "First-years live in one of four residential colleges: Summit, Harbor, Quad, or Tower. All rooms include WiFi, laundry, and meal plans. Upperclassmen can choose apartments, suites, or themed housing (Arts House, Green Living, Honors Community).",
          },
        ]

    const ctaHeading = props.cta?.heading ?? "Ready to Start Your Journey?"
    const ctaDesc =
      props.cta?.description ??
      "Applications for Fall 2025 are now open. Join our community of innovators, creators, and leaders. Your future starts here."
    const ctaPrimary = props.cta?.primaryCta ?? "Apply for Fall 2025"
    const ctaSecondary = props.cta?.secondaryCta ?? "Request Info"
    const ctaNote =
      props.cta?.note ??
      "Application fee: $65 (waivers available) • Deadline: January 15, 2025"

    const footerAbout =
      props.footer?.about ??
      "Empowering students to innovate, create, and lead since 1892. Located in the heart of Boston."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Academics",
            links: [
              "Undergraduate Programs",
              "Graduate Programs",
              "Online Learning",
              "Research Centers",
              "Libraries",
            ],
          },
          {
            title: "Admissions",
            links: [
              "Apply Online",
              "Visit Campus",
              "Financial Aid",
              "Tuition & Fees",
              "International Students",
            ],
          },
        ]
    const footerAddress = props.footer?.address ?? "450 Beacon Street, Boston, MA 02115"
    const footerPhone = props.footer?.phone ?? "1-800-WESTFLD"
    const footerEmail = props.footer?.email ?? "admissions@westfield.edu"
    const footerSocials = props.footer?.socials?.length
      ? props.footer.socials
      : ["Facebook", "Twitter", "Instagram", "LinkedIn"]
    const footerCopyright = props.footer?.copyright ?? "All rights reserved."
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Privacy Policy", "Terms of Use", "Accessibility"]

    const initial = brand.charAt(0).toUpperCase()

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

    const Arrow = ({ className }: { className?: string }) => (
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
        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
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

    const campusIcons = [
      // housing / building
      <svg key="c0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6" aria-hidden="true"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
      // clubs / bolt
      <svg key="c1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6" aria-hidden="true"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
      // wellness / heart
      <svg key="c2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6" aria-hidden="true"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
      // events / clock
      <svg key="c3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6" aria-hidden="true"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    ]

    const featureIcons = [
      // research / lightbulb
      <svg key="f0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-7" aria-hidden="true"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
      // global / share
      <svg key="f1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-7" aria-hidden="true"><path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      // career / briefcase
      <svg key="f2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-7" aria-hidden="true"><path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
    ]

    const playIcon = (
      <svg className="size-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M6.3 5.84a.75.75 0 00-1.06 1.06l4.78 4.78-4.78 4.78a.75.75 0 101.06 1.06l5.25-5.25a.75.75 0 000-1.06L6.3 5.84z" /></svg>
    )
    const badgeIcon = (
      <svg className="size-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
    )
    const pinIcon = (
      <svg className="size-5 flex-shrink-0 mt-0.5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
    )
    const phoneIcon = (
      <svg className="size-5 flex-shrink-0 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
    )
    const mailIcon = (
      <svg className="size-5 flex-shrink-0 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
    )

    const socialPaths: Record<string, string> = {
      Facebook:
        "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
      Twitter:
        "M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 00-2.163-2.723c-.951-.544-2.08-.647-3.148-.295-1.068.352-1.94.998-2.487 1.841-.546.843-.723 1.84-.497 2.79.226.951.77 1.781 1.515 2.315a4.978 4.978 0 01-2.255-.623v.063a4.986 4.986 0 003.976 4.89 5.026 5.026 0 01-2.26.086 4.978 4.978 0 004.633 3.453 9.993 9.993 0 01-7.424 2.078 14.098 14.098 0 007.608 2.228c9.127 0 14.124-7.56 14.124-14.124 0-.214-.005-.428-.014-.64a10.088 10.088 0 002.486-2.549z",
      Instagram:
        "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
      LinkedIn:
        "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
    }

    return (
      <div
        className={cn(
          "min-h-svh bg-background font-sans text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <nav className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-20 items-center justify-between">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center gap-2"
              >
                <span
                  className="grid size-10 place-items-center rounded-lg bg-primary text-xl font-bold text-primary-foreground"
                  aria-hidden="true"
                >
                  {initial}
                </span>
                <span className="text-xl font-bold text-foreground">{brand}</span>
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
                  onClick={() => go(heroPrimary)}
                  className="hidden rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-colors hover:bg-primary/90 sm:inline-flex"
                >
                  Apply Now
                </button>
                <button
                  type="button"
                  aria-label="Open menu"
                  aria-expanded={mobileOpen}
                  aria-controls="mobile-menu"
                  onClick={() => setMobileOpen((v: boolean) => !v)}
                  className="p-2 text-muted-foreground md:hidden"
                >
                  <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
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
          </div>
        </nav>

        <main>
          {/* Hero */}
          <section className="relative overflow-hidden bg-gradient-to-br from-secondary via-accent to-secondary pb-20 pt-32 lg:pb-32 lg:pt-40">
            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="text-center lg:text-left">
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-secondary-foreground/20 bg-secondary-foreground/10 px-4 py-2">
                    <span className="size-2 animate-pulse rounded-full bg-primary" aria-hidden="true" />
                    <span className="text-sm font-medium text-secondary-foreground/90">
                      {heroStatus}
                    </span>
                  </div>
                  <h1 className="mb-6 text-5xl font-black leading-tight text-secondary-foreground sm:text-6xl lg:text-7xl">
                    {heroLines.map((line, i) => (
                      <span
                        key={line}
                        className={cn(
                          "block",
                          i === heroAccentLine && "text-primary",
                        )}
                      >
                        {line}
                      </span>
                    ))}
                  </h1>
                  <p className="mx-auto mb-8 max-w-xl text-xl leading-relaxed text-secondary-foreground/80 lg:mx-0">
                    {heroSub}
                  </p>
                  <div className="flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-lg font-bold text-primary-foreground shadow-xl shadow-primary/30 transition-all hover:bg-primary/90"
                    >
                      {heroPrimary}
                      <Arrow className="size-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="inline-flex items-center justify-center rounded-full border border-secondary-foreground/30 bg-secondary-foreground/10 px-8 py-4 text-lg font-bold text-secondary-foreground backdrop-blur-sm transition-all hover:bg-secondary-foreground/20"
                    >
                      {heroSecondary}
                    </button>
                  </div>
                  <div className="mt-12 flex items-center justify-center gap-8 text-sm text-secondary-foreground/70 lg:justify-start">
                    {heroBadges.map((b) => (
                      <span key={b} className="flex items-center gap-2">
                        {badgeIcon}
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                    <Image
                      alt={heroImageAlt}
                      w={800}
                      h={600}
                      className="size-full object-cover"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-secondary/60 via-transparent to-transparent"
                    />
                    <div className="absolute inset-x-6 bottom-6">
                      <div className="flex items-center gap-4 rounded-xl bg-card/95 p-4 backdrop-blur-sm">
                        <Image
                          alt={heroCardAlt}
                          w={100}
                          h={100}
                          className="size-16 rounded-lg object-cover"
                        />
                        <div className="text-left">
                          <p className="font-semibold text-card-foreground">
                            {heroCardTitle}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {heroCardSubtitle}
                          </p>
                        </div>
                        <button
                          type="button"
                          aria-label="Play video"
                          onClick={() => go(heroCardTitle)}
                          className="ml-auto grid size-12 place-items-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/90"
                        >
                          {playIcon}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -right-6 -top-6 grid size-24 place-items-center rounded-2xl bg-primary shadow-xl">
                    <span className="text-2xl font-black text-primary-foreground" aria-hidden="true">
                      {initial}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Stats band */}
          <section className="border-b border-border bg-card py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
                {statItems.map((s) => (
                  <div key={s.label}>
                    <p className="mb-2 text-4xl font-black text-primary lg:text-5xl">
                      {s.value}
                    </p>
                    <p className="font-medium text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Programs */}
          <section className="bg-muted py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                  {programsEyebrow}
                </span>
                <h2 className="mb-4 text-4xl font-black text-foreground lg:text-5xl">
                  {programsHeading}
                </h2>
                <p className="text-xl text-muted-foreground">{programsDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {programItems.map((p) => (
                  <article
                    key={p.title}
                    className="group overflow-hidden rounded-2xl border border-border bg-card shadow-lg transition-all duration-300 hover:shadow-2xl"
                  >
                    <div className="h-48 overflow-hidden">
                      <Image
                        alt={p.imageAlt}
                        w={600}
                        h={400}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-6">
                      <div className="mb-3 flex items-center gap-2">
                        <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-bold text-accent">
                          {p.tag}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {p.duration}
                        </span>
                      </div>
                      <h3 className="mb-2 text-xl font-bold text-card-foreground">
                        {p.title}
                      </h3>
                      <p className="mb-4 text-muted-foreground">{p.description}</p>
                      <button
                        type="button"
                        onClick={() => go(p.link)}
                        className="inline-flex items-center gap-1 font-semibold text-primary transition-all hover:gap-2"
                      >
                        {p.link}
                        <Arrow className="size-4" />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
              <div className="mt-12 text-center">
                <button
                  type="button"
                  onClick={() => go(programsCta)}
                  className="inline-flex items-center gap-2 rounded-full bg-secondary px-8 py-4 font-bold text-secondary-foreground shadow-lg transition-colors hover:bg-secondary/90"
                >
                  {programsCta}
                  <Arrow className="size-5" />
                </button>
              </div>
            </div>
          </section>

          {/* Campus life */}
          <section className="bg-background py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-16 lg:grid-cols-2">
                <div>
                  <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                    {campusEyebrow}
                  </span>
                  <h2 className="mb-6 text-4xl font-black text-foreground lg:text-5xl">
                    {campusHeading}
                  </h2>
                  <p className="mb-8 text-xl leading-relaxed text-muted-foreground">
                    {campusDesc}
                  </p>
                  <div className="mb-8 grid gap-6 sm:grid-cols-2">
                    {campusHighlights.map((h, i) => (
                      <div key={h.title} className="flex items-start gap-4">
                        <div className="grid size-12 flex-shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                          {campusIcons[i % campusIcons.length]}
                        </div>
                        <div>
                          <h4 className="mb-1 font-bold text-foreground">
                            {h.title}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {h.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => go(campusCta)}
                    className="inline-flex items-center gap-2 rounded-full bg-secondary px-6 py-3 font-semibold text-secondary-foreground transition-colors hover:bg-secondary/90"
                  >
                    {campusCta}
                    <Arrow className="size-5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="overflow-hidden rounded-2xl shadow-lg">
                      <Image
                        alt={campusImages[0]}
                        w={400}
                        h={300}
                        loading="lazy"
                        className="h-48 w-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </div>
                    <div className="overflow-hidden rounded-2xl shadow-lg">
                      <Image
                        alt={campusImages[1]}
                        w={400}
                        h={500}
                        loading="lazy"
                        className="h-64 w-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </div>
                  </div>
                  <div className="space-y-4 pt-8">
                    <div className="overflow-hidden rounded-2xl shadow-lg">
                      <Image
                        alt={campusImages[2]}
                        w={400}
                        h={500}
                        loading="lazy"
                        className="h-64 w-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </div>
                    <div className="overflow-hidden rounded-2xl shadow-lg">
                      <Image
                        alt={campusImages[3]}
                        w={400}
                        h={300}
                        loading="lazy"
                        className="h-48 w-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Why Westfield (features) */}
          <section className="bg-secondary py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-secondary-foreground/10 px-4 py-1.5 text-sm font-semibold text-secondary-foreground">
                  {featuresEyebrow}
                </span>
                <h2 className="mb-4 text-4xl font-black text-secondary-foreground lg:text-5xl">
                  {featuresHeading}
                </h2>
                <p className="text-xl text-secondary-foreground/80">
                  {featuresDesc}
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-3">
                {featureItems.map((f, i) => (
                  <div
                    key={f.title}
                    className="rounded-2xl border border-secondary-foreground/20 bg-secondary-foreground/10 p-8 backdrop-blur-sm"
                  >
                    <div className="mb-6 grid size-14 place-items-center rounded-xl bg-primary text-primary-foreground">
                      {featureIcons[i % featureIcons.length]}
                    </div>
                    <h3 className="mb-3 text-xl font-bold text-secondary-foreground">
                      {f.title}
                    </h3>
                    <p className="leading-relaxed text-secondary-foreground/70">
                      {f.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Gallery */}
          <section className="bg-muted py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between">
                <div>
                  <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                    {galleryEyebrow}
                  </span>
                  <h2 className="text-4xl font-black text-foreground lg:text-5xl">
                    {galleryHeading}
                  </h2>
                </div>
                <p className="mt-4 max-w-md text-muted-foreground md:mt-0">
                  {galleryDesc}
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-4">
                {galleryItems.map((alt, i) => (
                  <div
                    key={alt}
                    className={cn(
                      "overflow-hidden rounded-2xl shadow-lg",
                      (i === 0 || i === 4) && "md:col-span-2",
                    )}
                  >
                    <Image
                      alt={alt}
                      w={i === 0 || i === 4 ? 800 : 400}
                      h={i === 0 || i === 4 ? 500 : 400}
                      loading="lazy"
                      className="h-64 w-full object-cover transition-transform duration-500 hover:scale-105 md:h-80"
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="bg-background py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                  {testimonialsEyebrow}
                </span>
                <h2 className="mb-4 text-4xl font-black text-foreground lg:text-5xl">
                  {testimonialsHeading}
                </h2>
                <p className="text-xl text-muted-foreground">
                  {testimonialsDesc}
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-3">
                {testimonialItems.map((t) => (
                  <article
                    key={t.name}
                    className="rounded-2xl border border-border bg-muted p-8"
                  >
                    <div className="mb-4 flex items-center gap-1">
                      {[0, 1, 2, 3, 4].map((n) => (
                        <Star key={n} className="size-5 text-primary" />
                      ))}
                    </div>
                    <p className="mb-6 leading-relaxed text-foreground/80">
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
                        <p className="font-bold text-foreground">{t.name}</p>
                        <p className="text-sm text-muted-foreground">{t.role}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Tuition pricing */}
          <section className="bg-muted py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                  {tuitionEyebrow}
                </span>
                <h2 className="mb-4 text-4xl font-black text-foreground lg:text-5xl">
                  {tuitionHeading}
                </h2>
                <p className="text-xl text-muted-foreground">{tuitionDesc}</p>
              </div>
              <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
                {tuitionItems.map((t) => (
                  <div
                    key={t.title}
                    className={cn(
                      "relative rounded-2xl p-8 shadow-lg",
                      t.featured
                        ? "border-4 border-primary bg-secondary shadow-2xl md:-translate-y-4"
                        : "border border-border bg-card",
                    )}
                  >
                    {t.badge && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-sm font-bold text-primary-foreground">
                        {t.badge}
                      </div>
                    )}
                    <div className="mb-6 text-center">
                      <h3
                        className={cn(
                          "mb-2 text-lg font-bold",
                          t.featured
                            ? "text-secondary-foreground"
                            : "text-card-foreground",
                        )}
                      >
                        {t.title}
                      </h3>
                      <div className="flex items-baseline justify-center gap-1">
                        <span
                          className={cn(
                            "text-4xl font-black",
                            t.featured
                              ? "text-secondary-foreground"
                              : "text-card-foreground",
                          )}
                        >
                          {t.price}
                        </span>
                        <span
                          className={cn(
                            t.featured
                              ? "text-secondary-foreground/70"
                              : "text-muted-foreground",
                          )}
                        >
                          {t.period}
                        </span>
                      </div>
                    </div>
                    <ul className="mb-8 space-y-3">
                      {t.features.map((f) => (
                        <li
                          key={f}
                          className={cn(
                            "flex items-center gap-3",
                            t.featured
                              ? "text-secondary-foreground/90"
                              : "text-muted-foreground",
                          )}
                        >
                          <Check className="size-5 flex-shrink-0 text-primary" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => go(t.cta)}
                      className={cn(
                        "block w-full rounded-xl py-3 text-center font-semibold transition-colors",
                        t.featured
                          ? "bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
                          : "border-2 border-border text-foreground hover:border-primary hover:text-primary",
                      )}
                    >
                      {t.cta}
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-12 text-center">
                <p className="mb-4 text-muted-foreground">{tuitionNote}</p>
                <button
                  type="button"
                  onClick={() => go(tuitionNoteCta)}
                  className="font-semibold text-primary hover:underline"
                >
                  {tuitionNoteCta} <span aria-hidden="true">→</span>
                </button>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-background py-24">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                  {faqEyebrow}
                </span>
                <h2 className="mb-4 text-4xl font-black text-foreground lg:text-5xl">
                  {faqHeading}
                </h2>
                <p className="text-xl text-muted-foreground">{faqDesc}</p>
              </div>
              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.q}
                    className="group rounded-xl border border-border bg-muted"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between p-6">
                      <h3 className="text-lg font-semibold text-foreground">
                        {item.q}
                      </h3>
                      <span className="transition group-open:rotate-180">
                        <svg
                          className="size-5 text-muted-foreground"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
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

          {/* Apply CTA */}
          <section className="relative overflow-hidden bg-gradient-to-br from-primary to-primary/70 py-24">
            <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2 className="mb-6 text-4xl font-black text-primary-foreground lg:text-5xl">
                {ctaHeading}
              </h2>
              <p className="mx-auto mb-10 max-w-2xl text-xl leading-relaxed text-primary-foreground/90">
                {ctaDesc}
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(ctaPrimary)}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-background px-10 py-5 text-lg font-bold text-primary shadow-xl transition-colors hover:bg-background/90"
                >
                  {ctaPrimary}
                  <Arrow className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={() => go(ctaSecondary)}
                  className="inline-flex items-center justify-center rounded-full border-2 border-primary-foreground/50 bg-primary-foreground/20 px-10 py-5 text-lg font-bold text-primary-foreground backdrop-blur-sm transition-colors hover:bg-primary-foreground/30"
                >
                  {ctaSecondary}
                </button>
              </div>
              <p className="mt-8 text-sm text-primary-foreground/80">{ctaNote}</p>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-secondary pb-10 pt-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-16 grid gap-12 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-6 flex items-center gap-2"
                >
                  <span
                    className="grid size-10 place-items-center rounded-lg bg-primary text-xl font-bold text-primary-foreground"
                    aria-hidden="true"
                  >
                    {initial}
                  </span>
                  <span className="text-xl font-bold text-secondary-foreground">
                    {brand}
                  </span>
                </button>
                <p className="mb-6 leading-relaxed text-secondary-foreground/70">
                  {footerAbout}
                </p>
                <div className="flex gap-4">
                  {footerSocials.map((social) => (
                    <button
                      key={social}
                      type="button"
                      aria-label={social}
                      onClick={() => go(social)}
                      className="grid size-10 place-items-center rounded-lg bg-secondary-foreground/10 text-secondary-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                    >
                      <svg
                        className="size-5"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d={socialPaths[social] ?? socialPaths.Facebook} />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h4 className="mb-6 font-bold text-secondary-foreground">
                    {col.title}
                  </h4>
                  <ul className="space-y-3">
                    {col.links.map((link) => (
                      <li key={link}>
                        <button
                          type="button"
                          onClick={() => go(link)}
                          className="text-secondary-foreground/70 transition-colors hover:text-primary"
                        >
                          {link}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <div>
                <h4 className="mb-6 font-bold text-secondary-foreground">
                  Contact
                </h4>
                <ul className="space-y-3 text-secondary-foreground/70">
                  <li className="flex items-start gap-3">
                    {pinIcon}
                    <span>{footerAddress}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    {phoneIcon}
                    <button
                      type="button"
                      onClick={() => go(footerPhone)}
                      className="transition-colors hover:text-primary"
                    >
                      {footerPhone}
                    </button>
                  </li>
                  <li className="flex items-center gap-3">
                    {mailIcon}
                    <button
                      type="button"
                      onClick={() => go(footerEmail)}
                      className="transition-colors hover:text-primary"
                    >
                      {footerEmail}
                    </button>
                  </li>
                </ul>
              </div>
            </div>
            <div className="flex flex-col items-center justify-between gap-4 border-t border-secondary-foreground/10 pt-8 md:flex-row">
              <p className="text-sm text-secondary-foreground/50">
                © {new Date().getFullYear()} {brand} University. {footerCopyright}
              </p>
              <div className="flex gap-6 text-sm">
                {footerLegal.map((link) => (
                  <button
                    key={link}
                    type="button"
                    onClick={() => go(link)}
                    className="text-secondary-foreground/50 transition-colors hover:text-secondary-foreground"
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
