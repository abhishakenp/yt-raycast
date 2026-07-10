import { defineCapsule } from '#/capsules/openui.ts'
import { useState } from 'react'
import { z } from 'zod/v4'
import { MenuIcon, PhoneIcon } from 'lucide-react'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Logo } from '#/section-kit/index.ts'
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from '#/components/ui/navigation-menu.tsx'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '#/components/ui/sheet.tsx'
import { govPortalLakebed } from './gov-portal-lakebed.ts'
import {
  GovAccountButton,
  GovDarkModeToggle,
  GovLanguagePicker,
  pickLang,
  useGovLang,
  type GovPortalLakebed,
  type GovStringKey,
} from './gov-portal-interactions.tsx'

type NavLink = { label: string; labelHi?: string; target?: string }
type NavGroup = {
  label: string
  page: string
  key?: GovStringKey
  links?: NavLink[]
}

const DEFAULT_NAV: NavGroup[] = [
  { label: 'Home', page: 'Home', key: 'home' },
  {
    label: 'The Company',
    page: 'The Company',
    key: 'company',
    links: [
      { label: 'Overview', labelHi: 'अवलोकन', target: 'The Company#about' },
      {
        label: 'Leadership',
        labelHi: 'नेतृत्व',
        target: 'The Company#leadership',
      },
      {
        label: 'Board of Directors',
        labelHi: 'निदेशक मंडल',
        target: 'The Company#leadership',
      },
    ],
  },
  {
    label: 'Power Generation',
    page: 'Power Generation',
    key: 'power',
    links: [
      {
        label: 'Operational Plants',
        labelHi: 'संचालित संयंत्र',
        target: 'Power Generation#plants',
      },
      {
        label: 'Installed Capacity',
        labelHi: 'स्थापित क्षमता',
        target: 'Power Generation#plants',
      },
      {
        label: 'Performance',
        labelHi: 'प्रदर्शन',
        target: 'Power Generation#stats',
      },
    ],
  },
  {
    label: 'Tenders',
    page: 'Tenders',
    key: 'tenders',
    links: [
      {
        label: 'Tender Notices',
        labelHi: 'निविदा सूचनाएँ',
        target: 'Tenders#board',
      },
      {
        label: 'Extension Notices',
        labelHi: 'विस्तार सूचनाएँ',
        target: 'Tenders#board',
      },
      { label: 'Corrigendum', labelHi: 'शुद्धिपत्र', target: 'Tenders#board' },
      {
        label: 'Cancellation Notices',
        labelHi: 'रद्दीकरण सूचनाएँ',
        target: 'Tenders#board',
      },
    ],
  },
  {
    label: 'Notices',
    page: 'Notices',
    key: 'notices',
    links: [
      {
        label: 'Circulars / Office Orders',
        labelHi: 'परिपत्र / कार्यालय आदेश',
        target: 'Notices#board',
      },
      {
        label: 'Public Notices',
        labelHi: 'सार्वजनिक सूचनाएँ',
        target: 'Notices#board',
      },
      {
        label: 'Employment Notices',
        labelHi: 'रोजगार सूचनाएँ',
        target: 'Notices#board',
      },
      {
        label: 'Latest Updates',
        labelHi: 'नवीनतम अद्यतन',
        target: 'Notices#board',
      },
    ],
  },
  {
    label: 'Sustainability',
    page: 'Sustainability',
    key: 'sustainability',
    links: [
      { label: 'CSR', labelHi: 'सीएसआर', target: 'Sustainability#about' },
      {
        label: 'Environment',
        labelHi: 'पर्यावरण',
        target: 'Sustainability#about',
      },
      { label: 'Safety', labelHi: 'सुरक्षा', target: 'Sustainability#about' },
    ],
  },
  {
    label: 'Media',
    page: 'Media',
    key: 'media',
    links: [
      {
        label: 'News & Events',
        labelHi: 'समाचार एवं कार्यक्रम',
        target: 'Media#news',
      },
      {
        label: 'Photo Gallery',
        labelHi: 'फोटो गैलरी',
        target: 'Media#gallery',
      },
      { label: 'Videos', labelHi: 'वीडियो', target: 'Media#gallery' },
    ],
  },
  {
    label: 'Info Desk',
    page: 'Info Desk',
    key: 'infoDesk',
    links: [
      {
        label: 'Grievance Redressal',
        labelHi: 'शिकायत निवारण',
        target: 'Info Desk#grievance',
      },
      {
        label: 'Download Formats',
        labelHi: 'प्रपत्र डाउनलोड',
        target: 'Info Desk#downloads',
      },
      {
        label: 'Telephone Directory',
        labelHi: 'दूरभाष निर्देशिका',
        target: 'Info Desk#directory',
      },
    ],
  },
  {
    label: 'Vendor Portal',
    page: 'Vendor Portal',
    key: 'vendor',
    links: [
      {
        label: 'Register as Vendor',
        labelHi: 'विक्रेता पंजीकरण',
        target: 'Vendor Portal#vendor',
      },
      {
        label: 'Submit Bid',
        labelHi: 'बोली जमा करें',
        target: 'Vendor Portal#vendor',
      },
      {
        label: 'Tender Payment',
        labelHi: 'निविदा भुगतान',
        target: 'Vendor Portal#vendor',
      },
    ],
  },
  { label: 'Contact Us', page: 'Contact Us', key: 'contact' },
]

