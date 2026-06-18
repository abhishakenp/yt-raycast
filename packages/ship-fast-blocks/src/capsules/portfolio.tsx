import { type ReactNode, useState } from "react"
import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { Image } from "#/lib/img.tsx"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { number, string, table } from '@ship-fast/lakebed/server'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '#/components/ui/sheet.tsx'
import { Button } from '#/components/ui/button.tsx'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '#/components/ui/popover.tsx'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar.tsx'

/**
 * PortfolioKimiPage — a faithful Tailwind v4 port of a Kimi-generated personal
 * PORTFOLIO home for "Kaelen Vance — 3D Motion Designer & Art Director".
 *
 * Reproduces the source design 1:1: a deep near-black canvas (#030305) with a
 * single cyan (#00d4ff) accent, Space-Grotesk-style display headings, and
 * radial cyan glows. Section order matches the HTML exactly — fixed
 * blur-backdrop navbar, split hero with a showreel card + play overlay, a
 * client logo wordmark strip, a 3-up selected-work gallery (image thumb, copy,
 * tool tags), an about split (portrait + bio + inline stats), a 3-up services
 * grid with line-icon tiles, a 4-up metrics band, a 3-up testimonials grid with
 * monogram avatars, a radial-glow contact CTA (email + book-a-call), and a
 * 4-column footer.
 *
 * The block owns ALL layout, spacing, gradients and depth. Callers supply only
 * content; every prop carries a default sourced from the real Kimi copy, so it
 * renders complete when called positionally as PortfolioKimiPage(brand, nav).
 * All content/project photos use the alt-driven <Image>; every nav link and CTA
 * routes through `useNavigate` so nothing is a dead "#".
 */
