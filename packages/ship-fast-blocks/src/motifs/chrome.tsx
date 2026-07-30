/**
 * ChromeSystem — shared decor/chrome helpers extracted from 1,063 hand-crafted
 * capsules. These give motifs the compositional creativity that was lost when
 * vertical-specific capsules were consolidated into 40 generic motifs.
 *
 * The `chrome` prop on each motif selects a visual personality:
 * hairline — collapsed-border grids, mono labels, figure indices, tick bars
 * brutalist — border-2, hard shadows, rotated stickers, uppercase tracking
 * terminal — terminal window chrome, mono labels, $ prompts, exit 0
 * editorial — serif headings, watermarks, image caption bars, figure indices
 * gradient — glow orbs, gradient highlights, pulsing dots
 *
 * All decor is aria-hidden and pointer-events-none. Colors flow through theme
 * tokens so they adapt to light/dark and generated themes automatically.
 */
import * as React from 'react'
import { cn } from '#/lib/utils.ts'
import { useFormSubmit } from '#/lib/use-form-submit.ts'
import {
 DotGrid,
 GraphPaper,
 Watermark,
 MonoTag,
} from '#/section-kit/Decor.tsx'

// Re-export for use by motifs/index.tsx
export { GraphPaper, MonoTag }
import { Marquee } from '#/section-kit/motion.tsx'
import { ImageBlock } from '#/primitives/index.tsx'

// ─── Types ──────────────────────────────────────────────────────────────

export type ChromeVariant =
 | 'none'
 | 'hairline'
 | 'brutalist'
 | 'terminal'
 | 'editorial'
 | 'gradient'

export type DecorVariant = 'none' | 'dot-grid' | 'graph-paper' | 'glow'

export interface ChromeProps {
 chrome?: ChromeVariant
 index?: string
 watermark?: string
 decor?: DecorVariant
}

// ─── TickBar ─────────────────────────────────────────────────────────────

const TICK_WIDTHS = ['w-8', 'w-5', 'w-10', 'w-6', 'w-7', 'w-4']

/** Mini tick-bar motif — primary tick + two ghost ticks. From AnalyticsBento. */
export function TickBar({
 index = 0,
 className,
}: {
 index?: number
 className?: string
}) {
 return (
 <span
 aria-hidden="true"
 className={cn('flex items-center gap-1', className)}>
 <span
 className={cn(
 'h-1 bg-primary',
 TICK_WIDTHS[index % TICK_WIDTHS.length],
 )}
 />
 <span className="h-1 w-1 bg-border" />
 <span className="h-1 w-1 bg-border" />
 </span>
 )
}

// ─── SparkBars ───────────────────────────────────────────────────────────

const SPARK_HEIGHTS = [
 'h-2',
 'h-4',
 'h-3',
 'h-6',
 'h-5',
 'h-8',
 'h-7',
 'h-10',
 'h-6',
 'h-9',
 'h-12',
 'h-8',
]

/** Vertical spark-bar mini-chart. From AnalyticsHero dashboard panel. */
export function SparkBars({ className }: { className?: string }) {
 return (
 <div
 aria-hidden="true"
 className={cn('flex h-16 items-end gap-px pt-3', className)}>
 {SPARK_HEIGHTS.map((h, i) => (
 <span
 key={i}
 className={cn(
 'w-full',
 h,
 i === SPARK_HEIGHTS.length - 1 ? 'bg-primary' : 'bg-foreground/15',
 )}
 />
 ))}
 </div>
 )
}

// ─── GlowOrbs ────────────────────────────────────────────────────────────

/** Pulsing blurred glow orbs. From AgencyHero. */
export function GlowOrbs({ className }: { className?: string }) {
 return (
 <div
 aria-hidden="true"
 className={cn('absolute inset-0 opacity-20', className)}>
 <div className="absolute left-1/4 top-1/4 size-96 animate-pulse rounded-full d-radius-lock bg-primary/30 blur-3xl" />
 <div className="absolute bottom-1/4 right-1/4 size-80 animate-pulse rounded-full d-radius-lock bg-accent/20 blur-3xl [animation-delay:2s]" />
 </div>
 )
}

// ─── GhostNumeral ────────────────────────────────────────────────────────

/** Giant ghost numeral watermark in a cell. From AnalyticsBento/DevToolSteps. */
export function GhostNumeral({
 numeral,
 className,
}: {
 numeral: string
 className?: string
}) {
 return (
 <span
 aria-hidden="true"
 className={cn(
 'pointer-events-none absolute right-4 top-3 select-none font-mono text-6xl font-bold tabular-nums leading-none text-foreground/[0.05]',
 className,
 )}>
 {numeral}
 </span>
 )
}

// ─── TerminalChrome ──────────────────────────────────────────────────────

/** Terminal window frame with traffic lights and title bar. From DevToolSteps. */
export function TerminalChrome({
 title = '~/quickstart',
 children,
 className,
}: {
 title?: string
 children: React.ReactNode
 className?: string
}) {
 return (
 <div
 className={cn(
 'overflow-hidden border border-foreground/20 bg-card',
 className,
 )}>
 <div className="flex items-center gap-2 border-b border-border bg-muted px-4 py-3">
 <div className="flex gap-1.5" aria-hidden="true">
 <div className="size-2 bg-foreground/25" />
 <div className="size-2 bg-foreground/25" />
 <div className="size-2 bg-foreground/50" />
 </div>
 <span className="ml-2 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
 {title}
 </span>
 <span
 aria-hidden="true"
 className="ml-auto font-mono text-[11px] text-muted-foreground/60">
 — sh
 </span>
 </div>
 {children}
 <div
 aria-hidden="true"
 className="flex items-center justify-between border-t border-border px-6 py-3 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground/70">
 <span className="text-chart-1">[ done ]</span>
 <span>exit 0</span>
 </div>
 </div>
 )
}

