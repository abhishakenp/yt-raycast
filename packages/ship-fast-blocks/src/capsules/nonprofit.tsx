import { useState, type ReactNode } from "react"
import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * NonprofitKimiPage — a complete, self-contained NONPROFIT / charity / NGO
 * fundraising LANDING page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "Roots of Hope" design: a
 * warm, calm, editorial aesthetic on a light neutral canvas with generous
 * whitespace, soft rounded cards, and an earthy, trustworthy tone. It pairs a
 * 2-column hero (eyebrow + headline with highlighted phrase + dual CTAs +
 * trust badges + photo with a floating quote card) with a trusted-by partner
 * logo strip, a 3-up mission/values grid with icons, a dark impact band with
 * big KPI stats and project highlight cards, a 6-up programs grid with photos
 * and category tags, a masonry photo gallery, a 3-up testimonials grid with
 * star ratings and donor avatars, a dark donation CTA with tiered giving
 * amounts and trust signals, an accordion FAQ, and a rich 4-column footer.
 *
 * The block owns ALL layout, spacing, depth and type hierarchy. The base
 * surface is a light neutral (mapped to `background`), with primary used as
 * the earthy brand/CTA color and a dark band (mapped to `foreground`) for the
 * impact + donate sections to preserve Kimi's contrast. Every nav item / CTA /
 * link / form-submit routes through `useNavigate` (never a dead "#"), and the
 * navbar labels match the `nav` array so PageSwitch can swap pages. All content
 * imagery uses the alt-driven <Image> component (never a raw src). Callers
 * supply ONLY content data; rich defaults make it render great with no props.
 */
