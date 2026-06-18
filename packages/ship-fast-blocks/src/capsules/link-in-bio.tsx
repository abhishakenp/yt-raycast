import { useState, type ReactNode } from "react"
import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"
import { number, string, table } from "@ship-fast/lakebed/server"
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "#/components/ui/popover.tsx"
import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar.tsx"

/**
 * LinkInBioKimiPage — a complete, self-contained "link in bio" / link-hub page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated minimal link-in-bio design:
 * a calm, light, paper-toned single-column layout centered in a narrow card-
 * width column. It opens with a circular avatar headshot (with an "available"
 * status dot), a name, a role/tagline, and a short bio, then stacks a column
 * of large tappable link buttons (each with a leading icon tile, title +
 * subtitle, and a trailing open-link arrow or "New" pill), a row of round
 * social icon buttons, a "Featured Work" card with a 16:9 image, and a slim
 * copyright footer.
 *
 * The base surface is intentionally light/neutral (stone-50 → background) to
 * preserve Kimi's soft mood; white cards map to `card`, the emerald presence
 * dot to `primary`, and the amber "New" badge to `secondary`. Every link /
 * social / footer item routes through `useNavigate` (never a dead "#"). The
 * avatar and featured image use the alt-driven <Image> component (never a raw
 * src). Callers supply ONLY content data; rich defaults make it render great
 * with no props at all.
 */