// ─── ImageCaptionBar ─────────────────────────────────────────────────────

/** Image caption bar with mono caption + figure index. From AgencyStats. */
export function ImageCaptionBar({
 caption,
 figure = 'fig. 01',
 className,
}: {
 caption: string
 figure?: string
 className?: string
}) {
 return (
 <div
 className={cn(
 'flex items-center justify-between gap-4 border-t border-border bg-background px-4 py-2.5',
 className,
 )}>
 <MonoTag className="truncate text-[10px] text-foreground/70">
 {caption}
 </MonoTag>
 <MonoTag
 aria-hidden="true"
 className="shrink-0 text-[10px] text-foreground/40">
 {figure}
 </MonoTag>
 </div>
 )
}

// ─── RotatedSticker ──────────────────────────────────────────────────────

/** Rotated sticker chip for"Popular" / category tags. From AeoPricing/AgencyWork. */
export function RotatedSticker({
 children,
 rotate = 'rotate-3',
 className,
}: {
 children: React.ReactNode
 rotate?: string
 className?: string
}) {
 return (
 <span
 className={cn(
 'absolute -top-3 right-5 z-10 inline-flex items-center whitespace-nowrap bg-primary font-mono text-[10px] font-bold uppercase tracking-[0.12em] shadow-[3px_3px_0_0] shadow-background/30',
 rotate,
 className,
 )}>
 {children}
 </span>
 )
}

// ─── SlantedSeam ─────────────────────────────────────────────────────────

/** Slanted top seam — diagonal clip-path for section transitions. From AgencyStats. */
export function slantedSeamClass(direction: 'top' | 'bottom' = 'top') {
 if (direction === 'top') {
 return '[clip-path:polygon(0_0,100%_3rem,100%_100%,0_100%)]'
 }
 return '[clip-path:polygon(0_0,100%_0,100%_calc(100%-3rem),0_100%)]'
}

// ─── SectionEyebrow ──────────────────────────────────────────────────────

/**
 * Section eyebrow — mono index label that sits above section headings.
 * Renders different formats based on chrome variant.
 * From every deleted capsule:"01 / Services","03 / Pricing","[ quickstart ]"
 */
export function SectionEyebrow({
 index,
 chrome = 'none',
 className,
}: {
 index?: string
 chrome?: ChromeVariant
 className?: string
}) {
 if (!index) return null

 if (chrome === 'terminal') {
 return (
 <MonoTag
 aria-hidden="true"
 tone="faint"
 className={cn('mb-4 block', className)}>
 <span className="text-primary">$ </span>
 {index}
 </MonoTag>
 )
 }

 if (chrome === 'brutalist') {
 return (
 <MonoTag
 aria-hidden="true"
 className={cn('mb-4 block font-bold tracking-[0.18em]', className)}>
 {index}
 </MonoTag>
 )
 }

 return (
 <MonoTag aria-hidden="true" className={cn('mb-4 block', className)}>
 {index}
 </MonoTag>
 )
}

// ─── DecorBackground ─────────────────────────────────────────────────────

/** Background decor texture — dot grid, graph paper, or glow orbs. */
export function DecorBackground({
 decor,
 className,
}: {
 decor: DecorVariant
 className?: string
}) {
 if (decor === 'dot-grid') {
 return <DotGrid className={cn('inset-0', className)} tone="faint" />
 }
 if (decor === 'graph-paper') {
 return (
 <GraphPaper
 className={cn('inset-y-0 right-0 hidden w-[45%] lg:block', className)}
 />
 )
 }
 if (decor === 'glow') {
 return <GlowOrbs className={className} />
 }
 return null
}

// ─── WatermarkDecor ──────────────────────────────────────────────────────

/** Watermark decor — ghost text positioned absolutely. */
export function WatermarkDecor({
 watermark,
 className,
}: {
 watermark?: string
 className?: string
}) {
 if (!watermark) return null
 return (
 <Watermark
 className={cn(
 '-top-12 right-0 text-[6rem] sm:text-[10rem] lg:text-[15rem]',
 className,
 )}>
 {watermark}
 </Watermark>
 )
}

// ─── ChromeBorder classes ────────────────────────────────────────────────

/** Border classes for cards/items based on chrome variant. */
export function chromeBorderClass(chrome: ChromeVariant): string {
 switch (chrome) {
 case 'hairline':
 return 'rounded-none border-0 border-b border-r border-border bg-transparent transition-colors duration-150 hover:border-foreground/30 hover:bg-muted/30'
 case 'brutalist':
 return 'rounded-none border-2 border-foreground bg-background shadow-[8px_8px_0_0] shadow-foreground transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[12px_12px_0_0] hover:shadow-foreground'
 case 'terminal':
 return 'rounded-none border-0 border-b border-r border-border bg-transparent'
 case 'editorial':
 return 'rounded-none border border-border bg-card'
 default:
 return ''
 }
}

/** Grid container classes for collapsed-border layout. */
export function chromeGridClass(chrome: ChromeVariant): string {
 switch (chrome) {
 case 'hairline':
 case 'terminal':
 return 'gap-0 border-l border-t border-border'
 case 'brutalist':
 return 'gap-4'
 default:
 return ''
 }
}

