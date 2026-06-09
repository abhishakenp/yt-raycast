import { useState } from "react"
import { z } from "zod/v4"
import { useState } from "react"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * UniversityKimiPage — a complete, self-contained higher-education / university
 * marketing + admissions LANDING page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "Westfield University" design:
 * a warm, editorial, stone-toned academic aesthetic with a sticky navbar, an
 * image-backed hero with admissions copy and trust pills, an accreditation logo
 * strip, a dark stats band, a 6-up academic-programs grid, a 4-step application
 * journey timeline, a campus-life photo gallery with captions, a 3-tier tuition
 * & financial-aid section, a 6-up student/faculty/alumni testimonial wall, an
 * accordion FAQ, a dark apply CTA with contact details, and a rich multi-column
 * footer with social links.
 *
 * The block owns ALL layout, spacing, type hierarchy and surfaces, mapped to
 * semantic theme tokens (background/card/muted/primary/...). Every nav item,
 * CTA, program link, footer link, social and form submit routes through
 * `useNavigate` (never a dead "#"). All imagery (hero, gallery, accreditation
 * logos, student/faculty headshots) uses the alt-driven <Image> component — no
 * raw <img>, no external src. Callers supply ONLY content data; rich defaults
 * make it render the full page with no props at all.
 */
export const UniversityKimiPage = defineComponent({
  name: "UniversityKimiPage",
  description:
    "Complete higher-education / UNIVERSITY, college or campus marketing + admissions LANDING page with a warm, editorial, stone-toned academic aesthetic. Includes a sticky navbar with an 'Apply Now' CTA, an image-backed hero with Fall-semester admissions copy, dual CTAs and trust pills (rolling admissions, scholarships), an accreditation/ranking logo strip, a dark enrollment-stats band (students, programs, employment rate, student-faculty ratio), a 6-up academic-programs grid with icons (Engineering, Business, Health Sciences, Arts, Social Sciences, Natural Sciences) and 'view N programs' links, a 4-step application-journey timeline (explore, apply, financial aid, enroll), a campus-life photo gallery with captioned library/quad/athletics/events tiles, a 3-tier tuition & financial-aid pricing section (tuition, net price with aid, room & board) with checklists, a 6-up student/faculty/alumni testimonial wall with headshots, an accordion FAQ about deadlines/test-optional/scholarships/housing/class-size, a dark apply CTA with phone/email/address contact details, and a rich multi-column footer (Academics, Admissions, Campus Life) with social links and legal row. Use as the ROOT/home page for a university, college, school, graduate program, online-degree provider, admissions office, or any education institution that needs a prestigious, conversion-focused page driving applications and campus visits. Supply content only — brand, nav, hero, stats, programs, steps, gallery, tuition, testimonials, faq, cta, footer; the block owns all layout and styling.",
  props: z.object({
    /** University / institution name shown in the navbar and footer. */
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
        /** Trust pills beneath the hero CTAs. */
        pills: z.array(z.string()).optional(),
        imageAlt: z.string().optional(),
      })
      .optional(),
    /** Accreditation / ranking logo strip. */
    logos: z
      .object({
        heading: z.string().optional(),
        /** Alt text per logo (alt-driven Image, rendered grayscale). */
        items: z.array(z.string()).optional(),
      })
      .optional(),
    /** Dark enrollment-stats band. */
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    /** Academic programs grid. */
    programs: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
              link: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Application-journey step timeline. */
    steps: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        cta: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
              timing: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Campus-life photo gallery. */
    gallery: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              caption: z.string(),
              imageAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Tuition & financial-aid pricing tiers. */
    tuition: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        calcNote: z.string().optional(),
        calcCta: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              price: z.string(),
              period: z.string(),
              description: z.string(),
              features: z.array(z.string()),
              featured: z.boolean().optional(),
              badge: z.string().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Student / faculty / alumni testimonial wall. */
    testimonials: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              name: z.string(),
              role: z.string(),
              quote: z.string(),
              footnote: z.string(),
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
        contactNote: z.string().optional(),
        contactCta: z.string().optional(),
        items: z
          .array(z.object({ q: z.string(), a: z.string() }))
          .optional(),
      })
      .optional(),
    /** Dark apply CTA with contact details. */
    cta: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        address: z.string().optional(),
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
    const brand = props.brand ?? "Westfield University"
    const nav = props.nav?.length
      ? props.nav
      : ["Programs", "Campus Life", "Admissions", "Research", "About"]

    const heroEyebrow = props.hero?.eyebrow ?? "Fall 2025 Admissions Open"
    const heroHeading = props.hero?.heading ?? "Transform Your Future at Westfield"
    const heroSub =
      props.hero?.subheading ??
      "Join over 12,000 students pursuing excellence across 85+ undergraduate and graduate programs. Early application deadline: December 15, 2025."
    const heroPrimary = props.hero?.primaryCta ?? "Start Application"
    const heroSecondary = props.hero?.secondaryCta ?? "Explore Programs"
    const heroPills = props.hero?.pills?.length
      ? props.hero.pills
      : ["Rolling Admissions", "$45M in Scholarships"]
    const heroImageAlt =
      props.hero?.imageAlt ??
      "Historic university campus building with Gothic architecture and autumn trees"

    const logosHeading =
      props.logos?.heading ?? "Recognized by Leading Institutions"
    const logoItems = props.logos?.items?.length
      ? props.logos.items
      : [
          "Forbes logo grayscale",
          "US News logo grayscale",
          "Princeton Review logo grayscale",
          "Times Higher Education logo grayscale",
          "QS World Rankings logo grayscale",
          "Bloomberg logo grayscale",
        ]

    const statItems = props.stats?.length
      ? props.stats
      : [
          { value: "12,400+", label: "Students Enrolled" },
          { value: "85+", label: "Academic Programs" },
          { value: "94%", label: "Employment Rate" },
          { value: "15:1", label: "Student-Faculty Ratio" },
        ]

    const programsHeading =
      props.programs?.heading ?? "Academic Excellence Across Disciplines"
    const programsDesc =
      props.programs?.description ??
      "Choose from over 85 undergraduate majors, 40 master's programs, and 12 doctoral degrees designed to prepare you for tomorrow's challenges."
    const programItems = props.programs?.items?.length
      ? props.programs.items
      : [
          {
            title: "Engineering & Technology",
            description:
              "ABET-accredited programs in Computer Science, Electrical, Mechanical, and Civil Engineering with state-of-the-art labs.",
            link: "View 12 programs",
          },
          {
            title: "Business & Economics",
            description:
              "AACSB-accredited Business School offering MBA, Finance, Marketing, and Entrepreneurship tracks with industry partnerships.",
            link: "View 18 programs",
          },
          {
            title: "Health Sciences",
            description:
              "Pre-med, Nursing, Public Health, and Psychology programs with clinical placements at partner hospitals and research centers.",
            link: "View 15 programs",
          },
          {
            title: "Arts & Humanities",
            description:
              "English, History, Philosophy, and Fine Arts with gallery spaces, performance venues, and study-abroad opportunities.",
            link: "View 22 programs",
          },
          {
            title: "Social Sciences",
            description:
              "Political Science, Sociology, Anthropology, and International Relations with policy internship programs in Washington D.C.",
            link: "View 14 programs",
          },
          {
            title: "Natural Sciences",
            description:
              "Biology, Chemistry, Physics, and Environmental Science with NSF-funded research labs and field station access.",
            link: "View 16 programs",
          },
        ]

    const stepsHeading = props.steps?.heading ?? "Your Application Journey"
    const stepsDesc =
      props.steps?.description ??
      "Four simple steps to join the Westfield community. Our admissions team is here to guide you through every stage."
    const stepsCta = props.steps?.cta ?? "Begin Application"
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: "Explore Programs",
            description:
              "Browse our 85+ programs, attend virtual info sessions, and connect with faculty in your field of interest.",
            timing: "September–November",
          },
          {
            title: "Submit Application",
            description:
              "Complete the Common App or Coalition App. Include transcripts, test scores (optional), and two recommendations.",
            timing: "Deadline: Dec 15 (Early)",
          },
          {
            title: "Financial Aid",
            description:
              "File FAFSA and CSS Profile. 78% of students receive aid. Merit scholarships up to $25,000/year available.",
            timing: "Priority: Feb 1",
          },
          {
            title: "Enrollment",
            description:
              "Receive your decision by February 1. Submit enrollment deposit by May 1 to secure your place.",
            timing: "Decision: Feb 1",
          },
        ]

    const galleryHeading = props.gallery?.heading ?? "Life at Westfield"
    const galleryDesc =
      props.gallery?.description ??
      "A vibrant campus community on 340 acres with world-class facilities, 200+ student organizations, and NCAA Division II athletics."
    const galleryItems = props.gallery?.items?.length
      ? props.gallery.items
      : [
          {
            title: "Harrison Memorial Library",
            caption: "Open 24/7 during finals week",
            imageAlt:
              "Students studying together in modern university library with floor-to-ceiling windows",
          },
          {
            title: "The Quad",
            caption: "Central gathering space for 12,400 students",
            imageAlt:
              "Aerial view of university campus with red brick buildings and green quad",
          },
          {
            title: "Wellness Center",
            caption: "120,000 sq ft fitness facility",
            imageAlt:
              "Student athletes training in modern fitness center with weight equipment",
          },
          {
            title: "Academic Walk",
            caption: "Connecting all major buildings",
            imageAlt:
              "Students walking between classes on tree-lined campus pathway in autumn",
          },
          {
            title: "Spring Fest 2025",
            caption: "Annual music and arts festival",
            imageAlt:
              "Students attending outdoor concert on campus lawn with stage lights",
          },
          {
            title: "Westfield Hall",
            caption:
              "Built 1892, houses the President's office and main auditorium",
            imageAlt:
              "Historic Gothic-style university building with ivy-covered stone facade",
          },
        ]

    const tuitionHeading = props.tuition?.heading ?? "Investing in Your Future"
    const tuitionDesc =
      props.tuition?.description ??
      "Transparent tuition and generous financial aid. 78% of students receive some form of assistance."
    const tuitionCalcNote =
      props.tuition?.calcNote ??
      "Use our Net Price Calculator to estimate your actual cost"
    const tuitionCalcCta = props.tuition?.calcCta ?? "Calculate Your Cost"
    const tuitionItems = props.tuition?.items?.length
      ? props.tuition.items
      : [
          {
            title: "Tuition & Fees",
            price: "$48,500",
            period: "/year",
            description:
              "Comprehensive fee includes full-time enrollment (12–18 credits), student activities, and campus facilities access.",
            features: [
              "12–18 credits per semester",
              "Student activity fee included",
              "Technology and lab fees",
            ],
          },
          {
            title: "With Aid (Average)",
            price: "$28,200",
            period: "/year",
            description:
              "Average net price after grants and scholarships for students receiving financial aid packages.",
            features: [
              "Merit scholarships available",
              "Need-based grants",
              "Work-study opportunities",
            ],
            featured: true,
            badge: "Most Popular",
          },
          {
            title: "Room & Board",
            price: "$14,800",
            period: "/year",
            description:
              "Double occupancy residence halls with unlimited meal plan. Single rooms and apartments available at additional cost.",
            features: [
              "12 residence halls",
              "5 dining locations",
              "Dietary accommodations",
            ],
          },
        ]

    const testimonialsHeading =
      props.testimonials?.heading ?? "Voices from Our Community"
    const testimonialsDesc =
      props.testimonials?.description ??
      "Hear from students, faculty, and alumni about their Westfield experience."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            name: "Sarah Chen",
            role: "Class of 2024, Computer Science",
            quote:
              "The research opportunities here are incredible. I worked with Dr. Martinez on machine learning projects as a sophomore and landed a role at Google before graduation.",
            footnote: "Now: Software Engineer at Google, Mountain View",
            avatarAlt:
              "Professional headshot of Sarah Chen, a young Asian woman with shoulder-length black hair smiling",
          },
          {
            name: "Marcus Williams",
            role: "Class of 2023, Business Administration",
            quote:
              "The entrepreneurship program connected me with mentors who helped me launch my startup. Westfield's network in the business world is unmatched.",
            footnote: "Now: Founder & CEO, GreenRoute Logistics",
            avatarAlt:
              "Professional headshot of Marcus Williams, a young Black man with short hair and a warm smile",
          },
          {
            name: "Dr. Elena Rodriguez",
            role: "Professor of Biology, 15 years",
            quote:
              "What sets Westfield apart is the genuine care faculty have for students. I know every student in my lab by name, their goals, and their challenges.",
            footnote: "Research Focus: Marine Conservation Biology",
            avatarAlt:
              "Professional headshot of Dr. Elena Rodriguez, a Latina woman in her 40s with professional attire",
          },
          {
            name: "James Park",
            role: "Class of 2025, Political Science",
            quote:
              "My internship through the D.C. semester program gave me experience on Capitol Hill that textbooks simply can't provide. I'm now applying to law school with real policy experience.",
            footnote: "Intern: Senate Committee on Foreign Relations",
            avatarAlt:
              "Professional headshot of James Park, a Korean-American man in his late 20s with glasses and a friendly expression",
          },
          {
            name: "Aisha Patel",
            role: "Class of 2022, Nursing",
            quote:
              "The clinical placements at Westfield Memorial Hospital prepared me for the NCLEX and real-world nursing. I passed my boards on the first attempt.",
            footnote: "Now: Registered Nurse, Johns Hopkins Hospital",
            avatarAlt:
              "Professional headshot of Aisha Patel, a South Asian woman with long dark hair and a confident smile",
          },
          {
            name: "Robert Mitchell",
            role: "Alumni, Class of 1985, Donor",
            quote:
              "Westfield gave me the foundation to build a career in finance. Giving back through scholarships is my way of ensuring future generations have the same opportunity.",
            footnote: "Established: Mitchell Family Scholarship, $2M endowment",
            avatarAlt:
              "Professional headshot of Robert Mitchell, an older white man with gray hair and a welcoming smile",
          },
        ]

    const faqHeading = props.faq?.heading ?? "Common Questions"
    const faqDesc =
      props.faq?.description ??
      "Everything you need to know about applying to Westfield."
    const faqContactNote = props.faq?.contactNote ?? "Still have questions?"
    const faqContactCta = props.faq?.contactCta ?? "Contact Admissions"
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            q: "What is the application deadline?",
            a: "Early Decision deadline is December 15, 2025 with decisions released February 1, 2026. Regular Decision deadline is January 15, 2026 with decisions released April 1, 2026. Transfer applications are accepted on a rolling basis.",
          },
          {
            q: "Are SAT/ACT scores required?",
            a: "Westfield is test-optional for Fall 2025 and 2026 applicants. You may submit scores if you believe they strengthen your application, but they are not required. Students who do not submit scores are not disadvantaged in our holistic review process.",
          },
          {
            q: "What scholarships are available?",
            a: "Merit scholarships range from $10,000 to $25,000 annually and are awarded based on academic achievement, leadership, and extracurricular involvement. All applicants are automatically considered—no separate application required. Additional need-based aid is available through FAFSA.",
          },
          {
            q: "Can I visit campus?",
            a: "Yes! We offer campus tours Monday through Saturday, information sessions with admissions counselors, and overnight visits where you can stay with a current student. Virtual tours and information sessions are also available for those unable to visit in person.",
          },
          {
            q: "What is the average class size?",
            a: "Our student-to-faculty ratio is 15:1, with an average class size of 22 students. Introductory lecture courses typically have 60–80 students, while upper-level seminars and labs are limited to 12–18 students for personalized instruction.",
          },
          {
            q: "Is housing guaranteed?",
            a: "Housing is guaranteed for all first-year and sophomore students. Juniors and seniors may choose to live on campus or in off-campus apartments. We offer traditional residence halls, suite-style living, and apartment communities to suit different preferences.",
          },
        ]

    const ctaHeading = props.cta?.heading ?? "Begin Your Journey Today"
    const ctaDesc =
      props.cta?.description ??
      "Applications for Fall 2025 are now open. Early Decision deadline is December 15, 2025. Take the first step toward your future at Westfield."
    const ctaPrimary = props.cta?.primaryCta ?? "Start Your Application"
    const ctaSecondary = props.cta?.secondaryCta ?? "Request Information"
    const ctaPhone = props.cta?.phone ?? "(555) 234-5678"
    const ctaEmail = props.cta?.email ?? "admissions@westfield.edu"
    const ctaAddress = props.cta?.address ?? "1200 University Drive, Westfield, MA"

    const footerAbout =
      props.footer?.about ??
      "Transforming lives through education since 1892. A private research university committed to academic excellence, innovation, and community impact."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Academics",
            links: [
              "Undergraduate Programs",
              "Graduate Programs",
              "Online Learning",
              "Summer Sessions",
              "Course Catalog",
            ],
          },
          {
            title: "Admissions",
            links: [
              "Apply Online",
              "Visit Campus",
              "Tuition & Aid",
              "Request Info",
              "Transfer Students",
            ],
          },
          {
            title: "Campus Life",
            links: [
              "Housing",
              "Dining",
              "Athletics",
              "Student Organizations",
              "Career Services",
            ],
          },
        ]
    const footerSocials = props.footer?.socials?.length
      ? props.footer.socials
      : ["Facebook", "Twitter", "Instagram", "LinkedIn"]
    const footerCopyright =
      props.footer?.copyright ?? "All rights reserved."
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Privacy Policy", "Terms of Use", "Accessibility", "Consumer Information"]

    // Brand monogram tile (decorative brand asset).
    const initials = brand
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w.charAt(0))
      .join("")
      .toUpperCase()

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


    const programIcons = [
      // monitor / engineering
      <svg key="i0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6" aria-hidden="true"><rect x="3" y="3" width="18" height="12" rx="2" /><path d="M9 21h6M12 15v6" /></svg>,
      // currency / business
      <svg key="i1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M14.5 9.5a2.5 2.5 0 0 0-2.5-1.5c-1.4 0-2.5.8-2.5 2s1.1 2 2.5 2 2.5.8 2.5 2-1.1 2-2.5 2a2.5 2.5 0 0 1-2.5-1.5M12 6v1m0 9v1" /></svg>,
      // shield / health
      <svg key="i2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6" aria-hidden="true"><path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4z" /><path d="M12 8v6m-3-3h6" /></svg>,
      // book / arts
      <svg key="i3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6" aria-hidden="true"><path d="M12 6.5C10.8 5.7 9.2 5.3 7.5 5.3S4.2 5.7 3 6.5v13c1.2-.8 2.8-1.2 4.5-1.2s3.3.4 4.5 1.2m0-13C13.2 5.7 14.8 5.3 16.5 5.3S19.8 5.7 21 6.5v13c-1.2-.8-2.8-1.2-4.5-1.2s-3.3.4-4.5 1.2M12 6.5v13" /></svg>,
      // globe / social science
      <svg key="i4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.4 4 5.6 4 9s-1.5 6.6-4 9c-2.5-2.4-4-5.6-4-9s1.5-6.6 4-9z" /></svg>,
      // beaker / natural science
      <svg key="i5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6" aria-hidden="true"><path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3" /><path d="M7.5 15h9" /></svg>,
    ]

    const phoneIcon = (
      <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 5a2 2 0 0 1 2-2h3.3a1 1 0 0 1 .95.68l1.5 4.5a1 1 0 0 1-.5 1.2l-2.26 1.13a11 11 0 0 0 5.5 5.5l1.13-2.26a1 1 0 0 1 1.2-.5l4.5 1.5a1 1 0 0 1 .68.95V19a2 2 0 0 1-2 2h-1C9.7 21 3 14.3 3 6V5z" /></svg>
    )
    const mailIcon = (
      <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 8 9 6 9-6" /></svg>
    )
    const pinIcon = (
      <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z" /><circle cx="12" cy="10" r="3" /></svg>
    )

    const socialPaths: Record<string, string> = {
      Facebook:
        "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
      Twitter:
        "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
      Instagram:
        "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
      LinkedIn:
        "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
    }

    return (
      <div
        className={cn(
          "min-h-svh bg-background text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
          <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between lg:h-20">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center gap-2"
              >
                <span
                  className="grid size-8 place-items-center rounded-sm bg-foreground text-sm font-bold text-background"
                  aria-hidden="true"
                >
                  {initials}
                </span>
                <span className="text-lg font-semibold tracking-tight text-foreground">
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
                  onClick={() => go(heroPrimary)}
                  className="hidden rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-foreground/90 sm:inline-flex"
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
                  <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
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
          <section className="relative overflow-hidden bg-muted">
            <div aria-hidden="true" className="absolute inset-0 opacity-40">
              <Image
                alt={heroImageAlt}
                w={1920}
                h={1080}
                className="size-full object-cover"
              />
            </div>
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background/90"
            />
            <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
              <div className="max-w-2xl">
                <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  {heroEyebrow}
                </p>
                <h1 className="mb-6 text-4xl font-bold leading-tight text-foreground sm:text-5xl lg:text-6xl">
                  {heroHeading}
                </h1>
                <p className="mb-8 text-lg leading-relaxed text-muted-foreground sm:text-xl">
                  {heroSub}
                </p>
                <div className="flex flex-wrap gap-4">
                  <button
                    type="button"
                    onClick={() => go(heroPrimary)}
                    className="inline-flex rounded-full bg-foreground px-8 py-4 font-semibold text-background transition-colors hover:bg-foreground/90"
                  >
                    {heroPrimary}
                  </button>
                  <button
                    type="button"
                    onClick={() => go(heroSecondary)}
                    className="inline-flex rounded-full border border-border bg-background px-8 py-4 font-semibold text-foreground transition-colors hover:bg-muted"
                  >
                    {heroSecondary}
                  </button>
                </div>
                <div className="mt-12 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                  {heroPills.map((pill) => (
                    <span key={pill} className="flex items-center gap-2">
                      <Check className="size-5" />
                      {pill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Accreditation logos */}
          <section className="border-b border-border bg-card py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
                {logosHeading}
              </p>
              <div className="grid grid-cols-2 items-center gap-8 opacity-60 md:grid-cols-4 lg:grid-cols-6">
                {logoItems.map((logo, i) => (
                  <Image
                    key={logo}
                    alt={logo}
                    w={200}
                    h={64}
                    className={cn(
                      "mx-auto h-8 object-contain grayscale",
                      i >= 4 && "hidden lg:block",
                    )}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* Stats band */}
          <section className="bg-foreground py-16 lg:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-12">
                {statItems.map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="mb-2 text-4xl font-bold text-background lg:text-5xl">
                      {s.value}
                    </p>
                    <p className="text-sm text-background/70">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Programs */}
          <section className="bg-card py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                  {programsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{programsDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {programItems.map((p, i) => (
                  <article
                    key={p.title}
                    className="group rounded-xl border border-border bg-muted p-8 transition-colors hover:border-foreground/30"
                  >
                    <div className="mb-6 grid size-12 place-items-center rounded-lg bg-foreground text-background">
                      {programIcons[i % programIcons.length]}
                    </div>
                    <h3 className="mb-3 text-xl font-semibold text-foreground">
                      {p.title}
                    </h3>
                    <p className="mb-4 leading-relaxed text-muted-foreground">
                      {p.description}
                    </p>
                    <button
                      type="button"
                      onClick={() => go(p.link)}
                      className="flex items-center gap-1 text-sm font-medium text-foreground transition-all group-hover:gap-2"
                    >
                      {p.link} <span aria-hidden="true">→</span>
                    </button>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Application steps */}
          <section className="bg-muted py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                  {stepsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{stepsDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                {stepItems.map((step, i) => (
                  <div key={step.title} className="relative">
                    <div className="mb-6 grid size-12 place-items-center rounded-full bg-foreground text-lg font-bold text-background">
                      {i + 1}
                    </div>
                    {i < stepItems.length - 1 && (
                      <div
                        aria-hidden="true"
                        className="absolute left-12 top-6 hidden h-0.5 w-full bg-border lg:block"
                      />
                    )}
                    <h3 className="mb-2 text-lg font-semibold text-foreground">
                      {step.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground/70">
                      {step.timing}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-16 text-center">
                <button
                  type="button"
                  onClick={() => go(stepsCta)}
                  className="inline-flex items-center gap-2 rounded-full bg-foreground px-8 py-4 font-semibold text-background transition-colors hover:bg-foreground/90"
                >
                  {stepsCta} <span aria-hidden="true">→</span>
                </button>
              </div>
            </div>
          </section>

          {/* Campus-life gallery */}
          <section className="bg-card py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                  {galleryHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{galleryDesc}</p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {galleryItems.map((g, i) => (
                  <figure
                    key={g.title}
                    className={cn(
                      "group relative aspect-[4/3] overflow-hidden rounded-xl",
                      i === 1 && "lg:row-span-2",
                      i === 5 && "lg:col-span-2",
                    )}
                  >
                    <Image
                      alt={g.imageAlt}
                      w={800}
                      h={600}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/80 to-transparent p-6">
                      <p className="font-semibold text-background">{g.title}</p>
                      <p className="text-sm text-background/80">{g.caption}</p>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </section>

          {/* Tuition & aid */}
          <section className="bg-muted py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                  {tuitionHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{tuitionDesc}</p>
              </div>
              <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
                {tuitionItems.map((t) => (
                  <div
                    key={t.title}
                    className={cn(
                      "relative rounded-xl p-8",
                      t.featured
                        ? "bg-foreground"
                        : "border border-border bg-card",
                    )}
                  >
                    {t.badge && (
                      <span className="absolute right-4 top-4 rounded-full bg-background/10 px-3 py-1 text-xs font-medium text-background">
                        {t.badge}
                      </span>
                    )}
                    <h3
                      className={cn(
                        "mb-2 text-lg font-semibold",
                        t.featured ? "text-background" : "text-foreground",
                      )}
                    >
                      {t.title}
                    </h3>
                    <p
                      className={cn(
                        "mb-4 text-4xl font-bold",
                        t.featured ? "text-background" : "text-foreground",
                      )}
                    >
                      {t.price}
                      <span
                        className={cn(
                          "text-lg font-normal",
                          t.featured
                            ? "text-background/70"
                            : "text-muted-foreground",
                        )}
                      >
                        {t.period}
                      </span>
                    </p>
                    <p
                      className={cn(
                        "mb-6 text-sm",
                        t.featured
                          ? "text-background/80"
                          : "text-muted-foreground",
                      )}
                    >
                      {t.description}
                    </p>
                    <ul
                      className={cn(
                        "space-y-3 text-sm",
                        t.featured
                          ? "text-background/80"
                          : "text-muted-foreground",
                      )}
                    >
                      {t.features.map((f) => (
                        <li key={f} className="flex items-center gap-2">
                          <Check
                            className={cn(
                              "size-5",
                              t.featured
                                ? "text-background/60"
                                : "text-muted-foreground/60",
                            )}
                          />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="mt-12 text-center">
                <p className="mb-4 text-sm text-muted-foreground">
                  {tuitionCalcNote}
                </p>
                <button
                  type="button"
                  onClick={() => go(tuitionCalcCta)}
                  className="inline-flex items-center gap-2 font-medium text-foreground hover:underline"
                >
                  {tuitionCalcCta} <span aria-hidden="true">→</span>
                </button>
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="bg-card py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                  {testimonialsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {testimonialsDesc}
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {testimonialItems.map((t) => (
                  <blockquote
                    key={t.name}
                    className="rounded-xl border border-border bg-muted p-8"
                  >
                    <div className="mb-6 flex items-center gap-4">
                      <Image
                        alt={t.avatarAlt}
                        w={120}
                        h={120}
                        className="size-14 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold text-foreground">{t.name}</p>
                        <p className="text-sm text-muted-foreground">{t.role}</p>
                      </div>
                    </div>
                    <p className="mb-4 leading-relaxed text-muted-foreground">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <p className="text-sm text-muted-foreground/70">
                      {t.footnote}
                    </p>
                  </blockquote>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-muted py-20 lg:py-28">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                  {faqHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{faqDesc}</p>
              </div>
              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.q}
                    className="group overflow-hidden rounded-lg border border-border bg-card"
                  >
                    <summary className="flex cursor-pointer items-center justify-between p-6 transition-colors hover:bg-muted">
                      <span className="font-semibold text-foreground">
                        {item.q}
                      </span>
                      <svg
                        className="size-5 text-muted-foreground transition-transform group-open:rotate-180"
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
                    </summary>
                    <div className="px-6 pb-6 leading-relaxed text-muted-foreground">
                      {item.a}
                    </div>
                  </details>
                ))}
              </div>
              <div className="mt-12 text-center">
                <p className="mb-4 text-muted-foreground">{faqContactNote}</p>
                <button
                  type="button"
                  onClick={() => go(faqContactCta)}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 font-medium text-foreground transition-colors hover:bg-muted"
                >
                  {faqContactCta} <span aria-hidden="true">→</span>
                </button>
              </div>
            </div>
          </section>

          {/* Apply CTA */}
          <section className="bg-foreground py-20 lg:py-28">
            <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2 className="mb-6 text-3xl font-bold text-background sm:text-4xl lg:text-5xl">
                {ctaHeading}
              </h2>
              <p className="mx-auto mb-10 max-w-2xl text-lg text-background/80 sm:text-xl">
                {ctaDesc}
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(ctaPrimary)}
                  className="w-full rounded-full bg-background px-10 py-4 text-center font-semibold text-foreground transition-colors hover:bg-background/90 sm:w-auto"
                >
                  {ctaPrimary}
                </button>
                <button
                  type="button"
                  onClick={() => go(ctaSecondary)}
                  className="w-full rounded-full border border-background/30 bg-transparent px-10 py-4 text-center font-semibold text-background transition-colors hover:bg-background/10 sm:w-auto"
                >
                  {ctaSecondary}
                </button>
              </div>
              <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-background/70">
                <button
                  type="button"
                  onClick={() => go(ctaSecondary)}
                  className="flex items-center gap-2 transition-colors hover:text-background"
                >
                  {phoneIcon}
                  {ctaPhone}
                </button>
                <button
                  type="button"
                  onClick={() => go(ctaSecondary)}
                  className="flex items-center gap-2 transition-colors hover:text-background"
                >
                  {mailIcon}
                  {ctaEmail}
                </button>
                <button
                  type="button"
                  onClick={() => go(ctaSecondary)}
                  className="flex items-center gap-2 transition-colors hover:text-background"
                >
                  {pinIcon}
                  {ctaAddress}
                </button>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-foreground py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-12 md:grid-cols-2 lg:grid-cols-5">
              <div className="lg:col-span-2">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 flex items-center gap-2"
                >
                  <span
                    className="grid size-8 place-items-center rounded-sm bg-background text-sm font-bold text-foreground"
                    aria-hidden="true"
                  >
                    {initials}
                  </span>
                  <span className="text-lg font-semibold text-background">
                    {brand}
                  </span>
                </button>
                <p className="mb-4 text-sm leading-relaxed text-background/70">
                  {footerAbout}
                </p>
                <div className="flex gap-4">
                  {footerSocials.map((social) => (
                    <button
                      key={social}
                      type="button"
                      aria-label={social}
                      onClick={() => go(social)}
                      className="grid size-10 place-items-center rounded-full bg-background/10 text-background/70 transition-colors hover:bg-background/20 hover:text-background"
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
                  <h4 className="mb-4 font-semibold text-background">
                    {col.title}
                  </h4>
                  <ul className="space-y-2 text-sm">
                    {col.links.map((link) => (
                      <li key={link}>
                        <button
                          type="button"
                          onClick={() => go(link)}
                          className="text-background/70 transition-colors hover:text-background"
                        >
                          {link}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="flex flex-col items-center justify-between gap-4 border-t border-background/20 pt-8 md:flex-row">
              <p className="text-sm text-background/60">
                © {new Date().getFullYear()} {brand}. {footerCopyright}
              </p>
              <div className="flex gap-6 text-sm">
                {footerLegal.map((link) => (
                  <button
                    key={link}
                    type="button"
                    onClick={() => go(link)}
                    className="text-background/60 transition-colors hover:text-background/80"
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
