import { useState } from "react"
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

export const MembershipClubKimiPage3 = defineCapsule({
  name: "MembershipClubKimiPage3",
  description:
    "Membership Club third style sibling to MembershipClubKimiPage, converted from generated Kimi HTML into a responsive token-compliant page block with hero storytelling, metrics, content sections, image-led cards, and conversion actions.",
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
        interest: string(),
        message: string(),
        touches: number(),
      }),
    },
    queries: {
      inquiries: ({ db }) => db.inquiries.orderBy("createdAt").all(),
    },
    mutations: {
      addInquiry: (
        { db },
        name: string,
        email: string,
        interest: string,
        message: string,
        touches: number,
      ) => {
        db.inquiries.insert({
          name,
          email,
          interest,
          message,
          touches,
        })
        return db.inquiries.all()
      },
      removeInquiry: ({ db }, inquiryId: string) => {
        db.inquiries.delete(inquiryId)
        return db.inquiries.all()
      },
      clearInquiries: ({ db }) => {
        for (const inquiry of db.inquiries.all()) {
          db.inquiries.delete(inquiry.id)
        }
        return []
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [applicationDrawerOpen, setApplicationDrawerOpen] = useState(false)
    const [applicationName, setApplicationName] = useState("")
    const [applicationEmail, setApplicationEmail] = useState("")
    const [applicationMessage, setApplicationMessage] = useState("")
    const [applicationSource, setApplicationSource] = useState(
      () => props.hero?.primaryCta ?? "Apex Guild",
    )
    const brand =
      props.brand ??
      "Apex Guild The Exclusive Network for Founders & Executives"
    const nav = props.nav?.length
      ? props.nav
      : [
          "Benefits",
          "Membership",
          "Gallery",
          "Stories",
          "FAQ",
          "Apex Guild",
        ]
    const hero = {
      eyebrow: "Membership Club / Variant 3",
      title: "Where the world's most ambitious leaders gather",
      description:
        "Apex Guild The Exclusive Network for Founders & Executives Apex Guild Benefits Membership Gallery Stories FAQ Apply Now Benefits Membership Gallery Stories FAQ Apply Now Now acc...",
      primaryCta: "Apex Guild",
      secondaryCta: "Benefits",
      imageAlt: "professional headshot of a confident founder in a navy blazer",
      ...props.hero,
    }
    const metrics = props.metrics?.length
      ? props.metrics
      : [
          {
            value: "24/7",
            label: "Responsive service",
          },
          {
            value: "98%",
            label: "Positive outcomes",
          },
          {
            value: "4.9",
            label: "Average rating",
          },
          {
            value: "12+",
            label: "Core capabilities",
          },
        ]
    const sections = props.sections?.length
      ? props.sections
      : [
          {
            eyebrow: "Overview",
            title: "Everything you need to scale",
            body: "Apex Guild The Exclusive Network for Founders & Executives Apex Guild Benefits Membership Gallery Stories FAQ Apply Now Benefits Membership Gallery Stories FAQ Apply Now Now acc...",
            items: [
              "Choose your level of access",
              "What our members say",
              "Questions & Answers",
            ],
          },
          {
            eyebrow: "Experience",
            title: "How membership works",
            body: "Membership Club page variant 2 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: [
              "Ready to join the inner circle?",
              "Curated Introductions",
              "Private Event Access",
            ],
          },
          {
            eyebrow: "Proof",
            title: "Inside Apex Guild",
            body: "Membership Club page variant 3 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: [
              "Executive Library",
              "Advisory Board",
              "Perks & Discounts",
            ],
          },
          {
            eyebrow: "Next steps",
            title: "Choose your level of access",
            body: "Membership Club page variant 4 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: [
              "Global Lounge Network",
              "Submit Your Application",
              "Interview & Evaluation",
            ],
          },
        ]
    const gallery = props.gallery?.length
      ? props.gallery
      : [
          {
            title: "How membership works",
            alt: "professional headshot of a confident founder in a navy blazer",
            caption: "Membership Club generated page detail",
          },
          {
            title: "Inside Apex Guild",
            alt: "professional headshot of a female tech executive with short hair",
            caption: "Membership Club generated page detail",
          },
          {
            title: "Choose your level of access",
            alt: "professional headshot of a smiling senior executive with glasses",
            caption: "Membership Club generated page detail",
          },
        ]

    const storedInquiries = lakebed.useQuery("inquiries")
    const addInquiry = lakebed.useMutation("addInquiry")
    const removeInquiry = lakebed.useMutation("removeInquiry")
    const clearInquiries = lakebed.useMutation("clearInquiries")
    const auth = lakebed.useAuth()
    const inquiries = storedInquiries ?? []
    const inquiryTouchCount = inquiries.reduce(
      (total, inquiry) => total + inquiry.touches,
      0,
    )
    const isSignedIn = auth.isAuthenticated && !auth.isGuest
    const authDisplayName =
      auth.displayName || auth.user?.displayName || auth.email || "Member"
    const authLabel = auth.isLoading
      ? "Checking..."
      : isSignedIn
        ? authDisplayName
        : "Sign in with Google"

    const openApplicationDrawer = (source: string) => {
      setApplicationSource(source)
      setApplicationDrawerOpen(true)
    }

    const shouldOpenDrawer = (label: string) => {
      const normalizedLabel = label.toLowerCase()

      return (
        normalizedLabel.includes("apply") ||
        normalizedLabel.includes("submit") ||
        normalizedLabel.includes("interview")
      )
    }

    const handleSignIn = () => {
      if (auth.isLoading) return
      void lakebed.signInWithGoogle()
    }

    const handleSignOut = () => {
      lakebed.signOut()
    }

    return (
      <div className={cn("min-h-screen bg-background text-foreground", props.className)}>
        <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
            <button
              type="button"
              onClick={() => go("Home")}
              className="text-left text-lg font-semibold tracking-tight"
            >
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
            <Sheet
              open={applicationDrawerOpen}
              onOpenChange={setApplicationDrawerOpen}
            >
              <SheetTrigger asChild>
                <button
                  type="button"
                  onClick={() => {
                    openApplicationDrawer(hero.primaryCta)
                    go(hero.primaryCta)
                  }}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {hero.primaryCta}
                  {inquiries.length ? (
                    <span className="ml-2 inline-flex size-5 items-center justify-center rounded-full bg-primary-foreground px-1 text-[0.625rem] font-bold text-primary">
                      {inquiries.length}
                    </span>
                  ) : null}
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
                <SheetHeader className="border-b border-border p-6">
                  <SheetTitle className="text-xl">
                    Membership inquiry desk
                  </SheetTitle>
                  <SheetDescription>
                    Save your membership interest and leave a note for follow-up.
                  </SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-6 py-5">
                  <form
                    className="mb-6 rounded-lg border border-border bg-muted/40 p-4"
                    onSubmit={(event) => {
                      event.preventDefault()

                      const nextName = applicationName.trim() || "Member"
                      const nextEmail = applicationEmail.trim()
                      const nextMessage = applicationMessage.trim()
                        ? applicationMessage.trim()
                        : "Interested in membership."

                      if (!nextEmail) return

                      void addInquiry(
                        nextName,
                        nextEmail,
                        applicationSource || hero.primaryCta,
                        nextMessage,
                        1,
                      )
                      setApplicationName("")
                      setApplicationEmail("")
                      setApplicationMessage("")
                    }}
                  >
                    <div className="mb-3 space-y-2">
                      <label
                        htmlFor="membership-name"
                        className="block text-sm font-semibold text-foreground"
                      >
                        Name
                      </label>
                      <input
                        id="membership-name"
                        value={applicationName}
                        onChange={(event) => setApplicationName(event.target.value)}
                        placeholder="Your name"
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none ring-0 transition-colors focus:ring-1 focus:ring-ring"
                      />
                    </div>
                    <div className="mb-3 space-y-2">
                      <label
                        htmlFor="membership-email"
                        className="block text-sm font-semibold text-foreground"
                      >
                        Email
                      </label>
                      <input
                        id="membership-email"
                        type="email"
                        required
                        value={applicationEmail}
                        onChange={(event) => setApplicationEmail(event.target.value)}
                        placeholder="you@company.com"
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none ring-0 transition-colors focus:ring-1 focus:ring-ring"
                      />
                    </div>
                    <div className="mb-4 space-y-2">
                      <label
                        htmlFor="membership-message"
                        className="block text-sm font-semibold text-foreground"
                      >
                        Message
                      </label>
                      <textarea
                        id="membership-message"
                        rows={3}
                        value={applicationMessage}
                        onChange={(event) =>
                          setApplicationMessage(event.target.value)
                        }
                        placeholder="Share your interest and goals."
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none ring-0 transition-colors focus:ring-1 focus:ring-ring"
                      />
                    </div>
                    <Button type="submit" className="w-full rounded-full">
                      Save inquiry
                    </Button>
                  </form>

                  {inquiries.length ? (
                    <div className="space-y-4">
                      {inquiries.map((inquiry) => (
                        <article
                          key={inquiry.id}
                          className="rounded-lg border border-border bg-card p-4"
                        >
                          <div className="mb-2 flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-foreground">
                                {inquiry.name}
                              </p>
                              <p className="truncate text-xs text-muted-foreground">
                                {inquiry.email}
                              </p>
                              <p className="mt-2 text-xs font-medium text-muted-foreground">
                                {inquiry.interest}
                              </p>
                              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                {inquiry.message}
                              </p>
                              <p className="mt-2 text-xs text-muted-foreground">
                                Touches: {inquiry.touches}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => void removeInquiry(inquiry.id)}
                              className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                            >
                              Remove
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed border-border bg-muted/40 px-4 py-4 text-sm text-muted-foreground">
                      No inquiries yet. Add one from a CTA to track interest.
                    </div>
                  )}
                </div>

                <SheetFooter className="border-t border-border p-6">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Recorded inquiries</span>
                      <span className="font-semibold text-foreground">
                        {inquiries.length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Total touches</span>
                      <span className="font-semibold text-foreground">
                        {inquiryTouchCount}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {isSignedIn
                        ? `Signed in as ${authDisplayName}`
                        : "Sign in to persist leads across devices."}
                    </p>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-full"
                      onClick={() => void clearInquiries()}
                      disabled={!inquiries.length}
                    >
                      Clear inquiries
                    </Button>
                    <SheetClose asChild>
                      <Button type="button" className="rounded-full">
                        Close
                      </Button>
                    </SheetClose>
                  </div>
                  <div className="mt-2">
                    {isSignedIn ? (
                      <Button
                        type="button"
                        variant="secondary"
                        className="w-full rounded-full"
                        onClick={handleSignOut}
                      >
                        Sign out
                      </Button>
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
                  </div>
                </SheetFooter>
              </SheetContent>
            </Sheet>
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
                    onClick={() => {
                      openApplicationDrawer(hero.primaryCta)
                      go(hero.primaryCta)
                    }}
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
                <Image
                  alt={hero.imageAlt}
                  w={1200}
                  h={900}
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
            </div>
          </section>

          <section className="mx-auto grid max-w-7xl gap-4 px-5 py-10 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-lg border border-border bg-card p-5"
              >
                <p className="text-3xl font-semibold text-card-foreground">
                  {metric.value}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {metric.label}
                </p>
              </div>
            ))}
          </section>

          <section className="border-y border-border bg-muted/40">
            <div className="mx-auto grid max-w-7xl gap-5 px-5 py-14 md:grid-cols-2">
              {sections.map((section, index) => (
                <article
                  key={section.title}
                  className="rounded-lg border border-border bg-card p-6"
                >
                  <p className="text-sm font-medium text-primary">{section.eyebrow}</p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-card-foreground">
                    {section.title}
                  </h2>
                  <p className="mt-3 leading-7 text-muted-foreground">{section.body}</p>
                  {section.items?.length ? (
                    <div className="mt-5 grid gap-2">
                      {section.items.map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => {
                            if (shouldOpenDrawer(item)) {
                              openApplicationDrawer(item)
                            }
                            go(item)
                          }}
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
                <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                  Content-led page moments
                </h2>
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
                <article
                  key={item.title}
                  className="overflow-hidden rounded-lg border border-border bg-card"
                >
                  <Image
                    alt={item.alt}
                    w={900}
                    h={700}
                    loading="lazy"
                    className="aspect-[4/3] w-full object-cover"
                  />
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-card-foreground">
                      {item.title}
                    </h3>
                    {item.caption ? (
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {item.caption}
                      </p>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-5 pb-16">
            <div className="rounded-lg border border-border bg-primary p-8 text-primary-foreground md:p-10">
              <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <p className="text-sm font-medium text-primary-foreground/70">
                    {brand}
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                    Ready for the next step?
                  </h2>
                  <p className="mt-3 max-w-2xl leading-7 text-primary-foreground/80">
                    {hero.description}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    openApplicationDrawer(hero.primaryCta)
                    go(hero.primaryCta)
                  }}
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
            <p className="text-sm text-muted-foreground">
              (c) {new Date().getFullYear()} {brand}. All rights reserved.
            </p>
            <div className="flex flex-wrap gap-3">
              {nav.slice(0, 4).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => go(item)}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
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