/** Section heading title classes based on chrome variant. */
export function chromeHeadingClass(chrome: ChromeVariant): string {
 switch (chrome) {
 case 'brutalist':
 return 'text-4xl font-black uppercase leading-[0.95] tracking-tighter sm:text-6xl'
 case 'editorial':
 return 'text-4xl font-serif font-light tracking-tight leading-tight sm:text-5xl'
 case 'terminal':
 return 'text-3xl font-extrabold tracking-tight sm:text-4xl font-mono'
 default:
 return ''
 }
}

/** Card title classes based on chrome variant. */
export function chromeCardTitleClass(chrome: ChromeVariant): string {
 switch (chrome) {
 case 'terminal':
 return 'font-mono text-lg font-bold tracking-tight'
 case 'brutalist':
 return 'text-lg font-bold uppercase tracking-tight'
 default:
 return ''
 }
}

/** Index numeral for cards — mono padded number. */
export function CardIndex({
 index,
 chrome,
}: {
 index: number
 chrome: ChromeVariant
}) {
 const padded = String(index).padStart(2, '0')
 if (chrome === 'terminal') {
 return (
 <p
 aria-hidden="true"
 className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
 <span className="text-primary">$ </span>
 step {padded}
 </p>
 )
 }
 if (chrome === 'hairline' || chrome === 'editorial') {
 return (
 <span
 aria-hidden="true"
 className="font-mono text-[11px] font-semibold tabular-nums tracking-[0.2em] text-primary">
 {padded}
 </span>
 )
 }
 return null
}

/** Hairline divider between index and title. From FintechFeatures. */
export function IndexDivider({ chrome }: { chrome: ChromeVariant }) {
 if (chrome !== 'hairline' && chrome !== 'terminal') return null
 return (
 <div className="flex items-center gap-3">
 <span aria-hidden="true" className="h-px flex-1 bg-border" />
 </div>
 )
}

// ─── Artistic Image Components ──────────────────────────────────────────
// Extracted from deleted hand-crafted capsules (architecture-firm, agency,
// fashion, restaurant). These give motifs the artistic image treatments
// that were lost when vertical-specific capsules were consolidated.

/** Floating stat card overlapping a photo bottom-left. From ArchitectureFirm philosophy section. */
export function FloatingStatPhoto({
 alt,
 src,
 statValue = '15+',
 statLabel = 'Years of practice',
 className,
}: {
 alt: string
 src?: string
 statValue?: string
 statLabel?: string
 className?: string
}) {
 return (
 <div className={cn('relative', className)}>
 <ImageBlock
 alt={alt}
 src={src}
 rounded={false}
 className="h-auto w-full object-cover"
 />
 <div className="absolute -bottom-8 -left-8 hidden bg-background p-6 sm:block">
 <p className="text-3xl font-light text-foreground">{statValue}</p>
 <p className="mt-1 text-sm text-muted-foreground">{statLabel}</p>
 </div>
 </div>
 )
}

/** Photo with gradient glow behind it. From Agency stats/about band. */
export function GlowingPhoto({
 alt,
 src,
 className,
 glowClassName,
}: {
 alt: string
 src?: string
 className?: string
 glowClassName?: string
}) {
 return (
 <div className={cn('relative', className)}>
 <div
 aria-hidden="true"
 className={cn(
 'absolute -inset-4 bg-gradient-to-r from-primary/20 to-accent/20 blur-2xl',
 glowClassName,
 )}
 />
 <ImageBlock
 alt={alt}
 src={src}
 rounded={true}
 className="relative aspect-[4/3] w-full border border-border object-cover"
 />
 </div>
 )
}

/** Full-height facade photo for split heroes. From ArchitectureFirm hero. */
export function FullHeightPhoto({
 alt,
 src,
 className,
}: {
 alt: string
 src?: string
 className?: string
}) {
 return (
 <div
 className={cn(
 'absolute right-0 top-0 hidden h-full w-2/5 lg:block',
 className,
 )}>
 <ImageBlock
 alt={alt}
 src={src}
 rounded={false}
 className="size-full object-cover"
 />
 </div>
 )
}

/** Image with zoom-on-hover and optional overlay caption. From Agency work gallery. */
export function ImageZoomHover({
 alt,
 src,
 overlayLabel,
 className,
 aspectClass = 'aspect-[4/5]',
}: {
 alt: string
 src?: string
 overlayLabel?: string
 className?: string
 aspectClass?: string
}) {
 return (
 <div
 className={cn(
 'group relative overflow-hidden bg-muted',
 aspectClass,
 className,
 )}>
 <ImageBlock
 alt={alt}
 src={src}
 rounded={false}
 className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
 />
 {overlayLabel && (
 <div className="absolute inset-0 flex items-end bg-gradient-to-t from-background/60 to-transparent p-6 opacity-0 transition-opacity group-hover:opacity-100">
 <span className="rounded-full bg-accent/80 px-4 py-2 text-sm font-medium text-accent-foreground backdrop-blur">
 {overlayLabel}
 </span>
 </div>
 )}
 </div>
 )
}