export const PortfolioKimiPage = defineCapsule({
  name: "PortfolioKimiPage",
  description:
    "Complete dark, cinematic 3D / motion-designer / art-director PORTFOLIO home page (use as the ROOT/home route). Deep near-black canvas with a single cyan accent, radial glows, and crisp display headings. Includes a fixed blur navbar, a split hero (role eyebrow, big headline with a cyan accent word, dual CTAs, and a showreel card with a play overlay + caption), a client wordmark strip, a selected-work gallery of project cards (thumbnail, title, blurb, tool tags), an about split (portrait, multi-paragraph bio, inline stats), a services grid of line-icon capability tiles, a metrics band, a testimonials grid with monogram avatars + roles, a radial-glow contact CTA (email + book-a-call), and a 4-column footer (brand, sitemap, social, legal). Best when the prompt is a creative individual's personal site — 3D artist, motion designer, CGI/VFX, art director, animator, or visual designer — who wants a premium, moody, high-craft showcase to display reel-style work and get hired. Supply content only; the block owns all layout, gradients, and styling.",
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
        eyebrow: z.string().describe("small uppercase role line above the headline").optional(),
        headlineLead: z.string().describe("first part of the headline, plain weight").optional(),
        headlineAccent: z.string().describe("word rendered in the cyan accent").optional(),
        headlineTail: z.string().describe("remainder of the headline after the accent word").optional(),
        description: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        reelAlt: z.string().describe("alt for the showreel thumbnail image").optional(),
        reelCaption: z.string().optional(),
      })
      .optional(),
    /** Scrolling/static client + brand wordmarks. */
    clients: z.array(z.string()).optional(),
    /** Selected-work gallery: heading copy + project cards. */
    gallery: z
      .object({
        label: z.string().optional(),
        title: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
              tags: z.array(z.string()),
              alt: z.string().describe("short description of the project still"),
            }),
          )
          .optional(),
      })
      .optional(),
    /** About split: portrait + bio paragraphs + inline stats. */
    about: z
      .object({
        label: z.string().optional(),
        title: z.string().optional(),
        imageAlt: z.string().optional(),
        paragraphs: z.array(z.string()).optional(),
        stats: z.array(z.object({ value: z.string(), label: z.string() })).optional(),
      })
      .optional(),
    /** Services / capabilities grid. */
    services: z
      .object({
        label: z.string().optional(),
        title: z.string().optional(),
        description: z.string().optional(),
        items: z.array(z.object({ title: z.string(), description: z.string() })).optional(),
      })
      .optional(),
    /** Key-metrics band. */
    stats: z.array(z.object({ value: z.string(), label: z.string() })).optional(),
    /** Testimonials grid. */
    testimonials: z
      .object({
        label: z.string().optional(),
        title: z.string().optional(),
        items: z
          .array(z.object({ text: z.string(), name: z.string(), role: z.string() }))
          .optional(),
      })
      .optional(),
    /** Closing contact CTA. */
    contact: z
      .object({
        label: z.string().optional(),
        title: z.string().optional(),
        description: z.string().optional(),
        email: z.string().optional(),
        cta: z.string().optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        description: z.string().optional(),
        socials: z.array(z.string()).optional(),
        legal: z.array(z.string()).optional(),
        copyright: z.string().optional(),
        note: z.string().optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: {
    schema: {
      projects: table({
        alt: string(),
        description: string(),
        tags: string(),
        title: string(),
      }),
      favorites: table({
        projectTitle: string(),
      }),
      inquiries: table({
        email: string(),
        message: string(),
        name: string(),
        projectInterest: string(),
      }),
    },
    queries: {
      projects: ({ db }) => db.projects.orderBy('createdAt').all(),
      favoriteProjectTitles: ({ db }) =>
        new Set(db.favorites.all().map((favorite) => favorite.projectTitle)),
      inquiries: ({ db }) => db.inquiries.orderBy('createdAt').all(),
    },
    mutations: {
      toggleFavorite: ({ db }, projectTitle: string) => {
        const existingFavorite = db.favorites
          .where('projectTitle', projectTitle)
          .all()[0]

        if (existingFavorite) {
          db.favorites.delete(existingFavorite.id)
          return false
        }

        db.favorites.insert({ projectTitle })
        return true
      },
      submitInquiry: ({ db }, data: { name: string; email: string; message: string; projectInterest: string }) => {
        db.inquiries.insert(data)
        return db.inquiries.all()
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [inquiryOpen, setInquiryOpen] = useState(false)
    const [inquiryForm, setInquiryForm] = useState({ name: '', email: '', message: '', projectInterest: '' })

    const brand = props.brand ?? "Kaelen Vance"
    const brandShort = brand.split(/\s+/)[0] || brand

    const storedProjects = lakebed.useQuery('projects')
    const favoriteProjectTitles = lakebed.useQuery('favoriteProjectTitles')
    const toggleFavorite = lakebed.useMutation('toggleFavorite')
    const submitInquiry = lakebed.useMutation('submitInquiry')
    const auth = lakebed.useAuth()
    const isSignedIn = auth.isAuthenticated && !auth.isGuest
    const authEmail = auth.email || auth.user?.email
    const authPicture = auth.picture || auth.user?.picture
    const authDisplayName =
      auth.displayName || auth.user?.displayName || authEmail || 'Account'
    const authInitials =
      authDisplayName
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('') || 'ME'
    const authLabel = auth.isLoading
      ? 'Checking...'
      : isSignedIn
        ? authDisplayName
        : 'Sign in'
    const handleSignIn = () => {
      if (auth.isLoading) return

      void lakebed.signInWithGoogle()
    }
    const handleSignOut = () => {
      lakebed.signOut()
    }

    const nav = props.nav?.length ? props.nav : ["Work", "About", "Services", "Contact"]
    const navCta = props.navCta ?? "Let's Talk"

    const hero = {
      eyebrow: props.hero?.eyebrow ?? "3D Motion Designer & Art Director",
      headlineLead: props.hero?.headlineLead ?? "Crafting",
      headlineAccent: props.hero?.headlineAccent ?? "dimensional",
      headlineTail: props.hero?.headlineTail ?? "stories that move.",
      description:
        props.hero?.description ??
        "I help brands, studios, and studios build unforgettable visual worlds — from cinematic brand films to immersive product launches. Every frame is built to perform.",
      primaryCta: props.hero?.primaryCta ?? "View Selected Work",
      secondaryCta: props.hero?.secondaryCta ?? "Start a Project",
      reelAlt:
        props.hero?.reelAlt ??
        "Abstract 3D glass and light composition representing a motion design reel",
      reelCaption: props.hero?.reelCaption ?? "2024 Showreel — 2:34",
    }

    const clients = props.clients?.length
      ? props.clients
      : ["Nike", "Spotify", "Apple", "Google", "Riot Games", "Sonos", "Epic Games", "Netflix"]

    const gallery = {
      label: props.gallery?.label ?? "Selected Work",
      title: props.gallery?.title ?? "Projects that pushed boundaries",
      description:
        props.gallery?.description ??
        "A curated set of brand films, product launches, and title sequences built over the last three years.",
      items: props.gallery?.items?.length
        ? props.gallery.items
        : [
            {
              title: "Neon Drift",
              description:
                "Launch film for a cyberpunk racing title. High-speed camera logic, volumetric neons, and procedural city layouts built in C4D and rendered with Redshift.",
              tags: ["C4D", "Redshift", "Brand Film"],
              alt: "Neon Drift cyberpunk racing game brand film with neon-lit vehicles",
            },
            {
              title: "Aether",
              description:
                "Product reveal for a flagship noise-canceling headphone. Fluid sculpting, spectral lighting, and a restrained material palette in Houdini and Octane.",
              tags: ["Houdini", "Octane", "Product"],
              alt: "Aether abstract fluid sculptural forms for a luxury audio brand",
            },
            {
              title: "Pulse",
              description:
                "Main title for a sci-fi thriller series. Kinetic typography, procedural corridor generation, and aggressive camera motion in Blender and After Effects.",
              tags: ["Blender", "After Effects", "Title Sequence"],
              alt: "Pulse kinetic typography and dark corridors for a streaming title sequence",
            },
            {
              title: "Meridian",
              description:
                "Keynote opener for a cloud infrastructure platform. Real-time environmental storytelling with Lumen, Nanite, and cinematic sequencing in Unreal Engine 5.",
              tags: ["Unreal Engine 5", "Real-Time", "Keynote"],
              alt: "Meridian vast architectural landscape rendered in Unreal Engine 5",
            },
            {
              title: "Chromatica",
              description:
                "Music video for an electronic artist. Particle sims, iridescent shaders, and beat-synced camera cuts driven by X-Particles and C4D.",
              tags: ["C4D", "X-Particles", "Music Video"],
              alt: "Chromatica iridescent particle fields for an electronic music video",
            },
            {
              title: "Silica",
              description:
                "Commercial for a sustainable architecture practice. Brutalist form language, natural daylighting, and restrained camera choreography in Blender and Redshift.",
              tags: ["Blender", "Redshift", "Commercial"],
              alt: "Silica brutalist concrete forms for a sustainable architecture firm",
            },
          ],
    }

    const normalizedGalleryItems = gallery.items.map((item) => ({
      alt: item.alt,
      description: item.description,
      tags: item.tags.join(','),
      title: item.title,
    }))

    const displayProjects =
      storedProjects && storedProjects.length > 0
        ? storedProjects.map((p) => ({
            title: p.title,
            description: p.description,
            tags: p.tags.split(','),
            alt: p.alt,
          }))
        : gallery.items

    const about = {
      label: props.about?.label ?? "About",
      title: props.about?.title ?? "Obsessed with craft, driven by story.",
      imageAlt: props.about?.imageAlt ?? "Portrait of Kaelen Vance in a studio environment",
      paragraphs: props.about?.paragraphs?.length
        ? props.about.paragraphs
        : [
            "I'm Kaelen Vance, a 3D motion designer and art director based in Los Angeles. For the last eight years, I've worked with game studios, consumer brands, and entertainment platforms to turn abstract ideas into visceral, dimensional experiences.",
            "My process blends technical precision with intuitive composition. Whether it's a 15-second product loop or a 3-minute cinematic, I treat every project as an opportunity to build something memorable — something that earns a second watch.",
            "When I'm not behind a viewport, I'm usually studying cinematography, tinkering with real-time engines, or teaching procedural shading workshops.",
          ],
      stats: props.about?.stats?.length
        ? props.about.stats
        : [
            { value: "8+", label: "Years Experience" },
            { value: "120+", label: "Projects Delivered" },
            { value: "14", label: "Industry Awards" },
          ],
    }

    const services = {
      label: props.services?.label ?? "Services",
      title: props.services?.title ?? "What I can build with you",
      description:
        props.services?.description ??
        "From initial concept through final delivery, I offer end-to-end creative production tailored to campaigns, launches, and evergreen content.",
      items: props.services?.items?.length
        ? props.services.items
        : [
            {
              title: "3D Motion Design",
              description:
                "Cinematic animation for brand films, product reveals, and social campaigns. Full pipeline from modeling to comp.",
            },
            {
              title: "Art Direction",
              description:
                "Visual strategy, mood systems, and style frames that align creative output with brand positioning and campaign goals.",
            },
            {
              title: "Visual Effects",
              description:
                "Particle simulations, fluid dynamics, destruction, and atmospheric effects that integrate cleanly with live action or CG.",
            },
            {
              title: "Concept Development",
              description:
                "Early-stage ideation, storyboarding, and look exploration to lock a strong creative direction before production begins.",
            },
            {
              title: "Look Development",
              description:
                "Material authoring, lighting rigs, and rendering setups built for consistency, speed, and photoreal or stylized output.",
            },
            {
              title: "Creative Consulting",
              description:
                "Advisory for in-house teams, agency partners, and startups navigating production complexity, tooling, or pipeline setup.",
            },
          ],
    }

    const stats = props.stats?.length
      ? props.stats
      : [
          { value: "8+", label: "Years Experience" },
          { value: "120+", label: "Projects Shipped" },
          { value: "14", label: "Awards Won" },
          { value: "3B+", label: "Views Generated" },
        ]

    const testimonials = {
      label: props.testimonials?.label ?? "Testimonials",
      title: props.testimonials?.title ?? "Words from collaborators",
      items: props.testimonials?.items?.length
        ? props.testimonials.items
        : [
            {
              text: "Kaelen has an almost unfair ability to translate a vague creative brief into something that makes the room go quiet. The Aether launch outperformed every benchmark we had.",
              name: "Jordan Meyers",
              role: "Creative Director, Sonos",
            },
            {
              text: "We brought Kaelen in to art-direct a tricky title sequence under an impossible timeline. The work was elegant, fast, and required almost zero revision. A true pro.",
              name: "Sara Lin",
              role: "Executive Producer, Netflix",
            },
            {
              text: "His technical depth in Houdini and real-time pipelines saved us months of R&D. More importantly, the final frames were beautiful and on-brand without feeling safe.",
              name: "David Rhodes",
              role: "VP Brand, Riot Games",
            },
          ],
    }

    const contact = {
      label: props.contact?.label ?? "Start a Project",
      title: props.contact?.title ?? "Have a story that needs dimension?",
      description:
        props.contact?.description ??
        "I'm currently accepting new projects for Q3 2025. If you have a campaign, launch, or film that needs bold 3D motion, let's talk.",
      email: props.contact?.email ?? "hello@kaelenvance.com",
      cta: props.contact?.cta ?? "Book a Call",
    }

    const footer = {
      description:
        props.footer?.description ??
        "3D Motion Designer & Art Director crafting dimensional stories for brands, studios, and screens.",
      socials: props.footer?.socials?.length
        ? props.footer.socials
        : ["Vimeo", "Instagram", "LinkedIn", "Behance"],
      legal: props.footer?.legal?.length ? props.footer.legal : ["Privacy Policy", "Terms of Use"],
      copyright:
        props.footer?.copyright ?? `© ${new Date().getFullYear()} ${brand}. All rights reserved.`,
      note: props.footer?.note ?? "Designed & built with obsessive care.",
    }

    // Initials for the testimonial monogram avatars (decorative brand-style asset).
    const initials = (name: string) =>
      name
        .split(/\s+/)
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()

    // Line icons for the services grid (mirrors the source SVG set, in order).
    const serviceIcons: ReactNode[] = [
      <svg key="layers" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5.5 w-5.5" aria-hidden="true">
        <path d="M12 2 2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>,
      <svg key="info" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5.5 w-5.5" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4" />
        <path d="M12 8h.01" />
      </svg>,
      <svg key="shield" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5.5 w-5.5" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>,
      <svg key="target" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5.5 w-5.5" aria-hidden="true">
        <path d="M2 12h6" />
        <path d="M22 12h-6" />
        <path d="M12 2v6" />
        <path d="M12 22v-6" />
        <circle cx="12" cy="12" r="3" />
      </svg>,
      <svg key="eye" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5.5 w-5.5" aria-hidden="true">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>,
      <svg key="users" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5.5 w-5.5" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>,
    ]

    const HeartIcon = ({ active = false }: { active?: boolean }) => (
      <svg
        className={cn(
          'size-5',
          active ? 'text-primary-foreground' : 'text-foreground',
        )}
        fill={active ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    )

    const ChevronDown = () => (
      <svg
        className="size-5 text-muted-foreground group-open:rotate-180 transition-transform"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    )

    const ArrowRight = () => (
      <svg
        className="size-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
    )

    const handleInquirySubmit = (e: React.FormEvent) => {
      e.preventDefault()
      void submitInquiry(inquiryForm)
      setInquiryForm({ name: '', email: '', message: '', projectInterest: '' })
      setInquiryOpen(false)
    }

    return (
      <div
        className={cn(
          "relative w-full overflow-x-hidden bg-background text-foreground antialiased [font-feature-settings:'ss01']",
          props.className,
        )}
      >
        {/* ── Navbar ──────────────────────────────────────────────── */}
        <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/85 backdrop-blur-xl">
          <div className="mx-auto flex h-[72px] max-w-[1200px] items-center justify-between px-6">
            <button
              type="button"
              onClick={() => go(nav[0])}
              aria-label={`${brand} home`}
              className="text-xl font-bold tracking-tight"
            >
              {brandShort}
              <span className="text-primary">.</span>
            </button>
            <ul className="hidden items-center gap-9 md:flex">
              {nav.map((label) => (
                <li key={label}>
                  <button
                    type="button"
                    onClick={() => go(label)}
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-3">
              {isSignedIn ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      aria-label="Open account menu"
                      className="hidden h-10 max-w-48 items-center gap-2 rounded-full border border-border bg-background/90 px-2 py-1 text-foreground shadow-sm transition hover:border-foreground/20 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:inline-flex"
                    >
                      <Avatar
                        size="sm"
                        className="ring-2 ring-background"
                        aria-hidden="true"
                      >
                        {authPicture ? (
                          <AvatarImage
                            src={authPicture}
                            alt={authDisplayName}
                          />
                        ) : null}
                        <AvatarFallback className="bg-foreground text-[0.65rem] font-bold text-background">
                          {authInitials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden max-w-24 truncate text-sm font-semibold md:block">
                        {authDisplayName}
                      </span>
                      <ChevronDown />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="end"
                    sideOffset={10}
                    className="w-72 overflow-hidden rounded-xl border-border bg-background p-0 shadow-xl"
                  >
                    <div className="bg-muted/40 px-4 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar size="lg" className="ring-2 ring-background">
                          {authPicture ? (
                            <AvatarImage
                              src={authPicture}
                              alt={authDisplayName}
                            />
                          ) : null}
                          <AvatarFallback className="bg-foreground text-sm font-bold text-background">
                            {authInitials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-foreground">
                            {authDisplayName}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {authEmail ?? 'Signed in to this session'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <button
                        type="button"
                        onClick={() => go('Favorites')}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        Favorites
                        <ArrowRight />
                      </button>
                      <button
                        type="button"
                        onClick={() => go('Inquiries')}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        Inquiries
                        <ArrowRight />
                      </button>
                    </div>
                    <div className="border-t border-border p-2">
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="flex w-full items-center justify-center rounded-lg bg-foreground px-3 py-2 text-sm font-semibold text-background transition-colors hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        Sign out
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>
              ) : (
                <button
                  type="button"
                  onClick={handleSignIn}
                  disabled={auth.isLoading}
                  aria-label="Sign in with Google"
                  className="hidden h-10 items-center gap-2 rounded-full bg-foreground px-4 text-sm font-semibold text-background shadow-sm transition hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 sm:inline-flex"
                >
                  <span className="grid size-5 place-items-center rounded-full bg-background text-xs font-black text-foreground">
                    G
                  </span>
                  <span>{authLabel}</span>
                </button>
              )}
              <Sheet open={inquiryOpen} onOpenChange={setInquiryOpen}>
                <SheetTrigger asChild>
                  <button
                    type="button"
                    onClick={() => setInquiryOpen(true)}
                    className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    {navCta}
                  </button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-full gap-0 p-0 sm:max-w-md"
                >
                  <SheetHeader className="border-b border-border p-6">
                    <SheetTitle className="text-xl">Start a Project</SheetTitle>
                    <SheetDescription>
                      Send an inquiry and I'll get back to you within 24 hours.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto px-6 py-5">
                    <form onSubmit={handleInquirySubmit} className="space-y-4">
                      <div>
                        <label htmlFor="inquiry-name" className="mb-2 block text-sm font-medium text-foreground">
                          Name
                        </label>
                        <input
                          id="inquiry-name"
                          type="text"
                          required
                          value={inquiryForm.name}
                          onChange={(e) => setInquiryForm({ ...inquiryForm, name: e.target.value })}
                          className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          placeholder="Your name"
                        />
                      </div>
                      <div>
                        <label htmlFor="inquiry-email" className="mb-2 block text-sm font-medium text-foreground">
                          Email
                        </label>
                        <input
                          id="inquiry-email"
                          type="email"
                          required
                          value={inquiryForm.email}
                          onChange={(e) => setInquiryForm({ ...inquiryForm, email: e.target.value })}
                          className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          placeholder="your@email.com"
                        />
                      </div>
                      <div>
                        <label htmlFor="inquiry-project" className="mb-2 block text-sm font-medium text-foreground">
                          Project Interest
                        </label>
                        <input
                          id="inquiry-project"
                          type="text"
                          value={inquiryForm.projectInterest}
                          onChange={(e) => setInquiryForm({ ...inquiryForm, projectInterest: e.target.value })}
                          className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          placeholder="What type of project?"
                        />
                      </div>
                      <div>
                        <label htmlFor="inquiry-message" className="mb-2 block text-sm font-medium text-foreground">
                          Message
                        </label>
                        <textarea
                          id="inquiry-message"
                          required
                          rows={4}
                          value={inquiryForm.message}
                          onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })}
                          className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                          placeholder="Tell me about your project..."
                        />
                      </div>
                    </form>
                  </div>
                  <SheetFooter className="border-t border-border p-6">
                    <Button
                      type="button"
                      className="w-full rounded-full"
                      onClick={handleInquirySubmit}
                    >
                      Send Inquiry
                    </Button>
                    <SheetClose asChild>
                      <Button
                        type="button"
                        variant="secondary"
                        className="w-full rounded-full"
                      >
                        Cancel
                      </Button>
                    </SheetClose>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </header>

        <main>
          {/* ── Hero ──────────────────────────────────────────────── */}
          <header className="relative overflow-hidden pt-[140px] pb-20 lg:pt-[180px] lg:pb-[100px]">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_500px_at_80%_-10%,var(--primary),transparent),radial-gradient(700px_400px_at_10%_60%,var(--primary),transparent)] opacity-[0.08]"
            />
            <div className="relative mx-auto max-w-[1200px] px-6">
              <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
                <div>
                  <p className="mb-4 inline-block text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                    {hero.eyebrow}
                  </p>
                  <h1 className="mb-5 text-[clamp(2.6rem,6vw,4.5rem)] font-bold leading-[1.15] tracking-[-0.03em]">
                    {hero.headlineLead} <span className="text-primary">{hero.headlineAccent}</span>
                    <br />
                    {hero.headlineTail}
                  </h1>
                  <p className="mb-8 max-w-[520px] text-lg leading-[1.7] text-muted-foreground">
                    {hero.description}
                  </p>
                  <div className="flex flex-wrap gap-3.5">
                    <button
                      type="button"
                      onClick={() => go(hero.primaryCta)}
                      className="inline-flex items-center justify-center gap-2.5 rounded-full bg-primary px-7 py-3.5 text-[0.9375rem] font-semibold text-primary-foreground transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                    >
                      {hero.primaryCta}
                    </button>
                    <button
                      type="button"
                      onClick={() => go(hero.secondaryCta)}
                      className="inline-flex items-center justify-center gap-2.5 rounded-full border border-border bg-secondary px-7 py-3.5 text-[0.9375rem] font-semibold text-secondary-foreground transition-all duration-300 hover:-translate-y-0.5 hover:border-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    >
                      {hero.secondaryCta}
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => go(hero.primaryCta)}
                  aria-label="Watch showreel"
                  className="group relative block aspect-[16/10] w-full overflow-hidden rounded-2xl border border-border bg-card text-left shadow-[0_24px_64px_rgba(0,0,0,0.55)]"
                >
                  <Image
                    alt={hero.reelAlt}
                    w={1600}
                    h={1000}
                    loading="eager"
                    className="h-full w-full object-cover opacity-90 transition-all duration-700 group-hover:scale-[1.04] group-hover:opacity-100"
                  />
                  <span className="absolute inset-0 flex items-center justify-center bg-background/25 transition-colors duration-300 group-hover:bg-background/15">
                    <span className="flex h-[72px] w-[72px] items-center justify-center rounded-full border border-foreground/20 bg-foreground/10 backdrop-blur-md transition-all duration-300 group-hover:scale-105 group-hover:bg-foreground/20">
                      <svg viewBox="0 0 24 24" className="ml-1 h-6 w-6 fill-foreground" aria-hidden="true">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </span>
                  </span>
                  <span className="absolute bottom-4 left-4 rounded-full bg-background/45 px-3 py-1.5 text-xs font-medium text-foreground/85 backdrop-blur-sm">
                    {hero.reelCaption}
                  </span>
                </button>
              </div>
            </div>
          </header>

          {/* ── Client logos ─────────────────────────────────────── */}
          <section aria-label="Trusted by leading brands" className="border-y border-border bg-card py-12">
            <div className="mx-auto max-w-[1200px] px-6">
              <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-9 opacity-60 md:gap-x-16 md:gap-y-10">
                {clients.map((client) => (
                  <button
                    key={client}
                    type="button"
                    onClick={() => go(nav[0])}
                    className="whitespace-nowrap text-[1.05rem] font-semibold tracking-[-0.01em] text-muted-foreground transition-colors hover:text-foreground md:text-[1.15rem]"
                  >
                    {client}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* ── Selected Work gallery ────────────────────────────── */}
          <section className="py-24" aria-labelledby="gallery-heading">
            <div className="mx-auto max-w-[1200px] px-6">
              <div className="mb-14 flex flex-col gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                  {gallery.label}
                </p>
                <h2 id="gallery-heading" className="text-[clamp(1.8rem,4vw,2.8rem)] font-bold leading-[1.15] tracking-[-0.02em]">
                  {gallery.title}
                </h2>
                <p className="max-w-[560px] text-[1.05rem] text-muted-foreground">{gallery.description}</p>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {displayProjects.map((item) => {
                  const isFavorite =
                    favoriteProjectTitles?.has(item.title) ?? false

                  return (
                    <button
                      key={item.title}
                      type="button"
                      onClick={() => go(nav[0])}
                      className="group relative block overflow-hidden rounded-2xl border border-border bg-card text-left transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_24px_64px_rgba(0,0,0,0.55)]"
                    >
                      <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-muted to-card">
                        <Image
                          alt={item.alt}
                          w={1200}
                          h={750}
                          loading="lazy"
                          className="h-full w-full object-cover opacity-85 transition-all duration-700 group-hover:scale-105 group-hover:opacity-100"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            void toggleFavorite(item.title)
                          }}
                          aria-pressed={isFavorite}
                          aria-label={
                            isFavorite
                              ? `Remove ${item.title} from favorites`
                              : `Add ${item.title} to favorites`
                          }
                          className={cn(
                            'absolute top-3 right-3 grid size-10 place-items-center rounded-full shadow-md transition-all hover:scale-105 group-hover:opacity-100',
                            isFavorite
                              ? 'bg-primary text-primary-foreground opacity-100'
                              : 'bg-background/90 text-foreground opacity-0 hover:bg-background',
                          )}
                        >
                          <HeartIcon active={isFavorite} />
                        </button>
                      </div>
                      <div className="p-6">
                        <h3 className="mb-1.5 text-xl font-semibold">{item.title}</h3>
                        <p className="text-sm leading-[1.6] text-muted-foreground">{item.description}</p>
                        <div className="mt-3.5 flex flex-wrap gap-2">
                          {item.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full border border-border bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </section>

          {/* ── About ────────────────────────────────────────────── */}
          <section className="border-y border-border bg-card py-24" aria-labelledby="about-heading">
            <div className="mx-auto max-w-[1200px] px-6">
              <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
                <div className="aspect-[4/5] overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-muted to-card">
                  <Image
                    alt={about.imageAlt}
                    w={800}
                    h={1000}
                    loading="lazy"
                    className="h-full w-full object-cover opacity-90"
                  />
                </div>
                <div>
                  <p className="mb-4 inline-block text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                    {about.label}
                  </p>
                  <h2 id="about-heading" className="mb-5 text-[clamp(1.8rem,4vw,2.6rem)] font-bold leading-[1.15] tracking-[-0.02em]">
                    {about.title}
                  </h2>
                  {about.paragraphs.map((p, i) => (
                    <p key={i} className="mb-4.5 text-[1.05rem] leading-[1.75] text-muted-foreground">
                      {p}
                    </p>
                  ))}
                  <div className="mt-8 flex flex-wrap gap-10">
                    {about.stats.map((s) => (
                      <div key={s.label}>
                        <strong className="block text-[1.75rem] font-bold leading-none text-primary">
                          {s.value}
                        </strong>
                        <span className="mt-1.5 block text-[0.8125rem] text-muted-foreground">
                          {s.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── Services ─────────────────────────────────────────── */}
          <section className="py-24" aria-labelledby="services-heading">
            <div className="mx-auto max-w-[1200px] px-6">
              <div className="mb-14 max-w-[560px]">
                <p className="mb-4 inline-block text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                  {services.label}
                </p>
                <h2 id="services-heading" className="mb-3 text-[clamp(1.8rem,4vw,2.8rem)] font-bold leading-[1.15] tracking-[-0.02em]">
                  {services.title}
                </h2>
                <p className="text-[1.05rem] text-muted-foreground">{services.description}</p>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {services.items.map((item, i) => (
                  <div
                    key={item.title}
                    className="rounded-xl border border-border bg-card p-8 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40"
                  >
                    <div className="mb-4.5 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      {serviceIcons[i % serviceIcons.length]}
                    </div>
                    <h3 className="mb-2 text-[1.1rem] font-semibold">{item.title}</h3>
                    <p className="text-[0.9375rem] leading-[1.65] text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Stats band ───────────────────────────────────────── */}
          <section aria-label="Key metrics" className="border-y border-border bg-muted py-[72px]">
            <div className="mx-auto max-w-[1200px] px-6">
              <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4 md:gap-6">
                {stats.map((s) => (
                  <div key={s.label}>
                    <strong className="mb-2 block text-[2.25rem] font-bold leading-none text-primary">
                      {s.value}
                    </strong>
                    <span className="text-sm text-muted-foreground">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Testimonials ─────────────────────────────────────── */}
          <section className="py-24" aria-labelledby="testimonials-heading">
            <div className="mx-auto max-w-[1200px] px-6">
              <div className="mb-14">
                <p className="mb-4 inline-block text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                  {testimonials.label}
                </p>
                <h2 id="testimonials-heading" className="text-[clamp(1.8rem,4vw,2.8rem)] font-bold leading-[1.15] tracking-[-0.02em]">
                  {testimonials.title}
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {testimonials.items.map((t) => (
                  <blockquote
                    key={t.name}
                    className="rounded-xl border border-border bg-card p-8 transition-colors duration-300 hover:border-primary/40"
                  >
                    <p className="mb-6 text-[1.05rem] leading-[1.7] text-foreground">
                      &ldquo;{t.text}&rdquo;
                    </p>
                    <footer className="flex items-center gap-3.5">
                      <div
                        aria-hidden="true"
                        className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-muted to-secondary text-sm font-bold text-primary"
                      >
                        {initials(t.name)}
                      </div>
                      <div>
                        <div className="text-[0.9375rem] font-semibold">{t.name}</div>
                        <div className="text-[0.8125rem] text-muted-foreground">{t.role}</div>
                      </div>
                    </footer>
                  </blockquote>
                ))}
              </div>
            </div>
          </section>

          {/* ── Contact CTA ──────────────────────────────────────── */}
          <section className="relative overflow-hidden py-[100px]" aria-labelledby="cta-heading">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(800px_400px_at_20%_120%,var(--primary),transparent),radial-gradient(600px_300px_at_90%_-20%,var(--primary),transparent)] opacity-[0.08]"
            />
            <div className="relative mx-auto max-w-[720px] px-6 text-center">
              <p className="mb-4 inline-block text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                {contact.label}
              </p>
              <h2 id="cta-heading" className="mb-4 text-[clamp(1.8rem,4vw,2.8rem)] font-bold leading-[1.15] tracking-[-0.02em]">
                {contact.title}
              </h2>
              <p className="mb-9 text-lg leading-[1.7] text-muted-foreground">{contact.description}</p>
              <div className="flex flex-wrap justify-center gap-3.5">
                <a
                  href={`mailto:${contact.email}`}
                  className="inline-flex items-center justify-center gap-2.5 rounded-full bg-primary px-7 py-3.5 text-[0.9375rem] font-semibold text-primary-foreground transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                >
                  {contact.email}
                </a>
                <button
                  type="button"
                  onClick={() => setInquiryOpen(true)}
                  className="inline-flex items-center justify-center gap-2.5 rounded-full border border-border bg-secondary px-7 py-3.5 text-[0.9375rem] font-semibold text-secondary-foreground transition-all duration-300 hover:-translate-y-0.5 hover:border-muted-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  {contact.cta}
                </button>
              </div>
            </div>
          </section>
        </main>

        {/* ── Footer ───────────────────────────────────────────── */}
        <footer className="border-t border-border pt-14 pb-8">
          <div className="mx-auto max-w-[1200px] px-6">
            <div className="mb-12 grid grid-cols-1 gap-10 md:grid-cols-[2fr_1fr_1fr_1fr]">
              <div>
                <div className="mb-3 text-xl font-bold tracking-tight">
                  {brandShort}
                  <span className="text-primary">.</span>
                </div>
                <p className="max-w-[300px] text-[0.9375rem] leading-[1.65] text-muted-foreground">
                  {footer.description}
                </p>
              </div>
              <div>
                <h4 className="mb-4.5 text-sm font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Sitemap
                </h4>
                <ul className="flex flex-col gap-2.5">
                  {nav.map((label) => (
                    <li key={label}>
                      <button
                        type="button"
                        onClick={() => go(label)}
                        className="text-[0.9375rem] text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {label}
                      </button>
                    </li>
                  ))}
                  {isSignedIn && (
                    <>
                      <li>
                        <button
                          type="button"
                          onClick={() => go('Favorites')}
                          className="text-[0.9375rem] text-muted-foreground transition-colors hover:text-foreground"
                        >
                          Favorites
                        </button>
                      </li>
                      <li>
                        <button
                          type="button"
                          onClick={() => go('Inquiries')}
                          className="text-[0.9375rem] text-muted-foreground transition-colors hover:text-foreground"
                        >
                          Inquiries
                        </button>
                      </li>
                    </>
                  )}
                </ul>
              </div>
              <div>
                <h4 className="mb-4.5 text-sm font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Social
                </h4>
                <ul className="flex flex-col gap-2.5">
                  {footer.socials.map((social) => (
                    <li key={social}>
                      <button
                        type="button"
                        onClick={() => go(contact.cta)}
                        className="text-[0.9375rem] text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {social}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="mb-4.5 text-sm font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Legal
                </h4>
                <ul className="flex flex-col gap-2.5">
                  {footer.legal.map((item) => (
                    <li key={item}>
                      <button
                        type="button"
                        onClick={() => go(item)}
                        className="text-[0.9375rem] text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {item}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-[0.8125rem] text-muted-foreground md:flex-row">
              <span>{footer.copyright}</span>
              <span>{footer.note}</span>
            </div>
          </div>
        </footer>
      </div>
    )
  },
})
