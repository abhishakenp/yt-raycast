import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { CheckCircle2Icon, FactoryIcon } from 'lucide-react'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import {
  Card,
  PersonCard,
  PersonCardAvatar,
  PersonCardContent,
  PersonCardName,
  PersonCardRole,
  PersonCardBio,
} from '#/section-kit/index.ts'
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
import { CompanyInfo } from '#/section-kit/CompanyInfo.tsx'

/**
 * GovPortalLeadership — a featured MD/Chairman message + board-of-directors
 * grid. Theme-token based; bilingual. Content from Lakebed.
 */
export const GovPortalLeadership = defineCapsule({
  name: 'GovPortalLeadership',
  description:
    'Leadership block for a government / PSU portal: a featured Managing Director / Chairman message with a portrait, followed by a grid of board-of-directors cards (photo, name, designation, bio). Use on the company / about page of a government portal.',
  props: z.object({
    heading: z.string().optional(),
    messages: z.array(z.record(z.string(), z.any())).optional(),
    boardMembers: z.array(z.record(z.string(), z.any())).optional(),
    className: z.string().optional(),
  }),
  lakebed: govPortalLakebed,
  component: ({ props, lakebed }) => {
    const { lang } = useGovLang(lakebed as GovPortalLakebed)
    const catalog = useGovCatalog(lakebed as GovPortalLakebed, {
      messages: props.messages ?? [
        {
          role: 'Managing Director',
          name: 'Managing Director',
          body: 'A message on our commitment to reliable public service.',
          photoUrl: '',
        },
      ],
      boardMembers: props.boardMembers ?? [],
    })
    const heading = pickLang(lang, props.heading ?? 'Leadership', 'नेतृत्व')
    const message = catalog.messages[0]
    const board = catalog.boardMembers

    return (
      <CompanyInfo asChild>
      <section className={cn('bg-background py-16', props.className)}>
        <Container>
          <h2 className="mb-8 text-2xl font-semibold tracking-tight text-foreground">
            {heading}
          </h2>

          {message ? (
            <Card
              rounded="2xl"
              className="mb-12 grid items-start gap-6 sm:grid-cols-[auto_1fr] sm:p-8"
            >
              <div className="mx-auto size-32 overflow-hidden rounded-2xl bg-muted sm:mx-0">
                <Image
                  src={str(message, 'photoUrl') || undefined}
                  alt={`${str(message, 'name')} portrait`}
                  w={256}
                  h={256}
                  className="size-full object-cover"
                />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                  {str(message, 'role') || pickLang(lang, 'Message', 'संदेश')}
                </p>
                <p className="mt-1 text-lg font-semibold text-card-foreground">
                  {str(message, 'name')}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {str(message, 'body')}
                </p>
              </div>
            </Card>
          ) : null}

          {board.length ? (
            <>
              <h3 className="mb-6 text-lg font-semibold text-foreground">
                {pickLang(lang, 'Board of Directors', 'निदेशक मंडल')}
              </h3>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {board.map((member, i) => (
                  <PersonCard
                    key={`${str(member, 'name')}-${i}`}
                    variant="outlined"
                  >
                    <PersonCardAvatar>
                      <Image
                        src={str(member, 'photoUrl') || undefined}
                        alt={`${str(member, 'name')} portrait`}
                        w={160}
                        h={160}
                        className="size-full object-cover"
                      />
                    </PersonCardAvatar>
                    <PersonCardContent>
                      <PersonCardName>{str(member, 'name')}</PersonCardName>
                      <PersonCardRole>
                        {str(member, 'designation')}
                      </PersonCardRole>
                      {str(member, 'bio') ? (
                        <PersonCardBio>{str(member, 'bio')}</PersonCardBio>
                      ) : null}
                    </PersonCardContent>
                  </PersonCard>
                ))}
              </div>
            </>
          ) : null}
        </Container>
      </section>
      </CompanyInfo>
    )
  },
})

/**
 * GovPortalPowerPlants — a grid of generating stations. Theme-token based;
 * bilingual. Content from Lakebed.
 */
