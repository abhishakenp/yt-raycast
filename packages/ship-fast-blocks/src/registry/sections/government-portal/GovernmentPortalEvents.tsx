import { useState } from 'react'
import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'

/**
 * GovernmentPortalEvents — the signature element of a classic Indian-government /
 * public-sector (PSU) portal: a four-tab live notice board
 * (Tenders | Notices | Downloads | Public Notices). Each tab is a scrollable
 * DataTables-style list of PDF-link rows (NIT number + title + date), styled
 * like an official tvnl.in tender board — gov-blue tabs (#3346B5), tender
 * titles in #350788 and dates in #640032. Tabs swap via useState. Use as the
 * central updates / e-procurement panel for any government, public-sector,
 * PSU, municipal, civic or utility portal.
 */
export const GovernmentPortalEvents = defineComponent({
  name: 'GovernmentPortalEvents',
  description:
    'Classic Indian-government / public-sector (PSU) four-tab live notice board (Tenders | Notices | Downloads | Public Notices) — the signature element of an official government portal. Each tab is a scrollable DataTables-style list of PDF-link rows (NIT number + title + date), with gov-blue #3346B5 tabs, tender titles in #350788 and dates in #640032. Tabs swap via useState. Use for the central updates / tender / e-procurement / public-notice panel of any classic government, civic, municipal, PSU, electricity-board or utility portal.',
  props: z.object({
    /** Section heading above the tabbed board. */
    heading: z.string().optional(),
    /** Tab 1 — tender notices ({title, href, date?}). */
    tenders: z
      .array(
        z.object({
          title: z.string(),
          href: z.string(),
          date: z.string().optional(),
        }),
      )
      .optional(),
    /** Tab 2 — general notices. */
    notices: z
      .array(
        z.object({
          title: z.string(),
          href: z.string(),
          date: z.string().optional(),
        }),
      )
      .optional(),
    /** Tab 3 — downloadable forms / reports. */
    downloads: z
      .array(
        z.object({
          title: z.string(),
          href: z.string(),
          date: z.string().optional(),
        }),
      )
      .optional(),
    /** Tab 4 — public notices. */
    publicNotices: z
      .array(
        z.object({
          title: z.string(),
          href: z.string(),
          date: z.string().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heading = props.heading ?? 'Latest Updates'
    const tenders = props.tenders?.length
      ? props.tenders
      : [
          {
            title:
              'NIT No: 07/C&I-I/W/TVNL/RAN/2026-27 — AMC of DCS workstations, Unit #1 & #2, TTPS Lalpania',
            href: '/tenders/07',
            date: '25-06-2026',
          },
          {
            title:
              'NIT No: 08/OP/P/TVNL/RAN/2026-27 — Supply of 110 MT Caustic Soda Lye (Rayon grade)',
            href: '/tenders/08',
            date: '20-06-2026',
          },
          {
            title:
              'NIT No: 06/C&I-I/W/TVNL/RAN/2026-27 — Annual rate contract for I&C spares, Units #1–#3',
            href: '/tenders/06',
            date: '16-06-2026',
          },
          {
            title:
              'NIT No: 05/CIVIL/W/TVNL/RAN/2026-27 — Civil maintenance works at TTPS colony',
            href: '/tenders/05',
            date: '12-06-2026',
          },
        ]
    const notices = props.notices?.length
      ? props.notices
      : [
          {
            title: 'Extension Notice for NIT No: 29/HR/W/TVNL/RAN/2025-26',
            href: '/notices/ext-29',
            date: '10-06-2026',
          },
          {
            title: 'Corrigendum to NIT No: 08/OP/P/TVNL/RAN/2026-27',
            href: '/notices/corr-08',
            date: '05-06-2026',
          },
          {
            title: 'Office Order — Revised office timings w.e.f. 01 July 2026',
            href: '/notices/office-order',
            date: '01-06-2026',
          },
        ]
    const downloads = props.downloads?.length
      ? props.downloads
      : [
          {
            title: 'Bidder Registration Form (Format)',
            href: '/downloads/bidder-registration.pdf',
          },
          {
            title: 'Vendor Empanelment Application',
            href: '/downloads/vendor-empanelment.pdf',
          },
          {
            title: 'Annual Ash Utilization Report 2024-25',
            href: '/downloads/ash-report-2024-25.pdf',
          },
          {
            title: 'RTI Disclosure Document',
            href: '/downloads/rti-disclosure.pdf',
          },
        ]
    const publicNotices = props.publicNotices?.length
      ? props.publicNotices
      : [
          {
            title: 'Public Notice — Land acquisition for ash-dyke extension',
            href: '/public/land-ash-dyke',
            date: '08-06-2026',
          },
          {
            title: 'Public Notice — Walk-in interview for Medical Officer',
            href: '/public/walkin-medical',
            date: '03-06-2026',
          },
          {
            title: 'Public Notice — Tariff petition before JSERC',
            href: '/public/jserc-tariff',
            date: '28-05-2026',
          },
        ]

    const tabs = [
      { key: 'tenders' as const, label: 'Tenders', rows: tenders },
      { key: 'notices' as const, label: 'Notices', rows: notices },
      { key: 'downloads' as const, label: 'Downloads', rows: downloads },
      { key: 'public' as const, label: 'Public Notices', rows: publicNotices },
    ]
    const [tab, setTab] = useState<(typeof tabs)[number]['key']>('tenders')
    const active = tabs.find((t) => t.key === tab) ?? tabs[0]

    const PdfRow = ({
      row,
    }: {
      row: { title: string; href: string; date?: string }
    }) => (
      <li className="py-2.5">
        <div className="flex items-start justify-between gap-3">
          <button
            type="button"
            onClick={() => go(row.href)}
            className="flex items-start gap-2 text-left text-[13px] leading-snug text-[#350788] transition-colors hover:underline"
          >
            <svg
              viewBox="0 0 24 24"
              className="mt-0.5 size-4 shrink-0 text-[#640032]"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <span>{row.title}</span>
          </button>
          {row.date ? (
            <span className="shrink-0 whitespace-nowrap text-[12px] font-medium text-[#640032]">
              {row.date}
            </span>
          ) : null}
        </div>
      </li>
    )

    return (
      <section
        className={cn('px-6 py-12 lg:px-8', props.className)}
        style={{ fontFamily: '"Open Sans", "Alegreya Sans", sans-serif' }}
        aria-label={heading}
      >
        <div className="mx-auto max-w-4xl">
          <SectionHeading
            title={heading}
            align="left"
            titleClassName="text-2xl font-semibold text-[#3346B5]"
            className="mb-5"
          />
          <div className="flex flex-col rounded-sm border border-[#dfdfdf] bg-white shadow-sm">
            <div
              role="tablist"
              aria-label={heading}
              className="flex flex-wrap border-b border-[#dfdfdf]"
            >
              {tabs.map((t) => {
                const isActive = tab === t.key
                return (
                  <button
                    key={t.key}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setTab(t.key)}
                    className={cn(
                      'flex-1 px-3 py-3 text-[13px] font-semibold transition-colors',
                      isActive
                        ? 'bg-[#3346B5] text-white'
                        : 'bg-[#eef1fb] text-[#3346B5] hover:bg-[#dfe4f7]',
                    )}
                  >
                    {t.label}
                  </button>
                )
              })}
            </div>
            <div
              role="tabpanel"
              className="h-[280px] overflow-y-auto px-4 py-2"
            >
              {active.rows.length === 0 ? (
                <p className="px-1 py-6 text-center text-[13px] text-[#737373]">
                  No records published.
                </p>
              ) : (
                <ul className="divide-y divide-[#eee]">
                  {(active.rows ?? []).map((row, i) => (
                    <PdfRow key={`${row.href}-${i}`} row={row} />
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </section>
    )
  },
})
