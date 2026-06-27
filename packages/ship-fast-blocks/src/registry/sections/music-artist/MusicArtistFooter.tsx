import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * MusicArtistFooter — multi-column closing footer for a music artist / band
 * page. A wide brand block (thin wordmark, blurb, and a booking/press contact
 * line with a routable email) spanning two columns, alongside several link
 * columns, with a bottom bar showing a copyright line and legal links. Warm,
 * airy, editorial indie-folk aesthetic on a soft neutral canvas with a top
 * border. The brand, email, every column link and legal link route through
 * useNavigate. Use as the closing site footer for musicians, bands, or artist
 * EPK pages. Renders fully with no props via baked-in defaults.
 */
export const MusicArtistFooter = defineCapsule({
  name: 'MusicArtistFooter',
  description:
    'Multi-column closing footer for a music artist / band page: a wide brand block (thin wordmark, blurb, and a booking/press contact line with a routable email) spanning two columns, alongside several link columns, with a bottom bar showing a copyright line and legal links. Warm, airy editorial indie-folk aesthetic on a soft neutral canvas with a top border. The brand, email, every column link and legal link route through useNavigate. Use as the closing site footer for musicians, singers, bands, or artist EPK pages.',
  props: z.object({
    /** Artist / band name shown as the brand wordmark. */
    brand: z.string().optional(),
    /** Blurb paragraph under the brand name. */
    description: z.string().optional(),
    /** Label above the contact email. */
    contactLabel: z.string().optional(),
    /** Booking / press contact email (routable). */
    email: z.string().optional(),
    /** Link columns (title + link labels). */
    columns: z
      .array(z.object({ title: z.string(), links: z.array(z.string()) }))
      .optional(),
    /** Trailing note after the copyright year + brand. */
    note: z.string().optional(),
    /** Legal link labels in the bottom bar. */
    legal: z.array(z.string()).optional(),
    /** Navigation target for the brand wordmark. */
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'Velvet Echo'
    const description =
      props.description ??
      'Independent folk music from Portland, Oregon. New album "Northbound" available everywhere.'
    const contactLabel =
      props.contactLabel ?? 'For booking and press inquiries:'
    const email = props.email ?? 'hello@velvetecho.com'
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Music',
            links: [
              'Northbound Album',
              'Discography',
              'Music Videos',
              'Live Sessions',
            ],
          },
          {
            title: 'Connect',
            links: ['Tour Dates', 'Merchandise', 'Instagram', 'YouTube'],
          },
        ]
    const note = props.note ?? 'All rights reserved.'
    const legal = props.legal?.length
      ? props.legal
      : ['Privacy Policy', 'Terms of Use']
    const homeTarget = props.homeTarget ?? 'Music'

    return (
      <footer
        className={cn(
          'border-t border-border px-6 py-16 lg:px-8',
          props.className,
        )}
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 grid gap-12 md:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <button
                type="button"
                onClick={() => go(homeTarget)}
                className="mb-4 inline-block text-2xl font-light tracking-tight text-foreground"
              >
                {brand}
              </button>
              <p className="mb-6 max-w-sm text-muted-foreground">
                {description}
              </p>
              <p className="text-sm text-muted-foreground">
                {contactLabel}
                <br />
                <button
                  type="button"
                  onClick={() => go(email)}
                  className="text-foreground/80 transition-colors hover:text-foreground"
                >
                  {email}
                </button>
              </p>
            </div>
            {columns.map((column) => (
              <div key={column.title}>
                <h4 className="mb-4 font-medium text-foreground">
                  {column.title}
                </h4>
                <ul className="space-y-2 text-sm">
                  {column.links.map((link) => (
                    <li key={link}>
                      <button
                        type="button"
                        onClick={() => go(link)}
                        className="text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex flex-col items-center justify-between border-t border-border pt-8 md:flex-row">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} {brand}. {note}
            </p>
            <div className="mt-4 flex gap-6 md:mt-0">
              {legal.map((link) => (
                <button
                  key={link}
                  type="button"
                  onClick={() => go(link)}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link}
                </button>
              ))}
            </div>
          </div>
        </div>
      </footer>
    )
  },
})
