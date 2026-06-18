import { useState, type ReactNode } from "react"
import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { string, table } from '@ship-fast/lakebed/server'
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
 * FaqKimiPage — a complete, self-contained help-center / FAQ / support page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "FlowSync Help Center"
 * design: a clean, light, documentation-style layout. It opens with a
 * sticky navbar, a calm centered search hero (search field + popular
 * keyword chips, no big marketing band), a "Browse by Topic" grid of
 * category cards with tinted icon tiles + article counts, an eight-item
 * frequently-asked-questions accordion built on native <details>/<summary>,
 * a dark contact CTA band, and a five-column resource footer with status
 * indicator. Mapped entirely onto semantic theme tokens so it stays
 * theme-injectable.
 *
 * Callers supply ONLY content data; rich defaults from the source copy make
 * it render great with no props at all.
 */
export const FaqKimiPage = defineCapsule({
  name: "FaqKimiPage",
  description:
    "Complete help-center / FAQ / knowledge-base / support page with a clean, light, documentation-style aesthetic (calm neutral surface, no big hero band). Includes a sticky navbar with Contact Support + Sign In, a centered search hero (search input with keyboard-shortcut hint plus popular keyword chips), a 'Browse by Topic' grid of category cards with tinted icon tiles and article counts (Getting Started, Account & Billing, Projects & Tasks, Integrations, Security, API), an eight-item expandable FAQ accordion answering questions about free plans, billing/upgrades, guest access, integrations, data security, nonprofit/education discounts, data export, and support tiers, a dark 'Still need help?' contact CTA band with email + live-chat buttons, and a five-column resource footer with social links and a systems-operational status pill. Use as a dedicated FAQ, frequently-asked-questions, help center, support, documentation landing, or knowledge-base page for SaaS products, apps, and platforms when users need searchable answers and browsable support topics. Supply content only — brand, nav, hero, topics, faqs, cta, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand / product name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Search hero content. */
    hero: z
      .object({
        heading: z.string().optional(),
        subheading: z.string().optional(),
        searchPlaceholder: z.string().optional(),
        popularLabel: z.string().optional(),
        /** Popular keyword chips below the search field. */
        popular: z.array(z.string()).optional(),
        contactSupport: z.string().optional(),
      })
      .optional(),
    /** "Browse by Topic" category grid. */
    topics: z
      .object({
        heading: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
              count: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Frequently-asked-questions accordion. */
    faq: z
      .object({
        heading: z.string().optional(),
        intro: z.string().optional(),
        contactLink: z.string().optional(),
        items: z
          .array(
            z.object({
              question: z.string(),
              answers: z.array(z.string()),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Dark contact CTA band. */
    cta: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        primary: z.string().optional(),
        secondary: z.string().optional(),
        note: z.string().optional(),
        noteHighlight: z.string().optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        tagline: z.string().optional(),
        columns: z
          .array(
            z.object({ title: z.string(), links: z.array(z.string()) }),
          )
          .optional(),
        copyright: z.string().optional(),
        statusLabel: z.string().optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: {
    schema: {
      savedArticles: table({
        question: string(),
        answer: string(),
      }),
    },
    queries: {
      savedArticles: ({ db }) => db.savedArticles.orderBy('createdAt').all(),
    },
    mutations: {
      toggleSavedArticle: ({ db }, question: string, answer: string) => {
        const existing = db.savedArticles.where('question', question).all()[0]
        if (existing) {
          db.savedArticles.delete(existing.id)
          return db.savedArticles.all()
        }
        db.savedArticles.insert({ question, answer })
        return db.savedArticles.all()
      },
      removeSavedArticle: ({ db }, id: string) => {
        db.savedArticles.delete(id)
        return db.savedArticles.all()
      },
      clearSavedArticles: ({ db }) => {
        for (const item of db.savedArticles.all()) {
          db.savedArticles.delete(item.id)
        }
        return []
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [savedOpen, setSavedOpen] = useState(false)
    const brand = props.brand ?? "FlowSync"
    const nav = props.nav?.length
      ? props.nav
      : ["Documentation", "API Reference", "Community", "Status"]

    const heroHeading = props.hero?.heading ?? "How can we help you?"
    const heroSub =
      props.hero?.subheading ??
      "Search our knowledge base or browse topics to find answers about FlowSync features, billing, and integrations."
    const searchPlaceholder =
      props.hero?.searchPlaceholder ??
      "Search for articles, topics, or keywords..."
    const popularLabel = props.hero?.popularLabel ?? "Popular:"
    const popular = props.hero?.popular?.length
      ? props.hero.popular
      : ["Getting Started", "Billing", "API Keys", "SSO Setup"]
    const contactSupport = props.hero?.contactSupport ?? "Contact Support"

    const savedArticles = lakebed.useQuery('savedArticles')
    const toggleSavedArticle = lakebed.useMutation('toggleSavedArticle')
    const removeSavedArticle = lakebed.useMutation('removeSavedArticle')
    const clearSavedArticles = lakebed.useMutation('clearSavedArticles')
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
    const savedCount = savedArticles?.length ?? 0

    const topicsHeading = props.topics?.heading ?? "Browse by Topic"
    const topicItems = props.topics?.items?.length
      ? props.topics.items
      : [
          {
            title: "Getting Started",
            description:
              "Set up your workspace, invite team members, and create your first project.",
            count: "24 articles",
          },
          {
            title: "Account & Billing",
            description:
              "Manage subscriptions, payment methods, invoices, and seat allocations.",
            count: "18 articles",
          },
          {
            title: "Projects & Tasks",
            description:
              "Learn about boards, workflows, task management, and automation rules.",
            count: "32 articles",
          },
          {
            title: "Integrations",
            description:
              "Connect with Slack, GitHub, Figma, Zapier, and 50+ other tools.",
            count: "28 articles",
          },
          {
            title: "Security & Access",
            description:
              "SSO configuration, SAML setup, permissions, and data protection.",
            count: "15 articles",
          },
          {
            title: "API & Developers",
            description:
              "REST API documentation, webhooks, rate limits, and SDKs.",
            count: "42 articles",
          },
        ]

    const faqHeading = props.faq?.heading ?? "Frequently Asked Questions"
    const faqIntro =
      props.faq?.intro ??
      "Quick answers to common questions. Can't find what you're looking for?"
    const faqContactLink = props.faq?.contactLink ?? "Contact our support team"
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: "What is included in the free plan?",
            answers: [
              "The FlowSync Free plan includes unlimited personal projects, up to 3 team members, 5GB of file storage, and access to core features like kanban boards, task assignments, and basic reporting. It's perfect for individuals and small teams getting started with project management.",
              "Free workspaces have a 1,000 task limit per project and standard email support with a 48-hour response time. No credit card is required to sign up, and you can use the free plan indefinitely.",
            ],
          },
          {
            question: "How do I upgrade or downgrade my subscription?",
            answers: [
              "You can change your plan at any time from your workspace Settings → Billing page. Upgrades take effect immediately, and you'll be charged a prorated amount for the remainder of your billing cycle.",
              "When downgrading, the change takes effect at the end of your current billing period. Your data remains accessible, but features exceeding your new plan's limits will be read-only until you upgrade again or reduce usage.",
              "We accept payments via credit card (Visa, Mastercard, American Express) and PayPal. Enterprise customers can also pay by invoice with net-30 terms.",
            ],
          },
          {
            question: "Can I invite external clients or guests to my projects?",
            answers: [
              "Yes! FlowSync supports Guest access on Team plans and above. Guests have limited permissions and can only see the specific projects you invite them to. They cannot access workspace settings, billing information, or other members' private projects.",
              "Guest seats are priced at $8/month per user and don't count against your member seat allocation. You can have unlimited guests on Business and Enterprise plans. Guests can comment, upload files, and complete assigned tasks, making them ideal for client collaboration and contractor management.",
            ],
          },
          {
            question: "What integrations are available?",
            answers: [
              "FlowSync integrates with over 50 popular tools including Slack, Microsoft Teams, GitHub, GitLab, Figma, Adobe Creative Cloud, Google Drive, Dropbox, Zoom, Salesforce, HubSpot, and Zapier. Our Slack integration allows you to create tasks, receive notifications, and update project status directly from Slack channels.",
              "For development teams, our GitHub and GitLab integrations link commits, pull requests, and issues directly to FlowSync tasks. The Figma integration embeds design files in task descriptions and automatically notifies stakeholders when designs are updated.",
              "Enterprise customers also get access to our SCIM provisioning API for automatic user management and custom webhooks for building internal integrations.",
            ],
          },
          {
            question: "How secure is my data on FlowSync?",
            answers: [
              "Security is our top priority. FlowSync uses industry-standard AES-256 encryption for data at rest and TLS 1.3 for data in transit. Our infrastructure runs on AWS with SOC 2 Type II certification, and we undergo annual third-party security audits.",
              "Enterprise plans include advanced security features like SAML-based single sign-on (SSO), SCIM user provisioning, audit logs with 1-year retention, and custom data retention policies. We're GDPR compliant and offer data residency options in the US, EU, and Australia.",
              "For highly regulated industries, our Enterprise plan supports HIPAA BAA agreements and includes features like automatic PII redaction in task descriptions and IP-based access restrictions.",
            ],
          },
          {
            question: "Do you offer discounts for nonprofits and education?",
            answers: [
              "Yes! We offer 50% discounts on all paid plans for registered nonprofit organizations and accredited educational institutions. Students and teachers can also apply for our free Education plan, which includes most Business plan features for up to 25 users.",
              "To apply, submit your 501(c)(3) documentation or .edu email address through our education verification form. Approval typically takes 1-2 business days. Open source projects with 1,000+ GitHub stars are also eligible for free Business plan access.",
            ],
          },
          {
            question: "How do I export my data if I want to leave?",
            answers: [
              "You own your data, and we make it easy to take it with you. All plans include CSV and JSON export options for projects, tasks, and activity logs. Business and Enterprise plans can also export in Microsoft Project (.mpp) format and PDF reports.",
              "To export, go to Settings → Data Export in your workspace admin panel. Full workspace exports typically complete within 24 hours and are delivered as secure download links valid for 7 days. Enterprise customers can also use our API to programmatically extract data at any time.",
              "If you cancel your subscription, your data is retained for 90 days (or longer per your contract) before being permanently deleted, giving you ample time to export or reactivate.",
            ],
          },
          {
            question: "What support options are available?",
            answers: [
              "All users have access to our comprehensive Help Center, video tutorials, and community forums. Free plan users receive email support with a 48-hour response guarantee. Team plans include priority email support with 24-hour response times.",
              "Business plans add live chat support during business hours (9am-6pm EST, Monday-Friday) and phone support for critical issues. Enterprise customers receive dedicated account managers, 24/7 phone support, custom training sessions, and guaranteed 4-hour response times for critical issues.",
              "Enterprise customers also get access to our professional services team for onboarding assistance, workflow optimization consulting, and custom integration development.",
            ],
          },
        ]

    const ctaHeading = props.cta?.heading ?? "Still need help?"
    const ctaDesc =
      props.cta?.description ??
      "Can't find what you're looking for? Our support team is available Monday-Friday, 9am-6pm EST. Enterprise customers have 24/7 access."
    const ctaPrimary = props.cta?.primary ?? "Email Support"
    const ctaSecondary = props.cta?.secondary ?? "Start Live Chat"
    const ctaNote = props.cta?.note ?? "Average response time:"
    const ctaNoteHighlight =
      props.cta?.noteHighlight ?? "under 2 hours for paid plans"

    const footerTagline =
      props.footer?.tagline ??
      "Project management that flows with your team's work."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Product",
            links: ["Features", "Integrations", "Pricing", "Changelog", "Roadmap"],
          },
          {
            title: "Resources",
            links: ["Documentation", "API Reference", "Community", "Templates", "Guides"],
          },
          {
            title: "Company",
            links: ["About", "Blog", "Careers", "Press", "Contact"],
          },
          {
            title: "Legal",
            links: ["Privacy", "Terms", "Security", "Cookies", "Compliance"],
          },
        ]
    const footerCopyright =
      props.footer?.copyright ??
      `© ${new Date().getFullYear()} ${brand}, Inc. All rights reserved.`
    const statusLabel = props.footer?.statusLabel ?? "All systems operational"

    // Brand logo tile — decorative flow-arrow mark in a token surface.
    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "grid place-items-center rounded-lg bg-primary text-primary-foreground",
          className,
        )}
        aria-hidden="true"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 7h11a4 4 0 0 1 0 8H8" />
          <polyline points="11 19 7 15 11 11" />
        </svg>
      </span>
    )

    const CaretRight = ({ className }: { className?: string }) => (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={className}
      >
        <polyline points="9 6 15 12 9 18" />
      </svg>
    )

    const CaretDown = () => (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    )

    const BookmarkIcon = ({ filled = false }: { filled?: boolean }) => (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
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

    // Topic icon tiles — rotate token tints (never raw palette).
    const topicTints = [
      "bg-primary/10 text-primary",
      "bg-chart-2/15 text-chart-2",
      "bg-chart-4/15 text-chart-4",
      "bg-chart-1/15 text-chart-1",
      "bg-destructive/10 text-destructive",
      "bg-chart-3/15 text-chart-3",
    ]
    const topicIcons: ReactNode[] = [
      // rocket
      <svg key="rocket" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91 0z" />
        <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
        <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      </svg>,
      // credit card
      <svg key="card" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
      </svg>,
      // kanban
      <svg key="kanban" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="6" height="14" rx="1" />
        <rect x="15" y="3" width="6" height="9" rx="1" />
      </svg>,
      // plugs connected
      <svg key="plugs" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22v-5" />
        <path d="M9 8V2" />
        <path d="M15 8V2" />
        <path d="M18 8v4a6 6 0 0 1-12 0V8z" />
      </svg>,
      // shield check
      <svg key="shield" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>,
      // code
      <svg key="code" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>,
    ]

    const socials = ["Twitter", "LinkedIn", "GitHub"] as const

    return (
      <div
        className={cn(
          "min-h-svh bg-muted/40 font-sans text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center gap-2"
              >
                <LogoMark className="size-8" />
                <span className="text-lg font-semibold text-foreground">
                  {brand}
                </span>
              </button>

              <nav className="hidden items-center gap-8 md:flex">
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
              </nav>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => go(contactSupport)}
                  className="hidden items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  {contactSupport}
                </button>
                <Sheet open={savedOpen} onOpenChange={setSavedOpen}>
                  <SheetTrigger asChild>
                    <button
                      type="button"
                      aria-label="Saved articles"
                      className="relative flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <BookmarkIcon />
                      {savedCount > 0 ? (
                        <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-foreground text-[0.625rem] font-bold text-background">
                          {savedCount}
                        </span>
                      ) : null}
                    </button>
                  </SheetTrigger>
                  <SheetContent
                    side="right"
                    className="w-full gap-0 p-0 sm:max-w-md"
                  >
                    <SheetHeader className="border-b border-border p-6">
                      <SheetTitle className="text-xl">Saved Articles</SheetTitle>
                      <SheetDescription>
                        {savedCount > 0
                          ? `${savedCount} article${savedCount === 1 ? '' : 's'} saved for later.`
                          : 'No articles saved yet.'}
                      </SheetDescription>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto px-6 py-5">
                      {savedArticles && savedArticles.length > 0 ? (
                        <div className="space-y-4">
                          {savedArticles.map((item) => (
                            <div
                              key={item.id}
                              className="rounded-lg border border-border bg-muted/40 p-4"
                            >
                              <h3 className="mb-2 font-semibold text-foreground">
                                {item.question}
                              </h3>
                              <p className="text-sm text-muted-foreground line-clamp-3">
                                {item.answer}
                              </p>
                              <button
                                type="button"
                                onClick={() => void removeSavedArticle(item.id)}
                                className="mt-3 text-xs font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 px-6 text-center">
                          <p className="text-base font-semibold text-foreground">
                            No saved articles
                          </p>
                          <p className="mt-2 text-sm text-muted-foreground">
                            Bookmark FAQ items to save them for later reading.
                          </p>
                        </div>
                      )}
                    </div>
                    <SheetFooter className="border-t border-border p-6">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full rounded-full"
                        onClick={() => void clearSavedArticles()}
                        disabled={!savedArticles || savedArticles.length === 0}
                      >
                        Clear All
                      </Button>
                      <SheetClose asChild>
                        <Button
                          type="button"
                          variant="secondary"
                          className="w-full rounded-full"
                        >
                          Close
                        </Button>
                      </SheetClose>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
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
                          onClick={() => go('Account')}
                          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          Account
                          <CaretRight className="size-4" />
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
                <button
                  type="button"
                  aria-label="Open menu"
                  aria-expanded={mobileOpen}
                  aria-controls="mobile-menu"
                  onClick={() => setMobileOpen((v: boolean) => !v)}
                  className="p-2 text-muted-foreground transition-colors hover:text-foreground md:hidden"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="18" x2="21" y2="18" />
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
                <div className="mt-2 rounded-xl border border-border bg-muted/40 p-3">
                  {isSignedIn ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Avatar size="lg">
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
                            {authEmail ?? 'Signed in'}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        onClick={() => {
                          setMobileOpen(false)
                          handleSignOut()
                        }}
                        className="w-full rounded-full"
                      >
                        Sign out
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => {
                        setMobileOpen(false)
                        handleSignIn()
                      }}
                      disabled={auth.isLoading}
                      className="w-full rounded-full"
                    >
                      <span className="mr-2 grid size-5 place-items-center rounded-full bg-background text-xs font-black text-foreground">
                        G
                      </span>
                      {authLabel}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </header>

        <main>
          {/* Search hero */}
          <section className="border-b border-border bg-background">
            <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8 lg:py-24">
              <h1 className="mb-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                {heroHeading}
              </h1>
              <p className="mx-auto mb-8 max-w-xl text-lg text-muted-foreground">
                {heroSub}
              </p>

              <form
                className="relative mx-auto max-w-2xl"
                onSubmit={(e) => {
                  e.preventDefault()
                  go(nav[0])
                }}
              >
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-muted-foreground">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
                <input
                  type="search"
                  placeholder={searchPlaceholder}
                  aria-label="Search help articles"
                  className="w-full rounded-xl border border-input bg-background py-4 pl-12 pr-16 text-base text-foreground shadow-sm placeholder:text-muted-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <kbd className="hidden items-center rounded border border-border bg-muted px-2 py-1 text-xs font-medium text-muted-foreground sm:inline-flex">
                    ⌘K
                  </kbd>
                </div>
              </form>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                <span className="text-sm text-muted-foreground">{popularLabel}</span>
                {popular.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => go(chip)}
                    className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Browse by Topic */}
          <section className="bg-muted/40 py-12 sm:py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h2 className="mb-8 text-lg font-semibold text-foreground">
                {topicsHeading}
              </h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {topicItems.map((topic, i) => (
                  <button
                    key={topic.title}
                    type="button"
                    onClick={() => go(topic.title)}
                    className="group rounded-xl border border-border bg-card p-6 text-left transition-all hover:border-border/60 hover:shadow-sm"
                  >
                    <div
                      className={cn(
                        "mb-4 grid size-12 place-items-center rounded-lg transition-transform group-hover:scale-105",
                        topicTints[i % topicTints.length],
                      )}
                    >
                      {topicIcons[i % topicIcons.length]}
                    </div>
                    <h3 className="mb-1 font-semibold text-card-foreground">
                      {topic.title}
                    </h3>
                    <p className="mb-3 text-sm text-muted-foreground">
                      {topic.description}
                    </p>
                    <span className="inline-flex items-center text-sm font-medium text-foreground/80 group-hover:text-foreground">
                      {topic.count}
                      <CaretRight className="ml-1 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ accordion */}
          <section className="border-t border-border bg-background py-12 sm:py-16">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <div className="mb-12 text-center">
                <h2 className="mb-3 text-2xl font-semibold text-foreground sm:text-3xl">
                  {faqHeading}
                </h2>
                <p className="text-muted-foreground">
                  {faqIntro}{" "}
                  <button
                    type="button"
                    onClick={() => go(faqContactLink)}
                    className="font-medium text-foreground underline underline-offset-2 hover:no-underline"
                  >
                    {faqContactLink}
                  </button>
                  .
                </p>
              </div>

              <div className="space-y-4">
                {faqItems.map((item, i) => {
                  const isSaved = savedArticles?.some(
                    (saved) => saved.question === item.question,
                  )
                  const answerText = item.answers.join(' ')
                  return (
                    <details
                      key={item.question}
                      open={i === 0}
                      className="group rounded-xl border border-border bg-muted/40 transition-all open:bg-card open:shadow-sm"
                    >
                      <summary className="flex cursor-pointer list-none items-center justify-between p-5">
                        <h3 className="pr-4 font-medium text-foreground">
                          {item.question}
                        </h3>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault()
                              void toggleSavedArticle(item.question, answerText)
                            }}
                            aria-pressed={isSaved}
                            aria-label={
                              isSaved
                                ? `Remove ${item.question} from saved articles`
                                : `Save ${item.question} for later`
                            }
                            className={cn(
                              'flex size-8 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-all hover:text-foreground',
                              isSaved && 'text-primary',
                            )}
                          >
                            <BookmarkIcon filled={isSaved} />
                          </button>
                          <span className="flex size-8 flex-shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-transform group-open:rotate-180">
                            <CaretDown />
                          </span>
                        </div>
                      </summary>
                      <div className="space-y-3 px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
                        {item.answers.map((a, j) => (
                          <p key={j}>{a}</p>
                        ))}
                      </div>
                    </details>
                  )
                })}
              </div>
            </div>
          </section>

          {/* Contact CTA band */}
          <section className="border-t border-border bg-muted/40 py-12 sm:py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="rounded-2xl bg-primary p-8 text-center sm:p-12 lg:p-16">
                <h2 className="mb-4 text-2xl font-semibold text-primary-foreground sm:text-3xl">
                  {ctaHeading}
                </h2>
                <p className="mx-auto mb-8 max-w-2xl text-lg text-primary-foreground/70">
                  {ctaDesc}
                </p>
                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => go(ctaPrimary)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-background px-6 py-3 font-medium text-foreground transition-colors hover:bg-muted sm:w-auto"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="m22 7-10 5L2 7" />
                    </svg>
                    {ctaPrimary}
                  </button>
                  <button
                    type="button"
                    onClick={() => go(ctaSecondary)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary-foreground/10 px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary-foreground/20 sm:w-auto"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    {ctaSecondary}
                  </button>
                </div>
                <p className="mt-6 text-sm text-primary-foreground/60">
                  {ctaNote}{" "}
                  <span className="text-primary-foreground/90">
                    {ctaNoteHighlight}
                  </span>
                </p>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-background py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5 lg:gap-12">
              <div className="col-span-2 md:col-span-4 lg:col-span-1">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 flex items-center gap-2"
                >
                  <LogoMark className="size-8" />
                  <span className="text-lg font-semibold text-foreground">
                    {brand}
                  </span>
                </button>
                <p className="mb-4 text-sm text-muted-foreground">
                  {footerTagline}
                </p>
                <div className="flex items-center gap-3">
                  {socials.map((social) => (
                    <button
                      key={social}
                      type="button"
                      aria-label={social}
                      onClick={() => go(social)}
                      className="grid size-8 place-items-center rounded-lg bg-secondary text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      <span className="text-xs font-bold">{social.charAt(0)}</span>
                    </button>
                  ))}
                </div>
              </div>

              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h4 className="mb-4 text-sm font-semibold text-foreground">
                    {col.title}
                  </h4>
                  <ul className="space-y-3">
                    {col.links.map((link) => (
                      <li key={link}>
                        <button
                          type="button"
                          onClick={() => go(link)}
                          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {link}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
              <p className="text-sm text-muted-foreground">{footerCopyright}</p>
              <div className="flex items-center gap-6">
                <button
                  type="button"
                  onClick={() => go("Status")}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Status
                </button>
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="size-2 rounded-full bg-chart-2" />
                  {statusLabel}
                </span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    )
  },
})
