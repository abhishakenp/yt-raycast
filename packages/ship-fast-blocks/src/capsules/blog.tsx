import { useState } from 'react'
import { z } from 'zod/v4'
import { defineCapsule } from './openui.ts'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'
import { string, table } from '@ship-fast/lakebed/server'
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

/**
 * BlogKimiPage — a complete, self-contained editorial BLOG INDEX / homepage.
 *
 * A faithful Tailwind v4 port of a Kimi-generated design & technology blog
 * design: a glassy sticky header with a gradient brand tile + search button,
 * a split "featured post" card (large image + serif headline, topic, author
 * meta and a read link), a "Latest stories" section header, and a responsive
 * 3-up article grid where each card has a tagged cover image, serif-adjacent
 * title, clamped excerpt and an author/date footer. Closes with a slim
 * multi-link footer.
 *
 * This is a blog INDEX — intentionally editorial and content-first, with NO
 * big marketing hero. The block owns ALL layout, spacing, depth and type
 * hierarchy. Base surfaces use theme tokens (bg-background/text-foreground)
 * so dark mode works, while Kimi's blue→violet accent is preserved on the
 * brand mark, topic labels and read links. Every nav item / card / link
 * routes through `useNavigate` (never a dead "#"), and the navbar labels
 * match the `nav` array so PageSwitch can swap pages. All cover imagery is
 * rendered via <Image alt="…" /> (alt-driven, never a hardcoded src).
 * Callers supply ONLY content data; rich defaults make it render great with
 * no props at all.
 */
