import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Logo as BrandLogo } from '#/section-kit/Logo.tsx'

/**
 * MusicFestivalFooter — a four-column footer for a music / arts festival landing
 * page. A bordered band with a brand block (wordmark + about paragraph), one or
 * more link columns, and a social column of round initial-badge buttons, above a
 * bottom bar with a copyright note and legal links. Every link and social badge
 * routes through useNavigate. Use as the closing site footer for music
 * festivals, arts festivals, concert series, camping/desert events, or any
 * multi-day ticketed event.
 */
import { Container } from '#/section-kit/Container.tsx'
export const MusicFestivalFooter = defineCapsule({
  name: 'MusicFestivalFooter',
  description:
    'Four-column footer for a music / arts festival landing page: a top-bordered band with a brand block (bold wordmark + about paragraph), one or more link columns, and a social column of round initial-badge buttons that flip to primary on hover, above a bottom bar with a copyright note and legal links. Every link and social badge routes through useNavigate. Use as the closing site footer for music festivals, arts festivals, concert series, camping/desert events, raves, or any multi-day ticketed event.',
  props: z.object({
    /** Festival / brand name shown in the footer. */
    brand: z.string().optional(),
    /** About paragraph beneath the brand. */
    about: z.string().optional(),
    /** Link columns (heading + links). */
    columns: z
      .array(
        z.object({
          heading: z.string(),
          links: z.array(z.string()),
        }),
      )
      .optional(),
    /** Social column heading. */
    socialLabel: z.string().optional(),
    /** Social link labels rendered as initial badges. */
    socials: z.array(z.string()).optional(),
    /** Copyright note in the bottom bar. */
    copyright: z.string().optional(),
    /** Legal links in the bottom bar. */
    legal: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'HORIZON'
    const about =
      props.about ??
      'Three days of music, art, and community in the Mojave Desert. August 15-17, 2025.'
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            heading: 'Festival',
            links: ['Lineup', 'Schedule', 'Experience', 'Camping'],
          },
          {
            heading: 'Support',
            links: ['FAQ', 'Contact', 'Accessibility', 'Safety'],
          },
        ]
    const socialLabel = props.socialLabel ?? 'Connect'
    const socials = props.socials?.length
      ? props.socials
      : ['Instagram', 'Twitter', 'TikTok', 'YouTube']
    const copyright =
      props.copyright ??
      `© ${new Date().getFullYear()} ${brand} Festival. All rights reserved.`
    const legal = props.legal?.length
      ? props.legal
      : ['Privacy Policy', 'Terms of Service']
    return (
      <footer className={cn('border-t border-border py-16', props.className)}>
        <Container>
          <div className="mb-12 grid gap-12 md:grid-cols-4">
            <div>
              <h3 className="mb-4 text-xl font-bold">
                <BrandLogo brand={brand} className="mr-2 size-7 align-middle" />
              </h3>
              <p className="text-sm leading-relaxed text-foreground/60">
                {about}
              </p>
            </div>
            {columns.map((col) => (
              <div key={col.heading}>
                <h4 className="mb-4 font-semibold">{col.heading}</h4>
                <ul className="space-y-3 text-sm">
                  {col.links.map((link) => (
                    <li key={link}>
                      <button
                        type="button"
                        onClick={() => go(link)}
                        className="text-foreground/60 transition-colors hover:text-foreground"
                      >
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div>
              <h4 className="mb-4 font-semibold">{socialLabel}</h4>
              <div className="flex gap-4">
                {socials.map((social) => (
                  <button
                    key={social}
                    type="button"
                    aria-label={social}
                    onClick={() => go(social)}
                    className="grid size-10 place-items-center rounded-full bg-accent text-accent-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                  >
                    <span className="text-xs font-semibold">
                      {social.charAt(0)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
            <p className="text-sm text-foreground/50">{copyright}</p>
            <div className="flex gap-6 text-sm">
              {legal.map((link) => (
                <button
                  key={link}
                  type="button"
                  onClick={() => go(link)}
                  className="text-foreground/50 transition-colors hover:text-foreground"
                >
                  {link}
                </button>
              ))}
            </div>
          </div>
        </Container>
      </footer>
    )
  },
})
