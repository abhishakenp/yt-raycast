import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * NewsletterFooter — inverted multi-column footer for an editorial newsletter.
 * A full-width dark foreground band: a wide left brand column (serif initial-mark
 * logo + name, a short tagline, and round social icon buttons — a Twitter glyph,
 * otherwise an RSS-style glyph), then link columns of grouped routes; a bottom
 * bar separates an auto-year copyright line from inline legal links. Warm, calm,
 * literary mood inverted to close the page. Brand, social buttons, every link and
 * legal item route through useNavigate. Use as the site footer for newsletters,
 * publications, blogs, or content creators. Renders fully with no props via
 * baked-in defaults.
 */
export const NewsletterFooter = defineComponent({
  name: 'NewsletterFooter',
  description:
    'Inverted multi-column footer for an editorial newsletter: a full-width dark foreground band with a wide left brand column (serif initial-mark logo + name, a short tagline, and round social icon buttons — a Twitter glyph, otherwise an RSS-style glyph), then link columns of grouped routes; a bottom bar separates an auto-year copyright line from inline legal links. Warm, calm, literary mood inverted to close the page. Brand, social buttons, every link and legal item route through useNavigate. Use as the site footer for newsletters, publications, blogs, essayists, or content creators.',
  props: z.object({
    /** Brand / publication name shown beside the serif logo mark. */
    brand: z.string().optional(),
    /** Short tagline under the brand. */
    tagline: z.string().optional(),
    /** Social button labels (a 'Twitter' label gets the X glyph, others an RSS glyph). */
    socials: z.array(z.string()).optional(),
    /** Grouped link columns. */
    columns: z
      .array(z.object({ title: z.string(), links: z.array(z.string()) }))
      .optional(),
    /** Copyright suffix after the auto-year + brand. */
    copyright: z.string().optional(),
    /** Inline legal links in the bottom bar. */
    legal: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'The Quiet Observer'
    const tagline =
      props.tagline ??
      'Thoughtful essays on technology, creativity, and human connection. Written by Sarah Mitchell in Brooklyn, NY.'
    const socials = props.socials?.length
      ? props.socials
      : ['Twitter', 'RSS Feed']
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Newsletter',
            links: ['Recent Issues', 'Archive', 'Audio Feed', 'Subscribe'],
          },
          {
            title: 'Connect',
            links: ['About', 'Discord', 'Contact', 'Sponsor'],
          },
        ]
    const copyright = props.copyright ?? 'All rights reserved.'
    const legal = props.legal?.length ? props.legal : ['Privacy', 'Terms']

    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          'grid place-items-center rounded-lg bg-muted-foreground/30 font-serif font-medium text-background',
          className,
        )}
        aria-hidden="true"
      >
        {brand.charAt(0).toUpperCase()}
      </span>
    )

    return (
      <footer
        className={cn(
          'bg-foreground py-12 text-background/60 md:py-16',
          props.className,
        )}
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 grid gap-8 md:grid-cols-4 md:gap-12">
            <div className="md:col-span-2">
              <button
                type="button"
                onClick={() => go(brand)}
                className="mb-4 flex items-center gap-2"
              >
                <LogoMark className="size-8 text-lg" />
                <span className="font-serif text-xl font-medium tracking-tight text-background">
                  {brand}
                </span>
              </button>
              <p className="mb-6 max-w-sm text-sm leading-relaxed">{tagline}</p>
              <div className="flex gap-4">
                {socials.map((social) => (
                  <button
                    key={social}
                    type="button"
                    aria-label={social}
                    onClick={() => go(social)}
                    className="grid size-10 place-items-center rounded-lg bg-background/10 text-background transition-colors hover:bg-background/20"
                  >
                    {social === 'Twitter' ? (
                      <svg
                        className="size-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    ) : (
                      <svg
                        className="size-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7m-6 0a1 1 0 11-2 0 1 1 0 012 0z"
                        />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {columns.map((col) => (
              <div key={col.title}>
                <h4 className="mb-4 font-medium text-background">
                  {col.title}
                </h4>
                <ul className="space-y-3 text-sm">
                  {col.links.map((link) => (
                    <li key={link}>
                      <button
                        type="button"
                        onClick={() => go(link)}
                        className="transition-colors hover:text-background"
                      >
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center justify-between gap-4 border-t border-background/10 pt-8 sm:flex-row">
            <p className="text-sm">
              © {new Date().getFullYear()} {brand}. {copyright}
            </p>
            <div className="flex gap-6 text-sm">
              {legal.map((link) => (
                <button
                  key={link}
                  type="button"
                  onClick={() => go(link)}
                  className="transition-colors hover:text-background"
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