/** Offset image tiles — two stacked images, second one offset. From MediaSplit story variant. */
export function OffsetImageTiles({
 alt,
 src,
 detailAlt,
 detailSrc,
 className,
}: {
 alt: string
 src?: string
 detailAlt?: string
 detailSrc?: string
 className?: string
}) {
 return (
 <div className={cn('relative', className)}>
 <div className="overflow-hidden">
 <ImageBlock
 alt={alt}
 src={src}
 rounded={false}
 className="h-full w-full object-cover"
 />
 </div>
 <div className="absolute -bottom-8 -right-8 hidden h-40 w-32 overflow-hidden border-4 border-background sm:block">
 <ImageBlock
 alt={detailAlt ?? `${alt} detail`}
 src={detailSrc}
 rounded={false}
 className="h-full w-full object-cover"
 />
 </div>
 </div>
 )
}

// ─── Subscriber / Waitlist Form Components ──────────────────────────────
// Extracted from deleted coming-soon, startup, and nonprofit capsules.

/** Countdown timer cells. From ComingSoon hero. */
export function CountdownTimer({
 cells = [
 { value: '00', label: 'Days' },
 { value: '00', label: 'Hours' },
 { value: '00', label: 'Minutes' },
 { value: '00', label: 'Seconds' },
 ],
 className,
}: {
 cells?: Array<{ value: string; label: string }>
 className?: string
}) {
 return (
 <div
 className={cn('flex flex-wrap justify-center gap-4 sm:gap-6', className)}
 aria-label="Time remaining until launch">
 {cells.map((unit) => (
 <div key={unit.label} className="flex flex-col items-center">
 <div className="flex size-16 items-center justify-center border border-border bg-card sm:size-20">
 <span className="text-2xl font-light text-card-foreground sm:text-3xl">
 {unit.value}
 </span>
 </div>
 <span className="mt-2 text-xs uppercase tracking-wider text-muted-foreground">
 {unit.label}
 </span>
 </div>
 ))}
 </div>
 )
}

/** Beautiful inline email capture form with mono styling. From ComingSoon hero. */
export function InlineEmailCapture({
 placeholder = 'Enter your email',
 submitLabel = 'Subscribe',
 disclaimer,
 className,
 formClassName,
}: {
 placeholder?: string
 submitLabel?: string
 disclaimer?: string
 className?: string
 formClassName?: string
}) {
 const { status, handleSubmit } = useFormSubmit()
 if (status === 'success') {
 return (
 <div className={cn('mx-auto max-w-md text-center', className)}>
 <p className="text-sm font-medium text-foreground">
 You're subscribed! Check your inbox to confirm.
 </p>
 </div>
 )
 }
 return (
 <div className={cn('mx-auto max-w-md', className)}>
 <form className={cn('flex flex-col gap-3 sm:flex-row', formClassName)} onSubmit={handleSubmit}>
 <label htmlFor="email-capture" className="sr-only">
 Email address
 </label>
 <input
 id="email-capture"
 type="email"
 name="email"
 required
 placeholder={placeholder}
 className="flex-1 border border-input bg-background px-5 py-3.5 text-sm text-foreground placeholder-muted-foreground transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring"
 />
 <button
 type="submit"
 disabled={status === 'pending'}
 className="whitespace-nowrap bg-primary px-8 py-3.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-70">
 {status === 'pending' ? 'Subscribing...' : submitLabel}
 </button>
 </form>
 {disclaimer && (
 <p className="mt-3 text-xs text-muted-foreground">{disclaimer}</p>
 )}
 </div>
 )
}

/** Rotated sticker badge for"Most Popular" /"New" tags. From AeoPricing. */
export function RotatedBadge({
 children,
 rotate = '-rotate-3',
 className,
}: {
 children: React.ReactNode
 rotate?: string
 className?: string
}) {
 return (
 <span
 className={cn(
 'inline-flex items-center whitespace-nowrap bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-[3px_3px_0_0] shadow-background/30',
 rotate,
 className,
 )}>
 {children}
 </span>
 )
}

/** Star rating row. From ComingSoon testimonials. */
export function StarRating({
 count = 5,
 className,
}: {
 count?: number
 className?: string
}) {
 return (
 <div
 className={cn('flex items-center gap-1', className)}
 aria-label={`${count} star rating`}>
 {Array.from({ length: count }).map((_, i) => (
 <svg
 key={i}
 className="size-4 text-primary"
 fill="currentColor"
 viewBox="0 0 20 20"
 aria-hidden="true">
 <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
 </svg>
 ))}
 </div>
 )
}

/** Quote mark icon. From ArchitectureFirm testimonials. */
export function QuoteMark({ className }: { className?: string }) {
 return (
 <div
 className={cn(
 'mb-4 grid size-12 place-items-center rounded-full d-radius-lock bg-primary/10',
 className,
 )}>
 <svg
 width="24"
 height="24"
 viewBox="0 0 24 24"
 fill="currentColor"
 className="text-primary"
 aria-hidden="true">
 <path d="M9.5 6C6.5 6 4 8.5 4 11.5V18h6.5v-6.5H7.5C7.5 9.6 8.4 8.5 9.5 8.5V6zm9 0c-3 0-5.5 2.5-5.5 5.5V18H19.5v-6.5h-3C16.5 9.6 17.4 8.5 18.5 8.5V6z" />
 </svg>
 </div>
 )
}