export const LinkInBioKimiPage = defineCapsule({
  name: "LinkInBioKimiPage",
  description:
    "Complete minimal LINK-IN-BIO / link-hub / bio-link page — a single, centered, narrow-column profile page (think Linktree / Bento / 'link in bio') with a calm, light, paper-toned aesthetic. Includes a circular avatar headshot with an online/available status dot, a name + role/tagline + short bio, a vertical stack of large tappable link-buttons (each with a leading icon tile, a title and subtitle, and a trailing open-arrow or 'New' badge), a row of round social icon buttons (Twitter/X, GitHub, Dribbble, LinkedIn), a 'Featured Work' card with a wide image and caption, and a small copyright footer. Use as the ROOT/home page for a personal landing page, creator or influencer link hub, freelancer/portfolio bio link, 'all my links in one place' page, social-profile splash, or a mobile-first contact/links page. Supply content only — brand/name, nav, profile, links, socials, featured, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand / person name shown as the profile heading and in the footer. */
    brand: z.string().optional(),
    /** Nav / section labels (used for routing keys). */
    nav: z.array(z.string()).optional(),
    /** Profile / identity block. */
    profile: z
      .object({
        avatarAlt: z.string().optional(),
        status: z.string().optional(),
        role: z.string().optional(),
        bio: z.string().optional(),
      })
      .optional(),
    /** Primary stacked link buttons. */
    links: z
      .array(
        z.object({
          /** Icon key: globe | shop | mail | calendar. */
          icon: z.enum(["globe", "shop", "mail", "calendar"]),
          title: z.string(),
          subtitle: z.string(),
          /** Optional pill (e.g. "New") shown instead of the trailing arrow. */
          badge: z.string().optional(),
        }),
      )
      .optional(),
    /** Round social icon buttons. */
    socials: z
      .array(
        z.object({
          /** Icon key: twitter | github | dribbble | linkedin. */
          icon: z.enum(["twitter", "github", "dribbble", "linkedin"]),
          label: z.string(),
        }),
      )
      .optional(),
    /** Featured-work card. */
    featured: z
      .object({
        heading: z.string().optional(),
        imageAlt: z.string().optional(),
        title: z.string().optional(),
        description: z.string().optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        note: z.string().optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: {
    schema: {
      savedLinks: table({
        linkTitle: string(),
        linkSubtitle: string(),
        icon: string(),
      }),
      contactInquiries: table({
        name: string(),
        email: string(),
        message: string(),
      }),
    },
    queries: {
      savedLinks: ({ db }) => db.savedLinks.orderBy('createdAt').all(),
      contactInquiries: ({ db }) => db.contactInquiries.orderBy('createdAt').all(),
    },
    mutations: {
      saveLink: ({ db }, linkTitle: string, linkSubtitle: string, icon: string) => {
        db.savedLinks.insert({ linkTitle, linkSubtitle, icon })
        return db.savedLinks.all()
      },
      removeSavedLink: ({ db }, id: string) => {
        db.savedLinks.delete(id)
        return db.savedLinks.all()
      },
      submitInquiry: ({ db }, name: string, email: string, message: string) => {
        db.contactInquiries.insert({ name, email, message })
        return db.contactInquiries.all()
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [savedLinksOpen, setSavedLinksOpen] = useState(false)
    const [contactOpen, setContactOpen] = useState(false)
    const brand = props.brand ?? "Sarah Chen"
    const nav = props.nav?.length
      ? props.nav
      : ["Portfolio", "UI Kit Shop", "Newsletter", "Book a Call"]

    const avatarAlt =
      props.profile?.avatarAlt ??
      "professional headshot of a smiling woman with dark hair wearing a minimal cream sweater"
    const status = props.profile?.status ?? "Available for work"
    const role = props.profile?.role ?? "Design Engineer at Notion"
    const bio =
      props.profile?.bio ??
      "Crafting thoughtful interfaces. Writing about design systems, React, and the craft of digital products."

    const links = props.links?.length
      ? props.links
      : [
          {
            icon: "globe" as const,
            title: "Portfolio",
            subtitle: "sarahchen.design",
          },
          {
            icon: "shop" as const,
            title: "UI Kit Shop",
            subtitle: "Figma templates & icons",
            badge: "New",
          },
          {
            icon: "mail" as const,
            title: "Newsletter",
            subtitle: "12,400+ subscribers",
          },
          {
            icon: "calendar" as const,
            title: "Book a Call",
            subtitle: "30 min consultation — $150",
          },
        ]

    const socials = props.socials?.length
      ? props.socials
      : [
          { icon: "twitter" as const, label: "Twitter" },
          { icon: "github" as const, label: "GitHub" },
          { icon: "dribbble" as const, label: "Dribbble" },
          { icon: "linkedin" as const, label: "LinkedIn" },
        ]

    const featuredHeading = props.featured?.heading ?? "Featured Work"
    const featuredImageAlt =
      props.featured?.imageAlt ??
      "abstract minimalist 3D render of soft pastel geometric shapes with smooth shadows"
    const featuredTitle = props.featured?.title ?? "Notion Calendar Launch"
    const featuredDesc =
      props.featured?.description ??
      "Design system, motion, and landing experience"

    const footerNote = props.footer?.note ?? "All rights reserved."

    const savedLinks = lakebed.useQuery('savedLinks')
    const contactInquiries = lakebed.useQuery('contactInquiries')
    const saveLink = lakebed.useMutation('saveLink')
    const removeSavedLink = lakebed.useMutation('removeSavedLink')
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

    const linkIcons: Record<string, ReactNode> = {
      globe: (
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
          <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      ),
      shop: (
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
          <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
      mail: (
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
      ),
      calendar: (
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
          <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    }

    const socialIcons: Record<string, ReactNode> = {
      twitter: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      github: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
          />
        </svg>
      ),
      dribbble: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c5.51 0 10-4.48 10-10S17.51 2 12 2zm6.605 4.61a8.502 8.502 0 011.93 5.314c-.281-.054-3.101-.629-5.943-.271-.065-.141-.12-.293-.184-.445a25.416 25.416 0 00-.564-1.236c3.145-1.28 4.577-3.124 4.761-3.362zM12 3.475c2.17 0 4.154.813 5.662 2.148-.152.216-1.443 1.941-4.48 3.08-1.399-2.57-2.95-4.675-3.189-5A8.687 8.687 0 0112 3.475zm-3.633.803a53.896 53.896 0 013.167 4.935c-3.992 1.063-7.517 1.04-7.896 1.04a8.581 8.581 0 014.729-5.975zM3.453 12.01v-.26c.37.01 4.512.065 8.775-1.215.245.477.477.965.694 1.453-.109.033-.228.065-.336.098-4.404 1.42-6.747 5.303-6.942 5.629a8.522 8.522 0 01-2.19-5.705zM12 20.547a8.482 8.482 0 01-5.239-1.8c.152-.315 1.888-3.656 6.703-5.337.022-.01.033-.01.054-.022a35.318 35.318 0 011.823 6.475 8.4 8.4 0 01-3.341.684zm4.761-1.465c-.086-.52-.542-3.015-1.659-6.084 2.679-.423 5.022.271 5.314.369a8.468 8.468 0 01-3.655 5.715z"
          />
        </svg>
      ),
      linkedin: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
          />
        </svg>
      ),
    }

    const ExternalArrow = () => (
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
        <path d="M7 17L17 7M17 7H7M17 7v10" />
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

    const BookmarkIcon = ({ active = false }: { active?: boolean }) => (
      <svg
        className={cn('size-5', active ? 'text-primary' : 'text-muted-foreground')}
        fill={active ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    )

    return (
      <div
        className={cn(
          "min-h-svh bg-background text-foreground antialiased",
          props.className,
        )}
      >
        {/* Header with auth and saved links */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80">
          <div className="mx-auto flex h-14 max-w-md items-center justify-between px-6">
            <span className="text-sm font-semibold text-foreground">{brand}</span>
            <div className="flex items-center gap-2">
              {isSignedIn ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      aria-label="Open account menu"
                      className="flex h-9 items-center gap-2 rounded-full border border-border bg-background/90 px-2 py-1 text-foreground shadow-sm transition hover:border-foreground/20 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <Avatar
                        size="sm"
                        className="ring-2 ring-background"
                        aria-hidden="true"
                      >
                        {authPicture ? (
                          <AvatarImage src={authPicture} alt={authDisplayName} />
                        ) : null}
                        <AvatarFallback className="bg-foreground text-[0.65rem] font-bold text-background">
                          {authInitials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="max-w-16 truncate text-xs font-semibold">
                        {authDisplayName}
                      </span>
                      <ChevronDown />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="end"
                    sideOffset={10}
                    className="w-64 overflow-hidden rounded-xl border-border bg-background p-0 shadow-xl"
                  >
                    <div className="bg-muted/40 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar size="md" className="ring-2 ring-background">
                          {authPicture ? (
                            <AvatarImage src={authPicture} alt={authDisplayName} />
                          ) : null}
                          <AvatarFallback className="bg-foreground text-xs font-bold text-background">
                            {authInitials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-foreground">
                            {authDisplayName}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {authEmail ?? 'Signed in'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
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
                  className="flex h-9 items-center gap-2 rounded-full bg-foreground px-3 text-xs font-semibold text-background shadow-sm transition hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60"
                >
                  <span className="grid size-4 place-items-center rounded-full bg-background text-[0.6rem] font-black text-foreground">
                    G
                  </span>
                  <span>{authLabel}</span>
                </button>
              )}
              <Sheet open={savedLinksOpen} onOpenChange={setSavedLinksOpen}>
                <SheetTrigger asChild>
                  <button
                    type="button"
                    aria-label="Saved links"
                    className="relative flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <BookmarkIcon />
                    {savedLinks && savedLinks.length > 0 ? (
                      <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-foreground text-[0.625rem] font-bold text-background">
                        {savedLinks.length}
                      </span>
                    ) : null}
                  </button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-sm">
                  <SheetHeader className="border-b border-border p-6">
                    <SheetTitle className="text-xl">Saved Links</SheetTitle>
                    <SheetDescription>
                      {savedLinks && savedLinks.length > 0
                        ? `${savedLinks.length} link${savedLinks.length === 1 ? '' : 's'} saved.`
                        : 'No saved links yet.'}
                    </SheetDescription>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto px-6 py-5">
                    {savedLinks && savedLinks.length > 0 ? (
                      <div className="space-y-3">
                        {savedLinks.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between rounded-lg border border-border bg-card p-4"
                          >
                            <div className="flex items-center gap-3">
                              <span className="grid size-8 place-items-center rounded-lg bg-muted text-muted-foreground">
                                {linkIcons[item.icon] || linkIcons.globe}
                              </span>
                              <div>
                                <p className="text-sm font-semibold text-card-foreground">
                                  {item.linkTitle}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {item.linkSubtitle}
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => void removeSavedLink(item.id)}
                              aria-label={`Remove ${item.linkTitle} from saved`}
                              className="text-muted-foreground transition-colors hover:text-destructive"
                            >
                              <svg
                                className="size-4"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                viewBox="0 0 24 24"
                              >
                                <path d="M18 6L6 18M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 px-6 text-center">
                        <BookmarkIcon />
                        <p className="mt-3 text-sm font-semibold text-foreground">
                          No saved links
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Bookmark links to save them for later.
                        </p>
                      </div>
                    )}
                  </div>
                  <SheetFooter className="border-t border-border p-6">
                    <SheetClose asChild>
                      <Button type="button" variant="outline" className="w-full rounded-full">
                        Close
                      </Button>
                    </SheetClose>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </header>

        {/* SECTION:profile + links + socials + featured */}
        <main className="mx-auto max-w-md px-6 py-16 sm:py-20 lg:py-24">
          {/* Avatar & identity */}
          <div className="mb-10 text-center">
            <div className="relative mb-5 inline-block">
              <Image
                alt={avatarAlt}
                w={200}
                h={200}
                className="size-24 rounded-full object-cover shadow-sm ring-4 ring-background sm:size-28"
              />
              <span
                className="absolute bottom-1 right-1 size-4 rounded-full bg-primary ring-2 ring-background"
                aria-label={status}
              />
            </div>

            <h1 className="mb-2 text-2xl font-semibold text-foreground sm:text-3xl">
              {brand}
            </h1>
            <p className="text-sm font-light text-muted-foreground sm:text-base">
              {role}
            </p>
            <p className="mx-auto mt-3 max-w-xs text-base leading-relaxed text-foreground/80">
              {bio}
            </p>
          </div>

          {/* Primary links */}
          <nav aria-label="Primary links" className="mb-10 space-y-3">
            {links.map((link, i) => {
              const isSaved =
                savedLinks?.some(
                  (saved) =>
                    saved.linkTitle === link.title &&
                    saved.linkSubtitle === link.subtitle,
                ) ?? false

              return (
                <button
                  key={link.title}
                  type="button"
                  onClick={() => go(nav[i] ?? link.title)}
                  className="group flex w-full items-center justify-between rounded-xl border border-border/60 bg-card px-5 py-4 text-left shadow-sm transition-all duration-200 hover:border-border hover:shadow-md"
                >
                  <span className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-lg bg-muted text-muted-foreground">
                      {linkIcons[link.icon]}
                    </span>
                    <span className="text-left">
                      <span className="block font-medium text-card-foreground">
                        {link.title}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {link.subtitle}
                      </span>
                    </span>
                  </span>
                  <div className="flex items-center gap-2">
                    {isSignedIn && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (isSaved) {
                            const savedItem = savedLinks?.find(
                              (saved) =>
                                saved.linkTitle === link.title &&
                                saved.linkSubtitle === link.subtitle,
                            )
                            if (savedItem) {
                              void removeSavedLink(savedItem.id)
                            }
                          } else {
                            void saveLink(link.title, link.subtitle, link.icon)
                          }
                        }}
                        aria-label={
                          isSaved
                            ? `Remove ${link.title} from saved`
                            : `Save ${link.title}`
                        }
                        className="text-muted-foreground transition-colors hover:text-primary"
                      >
                        <BookmarkIcon active={isSaved} />
                      </button>
                    )}
                    {link.badge ? (
                      <span className="rounded-full bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
                        {link.badge}
                      </span>
                    ) : (
                      <span className="text-muted-foreground transition-colors group-hover:text-foreground">
                        <ExternalArrow />
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </nav>

          {/* Socials */}
          <div className="mb-12 flex justify-center gap-3">
            {socials.map((social) => (
              <button
                key={social.label}
                type="button"
                aria-label={social.label}
                onClick={() => go(social.label)}
                className="grid size-12 place-items-center rounded-full border border-border/60 bg-card text-muted-foreground transition-all duration-200 hover:border-border hover:text-foreground hover:shadow-sm"
              >
                {socialIcons[social.icon]}
              </button>
            ))}
          </div>

          {/* Contact CTA */}
          <div className="mb-12">
            <Sheet open={contactOpen} onOpenChange={setContactOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  className="w-full rounded-xl border border-border/60 bg-card px-5 py-4 text-left shadow-sm transition-all duration-200 hover:border-border hover:shadow-md"
                >
                  <span className="flex items-center justify-center gap-3">
                    <svg
                      className="size-5 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="font-medium text-card-foreground">
                      Contact Me
                    </span>
                  </span>
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
                <SheetHeader className="border-b border-border p-6">
                  <SheetTitle className="text-xl">Get in Touch</SheetTitle>
                  <SheetDescription>
                    Send me a message and I'll get back to you soon.
                  </SheetDescription>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto px-6 py-5">
                  <form
                    id="contact-form"
                    className="space-y-4"
                    onSubmit={(e) => {
                      e.preventDefault()
                      const form = e.currentTarget
                      const name = form.name.value
                      const email = form.email.value
                      const message = form.message.value
                      if (name && email && message) {
                        void submitInquiry(name, email, message)
                        form.reset()
                        setContactOpen(false)
                      }
                    }}
                  >
                    <div>
                      <label
                        htmlFor="name"
                        className="mb-2 block text-sm font-medium text-foreground"
                      >
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="mb-2 block text-sm font-medium text-foreground"
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="your@email.com"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="message"
                        className="mb-2 block text-sm font-medium text-foreground"
                      >
                        Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        required
                        rows={4}
                        className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                        placeholder="How can I help you?"
                      />
                    </div>
                  </form>
                </div>
                <SheetFooter className="border-t border-border p-6">
                  <Button
                    type="submit"
                    form="contact-form"
                    className="w-full rounded-full"
                  >
                    Send Message
                  </Button>
                  <SheetClose asChild>
                    <Button type="button" variant="outline" className="w-full rounded-full">
                      Cancel
                    </Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>

          {/* Featured work */}
          <div className="border-t border-border pt-10">
            <h2 className="mb-4 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {featuredHeading}
            </h2>

            <button
              type="button"
              onClick={() => go(featuredTitle)}
              className="group block w-full overflow-hidden rounded-xl border border-border/60 bg-card text-left transition-all duration-200 hover:border-border hover:shadow-md"
            >
              <div className="aspect-[16/9] overflow-hidden bg-muted">
                <Image
                  alt={featuredImageAlt}
                  w={600}
                  h={338}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-4">
                <h3 className="mb-1 font-medium text-card-foreground">
                  {featuredTitle}
                </h3>
                <p className="text-sm text-muted-foreground">{featuredDesc}</p>
              </div>
            </button>
          </div>
        </main>

        {/* SECTION:footer */}
        <footer className="py-8 text-center text-sm text-muted-foreground">
          <button type="button" onClick={() => go(nav[0])}>
            © {new Date().getFullYear()} {brand}. {footerNote}
          </button>
        </footer>
      </div>
    )
  },
})
