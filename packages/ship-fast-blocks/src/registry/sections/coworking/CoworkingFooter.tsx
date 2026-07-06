import { ArrowUp } from 'lucide-react'
import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { GridField } from '#/section-kit/motion.tsx'

/**
 * CoworkingFooter — deep, quiet closing footer for a coworking or shared-
 * workspace site. A giant watermark wordmark sits behind the content — the
 * page's light-field fading out — under a primary-tinted seam hairline.
 * Left: gradient brand tile, wordmark, tagline, and a row of social pills
 * that lift softly on hover. Right: link columns with uppercase tracked
 * titles and links that slide subtly on hover. The bottom bar carries the
 * auto-updating copyright and a back-to-top pill. Every brand, social, and
 * column link routes through useNavigate. Renders fully with no props via
 * baked-in "Northside" defaults. Use as the site-wide footer for coworking
 * spaces, shared offices, flex-office providers, or business centers.
 */
const BrandTile = ({ letter }: { letter: string }) => (
  <span
    className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-base font-bold text-primary-foreground shadow-sm shadow-primary/25 ring-1 ring-primary/30"
    aria-hidden="true"
  >
    {letter}
  </span>
)

export const CoworkingFooter = defineCapsule({
  name: 'CoworkingFooter',
  description:
    'Deep, quiet closing footer for a coworking or shared-workspace site: a giant watermark wordmark behind the content under a primary-tinted seam hairline, a gradient brand tile with wordmark + tagline + social pills that lift on hover, link columns with uppercase tracked titles and slide-on-hover links, and a bottom bar with auto-updating copyright and a back-to-top pill. Every brand, social, and column link routes through useNavigate. Use as the site-wide footer for coworking spaces, shared offices, flex-office providers, or business centers.',
  props: z.object({
    /** Brand / workspace name shown beside the logo tile. */
    brand: z.string().optional(),
    /** Short tagline below the wordmark. */
    tagline: z.string().optional(),
    /** Social channels rendered as a link row under the brand. */
    social: z
      .array(z.object({ label: z.string(), href: z.string().optional() }))
      .optional(),
    /** Link columns (Spaces, Company, Resources, Contact, …). */
    columns: z
      .array(z.object({ title: z.string(), links: z.array(z.string()) }))
      .optional(),
    /** Copyright note appended after the brand + year. */
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand =
      typeof props.brand === 'string' && props.brand ? props.brand : 'Northside'
    const tagline =
      typeof props.tagline === 'string' && props.tagline
        ? props.tagline
        : 'A bright, modern workspace where independent professionals and growing teams do their best work.'
    const note =
      typeof props.note === 'string' && props.note
        ? props.note
        : 'All rights reserved.'
    const social = (
      props.social?.length
        ? props.social.filter(
            (item) => typeof item?.label === 'string' && item.label,
          )
        : [{ label: 'Instagram' }, { label: 'LinkedIn' }, { label: 'X' }]
    ) as Array<{ label: string; href?: string }>
    const columns = (
      props.columns?.length
        ? props.columns.filter(
            (column) => typeof column?.title === 'string' && column.title,
          )
        : [
            {
              title: 'Spaces',
              links: [
                'Hot Desks',
                'Dedicated Desks',
                'Private Offices',
                'Meeting Rooms',
              ],
            },
            {
              title: 'Company',
              links: ['About', 'Careers', 'Community', 'Events'],
            },
            {
              title: 'Resources',
              links: ['Pricing', 'Amenities', 'Member Perks', 'FAQ'],
            },
            {
              title: 'Contact',
              links: [
                '123 Pearl Street, Portland, OR 97209',
                '(503) 555-0145',
                'hello@northside.work',
              ],
            },
          ]
    ) as Array<{ title: string; links: string[] }>
    const year = new Date().getFullYear()
    // Authored notes often arrive as a full copyright line ("© 2026 Brand …")
    // — don't prepend a second © clause in that case.
    const copyright = note.includes('©') ? note : `© ${year} ${brand}. ${note}`

    const scrollToTop = () => {
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }

    return (
      <footer
        className={cn(
          'relative isolate overflow-hidden bg-background',
          props.className,
        )}
      >
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
        />
        <GridField
          className="-z-10 text-foreground/[0.045]"
          size={64}
          mask="radial-gradient(ellipse 100% 85% at 50% 100%, black 25%, transparent 80%)"
        />

        {/* Watermark wordmark. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 overflow-hidden">
          <p
            aria-hidden="true"
            className="translate-y-[35%] whitespace-nowrap text-center text-[8rem] font-bold leading-none tracking-tighter text-foreground/[0.035] sm:text-[12rem] lg:text-[17rem]"
          >
            {brand}
          </p>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-20 sm:px-6 sm:pt-24 lg:px-8">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 hidden w-px bg-gradient-to-b from-transparent via-border/70 to-transparent lg:block"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 hidden w-px bg-gradient-to-b from-transparent via-border/70 to-transparent lg:block"
          />

          <div className="grid gap-14 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
            <div className="max-w-sm">
              <button
                type="button"
                onClick={() => go(brand)}
                className="flex items-center gap-3"
              >
                <BrandTile letter={brand.charAt(0).toUpperCase()} />
                <span className="text-xl font-semibold tracking-tight text-foreground">
                  {brand}
                </span>
              </button>
              <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                {tagline}
              </p>
              <div className="mt-7 flex flex-wrap gap-2.5">
                {social.map((item) =>
                  typeof item.href === 'string' && item.href ? (
                    <a
                      key={item.label}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center rounded-full border border-border/60 bg-card/60 px-4 py-2 text-sm font-medium text-muted-foreground backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:text-foreground hover:shadow-sm"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => go(item.label)}
                      className="inline-flex items-center rounded-full border border-border/60 bg-card/60 px-4 py-2 text-sm font-medium text-muted-foreground backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:text-foreground hover:shadow-sm"
                    >
                      {item.label}
                    </button>
                  ),
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
              {columns.map((column) => (
                <div key={column.title}>
                  <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground">
                    {column.title}
                  </h3>
                  <ul className="mt-5 flex flex-col gap-3">
                    {(Array.isArray(column.links) ? column.links : [])
                      .filter((link) => typeof link === 'string' && link)
                      .map((link) => (
                        <li key={link}>
                          <button
                            type="button"
                            onClick={() => go(link)}
                            className="text-left text-sm text-muted-foreground transition-all duration-300 hover:translate-x-1 hover:text-foreground"
                          >
                            {link}
                          </button>
                        </li>
                      ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-border/50 pt-8 sm:flex-row">
            <p className="text-sm text-muted-foreground">{copyright}</p>
            <button
              type="button"
              onClick={scrollToTop}
              className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-4 py-2 text-sm font-medium text-muted-foreground backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:text-foreground hover:shadow-sm"
            >
              <ArrowUp className="size-4" aria-hidden="true" />
              Back to top
            </button>
          </div>
        </div>
      </footer>
    )
  },
})
