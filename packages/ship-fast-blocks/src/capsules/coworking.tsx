import { useState, type FormEvent, type ReactNode } from "react"
import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"
import { number, string, table } from "@ship-fast/lakebed/server"
import { Button } from "#/components/ui/button.tsx"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "#/components/ui/sheet.tsx"

/**
 * CoworkingKimiPage — a complete, self-contained coworking-space / flexible-office
 * marketing LANDING page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "Northside Workspace" design: a
 * clean, premium, editorial light aesthetic (neutral surfaces, near-black ink,
 * generous whitespace, large rounded photography) built for a real-estate-style
 * workspace brand. It walks a prospective member top-to-bottom: a split hero with
 * a "members active this week" floating proof card, a trusted-by logo strip, a
 * three-up "spaces" grid (hot desks / dedicated desks / private offices), an
 * amenities split with an offset photo collage, a 3-step "get started" timeline,
 * a dark gallery wall, a transparent pricing trio plus a private-office band,
 * a dark stats bar, a 6-up member testimonials grid, an FAQ accordion, a dark
 * "book a tour" CTA with a real inquiry form, and a rich 5-column footer.
 *
 * The block owns ALL layout, spacing, depth and type hierarchy. Every nav item /
 * CTA / footer link / social / form-submit routes through `useNavigate` (never a
 * dead "#"). All imagery — including member headshots — uses the alt-driven
 * <Image> component (never a raw <img> / external src). Callers supply ONLY
 * content data; rich defaults make it render great with no props at all.
 */
