import { useState } from 'react'
import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"
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

export const LinkInBioKimiPage2 = defineCapsule({
  name: "LinkInBioKimiPage2",
  description:
    "Link In Bio second style sibling to LinkInBioKimiPage, converted from generated Kimi HTML into a responsive token-compliant page block with hero storytelling, metrics, content sections, image-led cards, and conversion actions.",
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
      inquiries: table({
        name: string(),
        email: string(),
        message: string(),
        topic: string(),
      }),
      leads: table({
        email: string(),
        source: string(),
      }),
    },
    queries: {
      inquiries: ({ db }) => db.inquiries.orderBy('createdAt').all(),
      leadCount: ({ db }) => db.leads.all().length,
    },
    mutations: {
      submitInquiry: ({ db }, name: string, email: string, message: string, topic: string) => {
        db.inquiries.insert({ name, email, message, topic })
        return db.inquiries.orderBy('createdAt').all()
      },
      addLead: ({ db }, email: string, source: string) => {
        const existing = db.leads.where('email', email).all()[0]
        if (!existing) {
          db.leads.insert({ email, source })
        }
        return db.leads.all()
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [inquiryOpen, setInquiryOpen] = useState(false)
    const [inquiryForm, setInquiryForm] = useState({ name: '', email: '', message: '', topic: 'General' })
    const brand = props.brand ?? "Maya Chen Creative Director & Brand Strategist"
    const inquiries = lakebed.useQuery('inquiries')
    const leadCount = lakebed.useQuery('leadCount')
    const submitInquiry = lakebed.useMutation('submitInquiry')
    const addLead = lakebed.useMutation('addLead')
    const auth = lakebed.useAuth()
    const isSignedIn = auth.isAuthenticated && !auth.isGuest
    const authEmail = auth.email || auth.user?.email
    const authPicture = auth.picture || auth.user?.picture
    const authDisplayName = auth.displayName || auth.user?.displayName || authEmail || 'Account'
    const authInitials = authDisplayName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'ME'
    const authLabel = auth.isLoading ? 'Checking...' : isSignedIn ? authDisplayName : 'Sign in'
    const handleSignIn = () => {
      if (auth.isLoading) return
      void lakebed.signInWithGoogle()
    }
    const handleSignOut = () => {
      lakebed.signOut()
    }
    const handleSubmitInquiry = (e: React.FormEvent) => {
      e.preventDefault()
      if (!inquiryForm.name || !inquiryForm.email || !inquiryForm.message) return
      void submitInquiry(inquiryForm.name, inquiryForm.email, inquiryForm.message, inquiryForm.topic)
      void addLead(inquiryForm.email, 'link-in-bio-contact')
      setInquiryForm({ name: '', email: '', message: '', topic: 'General' })
      setInquiryOpen(false)
    }
    const nav = props.nav?.length ? props.nav : ["Maya Chen", "Pricing", "Book a Call"]
    const hero = {
      eyebrow: "Link In Bio / Variant 2",
      title: "Maya Chen",
      description: "Maya Chen Creative Director & Brand Strategist Maya Chen Pricing Book a Call Maya Chen Creative Director & Brand Strategist I help early-stage founders and culture-forward brand...",
      primaryCta: "Maya Chen",
      secondaryCta: "Pricing",
      imageAlt: "professional headshot of a smiling asian woman with dark hair wearing a black turtleneck",
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
    "title": "What I do",
    "body": "Maya Chen Creative Director & Brand Strategist Maya Chen Pricing Book a Call Maya Chen Creative Director & Brand Strategist I help early-stage founders and culture-forward brand...",
    "items": [
      "Client words",
      "Common questions",
      "Ready to stand out?"
    ]
  },
  {
    "eyebrow": "Experience",
    "title": "How we work",
    "body": "Link In Bio page variant 2 highlights the generated design's core message, section pacing, and conversion-focused content.",
    "items": [
      "Brand Identity",
      "Web Design",
      "Creative Direction"
    ]
  },
  {
    "eyebrow": "Proof",
    "title": "Selected work",
    "body": "Link In Bio page variant 3 highlights the generated design's core message, section pacing, and conversion-focused content.",
    "items": [
      "No-Code Builds",
      "Strategy Call",
      "Concept & Design"
    ]
  },
  {
    "eyebrow": "Next steps",
    "title": "Client words",
    "body": "Link In Bio page variant 4 highlights the generated design's core message, section pacing, and conversion-focused content.",
    "items": [
      "Build & Iterate",
      "Launch & Support",
      "Brightpath Packaging"
    ]
  }
]
    const gallery = props.gallery?.length ? props.gallery : [
  {
    "title": "How we work",
    "alt": "professional headshot of a smiling asian woman with dark hair wearing a black turtleneck",
    "caption": "Link In Bio generated page detail"
  },
  {
    "title": "Selected work",
    "alt": "Instagram logo icon",
    "caption": "Link In Bio generated page detail"
  },
  {
    "title": "Pricing",
    "alt": "LinkedIn logo icon",
    "caption": "Link In Bio generated page detail"
  }
]

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
              {isSignedIn ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      aria-label="Open account menu"
                      className="hidden h-10 max-w-48 items-center gap-2 rounded-full border border-border bg-background/90 px-2 py-1 text-foreground shadow-sm transition hover:border-foreground/20 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:inline-flex"
                    >
                      <Avatar size="sm" className="ring-2 ring-background" aria-hidden="true">
                        {authPicture ? <AvatarImage src={authPicture} alt={authDisplayName} /> : null}
                        <AvatarFallback className="bg-foreground text-[0.65rem] font-bold text-background">
                          {authInitials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden max-w-24 truncate text-sm font-semibold md:block">{authDisplayName}</span>
                      <ChevronDown />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="end" sideOffset={10} className="w-72 overflow-hidden rounded-xl border-border bg-background p-0 shadow-xl">
                    <div className="bg-muted/40 px-4 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar size="lg" className="ring-2 ring-background">
                          {authPicture ? <AvatarImage src={authPicture} alt={authDisplayName} /> : null}
                          <AvatarFallback className="bg-foreground text-sm font-bold text-background">{authInitials}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-foreground">{authDisplayName}</p>
                          <p className="truncate text-xs text-muted-foreground">{authEmail ?? 'Signed in to this session'}</p>
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
                  <span className="grid size-5 place-items-center rounded-full bg-background text-xs font-black text-foreground">G</span>
                  <span>{authLabel}</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setInquiryOpen(true)}
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {hero.primaryCta}
              </button>
            </div>
          </div>
        </header>

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
                    onClick={() => setInquiryOpen(true)}
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
                      {section.items.map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => go(item)}
                          className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                        >
                          <span>{item}</span>
                          <span className="text-primary">{index + 1}</span>
                        </button>
                      ))}
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
                  onClick={() => setInquiryOpen(true)}
                  className="rounded-md bg-background px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  {hero.primaryCta}
                </button>
              </div>
            </div>
          </section>
        </main>

        <Sheet open={inquiryOpen} onOpenChange={setInquiryOpen}>
          <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
            <SheetHeader className="border-b border-border p-6">
              <SheetTitle className="text-xl">Get in touch</SheetTitle>
              <SheetDescription>
                Send a message to {brand}. We'll get back to you within 24 hours.
              </SheetDescription>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <form onSubmit={handleSubmitInquiry} className="space-y-4">
                <div>
                  <label htmlFor="inquiry-name" className="mb-2 block text-sm font-medium text-foreground">
                    Name
                  </label>
                  <input
                    id="inquiry-name"
                    type="text"
                    value={inquiryForm.name}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, name: e.target.value })}
                    placeholder="Your name"
                    required
                    className="w-full rounded-md border border-border bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label htmlFor="inquiry-email" className="mb-2 block text-sm font-medium text-foreground">
                    Email
                  </label>
                  <input
                    id="inquiry-email"
                    type="email"
                    value={inquiryForm.email}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, email: e.target.value })}
                    placeholder="your@email.com"
                    required
                    className="w-full rounded-md border border-border bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label htmlFor="inquiry-topic" className="mb-2 block text-sm font-medium text-foreground">
                    Topic
                  </label>
                  <select
                    id="inquiry-topic"
                    value={inquiryForm.topic}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, topic: e.target.value })}
                    className="w-full rounded-md border border-border bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="General">General inquiry</option>
                    <option value="Pricing">Pricing</option>
                    <option value="Project">Project inquiry</option>
                    <option value="Collaboration">Collaboration</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="inquiry-message" className="mb-2 block text-sm font-medium text-foreground">
                    Message
                  </label>
                  <textarea
                    id="inquiry-message"
                    value={inquiryForm.message}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })}
                    placeholder="Tell us about your project or inquiry..."
                    required
                    rows={5}
                    className="w-full rounded-md border border-border bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  />
                </div>
              </form>
              {inquiries && inquiries.length > 0 && (
                <div className="mt-6 border-t border-border pt-6">
                  <p className="mb-3 text-sm font-medium text-muted-foreground">Recent inquiries</p>
                  <div className="space-y-3">
                    {inquiries.slice(0, 3).map((inquiry) => (
                      <div key={inquiry.id} className="rounded-lg bg-muted/40 p-3">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-semibold text-foreground">{inquiry.name}</p>
                          <span className="text-xs text-muted-foreground">{new Date(inquiry.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="mt-1 truncate text-xs text-muted-foreground">{inquiry.topic}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <SheetFooter className="border-t border-border p-6">
              <div className="grid w-full grid-cols-2 gap-3">
                <SheetClose asChild>
                  <Button type="button" variant="outline" className="rounded-full">
                    Cancel
                  </Button>
                </SheetClose>
                <Button type="button" className="rounded-full" onClick={handleSubmitInquiry}>
                  Send message
                </Button>
              </div>
            </SheetFooter>
          </SheetContent>
        </Sheet>

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
