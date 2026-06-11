import { useState, type ReactNode } from "react"
import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * FilmDirectorKimiPage — a complete, self-contained portfolio LANDING page for a
 * film director / cinematographer / director of photography.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "Marcus Chen" design: a clean,
 * editorial, light-canvas aesthetic with light/thin display type, generous
 * whitespace, and a few inverted near-black cinematic bands for the work reel,
 * pricing, and contact. It strings together a fixed navbar, a split hero (label +
 * thin headline with one emphasized word + dual CTAs + a 3-up KPI strip beside a
 * tall 4:5 portrait), a "trusted by" brand-logo strip, a 6-up services grid with
 * icon tiles, a dark "Selected Work" reel grid (9 play-button project cards with
 * category tags + load-more), a split "How we work together" numbered process with
 * a 3:4 photo and a floating client pull-quote card, a stats band (4 metrics +
 * 3 award credits), a 6-up client-testimonial grid with avatars, a 3-tier pricing
 * "Investment" table (with a highlighted Most Popular plan on a dark card), a
 * 6-item FAQ accordion, a dark contact CTA (email + phone + studio/representation/
 * social details), and a slim footer.
 *
 * The block owns ALL layout, spacing, type hierarchy, and the light/dark band
 * rhythm. Every nav item / CTA / pricing button / FAQ / social / footer link
 * routes through `useNavigate` (never a dead "#"). All content imagery uses the
 * alt-driven <Image> component (never a raw src). Callers supply ONLY content
 * data; rich defaults make it render great with no props at all.
 */
