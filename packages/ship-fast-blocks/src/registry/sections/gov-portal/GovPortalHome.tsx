import { defineCapsule } from '#/capsules/openui.ts'
import { useEffect, useState } from 'react'
import { z } from 'zod/v4'
import {
  ArrowRightIcon,
  BuildingIcon,
  ChevronRightIcon,
  LeafIcon,
  ShieldCheckIcon,
  ZapIcon,
} from 'lucide-react'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '#/components/ui/carousel.tsx'
import {
  StatGrid,
  StatItem,
  StatValue,
  StatLabel,
} from '#/section-kit/index.ts'
import { Card } from '#/section-kit/Card.tsx'
import { Eyebrow } from '#/section-kit/Eyebrow.tsx'
import { govPortalLakebed } from './gov-portal-lakebed.ts'
import {
  pickLang,
  useGovLang,
  type GovPortalLakebed,
} from './gov-portal-interactions.tsx'

const HI_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९']
import { Container } from '#/section-kit/Container.tsx'
import { GovPortalHome } from '#/section-kit/GovPortalHome.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { ResponsiveGrid } from '#/section-kit/ResponsiveGrid.tsx'

/** Render ASCII digits in Devanagari so numeric values localise in Hindi. */
export function toHiNum(s: string) {
  return s.replace(/[0-9]/g, (d) => HI_DIGITS[Number(d)])
}

const HERO_VIDEOS = [
  'https://videos.pexels.com/video-files/6216793/6216793-hd_1920_1080_30fps.mp4',
  'https://videos.pexels.com/video-files/27844418/12240414_1920_1080_60fps.mp4',
  'https://videos.pexels.com/video-files/31111118/13293217_1920_1080_60fps.mp4',
  'https://videos.pexels.com/video-files/2836004/2836004-hd_1920_1080_24fps.mp4',
]

/**
 * GovPortalHero — a full-bleed hero whose background is an auto-advancing
 * carousel of muted looping stock videos (power plant, grid, industry, solar),
 * with a primary gradient wash and an overlaid eyebrow, two-line headline,
 * supporting line and two CTAs. Theme-token based; bilingual (EN/HI).
 */
