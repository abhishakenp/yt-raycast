import { defineCapsule } from '#/capsules/openui.ts'
import { useMemo, useState } from 'react'
import { z } from 'zod/v4'
import { DownloadIcon, FileTextIcon, SearchIcon } from 'lucide-react'

import { cn } from '#/lib/utils.ts'
import { FilterChip } from '#/section-kit/index.ts'
import { Card } from '#/section-kit/Card.tsx'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select.tsx'
import { govPortalLakebed } from './gov-portal-lakebed.ts'
import {
  pickLang,
  useGovCatalog,
  useGovLang,
  type GovLang,
  type GovPortalLakebed,
  type GovRow,
} from './gov-portal-interactions.tsx'

function str(row: GovRow, key: string) {
  return String(row[key] ?? '').trim()
}

function NoticeRows({ rows, lang }: { rows: GovRow[]; lang: GovLang }) {
  if (!rows.length) {
    return (
      <Card
        variant="default"
        rounded="xl"
        padding="lg"
        className="border-dashed text-center text-sm text-muted-foreground"
      >
        {pickLang(lang, 'No records available.', 'कोई रिकॉर्ड उपलब्ध नहीं।')}
      </Card>
    )
  }
  return (
    <Card
      asChild
      variant="default"
      rounded="xl"
      padding="none"
      className="divide-y divide-border overflow-hidden"
    >
      <ul>
        {rows.map((row, i) => {
          const nit = str(row, 'nitNo')
          const title = str(row, 'title')
          const date = str(row, 'date')
          const docUrl = str(row, 'docUrl')
          return (
            <li
              key={`${nit}-${i}`}
              className="flex flex-col gap-2 p-4 transition-colors hover:bg-muted/40 sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="min-w-0">
                {nit ? (
                  <span className="text-sm font-semibold text-destructive">
                    {pickLang(lang, 'NIT No', 'एनआईटी सं.')}: {nit}
                  </span>
                ) : null}
                <p className="text-sm text-card-foreground">{title}</p>
                {date ? (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {pickLang(lang, 'Dated', 'दिनांक')}: {date}
                  </p>
                ) : null}
              </div>
              {docUrl ? (
                <a
                  href={docUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-lg border border-input px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                >
                  <FileTextIcon className="size-3.5" aria-hidden />
                  {pickLang(lang, 'View PDF', 'पीडीएफ देखें')}
                </a>
              ) : null}
            </li>
          )
        })}
      </ul>
    </Card>
  )
}

import { Container } from '#/section-kit/Container.tsx'
import { TenderTable } from '#/section-kit/TenderTable.tsx'

/**
 * GovPortalTenderBoard — a tabbed government e-tender board (Tenders /
 * Extension / Corrigendum / Cancellation) with a financial-year shadcn Select
 * and live search. Theme-token based; bilingual. Content from Lakebed.
 */
export const GovPortalTenderBoard = defineCapsule({
  name: 'GovPortalTenderBoard',
  description:
    'Tabbed government e-tender board switching between Tender Notices, Extension Notices, Corrigendum and Cancellation Notices, with a financial-year Select filter and live search over the active tab. Each row shows the NIT number, work description, date and a PDF link. Use as the primary tenders board on a government / PSU procurement portal.',
  props: z.object({
    heading: z.string().optional(),
    tenders: z.array(z.record(z.string(), z.any())).optional(),
    extensionNotices: z.array(z.record(z.string(), z.any())).optional(),
    corrigendums: z.array(z.record(z.string(), z.any())).optional(),
    cancellationNotices: z.array(z.record(z.string(), z.any())).optional(),
    className: z.string().optional(),
  }),
  lakebed: govPortalLakebed,
  component: ({ props, lakebed }) => {
    const { lang } = useGovLang(lakebed as GovPortalLakebed)
    const catalog = useGovCatalog(lakebed as GovPortalLakebed, {
      tenders: props.tenders ?? [
        {
          nitNo: '01/EXAMPLE/W/2025-26',
          title: 'Sample tender for civil maintenance works',
          finYear: '2025-26',
          date: '01-01-2026',
          docUrl: '',
        },
      ],
      extensionNotices: props.extensionNotices ?? [],
      corrigendums: props.corrigendums ?? [],
      cancellationNotices: props.cancellationNotices ?? [],
    })

    const tabs = [
      {
        key: 'tenders',
        label: pickLang(lang, 'Tender Notices', 'निविदा सूचनाएँ'),
        rows: catalog.tenders,
      },
      {
        key: 'extensionNotices',
        label: pickLang(lang, 'Extension Notices', 'विस्तार सूचनाएँ'),
        rows: catalog.extensionNotices,
      },
      {
        key: 'corrigendums',
        label: pickLang(lang, 'Corrigendum', 'शुद्धिपत्र'),
        rows: catalog.corrigendums,
      },
      {
        key: 'cancellationNotices',
        label: pickLang(lang, 'Cancellation Notices', 'रद्दीकरण सूचनाएँ'),
        rows: catalog.cancellationNotices,
      },
    ] as const

    const [active, setActive] =
      useState<(typeof tabs)[number]['key']>('tenders')
    const [finYear, setFinYear] = useState('all')
    const [query, setQuery] = useState('')
    const heading = pickLang(
      lang,
      props.heading ?? 'Tenders & Notices',
      'निविदाएँ एवं सूचनाएँ',
    )

    const activeRows = tabs.find((t) => t.key === active)?.rows ?? []

    const finYears = useMemo(() => {
      const set = new Set<string>()
      for (const row of activeRows) {
        const fy = str(row, 'finYear')
        if (fy) set.add(fy)
      }
      return Array.from(set).sort().reverse()
    }, [activeRows])

    const filtered = activeRows.filter((row) => {
      const haystack = [
        str(row, 'nitNo'),
        str(row, 'title'),
        str(row, 'category'),
      ]
        .join(' ')
        .toLowerCase()
      const fyMatch = finYear === 'all' || str(row, 'finYear') === finYear
      const queryMatch = !query || haystack.includes(query.toLowerCase())
      return fyMatch && queryMatch
    })

    return (
      <TenderTable
        variant="default"
        className={cn('bg-background py-16 border-0', props.className)}
      >
        <Container>
          <h2 className="mb-6 text-2xl font-semibold tracking-tight text-foreground">
            {heading}
          </h2>

          <div className="mb-5 flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <FilterChip
                key={tab.key}
                active={active === tab.key}
                variant={active === tab.key ? 'default' : 'muted'}
                onClick={() => {
                  setActive(tab.key)
                  setFinYear('all')
                }}
              >
                {tab.label}
                <span className="ml-1.5 rounded-full bg-foreground/10 px-1.5 text-[0.65rem]">
                  {tab.rows.length}
                </span>
              </FilterChip>
            ))}
          </div>

          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="relative flex-1">
              <SearchIcon
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={pickLang(
                  lang,
                  'Search by NIT number or description…',
                  'एनआईटी संख्या या विवरण से खोजें…',
                )}
                className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-ring"
              />
            </label>
            <Select value={finYear} onValueChange={setFinYear}>
              <SelectTrigger className="w-full sm:w-56">
                <SelectValue
                  placeholder={pickLang(
                    lang,
                    'All Financial Years',
                    'सभी वित्तीय वर्ष',
                  )}
                />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="all">
                  {pickLang(lang, 'All Financial Years', 'सभी वित्तीय वर्ष')}
                </SelectItem>
                {finYears.map((fy) => (
                  <SelectItem key={fy} value={fy}>
                    {fy}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <p className="mb-3 text-sm text-muted-foreground" aria-live="polite">
            {filtered.length}{' '}
            {pickLang(
              lang,
              `record${filtered.length === 1 ? '' : 's'}`,
              'रिकॉर्ड',
            )}
          </p>
          <NoticeRows rows={filtered} lang={lang} />
        </Container>
      </TenderTable>
    )
  },
})

/**
 * GovPortalNotices — a filter-chip board of general notices. Theme-token based;
 * bilingual. Content from Lakebed.
 */
export const GovPortalNotices = defineCapsule({
  name: 'GovPortalNotices',
  description:
    'Filter-chip board of government notices (Circulars / Office Orders, Public Notices, Employment Notices, Latest Updates), each a dated title with a PDF link. Use as the notices / circulars board on a government or PSU portal.',
  props: z.object({
    heading: z.string().optional(),
    circulars: z.array(z.record(z.string(), z.any())).optional(),
    publicNotices: z.array(z.record(z.string(), z.any())).optional(),
    employmentNotices: z.array(z.record(z.string(), z.any())).optional(),
    updates: z.array(z.record(z.string(), z.any())).optional(),
    className: z.string().optional(),
  }),
  lakebed: govPortalLakebed,
  component: ({ props, lakebed }) => {
    const { lang } = useGovLang(lakebed as GovPortalLakebed)
    const catalog = useGovCatalog(lakebed as GovPortalLakebed, {
      circulars: props.circulars ?? [],
      publicNotices: props.publicNotices ?? [],
      employmentNotices: props.employmentNotices ?? [],
      updates: props.updates ?? [
        { title: 'Sample public update', date: '2026-01-01', docUrl: '' },
      ],
    })

    const tabs = [
      {
        key: 'circulars',
        label: pickLang(
          lang,
          'Circulars / Office Orders',
          'परिपत्र / कार्यालय आदेश',
        ),
      },
      {
        key: 'publicNotices',
        label: pickLang(lang, 'Public Notices', 'सार्वजनिक सूचनाएँ'),
      },
      {
        key: 'employmentNotices',
        label: pickLang(lang, 'Employment Notices', 'रोजगार सूचनाएँ'),
      },
      {
        key: 'updates',
        label: pickLang(lang, 'Latest Updates', 'नवीनतम अद्यतन'),
      },
    ] as const

    const [active, setActive] =
      useState<(typeof tabs)[number]['key']>('circulars')
    const heading = pickLang(
      lang,
      props.heading ?? 'Notices & Updates',
      'सूचनाएँ एवं अद्यतन',
    )
    const rows = catalog[active] ?? []

    return (
      <section className={cn('bg-muted/30 py-16', props.className)}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-6 text-2xl font-semibold tracking-tight text-foreground">
            {heading}
          </h2>
          <div className="mb-5 flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <FilterChip
                key={tab.key}
                active={active === tab.key}
                variant={active === tab.key ? 'default' : 'muted'}
                onClick={() => setActive(tab.key)}
              >
                {tab.label}
                <span className="ml-1.5 rounded-full bg-foreground/10 px-1.5 text-[0.65rem]">
                  {catalog[tab.key]?.length ?? 0}
                </span>
              </FilterChip>
            ))}
          </div>
          <NoticeRows rows={rows} lang={lang} />
        </div>
      </section>
    )
  },
})