/** Asymmetric gallery grid with varying tile sizes. From Fashion/ArchitectureFirm galleries. */
export function AsymmetricGallery({
 images,
 className,
}: {
 images: Array<{
 alt: string
 src?: string
 caption?: string
 span?: 'wide' | 'tall' | 'normal'
 }>
 className?: string
}) {
 return (
 <div
 className={cn(
 'grid grid-cols-2 gap-4 md:grid-cols-3 lg:gap-6',
 className,
 )}>
 {images.map((img, i) => {
 const spanClass =
 img.span === 'wide'
 ? 'col-span-2 row-span-1'
 : img.span === 'tall'
 ? 'col-span-1 row-span-2'
 : 'col-span-1 row-span-1'
 return (
 <div
 key={i}
 className={cn('group relative overflow-hidden bg-muted', spanClass)}>
 <ImageZoomHover
 alt={img.alt}
 src={img.src}
 aspectClass="aspect-square"
 />
 {img.caption && (
 <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/80 to-transparent p-4">
 <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-background/90">
 {img.caption}
 </p>
 </div>
 )}
 </div>
 )
 })}
 </div>
 )
}

/** Marquee strip of logos/text scrolling. From Agency/ComingSoon logo strips. */
export function LogoMarquee({
 items,
 className,
}: {
 items: string[]
 className?: string
}) {
 return (
 <div
 className={cn(
 'flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-60 sm:gap-x-16 lg:gap-x-20',
 className,
 )}>
 {items.map((item, i) => (
 <span
 key={i}
 className="text-lg font-semibold tracking-tight text-muted-foreground sm:text-xl">
 {item}
 </span>
 ))}
 </div>
 )
}

// ─── Advanced Editorial Techniques (from capsule revamp playbook) ────────

/** Hollow outlined display text — the highlight phrase rendered as transparent
 * fill with a primary-token stroke. From AboutHero. */
export function HollowHighlight({
 children,
 className,
}: {
 children: React.ReactNode
 className?: string
}) {
 return (
 <span
 className={cn(
 'text-transparent [-webkit-text-stroke:2px_var(--color-primary,currentColor)]',
 className,
 )}>
 {children}
 </span>
 )
}

/** Tilted solid primary sticker block for a highlight phrase inside a slab
 * headline. From AgencyHero. */
export function StickerHighlight({
 children,
 className,
 rotate = '-rotate-1',
}: {
 children: React.ReactNode
 className?: string
 rotate?: string
}) {
 return (
 <span
 className={cn(
 'my-1 inline-block bg-primary px-3 pb-1 text-primary-foreground sm:px-5',
 rotate,
 className,
 )}>
 {children}
 </span>
 )
}

/** Vertical writing-mode mono scroll rail on the left edge (desktop only).
 * From AboutHero. Collapses to a horizontal strip on mobile via caller. */
export function VerticalScrollRail({
 label = 'Scroll',
 className,
}: {
 label?: string
 className?: string
}) {
 return (
 <div
 aria-hidden="true"
 className={cn(
 'pointer-events-none absolute left-5 top-1/2 hidden -translate-y-1/2 flex-col items-center gap-4 lg:flex',
 className,
 )}>
 <span className="h-14 w-px bg-border" />
 <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground [writing-mode:vertical-rl]">
 {label}
 </span>
 <span className="h-14 w-px bg-border" />
 </div>
 )
}

/** Horizontal mono scroll strip — the mobile/tablet stand-in for the vertical
 * rail. From AboutHero. */
export function HorizontalScrollStrip({
 label = 'Scroll',
 className,
}: {
 label?: string
 className?: string
}) {
 return (
 <div
 aria-hidden="true"
 className={cn(
 'mt-10 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground lg:hidden',
 className,
 )}>
 <span className="h-px w-10 bg-border" />
 <span className="shrink-0">{label}</span>
 <span className="h-px flex-1 bg-border" />
 </div>
 )
}

/** Fading dot-grid backdrop positioned absolutely. From AgencyHero/AboutHero. */
export function FadingDotGrid({
 className,
 density = 'loose',
 fade = 'left',
}: {
 className?: string
 density?: 'tight' | 'default' | 'loose'
 fade?: 'none' | 'left' | 'right' | 'bottom'
}) {
 return <DotGrid density={density} fade={fade} className={className} />
}

/** Giant chapter watermark numeral/word. From AboutHero (text-[22rem]). */
export function ChapterWatermark({
 children,
 className,
}: {
 children: React.ReactNode
 className?: string
}) {
 return (
 <Watermark
 className={cn(
 '-top-8 right-0 text-[11rem] sm:text-[16rem] lg:-top-14 lg:text-[22rem]',
 className,
 )}>
 {children}
 </Watermark>
 )
}

/** Sticker pill with 2px border, hard offset shadow, pulsing dot, slight
 * rotation. From AgencyHero availability badge. */
export function StickerPill({
 children,
 className,
 rotate = '-rotate-2',
 pulse = true,
}: {
 children: React.ReactNode
 className?: string
 rotate?: string
 pulse?: boolean
}) {
 return (
 <span
 className={cn(
 'inline-flex items-center gap-2 rounded-full border-2 border-foreground bg-background px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-foreground shadow-[4px_4px_0_0] shadow-foreground',
 rotate,
 className,
 )}>
 {pulse && (
 <span
 aria-hidden="true"
 className="size-2 animate-pulse rounded-full d-radius-lock bg-primary"
 />
 )}
 {children}
 </span>
 )
}

/** Block CTA with 2px border, hard offset shadow, and mechanical press
 * feedback. From AgencyHero. */
