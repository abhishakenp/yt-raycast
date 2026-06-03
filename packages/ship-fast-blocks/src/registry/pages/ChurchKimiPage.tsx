import type { ReactNode } from "react"
import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * ChurchKimiPage — a complete, self-contained CHURCH / faith-community website
 * home page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "Grace Community Church"
 * design: a warm, calm, neutral aesthetic on a light canvas with soft muted
 * bands, generous whitespace, rounded photo cards and quiet serif-feeling
 * type hierarchy. It pairs a centered hero (est-since eyebrow, two-tone
 * headline, Plan-Your-Visit + Watch-Live CTAs, service-time + address strip)
 * with a partner-ministries logo band, a 3-up "next step" pathways grid, a
 * split service-times list with a "What to Expect" card, a 6-up featured
 * events grid, a 3-up member testimonials wall, a 4-up congregation stats
 * band, a generosity / give split with photo collage + giving stats, an
 * accordion FAQ, and a rich dark multi-column footer with contact + socials.
 */
export const ChurchKimiPage = defineComponent({
  name: "ChurchKimiPage",
  description:
    "Complete CHURCH / faith-community / ministry website home page with a warm, calm, welcoming aesthetic: light neutral canvas, soft muted section bands, rounded photo cards and quiet type hierarchy. Includes a centered hero (established-since eyebrow, two-tone 'belong, believe, become' headline, Plan-Your-Visit + Watch-Live CTAs, Sunday service-time + street-address strip), a partner-ministries logo band, a 3-up 'next step' pathways grid (small groups, kids & youth, serve together), a split weekly service-times list with a 'What to Expect' checklist card, a 6-up featured-events grid with dates and registration CTAs, a 3-up member testimonials wall with headshots, a 4-up congregation stats band (attendance, small groups, volunteers, years serving), a generosity / give split with photo collage and giving stats, an accordion FAQ, and a dark multi-column footer with address, phone, email and social links. Use as the ROOT/home page for churches, parishes, congregations, ministries, worship centers, faith communities, or religious nonprofits when a warm, trustworthy, invitation-focused page with service times, events and giving is wanted. Supply content only — brand, nav, hero, partners, pathways, services, events, testimonials, stats, give, faq, footer; the block owns all layout and styling.",
  props: z.object({
    /** Church / community name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Centered hero section content. */
    hero: z
      .object({
        eyebrow: z.string().optional(),
        headingTop: z.string().optional(),
        headingBottom: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        serviceTime: z.string().optional(),
        address: z.string().optional(),
        imageAlt: z.string().optional(),
      })
      .optional(),
    /** Partner-ministries logo band. */
    partners: z
      .object({
        label: z.string().optional(),
        items: z.array(z.string()).optional(),
      })
      .optional(),
    /** "Next step" pathways grid. */
    pathways: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
              cta: z.string(),
              imageAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Weekly service-times split section. */
    services: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              detail: z.string(),
              location: z.string(),
            }),
          )
          .optional(),
        imageAlt: z.string().optional(),
        expectTitle: z.string().optional(),
        expect: z.array(z.string()).optional(),
      })
      .optional(),
    /** Featured-events grid. */
    events: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        viewAll: z.string().optional(),
        items: z
          .array(
            z.object({
              date: z.string(),
              time: z.string(),
              title: z.string(),
              description: z.string(),
              cta: z.string(),
              imageAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Member testimonials wall. */
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
    /** Congregation stats band. */
    stats: z
      .object({
        items: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** Generosity / give split. */
    give: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        points: z
          .array(z.object({ title: z.string(), detail: z.string() }))
          .optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        imageAltOne: z.string().optional(),
        imageAltTwo: z.string().optional(),
        statOne: z.object({ value: z.string(), label: z.string() }).optional(),
        statTwo: z.object({ value: z.string(), label: z.string() }).optional(),
      })
      .optional(),
    /** Accordion FAQ. */
    faq: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        items: z
          .array(z.object({ q: z.string(), a: z.string() }))
          .optional(),
      })
      .optional(),
    /** Dark footer content. */
    footer: z
      .object({
        about: z.string().optional(),
        socials: z.array(z.string()).optional(),
        quickLinksTitle: z.string().optional(),
        quickLinks: z.array(z.string()).optional(),
        resourcesTitle: z.string().optional(),
        resources: z.array(z.string()).optional(),
        contactTitle: z.string().optional(),
        address: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        hours: z.string().optional(),
        copyright: z.string().optional(),
        legal: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "Grace Community"
    const nav = props.nav?.length
      ? props.nav
      : ["Services", "About", "Events", "Give", "Contact"]

    const heroEyebrow = props.hero?.eyebrow ?? "Est. 1987 • Portland, Oregon"
    const heroTop = props.hero?.headingTop ?? "A place to belong,"
    const heroBottom = props.hero?.headingBottom ?? "believe, and become."
    const heroSub =
      props.hero?.subheading ??
      "We're a welcoming community of faith, hope, and love. Whether you're exploring spirituality for the first time or looking for a church home, there's a seat for you here."
    const heroPrimary = props.hero?.primaryCta ?? "Plan Your Visit"
    const heroSecondary = props.hero?.secondaryCta ?? "Watch Live"
    const heroServiceTime =
      props.hero?.serviceTime ?? "Sundays at 9:00 & 11:00 AM"
    const heroAddress = props.hero?.address ?? "4521 NE Glisan Street"
    const heroImageAlt =
      props.hero?.imageAlt ??
      "Sunlight streaming through tall church windows creating warm golden rays"

    const partnersLabel =
      props.partners?.label ?? "Partner ministries & affiliated organizations"
    const partnerItems = props.partners?.items?.length
      ? props.partners.items
      : [
          "Portland Rescue Mission",
          "World Vision",
          "Compassion International",
          "Samaritan's Purse",
          "Youth With A Mission",
        ]

    const pathwaysHeading = props.pathways?.heading ?? "Everyone has a next step"
    const pathwaysDesc =
      props.pathways?.description ??
      "Whether you're taking your first steps in faith or have been walking with Jesus for decades, we have pathways designed to help you grow, connect, and serve."
    const pathwayItems = props.pathways?.items?.length
      ? props.pathways.items
      : [
          {
            title: "Small Groups",
            description:
              "Meet weekly in homes across the Portland metro area. Share life, study scripture, and build lasting friendships with 8-12 people.",
            cta: "Find a group",
            imageAlt:
              "Young adults laughing together during a small group Bible study in a cozy living room",
          },
          {
            title: "Kids & Youth",
            description:
              "Nursery through high school programs every Sunday. Safe, fun environments where young people discover faith at their level.",
            cta: "Learn more",
            imageAlt:
              "Children smiling and raising hands during a colorful Sunday school worship session",
          },
          {
            title: "Serve Together",
            description:
              "Join one of 40+ volunteer teams. From greeting guests to global missions, there's a place for your gifts to make a difference.",
            cta: "Explore teams",
            imageAlt:
              "Volunteers wearing matching t-shirts distributing food at a community outreach event",
          },
        ]

    const servicesEyebrow = props.services?.eyebrow ?? "Weekly Gatherings"
    const servicesHeading = props.services?.heading ?? "Join us this Sunday"
    const servicesDesc =
      props.services?.description ??
      "Experience contemporary worship, relevant teaching, and a welcoming community. Services last approximately 75 minutes."
    const serviceItems = props.services?.items?.length
      ? props.services.items
      : [
          {
            title: "Sunday Morning Worship",
            detail:
              "9:00 AM & 11:00 AM — Contemporary service with full band, children's programs, and nursery care.",
            location: "Main Sanctuary & Live Stream",
          },
          {
            title: "Wednesday Night Encounter",
            detail:
              "7:00 PM — Midweek prayer, worship, and teaching. Dinner served at 6:00 PM ($5 suggested).",
            location: "Fellowship Hall",
          },
          {
            title: "Saturday Prayer Vigil",
            detail:
              "First Saturday monthly, 8:00 AM — 12:00 PM — Corporate prayer for our city and world.",
            location: "Prayer Chapel",
          },
        ]
    const servicesImageAlt =
      props.services?.imageAlt ??
      "Wide interior view of a modern church sanctuary with warm lighting and wooden accents"
    const expectTitle = props.services?.expectTitle ?? "What to Expect"
    const expectItems = props.services?.expect?.length
      ? props.services.expect
      : [
          "Casual dress — come as you are",
          "Free coffee and pastries before service",
          "Programs for kids ages 0-18",
          "Accessible parking and seating",
        ]

    const eventsEyebrow = props.events?.eyebrow ?? "Coming Up"
    const eventsHeading = props.events?.heading ?? "Featured Events"
    const eventsViewAll = props.events?.viewAll ?? "View all events"
    const eventItems = props.events?.items?.length
      ? props.events.items
      : [
          {
            date: "June 15, 2025",
            time: "2:00 PM",
            title: "Summer Baptism Celebration",
            description:
              "Join us at Sellwood Riverfront Park as we celebrate new life in Christ. Picnic and fellowship to follow.",
            cta: "Register free",
            imageAlt:
              "Outdoor summer baptism celebration at a lake with people gathered on the shore",
          },
          {
            date: "June 22, 2025",
            time: "6:00 PM",
            title: "Parenting Teens Workshop",
            description:
              "A three-hour interactive seminar with licensed counselor Sarah Mitchell. Childcare provided.",
            cta: "$15 per family",
            imageAlt:
              "Parents and teenagers having discussion in a circle at a youth group meeting",
          },
          {
            date: "July 5, 2025",
            time: "8:00 AM",
            title: "CityServe Food Drive",
            description:
              "Our quarterly citywide service day. Help distribute 5,000 meals to families in need across Portland.",
            cta: "Sign up to serve",
            imageAlt:
              "Volunteers packing boxes of food donations at a community food bank",
          },
          {
            date: "July 18-19, 2025",
            time: "Evening sessions",
            title: "Worship Nights Conference",
            description:
              "Two nights of extended worship with special guests Phil Wickham and Charity Gayle. Free admission.",
            cta: "Reserve seats",
            imageAlt:
              "Worship band performing on stage with warm stage lighting and raised hands in the audience",
          },
          {
            date: "August 9, 2025",
            time: "11:00 AM",
            title: "Men's BBQ & Fellowship",
            description:
              "Annual men's gathering at Mount Tabor Park. Bring your own meat; sides and drinks provided.",
            cta: "RSVP required",
            imageAlt:
              "Fathers and children enjoying a picnic barbecue together on a sunny day",
          },
          {
            date: "September 8, 2025",
            time: "6:30 PM",
            title: "Bible Study Launch Night",
            description:
              "Fall semester small groups kickoff. Meet leaders, preview studies, and find your group for the season.",
            cta: "Learn more",
            imageAlt: "Woman reading Bible in morning light with coffee cup nearby",
          },
        ]

    const testimonialsEyebrow = props.testimonials?.eyebrow ?? "Stories"
    const testimonialsHeading =
      props.testimonials?.heading ?? "Life change happens here"
    const testimonialsDesc =
      props.testimonials?.description ??
      "Hear from people who have found community, purpose, and faith at Grace."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "I walked in broken after losing my job and marriage. This community didn't just pray for me—they showed up with meals, helped me move, and walked with me through the darkest season. I'm not the same person I was two years ago.",
            name: "David Chen",
            meta: "Member since 2022",
            avatarAlt:
              "Professional headshot of a smiling man in his 40s with short brown hair and a warm expression",
          },
          {
            quote:
              "As a single mom, finding a church that truly welcomed my kids was everything. The youth program has become my daughter's second home, and I've found lifelong friends in my small group. We're family here.",
            name: "Marcus Johnson",
            meta: "Member since 2019",
            avatarAlt:
              "Professional headshot of a smiling woman in her 30s with curly dark hair and natural makeup",
          },
          {
            quote:
              "I grew up skeptical of church. A friend invited me to a service and I was struck by how real and unpretentious it felt. The teaching engages my mind and the people have won my heart. I never expected to be baptized at 34.",
            name: "Ryan Mitchell",
            meta: "Member since 2023",
            avatarAlt:
              "Professional headshot of a friendly man in his 30s with a beard and glasses wearing a casual shirt",
          },
        ]

    const statItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "2,400+", label: "Weekly Attendance" },
          { value: "68", label: "Small Groups" },
          { value: "450+", label: "Active Volunteers" },
          { value: "37", label: "Years Serving Portland" },
        ]

    const giveEyebrow = props.give?.eyebrow ?? "Generosity"
    const giveHeading = props.give?.heading ?? "Give with purpose"
    const giveDesc =
      props.give?.description ??
      "Your generosity fuels our mission to love God and serve our city. Every dollar given supports community outreach, global missions, youth programs, and caring for those in need."
    const givePoints = props.give?.points?.length
      ? props.give.points
      : [
          {
            title: "Secure online giving",
            detail: "One-time or recurring. Bank transfer has no fees.",
          },
          {
            title: "Year-end statements",
            detail: "Tax receipts emailed automatically in January.",
          },
          {
            title: "Other ways to give",
            detail: "Text, mail, or stock transfer available.",
          },
        ]
    const givePrimary = props.give?.primaryCta ?? "Give Online"
    const giveSecondary = props.give?.secondaryCta ?? "Text to Give"
    const giveImageOne =
      props.give?.imageAltOne ??
      "Volunteers helping distribute supplies at a homeless outreach event"
    const giveImageTwo =
      props.give?.imageAltTwo ??
      "Mission team building a school classroom in a rural community"
    const giveStatOne = props.give?.statOne ?? {
      value: "$1.2M",
      label: "Given to local outreach in 2024",
    }
    const giveStatTwo = props.give?.statTwo ?? {
      value: "12",
      label: "Global mission partners supported",
    }

    const faqEyebrow = props.faq?.eyebrow ?? "Questions"
    const faqHeading = props.faq?.heading ?? "Common questions"
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            q: "What should I wear?",
            a: "Come as you are. You'll find everything from jeans and t-shirts to business casual. We care more about you being here than what you wear.",
          },
          {
            q: "Is there something for my kids?",
            a: "Absolutely. We offer nursery (0-2), preschool (3-5), elementary (K-5th), and middle school programs during every service. High school meets Sunday evenings at 5:00 PM. All volunteers are background-checked and trained.",
          },
          {
            q: "How do I join a small group?",
            a: "Small groups launch each September and January. You can browse open groups online or stop by the Connection Center on Sunday to talk with a host who will help you find the right fit based on your location, life stage, and interests.",
          },
          {
            q: "Do you offer counseling or support groups?",
            a: "Yes. We offer pastoral counseling by appointment, as well as specialized support groups including GriefShare, DivorceCare, and addiction recovery. These are confidential and led by trained facilitators. Contact our Care Ministry for details.",
          },
          {
            q: "What do you believe?",
            a: "We're a nondenominational Christian church holding to historic Christian orthodoxy. We affirm the Bible as God's inspired Word, salvation through faith in Jesus Christ, and the importance of local church community. Our full statement of faith is available on our About page.",
          },
        ]

    const footerAbout =
      props.footer?.about ??
      "A place to belong, believe, and become. Join us Sundays at 9 & 11 AM."
    const footerSocials = props.footer?.socials?.length
      ? props.footer.socials
      : ["Instagram", "YouTube", "Facebook"]
    const quickLinksTitle = props.footer?.quickLinksTitle ?? "Quick Links"
    const quickLinks = props.footer?.quickLinks?.length
      ? props.footer.quickLinks
      : [
          "Service Times",
          "Upcoming Events",
          "Small Groups",
          "Give Online",
          "Watch Sermons",
          "Care & Prayer",
        ]
    const resourcesTitle = props.footer?.resourcesTitle ?? "Resources"
    const resources = props.footer?.resources?.length
      ? props.footer.resources
      : [
          "Sermon Archive",
          "Bible Reading Plan",
          "Devotionals",
          "New Here Guide",
          "Statement of Faith",
          "Leadership Team",
        ]
    const contactTitle = props.footer?.contactTitle ?? "Contact"
    const footerAddress =
      props.footer?.address ?? "4521 NE Glisan Street, Portland, OR 97213"
    const footerPhone = props.footer?.phone ?? "(503) 555-0147"
    const footerEmail = props.footer?.email ?? "hello@gracecommunity.church"
    const footerHours = props.footer?.hours ?? "Mon–Thu: 9 AM – 5 PM"
    const footerCopyright =
      props.footer?.copyright ?? "Grace Community Church. All rights reserved."
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Privacy", "Terms", "Accessibility"]

    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="16"
        height="16"
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

    const Check = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M5 13l4 4L19 7" />
      </svg>
    )

    const serviceIcons = [
      // clock
      <svg
        key="clock"
        className="size-5 text-foreground"
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
      // moon
      <svg
        key="moon"
        className="size-5 text-foreground"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>,
      // hands
      <svg
        key="hands"
        className="size-5 text-foreground"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
      </svg>,
    ]

    const giveIcons = [
      // currency
      <svg
        key="currency"
        className="size-5 text-foreground"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      // clipboard
      <svg
        key="clipboard"
        className="size-5 text-foreground"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>,
      // people
      <svg
        key="people"
        className="size-5 text-foreground"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>,
    ]

    const socialIcons: Record<string, ReactNode> = {
      Instagram: (
        <svg
          className="size-5"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
      YouTube: (
        <svg
          className="size-5"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
      Facebook: (
        <svg
          className="size-5"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    }

    const Star = () => (
      <span className="text-2xl text-muted-foreground" aria-hidden="true">
        ✦
      </span>
    )

    return (
      <div
        className={cn(
          "min-h-svh bg-background font-sans text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <nav
              className="flex h-20 items-center justify-between"
              aria-label="Main navigation"
            >
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center gap-2"
              >
                <Star />
                <span className="text-xl font-medium tracking-tight text-foreground">
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
                  onClick={() => go("Give")}
                  className="hidden items-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:inline-flex"
                >
                  Give Today
                </button>
                <button
                  type="button"
                  aria-label="Open menu"
                  onClick={() => go(nav[0])}
                  className="p-2 text-muted-foreground md:hidden"
                >
                  <svg
                    className="size-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
              </div>
            </nav>
          </div>
        </header>

        <main>
          {/* Hero */}
          <section className="relative overflow-hidden pb-20 pt-32 lg:pb-32 lg:pt-48">
            <div aria-hidden="true" className="absolute inset-0 -z-10">
              <Image
                alt={heroImageAlt}
                w={1920}
                h={1080}
                className="size-full object-cover opacity-30"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
            </div>
            <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
              <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
                {heroEyebrow}
              </p>
              <h1 className="mb-6 text-4xl font-medium leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                {heroTop}
                <br />
                <span className="text-muted-foreground">{heroBottom}</span>
              </h1>
              <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                {heroSub}
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(heroPrimary)}
                  className="inline-flex items-center rounded-full bg-primary px-8 py-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {heroPrimary}
                </button>
                <button
                  type="button"
                  onClick={() => go(heroSecondary)}
                  className="inline-flex items-center rounded-full border border-border bg-card px-8 py-4 text-sm font-medium text-card-foreground transition-colors hover:bg-accent"
                >
                  <svg
                    className="mr-2 size-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  {heroSecondary}
                </button>
              </div>
              <div className="mt-16 flex items-center justify-center gap-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <svg
                    className="size-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>{heroServiceTime}</span>
                </div>
                <div className="hidden items-center gap-2 sm:flex">
                  <svg
                    className="size-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                  </svg>
                  <span>{heroAddress}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Partner ministries */}
          <section className="border-y border-border bg-muted/50 py-16">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <p className="mb-10 text-center text-sm text-muted-foreground">
                {partnersLabel}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-12 opacity-60 lg:gap-16">
                {partnerItems.map((p) => (
                  <span
                    key={p}
                    className="text-xl font-medium text-muted-foreground"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Pathways / next step */}
          <section className="py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mb-20 max-w-3xl">
                <h2 className="mb-6 text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
                  {pathwaysHeading}
                </h2>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {pathwaysDesc}
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-12">
                {pathwayItems.map((item) => (
                  <article key={item.title} className="group">
                    <div className="mb-6 aspect-[4/3] overflow-hidden rounded-xl bg-muted">
                      <Image
                        alt={item.imageAlt}
                        w={800}
                        h={600}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <h3 className="mb-3 text-xl font-medium text-foreground">
                      {item.title}
                    </h3>
                    <p className="mb-4 leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                    <button
                      type="button"
                      onClick={() => go(item.cta)}
                      className="inline-flex items-center text-sm font-medium text-foreground hover:text-muted-foreground"
                    >
                      {item.cta}
                      <ArrowRight className="ml-1 size-4" />
                    </button>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Weekly services */}
          <section className="bg-muted py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="grid items-start gap-16 lg:grid-cols-2">
                <div>
                  <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
                    {servicesEyebrow}
                  </p>
                  <h2 className="mb-6 text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
                    {servicesHeading}
                  </h2>
                  <p className="mb-10 text-lg leading-relaxed text-muted-foreground">
                    {servicesDesc}
                  </p>
                  <div className="space-y-6">
                    {serviceItems.map((s, i) => (
                      <div
                        key={s.title}
                        className="flex items-start gap-4 rounded-xl border border-border bg-card p-6"
                      >
                        <div className="flex size-12 flex-shrink-0 items-center justify-center rounded-full bg-muted">
                          {serviceIcons[i % serviceIcons.length]}
                        </div>
                        <div>
                          <h3 className="mb-1 font-medium text-card-foreground">
                            {s.title}
                          </h3>
                          <p className="mb-2 text-muted-foreground">{s.detail}</p>
                          <p className="text-sm text-muted-foreground">
                            {s.location}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="lg:sticky lg:top-24">
                  <div className="aspect-[3/4] overflow-hidden rounded-xl bg-muted">
                    <Image
                      alt={servicesImageAlt}
                      w={800}
                      h={1000}
                      loading="lazy"
                      className="size-full object-cover"
                    />
                  </div>
                  <div className="mt-6 rounded-xl border border-border bg-card p-6">
                    <h4 className="mb-3 font-medium text-card-foreground">
                      {expectTitle}
                    </h4>
                    <ul className="space-y-3 text-muted-foreground">
                      {expectItems.map((item) => (
                        <li key={item} className="flex items-start gap-3">
                          <Check className="mt-0.5 size-5 flex-shrink-0 text-primary" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Featured events */}
          <section className="py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mb-16 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
                    {eventsEyebrow}
                  </p>
                  <h2 className="text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
                    {eventsHeading}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => go(eventsViewAll)}
                  className="inline-flex items-center text-sm font-medium text-foreground hover:text-muted-foreground"
                >
                  {eventsViewAll}
                  <ArrowRight className="ml-1 size-4" />
                </button>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {eventItems.map((ev) => (
                  <button
                    key={ev.title}
                    type="button"
                    onClick={() => go(ev.title)}
                    className="group block w-full cursor-pointer text-left"
                  >
                    <div className="mb-5 aspect-[16/10] overflow-hidden rounded-xl bg-muted">
                      <Image
                        alt={ev.imageAlt}
                        w={800}
                        h={500}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="mb-3 flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="rounded-full bg-muted px-3 py-1 font-medium text-muted-foreground">
                        {ev.date}
                      </span>
                      <span>{ev.time}</span>
                    </div>
                    <h3 className="mb-2 text-xl font-medium text-foreground transition-colors group-hover:text-muted-foreground">
                      {ev.title}
                    </h3>
                    <p className="mb-4 leading-relaxed text-muted-foreground">
                      {ev.description}
                    </p>
                    <span className="inline-flex items-center text-sm font-medium text-foreground">
                      {ev.cta}
                      <ArrowRight className="ml-1 size-4" />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="bg-muted py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
                  {testimonialsEyebrow}
                </p>
                <h2 className="mb-6 text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
                  {testimonialsHeading}
                </h2>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {testimonialsDesc}
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-3">
                {testimonialItems.map((t) => (
                  <figure
                    key={t.name}
                    className="rounded-xl border border-border bg-card p-8"
                  >
                    <blockquote className="mb-6 leading-relaxed text-card-foreground">
                      &ldquo;{t.quote}&rdquo;
                    </blockquote>
                    <figcaption className="flex items-center gap-4">
                      <Image
                        alt={t.avatarAlt}
                        w={200}
                        h={200}
                        className="size-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium text-card-foreground">
                          {t.name}
                        </p>
                        <p className="text-sm text-muted-foreground">{t.meta}</p>
                      </div>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="border-y border-border py-20">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-12">
                {statItems.map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="mb-2 text-4xl font-medium text-foreground lg:text-5xl">
                      {s.value}
                    </p>
                    <p className="text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Give */}
          <section className="py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="grid items-center gap-16 lg:grid-cols-2">
                <div>
                  <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
                    {giveEyebrow}
                  </p>
                  <h2 className="mb-6 text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
                    {giveHeading}
                  </h2>
                  <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
                    {giveDesc}
                  </p>
                  <div className="mb-10 space-y-4">
                    {givePoints.map((point, i) => (
                      <div key={point.title} className="flex items-center gap-4">
                        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                          {giveIcons[i % giveIcons.length]}
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">
                            {point.title}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {point.detail}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => go(givePrimary)}
                      className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      {givePrimary}
                    </button>
                    <button
                      type="button"
                      onClick={() => go(giveSecondary)}
                      className="inline-flex items-center justify-center rounded-full border border-border bg-card px-8 py-4 text-sm font-medium text-card-foreground transition-colors hover:bg-accent"
                    >
                      {giveSecondary}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="aspect-[4/5] overflow-hidden rounded-xl bg-muted">
                      <Image
                        alt={giveImageOne}
                        w={600}
                        h={750}
                        loading="lazy"
                        className="size-full object-cover"
                      />
                    </div>
                    <div className="rounded-xl bg-muted p-6">
                      <p className="mb-1 text-3xl font-medium text-foreground">
                        {giveStatOne.value}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {giveStatOne.label}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4 pt-8">
                    <div className="rounded-xl bg-primary p-6 text-primary-foreground">
                      <p className="mb-1 text-3xl font-medium">
                        {giveStatTwo.value}
                      </p>
                      <p className="text-sm text-primary-foreground/80">
                        {giveStatTwo.label}
                      </p>
                    </div>
                    <div className="aspect-[4/5] overflow-hidden rounded-xl bg-muted">
                      <Image
                        alt={giveImageTwo}
                        w={600}
                        h={750}
                        loading="lazy"
                        className="size-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-muted py-24 lg:py-32">
            <div className="mx-auto max-w-3xl px-6 lg:px-8">
              <div className="mb-16 text-center">
                <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
                  {faqEyebrow}
                </p>
                <h2 className="text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
                  {faqHeading}
                </h2>
              </div>
              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.q}
                    className="group rounded-xl border border-border bg-card"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between p-6">
                      <span className="font-medium text-card-foreground">
                        {item.q}
                      </span>
                      <span className="ml-4 flex-shrink-0 text-muted-foreground transition-transform group-open:rotate-180">
                        <svg
                          className="size-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.5"
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
        </main>

        {/* Footer */}
        <footer className="bg-foreground py-16 text-background lg:py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mb-16 grid gap-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
              <div className="lg:col-span-1">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-6 flex items-center gap-2"
                >
                  <span className="text-2xl" aria-hidden="true">
                    ✦
                  </span>
                  <span className="text-xl font-medium tracking-tight">
                    {brand}
                  </span>
                </button>
                <p className="mb-6 leading-relaxed text-background/70">
                  {footerAbout}
                </p>
                <div className="flex items-center gap-4">
                  {footerSocials.map((social) => (
                    <button
                      key={social}
                      type="button"
                      aria-label={social}
                      onClick={() => go(social)}
                      className="flex size-10 items-center justify-center rounded-full bg-background/10 text-background transition-colors hover:bg-background/20"
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
              <div>
                <h4 className="mb-6 font-medium">{quickLinksTitle}</h4>
                <ul className="space-y-3 text-background/70">
                  {quickLinks.map((link) => (
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
              <div>
                <h4 className="mb-6 font-medium">{resourcesTitle}</h4>
                <ul className="space-y-3 text-background/70">
                  {resources.map((link) => (
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
              <div>
                <h4 className="mb-6 font-medium">{contactTitle}</h4>
                <address className="space-y-3 not-italic text-background/70">
                  <p>{footerAddress}</p>
                  <p>
                    <button
                      type="button"
                      onClick={() => go(footerPhone)}
                      className="transition-colors hover:text-background"
                    >
                      {footerPhone}
                    </button>
                  </p>
                  <p>
                    <button
                      type="button"
                      onClick={() => go(footerEmail)}
                      className="transition-colors hover:text-background"
                    >
                      {footerEmail}
                    </button>
                  </p>
                </address>
                <div className="mt-6 border-t border-background/20 pt-6">
                  <p className="text-sm text-background/60">
                    Office Hours
                    <br />
                    {footerHours}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center justify-between gap-4 border-t border-background/20 pt-8 sm:flex-row">
              <p className="text-sm text-background/60">
                © {new Date().getFullYear()} {footerCopyright}
              </p>
              <div className="flex items-center gap-6 text-sm text-background/60">
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