/**
 * GovPortalDownloads — a grid of downloadable formats and documents. Theme-token
 * based; bilingual. Content from Lakebed.
 */
export const GovPortalDownloads = defineCapsule({
  name: 'GovPortalDownloads',
  description:
    'Grid of downloadable government formats and documents (bidder forms, vendor manuals, BG formats), each a titled card with a category tag and a download link. Use as a downloads / formats section on a government portal.',
  props: z.object({
    heading: z.string().optional(),
    downloads: z.array(z.record(z.string(), z.any())).optional(),
    className: z.string().optional(),
  }),
  lakebed: govPortalLakebed,
  component: ({ props, lakebed }) => {
    const { lang } = useGovLang(lakebed as GovPortalLakebed)
    const catalog = useGovCatalog(lakebed as GovPortalLakebed, {
      downloads: props.downloads ?? [
        {
          title: 'Bidder Form for ID & Password',
          category: 'Bidder',
          fileUrl: '',
        },
      ],
    })
    const heading = pickLang(
      lang,
      props.heading ?? 'Downloads & Formats',
      'डाउनलोड एवं प्रपत्र',
    )
    const rows = catalog.downloads

    return (
      <section className={cn('bg-background py-16', props.className)}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-6 text-2xl font-semibold tracking-tight text-foreground">
            {heading}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((row, i) => {
              const title = str(row, 'title')
              const category = str(row, 'category')
              const fileUrl = str(row, 'fileUrl')
              return (
                <Card
                  asChild
                  key={`${title}-${i}`}
                  variant="default"
                  rounded="xl"
                  padding="none"
                  className="group flex items-start gap-3 p-5 transition-all hover:border-primary/40 hover:shadow-md"
                >
                  <a
                    href={fileUrl || undefined}
                    target={fileUrl ? '_blank' : undefined}
                    rel="noreferrer"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <DownloadIcon className="size-5" aria-hidden />
                    </span>
                    <span className="min-w-0">
                      {category ? (
                        <span className="mb-1 inline-block rounded-full bg-muted px-2 py-0.5 text-[0.65rem] font-medium uppercase text-muted-foreground">
                          {category}
                        </span>
                      ) : null}
                      <span className="block text-sm font-medium text-card-foreground">
                        {title}
                      </span>
                    </span>
                  </a>
                </Card>
              )
            })}
          </div>
        </div>
      </section>
    )
  },
})
