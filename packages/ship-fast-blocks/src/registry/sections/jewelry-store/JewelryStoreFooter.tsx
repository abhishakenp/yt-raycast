import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Logo as BrandLogo } from '#/section-kit/Logo.tsx'

/**
 * JewelryStoreFooter — rich five-column footer for a luxury jewelry maison on
 * a bordered near-black band. A wide brand block (serif gold wordmark, blurb,
 * and round initial-letter social buttons) leads a set of link columns
 * (collections, services) and a plain-text contact column, above a bottom row
 * with an auto-updating copyright line and legal links. The wordmark and every
 * link route through useNavigate. Use as the closing footer for fine jewelers,
 * diamond houses, engagement-ring boutiques, or high-jewelry maisons. Renders
 * fully with no props via baked-in "Maison Noir" defaults.
 */
export const JewelryStoreFooter = defineCapsule({
  name: 'JewelryStoreFooter',
  description:
    'Rich five-column footer for a luxury jewelry maison on a bordered near-black band: a wide brand block (serif gold wordmark, blurb, round initial-letter social buttons) leads link columns (collections, services) and a plain-text contact column, above a bottom row with an auto-updating copyright line and legal links. The wordmark and every link route through useNavigate. Use as the closing footer for fine jewelers, diamond houses, engagement-ring boutiques, or high-jewelry maisons.',
  props: z.object({
    /** Maison / brand name shown as the wordmark. */
    brand: z.string().optional(),
    /** Navigation target for the wordmark click. */
    homeTarget: z.string().optional(),
    /** Short brand blurb. */
    about: z.string().optional(),
    /** Link columns (title + links). */
    columns: z
      .array(z.object({ title: z.string(), links: z.array(z.string()) }))
      .optional(),
    /** Heading for the contact column. */
    contactTitle: z.string().optional(),
    /** Plain-text contact lines. */
    contact: z.array(z.string()).optional(),
    /** Social link labels (rendered as initial-letter buttons). */
    socials: z.array(z.string()).optional(),
    /** Copyright note. */
    copyright: z.string().optional(),
    /** Legal / utility link labels. */
    legal: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'Maison Noir'
    const homeTarget = props.homeTarget ?? 'Collections'
    const about =
      props.about ??
      'Crafting exceptional jewelry since 1892. Every piece tells a story of heritage, craftsmanship, and enduring beauty.'
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Collections',
            links: [
              'Éternelle Bridal',
              'Lumière Essentials',
              'Grand Gala',
              'Archive Revival',
              'Maison Classics',
              "Gentleman's Edit",
            ],
          },
          {
            title: 'Services',
            links: [
              'Bespoke Design',
              'Private Appointments',
              'Lifetime Care',
              'Valuation Services',
              'Restoration',
              'Corporate Gifting',
            ],
          },
        ]
    const contactTitle = props.contactTitle ?? 'Contact'
    const contact = props.contact?.length
      ? props.contact
      : [
          '+33 1 42 86 87 88',
          'concierge@maisonnoir.com',
          '12 Place Vendôme, 75001 Paris, France',
          '730 Fifth Avenue, New York, NY 10019',
        ]
    const socials = props.socials?.length
      ? props.socials
      : ['Instagram', 'Pinterest', 'Facebook']
    const copyright = props.copyright ?? 'All rights reserved.'
    const legal = props.legal?.length
      ? props.legal
      : ['Privacy Policy', 'Terms of Service', 'Cookie Settings']

    return (
      <footer
        className={cn(
          'border-t border-border bg-background py-20',
          props.className,
        )}
      >
        <div className="w-full px-6 lg:px-12 xl:px-20">
          <div className="mb-16 grid gap-12 md:grid-cols-2 lg:grid-cols-5 lg:gap-8">
            <div className="lg:col-span-2">
              <button
                type="button"
                onClick={() => go(homeTarget)}
                className="mb-6 inline-block font-serif text-2xl tracking-wider text-primary"
              >
                <BrandLogo brand={brand} className="mr-2 size-7 align-middle" />
              </button>
              <p className="mb-6 max-w-sm leading-relaxed text-muted-foreground">
                {about}
              </p>
              <div className="flex gap-4">
                {socials.map((social) => (
                  <button
                    key={social}
                    type="button"
                    aria-label={social}
                    onClick={() => go(social)}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-card text-sm font-medium uppercase text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                  >
                    {social.charAt(0)}
                  </button>
                ))}
              </div>
            </div>
            {columns.map((col) => (
              <div key={col.title}>
                <p className="mb-6 text-sm font-medium uppercase tracking-widest text-foreground">
                  {col.title}
                </p>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link}>
                      <button
                        type="button"
                        onClick={() => go(link)}
                        className="text-sm text-muted-foreground transition-colors hover:text-primary"
                      >
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div>
              <p className="mb-6 text-sm font-medium uppercase tracking-widest text-foreground">
                {contactTitle}
              </p>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {contact.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} {brand}. {copyright}
            </p>
            <div className="flex gap-6 text-sm">
              {legal.map((link) => (
                <button
                  key={link}
                  type="button"
                  onClick={() => go(link)}
                  className="text-muted-foreground transition-colors hover:text-primary"
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
