import { useState } from 'react'
import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"
import { number, string, table } from '@ship-fast/lakebed/server'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '#/components/ui/command.tsx'
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

export const KnowledgeBaseKimiPage3 = defineCapsule({
  name: "KnowledgeBaseKimiPage3",
  description:
    "Knowledge Base third style sibling to KnowledgeBaseKimiPage, converted from generated Kimi HTML into a responsive token-compliant page block with hero storytelling, metrics, content sections, image-led cards, and conversion actions.",
  props: z.object({
    brand: z.string().optional(),
    nav: z.array(z.string()).optional(),
    hero: z
      .object({
        eyebrow: z.string().optional(),
        title: z.string().optional(),
        description: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        imageAlt: z.string().optional(),
      })
      .optional(),
    metrics: z.array(z.object({ value: z.string(), label: z.string() })).optional(),
    sections: z
      .array(
        z.object({
          eyebrow: z.string(),
          title: z.string(),
          body: z.string(),
          items: z.array(z.string()).optional(),
        }),
      )
      .optional(),
    gallery: z
      .array(
        z.object({
          title: z.string(),
          alt: z.string(),
          caption: z.string().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: {
    schema: {
      articles: table({
        title: string(),
        category: string(),
        alt: string(),
      }),
      savedArticles: table({
        articleTitle: string(),
      }),
      supportRequests: table({
        subject: string(),
        message: string(),
        status: string(),
      }),
    },
    queries: {
      articles: ({ db }) => db.articles.orderBy('createdAt').all(),
      savedArticleTitles: ({ db }) =>
        new Set(db.savedArticles.all().map((saved) => saved.articleTitle)),
      supportRequests: ({ db }) =>
        db.supportRequests.orderBy('createdAt').all(),
    },
    mutations: {
      toggleSavedArticle: ({ db }, articleTitle: string) => {
        const existing = db.savedArticles
          .where('articleTitle', articleTitle)
          .all()[0]

        if (existing) {
          db.savedArticles.delete(existing.id)
          return false
        }

        db.savedArticles.insert({ articleTitle })
        return true
      },
      submitSupportRequest: ({ db }, subject: string, message: string) => {
        db.supportRequests.insert({
          subject,
          message,
          status: 'pending',
        })
        return db.supportRequests.all()
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [searchOpen, setSearchOpen] = useState(false)
    const [supportOpen, setSupportOpen] = useState(false)
    const [supportSubject, setSupportSubject] = useState('')
    const [supportMessage, setSupportMessage] = useState('')

    const brand = props.brand ?? "Atlas Help Center Knowledge Base & Support"
    const nav = props.nav?.length ? props.nav : ["Atlas Help Center", "Topics", "Guides", "FAQ", "Support Plans", "Sign in"]
    const hero = {
      eyebrow: "Knowledge Base / Variant 3",
      title: "How can we help you today?",
      description: "Atlas Help Center Knowledge Base & Support Atlas Help Center Topics Guides FAQ Support Plans Sign in Contact Support How can we help you today? Search hundreds of articles, tuto...",
      primaryCta: "How do I invite team members?",
      secondaryCta: "Is there a public status page?",
      imageAlt: "Dark-themed analytics dashboard displaying real-time user traffic charts and metrics",
      ...props.hero,
    }
    const metrics = props.metrics?.length ? props.metrics : [
  {
    "value": "24/7",
    "label": "Responsive service"
  },
  {
    "value": "98%",
    "label": "Positive outcomes"
  },
  {
    "value": "4.9",
    "label": "Average rating"
  },
  {
    "value": "12+",
    "label": "Core capabilities"
  }
]
    const sections = props.sections?.length ? props.sections : [
  {
    "eyebrow": "Overview",
    "title": "Browse by topic",
    "body": "Atlas Help Center Knowledge Base & Support Atlas Help Center Topics Guides FAQ Support Plans Sign in Contact Support How can we help you today? Search hundreds of articles, tuto...",
    "items": [
      "Support plans",
      "Loved by builders",
      "Frequently asked questions"
    ]
  },
  {
    "eyebrow": "Experience",
    "title": "Get answers in three steps",
    "body": "Knowledge Base page variant 2 highlights the generated design's core message, section pacing, and conversion-focused content.",
    "items": [
      "Still stuck? We re here to help.",
      "Getting Started",
      "Account & Security"
    ]
  },
  {
    "eyebrow": "Proof",
    "title": "Visual guides & resources",
    "body": "Knowledge Base page variant 3 highlights the generated design's core message, section pacing, and conversion-focused content.",
    "items": [
      "Billing & Plans",
      "Developer API",
      "Integrations"
    ]
  },
  {
    "eyebrow": "Next steps",
    "title": "Support plans",
    "body": "Knowledge Base page variant 4 highlights the generated design's core message, section pacing, and conversion-focused content.",
    "items": [
      "Troubleshooting",
      "Community",
      "Business"
    ]
  }
]
    const gallery = props.gallery?.length ? props.gallery : [
  {
    "title": "Get answers in three steps",
    "alt": "Dark-themed analytics dashboard displaying real-time user traffic charts and metrics",
    "caption": "Knowledge Base generated page detail"
  },
  {
    "title": "Visual guides & resources",
    "alt": "Close-up of laptop screen showing spreadsheet data and performance graphs",
    "caption": "Knowledge Base generated page detail"
  },
  {
    "title": "Support plans",
    "alt": "Team of engineers collaborating around computers in a modern office workspace",
    "caption": "Knowledge Base generated page detail"
  }
]

    const storedArticles = lakebed.useQuery('articles')
    const savedArticleTitles = lakebed.useQuery('savedArticleTitles')
    const supportRequests = lakebed.useQuery('supportRequests')
    const toggleSavedArticle = lakebed.useMutation('toggleSavedArticle')
    const submitSupportRequest = lakebed.useMutation('submitSupportRequest')
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

    const allArticleItems = sections.flatMap((section) =>
      (section.items ?? []).map((item) => ({
        title: item,
        category: section.title,
        alt: hero.imageAlt,
      })),
    )

    const displayArticles =
      storedArticles && storedArticles.length > 0
        ? storedArticles
        : allArticleItems

    const savedCount = savedArticleTitles?.size ?? 0

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

    const handleSupportSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      if (!supportSubject.trim() || !supportMessage.trim()) return
      void submitSupportRequest(supportSubject, supportMessage)
      setSupportSubject('')
      setSupportMessage('')
      setSupportOpen(false)
    }

    return (
      <div className={cn("min-h-screen bg-background text-foreground", props.className)}>
        <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
            <button type="button" onClick={() => go("Home")} className="text-left text-lg font-semibold tracking-tight">
              {brand}
            </button>
            <nav className="hidden items-center gap-1 md:flex">
              {nav.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => go(item)}
                  className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  {item}
                </button>
              ))}
            </nav>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label="Search articles"
                className="hidden items-center gap-2 text-muted-foreground transition-colors hover:text-foreground sm:flex"
              >
                <svg
                  className="size-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </button>
              <Sheet open={supportOpen} onOpenChange={setSupportOpen}>
                <SheetTrigger asChild>
                  <button
                    type="button"
                    onClick={() => setSupportOpen(true)}
                    className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    Contact Support
                  </button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
                  <SheetHeader className="border-b border-border p-6">
                    <SheetTitle className="text-xl">Contact Support</SheetTitle>
                    <SheetDescription>
                      {isSignedIn
                        ? `Signed in as ${authEmail}. Submit a support request and we'll get back to you.`
                        : 'Sign in to submit a support request and track its status.'}
                    </SheetDescription>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto px-6 py-5">
                    {isSignedIn ? (
                      <form onSubmit={handleSupportSubmit} className="space-y-4">
                        <div>
                          <label htmlFor="subject" className="mb-2 block text-sm font-medium text-foreground">
                            Subject
                          </label>
                          <input
                            id="subject"
                            type="text"
                            value={supportSubject}
                            onChange={(e) => setSupportSubject(e.target.value)}
                            placeholder="Brief description of your issue"
                            required
                            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>
                        <div>
                          <label htmlFor="message" className="mb-2 block text-sm font-medium text-foreground">
                            Message
                          </label>
                          <textarea
                            id="message"
                            value={supportMessage}
                            onChange={(e) => setSupportMessage(e.target.value)}
                            placeholder="Describe your issue in detail"
                            required
                            rows={6}
                            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                          />
                        </div>
                      </form>
                    ) : (
                      <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 px-6 text-center">
                        <p className="text-base font-semibold text-foreground">
                          Sign in to contact support
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Authentication is required to submit support requests.
                        </p>
                      </div>
                    )}
                  </div>
                  <SheetFooter className="border-t border-border p-6">
                    {isSignedIn ? (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-full"
                          onClick={() => setSupportOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          className="rounded-full"
                          onClick={handleSupportSubmit}
                          disabled={!supportSubject.trim() || !supportMessage.trim()}
                        >
                          Submit Request
                        </Button>
                      </>
                    ) : (
                      <Button
                        type="button"
                        className="w-full rounded-full"
                        onClick={handleSignIn}
                        disabled={auth.isLoading}
                      >
                        {authLabel}
                      </Button>
                    )}
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
                      <div className="flex items-center justify-between rounded-lg px-3 py-2">
                        <span className="text-sm font-medium text-foreground">
                          Saved Articles
                        </span>
                        <span className="text-sm font-bold text-primary">
                          {savedCount}
                        </span>
                      </div>
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
            </div>
          </div>
        </header>

        <CommandDialog
          open={searchOpen}
          onOpenChange={setSearchOpen}
          title="Search articles"
          description="Search the knowledge base for articles and guides."
          className="max-w-xl"
        >
          <CommandInput placeholder={`Search ${brand} articles...`} />
          <CommandList className="max-h-[420px]">
            <CommandEmpty>No articles found.</CommandEmpty>
            <CommandGroup heading="Articles">
              {displayArticles.map((article) => {
                const isSaved = savedArticleTitles?.has(article.title) ?? false
                return (
                  <CommandItem
                    key={article.title}
                    value={`${article.title} ${article.category}`}
                    onSelect={() => {
                      setSearchOpen(false)
                      go(article.title)
                    }}
                    className="gap-3 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {article.title}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {article.category}
                      </p>
                    </div>
                    {isSignedIn && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          void toggleSavedArticle(article.title)
                        }}
                        aria-pressed={isSaved}
                        aria-label={
                          isSaved
                            ? `Remove ${article.title} from saved`
                            : `Save ${article.title}`
                        }
                        className="grid size-8 place-items-center rounded-md hover:bg-muted"
                      >
                        <svg
                          className={cn(
                            'size-4',
                            isSaved ? 'text-primary fill-primary' : 'text-muted-foreground',
                          )}
                          fill={isSaved ? 'currentColor' : 'none'}
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          viewBox="0 0 24 24"
                        >
                          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                        </svg>
                      </button>
                    )}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </CommandDialog>

        <main>
          <section className="relative overflow-hidden border-b border-border">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
            <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-16 md:grid-cols-[1.05fr_0.95fr] md:items-center lg:py-24">
              <div>
                <p className="mb-4 inline-flex rounded-md bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground">
                  {hero.eyebrow}
                </p>
                <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                  {hero.title}
                </h1>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
                  {hero.description}
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => go(hero.primaryCta)}
                    className="rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    {hero.primaryCta}
                  </button>
                  <button
                    type="button"
                    onClick={() => go(hero.secondaryCta)}
                    className="rounded-md border border-border bg-card px-5 py-3 text-sm font-semibold text-card-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    {hero.secondaryCta}
                  </button>
                </div>
              </div>
              <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
                <Image alt={hero.imageAlt} w={1200} h={900} className="aspect-[4/3] w-full object-cover" />
              </div>
            </div>
          </section>

          <section className="mx-auto grid max-w-7xl gap-4 px-5 py-10 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric) => (
              <div key={metric.label} className="rounded-lg border border-border bg-card p-5">
                <p className="text-3xl font-semibold text-card-foreground">{metric.value}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{metric.label}</p>
              </div>
            ))}
          </section>

          <section className="border-y border-border bg-muted/40">
            <div className="mx-auto grid max-w-7xl gap-5 px-5 py-14 md:grid-cols-2">
              {sections.map((section, index) => (
                <article key={section.title} className="rounded-lg border border-border bg-card p-6">
                  <p className="text-sm font-medium text-primary">{section.eyebrow}</p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-card-foreground">{section.title}</h2>
                  <p className="mt-3 leading-7 text-muted-foreground">{section.body}</p>
                  {section.items?.length ? (
                    <div className="mt-5 grid gap-2">
                      {section.items.map((item) => {
                        const isSaved = savedArticleTitles?.has(item) ?? false
                        return (
                          <button
                            key={item}
                            type="button"
                            onClick={() => go(item)}
                            className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                          >
                            <span className="flex-1">{item}</span>
                            <div className="flex items-center gap-2">
                              {isSignedIn && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    void toggleSavedArticle(item)
                                  }}
                                  aria-pressed={isSaved}
                                  aria-label={
                                    isSaved
                                      ? `Remove ${item} from saved`
                                      : `Save ${item}`
                                  }
                                  className="grid size-6 place-items-center rounded hover:bg-muted"
                                >
                                  <svg
                                    className={cn(
                                      'size-3.5',
                                      isSaved ? 'text-primary fill-primary' : 'text-muted-foreground',
                                    )}
                                    fill={isSaved ? 'currentColor' : 'none'}
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    viewBox="0 0 24 24"
                                  >
                                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                                  </svg>
                                </button>
                              )}
                              <span className="text-primary">{index + 1}</span>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-5 py-16">
            <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-medium text-primary">Generated visuals</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight">Content-led page moments</h2>
              </div>
              <button
                type="button"
                onClick={() => go(hero.secondaryCta)}
                className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                {hero.secondaryCta}
              </button>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {gallery.map((item) => (
                <article key={item.title} className="overflow-hidden rounded-lg border border-border bg-card">
                  <Image alt={item.alt} w={900} h={700} loading="lazy" className="aspect-[4/3] w-full object-cover" />
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-card-foreground">{item.title}</h3>
                    {item.caption ? <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.caption}</p> : null}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-5 pb-16">
            <div className="rounded-lg border border-border bg-primary p-8 text-primary-foreground md:p-10">
              <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <p className="text-sm font-medium text-primary-foreground/70">{brand}</p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-tight">Ready for the next step?</h2>
                  <p className="mt-3 max-w-2xl leading-7 text-primary-foreground/80">{hero.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => go(hero.primaryCta)}
                  className="rounded-md bg-background px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  {hero.primaryCta}
                </button>
              </div>
            </div>
          </section>
        </main>

        <footer className="border-t border-border">
          <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">(c) {new Date().getFullYear()} {brand}. All rights reserved.</p>
            <div className="flex flex-wrap gap-3">
              {nav.slice(0, 4).map((item) => (
                <button key={item} type="button" onClick={() => go(item)} className="text-sm text-muted-foreground hover:text-foreground">
                  {item}
                </button>
              ))}
            </div>
          </div>
        </footer>
      </div>
    )
  },
})
