import { useState, useEffect } from 'react'
import { z } from 'zod/v4'
import { defineCapsule } from './openui.ts'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'
import { number, string, table } from '@ship-fast/lakebed/server'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '#/components/ui/sheet.tsx'
import { Button } from '#/components/ui/button.tsx'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '#/components/ui/popover.tsx'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar.tsx'

/**
 * WeddingKimiPage — a complete, self-contained wedding-invitation / save-the-date
 * LANDING page. A faithful Tailwind v4 port of a Kimi-generated "Emma & James"
 * design: an elegant, editorial, warm-neutral aesthetic with serif display
 * headings, generous whitespace, thin divider rules, and soft section bands.
 *
 * It pairs a full-bleed photographic hero (couple names, date, venue, dual CTAs,
 * scroll cue) with an "Our Story" timeline of dated milestones, a center-line
 * day-of "Wedding Schedule" with alternating photo cards, a "Travel & Stay"
 * details grid (venue / accommodations / dress code) plus a getting-there split,
 * a masonry-style "Photo Gallery", a full RSVP form (name, email, attendance
 * radios, guest count, dietary notes, shuttle opt-in), and a dark footer with
 * couple monogram and social links.
 *
 * The block owns ALL layout, spacing, type hierarchy and section bands. Every
 * nav item / CTA / link / form submit routes through `useNavigate` (never a dead
 * "#"). All imagery uses the alt-driven <Image> component (never a raw src).
 * Callers supply ONLY content data; rich defaults make it render great with no
 * props at all — the orchestrator may call it with just (brand, nav).
 */