export const GovPortalPowerPlants = defineCapsule({
  name: 'GovPortalPowerPlants',
  description:
    'Grid of power-generating stations / facilities on a government / PSU portal, each a card with name, installed capacity, operational status, location and a short specification line. Use on a power-generation or operations page.',
  props: z.object({
    heading: z.string().optional(),
    powerPlants: z.array(z.record(z.string(), z.any())).optional(),
    className: z.string().optional(),
  }),
  lakebed: govPortalLakebed,
  component: ({ props, lakebed }) => {
    const { lang } = useGovLang(lakebed as GovPortalLakebed)
    const catalog = useGovCatalog(lakebed as GovPortalLakebed, {
      powerPlants: props.powerPlants ?? [
        {
          name: 'Thermal Power Station',
          capacity: '2×210 MW',
          status: 'Operational',
          location: 'Plant site',
          specs: 'Coal-fired generating units.',
        },
      ],
    })
    const heading = pickLang(
      lang,
      props.heading ?? 'Operational Power Plants',
      'संचालित विद्युत संयंत्र',
    )
    const plants = catalog.powerPlants

    return (
      <section className={cn('bg-muted/30 py-16', props.className)}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-2xl font-semibold tracking-tight text-foreground">
            {heading}
          </h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {plants.map((plant, i) => {
              const status = str(plant, 'status')
              return (
                <Card key={`${str(plant, 'name')}-${i}`} rounded="2xl">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <FactoryIcon className="size-6" aria-hidden />
                    </span>
                    {status ? (
                      <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                        {status}
                      </span>
                    ) : null}
                  </div>
                  <h3 className="text-lg font-semibold text-card-foreground">
                    {str(plant, 'name')}
                  </h3>
                  <p className="mt-1 text-2xl font-bold text-primary">
                    {str(plant, 'capacity')}
                  </p>
                  {str(plant, 'location') ? (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {str(plant, 'location')}
                    </p>
                  ) : null}
                  {str(plant, 'specs') ? (
                    <p className="mt-3 text-sm text-muted-foreground">
                      {str(plant, 'specs')}
                    </p>
                  ) : null}
                </Card>
              )
            })}
          </div>
        </div>
      </section>
    )
  },
})

/**
 * GovPortalAbout — a prose + bullet-points block. Theme-token based; bilingual.
 */
export const GovPortalAbout = defineCapsule({
  name: 'GovPortalAbout',
  description:
    'Prose-and-bullets narrative block for a government / PSU portal, used for company overview, sustainability, environment or safety statements — a heading, body paragraphs and a checklist of commitments. Fully content-driven.',
  props: z.object({
    heading: z.string().optional(),
    body: z.string().optional(),
    points: z.array(z.string()).optional(),
    headingHi: z.string().optional(),
    bodyHi: z.string().optional(),
    pointsHi: z.array(z.string()).optional(),
    imageAlt: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: govPortalLakebed,
  component: ({ props, lakebed }) => {
    const { lang } = useGovLang(lakebed as GovPortalLakebed)
    const heading = pickLang(
      lang,
      props.heading ?? 'About the Organisation',
      props.headingHi ?? 'संगठन के बारे में',
    )
    const body = pickLang(
      lang,
      props.body ??
        'An official government undertaking committed to reliable service, environmental stewardship and transparent governance.',
      props.bodyHi ??
        'एक आधिकारिक सरकारी उपक्रम जो विश्वसनीय सेवा, पर्यावरण संरक्षण और पारदर्शी शासन के लिए प्रतिबद्ध है।',
    )
    const points =
      lang === 'hi' && props.pointsHi?.length
        ? props.pointsHi
        : props.points?.length
          ? props.points
          : pickLang(
              lang,
              [
                'Transparent, accountable public service',
                'Environmental compliance and safety',
                'Reliable, round-the-clock operations',
              ],
              [
                'पारदर्शी, जवाबदेह जनसेवा',
                'पर्यावरण अनुपालन एवं सुरक्षा',
                'विश्वसनीय, चौबीसों घंटे संचालन',
              ],
            )
    const imageAlt = props.imageAlt ?? 'Government facility exterior'

    return (
      <section className={cn('bg-background py-16', props.className)}>
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              {heading}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              {body}
            </p>
            <ul className="mt-6 space-y-3">
              {points.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <CheckCircle2Icon
                    className="mt-0.5 size-5 shrink-0 text-primary"
                    aria-hidden
                  />
                  <span className="text-sm text-foreground">{point}</span>
                </li>
              ))}
            </ul>
          </div>
          <Image
            alt={imageAlt}
            w={800}
            h={600}
            className="aspect-[4/3] w-full rounded-2xl object-cover"
          />
        </div>
      </section>
    )
  },
})
