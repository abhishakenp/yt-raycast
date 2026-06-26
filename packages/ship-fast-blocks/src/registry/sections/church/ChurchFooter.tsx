import type { ReactNode } from 'react'
import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * ChurchFooter — rich dark multi-column footer for a church or faith-community site.
 * A dark foreground-background reversed footer with four columns: brand + about
 * paragraph + social icon buttons, quick links, resources, and contact info with
 * office hours. Bottom row carries copyright and legal links. Every link and the
 * brand button route through useNavigate. Use as the closing site footer for churches,
 * parishes, worship centers, ministries, or religious nonprofits. Renders fully with
 * no props via baked-in defaults.
 */
export const ChurchFooter = defineComponent({
  name: 'ChurchFooter',
  description:
    'Rich dark multi-column footer for a church or faith-community site: a foreground-background reversed footer with four columns (brand + about + social icons, quick links, resources, and contact info with office hours), plus a bottom row with auto-updating copyright and legal links. Every link and the brand button route through useNavigate. Use as the closing site footer for churches, parishes, worship centers, ministries, or religious nonprofits.',
  props: z.object({
    /** Church / community name shown beside the star mark. */
    brand: z.string().optional(),
    /** Navigation target for the brand button. */
    homeTarget: z.string().optional(),
    /** Short about paragraph under the brand. */
    about: z.string().optional(),
    /** Social platform names; must match the built-in icon set (Instagram, YouTube, Facebook) or fall back to an initial letter. */
    socials: z.array(z.string()).optional(),
    /** Title above the quick-links column. */
    quickLinksTitle: z.string().optional(),
    /** Quick-link labels. */
    quickLinks: z.array(z.string()).optional(),
    /** Title above the resources column. */
    resourcesTitle: z.string().optional(),
    /** Resource link labels. */
    resources: z.array(z.string()).optional(),
    /** Title above the contact column. */
    contactTitle: z.string().optional(),
    /** Street address line. */
    address: z.string().optional(),
    /** Phone number shown as a button. */
    phone: z.string().optional(),
    /** Email shown as a button. */
    email: z.string().optional(),
    /** Office-hours line. */
    hours: z.string().optional(),
    /** Copyright line (excluding year). */
    copyright: z.string().optional(),
    /** Legal link labels in the bottom row. */
    legal: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'Grace Community'
    const homeTarget = props.homeTarget ?? 'Services'
    const about =
      props.about ??
      'A place to belong, believe, and become. Join us Sundays at 9 & 11 AM.'
    const socials = props.socials?.length
      ? props.socials
      : ['Instagram', 'YouTube', 'Facebook']
    const quickLinksTitle = props.quickLinksTitle ?? 'Quick Links'
    const quickLinks = props.quickLinks?.length
      ? props.quickLinks
      : [
          'Service Times',
          'Upcoming Events',
          'Small Groups',
          'Give Online',
          'Watch Sermons',
          'Care & Prayer',
        ]
    const resourcesTitle = props.resourcesTitle ?? 'Resources'
    const resources = props.resources?.length
      ? props.resources
      : [
          'Sermon Archive',
          'Bible Reading Plan',
          'Devotionals',
          'New Here Guide',
          'Statement of Faith',
          'Leadership Team',
        ]
    const contactTitle = props.contactTitle ?? 'Contact'
    const address = props.address ?? '4521 NE Glisan Street, Portland, OR 97213'
    const phone = props.phone ?? '(503) 555-0147'
    const email = props.email ?? 'hello@gracecommunity.church'
    const hours = props.hours ?? 'Mon–Thu: 9 AM – 5 PM'
    const copyright =
      props.copyright ?? 'Grace Community Church. All rights reserved.'
    const legal = props.legal?.length
      ? props.legal
      : ['Privacy', 'Terms', 'Accessibility']

    const socialIcons: Record<string, ReactNode> = {
      Instagram: (
        <svg
          className="size-5"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
      YouTube: (
        <svg
          className="size-5"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
      Facebook: (
        <svg
          className="size-5"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    }

    return (
      <footer
        className={cn(
          'bg-foreground py-16 text-background lg:py-20',
          props.className,
        )}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-16 grid gap-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            <div className="lg:col-span-1">
              <button
                type="button"
                onClick={() => go(homeTarget)}
                className="mb-6 flex items-center gap-2"
              >
                <span className="text-2xl" aria-hidden="true">
                  ✦
                </span>
                <span className="text-xl font-medium tracking-tight">
                  {brand}
                </span>
              </button>
              <p className="mb-6 leading-relaxed text-background/70">{about}</p>
              <div className="flex items-center gap-4">
                {socials.map((social) => (
                  <button
                    key={social}
                    type="button"
                    aria-label={social}
                    onClick={() => go(social)}
                    className="flex size-10 items-center justify-center rounded-full bg-background/10 text-background transition-colors hover:bg-background/20"
                  >
                    {socialIcons[social] ?? (
                      <span className="text-xs font-medium">
                        {social.charAt(0)}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h4 className="mb-6 font-medium">{quickLinksTitle}</h4>
              <ul className="space-y-3 text-background/70">
                {quickLinks.map((link) => (
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
            <div>
              <h4 className="mb-6 font-medium">{resourcesTitle}</h4>
              <ul className="space-y-3 text-background/70">
                {resources.map((link) => (
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
            <div>
              <h4 className="mb-6 font-medium">{contactTitle}</h4>
              <address className="space-y-3 not-italic text-background/70">
                <p>{address}</p>
                <p>
                  <button
                    type="button"
                    onClick={() => go(phone)}
                    className="transition-colors hover:text-background"
                  >
                    {phone}
                  </button>
                </p>
                <p>
                  <button
                    type="button"
                    onClick={() => go(email)}
                    className="transition-colors hover:text-background"
                  >
                    {email}
                  </button>
                </p>
              </address>
              <div className="mt-6 border-t border-background/20 pt-6">
                <p className="text-sm text-background/60">
                  Office Hours
                  <br />
                  {hours}
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center justify-between gap-4 border-t border-background/20 pt-8 sm:flex-row">
            <p className="text-sm text-background/60">
              © {new Date().getFullYear()} {copyright}
            </p>
            <div className="flex items-center gap-6 text-sm text-background/60">
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
