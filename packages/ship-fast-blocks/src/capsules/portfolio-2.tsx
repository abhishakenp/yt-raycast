import { useState } from "react"
import { type ReactNode } from "react"
import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { Image } from "#/lib/img.tsx"
import { string, table } from "@ship-fast/lakebed/server"
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
import { Button } from "#/components/ui/button.tsx"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * PortfolioKimiPage2 — a faithful Tailwind v4 port of a Kimi-generated personal
 * PORTFOLIO home for "Maya Chen — 3D Motion Designer".
 *
 * This is the SECOND, visually DISTINCT style sibling to PortfolioKimiPage. Where
 * PortfolioKimiPage is moody, restrained and cyan-accented with sentence-case
 * display type, this variant is louder and more editorial: an ultra-bold, all-caps
 * BLACK display headline, a single hot magenta/pink accent (mapped to `primary`),
 * blurred radial glow orbs behind the hero, a live "available for projects" status
 * pill, and a portrait-first hero with an inline stat row. Section order matches the
 * source 1:1: a fixed blur navbar, a split hero (status pill, giant stacked headline
 * with an accent word, dual CTAs, inline stats, portrait image + glow orbs), a
 * client wordmark logo strip, a centered showreel feature (big video still with a
 * round play button, caption bar, and a 3-up reel-stats row), a selected-work gallery
 * of project cards (portrait thumb, category badge + year, title, blurb), a services
 * grid of icon tiles each with a bulleted capability list, an about split (portrait
 * + floating award card, bio paragraphs, a 2x2 info grid, and skill/tool tag chips),
 * a testimonials grid with 5-star rows and photo avatars, an FAQ accordion, a
 * radial-glow contact CTA (email + phone + round social icon buttons), and a slim
 * single-row footer.
 *
 * Best when the prompt is a creative individual's personal site — 3D artist, motion
 * designer, CGI/VFX, art director, animator — who wants a bold, high-energy, modern
 * showcase. Supply content only; the block owns all layout, gradients, and styling.
 * Every prop carries a default sourced from the real Kimi copy, so it renders complete
 * when called positionally as PortfolioKimiPage2(brand, nav). All content/project
 * photos use the alt-driven <Image>; every nav link and CTA routes through
 * `useNavigate` so nothing is a dead "#".
 */