export const BlogKimiPage = defineCapsule({
  name: 'BlogKimiPage',
  description:
    "Complete editorial BLOG INDEX / homepage with a clean, content-first aesthetic: glassy sticky header with a gradient brand tile + search affordance, a split 'featured post' card (large cover image + serif headline, topic label, author meta and read link), a 'Latest stories' header, and a responsive 3-up article grid of tagged cover cards with title, excerpt and author/date footer, plus a slim multi-link footer. Use as the ROOT/home page for blogs, magazines, publications, newsrooms, design/tech journals, content hubs or company blogs when an editorial article-listing page is wanted. NOTE: this is a blog INDEX — it has NO big marketing hero; it leads with a featured article and a grid of stories. Supply content only — brand, nav, header, featured, posts, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand / publication name shown in the header and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Section header above the article grid. */
    header: z
      .object({
        /** Heading for the latest-stories section. */
        title: z.string().optional(),
        /** Label for the "view all" link beside the heading. */
        viewAll: z.string().optional(),
      })
      .optional(),
    /** The single featured / lead article shown in the split card. */
    featured: z
      .object({
        badge: z.string().optional(),
        topic: z.string().optional(),
        title: z.string().optional(),
        excerpt: z.string().optional(),
        author: z.string().optional(),
        readTime: z.string().optional(),
        date: z.string().optional(),
        readLabel: z.string().optional(),
        /** Alt text driving the featured cover image (never a raw src). */
        alt: z.string().optional(),
      })
      .optional(),
    /** Article grid cards. */
    posts: z
      .array(
        z.object({
          tag: z.string(),
          title: z.string(),
          excerpt: z.string(),
          author: z.string(),
          date: z.string(),
          /** Alt text driving the card cover image (never a raw src). */
          alt: z.string(),
        }),
      )
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        links: z.array(z.string()).optional(),
        copyright: z.string().optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: {
    schema: {
      articles: table({
        alt: string(),
        author: string(),
        date: string(),
        excerpt: string(),
        tag: string(),
        title: string(),
      }),
      readingList: table({
        articleTitle: string(),
      }),
      subscribers: table({
        email: string(),
      }),
    },
    queries: {
      articles: ({ db }) => db.articles.orderBy('createdAt').all(),
      readingListArticles: ({ db }) =>
        db.readingList.all().flatMap((item) => {
          const article = db.articles.where('title', item.articleTitle).all()[0]
          return article ? [article] : []
        }),
    },
    mutations: {
      isSubscribed: ({ db }, email: string) =>
        db.subscribers.where('email', email).all().length > 0,
      addToReadingList: ({ db }, articleTitle: string) => {
        const existing = db.readingList
          .where('articleTitle', articleTitle)
          .all()[0]

        if (!existing) {
          db.readingList.insert({ articleTitle })
        }

        return db.readingList.all()
      },
      removeFromReadingList: ({ db }, articleTitle: string) => {
        for (const item of db.readingList
          .where('articleTitle', articleTitle)
          .all()) {
          db.readingList.delete(item.id)
        }

        return db.readingList.all()
      },
      subscribe: ({ db }, email: string) => {
        const existing = db.subscribers.where('email', email).all()[0]

        if (!existing) {
          db.subscribers.insert({ email })
        }

        return db.subscribers.all()
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [searchOpen, setSearchOpen] = useState(false)
    const [readingListOpen, setReadingListOpen] = useState(false)
    const brand = props.brand ?? 'Form & Function'
    const nav = props.nav?.length
      ? props.nav
      : ['Home', 'Design', 'Engineering', 'Product', 'About']

    const sectionTitle = props.header?.title ?? 'Latest stories'
    const viewAll = props.header?.viewAll ?? 'View all'

    const featured = {
      badge: props.featured?.badge ?? 'Featured',
      topic: props.featured?.topic ?? 'Systems & Craft',
      title: props.featured?.title ?? 'Design Systems That Survive Change',
      excerpt:
        props.featured?.excerpt ??
        'Great design systems aren’t libraries of components — they’re agreements about how teams think, communicate, and ship. Here is how to build one that lasts.',
      author: props.featured?.author ?? 'Miles Chen',
      readTime: props.featured?.readTime ?? '12 min read',
      date: props.featured?.date ?? 'May 28, 2026',
      readLabel: props.featured?.readLabel ?? 'Read the story',
      alt:
        props.featured?.alt ??
        'A tidy desk with a laptop, notebook, and coffee bathed in warm morning light',
    }

    const posts = props.posts?.length
      ? props.posts
      : [
          {
            tag: 'Engineering',
            title: 'Why We Moved to Edge-First Rendering',
            excerpt:
              'Latency matters more than raw throughput. Shifting rendering to the edge cut our time-to-interactive in half — and simplified our mental model.',
            author: 'Noah Reeves',
            date: 'May 25',
            alt: 'MacBook on a minimalist desk with a plant',
          },
          {
            tag: 'Product',
            title: 'Running Discovery Without a Brief',
            excerpt:
              'Some of the most useful research starts messy. A look at how unstructured conversations with users can reveal problems no survey ever would.',
            author: 'Ava Morales',
            date: 'May 22',
            alt: 'Colorful sticky notes on a glass wall during a workshop',
          },
          {
            tag: 'Design',
            title: 'Typography as Interface',
            excerpt:
              'Type is not decoration — it is navigation, tone, and structure. Here is how we use hierarchy to guide attention without adding a single extra pixel.',
            author: 'Liam Park',
            date: 'May 19',
            alt: 'Wireframes on a tablet and printed sheets on a desk',
          },
          {
            tag: 'Engineering',
            title: 'Refactoring for Deletion',
            excerpt:
              'The best code is the code you do not have to maintain. A practical guide to shrinking surface area while keeping systems reliable.',
            author: 'Sofia Andersson',
            date: 'May 15',
            alt: 'Code editor on a dark theme with syntax highlighting',
          },
          {
            tag: 'Technology',
            title: 'The Infrastructure Behind Real-Time Collaboration',
            excerpt:
              'Operational transforms, CRDTs, and WebSockets — a plain-language tour of what keeps multiplayer documents in sync at scale.',
            author: 'Raj Patel',
            date: 'May 12',
            alt: 'Futuristic server room with blue ambient lighting',
          },
          {
            tag: 'Design',
            title: 'Color Palettes That Respect Accessibility',
            excerpt:
              'Contrast is not enough. Learn how to build flexible color scales that stay accessible across themes, modes, and devices.',
            author: 'Emma Lin',
            date: 'May 08',
            alt: 'Abstract geometric shapes in soft pastel colors',
          },
        ]
    const normalizedPosts = posts.map((post) => ({
      alt: post.alt,
      author: post.author,
      date: post.date,
      excerpt: post.excerpt,
      tag: post.tag,
      title: post.title,
    }))

    type BlogArticle = {
      alt: string
      author: string
      date: string
      excerpt: string
      tag: string
      title: string
    }
    const storedArticles = lakebed.useQuery('articles') as
      | BlogArticle[]
      | undefined
    const readingListArticles = lakebed.useQuery('readingListArticles') as
      | BlogArticle[]
      | undefined
    const auth = lakebed.useAuth()
    const addToReadingList = lakebed.useMutation('addToReadingList')
    const removeFromReadingList = lakebed.useMutation('removeFromReadingList')
    const subscribe = lakebed.useMutation('subscribe')
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
    const displayArticles =
      storedArticles && storedArticles.length > 0
        ? storedArticles
        : normalizedPosts
    const safeReadingList = readingListArticles ?? []
    const readingListCount = safeReadingList.length

    const footerLinks = props.footer?.links?.length
      ? props.footer.links
      : ['Privacy', 'Terms', 'RSS', 'Contact']
    const copyright =
      props.footer?.copyright ?? `© ${new Date().getFullYear()} ${brand}`

    // Shared brand mark — blue→violet gradient tile + bezier glyph (decorative brand asset).
    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          'grid size-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-sm',
          className,
        )}
      >
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
          <circle cx="5" cy="19" r="2" />
          <circle cx="19" cy="5" r="2" />
          <path d="M5 17C5 9 11 5 17 5" />
        </svg>
      </span>
    )

    const Arrow = () => (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-transform group-hover:translate-x-1"
        aria-hidden="true"
      >
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
    )

    const BookmarkIcon = ({ active = false }: { active?: boolean }) => (
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
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    )

    const ChevronDown = () => (
      <svg
        className="size-5 text-muted-foreground"
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

    return (
      <div
        className={cn(
          'flex min-h-svh flex-col bg-background text-foreground antialiased',
          props.className,
        )}
      >
        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
          <div className="mx-auto flex h-[4.5rem] max-w-6xl items-center justify-between px-6">
            <button
              type="button"
              onClick={() => go(nav[0])}
              className="flex items-center gap-2.5 text-[1.15rem] font-bold tracking-tight text-foreground"
            >
              <LogoMark />
              {brand}
            </button>
            <nav
              aria-label="Primary"
              className="hidden items-center gap-1 md:flex"
            >
              {nav.map((label, i) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => go(label)}
                  className={cn(
                    'rounded-md px-3 py-2 text-[0.92rem] font-medium transition-colors',
                    i === 0
                      ? 'bg-muted text-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  {label}
                </button>
              ))}
            </nav>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
                className="grid size-[2.375rem] place-items-center rounded-md border border-border bg-background text-muted-foreground transition-all hover:-translate-y-px hover:text-foreground hover:shadow-sm"
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
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </button>
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
                        <Arrow />
                      </button>
                      <button
                        type="button"
                        onClick={() => go('Settings')}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        Settings
                        <Arrow />
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
              <Sheet open={readingListOpen} onOpenChange={setReadingListOpen}>
                <SheetTrigger asChild>
                  <button
                    type="button"
                    aria-label="Reading list"
                    className="relative flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
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
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
                    {readingListCount > 0 ? (
                      <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-foreground text-[0.625rem] font-bold text-background">
                        {readingListCount}
                      </span>
                    ) : null}
                  </button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-full gap-0 p-0 sm:max-w-md"
                >
                  <SheetHeader className="border-b border-border p-6">
                    <SheetTitle className="text-xl">Reading list</SheetTitle>
                    <SheetDescription>
                      {readingListCount > 0
                        ? `${readingListCount} article${readingListCount === 1 ? '' : 's'} saved for later.`
                        : 'Your reading list is empty.'}
                    </SheetDescription>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto px-6 py-5">
                    {safeReadingList.length ? (
                      <div className="space-y-5">
                        {safeReadingList.map((article) => (
                          <div
                            key={article.title}
                            className="grid grid-cols-[72px_1fr] gap-4 border-b border-border pb-5 last:border-0"
                          >
                            <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                              <Image
                                alt={article.alt}
                                w={180}
                                h={180}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    {article.tag}
                                  </p>
                                  <h3 className="line-clamp-2 text-sm font-semibold text-foreground">
                                    {article.title}
                                  </h3>
                                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                    {article.excerpt}
                                  </p>
                                </div>
                              </div>
                              <div className="mt-4 flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">
                                  {article.author} · {article.date}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    void removeFromReadingList(article.title)
                                  }
                                  className="text-xs font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 px-6 text-center">
                        <p className="text-base font-semibold text-foreground">
                          No articles saved
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Bookmark articles from the grid to build your reading
                          list for this session.
                        </p>
                      </div>
                    )}
                  </div>
                  <SheetFooter className="border-t border-border p-6">
                    <SheetClose asChild>
                      <Button
                        type="button"
                        variant="secondary"
                        className="w-full rounded-full"
                      >
                        Continue reading
                      </Button>
                    </SheetClose>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </header>

        <CommandDialog
          open={searchOpen}
          onOpenChange={setSearchOpen}
          title="Search articles"
          description="Search the articles seeded for this session."
          className="max-w-xl"
        >
          <CommandInput placeholder={`Search ${brand} articles...`} />
          <CommandList className="max-h-[420px]">
            <CommandEmpty>No articles found.</CommandEmpty>
            <CommandGroup heading="Articles">
              {displayArticles.map((article) => (
                <CommandItem
                  key={article.title}
                  value={`${article.tag} ${article.title} ${article.author}`}
                  onSelect={() => {
                    setSearchOpen(false)
                    go(article.title)
                  }}
                  className="gap-3 py-3"
                >
                  <div className="size-12 overflow-hidden rounded-md bg-muted">
                    <Image
                      alt={article.alt}
                      w={120}
                      h={120}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {article.title}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {article.tag} · {article.author}
                    </p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </CommandDialog>

        <main className="flex flex-1 flex-col">
          {/* Featured post */}
          <section
            aria-label="Featured post"
            className="mx-auto w-full max-w-6xl px-6 pt-12 pb-7"
          >
            <article className="grid overflow-hidden rounded-2xl border border-border bg-card shadow-[0_10px_30px_rgba(0,0,0,0.06)] md:grid-cols-[1.15fr_1fr]">
              <button
                type="button"
                onClick={() => go('Blog post')}
                className="group relative block min-h-[15rem] w-full overflow-hidden bg-gradient-to-br from-primary/10 to-accent/20 md:min-h-[24rem]"
              >
                <Image
                  alt={featured.alt}
                  w={1200}
                  h={900}
                  className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <span className="absolute left-[1.125rem] top-[1.125rem] rounded-full bg-background/90 px-2.5 py-1.5 text-[0.7rem] font-bold uppercase tracking-[0.08em] text-foreground shadow-sm backdrop-blur">
                  {featured.badge}
                </span>
              </button>
              <div className="flex flex-col justify-center p-8 md:p-10">
                <div className="mb-3 inline-flex items-center gap-2 text-[0.78rem] font-bold uppercase tracking-[0.08em] text-primary">
                  {featured.topic}
                </div>
                <h1 className="font-serif text-[clamp(1.6rem,2.2vw+0.2rem,2.4rem)] font-bold leading-[1.15] tracking-tight text-foreground">
                  {featured.title}
                </h1>
                <p className="mt-3.5 text-base leading-relaxed text-muted-foreground">
                  {featured.excerpt}
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-x-3.5 gap-y-2 text-[0.85rem] text-muted-foreground">
                  <span className="inline-flex items-center gap-2.5 font-semibold text-foreground">
                    <span className="grid size-8 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-[0.7rem] font-bold text-primary-foreground">
                      {featured.author.charAt(0)}
                    </span>
                    {featured.author}
                  </span>
                  <span>{featured.readTime}</span>
                  <span>{featured.date}</span>
                </div>
                <button
                  type="button"
                  onClick={() => go('Blog post')}
                  className="group mt-6 inline-flex items-center gap-2.5 self-start text-[0.95rem] font-semibold text-primary"
                >
                  {featured.readLabel}
                  <Arrow />
                </button>
              </div>
            </article>
          </section>

          {/* Latest stories */}
          <section
            aria-label="Latest articles"
            className="mx-auto w-full max-w-6xl px-6 pb-14"
          >
            <div className="flex flex-col items-start gap-1.5 py-5 sm:flex-row sm:items-baseline sm:justify-between">
              <h2 className="font-serif text-2xl font-bold tracking-tight text-foreground">
                {sectionTitle}
              </h2>
              <button
                type="button"
                onClick={() => go(viewAll)}
                className="group inline-flex items-center gap-2 text-[0.85rem] font-semibold text-primary"
              >
                {viewAll}
                <Arrow />
              </button>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {displayArticles.map((article) => {
                const isBookmarked = safeReadingList.some(
                  (item) => item.title === article.title,
                )

                return (
                  <article key={article.title} className="group">
                    <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-xl bg-muted">
                      <Image
                        alt={article.alt}
                        w={800}
                        h={500}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      />
                      <span className="absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-1.5 text-[0.7rem] font-bold uppercase tracking-[0.06em] text-foreground shadow-sm backdrop-blur">
                        {article.tag}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          void addToReadingList(article.title)
                        }}
                        aria-pressed={isBookmarked}
                        aria-label={
                          isBookmarked
                            ? `Remove ${article.title} from reading list`
                            : `Add ${article.title} to reading list`
                        }
                        className={cn(
                          'absolute bottom-3 right-3 grid size-10 place-items-center rounded-full shadow-md transition-all hover:scale-105',
                          isBookmarked
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-background/90 text-foreground hover:bg-background',
                        )}
                      >
                        <BookmarkIcon active={isBookmarked} />
                      </button>
                    </div>
                    <div className="flex flex-1 flex-col p-5 rounded-xl border border-border bg-card shadow-[0_4px_12px_rgba(0,0,0,0.04)] transition-all hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
                      <h3 className="text-[1.05rem] font-bold leading-snug tracking-tight text-foreground">
                        {article.title}
                      </h3>
                      <p className="mt-2 line-clamp-3 flex-1 text-[0.92rem] leading-relaxed text-muted-foreground">
                        {article.excerpt}
                      </p>
                      <div className="mt-4 flex items-center justify-between border-t border-border pt-3.5">
                        <span className="inline-flex items-center gap-2.5 text-[0.82rem] font-semibold text-foreground">
                          <span className="grid size-7 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-[0.625rem] font-bold text-primary-foreground">
                            {article.author.charAt(0)}
                          </span>
                          {article.author}
                        </span>
                        <span className="text-[0.78rem] text-muted-foreground">
                          {article.date}
                        </span>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </section>
        </main>

        {/* Newsletter CTA */}
        <section className="bg-muted py-16">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <h2 className="mb-4 font-serif text-3xl font-bold text-foreground lg:text-4xl">
              Stay in the loop
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
              Get the latest articles, insights, and design inspiration
              delivered straight to your inbox. No spam, just the good stuff.
            </p>
            <form
              className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row"
              onSubmit={(e) => {
                e.preventDefault()
                const form = e.currentTarget
                const emailInput = form.querySelector(
                  'input[type="email"]',
                ) as HTMLInputElement
                if (emailInput?.value) {
                  void subscribe(emailInput.value)
                  emailInput.value = ''
                }
              }}
            >
              <input
                type="email"
                placeholder="Enter your email"
                aria-label="Email address for newsletter"
                required
                className="flex-1 rounded-full border border-border bg-background px-6 py-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <Button type="submit" className="rounded-full">
                Subscribe
              </Button>
            </form>
            <p className="mt-4 text-sm text-muted-foreground">
              By subscribing, you agree to our Privacy Policy. Unsubscribe
              anytime.
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-auto border-t border-border py-10">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6">
            <button
              type="button"
              onClick={() => go(nav[0])}
              className="font-bold tracking-tight text-foreground"
            >
              {brand}
            </button>
            <nav
              aria-label="Footer"
              className="flex flex-wrap gap-x-[1.125rem] gap-y-2 text-[0.9rem] text-muted-foreground"
            >
              {footerLinks.map((link) => (
                <button
                  key={link}
                  type="button"
                  onClick={() => go(link)}
                  className="transition-colors hover:text-foreground"
                >
                  {link}
                </button>
              ))}
            </nav>
            <div className="text-[0.85rem] text-muted-foreground">
              {copyright}
            </div>
          </div>
        </footer>
      </div>
    )
  },
})
