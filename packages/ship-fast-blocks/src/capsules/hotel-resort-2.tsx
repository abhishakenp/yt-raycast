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

export const HotelResortKimiPage2 = defineCapsule({
  name: "HotelResortKimiPage2",
  description:
    "Hotel Resort second style sibling to HotelResortKimiPage, converted from generated Kimi HTML into a responsive token-compliant page block with hero storytelling, metrics, content sections, image-led cards, and conversion actions.",
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
      reservations: table({
        guestName: string(),
        roomType: string(),
        checkIn: string(),
        checkOut: string(),
        guests: number(),
        status: string(),
      }),
      wishlist: table({
        itemTitle: string(),
      }),
    },
    queries: {
      reservations: ({ db }) => db.reservations.orderBy('createdAt').all(),
      wishlistItems: ({ db }) => new Set(db.wishlist.all().map((w) => w.itemTitle)),
    },
    mutations: {
      addReservation: ({ db }, roomType: string, checkIn: string, checkOut: string, guests: number) => {
        db.reservations.insert({ guestName: 'Guest', roomType, checkIn, checkOut, guests, status: 'Pending' })
        return db.reservations.orderBy('createdAt').all()
      },
      cancelReservation: ({ db }, id: string) => {
        db.reservations.delete(id)
        return db.reservations.orderBy('createdAt').all()
      },
      toggleWishlist: ({ db }, itemTitle: string) => {
        const existing = db.wishlist.where('itemTitle', itemTitle).all()[0]
        if (existing) {
          db.wishlist.delete(existing.id)
          return false
        }
        db.wishlist.insert({ itemTitle })
        return true
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [bookForm, setBookForm] = useState({ roomType: '', checkIn: '', checkOut: '', guests: 1 })

    const brand = props.brand ?? "Aurora Bay Resort & Spa"
    const nav = props.nav?.length ? props.nav : ["Aurora Bay", "Rooms & Villas", "Dining", "Experiences", "Gallery", "Contact"]
    const hero = {
      eyebrow: "Hotel Resort / Variant 2",
      title: "Where the Horizon Bends",
      description: "Aurora Bay Resort & Spa | Luxury Maldives Escape Aurora Bay Rooms & Villas Dining Experiences Gallery Contact Book Now Maldives All-Inclusive 48 Private Villas Where the Horizon...",
      primaryCta: "Aurora Bay",
      secondaryCta: "Rooms & Villas",
      imageAlt: "Aerial view of overwater villas at a luxury Maldives resort during golden hour",
      ...props.hero,
    }
    const metrics = props.metrics?.length ? props.metrics : [
      { value: "24/7", label: "Responsive service" },
      { value: "98%", label: "Positive outcomes" },
      { value: "4.9", label: "Average rating" },
      { value: "12+", label: "Core capabilities" },
    ]
    const sections = props.sections?.length ? props.sections : [
      { eyebrow: "Overview", title: "Uncompromising Luxury", body: "Aurora Bay Resort & Spa | Luxury Maldives Escape Aurora Bay Rooms & Villas Dining Experiences Gallery Contact Book Now Maldives All-Inclusive 48 Private Villas Where the Horizon...", items: ["Room & Villa Collection", "Words from Our Guests", "Frequently Asked"] },
      { eyebrow: "Experience", title: "Your Journey, Simplified", body: "Hotel Resort page variant 2 highlights the generated design's core message, section pacing, and conversion-focused content.", items: ["Begin Your Escape", "Overwater Villas", "Curated Dining"] },
      { eyebrow: "Proof", title: "A Visual Journey", body: "Hotel Resort page variant 3 highlights the generated design's core message, section pacing, and conversion-focused content.", items: ["Holistic Wellness", "Bespoke Adventures", "Choose Your Sanctuary"] },
      { eyebrow: "Next steps", title: "Room & Villa Collection", body: "Hotel Resort page variant 4 highlights the generated design's core message, section pacing, and conversion-focused content.", items: ["Curate Your Experience", "Arrive & Unwind", "Sunrise Beach Bungalow"] },
    ]
    const gallery = props.gallery?.length ? props.gallery : [
      { title: "Your Journey, Simplified", alt: "Aerial view of overwater villas at a luxury Maldives resort during golden hour", caption: "Hotel Resort generated page detail" },
      { title: "A Visual Journey", alt: "Aerial view of luxury overwater villas connected by wooden walkways at sunset", caption: "Hotel Resort generated page detail" },
      { title: "Room & Villa Collection", alt: "Infinity pool at a tropical luxury resort overlooking the ocean", caption: "Hotel Resort generated page detail" },
    ]

    const reservations = lakebed.useQuery('reservations')
    const wishlistItems = lakebed.useQuery('wishlistItems')
    const addReservation = lakebed.useMutation('addReservation')
    const cancelReservation = lakebed.useMutation('cancelReservation')
    const toggleWishlist = lakebed.useMutation('toggleWishlist')
    const auth = lakebed.useAuth()
    const isSignedIn = auth.isAuthenticated && !auth.isGuest
    const authEmail = auth.email || auth.user?.email
    const authPicture = auth.picture || auth.user?.picture
    const authDisplayName = auth.displayName || auth.user?.displayName || authEmail || 'Account'
    const authInitials = authDisplayName.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || 'ME'
    const authLabel = auth.isLoading ? 'Checking...' : isSignedIn ? authDisplayName : 'Sign in'

    const safeReservations = reservations ?? []
    const reservationCount = safeReservations.length

    const ChevronDown = () => (
      <svg className="size-4 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
        <polyline points="6 9 12 15 18 9" />
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
                    <button type="button" aria-label="Open account menu" className="hidden h-9 items-center gap-2 rounded-full border border-border bg-background/90 px-2 py-1 text-foreground shadow-sm transition hover:border-foreground/20 hover:bg-muted sm:inline-flex">
                      <Avatar size="sm" className="ring-2 ring-background" aria-hidden="true">
                        {authPicture ? <AvatarImage src={authPicture} alt={authDisplayName} /> : null}
                        <AvatarFallback className="bg-foreground text-[0.65rem] font-bold text-background">{authInitials}</AvatarFallback>
                      </Avatar>
                      <span className="hidden max-w-24 truncate text-sm font-semibold md:block">{authDisplayName}</span>
                      <ChevronDown />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="end" sideOffset={10} className="w-64 overflow-hidden rounded-xl border-border bg-background p-0 shadow-xl">
                    <div className="bg-muted/40 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar size="lg" className="ring-2 ring-background">
                          {authPicture ? <AvatarImage src={authPicture} alt={authDisplayName} /> : null}
                          <AvatarFallback className="bg-foreground text-sm font-bold text-background">{authInitials}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-foreground">{authDisplayName}</p>
                          <p className="truncate text-xs text-muted-foreground">{authEmail ?? 'Signed in'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-border p-2">
                      <button type="button" onClick={() => lakebed.signOut()} className="flex w-full items-center justify-center rounded-lg bg-foreground px-3 py-2 text-sm font-semibold text-background transition-colors hover:bg-foreground/90">
                        Sign out
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>
              ) : (
                <button
                  type="button"
                  onClick={() => { if (!auth.isLoading) void lakebed.signInWithGoogle() }}
                  disabled={auth.isLoading}
                  className="hidden h-9 items-center gap-2 rounded-full bg-foreground px-4 text-sm font-semibold text-background shadow-sm transition hover:bg-foreground/90 disabled:opacity-60 sm:inline-flex"
                >
                  <span className="grid size-4 place-items-center rounded-full bg-background text-xs font-black text-foreground">G</span>
                  <span>{authLabel}</span>
                </button>
              )}
              <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
                <SheetTrigger asChild>
                  <button
                    type="button"
                    className="relative rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    Book Now
                    {reservationCount > 0 && (
                      <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-foreground text-[0.625rem] font-bold text-background">
                        {reservationCount}
                      </span>
                    )}
                  </button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
                  <SheetHeader className="border-b border-border p-6">
                    <SheetTitle className="text-xl">Reservations</SheetTitle>
                    <SheetDescription>
                      {reservationCount > 0
                        ? `${reservationCount} reservation${reservationCount === 1 ? '' : 's'} for this session.`
                        : 'No reservations yet. Book your stay below.'}
                    </SheetDescription>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                    {/* Book form */}
                    <div className="rounded-lg border border-border bg-muted/40 p-4 space-y-3">
                      <p className="text-sm font-semibold text-foreground">New Reservation</p>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-muted-foreground">Room Type</label>
                        <select
                          value={bookForm.roomType}
                          onChange={(e) => setBookForm((f) => ({ ...f, roomType: e.target.value }))}
                          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          <option value="">Select a room…</option>
                          {(sections.flatMap((s) => s.items ?? [])).map((item) => (
                            <option key={item} value={item}>{item}</option>
                          ))}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="mb-1 block text-xs font-medium text-muted-foreground">Check-in</label>
                          <input
                            type="date"
                            value={bookForm.checkIn}
                            onChange={(e) => setBookForm((f) => ({ ...f, checkIn: e.target.value }))}
                            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-muted-foreground">Check-out</label>
                          <input
                            type="date"
                            value={bookForm.checkOut}
                            onChange={(e) => setBookForm((f) => ({ ...f, checkOut: e.target.value }))}
                            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-muted-foreground">Guests</label>
                        <input
                          type="number"
                          min={1}
                          max={10}
                          value={bookForm.guests}
                          onChange={(e) => setBookForm((f) => ({ ...f, guests: Math.max(1, Number(e.target.value)) }))}
                          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                      <Button
                        type="button"
                        className="w-full"
                        disabled={!bookForm.roomType || !bookForm.checkIn || !bookForm.checkOut}
                        onClick={() => {
                          void addReservation(bookForm.roomType, bookForm.checkIn, bookForm.checkOut, bookForm.guests)
                          setBookForm({ roomType: '', checkIn: '', checkOut: '', guests: 1 })
                        }}
                      >
                        Confirm Booking
                      </Button>
                    </div>
                    {/* Existing reservations */}
                    {safeReservations.length > 0 && (
                      <div className="space-y-3">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Your Reservations</p>
                        {safeReservations.map((r) => (
                          <div key={r.id} className="rounded-lg border border-border bg-card p-4">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="text-sm font-semibold text-card-foreground">{r.roomType}</p>
                                <p className="mt-1 text-xs text-muted-foreground">{r.checkIn} → {r.checkOut} · {r.guests} guest{r.guests !== 1 ? 's' : ''}</p>
                                <span className="mt-2 inline-block rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">{r.status}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => void cancelReservation(r.id)}
                                className="text-xs font-semibold text-muted-foreground underline-offset-4 hover:text-destructive hover:underline"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {safeReservations.length === 0 && (
                      <div className="flex min-h-40 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 px-6 text-center">
                        <p className="text-sm font-semibold text-foreground">No reservations yet</p>
                        <p className="mt-1 text-xs text-muted-foreground">Use the form above to book your stay.</p>
                      </div>
                    )}
                  </div>
                  <SheetFooter className="border-t border-border p-6">
                    <SheetClose asChild>
                      <Button type="button" variant="secondary" className="w-full">Close</Button>
                    </SheetClose>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
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
                    onClick={() => setDrawerOpen(true)}
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
                        const isWishlisted = wishlistItems?.has(item) ?? false
                        return (
                          <button
                            key={item}
                            type="button"
                            onClick={() => go(item)}
                            className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                          >
                            <span>{item}</span>
                            <span className="flex items-center gap-2">
                              <button
                                type="button"
                                aria-pressed={isWishlisted}
                                aria-label={isWishlisted ? `Remove ${item} from wishlist` : `Add ${item} to wishlist`}
                                onClick={(e) => { e.stopPropagation(); void toggleWishlist(item) }}
                                className={cn(
                                  'grid size-6 place-items-center rounded-full transition-colors',
                                  isWishlisted ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent',
                                )}
                              >
                                <svg className="size-3.5" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                </svg>
                              </button>
                              <span className="text-primary">{index + 1}</span>
                            </span>
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
                  onClick={() => setDrawerOpen(true)}
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