export const CoworkingKimiPage = defineCapsule({
  name: "CoworkingKimiPage",
  description:
        "Complete coworking-space / flexible-office / shared-workspace marketing LANDING page with a clean, premium, editorial light aesthetic: neutral surfaces, near-black ink, big rounded photography and generous whitespace. Includes a split hero (eyebrow, large headline, dual CTAs, trust checks, and a floating 'members active this week' avatar-stack proof card), a trusted-by logo strip, a three-up Spaces grid (hot desks, dedicated desks, private offices) with feature checklists, an amenities split with icon list and an offset photo collage, a 3-step 'get started' timeline, a dark gallery wall with bento image layout, a transparent three-tier pricing section with a highlighted 'most popular' plan plus a private-office pricing band, a dark stats bar, a six-up member testimonials grid with star ratings and headshots, an FAQ accordion, a dark 'book a tour' CTA with a real inquiry form, and a rich five-column footer with social links and contact details. Use as the ROOT/home page for coworking spaces, shared offices, flex-office providers, hot-desk and private-office rentals, business centers, or workspace memberships when a trustworthy, conversion-focused tour-booking page with strong amenity and pricing detail is wanted. Supply content only — brand, nav, hero, spaces, amenities, steps, gallery, pricing, stats, testimonials, faq, tour CTA, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand / workspace name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content. */
    hero: z
      .object({
        eyebrow: z.string().optional(),
        headingLead: z.string().optional(),
        /** Phrase rendered muted as a continuation of the headline. */
        headingMuted: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        /** Trust checks under the CTAs. */
        checks: z.array(z.string()).optional(),
        imageAlt: z.string().optional(),
        proofValue: z.string().optional(),
        proofLabel: z.string().optional(),
        /** Alt text for the avatar stack on the proof card. */
        proofAvatars: z.array(z.string()).optional(),
      })
      .optional(),
    /** Trusted-by logo strip. */
    logos: z
      .object({
        heading: z.string().optional(),
        names: z.array(z.string()).optional(),
      })
      .optional(),
    /** Spaces grid (hot desks / dedicated desks / private offices). */
    spaces: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
              imageAlt: z.string(),
              features: z.array(z.string()),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Amenities split with photo collage. */
    amenities: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
        photos: z.array(z.string()).optional(),
      })
      .optional(),
    /** "Get started" 3-step timeline. */
    steps: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
              note: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Dark gallery wall. */
    gallery: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        cta: z.string().optional(),
        photos: z.array(z.string()).optional(),
      })
      .optional(),
    /** Transparent pricing. */
    pricing: z
      .object({
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
        office: z
          .object({
            title: z.string(),
            description: z.string(),
            tiers: z.array(z.string()),
            primaryCta: z.string(),
            secondaryCta: z.string(),
          })
          .optional(),
      })
      .optional(),
    /** Dark stats bar. */
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    /** Member testimonials grid. */
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
    /** FAQ accordion. */
    faq: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ q: z.string(), a: z.array(z.string()) }))
          .optional(),
      })
      .optional(),
    /** "Book a tour" CTA + inquiry form. */
    tour: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        submit: z.string().optional(),
        note: z.string().optional(),
        interests: z.array(z.string()).optional(),
        imageAlt: z.string().optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        tagline: z.string().optional(),
        columns: z
          .array(z.object({ heading: z.string(), links: z.array(z.string()) }))
          .optional(),
        contact: z.array(z.string()).optional(),
        socials: z.array(z.string()).optional(),
        copyright: z.string().optional(),
        legal: z.array(z.string()).optional(),
      })
      .optional(),
        className: z.string().optional(),
  }),
  lakebed: {
    schema: {
      tourLeads: table({
        name: string(),
        email: string(),
        company: string(),
        interest: string(),
        submittedBy: string(),
        source: string(),
        status: string(),
        interestIndex: number(),
      }),
    },
    queries: {
      tourLeads: ({ db }) => db.tourLeads.orderBy("createdAt").all(),
    },
    mutations: {
      addTourLead: (
        { db },
        name: string,
        email: string,
        company: string,
        interest: string,
        submittedBy: string,
        source: string,
        interestIndex: number,
      ) => {
        db.tourLeads.insert({
          name: name.trim(),
          email: email.trim(),
          company: company.trim(),
          interest,
          submittedBy,
          source,
          status: "new",
          interestIndex,
        })

        return db.tourLeads.orderBy("createdAt").all()
      },
      markTourLeadContacted: ({ db }, tourLeadId: string) => {
        for (const lead of db.tourLeads.where("id", tourLeadId).all()) {
          db.tourLeads.update(lead.id, { status: "contacted" })
        }

        return db.tourLeads.all()
      },
      removeTourLead: ({ db }, tourLeadId: string) => {
        for (const lead of db.tourLeads.where("id", tourLeadId).all()) {
          db.tourLeads.delete(lead.id)
        }

        return db.tourLeads.all()
      },
      clearTourLeads: ({ db }) => {
        for (const lead of db.tourLeads.all()) {
          db.tourLeads.delete(lead.id)
        }

        return db.tourLeads.all()
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [tourDrawerOpen, setTourDrawerOpen] = useState(false)
    const [tourFormName, setTourFormName] = useState("")
    const [tourFormEmail, setTourFormEmail] = useState("")
    const [tourFormCompany, setTourFormCompany] = useState("")
    const [tourFormInterest, setTourFormInterest] = useState("")
    const auth = lakebed.useAuth()
    const isSignedIn = auth.isAuthenticated && !auth.isGuest
    const authEmail = auth.email || auth.user?.email
    const authDisplayName =
      auth.displayName || auth.user?.displayName || authEmail || "Account"
    const authStatus = auth.isLoading
      ? "Checking..."
      : isSignedIn
        ? authDisplayName
        : "Sign in"
    const handleSignIn = () => {
      if (auth.isLoading) return

      void lakebed.signInWithGoogle()
    }
    const handleSignOut = () => {
      lakebed.signOut()
    }
    const storedTourLeads = lakebed.useQuery("tourLeads")
    const tourLeads = storedTourLeads ?? []
    const addTourLead = lakebed.useMutation("addTourLead")
    const markTourLeadContacted = lakebed.useMutation("markTourLeadContacted")
    const removeTourLead = lakebed.useMutation("removeTourLead")
    const clearTourLeads = lakebed.useMutation("clearTourLeads")
    const newLeadCount = tourLeads.filter((lead) => lead.status === "new").length
    const tourLeadCount = tourLeads.length
    const brand = props.brand ?? "Northside"
    const nav = props.nav?.length
      ? props.nav
      : ["Spaces", "Amenities", "Pricing", "Gallery", "FAQ"]

    const heroEyebrow =
      props.hero?.eyebrow ?? "Portland's Premier Coworking Space"
    const heroLead = props.hero?.headingLead ?? "Workspace that works"
    const heroMuted = props.hero?.headingMuted ?? "as hard as you do"
    const heroSub =
      props.hero?.subheading ??
      "Private offices, dedicated desks, and meeting rooms in the heart of the Pearl District. Join 400+ professionals who've made Northside their base."
    const heroPrimary = props.hero?.primaryCta ?? "Schedule a Tour"
    const heroSecondary = props.hero?.secondaryCta ?? "View Memberships"
    const heroChecks = props.hero?.checks?.length
      ? props.hero.checks
      : ["No setup fees", "Month-to-month", "24/7 access"]
    const heroImageAlt =
      props.hero?.imageAlt ??
      "Bright modern coworking space with floor-to-ceiling windows, wooden desks, and green plants"
    const proofValue = props.hero?.proofValue ?? "400+ members"
    const proofLabel = props.hero?.proofLabel ?? "Active this week"
    const proofAvatars = props.hero?.proofAvatars?.length
      ? props.hero.proofAvatars
      : [
          "Professional headshot of a smiling woman with brown hair",
          "Professional headshot of a man with glasses and short hair",
          "Professional headshot of a woman with blonde hair smiling",
          "Professional headshot of a man with beard in casual attire",
        ]

    const logosHeading = props.logos?.heading ?? "Trusted by teams at"
    const logoNames = props.logos?.names?.length
      ? props.logos.names
      : ["Stripe", "Notion", "Figma", "Webflow", "Linear", "Vercel"]

    const spacesHeading = props.spaces?.heading ?? "Spaces designed for focus"
    const spacesDesc =
      props.spaces?.description ??
      "From quiet phone booths to collaborative lounges, every space is crafted to support different modes of work."
    const spaceItems = props.spaces?.items?.length
      ? props.spaces.items
      : [
          {
            title: "Hot Desks",
            description:
              "Grab any available seat in our open coworking area. Perfect for freelancers and remote workers who need flexibility.",
            imageAlt:
              "Open coworking area with modern wooden hot desks and ergonomic chairs",
            features: [
              "48 ergonomic workstations",
              "Dual-monitor setups available",
              "First-come, first-served",
            ],
          },
          {
            title: "Dedicated Desks",
            description:
              "Your own permanent desk in a shared space. Leave your monitors, keyboard, and personal items set up just how you like.",
            imageAlt:
              "Dedicated desk workspace with personal storage locker and dual monitors",
            features: [
              "Personal storage locker",
              "24/7 building access",
              "Mail handling included",
            ],
          },
          {
            title: "Private Offices",
            description:
              "Fully enclosed offices for teams of 1-20. Soundproofed, climate-controlled, and move-in ready.",
            imageAlt:
              "Private office with glass walls, modern furniture, and city views",
            features: [
              "Sizes: 80-1,200 sq ft",
              "Custom branding allowed",
              "Private meeting room credits",
            ],
          },
        ]

    const amenitiesHeading =
      props.amenities?.heading ?? "Everything you need, included"
    const amenitiesDesc =
      props.amenities?.description ??
      "We handle the logistics so you can focus on your work. All memberships include our full suite of amenities."
    const amenityItems = props.amenities?.items?.length
      ? props.amenities.items
      : [
          {
            title: "Gigabit WiFi",
            description:
              "Enterprise-grade fiber with redundant backup connections",
          },
          {
            title: "Meeting Rooms",
            description: "8 rooms with A/V, whiteboards, and video conferencing",
          },
          {
            title: "24/7 Access",
            description: "Keycard entry with security monitoring overnight",
          },
          {
            title: "Phone Booths",
            description: "6 soundproof pods for private calls and video meetings",
          },
          {
            title: "Mail Service",
            description:
              "Business address with package receiving and notifications",
          },
          {
            title: "Wellness Room",
            description: "Quiet space for meditation, nursing, or a quick reset",
          },
          {
            title: "Printing & Scanning",
            description: "Unlimited B&W, color printing, and document scanning",
          },
          {
            title: "Community Events",
            description: "Weekly happy hours, workshops, and networking mixers",
          },
        ]
    const amenityPhotos = props.amenities?.photos?.length
      ? props.amenities.photos
      : [
          "Modern meeting room with glass walls and large screen for presentations",
          "Cozy lounge area with comfortable sofas and coffee bar for casual meetings",
          "Private phone booth with soundproofing for confidential calls",
          "Modern kitchen and coffee bar with espresso machine and seating",
        ]

    const stepsHeading = props.steps?.heading ?? "Get started in minutes"
    const stepsDesc =
      props.steps?.description ??
      "No long-term contracts. No hidden fees. Start working today."
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: "Book a tour",
            description:
              "Schedule a 30-minute walkthrough with our community manager. See the space, ask questions, and find the perfect fit for your work style.",
            note: "Tours available Mon-Fri, 9am-6pm",
          },
          {
            title: "Choose your plan",
            description:
              "Pick the membership that fits your needs. Hot desk for flexibility, dedicated desk for consistency, or a private office for your team.",
            note: "Month-to-month or annual (save 15%)",
          },
          {
            title: "Start working",
            description:
              "Get your keycard, connect to WiFi, and you're set. Our team handles everything else—cleaning, coffee, and community.",
            note: "Same-day setup available",
          },
        ]

    const galleryHeading = props.gallery?.heading ?? "Explore the space"
    const galleryDesc =
      props.gallery?.description ??
      "12,000 square feet of thoughtfully designed workspace."
    const galleryCta = props.gallery?.cta ?? "Book an in-person tour"
    const galleryPhotos = props.gallery?.photos?.length
      ? props.gallery.photos
      : [
          "Spacious open floor coworking area with high ceilings and industrial design",
          "Coffee lounge with bar seating and espresso machine",
          "Team collaboration space with whiteboard and comfortable seating",
          "Event space setup for a community workshop with rows of chairs",
          "Quiet focus area with individual workstations and partitions",
          "Rooftop terrace with outdoor seating and city skyline views",
          "Private office hallway with glass doors and modern signage",
        ]

    const pricingHeading =
      props.pricing?.heading ?? "Simple, transparent pricing"
    const pricingDesc =
      props.pricing?.description ??
      "No setup fees. No hidden charges. Cancel anytime."
    const pricingPlans = props.pricing?.plans?.length
      ? props.pricing.plans
      : [
          {
            name: "Community",
            tagline: "For occasional workspace needs",
            price: "$149",
            period: "/month",
            features: [
              "5 days of hot desk access",
              "Business address & mail",
              "2 meeting room hours",
              "Community events access",
            ],
            cta: "Get started",
          },
          {
            name: "Hot Desk",
            tagline: "For freelancers and remote workers",
            price: "$299",
            period: "/month",
            features: [
              "Unlimited hot desk access",
              "24/7 building access",
              "Business address & mail",
              "5 meeting room hours",
              "Unlimited printing",
            ],
            cta: "Get started",
            featured: true,
            badge: "Most popular",
          },
          {
            name: "Dedicated Desk",
            tagline: "Your own permanent workspace",
            price: "$449",
            period: "/month",
            features: [
              "Permanent dedicated desk",
              "Lockable filing cabinet",
              "24/7 building access",
              "10 meeting room hours",
              "Guest passes (3/month)",
            ],
            cta: "Get started",
          },
        ]
    const pricingOffice = props.pricing?.office ?? {
      title: "Private Offices",
      description:
        "Fully furnished offices for teams of 1-20. All dedicated desk amenities plus private space, custom branding options, and dedicated meeting room credits.",
      tiers: [
        "1-2 person: $799/mo",
        "3-5 person: $1,499/mo",
        "6-10 person: $2,799/mo",
        "11-20 person: Custom",
      ],
      primaryCta: "Schedule a tour",
      secondaryCta: "Download floor plans",
    }

    const statItems = props.stats?.length
      ? props.stats
      : [
          { value: "400+", label: "Active members" },
          { value: "12K", label: "Square feet" },
          { value: "8", label: "Meeting rooms" },
          { value: "4.9", label: "Member rating" },
        ]

    const testimonialsHeading =
      props.testimonials?.heading ?? "Loved by members"
    const testimonialsDesc =
      props.testimonials?.description ??
      "Hear from the professionals who call Northside home."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "Northside completely changed how I work. The natural light, the quiet focus rooms, and the genuinely friendly community—I've never been more productive.",
            name: "Sarah Chen",
            role: "Product Designer, Figma",
            avatarAlt:
              "Professional headshot of Sarah Chen, a smiling woman with shoulder-length dark hair",
          },
          {
            quote:
              "We moved our 6-person team here from a traditional office. The flexibility is incredible—no more cleaning, maintenance, or coffee runs. Just us and our work.",
            name: "Marcus Johnson",
            role: "CEO, Plotline Analytics",
            avatarAlt:
              "Professional headshot of Marcus Johnson, a man with glasses and short dark hair",
          },
          {
            quote:
              "The meeting rooms here are better than most hotel conference suites. My clients are always impressed. Plus, the coffee is genuinely excellent.",
            name: "Elena Rodriguez",
            role: "Consultant, McKinsey",
            avatarAlt:
              "Professional headshot of Elena Rodriguez, a woman with curly hair and warm smile",
          },
          {
            quote:
              "As a writer, I need silence. The phone booths and quiet zones here are perfect. And when I want company, the common areas have great energy.",
            name: "David Park",
            role: "Author & Journalist",
            avatarAlt:
              "Professional headshot of David Park, a man with friendly expression and neat hair",
          },
          {
            quote:
              "I joined for the space but stayed for the people. I've made genuine friendships and even found two clients through the community here.",
            name: "Maya Thompson",
            role: "Freelance Developer",
            avatarAlt:
              "Professional headshot of Maya Thompson, a young woman with red hair and freckles",
          },
          {
            quote:
              "Our startup has been here for 3 years. We started with 2 people in a private office and now have 12. Northside grew with us seamlessly.",
            name: "James Wilson",
            role: "CTO, Remedy Health",
            avatarAlt:
              "Professional headshot of James Wilson, a man with beard and professional attire",
          },
        ]

    const faqHeading = props.faq?.heading ?? "Frequently asked questions"
    const faqDesc =
      props.faq?.description ??
      "Everything you need to know about joining Northside."
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            q: "What's included in my membership?",
            a: [
              "All memberships include gigabit WiFi, printing, coffee and tea, mail handling, access to common areas and phone booths, and entry to our weekly community events.",
              "Meeting room hours vary by plan: Community gets 2 hours, Hot Desk gets 5 hours, Dedicated Desk gets 10 hours, and Private Offices include 20+ hours depending on size.",
            ],
          },
          {
            q: "Can I bring guests or clients?",
            a: [
              "Yes! Day passes for guests are $25 and include WiFi and coffee. You can also book meeting rooms for client meetings—we have 8 rooms ranging from 4-person huddles to 20-person boardrooms.",
              "Dedicated Desk and Private Office members receive complimentary guest passes each month (3 and 5 respectively).",
            ],
          },
          {
            q: "Is there a minimum commitment?",
            a: [
              "Nope. All plans are month-to-month with no setup fees. You can cancel anytime with 30 days notice.",
              "If you prefer, we offer annual memberships with a 15% discount. Annual plans can be paid monthly or upfront.",
            ],
          },
          {
            q: "What are your hours?",
            a: [
              "Our community managers are on-site Monday through Friday, 8am to 6pm. However, Hot Desk, Dedicated Desk, and Private Office members have 24/7 keycard access.",
              "Community plan members can access the space during staffed hours, Monday-Friday 8am-6pm.",
            ],
          },
          {
            q: "Do you offer parking?",
            a: [
              "We have a dedicated parking lot with 40 spaces available on a first-come, first-served basis. Parking is free for all members.",
              "Street parking is also available on NW 13th Ave and adjacent streets. We're also 2 blocks from the NW 10th & Lovejoy MAX station.",
            ],
          },
          {
            q: "Can my team switch plans as we grow?",
            a: [
              "Absolutely. We designed Northside to grow with you. Start with a Hot Desk, upgrade to Dedicated when you need consistency, and move to a Private Office when your team expands.",
              "Plan changes take effect at the start of your next billing cycle. We'll help coordinate your move within the building.",
            ],
          },
        ]

    const tourHeading = props.tour?.heading ?? "Come see for yourself"
    const tourDesc =
      props.tour?.description ??
      "Book a 30-minute tour with our community manager. We'll show you around, answer your questions, and help you find the perfect workspace."
    const tourSubmit = props.tour?.submit ?? "Schedule my tour"
    const tourNote =
      props.tour?.note ??
      "Tours available Monday–Friday, 9am–6pm. We typically respond within 2 hours during business hours."
    const tourInterests = props.tour?.interests?.length
      ? props.tour.interests
      : [
          "Community ($149/mo)",
          "Hot Desk ($299/mo)",
          "Dedicated Desk ($449/mo)",
          "Private Office (custom)",
        ]
    const tourImageAlt =
      props.tour?.imageAlt ??
      "Welcoming reception area with modern design and friendly community manager"
    const selectedTourInterest = tourFormInterest || tourInterests[0] || ""
    const handleTourSubmit = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()

      const name = tourFormName.trim()
      const email = tourFormEmail.trim()
      const company = tourFormCompany.trim()
      const interest = tourFormInterest || tourInterests[0] || ""

      if (!name || !email || !interest) return

      void addTourLead(
        name,
        email,
        company,
        interest,
        isSignedIn ? authDisplayName : "Guest",
        "tour-form",
        tourInterests.indexOf(interest),
      )

      setTourFormName("")
      setTourFormEmail("")
      setTourFormCompany("")
      setTourFormInterest("")
      setTourDrawerOpen(true)
    }

    const footerTagline =
      props.footer?.tagline ??
      "Premium coworking in Portland's Pearl District since 2019."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            heading: "Spaces",
            links: [
              "Hot Desks",
              "Dedicated Desks",
              "Private Offices",
              "Meeting Rooms",
              "Event Space",
            ],
          },
          {
            heading: "Company",
            links: ["About", "Blog", "Careers", "Press", "Partners"],
          },
          {
            heading: "Resources",
            links: [
              "Help Center",
              "Member Portal",
              "Community Guidelines",
              "Privacy Policy",
              "Terms of Service",
            ],
          },
        ]
    const footerContact = props.footer?.contact?.length
      ? props.footer.contact
      : ["1234 NW 13th Ave, Portland, OR 97209", "(503) 555-0147", "hello@northside.work"]
    const footerSocials = props.footer?.socials?.length
      ? props.footer.socials
      : ["Twitter", "Instagram", "LinkedIn"]
    const footerCopyright =
      props.footer?.copyright ?? "© 2024 Northside Workspace. All rights reserved."
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Privacy", "Terms", "Cookies"]

    // Decorative brand mark — tile with the brand initial.
    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "grid place-items-center rounded-lg bg-primary font-semibold text-primary-foreground",
          className,
        )}
        aria-hidden="true"
      >
        {brand.charAt(0).toUpperCase()}
      </span>
    )

    const ArrowRight = ({ className }: { className?: string }) => (
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

    const amenityIcons: ReactNode[] = [
      // lightning (WiFi)
      <svg key="bolt" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5" aria-hidden="true">
        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>,
      // people (meeting rooms)
      <svg key="people" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5" aria-hidden="true">
        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>,
      // clock (24/7)
      <svg key="clock" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5" aria-hidden="true">
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      // home (phone booths)
      <svg key="home" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5" aria-hidden="true">
        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>,
      // box (mail)
      <svg key="box" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5" aria-hidden="true">
        <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>,
      // globe (wellness)
      <svg key="globe" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5" aria-hidden="true">
        <path d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>,
      // printer (printing)
      <svg key="printer" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5" aria-hidden="true">
        <path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>,
      // info (events)
      <svg key="info" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5" aria-hidden="true">
        <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
          <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between lg:h-20">
              <button
                type="button"
                onClick={() => go(brand)}
                className="flex items-center gap-2"
              >
                <LogoMark className="size-8 text-sm" />
                <span className="text-lg font-semibold text-foreground">
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
                  className="hidden items-center justify-center rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80 sm:inline-flex"
                >
                  Book a Tour
                </button>
                <button
                  type="button"
                  onClick={() => go(heroSecondary)}
                  className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Get Started
                </button>
                <Sheet open={tourDrawerOpen} onOpenChange={setTourDrawerOpen}>
                  <SheetTrigger asChild>
                    <button
                      type="button"
                      className="relative inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      Tour requests
                      <span
                        className={cn(
                          "grid size-5 place-items-center rounded-full text-xs font-bold",
                          newLeadCount > 0
                            ? "bg-foreground text-background"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {tourLeadCount}
                      </span>
                    </button>
                  </SheetTrigger>
                  <SheetContent
                    side="right"
                    className="w-full gap-0 p-0 sm:max-w-md"
                  >
                    <SheetHeader className="border-b border-border p-6">
                      <SheetTitle>Tour requests</SheetTitle>
                      <SheetDescription>
                        {tourLeadCount > 0
                          ? `${tourLeadCount} request${tourLeadCount === 1 ? "" : "s"} saved for this page session.`
                          : "No tour requests yet. Submit the inquiry form to start collecting leads."}
                      </SheetDescription>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto px-6 py-5">
                      {tourLeads.length ? (
                        <div className="space-y-4">
                          {tourLeads.map((lead) => (
                            <article
                              key={lead.id}
                              className="rounded-lg border border-border bg-muted p-4"
                            >
                              <div className="mb-3 flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <h3 className="text-sm font-semibold text-foreground">
                                    {lead.name}
                                  </h3>
                                  <p className="text-xs text-muted-foreground">
                                    {lead.email}
                                  </p>
                                  {lead.company ? (
                                    <p className="text-xs text-muted-foreground">
                                      {lead.company}
                                    </p>
                                  ) : null}
                                </div>
                                <span
                                  className={cn(
                                    "mt-0.5 rounded-full px-2 py-1 text-[0.65rem] font-semibold",
                                    lead.status === "contacted"
                                      ? "bg-accent text-accent-foreground/80"
                                      : "bg-foreground text-background",
                                  )}
                                >
                                  {lead.status === "contacted"
                                    ? "Contacted"
                                    : "New"}
                                </span>
                              </div>
                              <p className="mb-1 text-sm text-foreground/90">
                                {lead.interest}
                              </p>
                              <p className="mb-3 text-xs text-muted-foreground">
                                {lead.source || "tour-form"}
                              </p>
                              <div className="flex items-center justify-end gap-2">
                                {lead.status === "new" ? (
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      void markTourLeadContacted(lead.id)
                                    }
                                  >
                                    Mark contacted
                                  </Button>
                                ) : null}
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => void removeTourLead(lead.id)}
                                >
                                  Remove
                                </Button>
                              </div>
                            </article>
                          ))}
                        </div>
                      ) : (
                        <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 px-4 text-center">
                          <p className="text-sm font-medium text-foreground">
                            No tour requests yet
                          </p>
                          <p className="mt-2 text-xs text-muted-foreground">
                            Fill out the tour form to start building your lead queue.
                          </p>
                        </div>
                      )}
                    </div>
                    <SheetFooter className="border-t border-border p-6">
                      <div className="mb-3 flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">New requests</span>
                        <span className="font-semibold text-foreground">
                          {newLeadCount}
                        </span>
                      </div>
                      <div className="mb-4 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
                        {isSignedIn
                          ? `Signed in as ${authDisplayName}`
                          : "Sign in to sync these requests across sessions."}
                      </div>
                      <div className="grid gap-2">
                        {isSignedIn ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={handleSignOut}
                          >
                            Sign out
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            size="sm"
                            onClick={handleSignIn}
                            disabled={auth.isLoading}
                          >
                            {authStatus}
                          </Button>
                        )}
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => void clearTourLeads()}
                          disabled={tourLeadCount === 0}
                        >
                          Clear requests
                        </Button>
                        <SheetClose asChild>
                          <Button type="button" size="sm">
                            Continue
                          </Button>
                        </SheetClose>
                      </div>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
                <button
                  type="button"
                  aria-label="Open menu"
                  aria-expanded={mobileOpen}
                  aria-controls="mobile-menu"
                  onClick={() => setMobileOpen((v: boolean) => !v)}
                  className="p-2 text-muted-foreground transition-colors hover:text-foreground md:hidden"
                >
                  <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
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
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false)
                    setTourDrawerOpen(true)
                  }}
                  className="text-base font-medium text-foreground/90 transition-colors hover:text-foreground text-left"
                >
                  Tour requests
                  <span className="ml-2 text-muted-foreground">
                    ({tourLeadCount})
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false)
                    isSignedIn ? handleSignOut() : handleSignIn()
                  }}
                  className="text-base font-medium text-foreground/90 transition-colors hover:text-foreground text-left"
                >
                  {authStatus}
                </button>
              </div>
            )}
          </nav>
        </header>

        <main>
          {/* Hero */}
          <section className="relative bg-muted/50">
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="max-w-2xl">
                  <p className="mb-4 text-sm font-medium uppercase tracking-wider text-muted-foreground">
                    {heroEyebrow}
                  </p>
                  <h1 className="mb-6 text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                    {heroLead}{" "}
                    <span className="text-muted-foreground">{heroMuted}</span>
                  </h1>
                  <p className="mb-8 text-lg leading-relaxed text-muted-foreground sm:text-xl">
                    {heroSub}
                  </p>
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3.5 text-base font-medium text-primary-foreground transition-all hover:bg-primary/90"
                    >
                      {heroPrimary}
                      <ArrowRight className="ml-2 size-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="inline-flex items-center justify-center rounded-xl border border-border bg-card px-6 py-3.5 text-base font-medium text-foreground transition-all hover:bg-accent"
                    >
                      {heroSecondary}
                    </button>
                  </div>
                  <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                    {heroChecks.map((check) => (
                      <div key={check} className="flex items-center gap-2">
                        <Check className="size-5 text-primary" />
                        <span>{check}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <Image
                    alt={heroImageAlt}
                    w={1200}
                    h={800}
                    className="h-[400px] w-full rounded-2xl object-cover shadow-2xl sm:h-[500px] lg:h-[600px]"
                  />
                  <div className="absolute -bottom-6 -left-6 hidden rounded-xl bg-card p-6 shadow-xl sm:block">
                    <div className="flex items-center gap-4">
                      <div className="flex -space-x-2">
                        {proofAvatars.map((alt) => (
                          <Image
                            key={alt}
                            alt={alt}
                            w={100}
                            h={100}
                            className="size-10 rounded-full border-2 border-card object-cover"
                          />
                        ))}
                      </div>
                      <div>
                        <p className="font-semibold text-card-foreground">
                          {proofValue}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {proofLabel}
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
                {logoNames.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => go(name)}
                    className="flex items-center justify-center text-lg font-semibold text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Spaces */}
          <section className="py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 max-w-3xl">
                <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {spacesHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{spacesDesc}</p>
              </div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {spaceItems.map((space) => (
                  <div key={space.title} className="group">
                    <div className="relative mb-5 overflow-hidden rounded-2xl">
                      <Image
                        alt={space.imageAlt}
                        w={800}
                        h={600}
                        loading="lazy"
                        className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <h3 className="mb-2 text-xl font-semibold text-foreground">
                      {space.title}
                    </h3>
                    <p className="mb-4 text-muted-foreground">
                      {space.description}
                    </p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {space.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2">
                          <Check className="size-4 shrink-0 text-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Amenities */}
          <section className="bg-muted/50 py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-start gap-16 lg:grid-cols-2">
                <div>
                  <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                    {amenitiesHeading}
                  </h2>
                  <p className="mb-10 text-lg text-muted-foreground">
                    {amenitiesDesc}
                  </p>

                  <div className="grid gap-6 sm:grid-cols-2">
                    {amenityItems.map((item, i) => (
                      <div key={item.title} className="flex items-start gap-4">
                        <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-card text-foreground shadow-sm">
                          {amenityIcons[i % amenityIcons.length]}
                        </div>
                        <div>
                          <h4 className="mb-1 font-semibold text-foreground">
                            {item.title}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {amenityPhotos.map((alt, i) => (
                    <Image
                      key={alt}
                      alt={alt}
                      w={600}
                      h={800}
                      loading="lazy"
                      className={cn(
                        "h-64 w-full rounded-xl object-cover",
                        i % 2 === 1 && "mt-8",
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Steps */}
          <section className="py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {stepsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{stepsDesc}</p>
              </div>

              <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
                {stepItems.map((step, i) => (
                  <div key={step.title} className="relative">
                    <div className="mb-6 grid size-12 place-items-center rounded-xl bg-primary">
                      <span className="text-lg font-semibold text-primary-foreground">
                        {i + 1}
                      </span>
                    </div>
                    <h3 className="mb-3 text-xl font-semibold text-foreground">
                      {step.title}
                    </h3>
                    <p className="leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                    <div className="mt-6 border-t border-border pt-6">
                      <p className="text-sm text-muted-foreground">
                        {step.note}
                      </p>
                    </div>
                    {i < stepItems.length - 1 && (
                      <div
                        aria-hidden="true"
                        className="absolute left-full top-6 hidden h-px w-full -translate-x-8 bg-border md:block"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Gallery */}
          <section className="bg-foreground py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="mb-3 text-3xl font-semibold tracking-tight text-background sm:text-4xl">
                    {galleryHeading}
                  </h2>
                  <p className="text-lg text-background/60">{galleryDesc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => go(galleryCta)}
                  className="inline-flex items-center font-medium text-background transition-colors hover:text-background/70"
                >
                  {galleryCta}
                  <ArrowRight className="ml-2 size-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {galleryPhotos.map((alt, i) => (
                  <div
                    key={alt}
                    className={cn(
                      i === 0 && "col-span-2 row-span-2",
                      (i === 5 || i === 6) && "col-span-2",
                    )}
                  >
                    <Image
                      alt={alt}
                      w={i === 0 ? 1200 : 800}
                      h={i === 0 ? 800 : 400}
                      loading="lazy"
                      className={cn(
                        "w-full rounded-xl object-cover",
                        i === 0 ? "h-full min-h-[300px]" : "h-48",
                      )}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {pricingHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{pricingDesc}</p>
              </div>

              <div className="grid gap-8 md:grid-cols-3 lg:gap-6">
                {pricingPlans.map((plan) => (
                  <div
                    key={plan.name}
                    className={cn(
                      "relative rounded-2xl bg-card p-8",
                      plan.featured
                        ? "border-2 border-primary"
                        : "border border-border",
                    )}
                  >
                    {plan.badge && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                          {plan.badge}
                        </span>
                      </div>
                    )}
                    <h3 className="mb-2 text-lg font-semibold text-card-foreground">
                      {plan.name}
                    </h3>
                    <p className="mb-6 text-sm text-muted-foreground">
                      {plan.tagline}
                    </p>
                    <div className="mb-6">
                      <span className="text-4xl font-semibold text-card-foreground">
                        {plan.price}
                      </span>
                      <span className="text-muted-foreground">
                        {plan.period}
                      </span>
                    </div>
                    <ul className="mb-8 space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3">
                          <Check className="mt-0.5 size-5 shrink-0 text-primary" />
                          <span className="text-sm text-muted-foreground">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => go(`${plan.name} ${plan.cta}`)}
                      className={cn(
                        "w-full rounded-xl px-4 py-3 font-medium transition-colors",
                        plan.featured
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                      )}
                    >
                      {plan.cta}
                    </button>
                  </div>
                ))}
              </div>

              {/* Private offices band */}
              <div className="mt-12 rounded-2xl bg-muted/50 p-8 lg:p-12">
                <div className="grid items-center gap-8 lg:grid-cols-2">
                  <div>
                    <h3 className="mb-3 text-2xl font-semibold text-foreground">
                      {pricingOffice.title}
                    </h3>
                    <p className="mb-6 text-muted-foreground">
                      {pricingOffice.description}
                    </p>
                    <div className="mb-6 flex flex-wrap gap-3">
                      {pricingOffice.tiers.map((tier) => (
                        <span
                          key={tier}
                          className="rounded-full border border-border bg-card px-3 py-1 text-sm text-muted-foreground"
                        >
                          {tier}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-4 sm:flex-row lg:justify-end">
                    <button
                      type="button"
                      onClick={() => go(pricingOffice.primaryCta)}
                      className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      {pricingOffice.primaryCta}
                    </button>
                    <button
                      type="button"
                      onClick={() => go(pricingOffice.secondaryCta)}
                      className="inline-flex items-center justify-center rounded-xl border border-border bg-card px-6 py-3 font-medium text-foreground transition-colors hover:bg-accent"
                    >
                      {pricingOffice.secondaryCta}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="bg-foreground py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-12">
                {statItems.map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="mb-2 text-4xl font-semibold text-background sm:text-5xl">
                      {stat.value}
                    </div>
                    <div className="text-background/60">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {testimonialsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {testimonialsDesc}
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {testimonialItems.map((t) => (
                  <div key={t.name} className="rounded-2xl bg-muted/50 p-8">
                    <div className="mb-4 flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star key={s} className="size-5 text-chart-4" />
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
                        <div className="font-semibold text-foreground">
                          {t.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {t.role}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-muted/50 py-20 sm:py-28">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <div className="mb-12 text-center">
                <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {faqHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{faqDesc}</p>
              </div>

              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.q}
                    className="group rounded-xl border border-border bg-card"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between p-6">
                      <span className="font-semibold text-card-foreground">
                        {item.q}
                      </span>
                      <span className="ml-4 shrink-0">
                        <svg
                          className="size-5 text-muted-foreground transition-transform group-open:rotate-180"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </span>
                    </summary>
                    <div className="px-6 pb-6 text-muted-foreground">
                      {item.a.map((para, p) => (
                        <p key={para} className={cn(p < item.a.length - 1 && "mb-3")}>
                          {para}
                        </p>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* Tour CTA */}
          <section className="py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="overflow-hidden rounded-3xl bg-foreground">
                <div className="grid lg:grid-cols-2">
                  <div className="p-8 sm:p-12 lg:p-16">
                    <h2 className="mb-4 text-3xl font-semibold tracking-tight text-background sm:text-4xl">
                      {tourHeading}
                    </h2>
                    <p className="mb-8 text-lg text-background/60">{tourDesc}</p>

                    <form
                      className="space-y-4"
                      onSubmit={handleTourSubmit}
                    >
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label
                            htmlFor="coworking-name"
                            className="mb-2 block text-sm font-medium text-background/60"
                          >
                            Name
                          </label>
                          <input
                            id="coworking-name"
                            type="text"
                            required
                            placeholder="Your name"
                            value={tourFormName}
                            onChange={(event) =>
                              setTourFormName(event.target.value)
                            }
                            className="w-full rounded-xl border border-border bg-background/10 px-4 py-3 text-background placeholder-background/40 focus:outline-none focus:ring-2 focus:ring-background/20"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="coworking-email"
                            className="mb-2 block text-sm font-medium text-background/60"
                          >
                            Email
                          </label>
                          <input
                            id="coworking-email"
                            type="email"
                            required
                            placeholder="you@company.com"
                            value={tourFormEmail}
                            onChange={(event) =>
                              setTourFormEmail(event.target.value)
                            }
                            className="w-full rounded-xl border border-border bg-background/10 px-4 py-3 text-background placeholder-background/40 focus:outline-none focus:ring-2 focus:ring-background/20"
                          />
                        </div>
                      </div>
                      <div>
                        <label
                          htmlFor="coworking-company"
                          className="mb-2 block text-sm font-medium text-background/60"
                        >
                          Company (optional)
                        </label>
                        <input
                          id="coworking-company"
                          type="text"
                          placeholder="Your company"
                          value={tourFormCompany}
                          onChange={(event) =>
                            setTourFormCompany(event.target.value)
                          }
                          className="w-full rounded-xl border border-border bg-background/10 px-4 py-3 text-background placeholder-background/40 focus:outline-none focus:ring-2 focus:ring-background/20"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="coworking-interest"
                          className="mb-2 block text-sm font-medium text-background/60"
                        >
                          Interested in
                        </label>
                        <select
                          id="coworking-interest"
                          required
                          value={selectedTourInterest}
                          onChange={(event) =>
                            setTourFormInterest(event.target.value)
                          }
                          className="w-full appearance-none rounded-xl border border-border bg-background/10 px-4 py-3 text-background focus:outline-none focus:ring-2 focus:ring-background/20"
                        >
                          <option value="" className="bg-background text-foreground">
                            Select an option
                          </option>
                          {tourInterests.map((opt) => (
                            <option
                              key={opt}
                              value={opt}
                              className="bg-background text-foreground"
                            >
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button
                        type="submit"
                        className="inline-flex w-full items-center justify-center rounded-xl bg-background px-8 py-4 font-semibold text-foreground transition-colors hover:bg-background/90 sm:w-auto"
                      >
                        {tourSubmit}
                        <ArrowRight className="ml-2 size-5" />
                      </button>
                    </form>

                    <p className="mt-6 text-sm text-background/50">{tourNote}</p>
                  </div>

                  <div className="relative hidden lg:block">
                    <Image
                      alt={tourImageAlt}
                      w={800}
                      h={1000}
                      loading="lazy"
                      className="absolute inset-0 size-full object-cover"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-r from-foreground via-foreground/50 to-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-border py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5 lg:gap-12">
              <div className="col-span-2 md:col-span-4 lg:col-span-1">
                <button
                  type="button"
                  onClick={() => go(brand)}
                  className="mb-4 flex items-center gap-2"
                >
                  <LogoMark className="size-8 text-sm" />
                  <span className="text-lg font-semibold text-foreground">
                    {brand}
                  </span>
                </button>
                <p className="mb-4 text-sm text-muted-foreground">
                  {footerTagline}
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

              {footerColumns.map((col) => (
                <div key={col.heading}>
                  <h4 className="mb-4 font-semibold text-foreground">
                    {col.heading}
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
                  {footerContact.map((line) => (
                    <li key={line}>
                      <button
                        type="button"
                        onClick={() => go(line)}
                        className="text-left transition-colors hover:text-foreground"
                      >
                        {line}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
              <p className="text-sm text-muted-foreground">{footerCopyright}</p>
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                {footerLegal.map((link) => (
                  <button
                    key={link}
                    type="button"
                    onClick={() => go(link)}
                    className="transition-colors hover:text-foreground"
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