/**
 * GovPortalNavbar — sticky government-portal chrome using theme tokens
 * throughout (so it re-colours with the active theme): a slim primary utility
 * strip (Career / Events + EN/HI language picker), a clean brand header with the
 * real uploaded logo (from the DB) + wordmark + CIN + a shiny Shoo sign-in
 * button, and a primary mega-navigation (shadcn NavigationMenu) whose dropdowns
 * render as proper popover panels. Fully responsive with a mobile drawer.
 * Generic across any PSU / government department; brand + logo come from the
 * `brand` Lakebed table. Named *Navbar so it is excluded from admin tables.
 */
export const GovPortalNavbar = defineCapsule({
  name: 'GovPortalNavbar',
  description:
    'Sticky government / PSU portal chrome (theme-token based) with a slim utility strip (Career / Events + EN/HI language picker), a brand header showing the uploaded logo, wordmark and CIN plus a shiny Shoo sign-in / account dropdown, and a primary mega-navigation with proper popover dropdowns and a mobile drawer. Brand + logo are read from the DB. Use as the top navigation on a government, PSU or civic portal.',
  props: z.object({
    /** Fallback organisation name (DB brand row wins). */
    brand: z.string().optional(),
    /** Fallback undertaking / department line. */
    tagline: z.string().optional(),
    /** Fallback CIN or registration identifier. */
    cin: z.string().optional(),
    /** Fallback location line (city / state). */
    location: z.string().optional(),
    /** Fallback logo image URL. */
    logoUrl: z.string().optional(),
    /** Utility-strip phone number. */
    phone: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: govPortalLakebed,
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const account = lakebed as GovPortalLakebed
    const { t, lang } = useGovLang(account)
    type BrandRow = {
      name?: string
      nameHi?: string
      tagline?: string
      taglineHi?: string
      cin?: string
      location?: string
      locationHi?: string
      logoUrl?: string
      stateLogoUrl?: string
    }
    const liveBrand = account.useQuery('govPortalBrand') as BrandRow | null
    // Deployed sites read baked catalog data (Lakebed's per-context DB state is
    // not reliably shared with page queries), so fall back to the baked brand.
    const bakedBrand =
      typeof globalThis !== 'undefined'
        ? (
            globalThis as {
              __LAKEBED_GOV_SEED__?: { brand?: BrandRow[] }
            }
          ).__LAKEBED_GOV_SEED__?.brand?.[0]
        : undefined
    const dbBrand: BrandRow | null =
      liveBrand && liveBrand.name
        ? liveBrand
        : (bakedBrand ?? liveBrand ?? null)
    const [open, setOpen] = useState(false)

    const brand = pickLang(
      lang,
      dbBrand?.name || props.brand || 'Government Portal',
      dbBrand?.nameHi || dbBrand?.name || props.brand || 'सरकारी पोर्टल',
    )
    const tagline = pickLang(
      lang,
      dbBrand?.tagline || props.tagline || 'An Official Government Undertaking',
      dbBrand?.taglineHi ||
        dbBrand?.tagline ||
        props.tagline ||
        'एक आधिकारिक सरकारी उपक्रम',
    )
    const cin = dbBrand?.cin || props.cin || ''
    const location = pickLang(
      lang,
      dbBrand?.location || props.location || '',
      dbBrand?.locationHi || dbBrand?.location || props.location || '',
    )
    const logoUrl = dbBrand?.logoUrl || props.logoUrl || ''
    const stateLogoUrl = dbBrand?.stateLogoUrl || ''
    const phone = props.phone || ''
    const nav = DEFAULT_NAV
    const label = (group: NavGroup) => (group.key ? t(group.key) : group.label)
    const linkLabel = (link: NavLink) =>
      lang === 'hi' && link.labelHi ? link.labelHi : link.label

    const initials = brand
      .split(/\s+/)
      .slice(0, 3)
      .map((w) => w[0]?.toUpperCase() ?? '')
      .join('')

    const Brandmark = (
      <span className="flex items-center gap-3">
        {/*
          Use the shared Logo component (same as every other capsule) so the
          brand logo picked in the editor sidebar (selectedBrandLogo) flows to
          the navbar. Priority: sidebar selection → the brand's uploaded logoUrl
          (DB) → initials emblem. showLabel is false because the navbar renders
          its own bilingual wordmark below.
        */}
        <Logo
          brand={brand}
          showLabel={false}
          className="h-12 w-auto max-w-[8rem] shrink-0 rounded-none"
          imageClassName="h-12 w-auto max-w-[8rem] object-contain"
          fallback={
            logoUrl ? (
              <img
                src={logoUrl}
                alt={`${brand} logo`}
                className="h-12 w-auto max-w-[8rem] shrink-0 object-contain"
                draggable={false}
              />
            ) : (
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full border-2 border-primary text-sm font-bold text-primary">
                {initials || 'GOV'}
              </span>
            )
          }
        />
        <span className="min-w-0 text-left">
          <span className="block max-w-[16rem] truncate text-sm font-bold uppercase tracking-tight text-foreground sm:text-base">
            {brand}
          </span>
          <span className="block max-w-[16rem] truncate text-xs text-muted-foreground">
            {tagline}
          </span>
        </span>
      </span>
    )

    return (
      <header
        className={cn(
          'sticky top-0 z-50 w-full bg-background',
          props.className,
        )}
      >
        {/* utility strip */}
        <div className="bg-primary text-primary-foreground">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-1.5 text-xs sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              {phone ? (
                <span className="hidden items-center gap-1.5 sm:inline-flex">
                  <PhoneIcon className="size-3.5" aria-hidden />
                  {phone}
                </span>
              ) : null}
              <button
                type="button"
                onClick={() => go('Info Desk')}
                className="font-medium transition-opacity hover:opacity-80"
              >
                {t('career')}
              </button>
              <button
                type="button"
                onClick={() => go('Media')}
                className="font-medium transition-opacity hover:opacity-80"
              >
                {t('events')}
              </button>
            </div>
            <div className="flex items-center gap-2">
              {stateLogoUrl ? (
                <img
                  src={stateLogoUrl}
                  alt={pickLang(lang, 'State Government', 'राज्य सरकार')}
                  className="mr-1 h-6 w-auto rounded-full bg-primary-foreground/95 p-0.5"
                  draggable={false}
                />
              ) : null}
              <GovDarkModeToggle
                lakebed={account}
                className="border border-primary-foreground/25 bg-primary-foreground/10 text-primary-foreground"
              />
              <GovLanguagePicker
                lakebed={account}
                className="border-primary-foreground/25 bg-primary-foreground/10 text-primary-foreground"
              />
            </div>
          </div>
        </div>

        {/* brand header */}
        <div className="border-b border-border">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => go('Home')}
              className="flex items-center gap-3 rounded-md text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={`${brand} — home`}
            >
              {Brandmark}
              {cin ? (
                <span className="hidden border-l border-border pl-3 text-xs text-muted-foreground lg:block">
                  CIN {cin}
                </span>
              ) : null}
            </button>
            <div className="flex items-center gap-3">
              {location ? (
                <span className="hidden max-w-[14rem] text-right text-xs text-muted-foreground md:block">
                  {location}
                </span>
              ) : null}
              <div className="hidden md:block">
                <GovAccountButton lakebed={account}>
                  {t('signIn')}
                </GovAccountButton>
              </div>
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <button
                    type="button"
                    aria-label="Open menu"
                    className="inline-flex size-10 items-center justify-center rounded-lg border border-input text-foreground md:hidden"
                  >
                    <MenuIcon className="size-5" aria-hidden />
                  </button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-[min(100%,22rem)] overflow-y-auto border-l border-border bg-background p-0 text-foreground sm:max-w-[22rem]"
                >
                  <SheetHeader className="border-b border-border px-5 py-4 text-left">
                    <SheetTitle className="text-base font-semibold">
                      {brand}
                    </SheetTitle>
                    <SheetDescription className="sr-only">
                      Government portal navigation
                    </SheetDescription>
                  </SheetHeader>
                  <div className="flex flex-col gap-1 px-3 py-4">
                    {nav.map((group) => (
                      <button
                        key={group.page}
                        type="button"
                        onClick={() => {
                          setOpen(false)
                          go(group.page)
                        }}
                        className="rounded-lg px-3 py-3 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted"
                      >
                        {label(group)}
                      </button>
                    ))}
                    <div className="mt-3 border-t border-border px-1 pt-4">
                      <GovAccountButton lakebed={account}>
                        {t('signIn')}
                      </GovAccountButton>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        {/* mega-nav */}
        <div className="hidden bg-primary text-primary-foreground shadow-sm md:block">
          <div className="mx-auto max-w-7xl px-2 sm:px-4 lg:px-6">
            <NavigationMenu viewport={false} className="max-w-none">
              <NavigationMenuList className="flex-wrap justify-start gap-0">
                {nav.map((group) =>
                  group.links?.length ? (
                    <NavigationMenuItem key={group.page}>
                      <NavigationMenuTrigger
                        onClick={() => go(group.page)}
                        className="bg-transparent text-sm font-medium text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground focus:bg-primary-foreground/15 focus:text-primary-foreground data-[state=open]:bg-primary-foreground/15 data-[state=open]:text-primary-foreground data-[state=open]:hover:bg-primary-foreground/15 data-[state=open]:hover:text-primary-foreground data-[state=open]:focus:bg-primary-foreground/15 data-[state=open]:focus:text-primary-foreground"
                      >
                        {label(group)}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent className="z-50 border border-border bg-popover text-popover-foreground shadow-xl">
                        <ul className="grid w-[17rem] gap-0.5 p-2">
                          {group.links.map((link) => (
                            <li key={link.label}>
                              <NavigationMenuLink asChild>
                                <button
                                  type="button"
                                  onClick={() => go(link.target ?? group.page)}
                                  className="block w-full rounded-md px-3 py-2 text-left text-sm text-popover-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                >
                                  {linkLabel(link)}
                                </button>
                              </NavigationMenuLink>
                            </li>
                          ))}
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  ) : (
                    <NavigationMenuItem key={group.page}>
                      <NavigationMenuLink
                        asChild
                        className="hover:bg-primary-foreground/15 hover:text-primary-foreground focus:bg-primary-foreground/15 focus:text-primary-foreground"
                      >
                        <button
                          type="button"
                          onClick={() => go(group.page)}
                          className={cn(
                            navigationMenuTriggerStyle(),
                            'bg-transparent text-sm font-medium text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground focus:bg-primary-foreground/15 focus:text-primary-foreground',
                          )}
                        >
                          {label(group)}
                        </button>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  ),
                )}
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>
      </header>
    )
  },
})
