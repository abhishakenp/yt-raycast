import { defineCapsule } from '#/capsules/openui.ts'
import { useState } from 'react'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { SiteNav } from '#/section-kit/SiteNav.tsx'

type NavItem = { label: string; children?: string[] }
type RawNavItem = string | NavItem

const normalizeNavItem = (item: RawNavItem): NavItem => {
  if (typeof item === 'string') return { label: item }
  return item
}

/**
 * GovernmentPortalNavbar — three-tier classic indian government / PSU portal
 * header (the "TVNL" look). A light-blue (#0792D0) utility top bar with
 * Career/Events links, a government emblem, A-/A/A+ font sizing and social
 * icons; a white header band with the org logo, official organisation name,
 * Hindi subtitle and address; and a royal-blue (#3346B5) mega-nav with white
 * 18px links and hover dropdowns. Every link routes through useNavigate. Use
 * as the sticky official header for public sector, civic, municipal, utility,
 * electricity board and power-company sites with tender and notice menus.
 */
export const GovernmentPortalNavbar = defineCapsule({
  name: 'GovernmentPortalNavbar',
  description:
    'Three-tier classic indian government / PSU portal header: a light-blue (#0792D0) utility top bar (Career/Events, government emblem, A-/A/A+ font sizing, social icons), a white header band (org logo + official organisation name + Hindi subtitle + address), and a royal-blue (#3346B5) mega-nav with white 18px links and hover dropdowns. Built for public sector, civic, municipal, utility, electricity board and power-company sites with tender and notice menus. Use for the sticky official header of any classic indian government portal.',
  props: z.object({
    /** Logo text / short org name shown in the emblem tile. */
    brand: z.string().optional(),
    /** Full official organisation name in the white header band. */
    orgName: z.string().optional(),
    /** Hindi / subtitle line under the organisation name. */
    sub: z.string().optional(),
    /** Headquarter address shown in the right info-box of the header band. */
    address: z.string().optional(),
    /** Mega-nav items; each may carry a dropdown of child links. */
    nav: z
      .array(
        z.union([
          z.string(),
          z.object({
            label: z.string(),
            children: z.array(z.string()).optional(),
          }),
        ]),
      )
      .optional(),
    /** Navigation target for the logo / home clicks. */
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const [openIdx, setOpenIdx] = useState<number | null>(null)

    const brand = props.brand ?? 'TVNL'
    const orgName = props.orgName ?? 'TENUGHAT VIDYUT NIGAM LIMITED'
    const sub =
      props.sub ??
      'तेनुघाट विद्युत निगम लिमिटेड · A Government of Jharkhand Undertaking'
    const address = props.address ?? 'Smart City, Dhurwa, Ranchi, Jharkhand'
    const homeTarget = props.homeTarget ?? 'Home'
    const nav: NavItem[] = (
      props.nav?.length
        ? props.nav.map(normalizeNavItem)
        : [
            { label: 'Home' },
            {
              label: 'The Company',
              children: [
                'TVNL Overview',
                'Board of Directors',
                "Chairman's Message",
                'Awards & Achievements',
              ],
            },
            {
              label: 'Power Generation',
              children: [
                'Operational Power Plants',
                'Installed Capacity',
                'Performance Highlights',
              ],
            },
            {
              label: 'Tenders',
              children: [
                'Tender Notices',
                'Extension Notices',
                'Corrigendum',
                'Cancellation Notices',
              ],
            },
            {
              label: 'Notices',
              children: [
                'Circulars / Office Orders',
                'Public Notices',
                'Employment Notices',
              ],
            },
            {
              label: 'Sustainability',
              children: ['CSR', 'Environment', 'Safety'],
            },
            {
              label: 'Contact us',
              children: ['Headquarter', 'Plant', 'Directory'],
            },
          ]
    ).filter((item) => item.label.trim().length > 0)

    // Flat top-level labels delegated to the kit's SiteNav (mobile drawer).
    const topLevelLabels = nav
      .map((item) => item.label)
      .filter((l): l is string => typeof l === 'string' && l.length > 0)

    return (
      <header
        className={cn('bg-white', props.className)}
        style={{
          fontFamily: '"Alegreya Sans", "Open Sans", system-ui, sans-serif',
        }}
      >
        {/* 1. Utility top bar */}
        <div className="bg-[#0792D0] text-white">
          <div className="mx-auto flex max-w-[1200px] items-center justify-between px-4 py-1.5 text-[13px]">
            <div className="flex items-center gap-2">
              <span className="grid size-5 place-items-center rounded bg-white/15 text-[9px] uppercase leading-none">
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="size-3"
                  aria-label="Government emblem"
                  role="img"
                >
                  <path d="M12 2l2.5 5 5.5.5-4 3.8 1.2 5.4L12 19l-5.2 2.7L8 16.3 4 12.5 9.5 12 12 2z" />
                </svg>
              </span>
              <button
                type="button"
                onClick={() => go('Career')}
                className="leading-none opacity-90 hover:opacity-100"
              >
                Career
              </button>
              <span className="opacity-50">|</span>
              <button
                type="button"
                onClick={() => go('Events')}
                className="leading-none opacity-90 hover:opacity-100"
              >
                Events
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  aria-label="Decrease font size"
                  className="leading-none opacity-90 hover:opacity-100"
                >
                  A-
                </button>
                <button
                  type="button"
                  aria-label="Default font size"
                  className="leading-none opacity-90 hover:opacity-100"
                >
                  A
                </button>
                <button
                  type="button"
                  aria-label="Increase font size"
                  className="leading-none opacity-90 hover:opacity-100"
                >
                  A+
                </button>
              </div>
              <span className="opacity-50">|</span>
              <a
                href="#"
                aria-label="Twitter"
                className="grid size-5 place-items-center rounded-full bg-white/15 hover:bg-white/25"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="size-3"
                  aria-hidden="true"
                >
                  <path d="M22 5.8c-.7.3-1.5.6-2.3.7.8-.5 1.5-1.3 1.8-2.3-.8.5-1.7.8-2.6 1a4.1 4.1 0 0 0-7 3.7A11.6 11.6 0 0 1 3.4 4.6a4.1 4.1 0 0 0 1.3 5.5c-.7 0-1.3-.2-1.9-.5v.1c0 2 1.4 3.7 3.3 4a4.1 4.1 0 0 1-1.9.1 4.1 4.1 0 0 0 3.8 2.9A8.3 8.3 0 0 1 2 18.4a11.6 11.6 0 0 0 6.3 1.8c7.5 0 11.7-6.3 11.7-11.7v-.5c.8-.6 1.5-1.3 2-2.2z" />
                </svg>
              </a>
              <a
                href="#"
                aria-label="Facebook"
                className="grid size-5 place-items-center rounded-full bg-white/15 hover:bg-white/25"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="size-3"
                  aria-hidden="true"
                >
                  <path d="M14 9h2.5l.5-3H14V4.3c0-.9.3-1.5 1.6-1.5H17V.1C16.7 0 15.8 0 14.8 0 12.6 0 11 1.3 11 3.9V6H8.5v3H11v9h3V9z" />
                </svg>
              </a>
              <button
                type="button"
                aria-label="Search"
                className="grid size-5 place-items-center rounded-full bg-white/15 hover:bg-white/25"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  className="size-3"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="7" strokeWidth="2" />
                  <path
                    strokeLinecap="round"
                    strokeWidth="2"
                    d="m21 21-4.3-4.3"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* 2. White header band */}
        <div className="bg-white">
          <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-4 py-2.5">
            <button
              type="button"
              onClick={() => go(homeTarget)}
              className="flex items-center gap-3"
            >
              <span className="grid size-12 place-items-center rounded bg-[#3346B5] font-bold text-white">
                {brand}
              </span>
              <span className="flex flex-col text-left">
                <span className="text-[18px] font-bold uppercase tracking-tight text-[#3346B5] md:text-[22px]">
                  {orgName}
                </span>
                <span className="text-[13px] text-[#737373]">{sub}</span>
              </span>
            </button>

            <div className="hidden items-start gap-2 md:flex">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="#0792D0"
                className="mt-0.5 size-5 shrink-0"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 21s-6-5.7-6-10a6 6 0 1 1 12 0c0 4.3-6 10-6 10z"
                />
                <circle cx="12" cy="11" r="2" strokeWidth="2" />
              </svg>
              <span className="text-[15px] leading-tight text-[#333]">
                {address}
              </span>
            </div>
          </div>
        </div>

        {/* 3a. Mobile nav — delegate the flat link routing + real Sheet drawer
            to the section-kit SiteNav (theme-tokened). Shown only on mobile;
            the gov-specific mega-nav below is hidden on small screens. */}
        <SiteNav
          sticky={false}
          brand={orgName || brand}
          nav={topLevelLabels}
          homeTarget={homeTarget}
          className="md:hidden"
        />

        {/* 3b. Mega-nav (desktop) — gov-specific royal-blue bar with hover
            dropdowns, kept inline. Hidden on mobile in favour of SiteNav. */}
        <nav
          className="hidden bg-[#3346B5] text-white md:block"
          aria-label="Main navigation"
        >
          <div className="mx-auto max-w-[1200px] px-4">
            <ul className="flex flex-wrap items-stretch">
              {nav.map((item, idx) => (
                <li
                  key={item.label}
                  className="relative"
                  onMouseEnter={() =>
                    item.children?.length ? setOpenIdx(idx) : undefined
                  }
                  onMouseLeave={() => setOpenIdx(null)}
                >
                  {item.children?.length ? (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setOpenIdx((cur) => (cur === idx ? null : idx))
                        }
                        className="flex items-center px-3 py-2 text-[18px] font-medium leading-[34px] transition-colors hover:bg-[#2a3a99]"
                      >
                        {item.label}
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          className="ml-1 size-4"
                          aria-hidden="true"
                        >
                          <polyline
                            points="6 9 12 15 18 9"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                      {openIdx === idx ? (
                        <ul className="absolute left-0 top-full z-40 min-w-[240px] bg-white py-1 text-[#333] shadow-[0_8px_24px_rgba(0,0,0,0.18)]">
                          {item.children.map((child) => (
                            <li key={child}>
                              <button
                                type="button"
                                onClick={() => go(child)}
                                className="block min-h-[36px] w-full px-4 py-[9px] text-left text-[15px] leading-snug transition-colors hover:bg-[#f0f3ff] hover:text-[#3346B5]"
                              >
                                {child}
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => go(item.label)}
                      className="flex items-center px-3 py-2 text-[18px] font-medium leading-[34px] transition-colors hover:bg-[#2a3a99]"
                    >
                      {item.label}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </header>
    )
  },
})