export const PortfolioKimiPage2 = defineCapsule({
  name: "PortfolioKimiPage2",
  description:
    "Complete bold, high-energy 3D / motion-designer / art-director PORTFOLIO home page (use as the ROOT/home route). The louder, more editorial SECOND style sibling to PortfolioKimiPage: an ultra-bold all-caps BLACK display headline, a single hot magenta/pink accent, blurred radial glow orbs, and a live availability status pill. Includes a fixed blur navbar, a split hero (status pill, giant stacked headline with an accent word, dual CTAs incl. a Watch Reel play button, an inline stat row, and a portrait image flanked by glow orbs), a client wordmark logo strip, a centered showreel feature (large video still with a round play button, a caption/quality bar, and a 3-up reel-stats row), a selected-work gallery of project cards (portrait thumbnail, category badge + year, title, blurb), a services grid of icon tiles each with a bulleted capability list, an about split (portrait + floating award card, multi-paragraph bio, a 2x2 info grid, and tool/skill tag chips), a testimonials grid with 5-star rows and photo avatars, an FAQ accordion, a radial-glow contact CTA (email + phone + round social icon buttons), and a slim single-row footer. Choose this when the brief wants a punchy, modern, attention-grabbing reel showcase; choose PortfolioKimiPage for a calmer, cinematic dark-cyan take. Supply content only; the block owns all layout, gradients, and styling.",
  props: z.object({
    /** Brand / person name shown in the navbar, hero, about, footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match the site's route labels). */
    nav: z.array(z.string()).optional(),
    /** Navbar CTA button label. */
    navCta: z.string().optional(),
    /** Hero section content. */
    hero: z
      .object({
        status: z.string().describe("live availability pill text next to the pulsing dot").optional(),
        headlineLine1: z.string().describe("first all-caps headline line, plain").optional(),
        headlineAccent: z.string().describe("second headline line, rendered in the accent color").optional(),
        headlineLine3: z.string().describe("third all-caps headline line, plain").optional(),
        description: z.string().optional(),
        primaryCta: z.string().describe("watch reel button label").optional(),
        secondaryCta: z.string().describe("view projects button label").optional(),
        imageAlt: z.string().describe("alt for the portrait/hero image").optional(),
        stats: z.array(z.object({ value: z.string(), label: z.string() })).optional(),
      })
      .optional(),
    /** Client / brand wordmarks shown in the trusted-by strip. */
    clients: z
      .object({
        label: z.string().optional(),
        items: z.array(z.string()).optional(),
      })
      .optional(),
    /** Showreel feature: heading + video still + caption + reel stats. */
    reel: z
      .object({
        label: z.string().optional(),
        title: z.string().optional(),
        description: z.string().optional(),
        imageAlt: z.string().optional(),
        duration: z.string().optional(),
        caption: z.string().optional(),
        quality: z.string().optional(),
        stats: z.array(z.object({ value: z.string(), label: z.string() })).optional(),
      })
      .optional(),
    /** Selected-work gallery: heading copy + project cards + view-all link. */
    gallery: z
      .object({
        label: z.string().optional(),
        title1: z.string().optional(),
        title2: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              category: z.string(),
              year: z.string(),
              title: z.string(),
              description: z.string(),
              alt: z.string().describe("short description of the project still"),
            }),
          )
          .optional(),
        viewAll: z.string().optional(),
      })
      .optional(),
    /** Services / capabilities grid (icon tile + bullet list per item). */
    services: z
      .object({
        label: z.string().optional(),
        title: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string(), bullets: z.array(z.string()) }))
          .optional(),
      })
      .optional(),
    /** About split: portrait + bio paragraphs + info grid + skill tags. */
    about: z
      .object({
        label: z.string().optional(),
        title: z.string().optional(),
        imageAlt: z.string().optional(),
        lead: z.string().describe("large emphasized intro paragraph").optional(),
        paragraphs: z.array(z.string()).optional(),
        award: z.object({ value: z.string(), label: z.string() }).optional(),
        info: z.array(z.object({ label: z.string(), value: z.string(), accent: z.boolean().optional() })).optional(),
        skills: z.array(z.string()).optional(),
      })
      .optional(),
    /** Testimonials grid (5-star rows + photo avatars). */
    testimonials: z
      .object({
        label: z.string().optional(),
        title: z.string().optional(),
        items: z
          .array(
            z.object({
              text: z.string(),
              name: z.string(),
              role: z.string(),
              avatarAlt: z.string().describe("alt for the reviewer headshot"),
            }),
          )
          .optional(),
      })
      .optional(),
    /** FAQ accordion. */
    faq: z
      .object({
        label: z.string().optional(),
        title: z.string().optional(),
        items: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
      })
      .optional(),
    /** Closing contact CTA. */
    contact: z
      .object({
        title1: z.string().optional(),
        titleAccent: z.string().describe("accent word in the closing headline").optional(),
        description: z.string().optional(),
        email: z.string().optional(),
        primaryCta: z.string().optional(),
        phone: z.string().optional(),
        socials: z.array(z.string()).optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        copyright: z.string().optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: {
    schema: {
      savedActions: table({
        label: string(),
        source: string(),
      }),
    },
    queries: {
      savedActions: ({ db }) => db.savedActions.orderBy("createdAt").all(),
    },
    mutations: {
      saveSavedAction: ({ db }, label: string, source: string) => {
        db.savedActions.insert({ label, source })
        return db.savedActions.orderBy("createdAt").all()
      },
      removeSavedAction: ({ db }, id: string) => {
        db.savedActions.delete(id)
        return db.savedActions.orderBy("createdAt").all()
      },
      clearSavedActions: ({ db }) => {
        for (const item of db.savedActions.all()) {
          db.savedActions.delete(item.id)
        }
        return []
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [workspaceOpen, setWorkspaceOpen] = useState(false)
    const savedActions = lakebed.useQuery("savedActions")
    const saveSavedAction = lakebed.useMutation("saveSavedAction")
    const removeSavedAction = lakebed.useMutation("removeSavedAction")
    const clearSavedActions = lakebed.useMutation("clearSavedActions")
    const savedActionCount = savedActions?.length ?? 0
    const recordSavedAction = (label: string, source: string) => {
      void saveSavedAction(label, source)
      setWorkspaceOpen(true)
    }

    const brand = props.brand ?? "Maya Chen"
    const brandMark = (brand.split(/\s+/)[0] || brand).toUpperCase()

    const nav = props.nav?.length ? props.nav : ["Work", "Reel", "Services", "About", "Contact"]
    const navCta = props.navCta ?? "Let's Talk"

    const hero = {
      status: props.hero?.status ?? "Available for projects — Q3 2026",
      headlineLine1: props.hero?.headlineLine1 ?? "MOTION",
      headlineAccent: props.hero?.headlineAccent ?? "DESIGN",
      headlineLine3: props.hero?.headlineLine3 ?? "THAT MOVES",
      description:
        props.hero?.description ??
        "I'm Maya Chen, a 3D motion designer crafting bold visual stories for brands like Nike, Spotify, and Apple. Specializing in product launches, brand films, and immersive digital experiences.",
      primaryCta: props.hero?.primaryCta ?? "Watch Reel",
      secondaryCta: props.hero?.secondaryCta ?? "View Projects",
      imageAlt:
        props.hero?.imageAlt ??
        "Abstract 3D geometric sculpture with neon pink and purple lighting against dark background",
      stats: props.hero?.stats?.length
        ? props.hero.stats
        : [
            { value: "12+", label: "Years Experience" },
            { value: "180+", label: "Projects Delivered" },
            { value: "24", label: "Industry Awards" },
          ],
    }

    const clients = {
      label: props.clients?.label ?? "Trusted by leading brands",
      items: props.clients?.items?.length
        ? props.clients.items
        : ["NIKE", "APPLE", "SPOTIFY", "ADOBE", "NETFLIX", "GOOGLE"],
    }

    const reel = {
      label: props.reel?.label ?? "Featured",
      title: props.reel?.title ?? "SHOWREEL 2026",
      description:
        props.reel?.description ??
        "A curated selection of my best work from the past three years. Product launches, brand films, and experimental motion studies.",
      imageAlt:
        props.reel?.imageAlt ??
        "Cinematic video editing workstation with multiple screens showing colorful motion graphics timelines and 3D renders",
      duration: props.reel?.duration ?? "Duration: 2:47",
      caption: props.reel?.caption ?? "Best of 2023-2026",
      quality: props.reel?.quality ?? "4K UHD",
      stats: props.reel?.stats?.length
        ? props.reel.stats
        : [
            { value: "47", label: "Projects featured" },
            { value: "8", label: "Industry awards" },
            { value: "3.2M", label: "Combined views" },
          ],
    }

    const gallery = {
      label: props.gallery?.label ?? "Portfolio",
      title1: props.gallery?.title1 ?? "SELECTED",
      title2: props.gallery?.title2 ?? "PROJECTS",
      description:
        props.gallery?.description ??
        "A curated collection of brand films, product visualizations, and experimental motion work.",
      items: props.gallery?.items?.length
        ? props.gallery.items
        : [
            {
              category: "Brand Film",
              year: "2026",
              title: "Nike Air Max 360°",
              description: "Launch campaign featuring fluid particle simulations and dynamic product reveals.",
              alt: "Nike Air Max 3D product visualization with floating geometric shapes and neon pink lighting on dark background",
            },
            {
              category: "Motion System",
              year: "2025",
              title: "Spotify Wrapped 2025",
              description: "End-to-end motion system for the annual user recap campaign. 150M+ impressions.",
              alt: "Spotify music streaming app interface with abstract 3D waveform visualization and gradient colors",
            },
            {
              category: "Product Launch",
              year: "2025",
              title: "Apple Vision Pro",
              description: "Launch film for spatial computing platform. Featured at WWDC keynote.",
              alt: "Apple product visualization with floating iPhone and abstract liquid chrome 3D forms on gradient background",
            },
            {
              category: "Experimental",
              year: "2025",
              title: "Chromesthesia",
              description: "Personal project exploring synesthesia through procedural motion and sound.",
              alt: "Abstract 3D digital art with flowing neon light trails and geometric mesh structure in purple and pink",
            },
            {
              category: "Title Sequence",
              year: "2024",
              title: "Netflix: Stranger Things S5",
              description: "Opening title sequence for the final season. Retro-futuristic aesthetic.",
              alt: "Netflix streaming platform interface with dramatic cinematic 3D typography and red neon accents",
            },
            {
              category: "Brand Film",
              year: "2024",
              title: "Adobe Creative Cloud",
              description: "Brand refresh film celebrating the creative community. Shown at Adobe MAX.",
              alt: "Adobe Creative Cloud brand visualization with flowing gradient 3D shapes and vibrant red to purple colors",
            },
          ],
      viewAll: props.gallery?.viewAll ?? "View All 180+ Projects",
    }

    const services = {
      label: props.services?.label ?? "Services",
      title: props.services?.title ?? "WHAT I DO",
      description:
        props.services?.description ??
        "End-to-end motion design services from concept to final delivery. Every project gets the same obsessive attention to detail.",
      items: props.services?.items?.length
        ? props.services.items
        : [
            {
              title: "Brand Films",
              description:
                "Cinematic brand stories that capture your essence. From manifesto films to product launches, I craft narratives that resonate and convert.",
              bullets: ["Manifesto films", "Product launches", "Social campaigns"],
            },
            {
              title: "3D Visualization",
              description:
                "Photorealistic product renders and abstract 3D worlds. Using Cinema 4D, Octane, and Houdini to bring any concept to life.",
              bullets: ["Product renders", "Environment design", "Character animation"],
            },
            {
              title: "Motion Systems",
              description:
                "Scalable design systems that keep your brand consistent across every touchpoint. Guidelines, templates, and toolkits.",
              bullets: ["UI animation", "Iconography", "Transition libraries"],
            },
            {
              title: "Title Sequences",
              description:
                "Award-winning opening credits for film and television. From Netflix series to indie documentaries.",
              bullets: ["TV series", "Documentaries", "Feature films"],
            },
            {
              title: "Experiential",
              description:
                "Immersive installations and real-time visuals for events, concerts, and digital art exhibitions.",
              bullets: ["Live visuals", "Installations", "AR/VR experiences"],
            },
            {
              title: "Creative Direction",
              description:
                "Strategic creative leadership for campaigns and product launches. From pitch to delivery, I'll guide your vision.",
              bullets: ["Campaign concepts", "Art direction", "Team leadership"],
            },
          ],
    }

    const about = {
      label: props.about?.label ?? "About",
      title: props.about?.title ?? brand.toUpperCase(),
      imageAlt:
        props.about?.imageAlt ??
        "Professional headshot of Maya Chen, a 3D motion designer, in a creative studio environment with monitors showing motion graphics",
      lead:
        props.about?.lead ??
        "3D Motion Designer based in Los Angeles, obsessed with the intersection of technology and art.",
      paragraphs: props.about?.paragraphs?.length
        ? props.about.paragraphs
        : [
            "With 12+ years in the industry, I've had the privilege of working with some of the world's most innovative brands. My work has been recognized by the Motion Awards, ADC, and featured in Stash Media, Motionographer, and It's Nice That.",
            "When I'm not pushing pixels, I'm teaching motion design at ArtCenter College of Design and mentoring emerging talent through the Motion Design Association.",
          ],
      award: props.about?.award ?? { value: "24", label: "Industry Awards" },
      info: props.about?.info?.length
        ? props.about.info
        : [
            { label: "Location", value: "Los Angeles, CA" },
            { label: "Experience", value: "12+ Years" },
            { label: "Specialization", value: "3D Motion Design" },
            { label: "Availability", value: "Open for Q3", accent: true },
          ],
      skills: props.about?.skills?.length
        ? props.about.skills
        : ["Cinema 4D", "Houdini", "Octane", "After Effects", "Redshift", "Unreal Engine", "Blender"],
    }

    const testimonials = {
      label: props.testimonials?.label ?? "Testimonials",
      title: props.testimonials?.title ?? "CLIENT LOVE",
      items: props.testimonials?.items?.length
        ? props.testimonials.items
        : [
            {
              text: "Maya's work on our Air Max launch was nothing short of revolutionary. She brought a level of craft and creativity that elevated the entire campaign. The motion language she created is still being used across our global markets.",
              name: "James Morrison",
              role: "Creative Director, Nike",
              avatarAlt: "Professional headshot of James Morrison, Creative Director at Nike",
            },
            {
              text: "Working with Maya on Wrapped 2025 was a masterclass in motion design systems. Her ability to balance creative expression with scalable production requirements is unmatched. A true professional.",
              name: "Sarah Chen",
              role: "Head of Brand Design, Spotify",
              avatarAlt: "Professional headshot of Sarah Chen, Head of Brand Design at Spotify",
            },
            {
              text: "Maya's Vision Pro launch film set the standard for how we introduce spatial computing to the world. Her understanding of both the technology and the human story behind it resulted in something truly magical.",
              name: "David Park",
              role: "Product Marketing Lead, Apple",
              avatarAlt: "Professional headshot of David Park, Product Marketing Lead at Apple",
            },
          ],
    }

    const faq = {
      label: props.faq?.label ?? "FAQ",
      title: props.faq?.title ?? "QUESTIONS?",
      items: props.faq?.items?.length
        ? props.faq.items
        : [
            {
              q: "What's your typical project timeline?",
              a: "Most brand films take 6-10 weeks from kickoff to delivery. Product visualization projects typically run 3-5 weeks. Motion systems and larger campaigns can span 2-4 months. I always build in time for revisions because the best work comes from iteration.",
            },
            {
              q: "How do you handle revisions?",
              a: "My proposals include two rounds of revisions. Additional rounds are billed at my standard rate. I structure milestones strategically — animatic, style frames, and rough cut — so we align on direction before heavy production work begins.",
            },
            {
              q: "What are your rates?",
              a: "Project fees typically range from $25,000 for focused product visualizations to $150,000+ for comprehensive brand film campaigns. I also offer day rates ($3,500) for ongoing creative direction or consultation. Every proposal is customized based on scope, timeline, and deliverables.",
            },
            {
              q: "Do you work with agencies or direct clients?",
              a: "Both. I have ongoing relationships with agencies like Wieden+Kennedy, R/GA, and Buck. I also work directly with brands who prefer to bypass the middleman. The process adapts to your team's workflow either way.",
            },
            {
              q: "What's your software stack?",
              a: "Cinema 4D and Houdini for 3D, Octane and Redshift for rendering, After Effects for compositing. I deliver in any format you need — broadcast, social cuts, web-optimized, or raw project files for your internal team.",
            },
          ],
    }

    const contact = {
      title1: props.contact?.title1 ?? "LET'S MAKE SOMETHING",
      titleAccent: props.contact?.titleAccent ?? "BOLD",
      description:
        props.contact?.description ??
        "Have a project in mind? I'd love to hear about it. Whether it's a full campaign or a quick consultation, let's talk.",
      email: props.contact?.email ?? "hello@mayachen.design",
      primaryCta: props.contact?.primaryCta ?? "Start a Project",
      phone: props.contact?.phone ?? "(310) 555-1234",
      socials: props.contact?.socials?.length
        ? props.contact.socials
        : ["Instagram", "Twitter", "LinkedIn", "Vimeo", "Behance"],
    }

    const footer = {
      copyright: props.footer?.copyright ?? `© ${new Date().getFullYear()} ${brand}. All rights reserved.`,
    }

    // Service tile line icons (mirror the source SVG set, in order).
    const serviceIcons: ReactNode[] = [
      <svg key="film" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7" aria-hidden="true">
        <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>,
      <svg key="cube" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7" aria-hidden="true">
        <path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>,
      <svg key="grid" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7" aria-hidden="true">
        <path d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>,
      <svg key="display" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7" aria-hidden="true">
        <path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>,
      <svg key="bolt" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7" aria-hidden="true">
        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>,
      <svg key="share" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7" aria-hidden="true">
        <path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
      </svg>,
    ]

    const star = (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    return (
      <div
        className={cn(
          "relative w-full overflow-x-hidden bg-background text-foreground antialiased",
          props.className,
        )}
      >
        {/* ── Navbar ──────────────────────────────────────────────── */}
        <nav className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between lg:h-20">
              <button
                type="button"
                onClick={() => go(nav[0])}
                aria-label={`${brand} home`}
                className="text-xl font-bold tracking-tight lg:text-2xl"
              >
                {brandMark}
                <span className="text-primary">.</span>
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
              <button
                type="button"
                onClick={() => go(navCta)}
                className="hidden items-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 md:inline-flex"
              >
                {navCta}
              </button>
            </div>
          </div>
        </nav>
        <Sheet open={workspaceOpen} onOpenChange={setWorkspaceOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              className="fixed bottom-5 right-5 z-40 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-card-foreground shadow-lg transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Saved {savedActionCount}
            </button>
          </SheetTrigger>
          <SheetContent className="flex w-full flex-col p-0 sm:max-w-md">
            <SheetHeader className="border-b border-border p-6 text-left">
              <SheetTitle>Saved workspace</SheetTitle>
              <SheetDescription>Keep track of page actions and follow-ups.</SheetDescription>
            </SheetHeader>
            <div className="flex-1 space-y-3 overflow-y-auto p-6">
              {(savedActions ?? []).length ? (
                (savedActions ?? []).map((item) => (
                  <div key={item.id} className="rounded-lg border border-border bg-card p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-card-foreground">{item.label}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{item.source}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => void removeSavedAction(item.id)}
                        className="text-xs font-medium text-muted-foreground transition-colors hover:text-destructive"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-border bg-muted/40 p-6 text-sm text-muted-foreground">
                  No saved actions yet. Save this page or any follow-up you want to revisit.
                </div>
              )}
            </div>
            <SheetFooter className="gap-2 border-t border-border p-6 sm:flex-col">
              <Button type="button" onClick={() => recordSavedAction("Saved page", brand)}>
                Save current page
              </Button>
              <Button type="button" variant="outline" onClick={() => void clearSavedActions()}>
                Clear saved actions
              </Button>
              <SheetClose asChild>
                <Button type="button" variant="secondary">
                  Done
                </Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>


        <main>
          {/* ── Hero ──────────────────────────────────────────────── */}
          <section className="relative flex min-h-screen items-center overflow-hidden pt-20">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
            <div aria-hidden="true" className="pointer-events-none absolute right-0 top-1/4 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
            <div aria-hidden="true" className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />

            <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="space-y-8">
                  <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-2">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                    <span className="text-sm font-medium text-muted-foreground">{hero.status}</span>
                  </div>
                  <h1 className="text-5xl font-black leading-[0.9] tracking-tight sm:text-6xl lg:text-7xl xl:text-8xl">
                    {hero.headlineLine1}
                    <br />
                    <span className="text-primary">{hero.headlineAccent}</span>
                    <br />
                    {hero.headlineLine3}
                  </h1>
                  <p className="max-w-lg text-lg leading-relaxed text-muted-foreground lg:text-xl">
                    {hero.description}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <button
                      type="button"
                      onClick={() => go(hero.primaryCta)}
                      className="inline-flex items-center rounded-full bg-primary px-8 py-4 font-bold text-primary-foreground transition-all hover:scale-105 hover:bg-primary/90"
                    >
                      <svg className="mr-2 h-5 w-5 fill-current" viewBox="0 0 20 20" aria-hidden="true">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                      {hero.primaryCta}
                    </button>
                    <button
                      type="button"
                      onClick={() => go(hero.secondaryCta)}
                      className="inline-flex items-center rounded-full border border-border bg-muted px-8 py-4 font-semibold text-foreground transition-all hover:bg-accent hover:text-accent-foreground"
                    >
                      {hero.secondaryCta}
                    </button>
                  </div>
                  <div className="flex items-center gap-8 pt-4">
                    {hero.stats.map((s, i) => (
                      <div key={s.label} className="flex items-center gap-8">
                        {i > 0 && <span aria-hidden="true" className="h-12 w-px bg-border" />}
                        <div>
                          <div className="text-3xl font-bold text-foreground">{s.value}</div>
                          <div className="text-sm text-muted-foreground">{s.label}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <div className="aspect-[4/5] overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-muted to-card">
                    <Image
                      alt={hero.imageAlt}
                      w={800}
                      h={1000}
                      loading="eager"
                      className="h-full w-full object-cover opacity-90 transition-opacity duration-500 hover:opacity-100"
                    />
                  </div>
                  <div aria-hidden="true" className="pointer-events-none absolute -bottom-6 -left-6 h-48 w-48 rounded-full bg-primary/30 blur-2xl" />
                  <div aria-hidden="true" className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full bg-accent/30 blur-2xl" />
                </div>
              </div>
            </div>
          </section>

          {/* ── Client logos ─────────────────────────────────────── */}
          <section aria-label={clients.label} className="border-y border-border bg-muted py-16 lg:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-10 text-center text-sm font-medium uppercase tracking-widest text-muted-foreground">
                {clients.label}
              </p>
              <div className="grid grid-cols-2 items-center gap-8 opacity-60 md:grid-cols-3 lg:grid-cols-6 lg:gap-12">
                {clients.items.map((client) => (
                  <button
                    key={client}
                    type="button"
                    onClick={() => go(nav[0])}
                    className="flex h-12 items-center justify-center text-xl font-bold text-foreground/80 transition-colors hover:text-foreground"
                  >
                    {client}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* ── Showreel ─────────────────────────────────────────── */}
          <section className="py-24 lg:py-32" aria-labelledby="reel-heading">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                  {reel.label}
                </span>
                <h2 id="reel-heading" className="mb-6 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                  {reel.title}
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-muted-foreground">{reel.description}</p>
              </div>

              <button
                type="button"
                onClick={() => go(hero.primaryCta)}
                aria-label="Play showreel"
                className="group relative block aspect-video w-full overflow-hidden rounded-2xl border border-border bg-card text-left"
              >
                <Image
                  alt={reel.imageAlt}
                  w={1200}
                  h={675}
                  loading="lazy"
                  className="h-full w-full object-cover opacity-60 transition-opacity group-hover:opacity-40"
                />
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-24 w-24 items-center justify-center rounded-full bg-primary shadow-2xl shadow-primary/50 transition-transform group-hover:scale-110 lg:h-32 lg:w-32">
                    <svg className="ml-1 h-10 w-10 fill-primary-foreground lg:h-12 lg:w-12" viewBox="0 0 20 20" aria-hidden="true">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  </span>
                </span>
                <span className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-background/80 to-transparent p-6 lg:p-8">
                  <span className="block">
                    <span className="block text-sm text-muted-foreground">{reel.duration}</span>
                    <span className="block text-lg font-semibold text-foreground">{reel.caption}</span>
                  </span>
                  <span className="rounded-full bg-foreground/10 px-4 py-2 text-sm font-medium text-foreground backdrop-blur-sm">
                    {reel.quality}
                  </span>
                </span>
              </button>

              <div className="mt-8 grid gap-6 sm:grid-cols-3">
                {reel.stats.map((s) => (
                  <div key={s.label} className="rounded-xl border border-border bg-muted p-6">
                    <div className="mb-2 text-3xl font-bold text-primary">{s.value}</div>
                    <p className="text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Selected Work gallery ────────────────────────────── */}
          <section className="bg-muted py-24 lg:py-32" aria-labelledby="gallery-heading">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                    {gallery.label}
                  </span>
                  <h2 id="gallery-heading" className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                    {gallery.title1}
                    <br />
                    {gallery.title2}
                  </h2>
                </div>
                <p className="max-w-md text-lg text-muted-foreground">{gallery.description}</p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                {gallery.items.map((item) => (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => go(nav[0])}
                    className="group block text-left"
                  >
                    <div className="mb-4 aspect-[4/5] overflow-hidden rounded-xl border border-border bg-card">
                      <Image
                        alt={item.alt}
                        w={600}
                        h={750}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                          {item.category}
                        </span>
                        <span className="text-xs text-muted-foreground">{item.year}</span>
                      </div>
                      <h3 className="text-xl font-bold transition-colors group-hover:text-primary">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-12 text-center">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="inline-flex items-center rounded-full border border-border bg-card px-6 py-3 font-semibold text-foreground transition-all hover:bg-accent hover:text-accent-foreground"
                >
                  {gallery.viewAll}
                  <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </div>
            </div>
          </section>

          {/* ── Services ─────────────────────────────────────────── */}
          <section className="py-24 lg:py-32" aria-labelledby="services-heading">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center lg:mb-20">
                <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                  {services.label}
                </span>
                <h2 id="services-heading" className="mb-6 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                  {services.title}
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-muted-foreground">{services.description}</p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                {services.items.map((item, i) => (
                  <div
                    key={item.title}
                    className="group rounded-2xl border border-border bg-muted p-8 transition-colors hover:border-primary/50 lg:p-10"
                  >
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                      {serviceIcons[i % serviceIcons.length]}
                    </div>
                    <h3 className="mb-3 text-2xl font-bold">{item.title}</h3>
                    <p className="leading-relaxed text-muted-foreground">{item.description}</p>
                    <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
                      {item.bullets.map((b) => (
                        <li key={b} className="flex items-center gap-2">
                          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-primary" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── About ────────────────────────────────────────────── */}
          <section className="bg-muted py-24 lg:py-32" aria-labelledby="about-heading">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
                <div className="relative">
                  <div className="aspect-[4/5] overflow-hidden rounded-2xl border border-border bg-card">
                    <Image
                      alt={about.imageAlt}
                      w={800}
                      h={1000}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div aria-hidden="true" className="pointer-events-none absolute -bottom-6 -right-6 h-48 w-48 rounded-full bg-primary/30 blur-2xl" />
                  <div className="absolute -left-6 -top-6 rounded-xl border border-border bg-background p-6 shadow-xl">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        {star}
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{about.award.value}</div>
                        <div className="text-sm text-muted-foreground">{about.award.label}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div>
                    <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                      {about.label}
                    </span>
                    <h2 id="about-heading" className="mb-6 text-4xl font-black tracking-tight sm:text-5xl">
                      {about.title}
                    </h2>
                    <p className="mb-4 text-xl leading-relaxed text-foreground/90">{about.lead}</p>
                    {about.paragraphs.map((p, i) => (
                      <p key={i} className="mt-4 leading-relaxed text-muted-foreground">
                        {p}
                      </p>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {about.info.map((row) => (
                      <div key={row.label} className="rounded-lg border border-border bg-background p-4">
                        <div className="mb-1 text-sm text-muted-foreground">{row.label}</div>
                        <div className={cn("font-semibold", row.accent && "text-primary")}>{row.value}</div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {about.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full border border-border bg-background px-4 py-2 text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── Testimonials ─────────────────────────────────────── */}
          <section className="py-24 lg:py-32" aria-labelledby="testimonials-heading">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                  {testimonials.label}
                </span>
                <h2 id="testimonials-heading" className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                  {testimonials.title}
                </h2>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                {testimonials.items.map((t) => (
                  <blockquote key={t.name} className="rounded-2xl border border-border bg-muted p-8">
                    <div className="mb-6 flex items-center gap-1 text-primary">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i}>{star}</span>
                      ))}
                    </div>
                    <p className="mb-6 leading-relaxed text-foreground/90">&ldquo;{t.text}&rdquo;</p>
                    <footer className="flex items-center gap-4">
                      <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border border-border bg-card">
                        <Image
                          alt={t.avatarAlt}
                          w={100}
                          h={100}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-semibold">{t.name}</div>
                        <div className="text-sm text-muted-foreground">{t.role}</div>
                      </div>
                    </footer>
                  </blockquote>
                ))}
              </div>
            </div>
          </section>

          {/* ── FAQ ──────────────────────────────────────────────── */}
          <section className="bg-muted py-24 lg:py-32" aria-labelledby="faq-heading">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                  {faq.label}
                </span>
                <h2 id="faq-heading" className="text-4xl font-black tracking-tight sm:text-5xl">
                  {faq.title}
                </h2>
              </div>

              <div className="space-y-4">
                {faq.items.map((item) => (
                  <details
                    key={item.q}
                    className="group overflow-hidden rounded-xl border border-border bg-background"
                  >
                    <summary className="flex cursor-pointer items-center justify-between p-6">
                      <span className="text-lg font-semibold">{item.q}</span>
                      <svg
                        className="h-5 w-5 text-muted-foreground transition-transform group-open:rotate-180"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="px-6 pb-6 leading-relaxed text-muted-foreground">{item.a}</div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* ── Contact CTA ──────────────────────────────────────── */}
          <section id="contact" className="relative overflow-hidden py-24 lg:py-32" aria-labelledby="cta-heading">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-primary/10" />
            <div aria-hidden="true" className="pointer-events-none absolute left-1/4 top-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
            <div aria-hidden="true" className="pointer-events-none absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />

            <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2 id="cta-heading" className="mb-6 text-4xl font-black tracking-tight sm:text-5xl lg:text-7xl">
                {contact.title1} <span className="text-primary">{contact.titleAccent}</span>
              </h2>
              <p className="mx-auto mb-10 max-w-2xl text-xl text-muted-foreground">{contact.description}</p>

              <div className="mb-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <a
                  href={`mailto:${contact.email}`}
                  className="inline-flex items-center rounded-full bg-primary px-8 py-4 text-lg font-bold text-primary-foreground transition-all hover:scale-105 hover:bg-primary/90"
                >
                  {contact.primaryCta}
                  <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
                <a
                  href={`tel:${contact.phone.replace(/[^+\d]/g, "")}`}
                  className="inline-flex items-center rounded-full border border-border bg-muted px-8 py-4 text-lg font-semibold text-foreground transition-all hover:bg-accent hover:text-accent-foreground"
                >
                  {contact.phone}
                </a>
              </div>

              <div className="flex items-center justify-center gap-6">
                {contact.socials.map((social) => (
                  <button
                    key={social}
                    type="button"
                    onClick={() => go(social)}
                    aria-label={social}
                    className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-muted text-foreground transition-all hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
                  >
                    <span className="text-sm font-semibold">{social[0]}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>
        </main>

        {/* ── Footer ───────────────────────────────────────────── */}
        <footer className="border-t border-border bg-muted py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
              <span className="text-2xl font-bold tracking-tight">
                {brandMark}
                <span className="text-primary">.</span>
              </span>
              <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
                {nav.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => go(label)}
                    className="transition-colors hover:text-foreground"
                  >
                    {label}
                  </button>
                ))}
              </nav>
              <p className="text-sm text-muted-foreground">{footer.copyright}</p>
            </div>
          </div>
        </footer>
      </div>
    )
  },
})
