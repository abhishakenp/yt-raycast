import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { MailIcon } from 'lucide-react'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import {
  GalleryGrid,
  GalleryGridItems,
  GalleryTile,
  GalleryTileImage,
  GalleryTileCaption,
} from '#/section-kit/index.ts'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { ContentCard } from '#/section-kit/ContentCard.tsx'
import { govPortalLakebed } from './gov-portal-lakebed.ts'
import {
  pickLang,
  useGovCatalog,
  useGovLang,
  type GovPortalLakebed,
  type GovRow,
} from './gov-portal-interactions.tsx'

function str(row: GovRow, key: string) {
  return String(row[key] ?? '').trim()
}

import { Container } from '#/section-kit/Container.tsx'
import { InfoPanel } from '#/section-kit/InfoPanel.tsx'
import {
  DataTable,
  DataHeader,
  DataBody,
  DataRow,
  DataTableCell,
} from '#/section-kit/DataTable.tsx'

/**
 * GovPortalDirectory — a telephone / staff directory table. Theme-token based;
 * bilingual. Content from Lakebed.
 */
export const GovPortalDirectory = defineCapsule({
  name: 'GovPortalDirectory',
  description:
    'Searchable telephone / staff directory on a government portal — a table with Sl.No., Name, Designation and Email columns and a live name/designation filter. Use as the directory page of a government or PSU portal.',
  props: z.object({
    heading: z.string().optional(),
    directory: z.array(z.record(z.string(), z.any())).optional(),
    className: z.string().optional(),
  }),
  lakebed: govPortalLakebed,
  component: ({ props, lakebed }) => {
    const { lang } = useGovLang(lakebed as GovPortalLakebed)
    const catalog = useGovCatalog(lakebed as GovPortalLakebed, {
      directory: props.directory ?? [
        {
          slNo: 1,
          name: 'Public Information Officer',
          designation: 'PIO',
          email: '',
        },
      ],
    })
    const heading = pickLang(
      lang,
      props.heading ?? 'Telephone Directory',
      'दूरभाष निर्देशिका',
    )
    const rows = catalog.directory
    const cols = [
      pickLang(lang, 'Sl.No.', 'क्र.सं.'),
      pickLang(lang, 'Name', 'नाम'),
      pickLang(lang, 'Designation', 'पदनाम'),
      pickLang(lang, 'Email', 'ईमेल'),
    ]

    return (
      <InfoPanel
        className={cn('bg-background py-16 border-0', props.className)}
      >
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-6 text-2xl font-semibold tracking-tight text-foreground">
            {heading}
          </h2>
          <div className="overflow-x-auto rounded-xl border border-border">
            <DataTable className="w-full min-w-[36rem] text-left text-sm">
              <table className="w-full text-left text-sm">
                <DataHeader asChild>
                  <thead className="bg-primary text-primary-foreground">
                    <tr>
                      {cols.map((c) => (
                        <th key={c} className="px-4 py-3 font-semibold">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                </DataHeader>
                <DataBody asChild>
                  <tbody>
                    {rows.map((row, i) => (
                      <DataRow asChild key={`${str(row, 'name')}-${i}`}>
                        <tr className="bg-card">
                          <DataTableCell className="px-4 py-3 text-muted-foreground">
                            {str(row, 'slNo') || i + 1}
                          </DataTableCell>
                          <DataTableCell className="px-4 py-3 font-medium text-card-foreground">
                            {str(row, 'name')}
                          </DataTableCell>
                          <DataTableCell className="px-4 py-3 text-muted-foreground">
                            {str(row, 'designation')}
                          </DataTableCell>
                          <DataTableCell className="px-4 py-3">
                            {str(row, 'email') ? (
                              <a
                                href={`mailto:${str(row, 'email')}`}
                                className="inline-flex items-center gap-1.5 text-primary hover:underline"
                              >
                                <MailIcon className="size-3.5" aria-hidden />
                                {str(row, 'email')}
                              </a>
                            ) : (
                              '—'
                            )}
                          </DataTableCell>
                        </tr>
                      </DataRow>
                    ))}
                  </tbody>
                </DataBody>
              </table>
            </DataTable>
          </div>
        </div>
      </InfoPanel>
    )
  },
})

/**
 * GovPortalMedia — a photo / video gallery grid. Bilingual. Content from Lakebed.
 */
export const GovPortalMedia = defineCapsule({
  name: 'GovPortalMedia',
  description:
    'Photo and video gallery grid for a government / PSU portal, each tile a captioned image. Use as the media / photo-gallery section of a government portal.',
  props: z.object({
    heading: z.string().optional(),
    subheading: z.string().optional(),
    media: z.array(z.record(z.string(), z.any())).optional(),
    className: z.string().optional(),
  }),
  lakebed: govPortalLakebed,
  component: ({ props, lakebed }) => {
    const { lang } = useGovLang(lakebed as GovPortalLakebed)
    const catalog = useGovCatalog(lakebed as GovPortalLakebed, {
      media: props.media ?? [
        {
          title: 'Facility photo',
          alt: 'Government facility',
          category: 'Photo',
        },
      ],
    })
    const heading = pickLang(
      lang,
      props.heading ?? 'Photo Gallery',
      'फोटो गैलरी',
    )
    const images = catalog.media.map((row) => ({
      alt: str(row, 'alt') || str(row, 'title') || 'Gallery image',
      caption: str(row, 'title') || undefined,
    }))

    return (
      <section className={cn('bg-muted/30 py-16', props.className)}>
        <Container>
          <GalleryGrid>
            <SectionHeading title={heading} subtitle={props.subheading} />
            <GalleryGridItems columns={3}>
              {images.map((img) => (
                <GalleryTile key={img.alt}>
                  <GalleryTileImage alt={img.alt} />
                  {img.caption && (
                    <GalleryTileCaption>{img.caption}</GalleryTileCaption>
                  )}
                </GalleryTile>
              ))}
            </GalleryGridItems>
          </GalleryGrid>
        </Container>
      </section>
    )
  },
})

/**
 * GovPortalNewsEvents — a card feed of news + events. Bilingual. Content from
 * Lakebed.
 */
export const GovPortalNewsEvents = defineCapsule({
  name: 'GovPortalNewsEvents',
  description:
    'Card feed of news items and events on a government / PSU portal, each with an image, date, title and excerpt. Use as the news-and-events section of a government portal.',
  props: z.object({
    heading: z.string().optional(),
    newsEvents: z.array(z.record(z.string(), z.any())).optional(),
    className: z.string().optional(),
  }),
  lakebed: govPortalLakebed,
  component: ({ props, lakebed }) => {
    const { lang } = useGovLang(lakebed as GovPortalLakebed)
    const catalog = useGovCatalog(lakebed as GovPortalLakebed, {
      newsEvents: props.newsEvents ?? [
        {
          title: 'Latest news update',
          date: '2026-01-01',
          body: 'A recent announcement from the organisation.',
          imageUrl: '',
        },
      ],
    })
    const heading = pickLang(
      lang,
      props.heading ?? 'News & Events',
      'समाचार एवं कार्यक्रम',
    )
    const rows = catalog.newsEvents

    return (
      <section className={cn('bg-background py-16', props.className)}>
        <Container>
          <h2 className="mb-8 text-2xl font-semibold tracking-tight text-foreground">
            {heading}
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((row, i) => (
              <ContentCard
                asChild
                key={`${str(row, 'title')}-${i}`}
                variant="bordered-shadowed"
                className="bg-card text-card-foreground shadow-none"
              >
                <article>
                  <Image
                    alt={str(row, 'title') || 'News image'}
                    w={640}
                    h={360}
                    className="aspect-video w-full object-cover"
                  />
                  <div className="p-5">
                    {str(row, 'date') ? (
                      <p className="text-xs font-medium uppercase tracking-wide text-primary">
                        {str(row, 'date')}
                      </p>
                    ) : null}
                    <h3 className="mt-1 text-base font-semibold text-card-foreground">
                      {str(row, 'title')}
                    </h3>
                    <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                      {str(row, 'body')}
                    </p>
                  </div>
                </article>
              </ContentCard>
            ))}
          </div>
        </Container>
      </section>
    )
  },
})