export const FilmDirectorKimiPage = defineCapsule({
  name: "FilmDirectorKimiPage",
  description:
    "Complete film-director / cinematographer / director-of-photography PORTFOLIO landing page with a clean, editorial, light-canvas aesthetic, thin display typography, generous whitespace, and inverted near-black cinematic bands for the work reel, pricing, and contact. Includes a fixed navbar, a split hero (eyebrow label, thin headline with one emphasized word, Watch Reel + View Projects CTAs, a 3-up KPI strip, and a tall 4:5 portrait), a trusted-by brand-logo strip, a 6-up services grid with icon tiles (commercial direction, cinematography, creative development, documentary, music videos, post production), a dark Selected Work reel grid of project cards with play buttons and category tags plus a load-more button, a split numbered How-We-Work process with a 3:4 photo and a floating client quote card, a stats band (projects, awards, views, festival selections) with award credits (Cannes Lions, AICP, Sundance), a 6-up client-testimonial grid with avatars, a 3-tier Investment pricing table with a highlighted Most Popular dark plan, a 6-item FAQ accordion, a dark contact CTA (email, phone, studio address, representation, social), and a slim footer. Use as the ROOT/home page for filmmakers, directors, cinematographers, DPs, video production houses, commercial/narrative/documentary/music-video creatives, or motion/film portfolios when a premium, cinematic, conversion-focused page with strong reel showcase, social proof, and clear pricing is wanted. Supply content only — brand, nav, hero, logos, services, work, process, stats, testimonials, pricing, faq, contact, footer; the block owns all layout and styling.",
  props: z.object({
    /** Director / studio name shown in the navbar. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content. */
    hero: z
      .object({
        eyebrow: z.string().optional(),
        /** Heading text; the `highlight` phrase within it is rendered emphasized. */
        heading: z.string().optional(),
        highlight: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        imageAlt: z.string().optional(),
        stats: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** Trusted-by brand-logo strip. */
    logos: z
      .object({
        label: z.string().optional(),
        brands: z.array(z.string()).optional(),
      })
      .optional(),
    /** Services / capabilities grid. */
    services: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Selected work reel grid. */
    work: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        filters: z.array(z.string()).optional(),
        loadMore: z.string().optional(),
        items: z
          .array(
            z.object({
              tag: z.string(),
              title: z.string(),
              role: z.string(),
              imageAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Split numbered process / about band. */
    process: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        imageAlt: z.string().optional(),
        steps: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
        quote: z.string().optional(),
        quoteName: z.string().optional(),
        quoteRole: z.string().optional(),
      })
      .optional(),
    /** Stats band + award credits. */
    stats: z
      .object({
        metrics: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
        awards: z
          .array(z.object({ name: z.string(), detail: z.string() }))
          .optional(),
      })
      .optional(),
    /** Client testimonials grid. */
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
              avatarAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Investment / pricing table. */
    pricing: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        tiers: z
          .array(
            z.object({
              name: z.string(),
              price: z.string(),
              suffix: z.string().optional(),
              description: z.string(),
              features: z.array(z.string()),
              cta: z.string(),
              popular: z.boolean().optional(),
              popularLabel: z.string().optional(),
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
          .array(z.object({ question: z.string(), answer: z.string() }))
          .optional(),
      })
      .optional(),
    /** Contact CTA + details. */
    contact: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        studioLabel: z.string().optional(),
        studio: z.string().optional(),
        repLabel: z.string().optional(),
        rep: z.string().optional(),
        socialLabel: z.string().optional(),
        social: z.array(z.string()).optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        note: z.string().optional(),
        links: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const brand = props.brand ?? "Marcus Chen"
    const nav = props.nav?.length
      ? props.nav
      : ["Work", "Services", "About", "Get in Touch"]

    const heroEyebrow = props.hero?.eyebrow ?? "Film Director & Cinematographer"
    const heroHeading = props.hero?.heading ?? "Visual stories that resonate"
    const heroHighlight = props.hero?.highlight ?? "resonate"
    const heroSub =
      props.hero?.subheading ??
      "Crafting cinematic narratives for brands, agencies, and artists. From concept to final cut, I bring vision and precision to every frame."
    const heroPrimary = props.hero?.primaryCta ?? "Watch Reel"
    const heroSecondary = props.hero?.secondaryCta ?? "View Projects"
    const heroImageAlt =
      props.hero?.imageAlt ??
      "cinematic behind-the-scenes shot of a film director operating a professional cinema camera on a commercial set with lighting equipment visible"
    const heroStats = props.hero?.stats?.length
      ? props.hero.stats
      : [
          { value: "12+", label: "Years Experience" },
          { value: "87", label: "Projects Delivered" },
          { value: "14", label: "Industry Awards" },
        ]

    const logosLabel =
      props.logos?.label ?? "Trusted by leading brands and agencies"
    const logoBrands = props.logos?.brands?.length
      ? props.logos.brands
      : ["NIKE", "APPLE", "SONY", "NETFLIX", "SPOTIFY", "ADOBE"]

    const servicesHeading = props.services?.heading ?? "Services"
    const servicesDesc =
      props.services?.description ??
      "Full-service video production from concept development through post-production, tailored for commercial, narrative, and documentary projects."
    const serviceItems = props.services?.items?.length
      ? props.services.items
      : [
          {
            title: "Commercial Direction",
            description:
              "Brand films, product launches, and advertising campaigns that connect with audiences and drive results.",
          },
          {
            title: "Cinematography",
            description:
              "Award-winning DP work for features, shorts, music videos, and high-end commercial productions.",
          },
          {
            title: "Creative Development",
            description:
              "Storyboarding, visual treatment design, and creative consulting from pre-production through delivery.",
          },
          {
            title: "Documentary",
            description:
              "Long and short-form documentary production with journalistic integrity and cinematic vision.",
          },
          {
            title: "Music Videos",
            description:
              "Visual storytelling for artists and labels, from intimate performance pieces to high-concept narratives.",
          },
          {
            title: "Post Production",
            description:
              "Color grading, editing supervision, and delivery for broadcast, theatrical, and digital platforms.",
          },
        ]

    const workHeading = props.work?.heading ?? "Selected Work"
    const workDesc =
      props.work?.description ??
      "A curated selection of recent projects across commercial, narrative, and documentary filmmaking."
    const workFilters = props.work?.filters?.length
      ? props.work.filters
      : ["All", "Commercial", "Narrative", "Documentary"]
    const workLoadMore = props.work?.loadMore ?? "Load More Projects"
    const workItems = props.work?.items?.length
      ? props.work.items
      : [
          {
            tag: "Commercial",
            title: "Velocity Automotive",
            role: "Director / DP",
            imageAlt:
              "dramatic cinematic still from a luxury car commercial showing a sleek vehicle on a winding coastal road at golden hour",
          },
          {
            tag: "Narrative",
            title: "Echoes of Rain",
            role: "Short Film — 2024",
            imageAlt:
              "atmospheric still from an independent film scene showing two actors in intimate conversation at a rain-soaked diner booth",
          },
          {
            tag: "Documentary",
            title: "The North Face: Boundless",
            role: "Director",
            imageAlt:
              "stunning mountain landscape cinematography shot for outdoor brand campaign showing hiker silhouetted against dramatic alpine peaks",
          },
          {
            tag: "Music Video",
            title: "Midnight Bloom — Aurora",
            role: "Director / Cinematographer",
            imageAlt:
              "dynamic concert photography still from a music video shoot showing a performer on stage with dramatic purple and blue stage lighting",
          },
          {
            tag: "Fashion Film",
            title: "Maison Lumière SS24",
            role: "Director",
            imageAlt:
              "elegant product cinematography still from a fashion brand film showing model in flowing silk dress against minimalist white background with soft lighting",
          },
          {
            tag: "Corporate",
            title: "Notion — Work Reimagined",
            role: "Director / DP",
            imageAlt:
              "candid documentary-style photograph from a tech startup culture film showing diverse team collaborating in modern glass-walled office space",
          },
          {
            tag: "Documentary",
            title: "Chef's Table: Origins",
            role: "Cinematographer — Ep. 3, 5, 7",
            imageAlt:
              "artistic food cinematography still from a culinary documentary showing chef hands plating an exquisite dish in professional kitchen with steam rising",
          },
          {
            tag: "Live Event",
            title: "Electric Forest 2024",
            role: "Director of Photography",
            imageAlt:
              "vibrant electronic music festival scene with crowd silhouettes against massive LED stage displays and laser light show",
          },
          {
            tag: "Narrative",
            title: "The Watchmaker's Son",
            role: "Short Film — Festival Circuit",
            imageAlt:
              "intimate close-up still from a narrative film showing an elderly actor's weathered hands holding a vintage pocket watch in soft window light",
          },
        ]

    const processEyebrow = props.process?.eyebrow ?? "The Process"
    const processHeading = props.process?.heading ?? "How we work together"
    const processDesc =
      props.process?.description ??
      "Every project begins with understanding your vision and ends with delivering a film that exceeds expectations. My process is collaborative, transparent, and designed to bring out the best in every story."
    const processImageAlt =
      props.process?.imageAlt ??
      "film director reviewing footage on a professional monitor in a color grading suite with calibrated displays and dim ambient lighting"
    const processSteps = props.process?.steps?.length
      ? props.process.steps
      : [
          {
            title: "Discovery & Concept",
            description:
              "We start with deep conversations about your goals, audience, and vision. I develop creative treatments and storyboards that capture the essence of what we're building.",
          },
          {
            title: "Pre-Production",
            description:
              "Casting, location scouting, shot lists, and schedules. Every detail is planned to ensure a smooth production day and the highest quality footage.",
          },
          {
            title: "Production",
            description:
              "On set, I focus on capturing authentic performances and stunning visuals. My approach balances creative spontaneity with meticulous technical execution.",
          },
          {
            title: "Post-Production",
            description:
              "Editing, color grading, sound design, and final delivery. I work with top-tier post houses and colorists to ensure your film looks and sounds its best.",
          },
        ]
    const processQuote =
      props.process?.quote ??
      "Marcus has an incredible eye for detail and a gift for bringing out authentic performances."
    const processQuoteName = props.process?.quoteName ?? "Sarah Mitchell"
    const processQuoteRole =
      props.process?.quoteRole ?? "Creative Director, Nike Global"

    const statMetrics = props.stats?.metrics?.length
      ? props.stats.metrics
      : [
          { value: "87", label: "Projects Completed" },
          { value: "14", label: "Industry Awards" },
          { value: "40M+", label: "Combined Views" },
          { value: "6", label: "Festival Selections" },
        ]
    const statAwards = props.stats?.awards?.length
      ? props.stats.awards
      : [
          { name: "Cannes Lions", detail: "Gold Winner 2023" },
          { name: "AICP Awards", detail: "Best Direction 2024" },
          { name: "Sundance", detail: "Official Selection 2024" },
        ]

    const testimonialsHeading = props.testimonials?.heading ?? "Client Words"
    const testimonialsDesc =
      props.testimonials?.description ??
      "What creative directors, brand managers, and fellow filmmakers say about working together."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            name: "Sarah Mitchell",
            role: "Creative Director, Nike",
            quote:
              "Marcus has an incredible eye for detail and a gift for bringing out authentic performances. The campaign exceeded all our KPIs and won a Cannes Lion.",
            avatarAlt:
              "professional headshot of a smiling female creative director with short brown hair wearing minimalist black clothing",
          },
          {
            name: "David Park",
            role: "Executive Producer, Pulse Films",
            quote:
              "Working with Marcus is seamless. He comes prepared, communicates clearly, and delivers footage that's always beautifully composed. A true professional.",
            avatarAlt:
              "professional headshot of a male film producer in his forties with glasses and graying beard wearing a casual button shirt",
          },
          {
            name: "Emma Larsson",
            role: "VP Marketing, Spotify",
            quote:
              "Marcus directed our global brand film with such care and vision. He understood our brand instantly and elevated the concept beyond what we imagined.",
            avatarAlt:
              "professional headshot of a female marketing executive with blonde hair wearing elegant business attire and subtle jewelry",
          },
          {
            name: "Julian Reyes",
            role: "Artist, Midnight Bloom",
            quote:
              "The music video Marcus created for us captured the exact emotion of the song. He's a director who truly listens and understands artistic vision.",
            avatarAlt:
              "professional headshot of a young male indie musician with curly dark hair and artistic style wearing a vintage jacket",
          },
          {
            name: "Robert Chen",
            role: "Founder, Chen & Partners",
            quote:
              "We've worked with Marcus on six campaigns now. He consistently delivers cinematic quality while staying on time and on budget. Our go-to director.",
            avatarAlt:
              "professional headshot of a mature male advertising agency founder with distinguished gray hair wearing a premium suit",
          },
          {
            name: "Nina Okafor",
            role: "Producer, Netflix Documentaries",
            quote:
              "Marcus's cinematography on Chef's Table was breathtaking. He finds beauty in the smallest details and elevates every frame to art.",
            avatarAlt:
              "professional headshot of a female documentary producer with dark hair and natural makeup wearing practical outdoor clothing",
          },
        ]

    const pricingHeading = props.pricing?.heading ?? "Investment"
    const pricingDesc =
      props.pricing?.description ??
      "Transparent pricing for different project scopes. Every package includes full production services from concept to delivery."
    const pricingTiers = props.pricing?.tiers?.length
      ? props.pricing.tiers
      : [
          {
            name: "Essential",
            price: "$15,000",
            suffix: "+",
            description:
              "Perfect for brand stories, testimonials, and social content.",
            features: [
              "1 day of production",
              "1-2 minute final cut",
              "Basic color grading",
              "2 revision rounds",
              "Licensed music",
            ],
            cta: "Get Started",
          },
          {
            name: "Professional",
            price: "$35,000",
            suffix: "+",
            description:
              "Comprehensive campaigns, brand films, and commercial spots.",
            features: [
              "2-3 days of production",
              "2-3 minute final cut",
              "Premium color grade",
              "Custom sound design",
              "3 revision rounds",
              "Multiple deliverables",
            ],
            cta: "Get Started",
            popular: true,
            popularLabel: "Most Popular",
          },
          {
            name: "Premium",
            price: "Custom",
            description:
              "Multi-spot campaigns, documentary series, and high-end productions.",
            features: [
              "Multi-day production",
              "Multiple deliverables",
              "Feature-film quality",
              "Dedicated post team",
              "Unlimted revisions",
              "Global locations",
            ],
            cta: "Contact for Quote",
          },
        ]

    const faqHeading = props.faq?.heading ?? "Common Questions"
    const faqDesc =
      props.faq?.description ??
      "Everything you need to know about working together."
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: "What is your typical project timeline?",
            answer:
              "Most projects take 4-8 weeks from kickoff to final delivery. This includes 1-2 weeks for pre-production (casting, locations, shot lists), 1-3 days of filming, and 2-4 weeks for post-production. Rush timelines are possible with advance notice and may incur additional fees.",
          },
          {
            question: "Do you work with international clients?",
            answer:
              "Absolutely. I've filmed projects across North America, Europe, and Asia. I'm based in Los Angeles but travel frequently for productions. Remote pre-production via video calls works seamlessly, and I've built relationships with local crews in major cities worldwide.",
          },
          {
            question: "What equipment do you shoot on?",
            answer:
              "I typically shoot on ARRI Alexa Mini LF or Sony Venice 2 for high-end projects, and RED Komodo for more nimble productions. I work with talented DP colleagues for projects requiring specific expertise. All equipment packages are customized to the project's creative and budgetary needs.",
          },
          {
            question: "How do you handle music licensing?",
            answer:
              "Music is integral to my process. For Essential packages, I use high-quality licensed tracks from premium libraries. For Professional and Premium projects, I work with composers for custom scores or license commercial tracks through my network of music supervisors. All licensing is handled professionally and included in your quote.",
          },
          {
            question: "Can you work with our existing agency team?",
            answer:
              "Of course. I regularly collaborate with creative directors, art directors, and account teams from agencies large and small. I'm experienced in taking creative direction while also bringing my own visual perspective to elevate the work. Clear communication and shared references ensure we're aligned throughout.",
          },
          {
            question: "What deliverables do you provide?",
            answer:
              "Every project includes the master cut in 4K or HD, along with format-specific versions for social platforms (9:16 vertical, 1:1 square, 16:9). I also provide still frames for press use, and can deliver raw footage on request. Color-graded versions for broadcast specs are available upon request.",
          },
        ]

    const contactHeading =
      props.contact?.heading ?? "Ready to create something remarkable?"
    const contactDesc =
      props.contact?.description ??
      "Let's discuss your project, timeline, and vision. I'm currently booking projects for Q3 2025."
    const contactEmail = props.contact?.email ?? "hello@marcuschen.film"
    const contactPhone = props.contact?.phone ?? "+1 (310) 555-1234"
    const contactStudioLabel = props.contact?.studioLabel ?? "Studio"
    const contactStudio =
      props.contact?.studio ?? "1247 Abbot Kinney Blvd, Venice, CA 90291"
    const contactRepLabel = props.contact?.repLabel ?? "Representation"
    const contactRep =
      props.contact?.rep ??
      "Samantha Wright, United Talent Agency, samantha.wright@uta.com"
    const contactSocialLabel = props.contact?.socialLabel ?? "Social"
    const contactSocial = props.contact?.social?.length
      ? props.contact.social
      : ["Instagram", "Vimeo", "LinkedIn"]

    const footerNote = props.footer?.note ?? "All rights reserved."
    const footerLinks = props.footer?.links?.length
      ? props.footer.links
      : ["Privacy", "Terms", "Credits"]

    const PlayIcon = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
          clipRule="evenodd"
        />
      </svg>
    )

    const Check = () => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="size-5 shrink-0 text-muted-foreground"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    )

    const Sparkle = () => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    )

    const serviceIcons: ReactNode[] = [
      // film / video
      <svg
        key="film"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>,
      // camera
      <svg
        key="camera"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>,
      // lightbulb
      <svg
        key="bulb"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>,
      // film strip / clapper
      <svg
        key="clapper"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
      </svg>,
      // music
      <svg
        key="music"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
      </svg>,
      // edit / sliders
      <svg
        key="edit"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>,
    ]

    const renderHeading = () => {
      const idx = heroHighlight
        ? heroHeading.indexOf(heroHighlight)
        : -1
      if (idx === -1) return heroHeading
      return (
        <>
          {heroHeading.slice(0, idx)}
          <span className="font-medium">{heroHighlight}</span>
          {heroHeading.slice(idx + heroHighlight.length)}
        </>
      )
    }

    return (
      <div
        className={cn(
          "min-h-svh bg-background font-sans text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/90 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between md:h-20">
              <button
                type="button"
                onClick={() => go(brand)}
                className="text-lg font-medium tracking-tight md:text-xl"
              >
                {brand.toUpperCase()}
              </button>
              <div className="hidden items-center gap-8 md:flex">
                {nav.slice(0, -1).map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => go(label)}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => go(nav[nav.length - 1])}
                  className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {nav[nav.length - 1]}
                </button>
              </div>
              <button
                type="button"
                aria-label="Menu"
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
                onClick={() => setMobileOpen((v: boolean) => !v)}
                className="p-2 md:hidden"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
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
            </div>
          </div>
        </header>

        <main className="pt-16 md:pt-20">
          {/* Hero */}
          <section className="flex min-h-screen items-center">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-24 lg:px-8">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
                <div className="order-2 lg:order-1">
                  <p className="mb-4 text-sm uppercase tracking-widest text-muted-foreground">
                    {heroEyebrow}
                  </p>
                  <h1 className="mb-6 text-4xl font-light leading-tight sm:text-5xl lg:text-6xl">
                    {renderHeading()}
                  </h1>
                  <p className="mb-8 max-w-xl text-lg leading-relaxed text-muted-foreground">
                    {heroSub}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="inline-flex items-center rounded-md bg-primary px-6 py-3 text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      <PlayIcon className="mr-2 size-5" />
                      {heroPrimary}
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="inline-flex items-center rounded-md border border-border px-6 py-3 transition-colors hover:border-foreground"
                    >
                      {heroSecondary}
                    </button>
                  </div>
                  <div className="mt-12 grid grid-cols-3 gap-8 border-t border-border pt-8">
                    {heroStats.map((s) => (
                      <div key={s.label}>
                        <p className="text-2xl font-light">{s.value}</p>
                        <p className="text-sm text-muted-foreground">
                          {s.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="order-1 lg:order-2">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-muted">
                    <Image
                      alt={heroImageAlt}
                      w={800}
                      h={1000}
                      className="size-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 to-transparent" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Logos */}
          <section className="border-y border-border py-16 md:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-12 text-center text-sm text-muted-foreground">
                {logosLabel}
              </p>
              <div className="grid grid-cols-2 items-center gap-8 opacity-70 md:grid-cols-4 lg:grid-cols-6">
                {logoBrands.map((b) => (
                  <div key={b} className="flex justify-center">
                    <span className="text-base font-semibold tracking-tight text-foreground">
                      {b}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Services */}
          <section className="py-20 md:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 max-w-2xl">
                <h2 className="mb-4 text-3xl font-light md:text-4xl">
                  {servicesHeading}
                </h2>
                <p className="leading-relaxed text-muted-foreground">
                  {servicesDesc}
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {serviceItems.map((item, i) => (
                  <div
                    key={item.title}
                    className="rounded-md border border-border p-6 transition-colors hover:border-muted-foreground"
                  >
                    <div className="mb-4 grid size-12 place-items-center rounded-md bg-muted text-foreground">
                      {serviceIcons[i % serviceIcons.length]}
                    </div>
                    <h3 className="mb-2 text-lg font-medium">{item.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Selected Work */}
          <section className="bg-foreground py-20 text-background md:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="mb-4 text-3xl font-light md:text-4xl">
                    {workHeading}
                  </h2>
                  <p className="max-w-xl text-background/70">{workDesc}</p>
                </div>
                <div className="mt-6 flex gap-4 text-sm md:mt-0">
                  {workFilters.map((f, i) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => go(f)}
                      className={cn(
                        "rounded-md px-4 py-2 transition-colors",
                        i === 0
                          ? "border border-background hover:bg-background hover:text-foreground"
                          : "text-background/70 hover:text-background",
                      )}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {workItems.map((proj) => (
                  <button
                    key={proj.title}
                    type="button"
                    onClick={() => go(proj.title)}
                    className="group block w-full cursor-pointer text-left"
                  >
                    <div className="relative aspect-video overflow-hidden rounded-md bg-muted">
                      <Image
                        alt={proj.imageAlt}
                        w={800}
                        h={450}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-foreground/60 transition-colors group-hover:bg-foreground/40" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="grid size-16 place-items-center rounded-full bg-background/20 transition-colors group-hover:bg-background/30">
                          <PlayIcon className="ml-1 size-8 text-background" />
                        </div>
                      </div>
                      <div className="absolute inset-x-4 bottom-4">
                        <span className="text-xs uppercase tracking-wider text-background/70">
                          {proj.tag}
                        </span>
                        <h3 className="mt-1 text-lg font-medium text-background">
                          {proj.title}
                        </h3>
                        <p className="mt-1 text-sm text-background/70">
                          {proj.role}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-12 text-center">
                <button
                  type="button"
                  onClick={() => go(workLoadMore)}
                  className="rounded-md border border-border px-6 py-3 text-sm transition-colors hover:border-background"
                >
                  {workLoadMore}
                </button>
              </div>
            </div>
          </section>

          {/* Process / About */}
          <section className="py-20 md:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-16 lg:grid-cols-2">
                <div>
                  <p className="mb-4 text-sm uppercase tracking-widest text-muted-foreground">
                    {processEyebrow}
                  </p>
                  <h2 className="mb-6 text-3xl font-light md:text-4xl">
                    {processHeading}
                  </h2>
                  <p className="mb-12 leading-relaxed text-muted-foreground">
                    {processDesc}
                  </p>
                  <div className="space-y-8">
                    {processSteps.map((step, i) => (
                      <div key={step.title} className="flex gap-6">
                        <div className="grid size-12 shrink-0 place-items-center rounded-full bg-muted text-lg font-medium">
                          {i + 1}
                        </div>
                        <div>
                          <h3 className="mb-2 text-lg font-medium">
                            {step.title}
                          </h3>
                          <p className="text-sm leading-relaxed text-muted-foreground">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <div className="aspect-[3/4] overflow-hidden rounded-md bg-muted">
                    <Image
                      alt={processImageAlt}
                      w={800}
                      h={1066}
                      loading="lazy"
                      className="size-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-8 -left-8 hidden max-w-xs rounded-md bg-card p-6 text-card-foreground shadow-lg md:block">
                    <p className="mb-3 text-sm italic text-muted-foreground">
                      &ldquo;{processQuote}&rdquo;
                    </p>
                    <p className="text-sm font-medium">{processQuoteName}</p>
                    <p className="text-xs text-muted-foreground">
                      {processQuoteRole}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Stats + Awards */}
          <section className="bg-muted py-20 md:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-12">
                {statMetrics.map((m) => (
                  <div key={m.label} className="text-center">
                    <p className="mb-2 text-4xl font-light md:text-5xl">
                      {m.value}
                    </p>
                    <p className="text-sm text-muted-foreground">{m.label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-16 grid gap-8 border-t border-border pt-16 md:grid-cols-3">
                {statAwards.map((a) => (
                  <div key={a.name} className="flex items-center gap-4">
                    <div className="grid size-12 place-items-center rounded-md bg-secondary text-secondary-foreground">
                      <Sparkle />
                    </div>
                    <div>
                      <p className="font-medium">{a.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {a.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="py-20 md:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <h2 className="mb-4 text-3xl font-light md:text-4xl">
                  {testimonialsHeading}
                </h2>
                <p className="text-muted-foreground">{testimonialsDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {testimonialItems.map((t) => (
                  <div
                    key={t.name}
                    className="rounded-md border border-border p-6"
                  >
                    <div className="mb-4 flex items-center gap-4">
                      <Image
                        alt={t.avatarAlt}
                        w={100}
                        h={100}
                        loading="lazy"
                        className="size-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium">{t.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {t.role}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm italic leading-relaxed text-muted-foreground">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing / Investment */}
          <section className="bg-muted py-20 md:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <h2 className="mb-4 text-3xl font-light md:text-4xl">
                  {pricingHeading}
                </h2>
                <p className="text-muted-foreground">{pricingDesc}</p>
              </div>
              <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
                {pricingTiers.map((tier) => (
                  <div
                    key={tier.name}
                    className={cn(
                      "relative rounded-md p-8",
                      tier.popular
                        ? "bg-foreground text-background"
                        : "border border-border bg-card text-card-foreground",
                    )}
                  >
                    {tier.popular && (
                      <div className="absolute right-0 top-0 rounded-bl-md bg-background px-3 py-1 text-xs text-foreground">
                        {tier.popularLabel ?? "Most Popular"}
                      </div>
                    )}
                    <p
                      className={cn(
                        "mb-2 text-sm uppercase tracking-wider",
                        tier.popular
                          ? "text-background/70"
                          : "text-muted-foreground",
                      )}
                    >
                      {tier.name}
                    </p>
                    <div className="mb-4 flex items-baseline gap-1">
                      <span className="text-4xl font-light">{tier.price}</span>
                      {tier.suffix && (
                        <span
                          className={
                            tier.popular
                              ? "text-background/70"
                              : "text-muted-foreground"
                          }
                        >
                          {tier.suffix}
                        </span>
                      )}
                    </div>
                    <p
                      className={cn(
                        "mb-6 text-sm",
                        tier.popular
                          ? "text-background/70"
                          : "text-muted-foreground",
                      )}
                    >
                      {tier.description}
                    </p>
                    <ul className="mb-8 space-y-3 text-sm">
                      {tier.features.map((f) => (
                        <li key={f} className="flex items-center gap-3">
                          <Check />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => go(tier.cta)}
                      className={cn(
                        "w-full rounded-md py-3 text-sm transition-colors",
                        tier.popular
                          ? "bg-background text-foreground hover:bg-background/90"
                          : "border border-border hover:border-foreground",
                      )}
                    >
                      {tier.cta}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="py-20 md:py-32">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <h2 className="mb-4 text-3xl font-light md:text-4xl">
                  {faqHeading}
                </h2>
                <p className="text-muted-foreground">{faqDesc}</p>
              </div>
              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.question}
                    className="group rounded-md border border-border open:border-muted-foreground"
                  >
                    <summary className="flex cursor-pointer items-center justify-between p-6">
                      <span className="font-medium">{item.question}</span>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="size-5 transition-transform group-open:rotate-180"
                        aria-hidden="true"
                      >
                        <path d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="px-6 pb-6 text-sm leading-relaxed text-muted-foreground">
                      {item.answer}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* Contact CTA */}
          <section className="bg-foreground py-20 text-background md:py-32">
            <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2 className="mb-6 text-3xl font-light md:text-5xl">
                {contactHeading}
              </h2>
              <p className="mx-auto mb-10 max-w-2xl text-lg text-background/70">
                {contactDesc}
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(contactEmail)}
                  className="inline-flex items-center justify-center rounded-md bg-background px-8 py-4 text-foreground transition-colors hover:bg-background/90"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 size-5"
                    aria-hidden="true"
                  >
                    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {contactEmail}
                </button>
                <button
                  type="button"
                  onClick={() => go(contactPhone)}
                  className="inline-flex items-center justify-center rounded-md border border-border px-8 py-4 transition-colors hover:border-background"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 size-5"
                    aria-hidden="true"
                  >
                    <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {contactPhone}
                </button>
              </div>
              <div className="mt-16 grid gap-8 border-t border-border pt-16 text-left md:grid-cols-3">
                <div>
                  <p className="mb-2 text-sm text-background/70">
                    {contactStudioLabel}
                  </p>
                  <p className="text-sm">{contactStudio}</p>
                </div>
                <div>
                  <p className="mb-2 text-sm text-background/70">
                    {contactRepLabel}
                  </p>
                  <p className="text-sm">{contactRep}</p>
                </div>
                <div>
                  <p className="mb-2 text-sm text-background/70">
                    {contactSocialLabel}
                  </p>
                  <div className="flex gap-4">
                    {contactSocial.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => go(s)}
                        className="text-sm transition-colors hover:text-background/70"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-foreground py-8 text-background/70">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <p className="text-sm">
                © {new Date().getFullYear()} {brand}. {footerNote}
              </p>
              <div className="flex gap-6 text-sm">
                {footerLinks.map((link) => (
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