export function BlockCta({
 children,
 variant = 'primary',
 className,
}: {
 children: React.ReactNode
 variant?: 'primary' | 'outline'
 className?: string
}) {
 return (
 <span
 className={cn(
 'inline-flex items-center justify-center gap-2 rounded-none border-2 border-foreground px-7 py-3.5 font-mono text-xs font-bold uppercase tracking-[0.18em] shadow-[6px_6px_0_0] shadow-foreground transition-all duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0_0] hover:shadow-foreground active:translate-x-[2px] active:translate-y-[2px] active:shadow-none',
 variant === 'primary' && 'bg-primary text-primary-foreground',
 variant === 'outline' && 'bg-background text-foreground',
 className,
 )}>
 {children}
 </span>
 )
}

/** Underline-slide mono link CTA with trailing arrow. From AboutHero. */
export function UnderlineSlideLink({
 children,
 className,
}: {
 children: React.ReactNode
 className?: string
}) {
 return (
 <span
 className={cn(
 'group relative inline-flex items-center justify-center gap-2 px-0 py-3.5 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-foreground transition-all before:absolute before:bottom-2 before:left-0 before:h-px before:w-full before:bg-border after:absolute after:bottom-2 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-primary after:transition-transform after:duration-300 hover:after:scale-x-100 active:translate-y-px',
 className,
 )}>
 {children}
 </span>
 )
}

/** Full-bleed tilted marquee strip. From AgencyHero. */
export function TiltedMarquee({
 items,
 className,
 duration = 40,
 separator = '✦',
}: {
 items: string[]
 className?: string
 duration?: number
 separator?: string
}) {
 return (
 <div
 aria-hidden="true"
 className={cn(
 'relative -rotate-1 scale-x-[1.03] border-y-2 border-foreground bg-foreground py-3 text-background',
 className,
 )}>
 <Marquee duration={duration} gap={0}>
 {Array.from({ length: 6 }, (_, i) => (
 <span
 key={i}
 className="inline-flex shrink-0 items-center gap-6 pr-6 font-mono text-xs font-bold uppercase tracking-[0.25em]">
 {items[i % items.length]}
 <span className="text-primary">{separator}</span>
 </span>
 ))}
 </Marquee>
 </div>
 )
}

/** Brutalist image plate — 2px border, hard offset shadow, optional rotated
 * sticker badge overlapping the top edge. From AgencyWork. */
export function BrutalistImagePlate({
 alt,
 src,
 sticker,
 stickerRotate = 'rotate-3',
 aspectClass = 'aspect-[4/3]',
 className,
 imageClassName,
}: {
 alt: string
 src?: string
 sticker?: string
 stickerRotate?: string
 aspectClass?: string
 className?: string
 imageClassName?: string
}) {
 return (
 <div
 className={cn(
 'group relative border-2 border-foreground bg-background shadow-[8px_8px_0_0] shadow-foreground transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[12px_12px_0_0] hover:shadow-foreground',
 className,
 )}>
 {sticker && (
 <span
 className={cn(
 'absolute -top-3.5 right-4 z-10 inline-flex items-center whitespace-nowrap rounded-full border-2 border-foreground bg-background px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-foreground shadow-[3px_3px_0_0] shadow-foreground sm:right-6',
 stickerRotate,
 )}>
 {sticker}
 </span>
 )}
 <div
 className={cn(
 'relative overflow-hidden border-b-2 border-foreground',
 aspectClass,
 )}>
 <ImageBlock
 alt={alt}
 src={src}
 className={cn(
 'size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105',
 imageClassName,
 )}
 />
 <div className="absolute inset-x-0 bottom-0 flex opacity-0 transition-opacity group-hover:opacity-100">
 <span className="inline-flex items-center gap-2 border-r-2 border-t-2 border-foreground bg-foreground px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-background">
 View
 </span>
 </div>
 </div>
 </div>
 )
}

/** Editorial image plate — offset hairline outline behind the plate (drafting
 * double-line), grayscale photo that regains color on hover, zoom on hover,
 * optional measurement dimension line beneath. From ArchitectureFirmHero/Work. */
export function EditorialImagePlate({
 alt,
 src,
 figure,
 caption,
 aspectClass = 'aspect-[4/5]',
 className,
 dimensionLabel,
 grayscale = true,
}: {
 alt: string
 src?: string
 figure?: string
 caption?: string
 aspectClass?: string
 className?: string
 dimensionLabel?: string
 grayscale?: boolean
}) {
 return (
 <div className={cn('group relative', className)}>
 <div className="relative">
 {/* Offset hairline outline behind the plate — drafting double-line. */}
 <span
 aria-hidden="true"
 className="pointer-events-none absolute inset-0 translate-x-3 translate-y-3 border border-border"
 />
 <div
 className={cn(
 'relative overflow-hidden border border-foreground/25 bg-muted',
 aspectClass,
 )}>
 <ImageBlock
 alt={alt}
 src={src}
 className={cn(
 'size-full object-cover transition-[filter,transform] duration-500 group-hover:scale-[1.03]',
 grayscale && 'grayscale group-hover:grayscale-0',
 )}
 />
 </div>
 </div>
 {/* Measurement dimension line beneath the plate. */}
 {dimensionLabel && (
 <span
 aria-hidden="true"
 className="mt-4 flex items-center gap-2 text-border">
 <span className="h-2.5 w-px bg-current" />
 <span className="h-px flex-1 bg-current" />
 <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
 {dimensionLabel}
 </span>
 <span className="h-px flex-1 bg-current" />
 <span className="h-2.5 w-px bg-current" />
 </span>
 )}
 {(figure || caption) && (
 <div className="mt-4">
 {figure && (
 <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.15em] text-foreground">
 {figure}
 </span>
 )}
 {caption && (
 <p className="text-base font-light tracking-tight text-foreground sm:text-lg">
 {caption}
 </p>
 )}
 </div>
 )}
 </div>
 )
}