export const NonprofitKimiPage = defineCapsule({
  name: "NonprofitKimiPage",
  description:
    "Complete NONPROFIT / charity / NGO / foundation fundraising LANDING page with a warm, calm, trustworthy editorial aesthetic: light neutral canvas, earthy brand color, generous whitespace and soft rounded cards. Includes a 2-column hero (established eyebrow, headline with highlighted phrase, Donate/Explore CTAs, 501(c)(3) trust badges, photo with floating quote card), a trusted-by partner logo strip, a 3-up mission/values grid with icons, a dark IMPACT band with oversized KPI stats (children educated, countries served, schools built, funds raised) plus project highlight cards, a 6-up programs grid with photos and colored category tags, a masonry moments gallery, a 3-up testimonials grid with star ratings and beneficiary avatars, a dark DONATE call-to-action with tiered giving amounts ($25/$100/$250) and secure/tax-deductible trust signals, an accordion FAQ, and a rich 4-column footer with programs, get-involved, contact and social links. Use as the ROOT/home page for nonprofits, charities, NGOs, foundations, humanitarian or community organizations, donation/fundraising campaigns, social-impact causes, religious or educational missions when a compassionate, donor-focused page with strong impact stats and social proof is wanted. Supply content only — brand, nav, hero, mission, impact, programs, gallery, testimonials, donate, faq, footer; the block owns all layout and styling.",
  props: z.object({
    /** Organization / brand name shown in navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content. */
    hero: z
      .object({
        eyebrow: z.string().optional(),
        headingBefore: z.string().optional(),
        /** Phrase rendered with the highlight color inside the headline. */
        highlight: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        /** Trust badges beneath the hero CTAs. */
        badges: z.array(z.string()).optional(),
        imageAlt: z.string().optional(),
        quote: z.string().optional(),
        quoteAuthor: z.string().optional(),
      })
      .optional(),
    /** Trusted-by partner logo strip. */
    partners: z
      .object({
        label: z.string().optional(),
        logos: z.array(z.string()).optional(),
      })
      .optional(),
    /** Mission / values grid. */
    mission: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Dark impact / stats band. */
    impact: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        stats: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
        highlights: z
          .array(
            z.object({
              title: z.string(),
              detail: z.string(),
              imageAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Programs grid. */
    programs: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        learnMore: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
              tag: z.string(),
              since: z.string(),
              imageAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Moments-of-impact photo gallery. */
    gallery: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        images: z.array(z.string()).optional(),
      })
      .optional(),
    /** Testimonials grid. */
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
    /** Dark donation CTA with tiered giving amounts. */
    donate: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        tiers: z
          .array(
            z.object({
              amount: z.string(),
              detail: z.string(),
              featured: z.boolean().optional(),
              badge: z.string().optional(),
            }),
          )
          .optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        trust: z.array(z.string()).optional(),
      })
      .optional(),
    /** Accordion FAQ. */
    faq: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ question: z.string(), answer: z.string() }))
          .optional(),
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
        email: z.string().optional(),
        phone: z.string().optional(),
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
    const brand = props.brand ?? "Roots of Hope"
    const nav = props.nav?.length
      ? props.nav
      : ["Mission", "Impact", "Programs", "Stories", "Donate Now"]

    const heroEyebrow = props.hero?.eyebrow ?? "Established 2008 • Global Impact"
    const headingBefore =
      props.hero?.headingBefore ?? "Planting seeds of change for"
    const heroHighlight = props.hero?.highlight ?? "brighter tomorrows"
    const heroSub =
      props.hero?.subheading ??
      "Roots of Hope empowers underserved communities through education, sustainable development, and compassionate support. Together, we've touched over 50,000 lives across 12 countries."
    const heroPrimary = props.hero?.primaryCta ?? "Make a Donation"
    const heroSecondary = props.hero?.secondaryCta ?? "Explore Our Programs"
    const heroBadges = props.hero?.badges?.length
      ? props.hero.badges
      : ["501(c)(3) Certified", "4-Star Charity Navigator"]
    const heroImageAlt =
      props.hero?.imageAlt ??
      "Group of children in a classroom smiling and raising their hands enthusiastically"
    const heroQuote =
      props.hero?.quote ?? "Every child deserves the chance to learn and dream."
    const heroQuoteAuthor =
      props.hero?.quoteAuthor ?? "— Maria Santos, Program Director"

    const partnersLabel =
      props.partners?.label ?? "Trusted by leading organizations"
    const partnerLogos = props.partners?.logos?.length
      ? props.partners.logos
      : [
          "GlobalGiving",
          "UNESCO",
          "Save the Children",
          "World Vision",
          "CARE Intl",
          "Oxfam",
        ]

    const missionHeading = props.mission?.heading ?? "Our Mission"
    const missionDesc =
      props.mission?.description ??
      "We believe in the transformative power of education and community. Our mission is to break the cycle of poverty by providing children and families with the tools, resources, and support they need to build sustainable, thriving futures."
    const missionItems = props.mission?.items?.length
      ? props.mission.items
      : [
          {
            title: "Education First",
            description:
              "Quality education is the foundation of lasting change. We build schools, train teachers, and provide scholarships to ensure every child has access to learning.",
          },
          {
            title: "Community Driven",
            description:
              "Lasting impact comes from within. We partner with local leaders and communities to develop solutions that respect culture and build sustainable futures.",
          },
          {
            title: "Compassion in Action",
            description:
              "Beyond resources, we offer dignity and respect. Our programs address immediate needs while nurturing hope, confidence, and self-reliance.",
          },
        ]

    const impactHeading = props.impact?.heading ?? "Our Impact"
    const impactDesc =
      props.impact?.description ??
      "Every number represents a life changed, a dream realized, a future rewritten. Here's what we've accomplished together since 2008."
    const impactStats = props.impact?.stats?.length
      ? props.impact.stats
      : [
          { value: "52,847", label: "Children Educated" },
          { value: "12", label: "Countries Served" },
          { value: "847", label: "Schools Built" },
          { value: "$12.4M", label: "Funds Raised" },
        ]
    const impactHighlights = props.impact?.highlights?.length
      ? props.impact.highlights
      : [
          {
            title: "Kenya Education Initiative",
            detail: "Built 127 schools • 15,400 students enrolled",
            imageAlt:
              "Young girl in a blue school uniform reading a book in a classroom in Kenya",
          },
          {
            title: "Guatemala Farming Co-op",
            detail: "340 families supported • 89% income increase",
            imageAlt:
              "Women farmers working together in a sustainable agriculture cooperative in Guatemala",
          },
          {
            title: "Bangladesh Health Program",
            detail: "24 clinics opened • 89,000 patients served",
            imageAlt:
              "Healthcare worker providing medical care to children in a rural clinic in Bangladesh",
          },
        ]

    const programsHeading = props.programs?.heading ?? "Our Programs"
    const programsDesc =
      props.programs?.description ??
      "From early childhood education to adult vocational training, our comprehensive programs address the full spectrum of community needs."
    const programsLearnMore = props.programs?.learnMore ?? "Learn more"
    const programItems = props.programs?.items?.length
      ? props.programs.items
      : [
          {
            title: "Schools & Scholarships",
            description:
              "Building classrooms, training teachers, and providing scholarships to ensure quality education reaches even the most remote communities.",
            tag: "Education",
            since: "Since 2008",
            imageAlt:
              "Young students in a bright classroom working together on an assignment with a teacher",
          },
          {
            title: "Maternal & Child Health",
            description:
              "Providing prenatal care, childhood vaccinations, and nutrition programs to give every child the healthy start they deserve.",
            tag: "Healthcare",
            since: "Since 2012",
            imageAlt:
              "Woman holding a newborn baby during a maternal health checkup at a community clinic",
          },
          {
            title: "Sustainable Farming",
            description:
              "Teaching climate-smart agriculture and providing microloans to help families build food security and sustainable income.",
            tag: "Livelihood",
            since: "Since 2015",
            imageAlt:
              "Farmers in a field learning sustainable agriculture techniques with agricultural equipment",
          },
          {
            title: "Youth Vocational Training",
            description:
              "Equipping young adults with practical skills in carpentry, mechanics, coding, and trades for self-sufficient futures.",
            tag: "Skills",
            since: "Since 2016",
            imageAlt:
              "Young adults in a vocational training workshop learning carpentry and woodworking skills",
          },
          {
            title: "Clean Water Access",
            description:
              "Installing wells, water pumps, and filtration systems to provide communities with safe, reliable drinking water.",
            tag: "Infrastructure",
            since: "Since 2010",
            imageAlt:
              "Community members gathering clean water from a newly installed water well pump in a rural village",
          },
          {
            title: "Women's Enterprise",
            description:
              "Supporting women entrepreneurs with microloans, business training, and market access to drive economic empowerment.",
            tag: "Empowerment",
            since: "Since 2018",
            imageAlt:
              "Women entrepreneurs in a business development meeting discussing financial planning",
          },
        ]

    const galleryHeading = props.gallery?.heading ?? "Moments of Impact"
    const galleryDesc =
      props.gallery?.description ??
      "A glimpse into the lives touched and communities transformed through our collective efforts."
    const galleryImages = props.gallery?.images?.length
      ? props.gallery.images
      : [
          "Children in a newly built classroom smiling and raising their hands excited to learn",
          "Volunteer teacher reading with young students under a tree in an outdoor classroom",
          "Community members celebrating the inauguration of a new water well in their village",
          "Women in a cooperative working together on a craft project creating handmade goods",
          "Medical volunteers providing health screenings to children at a rural outreach clinic",
        ]

    const testimonialsHeading =
      props.testimonials?.heading ?? "Voices of Change"
    const testimonialsDesc =
      props.testimonials?.description ??
      "Hear from the students, families, and communities whose lives have been transformed."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "Thanks to the scholarship from Roots of Hope, I'm now the first person in my family to attend university. I'm studying to become a teacher so I can give back to my community.",
            name: "Grace Mbeki",
            role: "University Scholar, Kenya",
            avatarAlt:
              "Professional headshot of Grace Mbeki, a young African woman university student smiling confidently",
          },
          {
            quote:
              "The women's cooperative changed everything for us. I learned business skills, received a microloan, and now I support my three children with my handicraft business.",
            name: "Rosa Martinez",
            role: "Cooperative Member, Guatemala",
            avatarAlt:
              "Professional headshot of Rosa Martinez, a Latina artisan entrepreneur in traditional woven clothing",
          },
          {
            quote:
              "Before the clinic, my children were always sick. Now we have vaccines, checkups, and medicine nearby. My youngest just started primary school—healthy and strong.",
            name: "Fatima Begum",
            role: "Mother of Four, Bangladesh",
            avatarAlt:
              "Professional headshot of Fatima Begum, a Bangladeshi mother wearing traditional dress",
          },
        ]

    const donateHeading = props.donate?.heading ?? "Be Part of the Change"
    const donateDesc =
      props.donate?.description ??
      "Every donation plants a seed of hope. Your contribution directly funds education, healthcare, and sustainable development for communities in need."
    const donateTiers = props.donate?.tiers?.length
      ? props.donate.tiers
      : [
          {
            amount: "$25",
            detail: "Provides school supplies for one child for a month",
          },
          {
            amount: "$100",
            detail: "Funds a month of vocational training for one student",
            featured: true,
            badge: "Most Popular",
          },
          {
            amount: "$250",
            detail: "Builds a clean water point for a village",
          },
        ]
    const donatePrimary = props.donate?.primaryCta ?? "Donate Now"
    const donateSecondary = props.donate?.secondaryCta ?? "Choose Custom Amount"
    const donateTrust = props.donate?.trust?.length
      ? props.donate.trust
      : ["Secure Payment", "Tax Deductible", "92% Goes to Programs"]

    const faqHeading = props.faq?.heading ?? "Frequently Asked Questions"
    const faqDesc = props.faq?.description ?? "Have questions? We have answers."
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: "How is my donation used?",
            answer:
              "92% of every dollar donated goes directly to our programs—building schools, providing healthcare, and supporting sustainable livelihoods. The remaining 8% covers essential administrative costs and ensures we can continue our mission effectively.",
          },
          {
            question: "Is my donation tax-deductible?",
            answer:
              "Yes. Roots of Hope is a registered 501(c)(3) nonprofit organization (EIN: 45-1234567). All donations are tax-deductible to the fullest extent allowed by law. You'll receive a receipt for your records.",
          },
          {
            question: "Can I sponsor a specific child or project?",
            answer:
              "Absolutely. We offer child sponsorship at $40/month and project sponsorships starting at $500. Sponsors receive quarterly updates, letters from beneficiaries, and annual impact reports. Contact us to learn more.",
          },
          {
            question: "How can I volunteer?",
            answer:
              "We welcome volunteers both locally and abroad. Local opportunities include event coordination, fundraising, and administrative support. International volunteers can join our 2-4 week service trips to project sites. Apply through our website.",
          },
          {
            question: "What countries do you work in?",
            answer:
              "We currently operate in 12 countries: Kenya, Uganda, Tanzania, Bangladesh, India, Nepal, Guatemala, Honduras, Peru, Philippines, Vietnam, and Cambodia. Each program is tailored to the specific needs and context of the local community.",
          },
        ]

    const footerAbout =
      props.footer?.about ??
      "Empowering communities through education, healthcare, and sustainable development since 2008."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Programs",
            links: [
              "Education & Schools",
              "Maternal Health",
              "Sustainable Farming",
              "Vocational Training",
              "Clean Water",
              "Women's Enterprise",
            ],
          },
          {
            title: "Get Involved",
            links: [
              "Make a Donation",
              "Sponsor a Child",
              "Volunteer With Us",
              "Corporate Partnerships",
              "Legacy Giving",
              "Fundraise for Us",
            ],
          },
        ]
    const footerAddress =
      props.footer?.address ?? "475 Riverside Drive, Suite 1270, New York, NY 10115"
    const footerEmail = props.footer?.email ?? "info@rootsofhope.org"
    const footerPhone = props.footer?.phone ?? "(212) 555-1234"
    const footerCopyright =
      props.footer?.copyright ?? "All rights reserved. EIN: 45-1234567"
    const legalLinks = props.footer?.legalLinks?.length
      ? props.footer.legalLinks
      : ["Privacy Policy", "Terms of Service", "Annual Report"]
    const socials = props.footer?.socials?.length
      ? props.footer.socials
      : ["Facebook", "Twitter", "Instagram", "LinkedIn"]

    const donateLabel = nav[nav.length - 1]

    // Brand logo mark (decorative layered/sprout glyph).
    const LogoMark = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    )

    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    )

    const CheckCircle = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
    )

    const Star = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    // Mission icons (decorative, token-colored).
    const missionIcons: ReactNode[] = [
      // book
      <svg
        key="book"
        className="size-8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>,
      // globe / network
      <svg
        key="globe"
        className="size-8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>,
      // heart
      <svg
        key="heart"
        className="size-8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>,
    ]

    // Program tag colors rotate across tokens (never raw palette).
    const tagTones = [
      "bg-primary/10 text-primary",
      "bg-secondary text-secondary-foreground",
      "bg-accent text-accent-foreground",
      "bg-muted text-muted-foreground",
      "bg-primary/10 text-primary",
      "bg-secondary text-secondary-foreground",
    ]

    return (
      <div
        className={cn(
          "min-h-svh bg-background text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-sm">
          <nav
            className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
            aria-label="Main navigation"
          >
            <div className="flex h-16 items-center justify-between lg:h-20">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="group flex items-center gap-2"
              >
                <LogoMark className="size-8 text-foreground/70 transition-colors group-hover:text-foreground" />
                <span className="text-lg font-semibold tracking-tight text-foreground">
                  {brand}
                </span>
              </button>

              <div className="hidden items-center gap-8 md:flex">
                {nav.slice(0, -1).map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => go(label)}
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => go(donateLabel)}
                  className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                >
                  {donateLabel}
                </button>
              </div>

              <button
                type="button"
                aria-label="Open menu"
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
                onClick={() => setMobileOpen((v: boolean) => !v)}
                className="p-2 text-muted-foreground hover:text-foreground md:hidden"
              >
                <svg
                  className="size-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
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
          <section className="relative overflow-hidden">
            <div className="mx-auto max-w-7xl px-4 pb-24 pt-16 sm:px-6 lg:px-8 lg:pb-32 lg:pt-24">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="max-w-2xl">
                  <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    {heroEyebrow}
                  </p>
                  <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                    {headingBefore}{" "}
                    <span className="text-primary">{heroHighlight}</span>
                  </h1>
                  <p className="mb-8 max-w-xl text-lg leading-relaxed text-muted-foreground">
                    {heroSub}
                  </p>
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-4 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                    >
                      {heroPrimary}
                      <ArrowRight className="ml-2 size-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="inline-flex items-center justify-center rounded-full border border-border bg-card px-8 py-4 text-base font-medium text-foreground transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                    >
                      {heroSecondary}
                    </button>
                  </div>
                  <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                    {heroBadges.map((badge) => (
                      <div key={badge} className="flex items-center gap-2">
                        <CheckCircle className="size-5 text-primary" />
                        <span>{badge}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <div className="aspect-[4/3] overflow-hidden rounded-xl bg-muted">
                    <Image
                      alt={heroImageAlt}
                      w={1200}
                      h={900}
                      className="size-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-6 -left-6 max-w-xs rounded-xl border border-border bg-card p-5 shadow-lg">
                    <p className="text-sm font-medium text-card-foreground">
                      &ldquo;{heroQuote}&rdquo;
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {heroQuoteAuthor}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Partner logos */}
          <section className="border-y border-border bg-card py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
                {partnersLabel}
              </p>
              <div className="grid grid-cols-2 items-center gap-8 opacity-60 md:grid-cols-4 lg:grid-cols-6">
                {partnerLogos.map((logo) => (
                  <div
                    key={logo}
                    className="flex h-12 items-center justify-center text-lg font-semibold text-muted-foreground"
                  >
                    {logo}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Mission */}
          <section className="py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  {missionHeading}
                </h2>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {missionDesc}
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
                {missionItems.map((item, i) => (
                  <div key={item.title} className="text-center">
                    <div className="mx-auto mb-6 grid size-16 place-items-center rounded-full bg-primary/10 text-primary">
                      {missionIcons[i % missionIcons.length]}
                    </div>
                    <h3 className="mb-3 text-xl font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <p className="leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Impact / stats (dark band) */}
          <section className="bg-foreground py-20 text-background lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl">
                  {impactHeading}
                </h2>
                <p className="text-lg leading-relaxed text-background/70">
                  {impactDesc}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-12">
                {impactStats.map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="mb-2 text-4xl font-bold sm:text-5xl lg:text-6xl">
                      {s.value}
                    </p>
                    <p className="text-sm font-medium uppercase tracking-wider text-background/60 sm:text-base">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-16 grid gap-6 md:grid-cols-3">
                {impactHighlights.map((h) => (
                  <div
                    key={h.title}
                    className="rounded-xl border border-background/20 bg-background/10 p-6"
                  >
                    <div className="flex items-start gap-4">
                      <Image
                        alt={h.imageAlt}
                        w={200}
                        h={200}
                        loading="lazy"
                        className="size-16 shrink-0 rounded-lg object-cover"
                      />
                      <div>
                        <h4 className="mb-1 font-semibold">{h.title}</h4>
                        <p className="text-sm text-background/60">{h.detail}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Programs */}
          <section className="py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 max-w-3xl">
                <h2 className="mb-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  {programsHeading}
                </h2>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {programsDesc}
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {programItems.map((prog, i) => (
                  <article
                    key={prog.title}
                    className="group overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-lg"
                  >
                    <div className="aspect-[16/10] overflow-hidden bg-muted">
                      <Image
                        alt={prog.imageAlt}
                        w={800}
                        h={500}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-6">
                      <div className="mb-3 flex items-center gap-2">
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-1 text-xs font-medium",
                            tagTones[i % tagTones.length],
                          )}
                        >
                          {prog.tag}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {prog.since}
                        </span>
                      </div>
                      <h3 className="mb-3 text-xl font-semibold text-card-foreground">
                        {prog.title}
                      </h3>
                      <p className="mb-4 leading-relaxed text-muted-foreground">
                        {prog.description}
                      </p>
                      <button
                        type="button"
                        onClick={() => go(prog.title)}
                        className="inline-flex items-center text-sm font-medium text-foreground transition-colors hover:text-primary"
                      >
                        {programsLearnMore}
                        <svg
                          className="ml-1 size-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Gallery */}
          <section className="bg-muted py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  {galleryHeading}
                </h2>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {galleryDesc}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {galleryImages.map((alt, i) => (
                  <div
                    key={alt}
                    className={cn(
                      "overflow-hidden rounded-xl",
                      i === 0 && "col-span-2 row-span-2",
                    )}
                  >
                    <Image
                      alt={alt}
                      w={i === 0 ? 800 : 400}
                      h={i === 0 ? 800 : 400}
                      loading="lazy"
                      className={cn(
                        "size-full object-cover transition-transform duration-700 hover:scale-105",
                        i !== 0 && "aspect-square",
                      )}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  {testimonialsHeading}
                </h2>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {testimonialsDesc}
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-3">
                {testimonialItems.map((t) => (
                  <blockquote
                    key={t.name}
                    className="rounded-xl border border-border bg-card p-8"
                  >
                    <div className="mb-4 flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star key={s} className="size-5 text-primary" />
                      ))}
                    </div>
                    <p className="mb-6 leading-relaxed text-card-foreground">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <footer className="flex items-center gap-4">
                      <Image
                        alt={t.avatarAlt}
                        w={100}
                        h={100}
                        loading="lazy"
                        className="size-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold text-foreground">{t.name}</p>
                        <p className="text-sm text-muted-foreground">{t.role}</p>
                      </div>
                    </footer>
                  </blockquote>
                ))}
              </div>
            </div>
          </section>

          {/* Donate CTA (dark band) */}
          <section className="bg-foreground py-20 text-background lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-4xl text-center">
                <h2 className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                  {donateHeading}
                </h2>
                <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-background/70 sm:text-xl">
                  {donateDesc}
                </p>

                <div className="mx-auto mb-10 grid max-w-2xl gap-4 sm:grid-cols-3">
                  {donateTiers.map((tier) => (
                    <button
                      key={tier.amount}
                      type="button"
                      onClick={() => go(`${donatePrimary} ${tier.amount}`)}
                      className={cn(
                        "group relative rounded-xl px-6 py-5 text-left transition-colors",
                        tier.featured
                          ? "border-2 border-background bg-background/20"
                          : "border border-background/20 bg-background/10 hover:border-background/40",
                      )}
                    >
                      {tier.badge ? (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-background px-3 py-1 text-xs font-semibold text-foreground">
                          {tier.badge}
                        </span>
                      ) : null}
                      <span className="mb-1 block text-2xl font-bold">
                        {tier.amount}
                      </span>
                      <span className="text-sm text-background/70">
                        {tier.detail}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="flex flex-col justify-center gap-4 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => go(donatePrimary)}
                    className="inline-flex items-center justify-center rounded-full bg-background px-8 py-4 text-base font-medium text-foreground transition-colors hover:bg-background/90 focus:outline-none focus:ring-2 focus:ring-background focus:ring-offset-2 focus:ring-offset-foreground"
                  >
                    {donatePrimary}
                    <ArrowRight className="ml-2 size-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => go(donateSecondary)}
                    className="inline-flex items-center justify-center rounded-full border border-background/40 px-8 py-4 text-base font-medium text-background transition-colors hover:bg-background/10 focus:outline-none focus:ring-2 focus:ring-background/50"
                  >
                    {donateSecondary}
                  </button>
                </div>

                <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-background/60">
                  {donateTrust.map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <CheckCircle className="size-5 text-primary" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="py-20 lg:py-28">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <div className="mb-12 text-center">
                <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  {faqHeading}
                </h2>
                <p className="text-muted-foreground">{faqDesc}</p>
              </div>

              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.question}
                    className="group rounded-xl border border-border bg-card open:ring-1 open:ring-border"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between p-6">
                      <h3 className="font-semibold text-card-foreground">
                        {item.question}
                      </h3>
                      <span className="ml-4 transition-transform group-open:rotate-180">
                        <svg
                          className="size-5 text-muted-foreground"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 9l-7 7-7-7"
                          />
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
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-muted pb-8 pt-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-12 md:grid-cols-2 lg:grid-cols-4">
              <div className="lg:col-span-1">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 flex items-center gap-2"
                >
                  <LogoMark className="size-8 text-foreground/70" />
                  <span className="text-lg font-semibold tracking-tight text-foreground">
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
                      className="flex size-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-border hover:text-foreground"
                    >
                      <span className="text-xs font-semibold">
                        {social.charAt(0)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h4 className="mb-4 font-semibold text-foreground">
                    {col.title}
                  </h4>
                  <ul className="space-y-3 text-sm">
                    {col.links.map((link) => (
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
              ))}

              <div>
                <h4 className="mb-4 font-semibold text-foreground">Contact</h4>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <svg
                      className="mt-0.5 size-5 shrink-0 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span>{footerAddress}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <svg
                      className="size-5 shrink-0 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <button
                      type="button"
                      onClick={() => go(footerEmail)}
                      className="transition-colors hover:text-foreground"
                    >
                      {footerEmail}
                    </button>
                  </li>
                  <li className="flex items-center gap-3">
                    <svg
                      className="size-5 shrink-0 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    <button
                      type="button"
                      onClick={() => go(footerPhone)}
                      className="transition-colors hover:text-foreground"
                    >
                      {footerPhone}
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} {brand}. {footerCopyright}
              </p>
              <div className="flex gap-6 text-sm">
                {legalLinks.map((link) => (
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
