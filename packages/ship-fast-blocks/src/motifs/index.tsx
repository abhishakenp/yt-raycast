/**
 * Motifs — relational DNA extracted from 1,063 capsules.
 *
 * Each motif is an OpenUI capsule that composes primitives with specific
 * relationships: layout ratios, decor elements, spacing, ordering, emphasis.
 * The motif name describes STRUCTURE, never a vertical.
 *
 * Named by what it IS, not what it's FOR:
 *   splitHero, cardGrid, groupedList — ✅
 *   restaurantHero, saasFeatures — ❌ (that's the old sin)
 *
 * All images use img.tsx (ambient context-aware) via the ImageBlock primitive.
 */
import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import * as P from '#/primitives/index.tsx'
import { DesignSystemProvider } from '#/primitives/design-context.tsx'
import type { DesignIntent } from '#/primitives/design-system.ts'
import { DEFAULT_DESIGN, parseDesignLine } from '#/primitives/design-system.ts'
import { SiteNav } from '#/section-kit/SiteNav.tsx'
import {
  SiteFooter,
  FooterContent,
  FooterGrid,
  FooterBrand,
  FooterColumn,
  FooterColumnTitle,
  FooterColumnList,
  FooterLink,
  FooterSocial,
  FooterSocialLink,
} from '#/section-kit/SiteFooter.tsx'
import {
  PricingGrid,
  PricingTier,
  PricingTierBadge,
  PricingTierHeader,
  PricingTierName,
  PricingTierPrice,
  PricingTierPeriod,
  PricingTierFeatures,
  PricingTierFeature,
  PricingTierCta,
  pricingTierVariants,
} from '#/section-kit/PricingGrid.tsx'
import {
  HeroSection,
  HeroContent,
  HeroBadge,
  HeroHeading,
  HeroSubheading,
  HeroActions,
  HeroCta,
  HeroMediaPanel,
  HeroStats,
  HeroStat,
  HeroStatValue,
  HeroStatLabel,
  HeroBackgroundImage,
} from '#/section-kit/HeroSection.tsx'
import {
  BentoGrid as KitBentoGrid,
  BentoTile,
  BentoTileBody,
  BentoTileTitle,
  BentoTileDescription,
} from '#/section-kit/BentoGrid.tsx'
import {
  FeatureGrid,
  FeatureCard,
  FeatureIcon,
  FeatureTitle,
  FeatureDescription,
} from '#/section-kit/FeatureGrid.tsx'
import {
  StatGrid,
  StatItem,
  StatValue,
  StatLabel,
} from '#/section-kit/StatGrid.tsx'
import {
  TestimonialGrid,
  TestimonialCard,
  TestimonialQuote,
  TestimonialAuthor,
  TestimonialName,
  TestimonialMeta,
} from '#/section-kit/TestimonialGrid.tsx'
import {
  CtaBand as KitCtaBand,
  CtaBandInner as KitCtaBandInner,
  CtaBandTitle,
  CtaBandSubtitle,
  CtaBandActions,
  CtaAction,
} from '#/section-kit/CtaBand.tsx'
import {
  NewsletterCta as KitNewsletterCta,
  NewsletterCtaHeading,
  NewsletterCtaDescription,
} from '#/section-kit/NewsletterCta.tsx'
import {
  FaqAccordion as KitFaqAccordion,
  FaqItem,
  FaqQuestion,
  FaqAnswer,
} from '#/section-kit/FaqAccordion.tsx'
import {
  ContactForm as KitContactForm,
  ContactFormField,
  ContactFormLabel,
  ContactFormInput,
  ContactFormTextarea,
  ContactFormSubmit,
} from '#/section-kit/ContactForm.tsx'
import {
  PullQuote,
  PullQuoteText,
  PullQuoteAttribution,
  PullQuoteName,
  PullQuoteRole,
} from '#/section-kit/PullQuote.tsx'
import {
  StorySection,
  StorySplitGrid,
  StoryMedia,
  StoryContent,
  StoryHeading,
  StoryBody,
  StoryImageTile,
} from '#/section-kit/StorySection.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { Container } from '#/section-kit/Container.tsx'
import {
  type ChromeVariant,
  type DecorVariant,
  SectionEyebrow,
  DecorBackground,
  WatermarkDecor,
  TickBar,
  SparkBars,
  GlowOrbs,
  GhostNumeral,
  TerminalChrome,
  ImageCaptionBar,
  RotatedSticker,
  CardIndex,
  IndexDivider,
  FloatingStatPhoto,
  GlowingPhoto,
  ImageZoomHover,
  OffsetImageTiles,
  CountdownTimer,
  InlineEmailCapture,
  RotatedBadge,
  StarRating,
  QuoteMark,
  LogoMarquee,
  HollowHighlight,
  StickerHighlight,
  VerticalScrollRail,
  HorizontalScrollStrip,
  FadingDotGrid,
  ChapterWatermark,
  StickerPill,
  BlockCta,
  UnderlineSlideLink,
  TiltedMarquee,
  BrutalistImagePlate,
  EditorialImagePlate,
  staggerClass,
  microRotate,
  CardGhostNumeral,
  inversionHoverClass,
  DropCap,
  MonoMetadata,
  SkewedCta,
  RegistrationTicks,
  MonoAnnotationRail,
  StickerHeading,
  DimensionLine,
  OffsetColorFrame,
  VaryingTickBar,
  EditorialSectionHeader,
  diagonalSeamClass,
  RuledLead,
  GraphPaper,
  MonoTag,
  chromeBorderClass,
  chromeGridClass,
  chromeHeadingClass,
  chromeCardTitleClass,
  slantedSeamClass,
} from './chrome.tsx'

// Helper: wrap children in DesignSystemProvider so motifs work standalone
function withDesign(intent: DesignIntent, children: React.ReactNode) {
  return <DesignSystemProvider intent={intent}>{children}</DesignSystemProvider>
}

// ─── 1. splitHero ────────────────────────────────────────────────────────
// 7/5 split, display heading with highlight, lead text, dual CTAs, KPI strip.
// From AgencyHero: watermark + dot grid + tilted marquee between copy and KPIs.

export const SplitHero = defineCapsule({
  name: 'SplitHero',
  description:
    'Asymmetric 7/5 split hero: mono badge + display heading with highlighted phrase + lead text + dual CTAs + collapsed-border KPI strip. Chrome: hairline (graph paper + collapsed-border KPIs + tick bars), brutalist (border-2 + hard shadows + uppercase), gradient (glow orbs + pulsing dots), terminal (mono labels + dashboard panel + spark bars).',
  props: z.object({
    badge: z.string().optional(),
    heading: z.string().optional(),
    highlight: z.string().optional(),
    subheading: z.string().optional(),
    primaryCta: z.string().optional(),
    secondaryCta: z.string().optional(),
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    watermark: z.string().optional(),
    imageAlt: z.string().optional(),
    imageSrc: z.string().optional(),
    variant: z.enum(['split', 'default', 'full-bleed', 'gradient']).optional(),
    chrome: z
      .enum([
        'none',
        'hairline',
        'brutalist',
        'terminal',
        'editorial',
        'gradient',
      ])
      .optional(),
    index: z.string().optional(),
    decor: z.enum(['none', 'dot-grid', 'graph-paper', 'glow']).optional(),
    className: z.string().optional(),
    design: z.string().optional(),
  }),
  component: ({ props }) => {
    const intent = props.design
      ? parseDesignFromString(props.design)
      : DEFAULT_DESIGN
    return withDesign(intent, <SplitHeroInner {...props} />)
  },
})

/**
 * ArtisticPlaceholderPanel — when no image is provided, render a beautiful
 * artistic placeholder instead of empty space. Each chrome variant gets a
 * distinct visual treatment so the hero always looks intentional.
 */
function ArtisticPlaceholderPanel({
  chrome,
  watermark,
}: {
  chrome: ChromeVariant
  watermark?: string
}) {
  if (chrome === 'terminal') {
    return (
      <div className="relative border border-border bg-card">
        <div
          className="flex items-center justify-between border-b border-border px-4 py-3"
          aria-hidden="true"
        >
          <span className="flex items-center gap-2">
            <span className="size-1.5 bg-primary" />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Live dashboard
            </span>
          </span>
          <span className="flex gap-1">
            <span className="size-1.5 bg-muted-foreground/30" />
            <span className="size-1.5 bg-muted-foreground/30" />
            <span className="size-1.5 bg-muted-foreground/30" />
          </span>
        </div>
        <div className="aspect-[3/2] bg-muted/40" aria-hidden="true">
          <div className="flex h-full items-center justify-center">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">
              [ preview ]
            </span>
          </div>
        </div>
        <SparkBars className="border-t border-border px-4" />
        <ImageCaptionBar caption="dashboard preview" figure="fig. 01" />
      </div>
    )
  }

  if (chrome === 'brutalist') {
    return (
      <div className="relative aspect-square border-2 border-foreground bg-muted/40 shadow-[8px_8px_0_0] shadow-foreground">
        <div
          className="flex h-full items-center justify-center"
          aria-hidden="true"
        >
          <span className="text-[8rem] font-black uppercase leading-none text-foreground/[0.06]">
            {watermark ?? '*'}
          </span>
        </div>
        <RotatedSticker rotate="-rotate-3">Featured</RotatedSticker>
      </div>
    )
  }

  if (chrome === 'editorial') {
    return (
      <div className="overflow-hidden border border-border bg-card">
        <div className="aspect-[4/5] bg-muted/40" aria-hidden="true">
          <div className="flex h-full items-center justify-center">
            <span className="font-serif text-6xl text-foreground/[0.08]">
              {watermark ?? '§'}
            </span>
          </div>
        </div>
        <ImageCaptionBar caption="editorial placeholder" figure="fig. 01" />
      </div>
    )
  }

  if (chrome === 'gradient') {
    return (
      <div className="relative aspect-square">
        <GlowOrbs />
        <div className="relative flex h-full items-center justify-center">
          <span className="text-[8rem] font-black leading-none text-foreground/[0.06]">
            {watermark ?? '*'}
          </span>
        </div>
      </div>
    )
  }

  if (chrome === 'hairline') {
    return (
      <div className="relative aspect-square border border-border bg-card">
        <div
          className="flex h-full items-center justify-center"
          aria-hidden="true"
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">
            [ image ]
          </span>
        </div>
        <ImageCaptionBar caption="placeholder" figure="fig. 01" />
      </div>
    )
  }

  // none — default artistic placeholder with watermark
  return (
    <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted/40">
      <div
        className="flex h-full items-center justify-center"
        aria-hidden="true"
      >
        <span className="text-[8rem] font-black leading-none text-foreground/[0.06]">
          {watermark ?? '*'}
        </span>
      </div>
    </div>
  )
}