/** Staggered grid item — alternating translate-y for a waterfall effect.
 * From AgencyWork/MarketingAgencyProcess. */
export function staggerClass(
 index: number,
 amount: 'sm' | 'md' | 'lg' = 'md',
): string {
 if (amount === 'sm') {
 const stagger = [
 'md:translate-y-0',
 'md:translate-y-4',
 'md:translate-y-8',
 'md:translate-y-12',
 ]
 return stagger[index % stagger.length]
 }
 if (amount === 'lg') {
 const stagger = [
 'md:translate-y-0',
 'md:translate-y-8',
 'md:translate-y-16',
 'md:translate-y-24',
 ]
 return stagger[index % stagger.length]
 }
 const stagger = [
 'md:translate-y-0',
 'md:translate-y-6',
 'md:translate-y-12',
 'md:translate-y-[4.5rem]',
 ]
 return stagger[index % stagger.length]
}

/** Alternating micro-rotation for cards. From AgencyWork. */
export function microRotate(index: number): string {
 return index % 2 === 0 ? 'rotate-[0.4deg]' : '-rotate-[0.4deg]'
}

/** Giant ghost numeral bleeding behind a card. From MarketingAgencyProcess. */
export function CardGhostNumeral({
 index,
 className,
}: {
 index: number
 className?: string
}) {
 return (
 <span
 aria-hidden="true"
 className={cn(
 'pointer-events-none absolute -top-10 right-0 select-none text-[6rem] font-extrabold leading-none tracking-tighter text-foreground/[0.06] sm:text-[7rem]',
 className,
 )}>
 {String(index + 1).padStart(2, '0')}
 </span>
 )
}

/** Inverted hover card — floods with foreground on hover, text flips to
 * background. From the playbook hard-inversion-hover technique. */
export function inversionHoverClass(): string {
 return 'transition-colors duration-150 hover:bg-foreground hover:text-background hover:[&_p]:text-background/70 hover:[&_span]:text-background/60'
}

/** Drop cap — first letter oversized. From Newsprint/editorial styles. */
export function DropCap({
 children,
 className,
}: {
 children: React.ReactNode
 className?: string
}) {
 return (
 <p
 className={cn(
 'first-letter:float-left first-letter:mr-2 first-letter:text-6xl first-letter:font-serif first-letter:font-light first-letter:leading-[0.8] first-letter:text-foreground',
 className,
 )}>
 {children}
 </p>
 )
}

/** Mono metadata row —"Vol. I / FILED UNDER: / NOV 12 1981" grammar.
 * From editorial trust devices. */
export function MonoMetadata({
 items,
 className,
}: {
 items: string[]
 className?: string
}) {
 return (
 <div
 className={cn(
 'flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground',
 className,
 )}>
 {items.map((item, i) => (
 <React.Fragment key={i}>
 {i> 0 && (
 <span aria-hidden="true" className="text-muted-foreground/40">
 /
 </span>
 )}
 <span>{item}</span>
 </React.Fragment>
 ))}
 </div>
 )
}

/** Skewed CTA that un-skews on hover (counter-skewed inner span).
 * From the playbook skew/diagonal kinetics technique. */
export function SkewedCta({
 children,
 className,
}: {
 children: React.ReactNode
 className?: string
}) {
 return (
 <span
 className={cn(
 'inline-flex -skew-x-12 items-center justify-center bg-foreground px-6 py-3 text-sm font-bold uppercase tracking-wider text-background transition-colors hover:bg-primary hover:text-primary-foreground',
 className,
 )}>
 <span className="inline-flex skew-x-12 items-center gap-2">
 {children}
 </span>
 </span>
 )
}

// ─── Additional components for deductive parity with old capsules ───────

/** Drafting-sheet registration ticks in the four corners. From
 * ArchitectureFirmHero. Render inside a relative/overflow-hidden parent. */
export function RegistrationTicks({ className }: { className?: string }) {
 return (
 <span
 aria-hidden="true"
 className={cn(
 'pointer-events-none absolute inset-4 hidden sm:block',
 className,
 )}>
 <span className="absolute left-0 top-0 size-3 border-l border-t border-foreground/40" />
 <span className="absolute right-0 top-0 size-3 border-r border-t border-foreground/40" />
 <span className="absolute bottom-0 left-0 size-3 border-b border-l border-foreground/40" />
 <span className="absolute bottom-0 right-0 size-3 border-b border-r border-foreground/40" />
 </span>
 )
}

/** Mono annotation rail — figure index + hairline rule + eyebrow label.
 * From ArchitectureFirmHero/Work. The rule uses flex-1 to fill space. */
export function MonoAnnotationRail({
 index,
 eyebrow,
 className,
}: {
 index: string
 eyebrow?: string
 className?: string
}) {
 return (
 <div className={cn('mb-8 flex items-center gap-4', className)}>
 <MonoTag className="shrink-0 text-foreground">{index}</MonoTag>
 <span
 aria-hidden="true"
 className="h-px w-10 bg-border sm:flex-1 sm:max-w-24"
 />
 {eyebrow && <MonoTag className="min-w-0">{eyebrow}</MonoTag>}
 </div>
 )
}

