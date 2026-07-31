/**
 * Structural primitives — design-aware React components that motifs compose.
 *
 * These are NOT OpenUI capsules. They're internal building blocks that read
 * from useDesign() and render with @design-aware Tailwind classes. Motif
 * capsules (in the engine package) compose these to produce sections.
 *
 * ~15 primitives cover the entire structural space of 1,063 capsules.
 *
 * Design styling is handled by design-presets.css via [data-d-role] attributes.
 * Components use base Tailwind classes as hooks — CSS overrides replace them
 * with the design intent values. No d.*.* class reads needed.
 */
import * as React from 'react'
import { cn } from '#/lib/utils.ts'
import { Image as AmbientImage } from '#/lib/img.tsx'

// ─── Container ───────────────────────────────────────────────────────────

type ContainerLayout = 'full-bleed' | 'contained' | 'split' | 'grid'
type ContainerSize = 'sm' | 'md' | 'lg' | 'xl'

const SIZE_MAP: Record<ContainerSize, string> = {
  sm: 'max-w-3xl',
  md: 'max-w-5xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
}

export function Container({
  layout = 'contained',
  size = 'xl',
  ratio = '7/5',
  cols = 3,
  className,
  children,
  ...props
}: {
  layout?: ContainerLayout
  size?: ContainerSize
  ratio?: string
  cols?: number
  className?: string
  children?: React.ReactNode
} & React.HTMLAttributes<HTMLDivElement>) {
  const base = 'mx-auto w-full px-4 sm:px-6 lg:px-8'

  if (layout === 'full-bleed') {
    return (
      <div
        data-d-role="container"
        className={cn('w-full', className)}
        {...props}
      >
        {children}
      </div>
    )
  }

  if (layout === 'split') {
    const [left, right] = ratio.split('/').map(Number)
    const total = left + right
    return (
      <div
        data-d-role="container"
        className={cn(base, SIZE_MAP[size], 'grid gap-10 lg:gap-16', className)}
        style={{
          gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))`,
        }}
        {...props}
      >
        {children}
      </div>
    )
  }

  if (layout === 'grid') {
    return (
      <div
        data-d-role="grid"
        className={cn(base, SIZE_MAP[size], 'gap-6', className)}
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        }}
        {...props}
      >
        {children}
      </div>
    )
  }

  return (
    <div
      data-d-role="container"
      className={cn(base, SIZE_MAP[size], className)}
      {...props}
    >
      {children}
    </div>
  )
}

// ─── Section wrapper ─────────────────────────────────────────────────────

export function Section({
  className,
  children,
  ...props
}: {
  className?: string
  children?: React.ReactNode
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <section
      data-d-role="section"
      className={cn('py-16 scroll-mt-20 bg-background', className)}
      {...props}
    >
      {children}
    </section>
  )
}

// ─── Heading ─────────────────────────────────────────────────────────────

type HeadingLevel = 'display' | 'h1' | 'h2' | 'h3' | 'eyebrow' | 'mono-label'

export function Heading({
  level = 'h2',
  text,
  highlight,
  highlightIndex,
  className,
}: {
  level?: HeadingLevel
  text: string
  /** Phrase within text to highlight (wrapped in gradient/primary block). */
  highlight?: string
  /** Alternative: highlight the Nth word (0-indexed). */
  highlightIndex?: number
  className?: string
}) {
  const classes = resolveHeadingClasses(level)

  // Parse highlight from text
  const { before, hl, after } = parseHighlight(text, highlight, highlightIndex)

  if (level === 'eyebrow' || level === 'mono-label') {
    return (
      <span data-d-role="eyebrow" className={cn(classes, className)}>
        {text}
      </span>
    )
  }

  const Tag = level === 'display' ? 'h1' : level
  const role = level === 'display' ? 'display' : 'heading'

  if (hl) {
    return (
      <Tag data-d-role={role} className={cn(classes, className)}>
        {before}
        <span className="relative ml-[0.12em] inline-block whitespace-nowrap">
          <span
            data-d-role="highlight"
            className={cn(
              'absolute inset-x-[-0.15em] inset-y-[0.05em] rotate-1 bg-primary',
            )}
          />
          <span className="relative text-primary-foreground">{hl}</span>
        </span>
        {after}
      </Tag>
    )
  }

  return (
    <Tag data-d-role={role} className={cn(classes, className)}>
      {text}
    </Tag>
  )
}

function resolveHeadingClasses(level: HeadingLevel): string {
  switch (level) {
    case 'display':
      return 'text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl'
    case 'h1':
      return 'text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl'
    case 'h2':
      return 'text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl'
    case 'h3':
      return 'text-xl font-bold tracking-tight text-foreground'
    case 'eyebrow':
    case 'mono-label':
      return 'font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground'
  }
}

function parseHighlight(
  text: string,
  highlight?: string,
  highlightIndex?: number,
): { before: string; hl: string; after: string } {
  // [hl]...[/hl] inline syntax
  const match = text.match(/^(.*?)\[hl\](.+?)\[\/hl\](.*)$/s)
  if (match) {
    return { before: match[1], hl: match[2], after: match[3] }
  }
  // Explicit highlight phrase
  if (highlight && text.includes(highlight)) {
    const idx = text.indexOf(highlight)
    return {
      before: text.slice(0, idx),
      hl: highlight,
      after: text.slice(idx + highlight.length),
    }
  }
  // Nth word
  if (highlightIndex != null) {
    const words = text.split(' ')
    if (highlightIndex >= 0 && highlightIndex < words.length) {
      const hl = words[highlightIndex]
      return {
        before: words.slice(0, highlightIndex).join(' ') + ' ',
        hl,
        after: ' ' + words.slice(highlightIndex + 1).join(' '),
      }
    }
  }
  return { before: text, hl: '', after: '' }
}

/**
 * Strip [hl]...[/hl] markers from a string, leaving the inner text.
 * Use in components that render heading text directly (HeroHeading,
 * SectionHeading) and don't parse highlight markers.
 */
export function stripHlTags(text: string): string {
  return text.replace(/\[hl\]|\[\/hl\]/g, '')
}

// ─── Text ────────────────────────────────────────────────────────────────

type TextVariant = 'body' | 'lead' | 'caption' | 'quote'

export function Text({
  variant = 'body',
  text,
  className,
}: {
  variant?: TextVariant
  text: string
  className?: string
}) {
  const classes = resolveTextClasses(variant)
  return (
    <p data-d-role="body" className={cn(classes, className)}>
      {text}
    </p>
  )
}

function resolveTextClasses(variant: TextVariant): string {
  switch (variant) {
    case 'lead':
      return 'text-lg leading-relaxed text-muted-foreground max-w-md'
    case 'body':
      return 'text-base leading-relaxed text-muted-foreground'
    case 'caption':
      return 'text-sm text-muted-foreground'
    case 'quote':
      return 'text-2xl font-medium italic leading-relaxed text-foreground'
  }
}

// ─── Button ──────────────────────────────────────────────────────────────

type ButtonVariant = 'primary' | 'ghost' | 'outline'

export function Button({
  label,
  variant = 'primary',
  href,
  className,
  onClick,
}: {
  label: string
  variant?: ButtonVariant
  href?: string
  className?: string
  onClick?: () => void
}) {
  const base = cn(
    'inline-flex min-h-12 items-center justify-center whitespace-nowrap px-7 font-mono text-[13px] font-semibold uppercase tracking-[0.14em] transition-all duration-200 hover:-translate-y-0.5',
  )

  const variantClasses = resolveButtonVariant(variant)

  if (href) {
    return (
      <a
        href={href}
        data-d-role="btn"
        className={cn(base, variantClasses, className)}
      >
        {label}
      </a>
    )
  }

  return (
    <button
      data-d-role="btn"
      className={cn(base, variantClasses, className)}
      onClick={onClick}
    >
      {label}
    </button>
  )
}

function resolveButtonVariant(variant: ButtonVariant): string {
  switch (variant) {
    case 'primary':
      return 'bg-primary text-primary-foreground shadow-[4px_4px_0_0] shadow-foreground'
    case 'ghost':
      return 'border-2 border-foreground/20 text-muted-foreground hover:bg-muted'
    case 'outline':
      return 'border-2 border-foreground text-foreground hover:bg-muted'
  }
}

// ─── Card ────────────────────────────────────────────────────────────────

export function Card({
  index,
  title,
  description,
  imageAlt,
  imageUrl,
  className,
  children,
}: {
  index?: string
  title?: string
  description?: string
  imageAlt?: string
  imageUrl?: string
  className?: string
  children?: React.ReactNode
}) {
  return (
    <div
      data-d-role="card"
      className={cn(
        ' p-6 border-b border-r border-border bg-card transition-all duration-200 hover:-translate-y-0.5 shadow-[4px_4px_0_0] shadow-foreground',
        className,
      )}
    >
      {index && (
        <span
          data-d-role="eyebrow"
          className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
        >
          {index}
          <span className="text-primary"> /</span>
        </span>
      )}
      {imageUrl && (
        <AmbientImage
          alt={imageAlt ?? title ?? ''}
          src={imageUrl}
          w={800}
          h={600}
          className={cn('mb-4 w-full object-cover')}
        />
      )}
      {title && (
        <h3
          data-d-role="heading"
          className="mt-3 text-xl font-bold tracking-tight text-foreground"
        >
          {title}
        </h3>
      )}
      {description && (
        <p
          data-d-role="body"
          className="mt-2 max-w-md text-sm leading-6 text-muted-foreground"
        >
          {description}
        </p>
      )}
      {children}
    </div>
  )
}

// ─── Grid ────────────────────────────────────────────────────────────────

type GridVariant = 'standard' | 'collapsed-border' | 'asymmetric' | 'masonry'

export function Grid({
  variant = 'standard',
  cols = 3,
  className,
  children,
}: {
  variant?: GridVariant
  cols?: number
  className?: string
  children?: React.ReactNode
}) {
  if (variant === 'collapsed-border') {
    return (
      <div
        data-d-role="grid"
        className={cn('grid gap-6 border-l border-t border-border', className)}
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        }}
      >
        {/* children must apply border-b border-r themselves */}
        {children}
      </div>
    )
  }

  if (variant === 'asymmetric') {
    // First cell spans 7, rest span 5 each (on md+)
    return (
      <div
        data-d-role="grid"
        className={cn(
          'grid gap-6 border-l border-t border-border md:grid-cols-12',
          className,
        )}
      >
        {children}
      </div>
    )
  }

  return (
    <div
      data-d-role="grid"
      className={cn('grid gap-6', className)}
      style={{
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
      }}
    >
      {children}
    </div>
  )
}

// ─── Stat (KPI cell) ─────────────────────────────────────────────────────

export function Stat({
  value,
  label,
  inverted = false,
  sparkBars,
  className,
}: {
  value: string
  label: string
  inverted?: boolean
  sparkBars?: number[]
  className?: string
}) {
  return (
    <div
      data-d-role="card"
      className={cn(
        'border-b border-r border-border p-5 sm:p-7',
        inverted && 'bg-primary text-primary-foreground',
        className,
      )}
    >
      <span
        data-d-role="stat-value"
        className={cn(
          'block text-[clamp(2.25rem,4.5vw,3.75rem)] font-extrabold leading-none tracking-tight tabular-nums',
          inverted ? 'text-primary-foreground' : 'text-foreground',
        )}
      >
        {value}
      </span>
      <span
        data-d-role="eyebrow"
        className={cn(
          'mt-2 block font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground',
          inverted && 'text-primary-foreground/80',
        )}
      >
        {label}
      </span>
      {sparkBars && sparkBars.length > 0 && (
        <span className="mt-3 flex items-end gap-1">
          {sparkBars.map((h, i) => (
            <span
              key={i}
              className={cn(
                'w-1.5',
                inverted ? 'bg-primary-foreground/30' : 'bg-foreground/15',
              )}
              style={{ height: `${h}%` }}
            />
          ))}
        </span>
      )}
    </div>
  )
}

// ─── List ────────────────────────────────────────────────────────────────

export interface ListItem {
  title: string
  description?: string
  price?: string
  meta?: string
}

export interface ListGroup {
  name: string
  items: ListItem[]
}

export function List({
  variant = 'flat',
  groups,
  items,
  className,
}: {
  variant?: 'flat' | 'grouped' | 'numbered'
  groups?: ListGroup[]
  items?: ListItem[]
  className?: string
}) {
  if (variant === 'grouped' && groups) {
    return (
      <div className={cn('flex flex-col gap-10', className)}>
        {groups.map((group, gi) => (
          <div key={gi}>
            <h3
              data-d-role="heading"
              className="mb-5 text-lg font-bold tracking-tight text-foreground"
            >
              {group.name}
            </h3>
            <ul data-d-role="list" className="flex flex-col gap-4">
              {group.items.map((item, ii) => (
                <li
                  key={ii}
                  data-d-role="card"
                  className={cn(
                    'flex items-baseline justify-between gap-4 border-b border-r border-border bg-card p-4',
                  )}
                >
                  <div>
                    <span
                      data-d-role="heading"
                      className="font-medium text-foreground"
                    >
                      {item.title}
                    </span>
                    {item.description && (
                      <span
                        data-d-role="body"
                        className="ml-3 text-sm text-muted-foreground"
                      >
                        {item.description}
                      </span>
                    )}
                  </div>
                  {item.price && (
                    <span
                      data-d-role="eyebrow"
                      className="font-mono text-sm font-semibold tabular-nums text-primary"
                    >
                      {item.price}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    )
  }

  const flatItems = items ?? []
  return (
    <ul data-d-role="list" className={cn('flex flex-col gap-4', className)}>
      {flatItems.map((item, ii) => (
        <li
          key={ii}
          data-d-role="card"
          className={cn(
            'flex items-baseline justify-between gap-4 border-b border-r border-border bg-card p-4',
          )}
        >
          <div>
            <span data-d-role="heading" className="font-medium text-foreground">
              {item.title}
            </span>
            {item.description && (
              <span
                data-d-role="body"
                className="ml-3 text-sm text-muted-foreground"
              >
                {item.description}
              </span>
            )}
          </div>
          {item.price && (
            <span
              data-d-role="eyebrow"
              className="font-mono text-sm font-semibold tabular-nums text-primary"
            >
              {item.price}
            </span>
          )}
        </li>
      ))}
    </ul>
  )
}

// ─── CtaBand ─────────────────────────────────────────────────────────────

export function CtaBand({
  heading,
  subheading,
  ctaLabel,
  ctaHref,
  className,
}: {
  heading: string
  subheading?: string
  ctaLabel: string
  ctaHref?: string
  className?: string
}) {
  return (
    <div
      data-d-role="container"
      className={cn('flex flex-col items-center gap-6 text-center', className)}
    >
      <h2
        data-d-role="heading"
        className={cn(
          'text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl max-w-2xl',
        )}
      >
        {heading}
      </h2>
      {subheading && (
        <Text variant="lead" text={subheading} className="max-w-lg" />
      )}
      <Button label={ctaLabel} href={ctaHref} />
    </div>
  )
}

// ─── Divider / Decor ─────────────────────────────────────────────────────

type DividerVariant = 'rule' | 'dot-grid' | 'watermark' | 'marquee'

export function Divider({
  variant = 'rule',
  text,
  className,
}: {
  variant?: DividerVariant
  text?: string
  className?: string
}) {
  if (variant === 'rule') {
    return (
      <div
        data-d-role="divider"
        className={cn('flex items-center gap-4', className)}
      >
        {text && (
          <span
            data-d-role="eyebrow"
            className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
          >
            {text}
          </span>
        )}
        <span className="h-px flex-1 bg-border" />
      </div>
    )
  }

  if (variant === 'watermark') {
    return (
      <div
        data-d-role="watermark"
        className={cn(
          'pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden',
          className,
        )}
        aria-hidden="true"
      >
        <span className="text-[20vw] font-black leading-none text-foreground/[0.04]">
          {text ?? '*'}
        </span>
      </div>
    )
  }

  if (variant === 'marquee' && text) {
    return (
      <div
        data-d-role="divider"
        className={cn('overflow-hidden border-y border-border py-3', className)}
      >
        <div className="flex w-max animate-[marquee_20s_linear_infinite] gap-8 whitespace-nowrap pr-8">
          {Array.from({ length: 2 }).map((_, i) => (
            <span
              key={i}
              data-d-role="eyebrow"
              className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
              aria-hidden={i === 1}
            >
              {text}
            </span>
          ))}
        </div>
      </div>
    )
  }

  // dot-grid
  return (
    <div
      data-d-role="decor"
      className={cn(
        'pointer-events-none absolute inset-0 opacity-[0.04]',
        className,
      )}
      style={{
        backgroundImage:
          'radial-gradient(circle, currentColor 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
      aria-hidden="true"
    />
  )
}

// ─── Image ───────────────────────────────────────────────────────────────

export function ImageBlock({
  src,
  alt,
  w = 800,
  h = 600,
  className,
  rounded: _rounded = true,
}: {
  src?: string
  alt: string
  w?: number
  h?: number
  className?: string
  rounded?: boolean
}) {
  return (
    <AmbientImage
      alt={alt}
      src={src?.trim() ? src : undefined}
      w={w}
      h={h}
      data-d-role="image"
      className={cn('h-auto w-full object-cover', className)}
    />
  )
}

// ─── Accordion (FAQ) ─────────────────────────────────────────────────────

export interface AccordionItem {
  question: string
  answer: string
}

export function Accordion({
  items,
  className,
}: {
  items: AccordionItem[]
  className?: string
}) {
  return (
    <div data-d-role="list" className={cn('flex flex-col gap-4', className)}>
      {items.map((item, i) => (
        <details
          key={i}
          data-d-role="card"
          className={cn(' p-6 border-b border-r border-border bg-card')}
        >
          <summary
            data-d-role="heading"
            className="cursor-pointer font-semibold text-foreground"
          >
            {item.question}
          </summary>
          <p
            data-d-role="body"
            className="mt-3 text-sm leading-6 text-muted-foreground"
          >
            {item.answer}
          </p>
        </details>
      ))}
    </div>
  )
}

// ─── Navbar ──────────────────────────────────────────────────────────────

export function Navbar({
  brand,
  links,
  ctaLabel,
  ctaHref,
  className,
}: {
  brand: string
  links: string[]
  ctaLabel?: string
  ctaHref?: string
  className?: string
}) {
  return (
    <nav
      data-d-role="nav"
      className={cn(
        'sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur',
        className,
      )}
    >
      <Container size="xl" className="flex h-16 items-center justify-between">
        <span
          data-d-role="heading"
          className="text-lg font-bold tracking-tight text-foreground"
        >
          {brand}
        </span>
        <div className="hidden items-center gap-6 md:flex">
          {links.map((link, i) => (
            <span
              key={i}
              data-d-role="link"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              {link}
            </span>
          ))}
        </div>
        {ctaLabel && <Button label={ctaLabel} href={ctaHref} />}
      </Container>
    </nav>
  )
}

// ─── Footer ──────────────────────────────────────────────────────────────

export interface FooterColumn {
  title: string
  links: string[]
}

export function Footer({
  brand,
  columns,
  social,
  className,
}: {
  brand: string
  columns: FooterColumn[]
  social?: string[]
  className?: string
}) {
  return (
    <footer
      data-d-role="footer"
      className={cn('border-t border-border bg-background py-12', className)}
    >
      <Container size="xl">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <span
              data-d-role="heading"
              className="text-lg font-bold tracking-tight text-foreground"
            >
              {brand}
            </span>
          </div>
          {columns.map((col, i) => (
            <div key={i}>
              <h4
                data-d-role="eyebrow"
                className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
              >
                {col.title}
              </h4>
              <ul data-d-role="list" className="flex flex-col gap-2">
                {col.links.map((link, ii) => (
                  <li
                    key={ii}
                    data-d-role="link"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {link}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {social && social.length > 0 && (
          <div className="mt-8 flex gap-4">
            {social.map((s, i) => (
              <span
                key={i}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {s}
              </span>
            ))}
          </div>
        )}
      </Container>
    </footer>
  )
}

// ─── Form ────────────────────────────────────────────────────────────────

export interface FormField {
  label: string
  type?: 'text' | 'email' | 'textarea' | 'select'
  placeholder?: string
  options?: string[]
}

export function Form({
  fields,
  submitLabel = 'Submit',
  className,
  onSubmit,
}: {
  fields: FormField[]
  submitLabel?: string
  className?: string
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void
}) {
  return (
    <form
      data-d-role="form"
      className={cn('flex flex-col gap-5', className)}
      onSubmit={onSubmit}
    >
      {fields.map((field, i) => (
        <div key={i} className="flex flex-col gap-1.5">
          <label
            data-d-role="eyebrow"
            className="text-sm font-medium text-foreground"
          >
            {field.label}
          </label>
          {field.type === 'textarea' ? (
            <textarea
              data-d-role="input"
              name={field.label.toLowerCase().replace(/\s+/g, '_')}
              placeholder={field.placeholder}
              className={cn(
                'min-h-24 border border-border bg-background px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none',
              )}
            />
          ) : field.type === 'select' ? (
            <select
              data-d-role="input"
              name={field.label.toLowerCase().replace(/\s+/g, '_')}
              className={cn(
                'min-h-12 border border-border bg-background px-4 text-sm text-foreground',
              )}
            >
              {field.options?.map((opt, ii) => (
                <option key={ii}>{opt}</option>
              ))}
            </select>
          ) : (
            <input
              data-d-role="input"
              type={field.type ?? 'text'}
              name={field.label.toLowerCase().replace(/\s+/g, '_')}
              placeholder={field.placeholder}
              className={cn(
                'min-h-12 border border-border bg-background px-4 text-sm text-foreground focus:border-primary focus:outline-none',
              )}
            />
          )}
        </div>
      ))}
      <Button label={submitLabel} />
    </form>
  )
}