function SplitHeroInner(props: Record<string, unknown>) {
  const badge = (props.badge as string) ?? 'Available now'
  const rawHeading =
    (props.heading as string) ?? 'We craft experiences that define brands'
  const subheading =
    (props.subheading as string) ??
    'Strategy, design, and technology fused into cohesive digital products.'
  const primaryCta = (props.primaryCta as string) ?? 'Start a project'
  const secondaryCta = (props.secondaryCta as string) ?? 'See our work'
  const stats = (props.stats as Array<{ value: string; label: string }>) ?? [
    { value: '120+', label: 'Projects' },
    { value: '45', label: 'Awards' },
    { value: '8yr', label: 'In the game' },
    { value: '98%', label: 'Retention' },
  ]
  const watermark = (props.watermark as string) ?? '*'
  const variant =
    (props.variant as 'split' | 'default' | 'full-bleed' | 'gradient') ??
    'split'
  // ALWAYS default imageAlt so a real contextual photo renders (the Image
  // component generates stock photos from alt text). This is what made the
  // hand-crafted capsules beautiful — every hero had an actual image.
  const imageAlt =
    (props.imageAlt as string) ??
    'Modern design studio workspace with natural light and creative team collaboration'
  const chrome = (props.chrome as ChromeVariant) ?? 'editorial'
  const index = props.index as string | undefined

  // Parse [hl]...[/hl] markers to extract highlight phrase. If no markers,
  // the last word becomes the highlight (editorial/brutalist variants).
  const hlMatch = rawHeading.match(/\[hl\](.+?)\[\/hl\]/)
  const heading = rawHeading.replace(/\[hl\]|\[\/hl\]/g, '')
  const highlight = (props.highlight as string) ?? (hlMatch ? hlMatch[1] : '')
  const decor = (props.decor as DecorVariant) ?? 'none'

  if (variant === 'full-bleed' && imageAlt) {
    return (
      <HeroSection variant="full-bleed" className="min-h-[70vh]">
        <HeroBackgroundImage alt={imageAlt} />
        <Container className="relative z-10 flex min-h-[70vh] flex-col justify-end gap-6 py-20">
          {badge && <HeroBadge variant="pill">{badge}</HeroBadge>}
          <HeroHeading variant="serif">{heading}</HeroHeading>
          <HeroSubheading variant="light">{subheading}</HeroSubheading>
          <HeroActions>
            <HeroCta variant="primary">{primaryCta}</HeroCta>
            {secondaryCta && (
              <HeroCta variant="outline">{secondaryCta}</HeroCta>
            )}
          </HeroActions>
        </Container>
      </HeroSection>
    )
  }

  if (variant === 'gradient') {
    return (
      <HeroSection variant="gradient">
        <Container className="flex flex-col items-center gap-6 text-center">
          {badge && <HeroBadge variant="solid">{badge}</HeroBadge>}
          <HeroHeading variant="black">{heading}</HeroHeading>
          <HeroSubheading variant="large">{subheading}</HeroSubheading>
          <HeroActions>
            <HeroCta variant="primary">{primaryCta}</HeroCta>
            {secondaryCta && <HeroCta variant="ghost">{secondaryCta}</HeroCta>}
          </HeroActions>
          {stats.length > 0 && (
            <HeroStats>
              {stats.slice(0, 4).map((s, i) => (
                <HeroStat key={i}>
                  <HeroStatValue>{s.value}</HeroStatValue>
                  <HeroStatLabel>{s.label}</HeroStatLabel>
                </HeroStat>
              ))}
            </HeroStats>
          )}
        </Container>
      </HeroSection>
    )
  }

  // split (default) — asymmetric layout with media panel
  // Editorial: 8/4 split with hollow highlight, vertical rail, dot grid, chapter watermark, image plate with sticker
  // Brutalist: 7/5 split with sticker pill, slab headline, block CTAs, tilted marquee, brutalist image plate
  // Others: 7/5 split with chrome-driven decor
  const sectionDecor =
    decor !== 'none'
      ? decor
      : chrome === 'gradient'
        ? 'glow'
        : chrome === 'hairline' || chrome === 'terminal'
          ? 'graph-paper'
          : 'none'

  // ── Editorial: ArchitectureFirmHero-style blueprint drafting sheet ──
  if (chrome === 'editorial') {
    // Split heading into two lines for the stacked indented layout
    const headingWords = heading.split(' ')
    const headingLine1 = highlight
      ? heading.replace(highlight, '').trim()
      : headingWords.slice(0, Math.ceil(headingWords.length / 2)).join(' ')
    const headingLine2 =
      highlight ||
      headingWords.slice(Math.ceil(headingWords.length / 2)).join(' ') ||
      (headingWords.at(-1) ?? '')
    return (
      <HeroSection
        variant="default"
        className={cn(
          'relative overflow-hidden border-b border-border bg-background',
        )}
      >
        <GraphPaper className="inset-0" />
        <RegistrationTicks />
        <WatermarkDecor
          watermark={watermark}
          className="-bottom-8 -left-2 text-[9rem] font-extralight sm:text-[15rem] lg:-bottom-16 lg:text-[22rem]"
        />
        <Container className="relative py-16 sm:py-20 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-8">
              {/* Mono annotation rail: figure index — rule — eyebrow. */}
              <MonoAnnotationRail index="Fig. 01" eyebrow={badge} />
              <h1 className="mb-8 text-[clamp(3rem,8vw,8rem)] font-extralight leading-[0.92] tracking-tight text-foreground">
                {headingLine1}
                <br />
                <span className="inline-block pl-[0.75em]">{headingLine2}</span>
              </h1>
              <RuledLead className="mb-10 max-w-xl">{subheading}</RuledLead>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
                <span className="inline-flex items-center justify-center rounded-none bg-primary px-7 py-3.5 text-sm font-medium tracking-wide text-primary-foreground transition-all duration-150 hover:bg-primary/90 active:translate-y-px">
                  {primaryCta}
                </span>
                <span className="inline-flex items-center justify-center rounded-none border border-foreground px-7 py-3.5 text-sm font-medium tracking-wide text-foreground transition-colors duration-150 hover:bg-foreground hover:text-background active:translate-y-px">
                  {secondaryCta}
                </span>
              </div>
            </div>
            <div className="lg:col-span-4">
              <EditorialImagePlate
                alt={imageAlt}
                src={props.imageSrc as string | undefined}
                aspectClass="aspect-[4/5]"
                dimensionLabel="Elev. North — 1:200"
              />
            </div>
          </div>
          {/* Collapsed-border KPI strip with varying tick bars */}
          {stats.length > 0 && (
            <div className="mt-16 border-y border-border">
              <div className="mb-6 mt-6 flex items-center gap-4">
                <MonoTag>
                  Results
                  <span aria-hidden="true" className="text-primary">
                    {' '}
                    · live
                  </span>
                </MonoTag>
                <span aria-hidden="true" className="h-px flex-1 bg-border" />
                <MonoTag aria-hidden="true" tone="faint">
                  [ since 2019 ]
                </MonoTag>
              </div>
              <div className="grid grid-cols-2 border-l border-t border-border sm:grid-cols-4">
                {stats.slice(0, 4).map((s, i) => (
                  <div
                    key={i}
                    className="flex flex-col gap-3 border-b border-r border-border p-5 sm:p-7"
                  >
                    <dt className="text-[clamp(2.25rem,4.5vw,3.75rem)] font-extralight leading-none tracking-tight tabular-nums text-foreground">
                      {s.value}
                    </dt>
                    <dd>
                      <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                        {s.label}
                      </span>
                    </dd>
                    <VaryingTickBar index={i} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </Container>
      </HeroSection>
    )
  }

  // ── Brutalist: AgencyHero-style poster with split image ──
  if (chrome === 'brutalist') {
    // Use parsed highlight, or fall back to last word
    const headingWords = heading.split(' ')
    const headingMark = highlight || (headingWords.at(-1) ?? '')
    const headingLead = highlight
      ? heading.replace(highlight, '').trim()
      : headingWords.slice(0, -1).join(' ')
    return (
      <HeroSection
        variant="split"
        className={cn(
          'relative overflow-hidden border-b-2 border-foreground pb-0 pt-24 sm:pt-28 lg:pt-32',
        )}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
        >
          <FadingDotGrid
            density="tight"
            fade="left"
            className="inset-y-0 right-0 w-1/2 sm:w-1/3"
          />
          <WatermarkDecor
            watermark={watermark}
            className="-top-16 right-[-4rem] rotate-12 text-[16rem] text-foreground/[0.05] sm:text-[24rem] lg:-top-24 lg:text-[30rem]"
          />
        </div>
        <Container size="xl" className="relative px-6">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-0">
            <div className="flex flex-col gap-6 lg:col-span-7 lg:pr-14">
              <div className="flex items-center justify-between gap-4">
                <StickerPill>{badge}</StickerPill>
                {index && (
                  <MonoTag
                    aria-hidden="true"
                    className="hidden shrink-0 sm:inline"
                  >
                    {index}
                  </MonoTag>
                )}
              </div>
              <h1 className="mt-4 max-w-5xl text-[clamp(2.75rem,7vw,6rem)] font-black uppercase leading-[0.85] tracking-tighter text-foreground">
                {headingLead}{' '}
                <StickerHighlight>{headingMark}</StickerHighlight>{' '}
              </h1>
              <div className="mt-8 border-t-2 border-foreground pt-8">
                <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                  <p className="max-w-xl text-base leading-relaxed sm:text-lg">
                    {subheading}
                  </p>
                  <div className="flex w-full shrink-0 flex-col gap-4 sm:w-auto sm:flex-row sm:items-center">
                    <BlockCta variant="primary">{primaryCta}</BlockCta>
                    <BlockCta variant="outline">{secondaryCta}</BlockCta>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative lg:col-span-5 lg:pl-14">
              {imageAlt ? (
                <BrutalistImagePlate
                  alt={imageAlt}
                  src={props.imageSrc as string | undefined}
                  sticker="Featured"
                  stickerRotate="-rotate-3"
                  aspectClass="aspect-square"
                />
              ) : (
                <ArtisticPlaceholderPanel
                  chrome={chrome}
                  watermark={watermark}
                />
              )}
            </div>
          </div>
        </Container>
        {/* Full-bleed tilted marquee strip */}
        <TiltedMarquee items={[badge]} className="mt-12 sm:mt-16" />
        {/* Collapsed-border KPI strip */}
        {stats.length > 0 && (
          <div className="relative mt-6 border-t-2 border-foreground">
            <Container size="xl" className="px-0 sm:px-6">
              <div className="grid grid-cols-2 border-l-2 border-foreground lg:grid-cols-4">
                {stats.slice(0, 4).map((s, i) => (
                  <div
                    key={i}
                    className={cn(
                      'flex flex-col gap-1 border-b-2 border-r-2 border-foreground p-5 sm:p-7',
                      i === 0 && 'bg-foreground text-background',
                    )}
                  >
                    <span
                      className={cn(
                        'text-3xl font-black tabular-nums tracking-tighter sm:text-4xl',
                        i === 0 ? 'text-background' : 'text-foreground',
                      )}
                    >
                      {s.value}
                    </span>
                    <span
                      className={cn(
                        'font-mono text-[10px] uppercase tracking-[0.2em]',
                        i === 0
                          ? 'text-background/70'
                          : 'text-muted-foreground',
                      )}
                    >
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            </Container>
          </div>
        )}
      </HeroSection>
    )
  }

  // ── Hairline / Terminal / Gradient / None: original chrome-driven split ──
  return (
    <HeroSection
      variant="split"
      className={cn('relative overflow-hidden border-b border-border')}
    >
      {sectionDecor !== 'none' && <DecorBackground decor={sectionDecor} />}
      <WatermarkDecor watermark={watermark} />
      <Container size="xl" className="relative py-20">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-0">
          <HeroContent className="flex flex-col gap-6 lg:col-span-7 lg:pr-14 lg:border-r lg:border-border">
            <div className="flex items-center justify-between gap-4">
              <HeroBadge variant="pulsing-dot">{badge}</HeroBadge>
              {index && (
                <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {index}
                </span>
              )}
            </div>
            <HeroHeading className={chromeHeadingClass(chrome)}>
              {heading}
            </HeroHeading>
            <HeroSubheading>{subheading}</HeroSubheading>
            <HeroActions>
              <HeroCta variant="primary">{primaryCta}</HeroCta>
              {secondaryCta && (
                <HeroCta variant="outline">{secondaryCta}</HeroCta>
              )}
            </HeroActions>
          </HeroContent>
          <div className={cn('relative lg:col-span-5 lg:pl-14')}>
            {imageAlt ? (
              chrome === 'terminal' ? (
                <div className="relative border border-border bg-card">
                  <div
                    className="flex items-center justify-between border-b border-border px-4 py-3"
                    aria-hidden="true"
                  >
                    <span className="flex items-center gap-2">
                      <span className="size-1.5 bg-primary" />
                      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                        Live dashboard
                      </span>
                    </span>
                    <span className="flex gap-1">
                      <span className="size-1.5 bg-muted-foreground/30" />
                      <span className="size-1.5 bg-muted-foreground/30" />
                      <span className="size-1.5 bg-muted-foreground/30" />
                    </span>
                  </div>
                  <P.ImageBlock
                    alt={imageAlt}
                    src={props.imageSrc as string | undefined}
                    className="block aspect-[3/2] w-full object-cover"
                  />
                  <SparkBars className="border-t border-border px-4" />
                  <ImageCaptionBar caption={imageAlt} figure="fig. 01" />
                </div>
              ) : chrome === 'gradient' ? (
                <GlowingPhoto
                  alt={imageAlt}
                  src={props.imageSrc as string | undefined}
                  className="aspect-square"
                />
              ) : (
                <HeroMediaPanel
                  alt={imageAlt}
                  className="aspect-square shadow-xl"
                />
              )
            ) : (
              <ArtisticPlaceholderPanel chrome={chrome} watermark={watermark} />
            )}
          </div>
        </div>
        {stats.length > 0 && (
          <div
            className={cn(
              'mt-16',
              chrome === 'hairline' || chrome === 'terminal'
                ? 'grid grid-cols-2 border-l border-t border-border sm:grid-cols-4'
                : 'flex flex-wrap gap-8',
            )}
          >
            {stats.slice(0, 4).map((s, i) =>
              chrome === 'hairline' || chrome === 'terminal' ? (
                <div
                  key={i}
                  className="border-b border-r border-border p-4 sm:p-5"
                >
                  <dt className="text-2xl font-bold tabular-nums tracking-tight text-foreground sm:text-3xl">
                    {s.value}
                  </dt>
                  <dd className="mt-1.5">
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      {s.label}
                    </span>
                  </dd>
                  <TickBar index={i} className="mt-3" />
                </div>
              ) : (
                <div key={i} className="flex flex-col gap-1">
                  <span className="text-2xl font-bold tabular-nums tracking-tight text-foreground sm:text-3xl">
                    {s.value}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    {s.label}
                  </span>
                </div>
              ),
            )}
          </div>
        )}
      </Container>
    </HeroSection>
  )
}

// ─── 2. centeredHero ─────────────────────────────────────────────────────
// Centered display heading, lead, CTA, optional stats. Common SaaS pattern.

export const CenteredHero = defineCapsule({
  name: 'CenteredHero',
  description:
    'Centered hero: display heading + lead text + CTA + optional stats row. Clean, versatile, works for any landing page.',
  props: z.object({
    heading: z.string().optional(),
    subheading: z.string().optional(),
    primaryCta: z.string().optional(),
    secondaryCta: z.string().optional(),
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    className: z.string().optional(),
    design: z.string().optional(),
  }),
  component: ({ props }) => {
    const intent = props.design
      ? parseDesignFromString(props.design)
      : DEFAULT_DESIGN
    return withDesign(intent, <CenteredHeroInner {...props} />)
  },
})

function CenteredHeroInner(props: Record<string, unknown>) {
  const heading = P.stripHlTags(
    (props.heading as string) ?? 'Build faster, ship smarter',
  )
  const subheading =
    (props.subheading as string) ??
    'The platform that turns ideas into production-ready websites in seconds.'
  const primaryCta = (props.primaryCta as string) ?? 'Get started'
  const secondaryCta = (props.secondaryCta as string) ?? 'Learn more'
  const stats = props.stats as
    | Array<{ value: string; label: string }>
    | undefined
  return (
    <HeroSection variant="default" className="py-20">
      <Container className="flex flex-col items-center gap-6 text-center">
        <HeroHeading>{heading}</HeroHeading>
        <HeroSubheading variant="large">{subheading}</HeroSubheading>
        <HeroActions>
          <HeroCta variant="primary">{primaryCta}</HeroCta>
          {secondaryCta && <HeroCta variant="ghost">{secondaryCta}</HeroCta>}
        </HeroActions>
        {stats && stats.length > 0 && (
          <HeroStats className="mt-8">
            {stats.slice(0, 4).map((s, i) => (
              <HeroStat key={i}>
                <HeroStatValue>{s.value}</HeroStatValue>
                <HeroStatLabel>{s.label}</HeroStatLabel>
              </HeroStat>
            ))}
          </HeroStats>
        )}
      </Container>
    </HeroSection>
  )
}

// ─── 3. posterHero ───────────────────────────────────────────────────────
// Full-bleed, giant display, minimal copy, background image.

export const PosterHero = defineCapsule({
  name: 'PosterHero',
  description:
    'Full-bleed poster hero: giant display heading over a background image with minimal copy and a single CTA. Cinematic, bold.',
  props: z.object({
    heading: z.string().optional(),
    subheading: z.string().optional(),
    cta: z.string().optional(),
    imageAlt: z.string().optional(),
    imageSrc: z.string().optional(),
    className: z.string().optional(),
    design: z.string().optional(),
  }),
  component: ({ props }) => {
    const intent = props.design
      ? parseDesignFromString(props.design)
      : DEFAULT_DESIGN
    return withDesign(intent, <PosterHeroInner {...props} />)
  },
})

function PosterHeroInner(props: Record<string, unknown>) {
  const heading = P.stripHlTags(
    (props.heading as string) ?? 'Visual stories that captivate',
  )
  const subheading =
    (props.subheading as string) ?? 'Crafting moments that last.'
  const cta = (props.cta as string) ?? 'Explore'
  const imageAlt = (props.imageAlt as string) ?? 'Cinematic background'
  return (
    <HeroSection variant="full-bleed" className="min-h-[70vh]">
      <HeroBackgroundImage alt={imageAlt} />
      <Container className="relative z-10 flex min-h-[70vh] flex-col justify-end gap-6 py-20">
        <HeroHeading variant="serif">{heading}</HeroHeading>
        <HeroSubheading variant="light">{subheading}</HeroSubheading>
        <HeroActions>
          <HeroCta variant="primary">{cta}</HeroCta>
        </HeroActions>
      </Container>
    </HeroSection>
  )
}

// ─── 4. comingSoonHero ───────────────────────────────────────────────────
// Ghost type, countdown grid, waitlist form.

export const ComingSoonHero = defineCapsule({
  name: 'ComingSoonHero',
  description:
    'Coming soon hero: ghost-stroke display heading + lead + email waitlist form. Urgency-driven, minimal.',
  props: z.object({
    heading: z.string().optional(),
    subheading: z.string().optional(),
    cta: z.string().optional(),
    className: z.string().optional(),
    design: z.string().optional(),
  }),
  component: ({ props }) => {
    const intent = props.design
      ? parseDesignFromString(props.design)
      : DEFAULT_DESIGN
    return withDesign(intent, <ComingSoonHeroInner {...props} />)
  },
})

function ComingSoonHeroInner(props: Record<string, unknown>) {
  const heading =
    (props.heading as string) ?? 'Something [hl]incredible[/hl] is coming'
  const subheading =
    (props.subheading as string) ?? 'Join the waitlist to be first in line.'
  const cta = (props.cta as string) ?? 'Notify me'
  return (
    <P.Section className="relative">
      <P.Container
        size="md"
        className="flex flex-col items-center gap-8 text-center"
      >
        <P.Heading level="display" text={heading} />
        <P.Text variant="lead" text={subheading} className="max-w-md" />
        <CountdownTimer />
        <InlineEmailCapture
          placeholder="you@example.com"
          submitLabel={cta}
          disclaimer="No spam, unsubscribe anytime."
        />
      </P.Container>
    </P.Section>
  )
}

// ─── 5. cardGrid ─────────────────────────────────────────────────────────
// Heading + eyebrow + grid of cards with index/title/description.

export const CardGrid = defineCapsule({
  name: 'CardGrid',
  description:
    'Section with eyebrow + heading + grid of cards. Each card has an optional index, title, and description. Chrome: hairline (collapsed-border + mono indices + tick bars), brutalist (border-2 + hard shadows), terminal (mono $ labels), editorial (serif + figure indices).',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    subheading: z.string().optional(),
    cards: z
      .array(
        z.object({
          title: z.string(),
          description: z.string().optional(),
          imageAlt: z.string().optional(),
          imageSrc: z.string().optional(),
        }),
      )
      .optional(),
    cols: z.number().optional(),
    variant: z.enum(['standard', 'collapsed-border', 'asymmetric']).optional(),
    chrome: z
      .enum(['none', 'hairline', 'brutalist', 'terminal', 'editorial'])
      .optional(),
    index: z.string().optional(),
    watermark: z.string().optional(),
    decor: z.enum(['none', 'dot-grid', 'graph-paper', 'glow']).optional(),
    className: z.string().optional(),
    design: z.string().optional(),
  }),
  component: ({ props }) => {
    const intent = props.design
      ? parseDesignFromString(props.design)
      : DEFAULT_DESIGN
    return withDesign(intent, <CardGridInner {...props} />)
  },
})

function CardGridInner(props: Record<string, unknown>) {
  const eyebrow = props.eyebrow as string | undefined
  const heading = (props.heading as string) ?? 'Features'
  const subheading = props.subheading as string | undefined
  const cards = (props.cards as Array<{
    title: string
    description?: string
    imageAlt?: string
    imageSrc?: string
  }>) ?? [
    {
      title: 'Visual Kanban Boards',
      description:
        'Drag-and-drop cards, custom columns, and swimlanes for fluid project management.',
      imageAlt:
        'Colorful project management kanban board on a laptop screen with drag and drop cards',
    },
    {
      title: 'Realtime Collaboration',
      description:
        'Live editing, mentions, and an activity feed so nothing falls through the cracks.',
      imageAlt:
        'Team video call with shared document editing on multiple monitors in a modern office',
    },
    {
      title: 'AI Insights',
      description:
        'Predictive timelines, risk alerts, and resource forecasts powered by machine learning.',
      imageAlt:
        'Futuristic AI dashboard with predictive analytics charts and intelligent alerts on a dark screen',
    },
  ]
  const cols = (props.cols as number) ?? 3
  const variant =
    (props.variant as 'standard' | 'collapsed-border' | 'asymmetric') ??
    'standard'
  const chrome = (props.chrome as ChromeVariant) ?? 'editorial'
  const index = props.index as string | undefined
  const watermark = props.watermark as string | undefined
  const decor = (props.decor as DecorVariant) ?? 'none'
  const columns = cols === 2 ? 2 : cols === 4 ? 4 : 3

  // ── Editorial: ArchitectureFirm-style hairline ledger grid — collapsed-border cells, ghost numerals ──
  if (chrome === 'editorial') {
    return (
      <P.Section className="relative overflow-hidden py-16 sm:py-24 lg:py-28">
        <Container>
          <EditorialSectionHeader
            index="01 /"
            eyebrow="Services"
            heading={heading}
            description={subheading}
            metaLabel="Catalog"
            meta={String(cards.length).padStart(2, '0')}
          />
          <div
            className={cn(
              'grid gap-0 border-l border-t border-border',
              columns === 2 && 'grid-cols-1 sm:grid-cols-2',
              columns === 3 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
              columns === 4 && 'grid-cols-2 lg:grid-cols-4',
            )}
          >
            {cards.map((card, i) => (
              <div
                key={i}
                className="group relative overflow-hidden border-b border-r border-border p-6 sm:p-8"
              >
                {/* Giant ghost numeral */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-2 -top-6 select-none text-[6rem] font-extralight leading-none tracking-tighter text-foreground/[0.06] sm:text-[7rem]"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="relative">
                  {card.imageAlt && (
                    <div className="mb-4 overflow-hidden border border-foreground/25 bg-muted">
                      <P.ImageBlock
                        alt={card.imageAlt}
                        src={card.imageSrc}
                        className="aspect-video w-full object-cover grayscale transition-[filter,transform] duration-500 group-hover:scale-[1.03] group-hover:grayscale-0"
                      />
                    </div>
                  )}
                  <MonoTag className="text-foreground">
                    {String(i + 1).padStart(2, '0')} / Service
                  </MonoTag>
                  <h3 className="mt-3 text-xl font-light tracking-tight text-foreground">
                    {card.title}
                  </h3>
                  {card.description && (
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {card.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </P.Section>
    )
  }

  // Chrome-driven layout: hairline/terminal/brutalist uses collapsed-border grid with mono indices
  if (
    chrome === 'hairline' ||
    chrome === 'terminal' ||
    chrome === 'brutalist'
  ) {
    return (
      <P.Section
        className={cn(
          'relative overflow-hidden',
          chrome === 'brutalist' && 'border-b-2 border-foreground bg-muted/40',
        )}
      >
        {decor !== 'none' && <DecorBackground decor={decor} />}
        <WatermarkDecor watermark={watermark} />
        <Container size="xl" className="relative py-20">
          <div className="mb-12 flex flex-col gap-6 border-b border-border pb-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <SectionEyebrow index={index} chrome={chrome} />
              <h2
                className={cn(
                  'text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl',
                  chromeHeadingClass(chrome),
                )}
              >
                {heading}
              </h2>
              {subheading && (
                <p className="mt-4 text-lg text-muted-foreground">
                  {subheading}
                </p>
              )}
            </div>
            <span
              aria-hidden="true"
              className={cn(
                'shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60 tabular-nums',
              )}
            >
              [ {String(cards.length).padStart(2, '0')}{' '}
              {chrome === 'terminal' ? 'modules' : 'items'} ]
            </span>
          </div>
          <FeatureGrid
            columns={columns as 2 | 3 | 4}
            className={chromeGridClass(chrome)}
          >
            {cards.map((card, i) => (
              <FeatureCard
                key={i}
                className={cn('p-7 sm:p-8', chromeBorderClass(chrome))}
              >
                <div className="flex items-center gap-3">
                  <CardIndex index={i + 1} chrome={chrome} />
                  <IndexDivider chrome={chrome} />
                </div>
                {card.imageAlt && (
                  <P.ImageBlock
                    alt={card.imageAlt}
                    src={card.imageSrc}
                    className="mb-4 aspect-video"
                  />
                )}
                <FeatureTitle className={chromeCardTitleClass(chrome)}>
                  {card.title}
                </FeatureTitle>
                {card.description && (
                  <FeatureDescription className="leading-relaxed">
                    {card.description}
                  </FeatureDescription>
                )}
                {(chrome === 'hairline' || chrome === 'terminal') && (
                  <TickBar index={i} className="mt-auto pt-5" />
                )}
              </FeatureCard>
            ))}
          </FeatureGrid>
        </Container>
      </P.Section>
    )
  }

  if (variant === 'collapsed-border' || variant === 'asymmetric') {
    // Keep the original collapsed-border style for numbered/indexed cards
    return (
      <P.Section>
        <Container size="xl" className="flex flex-col gap-12 py-20">
          <SectionHeading
            eyebrow={eyebrow}
            title={heading}
            subtitle={subheading}
            align="left"
          />
          <P.Grid variant={variant} cols={cols}>
            {cards.map((card, i) => (
              <P.Card
                key={i}
                index={String(i + 1).padStart(2, '0')}
                title={card.title}
                description={card.description}
                imageAlt={card.imageAlt}
                imageUrl={card.imageSrc}
              />
            ))}
          </P.Grid>
        </Container>
      </P.Section>
    )
  }

  // standard — use FeatureGrid with FeatureCard for rich hover/lift behavior
  return (
    <P.Section>
      <Container size="xl" className="py-20">
        <FeatureGrid
          heading={heading}
          subheading={subheading}
          columns={columns as 2 | 3 | 4}
        >
          {cards.map((card, i) => (
            <FeatureCard key={i}>
              {card.imageAlt && (
                <P.ImageBlock
                  alt={card.imageAlt}
                  src={card.imageSrc}
                  className="mb-2 aspect-video"
                />
              )}
              <FeatureTitle>{card.title}</FeatureTitle>
              {card.description && (
                <FeatureDescription>{card.description}</FeatureDescription>
              )}
            </FeatureCard>
          ))}
        </FeatureGrid>
      </Container>
    </P.Section>
  )
}

// ─── 6. bentoGrid ────────────────────────────────────────────────────────
// Asymmetric bento cells with varied content.

export const BentoGrid = defineCapsule({
  name: 'BentoGrid',
  description:
    'Bento grid: asymmetric cells of varying sizes. Chrome: hairline (collapsed-border + mono figure indices + ghost numerals + tick bars), brutalist (border-2 + hard shadows).',
  props: z.object({
    heading: z.string().optional(),
    cells: z
      .array(
        z.object({
          title: z.string(),
          description: z.string().optional(),
          imageAlt: z.string().optional(),
          imageSrc: z.string().optional(),
          span: z.enum(['wide', 'tall', 'normal']).optional(),
        }),
      )
      .optional(),
    layout: z
      .enum([
        '2-lg-3',
        '2-lg-4',
        '2-md-4',
        '1-md-2-3',
        '1-md-2-4',
        '1-md-3',
        '1-sm-2',
        '1-sm-2-lg-3',
      ])
      .optional(),
    chrome: z
      .enum(['none', 'hairline', 'brutalist', 'terminal', 'editorial'])
      .optional(),
    index: z.string().optional(),
    className: z.string().optional(),
    design: z.string().optional(),
  }),
  component: ({ props }) => {
    const intent = props.design
      ? parseDesignFromString(props.design)
      : DEFAULT_DESIGN
    return withDesign(intent, <BentoGridInner {...props} />)
  },
})

function BentoGridInner(props: Record<string, unknown>) {
  const heading = (props.heading as string) ?? 'Everything in one place'
  const cells = (props.cells as Array<{
    title: string
    description?: string
    imageAlt?: string
    imageSrc?: string
    span?: string
  }>) ?? [
    {
      title: 'Real-time canvas',
      description: 'See changes as they happen, anywhere in the world.',
      span: 'wide',
      imageAlt:
        'Team collaborating on a digital whiteboard with colorful sticky notes and design mockups',
    },
    {
      title: 'Smart automation',
      description: 'Let the system handle the repetitive work.',
    },
    {
      title: 'Deep integrations',
      description: 'Connect the tools your team already uses.',
    },
    {
      title: 'Built-in analytics',
      description:
        'Track progress with beautiful, real-time dashboards and custom reports.',
      span: 'tall',
      imageAlt:
        'Modern analytics dashboard on a laptop screen showing colorful charts and graphs',
    },
  ]
  const layout = (props.layout as string) ?? '2-lg-4'
  const chrome = (props.chrome as ChromeVariant) ?? 'editorial'
  const index = props.index as string | undefined
  const spanToClass = (span?: string): string => {
    if (span === 'wide') return 'col-span-2 row-span-1'
    if (span === 'tall') return 'col-span-1 row-span-2'
    return 'col-span-1 row-span-1'
  }

  // Chrome-driven: collapsed-border with mono figure indices + ghost numerals
  if (
    chrome === 'hairline' ||
    chrome === 'terminal' ||
    chrome === 'brutalist'
  ) {
    return (
      <P.Section
        className={cn(
          chrome === 'brutalist' && 'border-b-2 border-foreground bg-muted/40',
        )}
      >
        <Container size="xl" className="py-20">
          <div className="mb-10 grid items-end gap-6 sm:mb-12 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <SectionEyebrow index={index} chrome={chrome} />
              <h2
                className={cn(
                  'text-4xl font-bold tracking-tight sm:text-5xl',
                  chromeHeadingClass(chrome),
                )}
              >
                {heading}
              </h2>
            </div>
            <div
              aria-hidden="true"
              className="flex items-center justify-between gap-2 border-y border-border py-3 lg:col-span-4 lg:flex-col lg:items-end lg:justify-end lg:gap-1.5 lg:border-y-0 lg:py-0"
            >
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                <span className="text-primary">● </span>
                Fig. index
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60 tabular-nums">
                01 — {String(cells.length).padStart(2, '0')}
              </span>
            </div>
          </div>
          <KitBentoGrid
            cols={
              layout as
                | '2-lg-3'
                | '2-lg-4'
                | '2-md-4'
                | '1-md-2-3'
                | '1-md-2-4'
                | '1-md-3'
                | '1-sm-2'
                | '1-sm-2-lg-3'
            }
          >
            {cells.map((cell, i) => (
              <BentoTile
                key={i}
                span={spanToClass(cell.span)}
                className={cn(
                  'relative overflow-hidden p-6 sm:p-7',
                  chrome === 'hairline' || chrome === 'terminal'
                    ? 'rounded-none border border-border bg-card transition-colors duration-150 hover:bg-muted/30'
                    : 'rounded-none border-2 border-foreground bg-background',
                )}
              >
                <GhostNumeral numeral={String(i + 1).padStart(2, '0')} />
                <CardIndex index={i + 1} chrome={chrome} />
                {cell.imageAlt && (
                  <P.ImageBlock
                    alt={cell.imageAlt}
                    src={cell.imageSrc}
                    className="mt-4 mb-4 h-32"
                  />
                )}
                <BentoTileBody>
                  <BentoTileTitle className={chromeCardTitleClass(chrome)}>
                    {cell.title}
                  </BentoTileTitle>
                  {cell.description && (
                    <BentoTileDescription>
                      {cell.description}
                    </BentoTileDescription>
                  )}
                </BentoTileBody>
                {(chrome === 'hairline' || chrome === 'terminal') && (
                  <TickBar index={i} className="mt-auto pt-5" />
                )}
              </BentoTile>
            ))}
          </KitBentoGrid>
        </Container>
      </P.Section>
    )
  }

  return (
    <P.Section>
      <Container size="xl" className="flex flex-col gap-10 py-20">
        <SectionHeading title={heading} align="left" />
        <KitBentoGrid
          cols={
            layout as
              | '2-lg-3'
              | '2-lg-4'
              | '2-md-4'
              | '1-md-2-3'
              | '1-md-2-4'
              | '1-md-3'
              | '1-sm-2'
              | '1-sm-2-lg-3'
          }
        >
          {cells.map((cell, i) => (
            <BentoTile
              key={i}
              span={spanToClass(cell.span)}
              className="rounded-2xl border border-border bg-card p-6"
            >
              {cell.imageAlt && (
                <P.ImageBlock
                  alt={cell.imageAlt}
                  src={cell.imageSrc}
                  className="mb-4 h-32 rounded-lg"
                />
              )}
              <BentoTileBody>
                <BentoTileTitle>{cell.title}</BentoTileTitle>
                {cell.description && (
                  <BentoTileDescription>
                    {cell.description}
                  </BentoTileDescription>
                )}
              </BentoTileBody>
            </BentoTile>
          ))}
        </KitBentoGrid>
      </Container>
    </P.Section>
  )
}

// ─── 7. imageGallery ─────────────────────────────────────────────────────
// Grid of image tiles.

export const ImageGallery = defineCapsule({
  name: 'ImageGallery',
  description:
    'Image gallery: grid of image tiles with alt text. Chrome: editorial (image-zoom hover + caption bar), brutalist (border-2 + hard shadows). Optional heading above.',
  props: z.object({
    heading: z.string().optional(),
    images: z
      .array(
        z.object({
          alt: z.string(),
          src: z.string().optional(),
        }),
      )
      .optional(),
    cols: z.number().optional(),
    chrome: z
      .enum(['none', 'hairline', 'brutalist', 'terminal', 'editorial'])
      .optional(),
    index: z.string().optional(),
    className: z.string().optional(),
    design: z.string().optional(),
  }),
  component: ({ props }) => {
    const intent = props.design
      ? parseDesignFromString(props.design)
      : DEFAULT_DESIGN
    return withDesign(intent, <ImageGalleryInner {...props} />)
  },
})

function ImageGalleryInner(props: Record<string, unknown>) {
  const heading = props.heading as string | undefined
  const images = (props.images as Array<{ alt: string; src?: string }>) ?? [
    {
      alt: 'Minimalist coastal villa with floor-to-ceiling glass windows overlooking the ocean at golden hour',
    },
    {
      alt: 'Contemporary art museum interior with dramatic spiral staircase and skylight illumination',
    },
    {
      alt: 'Modern apartment complex with warm wood cladding and balconies integrated into the facade',
    },
    {
      alt: 'Minimalist office workspace with natural wood finishes and abundant daylight through large windows',
    },
    {
      alt: 'Restored historic warehouse converted to residential lofts with preserved brickwork and modern interventions',
    },
    {
      alt: 'Elegant boutique hotel lobby with terrazzo floors and sculptural wooden reception desk',
    },
  ]
  const cols = (props.cols as number) ?? 4
  const chrome = (props.chrome as ChromeVariant) ?? 'editorial'
  const index = props.index as string | undefined

  // Chrome-driven: editorial/brutalist with image-zoom hover
  if (chrome === 'editorial' || chrome === 'brutalist') {
    return (
      <P.Section
        className={cn(
          'relative overflow-hidden',
          chrome === 'brutalist' && 'border-b-2 border-foreground bg-muted/40',
        )}
      >
        <Container size="xl" className="relative py-20">
          {index && <SectionEyebrow index={index} chrome={chrome} />}
          {heading && (
            <h2
              className={cn(
                'mb-12 text-3xl font-bold tracking-tight sm:text-4xl',
                chromeHeadingClass(chrome),
              )}
            >
              {heading}
            </h2>
          )}
          <div
            className={cn(
              'grid gap-4 sm:gap-6',
              cols === 2
                ? 'grid-cols-2'
                : cols === 3
                  ? 'grid-cols-2 md:grid-cols-3'
                  : 'grid-cols-2 md:grid-cols-4',
            )}
          >
            {images.map((img, i) => (
              <div
                key={i}
                className={cn(
                  'group relative overflow-hidden',
                  chrome === 'brutalist' &&
                    'border-2 border-foreground shadow-[6px_6px_0_0] shadow-foreground',
                  chrome === 'editorial' && 'border border-border bg-card',
                )}
              >
                <ImageZoomHover
                  alt={img.alt}
                  src={img.src}
                  aspectClass="aspect-square"
                  overlayLabel={chrome === 'editorial' ? 'View' : undefined}
                />
                {chrome === 'editorial' && (
                  <ImageCaptionBar
                    caption={img.alt}
                    figure={`fig. ${String(i + 1).padStart(2, '0')}`}
                  />
                )}
              </div>
            ))}
          </div>
        </Container>
      </P.Section>
    )
  }

  return (
    <P.Section>
      <P.Container size="xl" className="flex flex-col gap-12">
        {heading && <P.Heading level="h2" text={heading} />}
        <P.Grid cols={cols}>
          {images.map((img, i) => (
            <P.ImageBlock key={i} alt={img.alt} src={img.src} />
          ))}
        </P.Grid>
      </P.Container>
    </P.Section>
  )
}

// ─── 8. logoStrip ────────────────────────────────────────────────────────
// Horizontal strip of logos / social proof.

export const LogoStrip = defineCapsule({
  name: 'LogoStrip',
  description:
    'Logo strip: horizontal row of brand names or logos for social proof. Optional heading.',
  props: z.object({
    heading: z.string().optional(),
    logos: z.array(z.string()).optional(),
    className: z.string().optional(),
    design: z.string().optional(),
  }),
  component: ({ props }) => {
    const intent = props.design
      ? parseDesignFromString(props.design)
      : DEFAULT_DESIGN
    return withDesign(intent, <LogoStripInner {...props} />)
  },
})

function LogoStripInner(props: Record<string, unknown>) {
  const heading = (props.heading as string) ?? 'Trusted by'
  const logos = (props.logos as string[]) ?? [
    'Brand One',
    'Brand Two',
    'Brand Three',
    'Brand Four',
  ]
  return (
    <P.Section className="border-y border-border">
      <P.Container size="xl" className="flex flex-col items-center gap-6">
        <P.Heading level="eyebrow" text={heading} />
        <LogoMarquee items={logos} />
      </P.Container>
    </P.Section>
  )
}

// ─── 9. testimonialRow ───────────────────────────────────────────────────
// Grid of testimonial cards with quote + author.

export const TestimonialRow = defineCapsule({
  name: 'TestimonialRow',
  description:
    'Testimonial row: grid of quote cards with author name and optional role. Chrome: hairline (collapsed-border + mono indices), brutalist (border-2 + hard shadows + rotated stickers).',
  props: z.object({
    heading: z.string().optional(),
    testimonials: z
      .array(
        z.object({
          quote: z.string(),
          author: z.string(),
          role: z.string().optional(),
        }),
      )
      .optional(),
    cols: z.number().optional(),
    chrome: z
      .enum(['none', 'hairline', 'brutalist', 'terminal', 'editorial'])
      .optional(),
    index: z.string().optional(),
    className: z.string().optional(),
    design: z.string().optional(),
  }),
  component: ({ props }) => {
    const intent = props.design
      ? parseDesignFromString(props.design)
      : DEFAULT_DESIGN
    return withDesign(intent, <TestimonialRowInner {...props} />)
  },
})

function TestimonialRowInner(props: Record<string, unknown>) {
  const heading = (props.heading as string) ?? 'What people say'
  const testimonials = (props.testimonials as Array<{
    quote: string
    author: string
    role?: string
  }>) ?? [
    {
      quote:
        'This transformed our brief into something beyond what we imagined. They understood not just what we asked for, but how we actually work. The light in our office changes beautifully throughout the day.',
      author: 'Elena Rasmussen',
      role: 'Homeowner, Villa Kyst',
    },
    {
      quote:
        'Working with this team was exceptional. Their attention to detail and craft created a space where people genuinely want to be. Productivity increased 23% after the move.',
      author: 'Magnus Lindström',
      role: 'CEO, Fjord Technologies',
    },
    {
      quote:
        "The adaptive reuse of our warehouse exceeded every expectation. They preserved the building's soul while making it perfectly functional for modern living.",
      author: 'Johan Petersen',
      role: 'Developer, Pakhus 47',
    },
  ]
  const cols = (props.cols as number) ?? 3
  const chrome = (props.chrome as ChromeVariant) ?? 'editorial'
  const index = props.index as string | undefined
  const columns = cols === 2 ? 2 : 3

  // ── Editorial: ArchitectureFirmTestimonials-style — hairline cards, ghost quote, grayscale portraits ──
  if (chrome === 'editorial') {
    return (
      <P.Section className="relative overflow-hidden bg-card py-16 sm:py-24 lg:py-28">
        {/* Giant ghost serif quotation mark */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 right-0 select-none font-serif text-[14rem] leading-none text-foreground/[0.04] sm:text-[20rem] lg:-top-24 lg:text-[26rem]"
        >
          &rdquo;
        </span>
        <Container className="relative">
          <EditorialSectionHeader
            index="04 /"
            eyebrow="Client Words"
            heading={heading}
            metaLabel="Transcripts"
            meta={String(testimonials.length).padStart(2, '0')}
          />
          <div
            className={cn(
              'grid gap-6 [&>*]:gap-6 lg:[&>*]:gap-8',
              columns === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3',
            )}
          >
            {testimonials.map((t, i) => (
              <div
                key={i}
                className={cn(
                  'group flex flex-col gap-6 rounded-none border border-border bg-background p-6 transition-colors duration-200 hover:border-foreground/40 sm:p-8',
                  i % 3 === 1 && 'lg:translate-y-10',
                )}
              >
                <MonoTag className="text-foreground">
                  Client {String(i + 1).padStart(2, '0')}
                </MonoTag>
                <p className="flex-1 text-base font-light leading-relaxed text-foreground">
                  {t.quote}
                </p>
                <div className="border-t border-border pt-5">
                  <div className="flex items-center gap-3">
                    <P.ImageBlock
                      alt={`${t.author} portrait`}
                      src={undefined}
                      className="size-10 shrink-0 border border-border object-cover grayscale transition-[filter] duration-500 group-hover:grayscale-0"
                    />
                    <span className="flex flex-col gap-1">
                      <span className="font-normal text-foreground">
                        {t.author}
                      </span>
                      {t.role && (
                        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                          {t.role}
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </P.Section>
    )
  }

  // Chrome-driven: collapsed-border or brutalist cards with mono indices
  if (
    chrome === 'hairline' ||
    chrome === 'terminal' ||
    chrome === 'brutalist'
  ) {
    return (
      <P.Section
        className={cn(
          'relative overflow-hidden',
          chrome === 'brutalist' && 'border-b-2 border-foreground bg-muted/40',
        )}
      >
        <Container size="xl" className="relative py-20">
          <div className="mb-12 flex flex-col gap-6 border-b border-border pb-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <SectionEyebrow index={index} chrome={chrome} />
              <h2
                className={cn(
                  'text-3xl font-extrabold tracking-tight sm:text-4xl',
                  chromeHeadingClass(chrome),
                )}
              >
                {heading}
              </h2>
            </div>
            <span
              aria-hidden="true"
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60 tabular-nums"
            >
              [ {String(testimonials.length).padStart(2, '0')} quotes ]
            </span>
          </div>
          <TestimonialGrid
            columns={columns as 2 | 3}
            className={chromeGridClass(chrome)}
          >
            {testimonials.map((t, i) => (
              <TestimonialCard
                key={i}
                className={cn('p-7 sm:p-8', chromeBorderClass(chrome))}
              >
                <CardIndex index={i + 1} chrome={chrome} />
                <TestimonialQuote className="mt-4">{t.quote}</TestimonialQuote>
                <TestimonialAuthor className="mt-6">
                  <TestimonialName>{t.author}</TestimonialName>
                  {t.role && <TestimonialMeta>{t.role}</TestimonialMeta>}
                </TestimonialAuthor>
              </TestimonialCard>
            ))}
          </TestimonialGrid>
        </Container>
      </P.Section>
    )
  }

  return (
    <P.Section>
      <Container size="xl" className="py-20">
        <TestimonialGrid heading={heading} columns={columns as 2 | 3}>
          {testimonials.map((t, i) => (
            <TestimonialCard key={i}>
              <TestimonialQuote>{t.quote}</TestimonialQuote>
              <TestimonialAuthor>
                <TestimonialName>{t.author}</TestimonialName>
                {t.role && <TestimonialMeta>{t.role}</TestimonialMeta>}
              </TestimonialAuthor>
            </TestimonialCard>
          ))}
        </TestimonialGrid>
      </Container>
    </P.Section>
  )
}

// ─── 10. personGrid ──────────────────────────────────────────────────────
// Grid of person cards with photo + name + role.

export const PersonGrid = defineCapsule({
  name: 'PersonGrid',
  description:
    'Person grid: cards with photo, name, and role. For team, attorneys, chefs, etc.',
  props: z.object({
    heading: z.string().optional(),
    people: z
      .array(
        z.object({
          name: z.string(),
          role: z.string().optional(),
          imageAlt: z.string().optional(),
          imageSrc: z.string().optional(),
        }),
      )
      .optional(),
    cols: z.number().optional(),
    chrome: z
      .enum(['none', 'hairline', 'brutalist', 'terminal', 'editorial'])
      .optional(),
    className: z.string().optional(),
    design: z.string().optional(),
  }),
  component: ({ props }) => {
    const intent = props.design
      ? parseDesignFromString(props.design)
      : DEFAULT_DESIGN
    return withDesign(intent, <PersonGridInner {...props} />)
  },
})

function PersonGridInner(props: Record<string, unknown>) {
  const heading = (props.heading as string) ?? 'Our team'
  const people = (props.people as Array<{
    name: string
    role?: string
    imageAlt?: string
    imageSrc?: string
  }>) ?? [
    {
      name: 'Solvej Madsen',
      role: 'Founding Partner',
      imageAlt:
        'Professional headshot of a smiling woman with shoulder-length brown hair in a minimalist studio',
    },
    {
      name: 'Erik Bjørnsson',
      role: 'Founding Partner',
      imageAlt:
        'Professional headshot of a man with short dark hair and a navy blazer in a minimalist studio',
    },
    {
      name: 'Ingrid Voll',
      role: 'Senior Architect',
      imageAlt:
        'Professional headshot of a woman with glasses and blonde hair wearing a dark sweater',
    },
  ]
  const cols = (props.cols as number) ?? 3
  const chrome = (props.chrome as ChromeVariant) ?? 'none'

  // Editorial: asymmetric ledger — first person featured large, rest in
  // smaller cells. Grayscale portraits with hover color reveal, ghost
  // numerals, mono labels, hairline borders, oversized watermark.
  if (chrome === 'editorial') {
    const [first, ...rest] = people
    return (
      <P.Section className="relative overflow-hidden">
        <GraphPaper className="inset-0" />
        {/* Oversized watermark behind the grid */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-8 right-0 select-none font-serif text-[8rem] font-extralight leading-none text-foreground/[0.04] sm:text-[12rem] lg:text-[18rem]"
        >
          {heading.slice(0, 1).toUpperCase()}
        </span>
        <P.Container size="xl" className="relative">
          <EditorialSectionHeader
            metaLabel="Team"
            heading={heading}
            description=""
          />
          {/* Featured person — large 2-col cell with 4:5 portrait */}
          {first && (
            <div className="mb-px border-l border-t border-border">
              <div className="grid grid-cols-1 border-r border-b border-border md:grid-cols-2">
                <div className="relative overflow-hidden border-b border-border md:border-b-0 md:border-r">
                  <P.ImageBlock
                    alt={first.imageAlt ?? first.name}
                    src={first.imageSrc}
                    className="aspect-[4/5] w-full object-cover grayscale transition-all duration-500 hover:grayscale-0"
                  />
                  {/* Figure caption bar */}
                  <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between border-t border-background/20 bg-background/80 px-4 py-2 backdrop-blur-sm">
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/70">
                      {first.name}
                    </span>
                    <span className="font-mono text-[10px] text-foreground/40">
                      fig. 01
                    </span>
                  </div>
                </div>
                <div className="relative flex flex-col justify-end p-8 lg:p-12">
                  {/* Ghost numeral */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute right-6 top-6 font-extralight text-7xl leading-none text-foreground/[0.06]"
                  >
                    01
                  </span>
                  <span className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    Principal
                  </span>
                  <h3 className="text-3xl font-light tracking-tight text-foreground lg:text-4xl">
                    {first.name}
                  </h3>
                  {first.role && (
                    <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                      {first.role}
                    </p>
                  )}
                  <div className="mt-6 h-px w-16 bg-border" />
                </div>
              </div>
            </div>
          )}
          {/* Rest of team — smaller hairline cells */}
          {rest.length > 0 && (
            <div className="grid grid-cols-1 border-l border-r border-b border-border sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((p, i) => (
                <div
                  key={i}
                  className="group relative border-b border-border p-6 last:border-b-0 sm:border-b sm:[&:nth-last-child(-n+2)]:border-b-0 sm:[&:nth-child(odd)]:border-r lg:[&:nth-child(odd)]:border-r-0 lg:[&:nth-child(3n+1)]:border-r lg:[&:nth-child(3n)]:border-r-0"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                      {String(i + 2).padStart(2, '0')}
                    </span>
                    <span
                      aria-hidden="true"
                      className="font-extralight text-2xl text-foreground/[0.06]"
                    >
                      {String(i + 2).padStart(2, '0')}
                    </span>
                  </div>
                  <div className="relative mb-4 overflow-hidden">
                    <P.ImageBlock
                      alt={p.imageAlt ?? p.name}
                      src={p.imageSrc}
                      className="aspect-square w-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0"
                    />
                  </div>
                  <h3 className="text-lg font-light tracking-tight text-foreground">
                    {p.name}
                  </h3>
                  {p.role && (
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                      {p.role}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </P.Container>
      </P.Section>
    )
  }

  // Default: asymmetric layout with featured first person
  const [first, ...rest] = people
  return (
    <P.Section>
      <P.Container size="xl" className="flex flex-col gap-10">
        <P.Heading level="h2" text={heading} />
        {first && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="relative overflow-hidden rounded-lg">
              <P.ImageBlock
                alt={first.imageAlt ?? first.name}
                src={first.imageSrc}
                className="aspect-[4/5] w-full object-cover"
              />
            </div>
            <div className="flex flex-col justify-end pb-4">
              <span className="mb-3 text-sm font-medium uppercase tracking-wider text-primary">
                {first.role}
              </span>
              <h3 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {first.name}
              </h3>
            </div>
          </div>
        )}
        {rest.length > 0 && (
          <div
            className={cn(
              'grid gap-6',
              cols === 2
                ? 'grid-cols-1 sm:grid-cols-2'
                : cols === 4
                  ? 'grid-cols-2 sm:grid-cols-4'
                  : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
            )}
          >
            {rest.map((p, i) => (
              <P.Card
                key={i}
                title={p.name}
                imageAlt={p.imageAlt ?? p.name}
                imageUrl={p.imageSrc}
              >
                {p.role && (
                  <p className="mt-1 text-sm text-muted-foreground">{p.role}</p>
                )}
              </P.Card>
            ))}
          </div>
        )}
      </P.Container>
    </P.Section>
  )
}

// ─── 11. pricingTable ────────────────────────────────────────────────────
// Tiered pricing cards.

export const PricingTable = defineCapsule({
  name: 'PricingTable',
  description:
    'Pricing table: tiered pricing cards with name, price, features list, and CTA. Chrome: hairline (collapsed-border comparison strip), brutalist (border-2 + hard shadows + rotated sticker), terminal (mono $ labels + inverted highlighted tier).',
  props: z.object({
    heading: z.string().optional(),
    subheading: z.string().optional(),
    tiers: z
      .array(
        z.object({
          name: z.string(),
          price: z.string(),
          features: z.array(z.string()),
          cta: z.string().optional(),
          highlighted: z.boolean().optional(),
        }),
      )
      .optional(),
    chrome: z
      .enum(['none', 'hairline', 'brutalist', 'terminal', 'editorial'])
      .optional(),
    index: z.string().optional(),
    watermark: z.string().optional(),
    className: z.string().optional(),
    design: z.string().optional(),
  }),
  component: ({ props }) => {
    const intent = props.design
      ? parseDesignFromString(props.design)
      : DEFAULT_DESIGN
    return withDesign(intent, <PricingTableInner {...props} />)
  },
})

function PricingTableInner(props: Record<string, unknown>) {
  const heading = (props.heading as string) ?? 'Pricing'
  const subheading = props.subheading as string | undefined
  const tiers = (props.tiers as Array<{
    name: string
    price: string
    features: string[]
    cta?: string
    highlighted?: boolean
  }>) ?? [
    {
      name: 'Starter',
      price: '$0',
      features: ['1 project', 'Basic support'],
      cta: 'Get started',
    },
    {
      name: 'Pro',
      price: '$29',
      features: ['Unlimited projects', 'Priority support', 'Analytics'],
      cta: 'Start trial',
      highlighted: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      features: ['Everything in Pro', 'SSO', 'SLA'],
      cta: 'Contact us',
    },
  ]
  const chrome = (props.chrome as ChromeVariant) ?? 'none'
  const index = props.index as string | undefined
  const watermark = props.watermark as string | undefined
  // Split price into amount and period (e.g. "$12/user/mo" → "$12", "/user/mo")
  function splitPrice(price: string): { amount: string; period: string } {
    const match = price.match(/^(\$\d+(?:\.\d+)?)(.*)$/)
    if (match) return { amount: match[1], period: match[2] || '' }
    return { amount: price, period: '' }
  }

  // Chrome-driven: hairline/terminal uses collapsed-border with inverted highlighted tier
  if (
    chrome === 'hairline' ||
    chrome === 'terminal' ||
    chrome === 'brutalist'
  ) {
    return (
      <P.Section
        className={cn(
          'relative overflow-hidden',
          chrome === 'brutalist' && 'bg-muted/40',
        )}
      >
        <WatermarkDecor watermark={watermark} />
        <Container size="xl" className="relative py-20">
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <SectionEyebrow index={index} chrome={chrome} />
              <h2
                className={cn(
                  'text-3xl font-extrabold tracking-tight sm:text-4xl',
                  chromeHeadingClass(chrome),
                )}
              >
                {heading}
              </h2>
              {subheading && (
                <p className="mt-4 text-lg text-muted-foreground">
                  {subheading}
                </p>
              )}
            </div>
            {chrome === 'terminal' && (
              <span
                aria-hidden="true"
                className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60"
              >
                $ plans --list
              </span>
            )}
          </div>
          <PricingGrid
            className={cn(
              chrome === 'hairline' || chrome === 'terminal'
                ? 'gap-0 border-l border-t border-border sm:gap-0'
                : 'gap-4',
            )}
          >
            {tiers.map((tier, i) => {
              const { amount, period } = splitPrice(tier.price)
              const highlighted = tier.highlighted
              return (
                <PricingTier
                  key={i}
                  variant={highlighted ? 'highlighted' : 'default'}
                  className={cn(
                    chrome === 'hairline' || chrome === 'terminal'
                      ? cn(
                          'rounded-none border-0 border-b border-r border-border shadow-none',
                          highlighted && 'bg-foreground text-background ring-0',
                        )
                      : chrome === 'brutalist'
                        ? cn(
                            'rounded-none border-2 border-foreground',
                            highlighted &&
                              'shadow-[8px_8px_0_0] shadow-foreground',
                          )
                        : '',
                  )}
                >
                  {highlighted && (
                    <RotatedSticker
                      rotate="rotate-3"
                      className={
                        chrome === 'hairline' || chrome === 'terminal'
                          ? 'bg-primary shadow-background/30'
                          : 'shadow-foreground/30'
                      }
                    >
                      {chrome === 'terminal' ? 'POPULAR' : 'Most popular'}
                    </RotatedSticker>
                  )}
                  {(chrome === 'hairline' || chrome === 'terminal') && (
                    <span
                      className={cn(
                        'font-mono text-[11px] uppercase tracking-[0.2em]',
                        highlighted
                          ? 'text-background/50'
                          : 'text-muted-foreground',
                      )}
                    >
                      {String(i + 1).padStart(2, '0')} / {tier.name}
                    </span>
                  )}
                  <PricingTierHeader>
                    <PricingTierName>{tier.name}</PricingTierName>
                    <div className="flex items-baseline gap-1">
                      <PricingTierPrice className="tabular-nums">
                        {amount}
                      </PricingTierPrice>
                      {period && (
                        <PricingTierPeriod>{period}</PricingTierPeriod>
                      )}
                    </div>
                  </PricingTierHeader>
                  <PricingTierFeatures>
                    {tier.features.map((f, fi) => (
                      <PricingTierFeature
                        key={fi}
                        className={
                          chrome === 'terminal' ? 'font-mono text-sm' : ''
                        }
                      >
                        {chrome === 'terminal' && (
                          <span className="text-primary">+ </span>
                        )}
                        {f}
                      </PricingTierFeature>
                    ))}
                  </PricingTierFeatures>
                  {tier.cta && (
                    <PricingTierCta
                      className={cn(
                        highlighted
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                          : chrome === 'brutalist'
                            ? 'border-2 border-foreground bg-background text-foreground hover:bg-muted'
                            : 'border border-border bg-background text-foreground hover:bg-muted',
                        chrome === 'hairline' || chrome === 'terminal'
                          ? 'rounded-none'
                          : '',
                      )}
                    >
                      {tier.cta}
                    </PricingTierCta>
                  )}
                </PricingTier>
              )
            })}
          </PricingGrid>
        </Container>
      </P.Section>
    )
  }

  return (
    <P.Section>
      <P.Container size="xl" className="flex flex-col gap-12">
        <P.Heading level="h2" text={heading} />
        <PricingGrid>
          {tiers.map((tier, i) => {
            const { amount, period } = splitPrice(tier.price)
            return (
              <PricingTier
                key={i}
                variant={tier.highlighted ? 'highlighted' : 'default'}
              >
                {tier.highlighted && (
                  <PricingTierBadge>Most popular</PricingTierBadge>
                )}
                <PricingTierHeader>
                  <PricingTierName>{tier.name}</PricingTierName>
                  <div className="flex items-baseline gap-1">
                    <PricingTierPrice>{amount}</PricingTierPrice>
                    {period && <PricingTierPeriod>{period}</PricingTierPeriod>}
                  </div>
                </PricingTierHeader>
                <PricingTierFeatures>
                  {tier.features.map((f, fi) => (
                    <PricingTierFeature key={fi}>{f}</PricingTierFeature>
                  ))}
                </PricingTierFeatures>
                {tier.cta && (
                  <PricingTierCta
                    className={
                      tier.highlighted
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'border border-border bg-background text-foreground hover:bg-muted'
                    }
                  >
                    {tier.cta}
                  </PricingTierCta>
                )}
              </PricingTier>
            )
          })}
        </PricingGrid>
      </P.Container>
    </P.Section>
  )
}

// ─── 12. statsStrip ──────────────────────────────────────────────────────
// Collapsed-border KPI cells.

export const StatsStrip = defineCapsule({
  name: 'StatsStrip',
  description:
    'Stats strip: KPI cells with large numerals and mono labels. Chrome: hairline (collapsed-border + tick bars), brutalist (inverted dark band + slanted seam), terminal (mono $ labels + spark bars).',
  props: z.object({
    heading: z.string().optional(),
    stats: z
      .array(
        z.object({
          value: z.string(),
          label: z.string(),
          sparkBars: z.array(z.number()).optional(),
        }),
      )
      .optional(),
    cols: z.number().optional(),
    chrome: z
      .enum([
        'none',
        'hairline',
        'brutalist',
        'terminal',
        'editorial',
        'gradient',
      ])
      .optional(),
    index: z.string().optional(),
    watermark: z.string().optional(),
    decor: z.enum(['none', 'dot-grid', 'graph-paper', 'glow']).optional(),
    className: z.string().optional(),
    design: z.string().optional(),
  }),
  component: ({ props }) => {
    const intent = props.design
      ? parseDesignFromString(props.design)
      : DEFAULT_DESIGN
    return withDesign(intent, <StatsStripInner {...props} />)
  },
})

function StatsStripInner(props: Record<string, unknown>) {
  const heading = props.heading as string | undefined
  const stats = (props.stats as Array<{
    value: string
    label: string
    sparkBars?: number[]
  }>) ?? [
    { value: '15K+', label: 'Active teams' },
    { value: '99%', label: 'Uptime' },
    { value: '50ms', label: 'Latency' },
    { value: '2B+', label: 'Requests/day' },
  ]
  const cols = (props.cols as number) ?? 4
  const chrome = (props.chrome as ChromeVariant) ?? 'editorial'
  const index = props.index as string | undefined
  const watermark = props.watermark as string | undefined
  const decor = (props.decor as DecorVariant) ?? 'none'
  const columns = cols === 2 ? 2 : cols === 3 ? 3 : 4

  // Brutalist: inverted dark band with slanted seam + watermark
  if (chrome === 'brutalist') {
    return (
      <P.Section
        className={cn(
          'relative overflow-hidden bg-foreground text-background',
          slantedSeamClass('top'),
        )}
      >
        <WatermarkDecor
          watermark={watermark ?? '*'}
          className="-bottom-16 -left-8 -rotate-12 text-[14rem] text-background/[0.05]"
        />
        <Container size="xl" className="relative py-20">
          {index && (
            <SectionEyebrow
              index={index}
              chrome={chrome}
              className="text-background/50"
            />
          )}
          {heading && (
            <h2
              className={cn(
                'mb-12 text-4xl font-black uppercase leading-[0.95] tracking-tighter text-background sm:text-5xl',
                chromeHeadingClass(chrome),
              )}
            >
              {heading}
            </h2>
          )}
          <StatGrid
            columns={columns as 2 | 3 | 4}
            className="grid-cols-2 gap-0 border-2 border-background/30 lg:grid-cols-4"
          >
            {stats.map((s, i) => (
              <StatItem
                key={i}
                align="left"
                className="gap-2 border-background/30 p-5 sm:p-7"
              >
                <StatValue size="large" className="text-background">
                  {s.value}
                </StatValue>
                <StatLabel className="text-background/70">{s.label}</StatLabel>
                <TickBar index={i} className="pt-3" />
              </StatItem>
            ))}
          </StatGrid>
        </Container>
      </P.Section>
    )
  }

  // Hairline/terminal: collapsed-border KPI with tick bars / spark bars
  if (chrome === 'hairline' || chrome === 'terminal') {
    return (
      <P.Section
        className={cn(
          'relative overflow-hidden border-y border-border py-16',
          decor !== 'none' && 'relative',
        )}
      >
        {decor !== 'none' && <DecorBackground decor={decor} />}
        <Container size="xl" className="relative flex flex-col gap-8">
          {index && <SectionEyebrow index={index} chrome={chrome} />}
          {heading && <SectionHeading title={heading} align="left" />}
          <div
            className={cn(
              'grid border-l border-t border-border',
              columns === 2 && 'grid-cols-2',
              columns === 3 && 'grid-cols-3',
              columns === 4 && 'grid-cols-2 sm:grid-cols-4',
            )}
          >
            {stats.map((s, i) => (
              <div
                key={i}
                className="border-b border-r border-border p-5 sm:p-6"
              >
                <dt className="text-2xl font-bold tabular-nums tracking-tight text-foreground sm:text-3xl">
                  {s.value}
                </dt>
                <dd className="mt-1.5">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    {s.label}
                  </span>
                </dd>
                {chrome === 'terminal' ? (
                  <SparkBars className="mt-3" />
                ) : (
                  <TickBar index={i} className="mt-3" />
                )}
              </div>
            ))}
          </div>
        </Container>
      </P.Section>
    )
  }

  // Editorial: ArchitectureFirmStats-style — inverted ink band, clip-path seam, inverted graph paper, measurement ticks
  if (chrome === 'editorial') {
    return (
      <P.Section
        className={cn(
          'relative overflow-hidden bg-foreground py-14 pt-20 text-background [clip-path:polygon(0_3rem,100%_0,100%_100%,0_100%)] sm:py-20 sm:pt-28 lg:py-24 lg:pt-32',
        )}
      >
        <GraphPaper className="inset-0 text-background/[0.07]" />
        <Container className="relative">
          {/* Mono annotation rail */}
          <div
            aria-hidden="true"
            className="mb-10 flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.2em] text-background/50"
          >
            <span className="shrink-0 text-background/80">Site data</span>
            <span className="shrink-0">/ Survey</span>
            <span className="h-px flex-1 bg-background/20" />
            <span className="hidden shrink-0 sm:inline">Sheet 04</span>
          </div>
          {heading && (
            <h2 className="mb-10 text-3xl font-extralight tracking-tight text-background sm:text-4xl lg:text-5xl">
              {heading}
            </h2>
          )}
          <div
            className={cn(
              'grid grid-cols-2 gap-0 border-l border-t border-background/20 lg:grid-cols-4',
              columns === 2 && 'lg:grid-cols-2',
              columns === 3 && 'lg:grid-cols-3',
            )}
          >
            {stats.map((s, i) => (
              <div
                key={i}
                className="flex flex-col gap-3 border-b border-r border-background/20 p-5 sm:p-8"
              >
                <dt className="text-[clamp(2.75rem,6vw,5.5rem)] font-extralight leading-none tracking-tight tabular-nums text-background">
                  {s.value}
                </dt>
                <dd>
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-background/60 sm:text-[11px]">
                    {s.label}
                  </span>
                </dd>
                {/* Measurement tick motif */}
                <span aria-hidden="true" className="mt-1 flex items-end gap-1">
                  <span className="h-3 w-px bg-background/60" />
                  <span className="h-1.5 w-px bg-background/30" />
                  <span className="h-1.5 w-px bg-background/30" />
                  <span className="h-1.5 w-px bg-background/30" />
                  <span
                    className={cn(
                      'h-3 w-px bg-background/60',
                      i % 2 === 1 && 'bg-primary',
                    )}
                  />
                </span>
              </div>
            ))}
          </div>
        </Container>
      </P.Section>
    )
  }

  return (
    <P.Section className="border-y border-border py-16">
      <Container size="xl" className="flex flex-col gap-8">
        {heading && <SectionHeading title={heading} align="center" />}
        <StatGrid columns={columns as 2 | 3 | 4}>
          {stats.map((s, i) => (
            <StatItem key={i} accentBorder={i < stats.length - 1}>
              <StatValue size="large">{s.value}</StatValue>
              <StatLabel>{s.label}</StatLabel>
            </StatItem>
          ))}
        </StatGrid>
      </Container>
    </P.Section>
  )
}

// ─── 13. featureList ─────────────────────────────────────────────────────
// Alternating left/right feature rows with image.

export const FeatureList = defineCapsule({
  name: 'FeatureList',
  description:
    'Feature list: alternating left/right rows with image on one side and heading + text on the other. Chrome: editorial (serif + watermark + image caption bars + figure indices), hairline (collapsed-border + mono indices).',
  props: z.object({
    features: z
      .array(
        z.object({
          heading: z.string(),
          description: z.string(),
          imageAlt: z.string().optional(),
          imageSrc: z.string().optional(),
        }),
      )
      .optional(),
    chrome: z
      .enum(['none', 'hairline', 'brutalist', 'terminal', 'editorial'])
      .optional(),
    index: z.string().optional(),
    watermark: z.string().optional(),
    className: z.string().optional(),
    design: z.string().optional(),
  }),
  component: ({ props }) => {
    const intent = props.design
      ? parseDesignFromString(props.design)
      : DEFAULT_DESIGN
    return withDesign(intent, <FeatureListInner {...props} />)
  },
})

function FeatureListInner(props: Record<string, unknown>) {
  const features = (props.features as Array<{
    heading: string
    description: string
    imageAlt?: string
    imageSrc?: string
  }>) ?? [
    {
      heading: 'Contextual Sensitivity',
      description:
        'Every site tells a story. We listen to the landscape and the existing built environment before drawing a single line.',
      imageAlt:
        'Architectural model on work table showing building massing study with natural lighting',
    },
    {
      heading: 'Daylight & Material',
      description:
        'Natural light is our primary material. We choreograph how daylight moves through spaces across seasons.',
      imageAlt:
        'Minimalist interior with dramatic natural daylight streaming through large windows onto warm wood surfaces',
    },
  ]
  const chrome = (props.chrome as ChromeVariant) ?? 'editorial'
  const index = props.index as string | undefined
  const watermark = props.watermark as string | undefined

  // Chrome-driven: editorial (serif + watermark + image caption bars + figure indices)
  if (
    chrome === 'editorial' ||
    chrome === 'hairline' ||
    chrome === 'brutalist'
  ) {
    return (
      <P.Section
        className={cn(
          'relative overflow-hidden',
          chrome === 'brutalist' && 'border-b-2 border-foreground bg-muted/40',
        )}
      >
        {chrome === 'editorial' && <WatermarkDecor watermark={watermark} />}
        <Container size="xl" className="relative flex flex-col gap-20 py-20">
          {index && <SectionEyebrow index={index} chrome={chrome} />}
          {features.map((f, i) => {
            const reversed = i % 2 === 1
            const figure = `fig. ${String(i + 1).padStart(2, '0')}`
            return (
              <div
                key={i}
                className={cn(
                  'grid gap-10 lg:grid-cols-2 lg:items-center',
                  reversed && 'lg:[direction:rtl]',
                )}
              >
                <div
                  className={cn(
                    'flex flex-col gap-4',
                    reversed && 'lg:[direction:ltr]',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
                  >
                    {String(i + 1).padStart(2, '0')}{' '}
                    <span className="text-primary">/</span> {features.length}
                  </span>
                  <h2
                    className={cn(
                      'text-3xl font-bold tracking-tight sm:text-4xl',
                      chromeHeadingClass(chrome),
                    )}
                  >
                    {f.heading}
                  </h2>
                  <p className="text-lg leading-relaxed text-muted-foreground">
                    {f.description}
                  </p>
                </div>
                <div className={cn(reversed && 'lg:[direction:ltr]')}>
                  <div
                    className={cn(
                      'overflow-hidden',
                      chrome === 'editorial' && 'border border-border bg-card',
                      chrome === 'hairline' && 'border border-border',
                      chrome === 'brutalist' &&
                        'border-2 border-foreground shadow-[8px_8px_0_0] shadow-foreground',
                    )}
                  >
                    <P.ImageBlock
                      alt={f.imageAlt ?? f.heading}
                      src={f.imageSrc}
                      className="block aspect-[4/3] w-full object-cover"
                    />
                    <ImageCaptionBar
                      caption={f.imageAlt ?? f.heading}
                      figure={figure}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </Container>
      </P.Section>
    )
  }

  return (
    <P.Section>
      <P.Container size="xl" className="flex flex-col gap-20">
        {features.map((f, i) => {
          const reversed = i % 2 === 1
          return (
            <div
              key={i}
              className={cn(
                'grid gap-10 lg:grid-cols-2 lg:items-center',
                reversed && 'lg:[direction:rtl]',
              )}
            >
              <div
                className={cn(
                  'flex flex-col gap-4',
                  reversed && 'lg:[direction:ltr]',
                )}
              >
                <P.Heading level="h2" text={f.heading} />
                <P.Text variant="body" text={f.description} />
              </div>
              <div className={cn(reversed && 'lg:[direction:ltr]')}>
                <P.ImageBlock alt={f.imageAlt ?? f.heading} src={f.imageSrc} />
              </div>
            </div>
          )
        })}
      </P.Container>
    </P.Section>
  )
}

// ─── 14. groupedList ─────────────────────────────────────────────────────
// Categorized list with group headers (menu, services, etc.).

export const GroupedList = defineCapsule({
  name: 'GroupedList',
  description:
    'Grouped list: categorized items with group headers. Each item has title, optional description, optional price. For menus, service lists, etc.',
  props: z.object({
    heading: z.string().optional(),
    subheading: z.string().optional(),
    groups: z
      .array(
        z.object({
          name: z.string(),
          items: z.array(
            z.object({
              title: z.string(),
              description: z.string().optional(),
              price: z.string().optional(),
            }),
          ),
        }),
      )
      .optional(),
    className: z.string().optional(),
    design: z.string().optional(),
  }),
  component: ({ props }) => {
    const intent = props.design
      ? parseDesignFromString(props.design)
      : DEFAULT_DESIGN
    return withDesign(intent, <GroupedListInner {...props} />)
  },
})

function GroupedListInner(props: Record<string, unknown>) {
  const heading = (props.heading as string) ?? 'Our offerings'
  const subheading = props.subheading as string | undefined
  const groups = (props.groups as Array<{
    name: string
    items: Array<{ title: string; description?: string; price?: string }>
  }>) ?? [
    {
      name: 'Hot',
      items: [
        {
          title: 'Signature Espresso',
          description: 'Single-origin, hand-pulled.',
          price: '$4.50',
        },
        {
          title: 'Flat White',
          description: 'Velvety microfoam, double ristretto.',
          price: '$5.00',
        },
      ],
    },
    {
      name: 'Cold',
      items: [
        {
          title: 'Cold Brew',
          description: 'Steeped 18 hours, smooth.',
          price: '$4.75',
        },
        {
          title: 'Iced Latte',
          description: 'Espresso over cold milk and ice.',
          price: '$5.25',
        },
      ],
    },
  ]
  return (
    <P.Section>
      <P.Container size="md" className="flex flex-col gap-12">
        <div className="flex flex-col gap-4">
          <P.Heading level="h2" text={heading} />
          {subheading && <P.Text variant="lead" text={subheading} />}
        </div>
        <P.List variant="grouped" groups={groups} />
      </P.Container>
    </P.Section>
  )
}

// ─── 15. numberedList ────────────────────────────────────────────────────
// Numbered steps/process.

export const NumberedList = defineCapsule({
  name: 'NumberedList',
  description:
    'Numbered list: sequential steps with index, title, and description. Chrome: terminal (terminal window chrome + $ prompts + ghost numerals + exit 0), hairline (collapsed-border + mono indices), brutalist (border-2 + hard shadows).',
  props: z.object({
    heading: z.string().optional(),
    subheading: z.string().optional(),
    steps: z
      .array(
        z.object({
          title: z.string(),
          description: z.string().optional(),
        }),
      )
      .optional(),
    chrome: z
      .enum(['none', 'hairline', 'brutalist', 'terminal', 'editorial'])
      .optional(),
    index: z.string().optional(),
    className: z.string().optional(),
    design: z.string().optional(),
  }),
  component: ({ props }) => {
    const intent = props.design
      ? parseDesignFromString(props.design)
      : DEFAULT_DESIGN
    return withDesign(intent, <NumberedListInner {...props} />)
  },
})

function NumberedListInner(props: Record<string, unknown>) {
  const heading = (props.heading as string) ?? 'How it works'
  const subheading = props.subheading as string | undefined
  const steps = (props.steps as Array<{
    title: string
    description?: string
  }>) ?? [
    {
      title: 'Discovery & Strategy',
      description:
        "We begin with deep listening — understanding your needs, the site's constraints, and the broader context. This phase includes analysis, programming, and establishing project goals.",
    },
    {
      title: 'Design Development',
      description:
        'Through iterative exploration, we develop concepts into refined solutions. Physical models, detailed drawings, and material studies help us perfect every detail.',
    },
    {
      title: 'Realization',
      description:
        'We maintain involvement through construction, conducting site reviews and collaborating closely with builders to ensure the built work matches the design intent.',
    },
  ]
  const chrome = (props.chrome as ChromeVariant) ?? 'editorial'
  const index = props.index as string | undefined

  // ── Editorial: ArchitectureFirmProcess-style — collapsed-border hairline cells, ghost numerals, graph paper ──
  if (chrome === 'editorial') {
    return (
      <P.Section className="relative overflow-hidden py-16 sm:py-24 lg:py-28">
        <GraphPaper className="inset-y-0 right-0 w-1/2 [mask-image:linear-gradient(to_left,black,transparent)]" />
        <Container className="relative">
          <EditorialSectionHeader
            index="03 /"
            eyebrow="How We Work"
            heading={heading}
            metaLabel="Scale 1:100"
            meta="Rev. C"
          />
          {/* Full-width measurement dimension line above the phase cells. */}
          <span
            aria-hidden="true"
            className="mb-0 flex items-center gap-2 pb-8 text-border"
          >
            <span className="h-2.5 w-px bg-current" />
            <span className="h-px flex-1 bg-current" />
            <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              {String(steps.length).padStart(2, '0')} phases
            </span>
            <span className="h-px flex-1 bg-current" />
            <span className="h-2.5 w-px bg-current" />
          </span>
          <div className="grid grid-cols-1 gap-0 border-l border-t border-border sm:grid-cols-3">
            {steps.map((step, i) => (
              <div
                key={i}
                className="relative overflow-hidden border-b border-r border-border p-6 sm:p-8"
              >
                {/* Giant ghost ordinal */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-2 -top-6 select-none text-[6rem] font-extralight leading-none tracking-tighter text-foreground/[0.06] sm:text-[7rem]"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="relative">
                  <MonoTag className="text-foreground">
                    Phase {String(i + 1).padStart(2, '0')}
                  </MonoTag>
                  <h3 className="mb-3 mt-5 text-xl font-light tracking-tight text-foreground">
                    {step.title}
                  </h3>
                  {step.description && (
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </P.Section>
    )
  }

  // Terminal: sticky sidebar + terminal window with $ prompts + ghost numerals
  if (chrome === 'terminal') {
    return (
      <P.Section className="bg-muted/40 py-16 lg:py-24">
        <Container>
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-24">
                <SectionEyebrow
                  index={
                    index ??
                    `[ quickstart ] ${String(steps.length).padStart(2, '0')} steps`
                  }
                  chrome={chrome}
                />
                <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                  {heading}
                </h2>
                {subheading && (
                  <p className="mt-4 text-lg text-muted-foreground">
                    {subheading}
                  </p>
                )}
              </div>
            </div>
            <div className="lg:col-span-8">
              <TerminalChrome title="~/quickstart">
                <div className="divide-y divide-border">
                  {steps.map((step, i) => (
                    <div
                      key={i}
                      className="relative overflow-hidden p-6 sm:p-8"
                    >
                      <GhostNumeral
                        numeral={String(i + 1).padStart(2, '0')}
                        className="text-foreground/[0.06]"
                      />
                      <p
                        aria-hidden="true"
                        className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
                      >
                        <span className="text-primary">$ </span>
                        step {String(i + 1).padStart(2, '0')}
                      </p>
                      <h3 className="mt-3 font-mono text-lg font-bold tracking-tight text-foreground">
                        {step.title}
                      </h3>
                      {step.description && (
                        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                          {step.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </TerminalChrome>
            </div>
          </div>
        </Container>
      </P.Section>
    )
  }

  // Hairline: collapsed-border grid with mono indices
  if (chrome === 'hairline' || chrome === 'brutalist') {
    return (
      <P.Section className={cn(chrome === 'brutalist' && 'bg-muted/40')}>
        <Container size="xl" className="py-20">
          <SectionEyebrow index={index} chrome={chrome} />
          <h2
            className={cn(
              'text-3xl font-extrabold tracking-tight sm:text-4xl',
              chromeHeadingClass(chrome),
            )}
          >
            {heading}
          </h2>
          {subheading && (
            <p className="mt-4 text-lg text-muted-foreground">{subheading}</p>
          )}
          <div
            className={cn(
              'mt-12 grid gap-0 border-l border-t border-border md:grid-cols-3',
              chrome === 'brutalist' && 'border-foreground',
            )}
          >
            {steps.map((step, i) => (
              <div
                key={i}
                className={cn(
                  'relative p-6',
                  chrome === 'hairline' &&
                    'border-b border-r border-border bg-card',
                  chrome === 'brutalist' &&
                    'border-b-2 border-r-2 border-foreground bg-background',
                )}
              >
                <GhostNumeral numeral={String(i + 1).padStart(2, '0')} />
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  {String(i + 1).padStart(2, '0')}
                  <span className="text-primary"> /</span>
                </span>
                <h3
                  className={cn(
                    'mt-3 text-xl font-bold tracking-tight',
                    chromeCardTitleClass(chrome),
                  )}
                >
                  {step.title}
                </h3>
                {step.description && (
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {step.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Container>
      </P.Section>
    )
  }

  return (
    <P.Section>
      <P.Container size="xl" className="flex flex-col gap-12">
        <div className="flex flex-col gap-4">
          <P.Heading level="h2" text={heading} />
          {subheading && <P.Text variant="lead" text={subheading} />}
        </div>
        <div className="grid gap-0 border-l border-t border-border md:grid-cols-3">
          {steps.map((step, i) => (
            <div
              key={i}
              className="border-b border-r border-border bg-card p-6"
            >
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                {String(i + 1).padStart(2, '0')}
                <span className="text-primary"> /</span>
              </span>
              <h3 className="mt-3 text-xl font-bold tracking-tight text-foreground">
                {step.title}
              </h3>
              {step.description && (
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {step.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </P.Container>
    </P.Section>
  )
}

// ─── 16. simpleList ──────────────────────────────────────────────────────
// Flat list of items (jobs, events, articles, etc.).

export const SimpleList = defineCapsule({
  name: 'SimpleList',
  description:
    'Simple list: flat rows of items with title, optional description, optional meta. For job boards, event lists, article lists.',
  props: z.object({
    heading: z.string().optional(),
    items: z
      .array(
        z.object({
          title: z.string(),
          description: z.string().optional(),
          price: z.string().optional(),
          meta: z.string().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
    design: z.string().optional(),
  }),
  component: ({ props }) => {
    const intent = props.design
      ? parseDesignFromString(props.design)
      : DEFAULT_DESIGN
    return withDesign(intent, <SimpleListInner {...props} />)
  },
})

function SimpleListInner(props: Record<string, unknown>) {
  const heading = (props.heading as string) ?? 'List'
  const items = (props.items as Array<{
    title: string
    description?: string
    price?: string
    meta?: string
  }>) ?? [
    {
      title: 'Signature Espresso',
      description: 'Single-origin beans, hand-pulled with precision.',
      price: '$4.50',
      meta: '12 oz',
    },
    {
      title: 'Pour Over',
      description: 'Light roast, bright and floral with citrus notes.',
      price: '$5.00',
      meta: '10 oz',
    },
    {
      title: 'Cold Brew',
      description: 'Steeped 18 hours, smooth and chocolatey.',
      price: '$4.75',
      meta: '16 oz',
    },
  ]
  return (
    <P.Section>
      <P.Container size="md" className="flex flex-col gap-12">
        <P.Heading level="h2" text={heading} />
        <P.List items={items} />
      </P.Container>
    </P.Section>
  )
}

// ─── 17. faqAccordion ────────────────────────────────────────────────────
// Collapsible Q&A items.

export const FaqAccordion = defineCapsule({
  name: 'FaqAccordion',
  description:
    'FAQ accordion: collapsible question/answer pairs. Chrome: hairline (collapsed-border + mono indices), terminal (mono $ prompts).',
  props: z.object({
    heading: z.string().optional(),
    items: z
      .array(
        z.object({
          question: z.string(),
          answer: z.string(),
        }),
      )
      .optional(),
    chrome: z
      .enum(['none', 'hairline', 'brutalist', 'terminal', 'editorial'])
      .optional(),
    index: z.string().optional(),
    className: z.string().optional(),
    design: z.string().optional(),
  }),
  component: ({ props }) => {
    const intent = props.design
      ? parseDesignFromString(props.design)
      : DEFAULT_DESIGN
    return withDesign(intent, <FaqAccordionInner {...props} />)
  },
})

function FaqAccordionInner(props: Record<string, unknown>) {
  const heading = (props.heading as string) ?? 'FAQ'
  const items = (props.items as Array<{
    question: string
    answer: string
  }>) ?? [
    { question: 'What is this?', answer: 'A thing that does stuff.' },
    { question: 'How much?', answer: 'It is free.' },
  ]
  const chrome = (props.chrome as ChromeVariant) ?? 'editorial'
  const index = props.index as string | undefined

  // Chrome-driven: hairline/terminal uses collapsed-border with mono indices
  if (chrome === 'hairline' || chrome === 'terminal') {
    return (
      <P.Section
        className={cn(
          'relative overflow-hidden',
          chrome === 'terminal' && 'bg-muted/40',
        )}
      >
        <Container size="md" className="relative py-20">
          <SectionEyebrow index={index} chrome={chrome} />
          <h2
            className={cn(
              'text-center text-3xl font-extrabold tracking-tight sm:text-4xl',
              chromeHeadingClass(chrome),
            )}
          >
            {heading}
          </h2>
          <div className="mt-10 border-l border-t border-border">
            {items.map((item, i) => (
              <div key={i} className="border-b border-r border-border bg-card">
                <div className="flex items-baseline gap-4 p-5 sm:p-6">
                  <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
                    {chrome === 'terminal' ? '$ ' : ''}
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3
                    className={cn(
                      'text-lg font-bold tracking-tight',
                      chromeCardTitleClass(chrome),
                    )}
                  >
                    {item.question}
                  </h3>
                </div>
                <div className="px-5 pb-5 pl-14 sm:px-6 sm:pb-6 sm:pl-14">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {item.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </P.Section>
    )
  }

  return (
    <P.Section>
      <Container size="md" className="py-20">
        <SectionHeading title={heading} align="center" />
        <KitFaqAccordion className="mt-10">
          {items.map((item, i) => (
            <FaqItem key={i}>
              <FaqQuestion>{item.question}</FaqQuestion>
              <FaqAnswer>{item.answer}</FaqAnswer>
            </FaqItem>
          ))}
        </KitFaqAccordion>
      </Container>
    </P.Section>
  )
}

// ─── 18. timeline ────────────────────────────────────────────────────────
// Vertical timeline with dates.

export const Timeline = defineCapsule({
  name: 'Timeline',
  description:
    'Timeline: vertical sequence of events with date, title, and description. Chrome: hairline (collapsed-border + mono dates), terminal (mono $ prompts + ghost numerals).',
  props: z.object({
    heading: z.string().optional(),
    events: z
      .array(
        z.object({
          date: z.string(),
          title: z.string(),
          description: z.string().optional(),
        }),
      )
      .optional(),
    chrome: z
      .enum(['none', 'hairline', 'brutalist', 'terminal', 'editorial'])
      .optional(),
    index: z.string().optional(),
    className: z.string().optional(),
    design: z.string().optional(),
  }),
  component: ({ props }) => {
    const intent = props.design
      ? parseDesignFromString(props.design)
      : DEFAULT_DESIGN
    return withDesign(intent, <TimelineInner {...props} />)
  },
})

function TimelineInner(props: Record<string, unknown>) {
  const heading = (props.heading as string) ?? 'Timeline'
  const events = (props.events as Array<{
    date: string
    title: string
    description?: string
  }>) ?? [
    { date: 'Q1', title: 'Launch', description: 'Initial release' },
    { date: 'Q2', title: 'Scale', description: 'Growth phase' },
    { date: 'Q3', title: 'Expand', description: 'New markets' },
  ]
  const chrome = (props.chrome as ChromeVariant) ?? 'editorial'
  const index = props.index as string | undefined

  // Chrome-driven: hairline/terminal uses collapsed-border with mono dates
  if (chrome === 'hairline' || chrome === 'terminal') {
    return (
      <P.Section
        className={cn(
          'relative overflow-hidden',
          chrome === 'terminal' && 'bg-muted/40',
        )}
      >
        <Container size="md" className="relative py-20">
          <SectionEyebrow index={index} chrome={chrome} />
          <h2
            className={cn(
              'text-3xl font-extrabold tracking-tight sm:text-4xl',
              chromeHeadingClass(chrome),
            )}
          >
            {heading}
          </h2>
          <div className="mt-12 flex flex-col gap-0 border-l border-t border-border">
            {events.map((event, i) => (
              <div
                key={i}
                className="relative border-b border-r border-border bg-card p-6"
              >
                <GhostNumeral numeral={String(i + 1).padStart(2, '0')} />
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
                  {chrome === 'terminal' && (
                    <span className="text-primary">$ </span>
                  )}
                  {event.date}
                </span>
                <h3
                  className={cn(
                    'mt-2 text-lg font-bold tracking-tight',
                    chromeCardTitleClass(chrome),
                  )}
                >
                  {event.title}
                </h3>
                {event.description && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {event.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Container>
      </P.Section>
    )
  }

  return (
    <P.Section>
      <P.Container size="md" className="flex flex-col gap-12">
        <P.Heading level="h2" text={heading} />
        <div className="flex flex-col gap-0 border-l-2 border-border">
          {events.map((event, i) => (
            <div key={i} className="relative pl-8 pb-8 last:pb-0">
              <span className="absolute -left-[5px] top-1 size-2.5 rounded-full bg-primary" />
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                {event.date}
              </span>
              <h3 className="mt-2 text-lg font-bold tracking-tight text-foreground">
                {event.title}
              </h3>
              {event.description && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {event.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </P.Container>
    </P.Section>
  )
}

// ─── 19. ctaBand ─────────────────────────────────────────────────────────
// Heading + subheading + button.

export const CtaBand = defineCapsule({
  name: 'CtaBand',
  description:
    'CTA band: centered heading + subheading + button. Chrome: brutalist (inverted dark + slanted seam + uppercase), gradient (glow orbs), terminal (mono $ prompt).',
  props: z.object({
    heading: z.string().optional(),
    subheading: z.string().optional(),
    cta: z.string().optional(),
    variant: z.enum(['primary', 'muted', 'card']).optional(),
    chrome: z
      .enum([
        'none',
        'hairline',
        'brutalist',
        'terminal',
        'editorial',
        'gradient',
      ])
      .optional(),
    watermark: z.string().optional(),
    className: z.string().optional(),
    design: z.string().optional(),
  }),
  component: ({ props }) => {
    const intent = props.design
      ? parseDesignFromString(props.design)
      : DEFAULT_DESIGN
    return withDesign(intent, <CtaBandInner {...props} />)
  },
})

function CtaBandInner(props: Record<string, unknown>) {
  const tone = (props.variant as 'primary' | 'muted' | 'card') ?? 'primary'
  const heading = (props.heading as string) ?? 'Ready to start?'
  const subheading = props.subheading as string | undefined
  const cta = (props.cta as string) ?? 'Get started'
  const chrome = (props.chrome as ChromeVariant) ?? 'editorial'
  const watermark = props.watermark as string | undefined

  // Brutalist: inverted dark band with slanted seam + uppercase
  if (chrome === 'brutalist') {
    return (
      <P.Section
        className={cn(
          'relative overflow-hidden bg-foreground text-background',
          slantedSeamClass('top'),
        )}
      >
        <WatermarkDecor
          watermark={watermark ?? '*'}
          className="-bottom-16 -left-8 -rotate-12 text-[14rem] text-background/[0.05]"
        />
        <Container
          size="md"
          className="relative flex flex-col items-center gap-6 py-20 text-center"
        >
          <h2 className="text-4xl font-black uppercase leading-[0.95] tracking-tighter text-background sm:text-6xl">
            {heading}
          </h2>
          {subheading && (
            <p className="max-w-md text-lg text-background/70">{subheading}</p>
          )}
          <button className="mt-2 border-2 border-background bg-background px-8 py-3 font-bold uppercase tracking-wider text-foreground transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0] hover:shadow-background">
            {cta}
          </button>
        </Container>
      </P.Section>
    )
  }

  // Gradient: glow orbs behind CTA
  if (chrome === 'gradient') {
    return (
      <P.Section className="relative overflow-hidden">
        <DecorBackground decor="glow" />
        <KitCtaBand tone={tone}>
          <KitCtaBandInner align="center">
            <CtaBandTitle>{heading}</CtaBandTitle>
            {subheading && <CtaBandSubtitle>{subheading}</CtaBandSubtitle>}
            <CtaBandActions>
              <CtaAction variant="primary">{cta}</CtaAction>
            </CtaBandActions>
          </KitCtaBandInner>
        </KitCtaBand>
      </P.Section>
    )
  }

  // Terminal: mono $ prompt
  if (chrome === 'terminal') {
    return (
      <P.Section className="border-y border-border bg-muted/40 py-16">
        <Container
          size="md"
          className="flex flex-col items-center gap-6 text-center"
        >
          <span
            aria-hidden="true"
            className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
          >
            <span className="text-primary">$ </span>
            get started --now
          </span>
          <h2 className="font-mono text-3xl font-extrabold tracking-tight sm:text-4xl">
            {heading}
          </h2>
          {subheading && (
            <p className="max-w-md text-lg text-muted-foreground">
              {subheading}
            </p>
          )}
          <button className="mt-2 bg-primary px-8 py-3 font-mono text-sm font-bold uppercase tracking-wider text-primary-foreground transition-colors hover:bg-primary/90">
            {cta}
          </button>
        </Container>
      </P.Section>
    )
  }

  // Editorial: inverted dark band with slanted seam + serif heading + watermark
  if (chrome === 'editorial') {
    return (
      <P.Section
        className={cn(
          'relative overflow-hidden bg-foreground text-background [clip-path:polygon(0_3rem,100%_0,100%_100%,0_100%)] pt-20 sm:pt-28',
        )}
      >
        <WatermarkDecor
          watermark={watermark ?? '→'}
          className="-bottom-16 right-0 text-[16rem] text-background/[0.04]"
        />
        <Container
          size="md"
          className="relative flex flex-col items-center gap-6 py-20 text-center"
        >
          <h2 className="text-4xl font-serif font-light tracking-tight leading-tight text-background sm:text-5xl">
            {heading}
          </h2>
          {subheading && (
            <p className="max-w-md text-lg text-background/60">{subheading}</p>
          )}
          <button className="mt-2 border border-background/30 bg-transparent px-8 py-3 text-sm font-medium tracking-wide text-background transition-all hover:border-background hover:bg-background hover:text-foreground">
            {cta}
          </button>
        </Container>
      </P.Section>
    )
  }

  return (
    <KitCtaBand tone={tone}>
      <KitCtaBandInner align="center">
        <CtaBandTitle>{heading}</CtaBandTitle>
        {subheading && <CtaBandSubtitle>{subheading}</CtaBandSubtitle>}
        <CtaBandActions>
          <CtaAction variant="primary">{cta}</CtaAction>
        </CtaBandActions>
      </KitCtaBandInner>
    </KitCtaBand>
  )
}

// ─── 20. newsletterCta ───────────────────────────────────────────────────
// Heading + email form.

export const NewsletterCta = defineCapsule({
  name: 'NewsletterCta',
  description:
    'Newsletter CTA: heading + email signup form. Chrome: terminal (mono $ prompt + inline capture), brutalist (inverted dark + rotated sticker + uppercase), editorial (serif + watermark). For newsletter, waitlist, subscribe sections.',
  props: z.object({
    heading: z.string().optional(),
    subheading: z.string().optional(),
    cta: z.string().optional(),
    variant: z
      .enum(['default', 'primary-tint', 'muted', 'inverted'])
      .optional(),
    chrome: z
      .enum([
        'none',
        'hairline',
        'brutalist',
        'terminal',
        'editorial',
        'gradient',
      ])
      .optional(),
    watermark: z.string().optional(),
    className: z.string().optional(),
    design: z.string().optional(),
  }),
  component: ({ props }) => {
    const intent = props.design
      ? parseDesignFromString(props.design)
      : DEFAULT_DESIGN
    return withDesign(intent, <NewsletterCtaInner {...props} />)
  },
})

function NewsletterCtaInner(props: Record<string, unknown>) {
  const variant =
    (props.variant as 'default' | 'primary-tint' | 'muted' | 'inverted') ??
    'default'
  const chrome = (props.chrome as ChromeVariant) ?? 'editorial'
  const watermark = props.watermark as string | undefined
  const heading = (props.heading as string) ?? 'Subscribe'
  const subheading = props.subheading as string | undefined
  const cta = (props.cta as string) ?? 'Subscribe'

  // Terminal: mono $ prompt + inline email capture
  if (chrome === 'terminal') {
    return (
      <P.Section className="border-y border-border bg-muted/40 py-16">
        <Container
          size="sm"
          className="flex flex-col items-center gap-6 text-center"
        >
          <span
            aria-hidden="true"
            className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
          >
            <span className="text-primary">$ </span>
            subscribe --now
          </span>
          <h2 className="font-mono text-3xl font-extrabold tracking-tight sm:text-4xl">
            {heading}
          </h2>
          {subheading && (
            <p className="max-w-md text-lg text-muted-foreground">
              {subheading}
            </p>
          )}
          <InlineEmailCapture placeholder="you@example.com" submitLabel={cta} />
        </Container>
      </P.Section>
    )
  }

  // Brutalist: inverted dark band + rotated sticker + uppercase
  if (chrome === 'brutalist') {
    return (
      <P.Section
        className={cn(
          'relative overflow-hidden bg-foreground text-background',
          slantedSeamClass('top'),
        )}
      >
        <WatermarkDecor
          watermark={watermark ?? '✉'}
          className="-bottom-16 -right-8 -rotate-12 text-[14rem] text-background/[0.05]"
        />
        <Container
          size="sm"
          className="relative flex flex-col items-center gap-6 py-20 text-center"
        >
          <RotatedBadge rotate="rotate-3">Subscribe</RotatedBadge>
          <h2 className="text-4xl font-black uppercase leading-[0.95] tracking-tighter text-background sm:text-6xl">
            {heading}
          </h2>
          {subheading && (
            <p className="max-w-md text-lg text-background/70">{subheading}</p>
          )}
          <form className="flex w-full max-w-md flex-col gap-3 sm:flex-row">
            <input
              type="email"
              required
              placeholder="you@example.com"
              className="flex-1 border-2 border-background bg-background px-5 py-3.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none"
            />
            <button
              type="submit"
              className="whitespace-nowrap border-2 border-background bg-foreground px-8 py-3.5 text-sm font-bold uppercase tracking-wider text-background transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0] hover:shadow-background"
            >
              {cta}
            </button>
          </form>
        </Container>
      </P.Section>
    )
  }

  // Editorial: extralight heading + watermark + mono label
  if (chrome === 'editorial') {
    return (
      <P.Section className="relative overflow-hidden border-y border-border bg-card py-20">
        <WatermarkDecor
          watermark={watermark ?? '§'}
          className="-top-8 right-0 text-[12rem] text-foreground/[0.04]"
        />
        <Container
          size="sm"
          className="relative flex flex-col items-center gap-6 text-center"
        >
          <span
            aria-hidden="true"
            className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
          >
            Newsletter · Vol. 01
          </span>
          <h2 className="text-4xl font-extralight tracking-tight sm:text-5xl">
            {heading}
          </h2>
          {subheading && (
            <p className="max-w-md text-lg leading-relaxed text-muted-foreground">
              {subheading}
            </p>
          )}
          <InlineEmailCapture placeholder="you@example.com" submitLabel={cta} />
        </Container>
      </P.Section>
    )
  }

  // Gradient: glow orbs behind form
  if (chrome === 'gradient') {
    return (
      <P.Section className="relative overflow-hidden">
        <GlowOrbs />
        <KitNewsletterCta variant={variant}>
          <Container
            size="sm"
            className="relative flex flex-col items-center gap-6 py-16 text-center"
          >
            <NewsletterCtaHeading>{heading}</NewsletterCtaHeading>
            {subheading && (
              <NewsletterCtaDescription>{subheading}</NewsletterCtaDescription>
            )}
            <InlineEmailCapture
              placeholder="you@example.com"
              submitLabel={cta}
            />
          </Container>
        </KitNewsletterCta>
      </P.Section>
    )
  }

  return (
    <KitNewsletterCta variant={variant}>
      <Container
        size="sm"
        className="flex flex-col items-center gap-6 py-16 text-center"
      >
        <NewsletterCtaHeading>{heading}</NewsletterCtaHeading>
        {subheading && (
          <NewsletterCtaDescription>{subheading}</NewsletterCtaDescription>
        )}
        <P.Form
          fields={[
            { label: 'Email', type: 'email', placeholder: 'you@example.com' },
          ]}
          submitLabel={cta}
          className="w-full max-w-md"
        />
      </Container>
    </KitNewsletterCta>
  )
}

// ─── 21. contactForm ─────────────────────────────────────────────────────
// Form with fields + contact info.

export const ContactForm = defineCapsule({
  name: 'ContactForm',
  description:
    'Contact form: heading + form with name/email/message fields. Optional contact info beside.',
  props: z.object({
    heading: z.string().optional(),
    subheading: z.string().optional(),
    className: z.string().optional(),
    design: z.string().optional(),
  }),
  component: ({ props }) => {
    const intent = props.design
      ? parseDesignFromString(props.design)
      : DEFAULT_DESIGN
    return withDesign(intent, <ContactFormInner {...props} />)
  },
})

function ContactFormInner(props: Record<string, unknown>) {
  return (
    <P.Section>
      <Container size="md" className="py-20">
        <SectionHeading
          title={(props.heading as string) ?? 'Contact us'}
          subtitle={props.subheading as string | undefined}
          align="left"
        />
        <KitContactForm className="mt-10">
          <ContactFormField>
            <ContactFormLabel>Name</ContactFormLabel>
            <ContactFormInput type="text" placeholder="Your name" />
          </ContactFormField>
          <ContactFormField>
            <ContactFormLabel>Email</ContactFormLabel>
            <ContactFormInput type="email" placeholder="you@example.com" />
          </ContactFormField>
          <ContactFormField>
            <ContactFormLabel>Message</ContactFormLabel>
            <ContactFormTextarea placeholder="Your message" />
          </ContactFormField>
          <ContactFormSubmit>Send message</ContactFormSubmit>
        </KitContactForm>
      </Container>
    </P.Section>
  )
}

// ─── 22. bookingForm ─────────────────────────────────────────────────────
// Form with date/time selection.

export const BookingForm = defineCapsule({
  name: 'BookingForm',
  description:
    'Booking form: heading + form with name/date/time/party-size fields. For reservations, appointments.',
  props: z.object({
    heading: z.string().optional(),
    subheading: z.string().optional(),
    className: z.string().optional(),
    design: z.string().optional(),
  }),
  component: ({ props }) => {
    const intent = props.design
      ? parseDesignFromString(props.design)
      : DEFAULT_DESIGN
    return withDesign(intent, <BookingFormInner {...props} />)
  },
})

function BookingFormInner(props: Record<string, unknown>) {
  return (
    <P.Section>
      <P.Container size="sm" className="flex flex-col gap-12">
        <div className="flex flex-col gap-4">
          <P.Heading
            level="h2"
            text={(props.heading as string) ?? 'Book now'}
          />
          {(props.subheading as string | undefined) && (
            <P.Text variant="lead" text={props.subheading as string} />
          )}
        </div>
        <P.Form
          fields={[
            { label: 'Name', type: 'text', placeholder: 'Your name' },
            { label: 'Date', type: 'text', placeholder: 'MM/DD/YYYY' },
            {
              label: 'Time',
              type: 'select',
              options: ['12:00 PM', '1:00 PM', '6:00 PM', '7:00 PM'],
            },
            {
              label: 'Party size',
              type: 'select',
              options: ['1', '2', '3', '4', '5+'],
            },
          ]}
          submitLabel="Book"
        />
      </P.Container>
    </P.Section>
  )
}

// ─── 23. navbar ──────────────────────────────────────────────────────────
// Logo + nav links + CTA.

export const Navbar = defineCapsule({
  name: 'Navbar',
  description: 'Navbar: brand name + nav links + optional CTA. Sticky top.',
  props: z.object({
    brand: z.string().optional(),
    links: z.array(z.string()).optional(),
    cta: z.string().optional(),
    className: z.string().optional(),
    design: z.string().optional(),
  }),
  component: ({ props }) => {
    const intent = props.design
      ? parseDesignFromString(props.design)
      : DEFAULT_DESIGN
    return withDesign(
      intent,
      <SiteNav
        brand={(props.brand as string) ?? 'Brand'}
        nav={(props.links as string[]) ?? ['Home', 'About', 'Contact']}
        cta={
          props.cta
            ? { label: props.cta as string, variant: 'primary' }
            : undefined
        }
        sticky
      />,
    )
  },
})

// ─── 24. footer ──────────────────────────────────────────────────────────
// Multi-column footer with links + social.

export const Footer = defineCapsule({
  name: 'Footer',
  description:
    'Footer: brand + multi-column links + optional social. Always last on page.',
  props: z.object({
    brand: z.string().optional(),
    columns: z
      .array(
        z.object({
          title: z.string(),
          links: z.array(z.string()),
        }),
      )
      .optional(),
    social: z.array(z.string()).optional(),
    className: z.string().optional(),
    design: z.string().optional(),
  }),
  component: ({ props }) => {
    const intent = props.design
      ? parseDesignFromString(props.design)
      : DEFAULT_DESIGN
    const columns = (props.columns as Array<{
      title: string
      links: string[]
    }>) ?? [
      { title: 'Pages', links: ['Home', 'About'] },
      { title: 'Company', links: ['Contact', 'Careers'] },
      { title: 'Legal', links: ['Privacy', 'Terms'] },
    ]
    const social = props.social as string[] | undefined
    return withDesign(
      intent,
      <SiteFooter>
        <FooterContent>
          <FooterGrid>
            <FooterBrand brand={(props.brand as string) ?? 'Brand'} />
            {columns.map((col, i) => (
              <FooterColumn key={i}>
                <FooterColumnTitle>{col.title}</FooterColumnTitle>
                <FooterColumnList>
                  {col.links.map((link, ii) => (
                    <FooterLink key={ii} href={link}>
                      {link}
                    </FooterLink>
                  ))}
                </FooterColumnList>
              </FooterColumn>
            ))}
          </FooterGrid>
          {social && social.length > 0 && (
            <FooterSocial>
              {social.map((s, i) => (
                <FooterSocialLink key={i} href={s.toLowerCase()}>
                  {s}
                </FooterSocialLink>
              ))}
            </FooterSocial>
          )}
        </FooterContent>
      </SiteFooter>,
    )
  },
})

// ─── 25. mediaSplit ──────────────────────────────────────────────────────
// Image + text side by side.

export const MediaSplit = defineCapsule({
  name: 'MediaSplit',
  description:
    'Media split: image on one side, heading + text on the other. Chrome: editorial (serif + image caption bar + figure index), brutalist (border-2 + hard shadows).',
  props: z.object({
    heading: z.string().optional(),
    text: z.string().optional(),
    imageAlt: z.string().optional(),
    imageSrc: z.string().optional(),
    reversed: z.boolean().optional(),
    variant: z.enum(['split', 'story']).optional(),
    chrome: z
      .enum(['none', 'hairline', 'brutalist', 'terminal', 'editorial'])
      .optional(),
    index: z.string().optional(),
    className: z.string().optional(),
    design: z.string().optional(),
  }),
  component: ({ props }) => {
    const intent = props.design
      ? parseDesignFromString(props.design)
      : DEFAULT_DESIGN
    return withDesign(intent, <MediaSplitInner {...props} />)
  },
})

function MediaSplitInner(props: Record<string, unknown>) {
  const reversed = (props.reversed as boolean) ?? false
  const variant = (props.variant as 'split' | 'story') ?? 'split'
  const heading = (props.heading as string) ?? 'About us'
  const text = (props.text as string) ?? 'Our story.'
  const imageAlt =
    (props.imageAlt as string) ??
    'Bright architecture studio workspace with large desks, physical building models, and floor-to-ceiling windows with natural light'
  const chrome = (props.chrome as ChromeVariant) ?? 'editorial'
  const index = props.index as string | undefined

  // Chrome-driven: editorial/brutalist with image caption bar + figure index
  if (
    (chrome === 'editorial' ||
      chrome === 'brutalist' ||
      chrome === 'hairline') &&
    variant !== 'story'
  ) {
    return (
      <P.Section
        className={cn(
          'relative overflow-hidden',
          chrome === 'brutalist' && 'border-b-2 border-foreground bg-muted/40',
        )}
      >
        <Container size="xl" className="relative py-20">
          <div
            className={cn(
              'grid items-center gap-12 lg:grid-cols-2 lg:gap-20',
              reversed && 'lg:[direction:rtl]',
            )}
          >
            <div
              className={cn(
                'flex flex-col gap-4',
                reversed && 'lg:[direction:ltr]',
              )}
            >
              {index && <SectionEyebrow index={index} chrome={chrome} />}
              <h2
                className={cn(
                  'text-3xl font-bold tracking-tight sm:text-4xl',
                  chromeHeadingClass(chrome),
                )}
              >
                {heading}
              </h2>
              <p className="text-lg leading-relaxed text-muted-foreground">
                {text}
              </p>
            </div>
            <div className={cn(reversed && 'lg:[direction:ltr]')}>
              {chrome === 'editorial' ? (
                <FloatingStatPhoto
                  alt={imageAlt}
                  src={props.imageSrc as string | undefined}
                  statValue="15+"
                  statLabel="Years of practice"
                />
              ) : chrome === 'brutalist' ? (
                <div className="relative border-2 border-foreground shadow-[8px_8px_0_0] shadow-foreground">
                  <P.ImageBlock
                    alt={imageAlt}
                    src={props.imageSrc as string | undefined}
                    className="block aspect-[4/3] w-full object-cover"
                  />
                  <RotatedSticker rotate="-rotate-3">About</RotatedSticker>
                </div>
              ) : (
                <div className="overflow-hidden border border-border">
                  <P.ImageBlock
                    alt={imageAlt}
                    src={props.imageSrc as string | undefined}
                    className="block aspect-[4/3] w-full object-cover"
                  />
                  <ImageCaptionBar caption={imageAlt} figure="fig. 01" />
                </div>
              )}
            </div>
          </div>
        </Container>
      </P.Section>
    )
  }

  if (variant === 'story') {
    // Asymmetric story layout with offset image tiles
    return (
      <StorySection>
        <Container size="xl" className="py-20">
          <StorySplitGrid>
            <StoryMedia>
              <StoryImageTile>
                <P.ImageBlock
                  alt={imageAlt}
                  src={props.imageSrc as string | undefined}
                  className="h-full w-full object-cover"
                />
              </StoryImageTile>
              <StoryImageTile offset>
                <P.ImageBlock
                  alt={`${imageAlt} detail`}
                  className="h-full w-full object-cover"
                />
              </StoryImageTile>
            </StoryMedia>
            <StoryContent>
              <StoryHeading>{heading}</StoryHeading>
              <StoryBody>{text}</StoryBody>
            </StoryContent>
          </StorySplitGrid>
        </Container>
      </StorySection>
    )
  }

  // split (default) — simple 7/5 split with offset image tiles
  return (
    <P.Section>
      <Container size="xl" className={cn('py-20', reversed && 'order-2')}>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div className={cn('flex flex-col gap-4', reversed && 'lg:order-2')}>
            <StoryHeading>{heading}</StoryHeading>
            <StoryBody>{text}</StoryBody>
          </div>
          <div className={cn(reversed && 'lg:order-1')}>
            <OffsetImageTiles
              alt={imageAlt}
              src={props.imageSrc as string | undefined}
            />
          </div>
        </div>
      </Container>
    </P.Section>
  )
}

// ─── 26. mapBlock ────────────────────────────────────────────────────────
// Map + location info.

export const MapBlock = defineCapsule({
  name: 'MapBlock',
  description:
    'Map block: heading + address/location info. Placeholder map area.',
  props: z.object({
    heading: z.string().optional(),
    address: z.string().optional(),
    hours: z.string().optional(),
    className: z.string().optional(),
    design: z.string().optional(),
  }),
  component: ({ props }) => {
    const intent = props.design
      ? parseDesignFromString(props.design)
      : DEFAULT_DESIGN
    return withDesign(intent, <MapBlockInner {...props} />)
  },
})

function MapBlockInner(props: Record<string, unknown>) {
  return (
    <P.Section>
      <P.Container
        size="xl"
        className="grid gap-10 lg:grid-cols-2 lg:items-center"
      >
        <div className="flex flex-col gap-4">
          <P.Heading level="h2" text={(props.heading as string) ?? 'Find us'} />
          {(props.address as string | undefined) && (
            <P.Text variant="body" text={props.address as string} />
          )}
          {(props.hours as string | undefined) && (
            <P.Text variant="caption" text={props.hours as string} />
          )}
        </div>
        <div className="aspect-video border border-border bg-muted" />
      </P.Container>
    </P.Section>
  )
}

// ─── 27. articlePreview ──────────────────────────────────────────────────
// Featured article + grid of articles.

export const ArticlePreview = defineCapsule({
  name: 'ArticlePreview',
  description:
    'Article preview: featured article + grid of recent articles. For blogs, news, publications.',
  props: z.object({
    heading: z.string().optional(),
    featured: z
      .object({
        title: z.string(),
        excerpt: z.string().optional(),
        imageAlt: z.string().optional(),
        imageSrc: z.string().optional(),
      })
      .optional(),
    articles: z
      .array(
        z.object({
          title: z.string(),
          excerpt: z.string().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
    design: z.string().optional(),
  }),
  component: ({ props }) => {
    const intent = props.design
      ? parseDesignFromString(props.design)
      : DEFAULT_DESIGN
    return withDesign(intent, <ArticlePreviewInner {...props} />)
  },
})

function ArticlePreviewInner(props: Record<string, unknown>) {
  const heading = (props.heading as string) ?? 'Latest articles'
  const featured = (props.featured as {
    title: string
    excerpt?: string
    imageAlt?: string
    imageSrc?: string
  }) ?? {
    title: 'The future of design systems starts with tokens',
    excerpt:
      "Why token-driven design systems are replacing hardcoded palettes, and what it means for your team's velocity and consistency.",
    imageAlt:
      'Modern design system documentation on a laptop screen with color tokens and component library',
  }
  const articles = (props.articles as Array<{
    title: string
    excerpt?: string
  }>) ?? [
    {
      title: 'Building for speed: the compile-time revolution',
      excerpt: 'How modern tooling eliminates runtime overhead.',
    },
    {
      title: 'The case for asymmetric layouts',
      excerpt: 'Why perfect symmetry kills visual interest.',
    },
    {
      title: 'Type-safe UI patterns',
      excerpt: 'Leveraging TypeScript for bulletproof components.',
    },
  ]
  return (
    <P.Section>
      <P.Container size="xl" className="flex flex-col gap-12">
        <P.Heading level="h2" text={heading} />
        <div className="grid gap-10 lg:grid-cols-2">
          <P.Card
            title={featured.title}
            description={featured.excerpt}
            imageAlt={featured.imageAlt}
            imageUrl={featured.imageSrc}
          />
          <div className="flex flex-col gap-6">
            {articles.map((a, i) => (
              <P.Card key={i} title={a.title} description={a.excerpt} />
            ))}
          </div>
        </div>
      </P.Container>
    </P.Section>
  )
}

// ─── 28. categoryNav ─────────────────────────────────────────────────────
// Category tiles that link to pages.

export const CategoryNav = defineCapsule({
  name: 'CategoryNav',
  description:
    'Category navigation: grid of category tiles with name and optional image. Links to pages.',
  props: z.object({
    heading: z.string().optional(),
    categories: z
      .array(
        z.object({
          name: z.string(),
          imageAlt: z.string().optional(),
          imageSrc: z.string().optional(),
        }),
      )
      .optional(),
    cols: z.number().optional(),
    className: z.string().optional(),
    design: z.string().optional(),
  }),
  component: ({ props }) => {
    const intent = props.design
      ? parseDesignFromString(props.design)
      : DEFAULT_DESIGN
    return withDesign(intent, <CategoryNavInner {...props} />)
  },
})

function CategoryNavInner(props: Record<string, unknown>) {
  const heading = (props.heading as string) ?? 'Categories'
  const categories = (props.categories as Array<{
    name: string
    imageAlt?: string
    imageSrc?: string
  }>) ?? [
    { name: 'Category 1' },
    { name: 'Category 2' },
    { name: 'Category 3' },
    { name: 'Category 4' },
  ]
  const cols = (props.cols as number) ?? 4
  return (
    <P.Section>
      <P.Container size="xl" className="flex flex-col gap-12">
        <P.Heading level="h2" text={heading} />
        <P.Grid cols={cols}>
          {categories.map((cat, i) => (
            <P.Card
              key={i}
              title={cat.name}
              imageAlt={cat.imageAlt ?? cat.name}
              imageUrl={cat.imageSrc}
            />
          ))}
        </P.Grid>
      </P.Container>
    </P.Section>
  )
}

// ─── 29. comparisonTable ─────────────────────────────────────────────────
// Feature comparison table.

export const ComparisonTable = defineCapsule({
  name: 'ComparisonTable',
  description:
    'Comparison table: rows of features compared across columns. For feature comparisons, specs.',
  props: z.object({
    heading: z.string().optional(),
    columns: z.array(z.string()).optional(),
    rows: z
      .array(
        z.object({
          feature: z.string(),
          values: z.array(z.string()),
        }),
      )
      .optional(),
    className: z.string().optional(),
    design: z.string().optional(),
  }),
  component: ({ props }) => {
    const intent = props.design
      ? parseDesignFromString(props.design)
      : DEFAULT_DESIGN
    return withDesign(intent, <ComparisonTableInner {...props} />)
  },
})

function ComparisonTableInner(props: Record<string, unknown>) {
  const heading = (props.heading as string) ?? 'Comparison'
  const columns = (props.columns as string[]) ?? [
    'Feature',
    'Basic',
    'Pro',
    'Enterprise',
  ]
  const rows = (props.rows as Array<{ feature: string; values: string[] }>) ?? [
    { feature: 'Users', values: ['1', '10', 'Unlimited'] },
    { feature: 'Storage', values: ['1GB', '100GB', '1TB'] },
  ]
  return (
    <P.Section>
      <P.Container size="lg" className="flex flex-col gap-12">
        <P.Heading level="h2" text={heading} />
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-border">
              {columns.map((col, i) => (
                <th
                  key={i}
                  className="p-4 text-left font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-border">
                <td className="p-4 font-medium text-foreground">
                  {row.feature}
                </td>
                {row.values.map((v, vi) => (
                  <td key={vi} className="p-4 text-muted-foreground">
                    {v}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </P.Container>
    </P.Section>
  )
}

// ─── 30. stepProcess ─────────────────────────────────────────────────────
// Numbered steps with connecting line.

export const StepProcess = defineCapsule({
  name: 'StepProcess',
  description:
    'Step process: numbered steps with connecting line. For onboarding, workflows, processes.',
  props: z.object({
    heading: z.string().optional(),
    steps: z
      .array(
        z.object({
          title: z.string(),
          description: z.string().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
    design: z.string().optional(),
  }),
  component: ({ props }) => {
    const intent = props.design
      ? parseDesignFromString(props.design)
      : DEFAULT_DESIGN
    return withDesign(intent, <StepProcessInner {...props} />)
  },
})

function StepProcessInner(props: Record<string, unknown>) {
  const heading = (props.heading as string) ?? 'Process'
  const steps = (props.steps as Array<{
    title: string
    description?: string
  }>) ?? [
    { title: 'Discover', description: 'Understand needs.' },
    { title: 'Design', description: 'Create the plan.' },
    { title: 'Deliver', description: 'Ship it.' },
  ]
  return (
    <P.Section>
      <P.Container size="xl" className="flex flex-col gap-12">
        <P.Heading level="h2" text={heading} />
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-0">
          {steps.map((step, i) => (
            <div
              key={i}
              className="relative flex flex-1 flex-col gap-3 lg:px-8"
            >
              {i < steps.length - 1 && (
                <span
                  className="absolute left-8 top-4 hidden h-px flex-1 bg-border lg:block"
                  style={{ width: 'calc(100% - 4rem)' }}
                />
              )}
              <span className="relative z-10 flex size-8 items-center justify-center border-2 border-foreground bg-background font-mono text-sm font-bold text-foreground">
                {i + 1}
              </span>
              <h3 className="text-lg font-bold tracking-tight text-foreground">
                {step.title}
              </h3>
              {step.description && (
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </P.Container>
    </P.Section>
  )
}

// ─── 31. valueProps ──────────────────────────────────────────────────────
// Icon + title + description in a row.

export const ValueProps = defineCapsule({
  name: 'ValueProps',
  description:
    'Value props: grid of value propositions with title and description. Chrome: hairline (collapsed-border + mono indices + tick bars), terminal (mono $ labels), brutalist (border-2 + hard shadows).',
  props: z.object({
    heading: z.string().optional(),
    values: z
      .array(
        z.object({
          title: z.string(),
          description: z.string().optional(),
        }),
      )
      .optional(),
    cols: z.number().optional(),
    chrome: z
      .enum(['none', 'hairline', 'brutalist', 'terminal', 'editorial'])
      .optional(),
    index: z.string().optional(),
    className: z.string().optional(),
    design: z.string().optional(),
  }),
  component: ({ props }) => {
    const intent = props.design
      ? parseDesignFromString(props.design)
      : DEFAULT_DESIGN
    return withDesign(intent, <ValuePropsInner {...props} />)
  },
})

function ValuePropsInner(props: Record<string, unknown>) {
  const heading = (props.heading as string) ?? 'Why choose us'
  const values = (props.values as Array<{
    title: string
    description?: string
  }>) ?? [
    { title: 'Fast', description: 'Quick delivery.' },
    { title: 'Reliable', description: 'Dependable.' },
    { title: 'Affordable', description: 'Great value.' },
  ]
  const cols = (props.cols as number) ?? 3
  const chrome = (props.chrome as ChromeVariant) ?? 'editorial'
  const index = props.index as string | undefined
  const columns = cols === 2 ? 2 : cols === 4 ? 4 : 3

  // ── Editorial: ArchitectureFirm-style hairline ledger grid — collapsed-border cells, ghost numerals ──
  if (chrome === 'editorial') {
    return (
      <P.Section className="relative overflow-hidden py-16 sm:py-24 lg:py-28">
        <Container>
          <EditorialSectionHeader
            index="01 /"
            eyebrow="Principles"
            heading={heading}
            metaLabel="Catalog"
            meta={String(values.length).padStart(2, '0')}
          />
          <div
            className={cn(
              'grid gap-0 border-l border-t border-border',
              columns === 2 && 'grid-cols-1 sm:grid-cols-2',
              columns === 3 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
              columns === 4 && 'grid-cols-2 lg:grid-cols-4',
            )}
          >
            {values.map((v, i) => (
              <div
                key={i}
                className="group relative overflow-hidden border-b border-r border-border p-6 sm:p-8"
              >
                {/* Giant ghost numeral */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-2 -top-6 select-none text-[6rem] font-extralight leading-none tracking-tighter text-foreground/[0.06] sm:text-[7rem]"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="relative">
                  <MonoTag className="text-foreground">
                    A.{String(i + 1).padStart(2, '0')}
                  </MonoTag>
                  <h3 className="mb-2 mt-5 text-xl font-light tracking-tight text-foreground">
                    {v.title}
                  </h3>
                  {v.description && (
                    <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                      {v.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </P.Section>
    )
  }

  // Chrome-driven: collapsed-border with mono indices + tick bars
  if (
    chrome === 'hairline' ||
    chrome === 'terminal' ||
    chrome === 'brutalist'
  ) {
    return (
      <P.Section
        className={cn(
          'relative overflow-hidden',
          chrome === 'brutalist' && 'border-b-2 border-foreground bg-muted/40',
        )}
      >
        <Container size="xl" className="relative py-20">
          <div className="mb-12 flex flex-col gap-6 border-b border-border pb-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <SectionEyebrow index={index} chrome={chrome} />
              <h2
                className={cn(
                  'text-3xl font-extrabold tracking-tight sm:text-4xl',
                  chromeHeadingClass(chrome),
                )}
              >
                {heading}
              </h2>
            </div>
            <span
              aria-hidden="true"
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60 tabular-nums"
            >
              [ {String(values.length).padStart(2, '0')} values ]
            </span>
          </div>
          <FeatureGrid
            columns={columns as 2 | 3 | 4}
            className={chromeGridClass(chrome)}
          >
            {values.map((v, i) => (
              <FeatureCard
                key={i}
                className={cn('p-7 sm:p-8', chromeBorderClass(chrome))}
              >
                <div className="flex items-center gap-3">
                  <CardIndex index={i + 1} chrome={chrome} />
                  <IndexDivider chrome={chrome} />
                </div>
                <FeatureTitle className={chromeCardTitleClass(chrome)}>
                  {v.title}
                </FeatureTitle>
                {v.description && (
                  <FeatureDescription className="leading-relaxed">
                    {v.description}
                  </FeatureDescription>
                )}
                {(chrome === 'hairline' || chrome === 'terminal') && (
                  <TickBar index={i} className="mt-auto pt-5" />
                )}
              </FeatureCard>
            ))}
          </FeatureGrid>
        </Container>
      </P.Section>
    )
  }

  return (
    <P.Section>
      <Container size="xl" className="py-20">
        <FeatureGrid heading={heading} columns={columns as 2 | 3 | 4}>
          {values.map((v, i) => (
            <FeatureCard key={i}>
              <FeatureIcon>{String(i + 1).padStart(2, '0')}</FeatureIcon>
              <FeatureTitle>{v.title}</FeatureTitle>
              {v.description && (
                <FeatureDescription>{v.description}</FeatureDescription>
              )}
            </FeatureCard>
          ))}
        </FeatureGrid>
      </Container>
    </P.Section>
  )
}

// ─── 32. quoteBand ───────────────────────────────────────────────────────
// Large pull quote.

export const QuoteBand = defineCapsule({
  name: 'QuoteBand',
  description:
    'Quote band: large centered pull quote with optional author. Chrome: brutalist (inverted dark + slanted seam + watermark), editorial (serif + watermark), gradient (glow orbs).',
  props: z.object({
    quote: z.string().optional(),
    author: z.string().optional(),
    role: z.string().optional(),
    variant: z.enum(['default', 'gradient', 'muted']).optional(),
    chrome: z
      .enum([
        'none',
        'hairline',
        'brutalist',
        'terminal',
        'editorial',
        'gradient',
      ])
      .optional(),
    watermark: z.string().optional(),
    className: z.string().optional(),
    design: z.string().optional(),
  }),
  component: ({ props }) => {
    const intent = props.design
      ? parseDesignFromString(props.design)
      : DEFAULT_DESIGN
    return withDesign(intent, <QuoteBandInner {...props} />)
  },
})

function QuoteBandInner(props: Record<string, unknown>) {
  const variant = (props.variant as 'default' | 'gradient' | 'muted') ?? 'muted'
  const chrome = (props.chrome as ChromeVariant) ?? 'editorial'
  const watermark = props.watermark as string | undefined
  const quote =
    (props.quote as string) ??
    'The best way to predict the future is to invent it.'
  const author = (props.author as string) ?? 'Alan Kay'
  const role = props.role as string | undefined

  // Brutalist: inverted dark band with slanted seam + giant watermark
  if (chrome === 'brutalist') {
    return (
      <P.Section
        className={cn(
          'relative overflow-hidden bg-foreground text-background',
          slantedSeamClass('top'),
        )}
      >
        <WatermarkDecor
          watermark={watermark ?? '"'}
          className="-bottom-16 -left-8 -rotate-12 text-[14rem] text-background/[0.05]"
        />
        <Container
          size="md"
          className="relative flex flex-col items-center gap-6 py-20 text-center"
        >
          <PullQuoteText className="text-background">{quote}</PullQuoteText>
          <PullQuoteAttribution>
            <PullQuoteName className="text-background">{author}</PullQuoteName>
            {role && (
              <PullQuoteRole className="text-background/70">
                {role}
              </PullQuoteRole>
            )}
          </PullQuoteAttribution>
        </Container>
      </P.Section>
    )
  }

  // Gradient: glow orbs behind pull quote
  if (chrome === 'gradient' || chrome === 'editorial') {
    return (
      <P.Section className="relative overflow-hidden">
        {chrome === 'gradient' && <DecorBackground decor="glow" />}
        {chrome === 'editorial' && (
          <WatermarkDecor
            watermark={watermark ?? '"'}
            className="text-[20rem]"
          />
        )}
        <PullQuote variant={chrome === 'editorial' ? 'default' : variant}>
          <Container
            size="md"
            className="relative flex flex-col items-center gap-6 py-20 text-center"
          >
            <PullQuoteText>{quote}</PullQuoteText>
            <PullQuoteAttribution>
              <PullQuoteName>{author}</PullQuoteName>
              {role && <PullQuoteRole>{role}</PullQuoteRole>}
            </PullQuoteAttribution>
          </Container>
        </PullQuote>
      </P.Section>
    )
  }

  return (
    <PullQuote variant={variant}>
      <Container
        size="md"
        className="flex flex-col items-center gap-6 py-20 text-center"
      >
        <PullQuoteText>{quote}</PullQuoteText>
        <PullQuoteAttribution>
          <PullQuoteName>{author}</PullQuoteName>
          {role && <PullQuoteRole>{role}</PullQuoteRole>}
        </PullQuoteAttribution>
      </Container>
    </PullQuote>
  )
}

// ─── 33. logosMarquee ────────────────────────────────────────────────────
// Scrolling logo strip.

export const LogosMarquee = defineCapsule({
  name: 'LogosMarquee',
  description:
    'Logos marquee: scrolling strip of brand names. Animated social proof.',
  props: z.object({
    logos: z.array(z.string()).optional(),
    className: z.string().optional(),
    design: z.string().optional(),
  }),
  component: ({ props }) => {
    const intent = props.design
      ? parseDesignFromString(props.design)
      : DEFAULT_DESIGN
    return withDesign(intent, <LogosMarqueeInner {...props} />)
  },
})

function LogosMarqueeInner(props: Record<string, unknown>) {
  const logos = (props.logos as string[]) ?? [
    'Brand 1',
    'Brand 2',
    'Brand 3',
    'Brand 4',
    'Brand 5',
  ]
  return (
    <P.Section className="border-y border-border py-6">
      <P.Divider variant="marquee" text={logos.join(' ✦ ')} />
    </P.Section>
  )
}

// ─── 34. contentTabs ─────────────────────────────────────────────────────
// Tabbed content sections.

export const ContentTabs = defineCapsule({
  name: 'ContentTabs',
  description:
    'Content tabs: tabbed sections with label + content. For feature切换, documentation, product details.',
  props: z.object({
    heading: z.string().optional(),
    tabs: z
      .array(
        z.object({
          label: z.string(),
          content: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
    design: z.string().optional(),
  }),
  component: ({ props }) => {
    const intent = props.design
      ? parseDesignFromString(props.design)
      : DEFAULT_DESIGN
    return withDesign(intent, <ContentTabsInner {...props} />)
  },
})

function ContentTabsInner(props: Record<string, unknown>) {
  const heading = (props.heading as string) ?? 'Details'
  const tabs = (props.tabs as Array<{ label: string; content: string }>) ?? [
    { label: 'Overview', content: 'Overview content.' },
    { label: 'Specs', content: 'Specs content.' },
    { label: 'FAQ', content: 'FAQ content.' },
  ]
  return (
    <P.Section>
      <P.Container size="md" className="flex flex-col gap-12">
        <P.Heading level="h2" text={heading} />
        <div className="flex flex-col gap-4">
          <div className="flex gap-1 border-b border-border">
            {tabs.map((tab, i) => (
              <button
                key={i}
                className="border-b-2 border-transparent px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div>
            <P.Text variant="body" text={tabs[0]?.content ?? ''} />
          </div>
        </div>
      </P.Container>
    </P.Section>
  )
}

// ─── 35. searchBar ───────────────────────────────────────────────────────
// Search input with filters.

export const SearchBar = defineCapsule({
  name: 'SearchBar',
  description:
    'Search bar: heading + search input + optional filter chips. For directories, job boards, marketplaces.',
  props: z.object({
    heading: z.string().optional(),
    placeholder: z.string().optional(),
    filters: z.array(z.string()).optional(),
    className: z.string().optional(),
    design: z.string().optional(),
  }),
  component: ({ props }) => {
    const intent = props.design
      ? parseDesignFromString(props.design)
      : DEFAULT_DESIGN
    return withDesign(intent, <SearchBarInner {...props} />)
  },
})

function SearchBarInner(props: Record<string, unknown>) {
  const heading = (props.heading as string) ?? 'Search'
  const placeholder = (props.placeholder as string) ?? 'Search...'
  const filters = (props.filters as string[]) ?? ['All', 'Recent', 'Popular']
  return (
    <P.Section className="border-b border-border">
      <P.Container size="md" className="flex flex-col gap-6">
        <P.Heading level="h2" text={heading} />
        <input
          type="text"
          placeholder={placeholder}
          className="min-h-12 border border-border bg-background px-4 text-sm text-foreground focus:border-primary focus:outline-none"
        />
        <div className="flex gap-2">
          {filters.map((f, i) => (
            <button
              key={i}
              className="border border-border px-3 py-1 text-xs font-medium text-muted-foreground hover:bg-muted"
            >
              {f}
            </button>
          ))}
        </div>
      </P.Container>
    </P.Section>
  )
}

// ─── 36. eventSchedule ───────────────────────────────────────────────────
// Schedule/list with times.

export const EventSchedule = defineCapsule({
  name: 'EventSchedule',
  description:
    'Event schedule: time + title + optional description rows. For agendas, schedules, lineups.',
  props: z.object({
    heading: z.string().optional(),
    events: z
      .array(
        z.object({
          time: z.string(),
          title: z.string(),
          description: z.string().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
    design: z.string().optional(),
  }),
  component: ({ props }) => {
    const intent = props.design
      ? parseDesignFromString(props.design)
      : DEFAULT_DESIGN
    return withDesign(intent, <EventScheduleInner {...props} />)
  },
})

function EventScheduleInner(props: Record<string, unknown>) {
  const heading = (props.heading as string) ?? 'Schedule'
  const events = (props.events as Array<{
    time: string
    title: string
    description?: string
  }>) ?? [
    { time: '09:00', title: 'Opening', description: 'Welcome' },
    { time: '10:00', title: 'Keynote', description: 'Main talk' },
    { time: '12:00', title: 'Lunch' },
  ]
  return (
    <P.Section>
      <P.Container size="md" className="flex flex-col gap-12">
        <P.Heading level="h2" text={heading} />
        <div className="flex flex-col gap-0 border-l border-t border-border">
          {events.map((event, i) => (
            <div
              key={i}
              className="flex items-baseline gap-6 border-b border-r border-border bg-card p-4"
            >
              <span className="font-mono text-sm font-semibold tabular-nums text-primary">
                {event.time}
              </span>
              <div>
                <span className="font-medium text-foreground">
                  {event.title}
                </span>
                {event.description && (
                  <span className="ml-3 text-sm text-muted-foreground">
                    {event.description}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </P.Container>
    </P.Section>
  )
}

// ─── 37. productGrid ─────────────────────────────────────────────────────
// Grid of product cards with price.

export const ProductGrid = defineCapsule({
  name: 'ProductGrid',
  description:
    'Product grid: cards with image, name, price, and optional rating. For stores, shops, ecommerce.',
  props: z.object({
    heading: z.string().optional(),
    products: z
      .array(
        z.object({
          name: z.string(),
          price: z.string(),
          imageAlt: z.string().optional(),
          imageSrc: z.string().optional(),
        }),
      )
      .optional(),
    cols: z.number().optional(),
    className: z.string().optional(),
    design: z.string().optional(),
  }),
  component: ({ props }) => {
    const intent = props.design
      ? parseDesignFromString(props.design)
      : DEFAULT_DESIGN
    return withDesign(intent, <ProductGridInner {...props} />)
  },
})

function ProductGridInner(props: Record<string, unknown>) {
  const heading = (props.heading as string) ?? 'Products'
  const products = (props.products as Array<{
    name: string
    price: string
    imageAlt?: string
    imageSrc?: string
  }>) ?? [
    {
      name: 'Linen Throw',
      price: '$29',
      imageAlt:
        'Soft beige linen throw blanket draped over a minimalist wooden chair in natural light',
    },
    {
      name: 'Ceramic Vase',
      price: '$49',
      imageAlt:
        'Handcrafted matte white ceramic vase with organic curves on a marble surface',
    },
    {
      name: 'Walnut Bowl',
      price: '$99',
      imageAlt:
        'Hand-carved walnut wood bowl with rich grain pattern on a linen tablecloth',
    },
    {
      name: 'Brass Candleholder',
      price: '$15',
      imageAlt:
        'Minimalist brushed brass candleholder with a single lit taper candle',
    },
  ]
  const cols = (props.cols as number) ?? 4
  return (
    <P.Section>
      <P.Container size="xl" className="flex flex-col gap-12">
        <P.Heading level="h2" text={heading} />
        <P.Grid cols={cols}>
          {products.map((p, i) => (
            <P.Card
              key={i}
              title={p.name}
              imageAlt={p.imageAlt ?? p.name}
              imageUrl={p.imageSrc}
            >
              <span className="mt-2 block font-mono text-lg font-bold tabular-nums text-primary">
                {p.price}
              </span>
            </P.Card>
          ))}
        </P.Grid>
      </P.Container>
    </P.Section>
  )
}

// ─── 38. teamShowcase ────────────────────────────────────────────────────
// Person cards with bios (larger than personGrid).

export const TeamShowcase = defineCapsule({
  name: 'TeamShowcase',
  description:
    'Team showcase: larger person cards with photo, name, role, and bio. More detail than personGrid.',
  props: z.object({
    heading: z.string().optional(),
    people: z
      .array(
        z.object({
          name: z.string(),
          role: z.string().optional(),
          bio: z.string().optional(),
          imageAlt: z.string().optional(),
          imageSrc: z.string().optional(),
        }),
      )
      .optional(),
    cols: z.number().optional(),
    chrome: z
      .enum(['none', 'hairline', 'brutalist', 'terminal', 'editorial'])
      .optional(),
    className: z.string().optional(),
    design: z.string().optional(),
  }),
  component: ({ props }) => {
    const intent = props.design
      ? parseDesignFromString(props.design)
      : DEFAULT_DESIGN
    return withDesign(intent, <TeamShowcaseInner {...props} />)
  },
})

function TeamShowcaseInner(props: Record<string, unknown>) {
  const heading = (props.heading as string) ?? 'Our team'
  const people = (props.people as Array<{
    name: string
    role?: string
    bio?: string
    imageAlt?: string
    imageSrc?: string
  }>) ?? [
    {
      name: 'Solvej Madsen',
      role: 'Founding Partner',
      bio: 'Solvej leads design direction with a focus on daylight, material honesty, and the rituals of daily life.',
      imageAlt:
        'Professional headshot of a smiling woman with shoulder-length brown hair in a minimalist studio',
    },
    {
      name: 'Erik Bjørnsson',
      role: 'Founding Partner',
      bio: 'Erik oversees technical execution and construction documentation, ensuring every detail is built as drawn.',
      imageAlt:
        'Professional headshot of a man with short dark hair and a navy blazer in a minimalist studio',
    },
  ]
  const cols = (props.cols as number) ?? 2
  const chrome = (props.chrome as ChromeVariant) ?? 'none'

  // Editorial: asymmetric ledger — first person featured large with bio,
  // rest in smaller cells. Grayscale portraits with hover color reveal,
  // ghost numerals, mono labels, hairline borders, oversized watermark.
  if (chrome === 'editorial') {
    const [first, ...rest] = people
    return (
      <P.Section className="relative overflow-hidden">
        <GraphPaper className="inset-0" />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-8 right-0 select-none font-serif text-[8rem] font-extralight leading-none text-foreground/[0.04] sm:text-[12rem] lg:text-[18rem]"
        >
          {heading.slice(0, 1).toUpperCase()}
        </span>
        <P.Container size="xl" className="relative">
          <EditorialSectionHeader
            metaLabel="Team"
            heading={heading}
            description=""
          />
          {first && (
            <div className="mb-px border-l border-t border-border">
              <div className="grid grid-cols-1 border-r border-b border-border md:grid-cols-2">
                <div className="relative overflow-hidden border-b border-border md:border-b-0 md:border-r">
                  <P.ImageBlock
                    alt={first.imageAlt ?? first.name}
                    src={first.imageSrc}
                    className="aspect-[4/5] w-full object-cover grayscale transition-all duration-500 hover:grayscale-0"
                  />
                  <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between border-t border-background/20 bg-background/80 px-4 py-2 backdrop-blur-sm">
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/70">
                      {first.name}
                    </span>
                    <span className="font-mono text-[10px] text-foreground/40">
                      fig. 01
                    </span>
                  </div>
                </div>
                <div className="relative flex flex-col justify-end p-8 lg:p-12">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute right-6 top-6 font-extralight text-7xl leading-none text-foreground/[0.06]"
                  >
                    01
                  </span>
                  <span className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    {first.role ?? 'Principal'}
                  </span>
                  <h3 className="text-3xl font-light tracking-tight text-foreground lg:text-4xl">
                    {first.name}
                  </h3>
                  {first.bio && (
                    <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
                      {first.bio}
                    </p>
                  )}
                  <div className="mt-6 h-px w-16 bg-border" />
                </div>
              </div>
            </div>
          )}
          {rest.length > 0 && (
            <div className="grid grid-cols-1 border-l border-r border-b border-border md:grid-cols-2">
              {rest.map((p, i) => (
                <div
                  key={i}
                  className="group relative border-b border-border p-8 last:border-b-0 md:border-b md:[&:nth-last-child(-n+2)]:border-b-0 md:[&:nth-child(odd)]:border-r"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                      {String(i + 2).padStart(2, '0')}
                    </span>
                    <span
                      aria-hidden="true"
                      className="font-extralight text-3xl text-foreground/[0.06]"
                    >
                      {String(i + 2).padStart(2, '0')}
                    </span>
                  </div>
                  <P.ImageBlock
                    alt={p.imageAlt ?? p.name}
                    src={p.imageSrc}
                    className="mb-5 aspect-[4/5] w-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0"
                  />
                  <h3 className="text-2xl font-light tracking-tight text-foreground">
                    {p.name}
                  </h3>
                  {p.role && (
                    <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                      {p.role}
                    </p>
                  )}
                  {p.bio && (
                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                      {p.bio}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </P.Container>
      </P.Section>
    )
  }

  return (
    <P.Section>
      <P.Container size="xl" className="flex flex-col gap-12">
        <P.Heading level="h2" text={heading} />
        <P.Grid cols={cols}>
          {people.map((p, i) => (
            <P.Card
              key={i}
              title={p.name}
              imageAlt={p.imageAlt ?? p.name}
              imageUrl={p.imageSrc}
            >
              {p.role && (
                <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
                  {p.role}
                </p>
              )}
              {p.bio && (
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {p.bio}
                </p>
              )}
            </P.Card>
          ))}
        </P.Grid>
      </P.Container>
    </P.Section>
  )
}

// ─── 39. projectGallery ──────────────────────────────────────────────────
// Portfolio items with images + categories.

export const ProjectGallery = defineCapsule({
  name: 'ProjectGallery',
  description:
    'Project gallery: grid of project cards with image, title, and optional category. For portfolios, work showcases.',
  props: z.object({
    heading: z.string().optional(),
    projects: z
      .array(
        z.object({
          title: z.string(),
          category: z.string().optional(),
          imageAlt: z.string().optional(),
          imageSrc: z.string().optional(),
        }),
      )
      .optional(),
    cols: z.number().optional(),
    chrome: z
      .enum([
        'none',
        'hairline',
        'brutalist',
        'terminal',
        'editorial',
        'gradient',
      ])
      .optional(),
    index: z.string().optional(),
    className: z.string().optional(),
    design: z.string().optional(),
  }),
  component: ({ props }) => {
    const intent = props.design
      ? parseDesignFromString(props.design)
      : DEFAULT_DESIGN
    return withDesign(intent, <ProjectGalleryInner {...props} />)
  },
})

function ProjectGalleryInner(props: Record<string, unknown>) {
  const heading = (props.heading as string) ?? 'Our work'
  const projects = (props.projects as Array<{
    title: string
    category?: string
    imageAlt?: string
    imageSrc?: string
  }>) ?? [
    {
      title: 'Villa Kyst',
      category: 'Residential — 2023',
      imageAlt:
        'Minimalist coastal villa with floor-to-ceiling glass windows overlooking the ocean at golden hour',
    },
    {
      title: 'Nordic Contemporary',
      category: 'Cultural — 2022',
      imageAlt:
        'Contemporary art museum interior with dramatic spiral staircase and skylight illumination',
    },
    {
      title: 'Fjord Headquarters',
      category: 'Commercial — 2023',
      imageAlt:
        'Minimalist office workspace with natural wood finishes and abundant daylight through large windows',
    },
  ]
  const cols = (props.cols as number) ?? 3
  const chrome = (props.chrome as ChromeVariant) ?? 'editorial'
  const index = props.index as string | undefined

  // ── Editorial: ArchitectureFirmWork-style staggered grid with grayscale photo plates ──
  if (chrome === 'editorial') {
    return (
      <P.Section className="relative overflow-hidden py-16 sm:py-24 lg:py-28">
        <Container>
          <EditorialSectionHeader
            index="01 /"
            eyebrow="Selected Work"
            heading={heading}
            description="A selection of completed and ongoing work spanning residential, commercial, and cultural typologies."
            metaLabel="Projects"
            meta={String(projects.length).padStart(2, '0')}
          />
          <div
            className={cn(
              'grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-2 lg:gap-x-8 lg:gap-y-16',
              cols === 3 && 'lg:grid-cols-3',
              cols === 4 && 'lg:grid-cols-4',
            )}
          >
            {projects.map((p, i) => (
              <div
                key={i}
                className={cn(
                  'group block w-full',
                  // Staggered plate rhythm: every second column drops.
                  i % 2 === 1 && 'translate-y-6 lg:translate-y-0',
                  i % 3 === 1 && 'lg:translate-y-10',
                )}
              >
                {/* Mono drawing-index row above the plate. */}
                <span className="mb-3 flex items-baseline justify-between gap-2">
                  <MonoTag className="text-foreground">
                    Proj. {String(i + 1).padStart(2, '0')}
                  </MonoTag>
                  {p.category && (
                    <MonoTag className="hidden text-muted-foreground/60 sm:inline">
                      {p.category.split('—')[0]?.trim()}
                    </MonoTag>
                  )}
                </span>
                <EditorialImagePlate
                  alt={p.imageAlt ?? p.title}
                  src={p.imageSrc}
                  aspectClass="aspect-[4/5]"
                />
                <div className="mt-4">
                  <h3 className="text-base font-light tracking-tight text-foreground sm:text-lg">
                    {p.title}
                  </h3>
                  {p.category && (
                    <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                      {p.category}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </P.Section>
    )
  }

  // ── Brutalist: staggered grid with brutalist image plates, sticker badges ──
  if (chrome === 'brutalist') {
    return (
      <P.Section className="overflow-hidden border-b-2 border-foreground bg-muted/40 py-14 sm:py-20 lg:py-28">
        <Container size="xl" className="px-6">
          <div className="mb-12 flex flex-col justify-between gap-6 sm:mb-16 md:flex-row md:items-end">
            <div>
              <MonoTag aria-hidden="true">
                {index ?? '04 / Selected work'}
              </MonoTag>
              <h2 className="mt-3 text-4xl font-black uppercase leading-[0.95] tracking-tighter sm:text-6xl">
                {heading}
              </h2>
            </div>
          </div>
          <div
            className={cn(
              'grid gap-10 sm:gap-x-10 sm:gap-y-12 md:gap-x-12',
              cols === 2 && 'md:grid-cols-2',
              cols === 3 && 'md:grid-cols-3',
            )}
          >
            {projects.map((p, i) => (
              <div
                key={i}
                className={cn(
                  'group relative',
                  i % 2 === 1 && 'md:translate-y-12',
                )}
              >
                <BrutalistImagePlate
                  alt={p.imageAlt ?? p.title}
                  src={p.imageSrc}
                  sticker={p.category}
                  stickerRotate={i % 2 === 0 ? 'rotate-3' : '-rotate-3'}
                  aspectClass="aspect-[4/3]"
                  className={microRotate(i)}
                />
                <div className="mt-5 flex items-start gap-4">
                  <MonoTag
                    aria-hidden="true"
                    className="mt-1 shrink-0 text-foreground/40"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </MonoTag>
                  <div>
                    <h3 className="mb-1 text-xl font-black uppercase tracking-tight sm:text-2xl">
                      {p.title}
                    </h3>
                    {p.category && (
                      <p className="text-sm text-muted-foreground">
                        {p.category}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </P.Section>
    )
  }

  return (
    <P.Section>
      <P.Container size="xl" className="flex flex-col gap-12">
        <P.Heading level="h2" text={heading} />
        <P.Grid cols={cols}>
          {projects.map((p, i) => (
            <P.Card
              key={i}
              title={p.title}
              imageAlt={p.imageAlt ?? p.title}
              imageUrl={p.imageSrc}
            >
              {p.category && (
                <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  {p.category}
                </p>
              )}
            </P.Card>
          ))}
        </P.Grid>
      </P.Container>
    </P.Section>
  )
}

// ─── 40. donationBand ────────────────────────────────────────────────────
// Donation / support CTA with amount selection.

export const DonationBand = defineCapsule({
  name: 'DonationBand',
  description:
    'Donation band: heading + preset amount buttons + custom amount input. For nonprofits, fundraising.',
  props: z.object({
    heading: z.string().optional(),
    subheading: z.string().optional(),
    amounts: z.array(z.string()).optional(),
    className: z.string().optional(),
    design: z.string().optional(),
  }),
  component: ({ props }) => {
    const intent = props.design
      ? parseDesignFromString(props.design)
      : DEFAULT_DESIGN
    return withDesign(intent, <DonationBandInner {...props} />)
  },
})

function DonationBandInner(props: Record<string, unknown>) {
  const heading = (props.heading as string) ?? 'Support us'
  const subheading = (props.subheading as string) ?? 'Every contribution helps.'
  const amounts = (props.amounts as string[]) ?? ['$10', '$25', '$50', '$100']
  return (
    <P.Section className="border-y border-border">
      <P.Container
        size="sm"
        className="flex flex-col items-center gap-6 text-center"
      >
        <P.Heading level="h2" text={heading} />
        <P.Text variant="lead" text={subheading} />
        <div className="flex flex-wrap justify-center gap-3">
          {amounts.map((amt, i) => (
            <P.Button
              key={i}
              label={amt}
              variant={i === 1 ? 'primary' : 'ghost'}
            />
          ))}
        </div>
        <P.Form
          fields={[
            {
              label: 'Custom amount',
              type: 'text',
              placeholder: 'Enter amount',
            },
          ]}
          submitLabel="Donate"
          className="w-full max-w-xs"
        />
      </P.Container>
    </P.Section>
  )
}

// ─── Helper: parse design from string prop ───────────────────────────────

function parseDesignFromString(s: string): DesignIntent {
  return parseDesignLine(s.startsWith('@design') ? s : `@design ${s}`)
}
