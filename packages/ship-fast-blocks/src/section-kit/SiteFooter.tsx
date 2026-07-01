import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import type { ReactNode } from 'react'
import { Logo } from './Logo.tsx'

/**
 * SiteFooter — generic, prop-driven multi-column site footer. Renders a brand
 * block (mark + name + tagline + social row), an arbitrary set of link columns,
 * and a bottom bar with copyright and legal links. Fully theme-tokened and
 * responsive; composable by any vertical homepage capsule.
 */
export function SiteFooter(props: {
  brand: string
  brandMark?: ReactNode
  tagline?: string
  columns?: { title: string; links: string[] }[]
  social?: { label: string; href?: string }[]
  legal?: string[]
  note?: string
  brandClassName?: string
  className?: string
}) {
  const go = useNavigate()
  const year = new Date().getFullYear()

  return (
    <footer
      className={cn('border-t border-border bg-muted/30', props.className)}
    >
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2">
              <Logo
                brand={props.brand}
                className="size-7"
                fallback={props.brandMark}
                labelClassName={cn(
                  'text-lg font-semibold text-foreground',
                  props.brandClassName,
                )}
              />
            </div>
            {props.tagline ? (
              <p className="mt-3 text-sm text-muted-foreground">
                {props.tagline}
              </p>
            ) : null}
            {props.social ? (
              <div className="mt-4 flex flex-wrap gap-3">
                {props.social.map((s, i) => (
                  <a
                    key={`${s.label}-${i}`}
                    href={s.href ?? '#'}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            ) : null}
          </div>

          {props.columns?.map((col, i) => (
            <div key={`${col.title}-${i}`}>
              <h3 className="text-sm font-semibold text-foreground">
                {col.title}
              </h3>
              <ul className="mt-3 space-y-2">
                {col.links.map((link, j) => (
                  <li key={`${link}-${j}`}>
                    <button
                      onClick={() => go(link)}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            © {year} {props.brand}
            {props.note ? ` · ${props.note}` : ''}
          </p>
          {props.legal ? (
            <div className="flex flex-wrap gap-4">
              {props.legal.map((item, i) => (
                <button
                  key={`${item}-${i}`}
                  onClick={() => go(item)}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  {item}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </footer>
  )
}