export const WeddingKimiPage = defineCapsule({
  name: 'WeddingKimiPage',
  description:
    "Complete WEDDING invitation / save-the-date / wedding-website LANDING page with an elegant, editorial, romantic warm-neutral aesthetic: serif display headings, airy whitespace, thin divider rules and soft section bands. Includes a full-bleed photographic hero (couple names like 'Emma & James', wedding date, venue/location, RSVP + Our Story CTAs, scroll cue), an 'Our Story / How We Met' dated milestone timeline, a center-line day-of 'Wedding Schedule' with alternating photo cards (arrival, ceremony, cocktail hour, dinner, dancing), a 'Travel & Stay' details grid (venue address, accommodations, dress code) with a getting-there/shuttle split, a masonry photo gallery of engagement memories, a full RSVP form (first/last name, email, joyfully-accept/regretfully-decline radios, guest count select, dietary restrictions, shuttle opt-in), and a dark footer with couple monogram and Instagram social link. Use as the ROOT/home page for weddings, engagements, save-the-dates, marriage celebrations, bridal events, vow renewals or couple event sites when a refined, photo-led, RSVP-focused page is wanted. Supply content only — brand/monogram, nav, hero, story, schedule, details, gallery, rsvp, footer; the block owns all layout and styling.",
  props: z.object({
    /** Couple monogram / brand shown in navbar + footer (e.g. "E & J"). */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Full-bleed photographic hero. */
    hero: z
      .object({
        eyebrow: z.string().optional(),
        names: z.string().optional(),
        date: z.string().optional(),
        location: z.string().optional(),
        imageAlt: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
      })
      .optional(),
    /** "How We Met" dated milestone timeline. */
    story: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        imageAlt: z.string().optional(),
        milestones: z
          .array(
            z.object({
              date: z.string(),
              title: z.string(),
              text: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Day-of schedule with alternating photo cards. */
    schedule: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        subheading: z.string().optional(),
        items: z
          .array(
            z.object({
              time: z.string(),
              title: z.string(),
              text: z.string(),
              imageAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Travel & stay details grid + getting-there split. */
    details: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        cards: z
          .array(
            z.object({
              icon: z.enum(['pin', 'building', 'dress']),
              title: z.string(),
              text: z.string(),
              link: z.string().optional(),
              note: z.string().optional(),
            }),
          )
          .optional(),
        gettingThereHeading: z.string().optional(),
        gettingThere: z
          .array(z.object({ label: z.string(), text: z.string() }))
          .optional(),
        gettingThereImageAlt: z.string().optional(),
      })
      .optional(),
    /** Engagement photo gallery. */
    gallery: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        subheading: z.string().optional(),
        images: z.array(z.string()).optional(),
      })
      .optional(),
    /** RSVP form. */
    rsvp: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        subheading: z.string().optional(),
        attendOptions: z.array(z.string()).optional(),
        guestOptions: z.array(z.string()).optional(),
        shuttleLabel: z.string().optional(),
        submit: z.string().optional(),
        contactNote: z.string().optional(),
        email: z.string().optional(),
      })
      .optional(),
    /** Dark footer. */
    footer: z
      .object({
        date: z.string().optional(),
        location: z.string().optional(),
        message: z.string().optional(),
        messageSub: z.string().optional(),
        note: z.string().optional(),
        socials: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: {
    schema: {
      rsvps: table({
        firstName: string(),
        lastName: string(),
        email: string(),
        attendance: string(),
        guestCount: number(),
        dietaryRestrictions: string(),
        needsShuttle: string(),
      }),
    },
    queries: {
      rsvps: ({ db }) => db.rsvps.orderBy('createdAt').all(),
    },
    mutations: {
      submitRsvp: (
        { db },
        firstName: string,
        lastName: string,
        email: string,
        attendance: string,
        guestCount: number,
        dietaryRestrictions: string,
        needsShuttle: string,
      ) => {
        const existing = db.rsvps.where('email', email).all()[0]
        if (existing) {
          db.rsvps.update(existing.id, {
            firstName,
            lastName,
            attendance,
            guestCount,
            dietaryRestrictions,
            needsShuttle,
          })
        } else {
          db.rsvps.insert({
            firstName,
            lastName,
            email,
            attendance,
            guestCount,
            dietaryRestrictions,
            needsShuttle,
          })
        }
        return db.rsvps.where('email', email).all()[0]
      },
      deleteRsvp: ({ db }, email: string) => {
        for (const rsvp of db.rsvps.where('email', email).all()) {
          db.rsvps.delete(rsvp.id)
        }
        return []
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [rsvpDrawerOpen, setRsvpDrawerOpen] = useState(false)
    const [rsvpForm, setRsvpForm] = useState({
      firstName: '',
      lastName: '',
      email: '',
      attendance: '',
      guestCount: 1,
      dietaryRestrictions: '',
      needsShuttle: false,
    })
    const brand = props.brand ?? 'E & J'

    const rsvps = lakebed.useQuery('rsvps')
    const submitRsvp = lakebed.useMutation('submitRsvp')
    const deleteRsvp = lakebed.useMutation('deleteRsvp')
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

    const handleRsvpSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      void submitRsvp(
        rsvpForm.firstName,
        rsvpForm.lastName,
        rsvpForm.email,
        rsvpForm.attendance,
        rsvpForm.guestCount,
        rsvpForm.dietaryRestrictions,
        rsvpForm.needsShuttle ? 'yes' : 'no',
      )
      setRsvpDrawerOpen(true)
    }

    const myRsvp = authEmail
      ? rsvps?.find((r) => r.email === authEmail)
      : undefined

    // Pre-fill form if user is signed in and has existing RSVP
    useEffect(() => {
      if (isSignedIn && authEmail && myRsvp && !rsvpForm.firstName) {
        setRsvpForm({
          firstName: myRsvp.firstName,
          lastName: myRsvp.lastName,
          email: myRsvp.email,
          attendance: myRsvp.attendance,
          guestCount: myRsvp.guestCount,
          dietaryRestrictions: myRsvp.dietaryRestrictions,
          needsShuttle: myRsvp.needsShuttle === 'yes',
        })
      } else if (isSignedIn && authEmail && !rsvpForm.email) {
        setRsvpForm((prev) => ({ ...prev, email: authEmail }))
      }
    }, [isSignedIn, authEmail, myRsvp])

    const nav = props.nav?.length
      ? props.nav
      : ['Our Story', 'Schedule', 'Gallery', 'Details', 'RSVP']

    const heroEyebrow = props.hero?.eyebrow ?? 'Together Forever'
    const heroNames = props.hero?.names ?? 'Emma & James'
    const heroDate = props.hero?.date ?? 'September 12, 2026'
    const heroLocation =
      props.hero?.location ?? 'Willowbrook Estate • Napa Valley, California'
    const heroImageAlt =
      props.hero?.imageAlt ??
      'couple walking through a sunlit vineyard path holding hands'
    const heroPrimary = props.hero?.primaryCta ?? 'RSVP Now'
    const heroSecondary = props.hero?.secondaryCta ?? 'Our Story'

    const storyEyebrow = props.story?.eyebrow ?? 'Our Journey'
    const storyHeading = props.story?.heading ?? 'How We Met'
    const storyImageAlt =
      props.story?.imageAlt ??
      'young couple laughing together at a cozy coffee shop with warm lighting'
    const storyMilestones = props.story?.milestones?.length
      ? props.story.milestones
      : [
          {
            date: 'June 2018',
            title: 'The Coffee Shop Encounter',
            text: 'Emma was working on her laptop at Blue Bottle Coffee on Market Street when James accidentally knocked her americano onto her keyboard. Mortified, he offered to buy her another—and a new keyboard. Three hours later, they were still talking.',
          },
          {
            date: 'March 2019',
            title: 'Our First Adventure',
            text: "We spent a long weekend in Mendocino, hiking coastal trails and staying in a tiny cabin with no WiFi. It rained the entire time. We didn't mind. That weekend, we knew this was something special.",
          },
          {
            date: 'December 2024',
            title: 'The Proposal',
            text: 'On a quiet Tuesday evening at our favorite neighborhood restaurant, E Tutto Qua, James got down on one knee while the staff—who had been in on the plan—played our song. Emma said yes before he could finish asking.',
          },
        ]

    const scheduleEyebrow = props.schedule?.eyebrow ?? 'The Day Of'
    const scheduleHeading = props.schedule?.heading ?? 'Wedding Schedule'
    const scheduleSub =
      props.schedule?.subheading ??
      'September 12, 2026 • Willowbrook Estate, 4825 Napa Valley Highway, Napa, CA 94558'
    const scheduleItems = props.schedule?.items?.length
      ? props.schedule.items
      : [
          {
            time: '3:00 PM',
            title: 'Guest Arrival',
            text: 'Welcome drinks served on the garden terrace. Please arrive by 3:30 PM to be seated.',
            imageAlt: 'elegant champagne glasses on a garden terrace at sunset',
          },
          {
            time: '4:00 PM',
            title: 'Ceremony',
            text: "Outdoor ceremony in the estate garden. In case of rain, we'll move to the covered pavilion.",
            imageAlt:
              'wedding ceremony setup with white chairs in a garden setting',
          },
          {
            time: '4:45 PM',
            title: 'Cocktail Hour',
            text: "Signature cocktails, passed hors d'oeuvres, and lawn games while we take photos.",
            imageAlt: 'elegant cocktail drinks served on a garden bar',
          },
          {
            time: '6:00 PM',
            title: 'Dinner Reception',
            text: 'Seated dinner in the vineyard barn. Toasts, first dance, and family-style California cuisine.',
            imageAlt:
              'elegant wedding reception dinner table with floral centerpieces',
          },
          {
            time: '8:00 PM',
            title: 'Dancing',
            text: 'Live band starts, cake cutting, and dancing until late. Sparkler send-off at 10:30 PM.',
            imageAlt:
              'wedding guests dancing at an outdoor evening reception with string lights',
          },
        ]

    const detailsEyebrow = props.details?.eyebrow ?? 'Practical Information'
    const detailsHeading = props.details?.heading ?? 'Travel & Stay'
    const detailsCards = props.details?.cards?.length
      ? props.details.cards
      : [
          {
            icon: 'pin' as const,
            title: 'Venue',
            text: 'Willowbrook Estate, 4825 Napa Valley Highway, Napa, CA 94558',
            note: '45 minutes from San Francisco International Airport',
          },
          {
            icon: 'building' as const,
            title: 'Accommodations',
            text: "We've reserved a room block at the Vintage House in Yountville, 10 minutes from the venue.",
            link: 'Book by August 1st',
          },
          {
            icon: 'dress' as const,
            title: 'Dress Code',
            text: 'Garden party formal. The ceremony and cocktail hour are outdoors on grass—please wear appropriate footwear.',
            note: 'Warm neutral tones recommended',
          },
        ]
    const gettingThereHeading =
      props.details?.gettingThereHeading ?? 'Getting There'
    const gettingThere = props.details?.gettingThere?.length
      ? props.details.gettingThere
      : [
          {
            label: 'By Car:',
            text: 'From San Francisco, take Highway 101 North to Highway 37 East, then Highway 121 North to Highway 12 East. The estate is 2 miles past the town of Napa on the right.',
          },
          {
            label: 'Shuttle Service:',
            text: "We'll be providing shuttle buses from the Vintage House in Yountville departing at 2:30 PM and 3:00 PM. Return shuttles leave the venue at 11:00 PM.",
          },
          {
            label: 'Rideshare:',
            text: 'Uber and Lyft operate in the area, but availability can be limited on weekend evenings. We recommend booking your return ride in advance.',
          },
        ]
    const gettingThereImageAlt =
      props.details?.gettingThereImageAlt ??
      'aerial view of rolling vineyard hills in Napa Valley at golden hour'

    const galleryEyebrow = props.gallery?.eyebrow ?? 'Memories'
    const galleryHeading = props.gallery?.heading ?? 'Photo Gallery'
    const gallerySub =
      props.gallery?.subheading ??
      'Moments from our engagement and favorite adventures together'
    const galleryImages = props.gallery?.images?.length
      ? props.gallery.images
      : [
          'couple laughing while sitting on a park bench in autumn',
          'couple walking hand in hand on a sandy beach at sunset',
          'couple hiking in a forest with backpacks',
          'couple embracing in a golden wheat field at sunset',
          'couple toasting wine glasses at a vineyard winery',
          'couple riding bicycles on a coastal road',
          'couple cooking together in a modern kitchen',
          'couple sitting by a campfire under a starry night sky',
        ]
    const galleryWide = [
      'engagement ring close-up with bokeh lights in background',
      'couple dancing at a rooftop bar at night',
      'couple exploring a farmers market on a sunny morning',
    ]

    const rsvpEyebrow = props.rsvp?.eyebrow ?? 'Join Us'
    const rsvpHeading = props.rsvp?.heading ?? 'RSVP'
    const rsvpSub = props.rsvp?.subheading ?? 'Please respond by August 1, 2026'
    const attendOptions = props.rsvp?.attendOptions?.length
      ? props.rsvp.attendOptions
      : ['Joyfully Accept', 'Regretfully Decline']
    const guestOptions = props.rsvp?.guestOptions?.length
      ? props.rsvp.guestOptions
      : ['1 guest', '2 guests', '3 guests', '4 guests']
    const shuttleLabel =
      props.rsvp?.shuttleLabel ??
      'We would like to use the shuttle service from the Vintage House'
    const rsvpSubmit = props.rsvp?.submit ?? 'Submit RSVP'
    const rsvpContactNote = props.rsvp?.contactNote ?? 'Questions? Email us at'
    const rsvpEmail = props.rsvp?.email ?? 'wedding@emmaandjames.com'

    const footerDate = props.footer?.date ?? 'September 12, 2026'
    const footerLocation = props.footer?.location ?? 'Napa Valley, California'
    const footerMessage = props.footer?.message ?? 'With love, Emma & James'
    const footerMessageSub =
      props.footer?.messageSub ?? 'Thank you for being part of our story'
    const footerNote =
      props.footer?.note ?? 'Made with love for our wedding day'
    const footerSocials = props.footer?.socials?.length
      ? props.footer.socials
      : ['Instagram']

    const navCta = nav[nav.length - 1]

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

    const detailIcons: Record<string, React.ReactNode> = {
      pin: (
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      building: (
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      dress: (
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    }

    const inputCls =
      'w-full rounded-sm border border-input bg-muted px-4 py-3 text-foreground placeholder-muted-foreground transition-colors focus:border-ring focus:outline-none'

    return (
      <div
        className={cn(
          'min-h-svh bg-background font-sans text-foreground antialiased',
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/90 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="flex h-20 items-center justify-between">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="font-serif text-2xl tracking-wide text-foreground"
              >
                {brand}
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
                          onClick={() => setRsvpDrawerOpen(true)}
                          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          Your RSVP
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
                <button
                  type="button"
                  onClick={() => go(navCta)}
                  className="relative rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {navCta}
                  {myRsvp ? (
                    <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-background text-[0.625rem] font-bold text-primary">
                      ✓
                    </span>
                  ) : null}
                </button>
              </div>
              <button
                type="button"
                aria-label="Open menu"
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
                onClick={() => setMobileOpen((v: boolean) => !v)}
                className="p-2 text-muted-foreground md:hidden"
              >
                <svg
                  className="size-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
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
                    {label === navCta && myRsvp ? (
                      <span className="ml-2 inline-flex size-5 items-center justify-center rounded-full bg-primary text-[0.625rem] font-bold text-primary-foreground">
                        ✓
                      </span>
                    ) : null}
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
                          setRsvpDrawerOpen(true)
                        }}
                        className="w-full rounded-full"
                      >
                        Your RSVP
                      </Button>
                      <Button
                        type="button"
                        onClick={() => {
                          setMobileOpen(false)
                          handleSignOut()
                        }}
                        className="w-full rounded-full"
                        variant="outline"
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
          {/* Hero */}
          <header className="relative flex min-h-screen items-center justify-center pt-20">
            <div className="absolute inset-0 z-0">
              <Image
                alt={heroImageAlt}
                w={1920}
                h={1280}
                className="size-full object-cover"
              />
              <div className="absolute inset-0 bg-foreground/30" />
            </div>
            <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
              <p className="mb-6 text-sm uppercase tracking-[0.3em] text-background/90">
                {heroEyebrow}
              </p>
              <h1 className="mb-8 font-serif text-5xl leading-tight text-background md:text-7xl lg:text-8xl">
                {heroNames}
              </h1>
              <p className="mb-4 text-lg font-light text-background/80 md:text-xl">
                {heroDate}
              </p>
              <p className="mb-12 text-base text-background/70">
                {heroLocation}
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(heroPrimary)}
                  className="rounded-full bg-background px-8 py-4 text-sm tracking-wide text-foreground transition-colors hover:bg-muted"
                >
                  {heroPrimary}
                </button>
                <button
                  type="button"
                  onClick={() => go(heroSecondary)}
                  className="rounded-full border border-background/50 px-8 py-4 text-sm tracking-wide text-background transition-colors hover:bg-background/10"
                >
                  {heroSecondary}
                </button>
              </div>
            </div>
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce">
              <svg
                className="size-6 text-background/60"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </div>
          </header>

          {/* Our Story */}
          <section className="bg-card py-24 md:py-32">
            <div className="mx-auto max-w-6xl px-6 lg:px-8">
              <div className="mb-20 text-center">
                <span className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
                  {storyEyebrow}
                </span>
                <h2 className="mb-6 mt-4 font-serif text-4xl text-card-foreground md:text-5xl">
                  {storyHeading}
                </h2>
                <div className="mx-auto h-px w-16 bg-border" />
              </div>

              <div className="grid items-center gap-16 md:grid-cols-2">
                <div className="order-2 md:order-1">
                  <Image
                    alt={storyImageAlt}
                    w={800}
                    h={1000}
                    loading="lazy"
                    className="aspect-[4/5] w-full rounded-sm object-cover"
                  />
                </div>
                <div className="order-1 space-y-8 md:order-2">
                  {storyMilestones.map((m) => (
                    <div key={m.title}>
                      <span className="text-sm text-muted-foreground">
                        {m.date}
                      </span>
                      <h3 className="mb-4 mt-2 font-serif text-2xl text-card-foreground">
                        {m.title}
                      </h3>
                      <p className="leading-relaxed text-muted-foreground">
                        {m.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Schedule */}
          <section className="bg-muted py-24 md:py-32">
            <div className="mx-auto max-w-5xl px-6 lg:px-8">
              <div className="mb-20 text-center">
                <span className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
                  {scheduleEyebrow}
                </span>
                <h2 className="mb-6 mt-4 font-serif text-4xl text-foreground md:text-5xl">
                  {scheduleHeading}
                </h2>
                <p className="mx-auto max-w-xl text-muted-foreground">
                  {scheduleSub}
                </p>
                <div className="mx-auto mt-6 h-px w-16 bg-border" />
              </div>

              <div className="relative space-y-12">
                <div className="absolute bottom-0 left-1/2 top-0 hidden w-px -translate-x-1/2 bg-border md:block" />

                {scheduleItems.map((item, i) => {
                  const textFirst = i % 2 === 1
                  const TextBlock = (
                    <div
                      className={cn(
                        'md:w-1/2',
                        textFirst ? 'md:pl-12' : 'md:pr-12 md:text-right',
                      )}
                    >
                      <span className="text-sm text-muted-foreground">
                        {item.time}
                      </span>
                      <h3 className="mt-1 font-serif text-2xl text-foreground">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-muted-foreground">{item.text}</p>
                    </div>
                  )
                  const ImageBlock = (
                    <div
                      className={cn(
                        'mt-4 md:mt-0 md:w-1/2',
                        textFirst ? 'md:pr-12' : 'md:pl-12',
                      )}
                    >
                      <Image
                        alt={item.imageAlt}
                        w={400}
                        h={160}
                        loading="lazy"
                        className="h-32 w-full rounded-sm object-cover"
                      />
                    </div>
                  )
                  return (
                    <div
                      key={item.title}
                      className="items-center gap-8 md:flex"
                    >
                      {textFirst ? ImageBlock : TextBlock}
                      <div
                        className={cn(
                          'z-10 hidden size-4 rounded-full border-4 border-muted md:flex',
                          textFirst ? 'bg-primary' : 'bg-muted-foreground',
                        )}
                      />
                      {textFirst ? TextBlock : ImageBlock}
                    </div>
                  )
                })}
              </div>
            </div>
          </section>

          {/* Details */}
          <section className="bg-card py-24 md:py-32">
            <div className="mx-auto max-w-6xl px-6 lg:px-8">
              <div className="mb-20 text-center">
                <span className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
                  {detailsEyebrow}
                </span>
                <h2 className="mb-6 mt-4 font-serif text-4xl text-card-foreground md:text-5xl">
                  {detailsHeading}
                </h2>
                <div className="mx-auto h-px w-16 bg-border" />
              </div>

              <div className="grid gap-12 md:grid-cols-3">
                {detailsCards.map((card) => (
                  <div key={card.title} className="text-center">
                    <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
                      {detailIcons[card.icon]}
                    </div>
                    <h3 className="mb-3 font-serif text-xl text-card-foreground">
                      {card.title}
                    </h3>
                    <p className="mb-4 leading-relaxed text-muted-foreground">
                      {card.text}
                    </p>
                    {card.link ? (
                      <button
                        type="button"
                        onClick={() => go(card.link ?? card.title)}
                        className="text-sm text-card-foreground underline underline-offset-4 transition-colors hover:text-muted-foreground"
                      >
                        {card.link}
                      </button>
                    ) : null}
                    {card.note ? (
                      <p className="text-sm text-muted-foreground">
                        {card.note}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>

              <div className="mt-20 border-t border-border pt-16">
                <div className="grid items-center gap-12 md:grid-cols-2">
                  <div>
                    <h3 className="mb-4 font-serif text-2xl text-card-foreground">
                      {gettingThereHeading}
                    </h3>
                    <div className="space-y-4 text-muted-foreground">
                      {gettingThere.map((g) => (
                        <p key={g.label}>
                          <strong className="text-card-foreground">
                            {g.label}
                          </strong>{' '}
                          {g.text}
                        </p>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Image
                      alt={gettingThereImageAlt}
                      w={800}
                      h={450}
                      loading="lazy"
                      className="aspect-video w-full rounded-sm object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Gallery */}
          <section className="bg-muted py-24 md:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mb-20 text-center">
                <span className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
                  {galleryEyebrow}
                </span>
                <h2 className="mb-6 mt-4 font-serif text-4xl text-foreground md:text-5xl">
                  {galleryHeading}
                </h2>
                <p className="mx-auto max-w-xl text-muted-foreground">
                  {gallerySub}
                </p>
                <div className="mx-auto mt-6 h-px w-16 bg-border" />
              </div>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {galleryImages.map((alt, i) => (
                  <div key={alt} className="space-y-4">
                    <Image
                      alt={alt}
                      w={400}
                      h={i % 2 === 0 ? 520 : 400}
                      loading="lazy"
                      className={cn(
                        'w-full rounded-sm object-cover transition-opacity hover:opacity-90',
                        i % 2 === 0 ? 'aspect-[3/4]' : 'aspect-square',
                      )}
                    />
                  </div>
                ))}
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
                {galleryWide.map((alt, i) => (
                  <Image
                    key={alt}
                    alt={alt}
                    w={600}
                    h={338}
                    loading="lazy"
                    className={cn(
                      'aspect-video w-full rounded-sm object-cover transition-opacity hover:opacity-90',
                      i === 2 ? 'hidden md:block' : null,
                    )}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* RSVP */}
          <section className="bg-card py-24 md:py-32">
            <div className="mx-auto max-w-2xl px-6 lg:px-8">
              <div className="mb-12 text-center">
                <span className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
                  {rsvpEyebrow}
                </span>
                <h2 className="mb-6 mt-4 font-serif text-4xl text-card-foreground md:text-5xl">
                  {rsvpHeading}
                </h2>
                <p className="text-muted-foreground">{rsvpSub}</p>
                <div className="mx-auto mt-6 h-px w-16 bg-border" />
              </div>

              <form className="space-y-6" onSubmit={handleRsvpSubmit}>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="wedding-first"
                      className="mb-2 block text-sm text-muted-foreground"
                    >
                      First Name
                    </label>
                    <input
                      id="wedding-first"
                      type="text"
                      required
                      placeholder="Enter your first name"
                      value={rsvpForm.firstName}
                      onChange={(e) =>
                        setRsvpForm({ ...rsvpForm, firstName: e.target.value })
                      }
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="wedding-last"
                      className="mb-2 block text-sm text-muted-foreground"
                    >
                      Last Name
                    </label>
                    <input
                      id="wedding-last"
                      type="text"
                      required
                      placeholder="Enter your last name"
                      value={rsvpForm.lastName}
                      onChange={(e) =>
                        setRsvpForm({ ...rsvpForm, lastName: e.target.value })
                      }
                      className={inputCls}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="wedding-email"
                    className="mb-2 block text-sm text-muted-foreground"
                  >
                    Email Address
                  </label>
                  <input
                    id="wedding-email"
                    type="email"
                    required
                    placeholder="your@email.com"
                    value={rsvpForm.email}
                    onChange={(e) =>
                      setRsvpForm({ ...rsvpForm, email: e.target.value })
                    }
                    className={inputCls}
                  />
                </div>

                <div>
                  <span className="mb-3 block text-sm text-muted-foreground">
                    Will you be attending?
                  </span>
                  <div className="flex gap-6">
                    {attendOptions.map((opt) => (
                      <label
                        key={opt}
                        className="flex cursor-pointer items-center gap-3"
                      >
                        <input
                          type="radio"
                          name="attendance"
                          value={opt}
                          checked={rsvpForm.attendance === opt}
                          onChange={(e) =>
                            setRsvpForm({
                              ...rsvpForm,
                              attendance: e.target.value,
                            })
                          }
                          className="size-4 accent-primary"
                        />
                        <span className="text-foreground">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="wedding-guests"
                    className="mb-2 block text-sm text-muted-foreground"
                  >
                    Number of Guests
                  </label>
                  <select
                    id="wedding-guests"
                    value={rsvpForm.guestCount}
                    onChange={(e) =>
                      setRsvpForm({
                        ...rsvpForm,
                        guestCount: Number.parseInt(e.target.value, 10),
                      })
                    }
                    className={cn(inputCls, 'appearance-none')}
                  >
                    {guestOptions.map((opt, i) => (
                      <option key={opt} value={i + 1} className="bg-background">
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="wedding-dietary"
                    className="mb-2 block text-sm text-muted-foreground"
                  >
                    Dietary Restrictions (Optional)
                  </label>
                  <textarea
                    id="wedding-dietary"
                    rows={3}
                    placeholder="Please let us know of any allergies or dietary requirements"
                    value={rsvpForm.dietaryRestrictions}
                    onChange={(e) =>
                      setRsvpForm({
                        ...rsvpForm,
                        dietaryRestrictions: e.target.value,
                      })
                    }
                    className={cn(inputCls, 'resize-none')}
                  />
                </div>

                <div>
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      name="shuttle"
                      checked={rsvpForm.needsShuttle}
                      onChange={(e) =>
                        setRsvpForm({
                          ...rsvpForm,
                          needsShuttle: e.target.checked,
                        })
                      }
                      className="mt-1 size-4 accent-primary"
                    />
                    <span className="text-sm text-muted-foreground">
                      {shuttleLabel}
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-full bg-primary py-4 font-medium tracking-wide text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {rsvpSubmit}
                </button>
              </form>

              <div className="mt-12 border-t border-border pt-12 text-center">
                <p className="text-sm text-muted-foreground">
                  {rsvpContactNote}{' '}
                  <button
                    type="button"
                    onClick={() => go(rsvpEmail)}
                    className="text-card-foreground underline underline-offset-4"
                  >
                    {rsvpEmail}
                  </button>
                </p>
              </div>
            </div>
          </section>
        </main>

        {/* RSVP Drawer */}
        <Sheet open={rsvpDrawerOpen} onOpenChange={setRsvpDrawerOpen}>
          <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
            <SheetHeader className="border-b border-border p-6">
              <SheetTitle className="text-xl">Your RSVP</SheetTitle>
              <SheetDescription>
                {myRsvp
                  ? `You have ${myRsvp.attendance === 'Joyfully Accept' ? 'accepted' : 'declined'} the invitation.`
                  : 'You have not submitted an RSVP yet.'}
              </SheetDescription>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {myRsvp ? (
                <div className="space-y-6">
                  <div className="rounded-lg bg-muted/40 p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">
                        Status
                      </span>
                      <span
                        className={cn(
                          'rounded-full px-3 py-1 text-xs font-semibold',
                          myRsvp.attendance === 'Joyfully Accept'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted-foreground text-background',
                        )}
                      >
                        {myRsvp.attendance}
                      </span>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Name:</span>{' '}
                        <span className="font-medium text-foreground">
                          {myRsvp.firstName} {myRsvp.lastName}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Email:</span>{' '}
                        <span className="font-medium text-foreground">
                          {myRsvp.email}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Guests:</span>{' '}
                        <span className="font-medium text-foreground">
                          {myRsvp.guestCount}
                        </span>
                      </div>
                      {myRsvp.dietaryRestrictions ? (
                        <div>
                          <span className="text-muted-foreground">
                            Dietary:
                          </span>{' '}
                          <span className="font-medium text-foreground">
                            {myRsvp.dietaryRestrictions}
                          </span>
                        </div>
                      ) : null}
                      <div>
                        <span className="text-muted-foreground">Shuttle:</span>{' '}
                        <span className="font-medium text-foreground">
                          {myRsvp.needsShuttle === 'yes' ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 px-6 text-center">
                  <p className="text-base font-semibold text-foreground">
                    No RSVP submitted
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Fill out the RSVP form above to submit your response.
                  </p>
                </div>
              )}
            </div>
            <SheetFooter className="border-t border-border p-6">
              {myRsvp ? (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full rounded-full"
                  onClick={() => {
                    if (myRsvp.email) {
                      void deleteRsvp(myRsvp.email)
                    }
                  }}
                >
                  Delete RSVP
                </Button>
              ) : (
                <SheetClose asChild>
                  <Button type="button" className="w-full rounded-full">
                    Close
                  </Button>
                </SheetClose>
              )}
            </SheetFooter>
          </SheetContent>
        </Sheet>

        {/* Footer */}
        <footer className="bg-foreground py-16 text-background/60">
          <div className="mx-auto max-w-6xl px-6 lg:px-8">
            <div className="mb-12 grid gap-12 md:grid-cols-3">
              <div className="text-center md:text-left">
                <h3 className="mb-4 font-serif text-2xl text-background">
                  {brand}
                </h3>
                <p className="text-sm">{footerDate}</p>
                <p className="text-sm">{footerLocation}</p>
              </div>
              <div className="text-center">
                <p className="mb-4 font-serif text-lg text-background/90">
                  {footerMessage}
                </p>
                <p className="text-sm">{footerMessageSub}</p>
              </div>
              <div className="text-center md:text-right">
                <div className="flex justify-center gap-6 md:justify-end">
                  {footerSocials.map((social) => (
                    <button
                      key={social}
                      type="button"
                      aria-label={social}
                      onClick={() => go(social)}
                      className="text-sm transition-colors hover:text-background/90"
                    >
                      {social}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="border-t border-background/10 pt-8 text-center text-sm">
              <p>{footerNote}</p>
            </div>
          </div>
        </footer>
      </div>
    )
  },
})