/** Sticker highlight heading — primary block behind the last word with
 * -rotate-1, inset-x-[-0.15em] inset-y-[0.05em]. Splits heading into
 * lead + highlighted last word. From MarketingAgencyServices/Cases. */
export function StickerHeading({
 heading,
 highlight,
 className,
 headingClassName,
}: {
 heading: string
 highlight?: string
 className?: string
 headingClassName?: string
}) {
 const headingWords = heading.split(' ')
 const headingMark = highlight || (headingWords.at(-1) ?? '')
 const headingLead = highlight
 ? heading.replace(highlight, '').trim()
 : headingWords.slice(0, -1).join(' ')
 return (
 <h2
 className={cn(
 'text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl',
 headingClassName,
 )}>
 {headingLead}{' '}
 <span className="relative ml-[0.12em] inline-block whitespace-nowrap">
 <span
 aria-hidden="true"
 className="absolute inset-x-[-0.15em] inset-y-[0.05em] -rotate-1 bg-primary"
 />
 <span className="relative text-primary-foreground">{headingMark}</span>
 </span>
 </h2>
 )
}

/** Measurement dimension line — end ticks + mono scale caption. From
 * ArchitectureFirmHero. Used beneath photo plates. */
export function DimensionLine({ label }: { label: string }) {
 return (
 <span
 aria-hidden="true"
 className="mt-4 flex items-center gap-2 text-border">
 <span className="h-2.5 w-px bg-current" />
 <span className="h-px flex-1 bg-current" />
 <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
 {label}
 </span>
 <span className="h-px flex-1 bg-current" />
 <span className="h-2.5 w-px bg-current" />
 </span>
 )
}

/** Offset color frame — colored offset outline behind a card (translate-x-3
 * translate-y-3 border-2 border-primary/40 bg-primary/10). From
 * SubscriptionBoxHero. Wrap around any content. */
export function OffsetColorFrame({
 children,
 className,
 frameClassName,
}: {
 children: React.ReactNode
 className?: string
 frameClassName?: string
}) {
 return (
 <div className={cn('relative', className)}>
 <div
 aria-hidden="true"
 className={cn(
 'pointer-events-none absolute inset-0 translate-x-3 translate-y-3 border-2 border-primary/40 bg-primary/10',
 frameClassName,
 )}
 />
 <div className="relative">{children}</div>
 </div>
 )
}

/** Varying tick bar — a row of small bars with varying widths. From
 * MarketingAgencyStats. Used in stat cells for visual texture. */
export function VaryingTickBar({ index }: { index: number }) {
 const tickWidths = ['w-10', 'w-6', 'w-12', 'w-8', 'w-5', 'w-9']
 return (
 <span aria-hidden="true" className="flex items-center gap-1">
 <span
 className={cn('h-1 bg-primary', tickWidths[index % tickWidths.length])}
 />
 <span className="h-1 w-1 bg-foreground/20" />
 <span className="h-1 w-1 bg-foreground/20" />
 <span className="h-1 w-1 bg-foreground/20" />
 </span>
 )
}

/** Section header with mono annotation rail + ultra-thin heading + description
 * on a hairline left rule. From ArchitectureFirmWork/Philosophy/Process/
 * Testimonials. Editorial style — font-extralight, NOT sticker. */
export function EditorialSectionHeader({
 index,
 eyebrow,
 heading,
 description,
 meta,
 metaLabel,
 className,
}: {
 index?: string
 eyebrow?: string
 heading: string
 description?: string
 meta?: string
 metaLabel?: string
 className?: string
}) {
 return (
 <div
 className={cn(
 'mb-12 flex flex-col gap-8 md:flex-row md:items-end md:justify-between lg:mb-16',
 className,
 )}>
 <div>
 {(index || eyebrow) && (
 <div className="mb-6 flex items-center gap-4">
 {index && (
 <MonoTag className="shrink-0 text-foreground">{index}</MonoTag>
 )}
 {eyebrow && <MonoTag className="shrink-0">{eyebrow}</MonoTag>}
 <span aria-hidden="true" className="h-px w-16 bg-border" />
 </div>
 )}
 <h2 className="text-4xl font-extralight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
 {heading}
 </h2>
 </div>
 {description && (
 <p className="max-w-md border-l border-border pl-5 text-sm leading-relaxed text-muted-foreground">
 {description}
 </p>
 )}
 {metaLabel && (
 <MonoTag
 aria-hidden="true"
 className="shrink-0 text-muted-foreground/50">
 {metaLabel} / {meta}
 </MonoTag>
 )}
 {!metaLabel && meta && (
 <MonoTag
 aria-hidden="true"
 className="shrink-0 text-muted-foreground/50">
 {meta}
 </MonoTag>
 )}
 </div>
 )
}

/** Clip-path diagonal seam — top-left corner is lowered by 2.5rem creating
 * a diagonal cut. Use with pt-20 to compensate for the clipped area.
 * From MarketingAgencyServices/Cases. */
export const diagonalSeamClass =
 '[clip-path:polygon(0_2.5rem,100%_0,100%_100%,0_100%)]'

/** Hairline-ruled lead paragraph — border-l pl-5. From ArchitectureFirmHero. */
export function RuledLead({
 children,
 className,
}: {
 children: React.ReactNode
 className?: string
}) {
 return (
 <p
 className={cn(
 'max-w-xl border-l border-border pl-5 text-base leading-relaxed text-muted-foreground sm:text-lg',
 className,
 )}>
 {children}
 </p>
 )
}