export const GovPortalHero = defineCapsule({
  name: 'GovPortalHero',
  description:
    'Government / PSU portal hero with a full-bleed auto-advancing background video carousel (power, grid, industry, renewables), a primary gradient overlay, an eyebrow, a two-line headline, a supporting sentence and primary + secondary CTAs. Use as the top hero on a government, PSU or civic homepage.',
  props: z.object({
    eyebrow: z.string().optional(),
    title: z.string().optional(),
    subtitle: z.string().optional(),
    primaryCta: z.string().optional(),
    secondaryCta: z.string().optional(),
    videos: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  lakebed: govPortalLakebed,
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const { lang } = useGovLang(lakebed as GovPortalLakebed)
    const [api, setApi] = useState<CarouselApi | null>(null)
    const videos = props.videos?.length ? props.videos : HERO_VIDEOS

    useEffect(() => {
      if (!api) return
      const id = setInterval(() => {
        if (api.canScrollNext()) api.scrollNext()
        else api.scrollTo(0)
      }, 6000)
      return () => clearInterval(id)
    }, [api])

    const eyebrow = pickLang(
      lang,
      props.eyebrow ?? 'Powering Progress',
      'प्रगति को सशक्त करना',
    )
    const title = pickLang(
      lang,
      props.title ?? 'Reliable Power for a Growing State',
      'बढ़ते राज्य के लिए विश्वसनीय विद्युत',
    )
    const subtitle = pickLang(
      lang,
      props.subtitle ??
        'A government thermal power undertaking delivering dependable electricity and transparent public service.',
      'एक सरकारी तापीय विद्युत उपक्रम जो भरोसेमंद बिजली और पारदर्शी जनसेवा प्रदान करता है।',
    )
    const primaryCta = pickLang(
      lang,
      props.primaryCta ?? 'View Tenders',
      'निविदाएँ देखें',
    )
    const secondaryCta = pickLang(
      lang,
      props.secondaryCta ?? 'About the Company',
      'कंपनी के बारे में',
    )

    return (
      <GovPortalHome asChild>
        <section
          className={cn(
            'relative isolate overflow-hidden bg-primary text-primary-foreground',
            props.className,
          )}
        >
          {/* video carousel background */}
          <div className="absolute inset-0 -z-10">
            <Carousel
              setApi={setApi}
              opts={{ loop: true }}
              className="size-full"
            >
              <CarouselContent className="ml-0 size-full">
                {videos.map((src, i) => (
                  <CarouselItem key={src} className="basis-full pl-0">
                    <video
                      src={src}
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload={i === 0 ? 'auto' : 'metadata'}
                      className="h-full min-h-[32rem] w-full object-cover"
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
          {/* gradient wash */}
          <div
            className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/30"
            aria-hidden
          />

          {/* carousel control — right-only, overlaid above the background + wash so clicks land */}
          <button
            type="button"
            aria-label={pickLang(lang, 'Next slide', 'अगली स्लाइड')}
            onClick={() => api?.scrollNext()}
            className="absolute right-3 top-1/2 z-20 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-primary-foreground/40 bg-background/25 text-primary-foreground backdrop-blur transition-colors hover:bg-background/45 sm:right-5"
          >
            <ChevronRightIcon className="size-5" aria-hidden />
          </button>

          <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
            <div className="max-w-2xl">
              <Eyebrow variant="solid" className="mb-4">
                {eyebrow}
              </Eyebrow>
              <h1 className="text-3xl font-bold leading-tight tracking-tight drop-shadow-sm sm:text-4xl lg:text-5xl">
                {title}
              </h1>
              <p className="mt-4 max-w-xl text-base text-primary-foreground/85 sm:text-lg">
                {subtitle}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => go('Tenders')}
                  className="inline-flex items-center gap-2 rounded-lg bg-background px-5 py-3 text-sm font-semibold text-foreground shadow-lg transition-colors hover:bg-background/90"
                >
                  {primaryCta}
                  <ArrowRightIcon className="size-4" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => go('The Company')}
                  className="inline-flex items-center gap-2 rounded-lg border border-primary-foreground/40 bg-primary-foreground/10 px-5 py-3 text-sm font-semibold text-primary-foreground backdrop-blur transition-colors hover:bg-primary-foreground/20"
                >
                  {secondaryCta}
                </button>
              </div>
            </div>
          </div>
        </section>
      </GovPortalHome>
    )
  },
})

const QUICK_ICONS = [ZapIcon, BuildingIcon, LeafIcon, ShieldCheckIcon]

/**
 * GovPortalQuickLinks — a row of icon tiles linking to the portal's primary
 * service areas. Theme-token based; bilingual.
 */
export const GovPortalQuickLinks = defineCapsule({
  name: 'GovPortalQuickLinks',
  description:
    'Row of icon quick-link tiles on a government / PSU portal linking to primary service areas (power generation, business, environment, sustainability), each with an icon, label and short description. Use directly under the hero on a government homepage.',
  props: z.object({
    heading: z.string().optional(),
    items: z
      .array(
        z.object({
          label: z.string(),
          description: z.string().optional(),
          target: z.string().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: govPortalLakebed,
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const { lang } = useGovLang(lakebed as GovPortalLakebed)
    const heading = pickLang(
      lang,
      props.heading ?? 'Explore Our Work',
      'हमारा कार्य देखें',
    )
    const openLabel = pickLang(lang, 'Open', 'खोलें')
    const items = props.items?.length
      ? props.items
      : [
          {
            label: pickLang(lang, 'Power Generation', 'विद्युत उत्पादन'),
            description: pickLang(
              lang,
              'Operational plants & capacity',
              'संचालित संयंत्र एवं क्षमता',
            ),
            target: 'Power Generation',
          },
          {
            label: pickLang(lang, 'Business', 'व्यवसाय'),
            description: pickLang(
              lang,
              'Businesses & policies',
              'व्यवसाय एवं नीतियाँ',
            ),
            target: 'The Company',
          },
          {
            label: pickLang(lang, 'Environment', 'पर्यावरण'),
            description: pickLang(
              lang,
              'Environment & compliance',
              'पर्यावरण एवं अनुपालन',
            ),
            target: 'Sustainability',
          },
          {
            label: pickLang(lang, 'Sustainability', 'सततता'),
            description: pickLang(lang, 'CSR & safety', 'सीएसआर एवं सुरक्षा'),
            target: 'Sustainability',
          },
        ]

    return (
      <section className={cn('bg-background py-14', props.className)}>
        <Container>
          <SectionHeading
            align="left"
            title={heading}
            className="mb-8 gap-0"
            titleClassName="text-2xl font-semibold tracking-tight text-foreground"
          />
          <ResponsiveGrid cols="1-2-4" className="gap-4">
            {items.map((item, i) => {
              const Icon = QUICK_ICONS[i % QUICK_ICONS.length]
              return (
                <Card
                  asChild
                  key={item.label}
                  variant="default"
                  className="group flex flex-col items-start gap-3 text-left transition-all hover:border-primary/40 hover:shadow-lg"
                >
                  <button
                    type="button"
                    onClick={() => go(item.target ?? 'Home')}
                  >
                    <span className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-6" aria-hidden />
                    </span>
                    <span className="font-semibold text-card-foreground">
                      {item.label}
                    </span>
                    {item.description ? (
                      <span className="text-sm text-muted-foreground">
                        {item.description}
                      </span>
                    ) : null}
                    <span className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-primary">
                      {openLabel}
                      <ArrowRightIcon className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </button>
                </Card>
              )
            })}
          </ResponsiveGrid>
        </Container>
      </section>
    )
  },
})

/**
 * GovPortalStats — a band of headline performance figures using StatGrid.
 * Theme-token based; bilingual.
 */
export const GovPortalStats = defineCapsule({
  name: 'GovPortalStats',
  description:
    'Band of headline performance figures on a government / PSU portal (installed capacity, plant load factor, units, uptime), each a large value with a caption, using the shared StatGrid. Use as a KPI strip on a government homepage or performance page.',
  props: z.object({
    heading: z.string().optional(),
    stats: z
      .array(
        z.object({
          value: z.string(),
          label: z.string(),
          valueHi: z.string().optional(),
          labelHi: z.string().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: govPortalLakebed,
  component: ({ props, lakebed }) => {
    const { lang } = useGovLang(lakebed as GovPortalLakebed)
    const heading = pickLang(
      lang,
      props.heading ?? 'Performance Highlights',
      'प्रदर्शन की मुख्य बातें',
    )
    const rawStats = props.stats?.length
      ? props.stats
      : [
          {
            value: '420 MW',
            valueHi: '४२० मे.वा.',
            label: 'Installed Capacity',
            labelHi: 'स्थापित क्षमता',
          },
          {
            value: '2×210',
            valueHi: '२×२१०',
            label: 'Operating Units',
            labelHi: 'संचालित इकाइयाँ',
          },
          {
            value: '85%',
            valueHi: '८५%',
            label: 'Plant Load Factor',
            labelHi: 'संयंत्र भार गुणक',
          },
          {
            value: '24/7',
            valueHi: '२४×७',
            label: 'Grid Supply',
            labelHi: 'ग्रिड आपूर्ति',
          },
        ]
    const stats = rawStats.map((s) => ({
      value:
        lang === 'hi'
          ? ((s as { valueHi?: string }).valueHi ?? toHiNum(s.value))
          : s.value,
      label:
        lang === 'hi'
          ? ((s as { labelHi?: string }).labelHi ?? s.label)
          : s.label,
    }))

    return (
      <section className={cn('bg-muted/40 py-16', props.className)}>
        <Container>
          <SectionHeading
            title={heading}
            className="mb-10 gap-0"
            titleClassName="text-2xl font-semibold tracking-tight text-foreground"
          />
          <StatGrid columns={4}>
            {stats.map((s) => (
              <StatItem key={s.label}>
                <StatValue>{s.value}</StatValue>
                <StatLabel>{s.label}</StatLabel>
              </StatItem>
            ))}
          </StatGrid>
        </Container>
      </section>
    )
  },
})
