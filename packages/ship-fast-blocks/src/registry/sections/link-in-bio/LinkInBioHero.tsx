import { defineCapsule } from '#/capsules/openui.ts'
import type { ReactNode } from 'react'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'

/**
 * LinkInBioHero — the opening hero of a minimal "link in bio" / link-hub page,
 * laid out as a single centered narrow column on a calm, light, paper-toned
 * surface. It leads with a circular avatar headshot ringed in the background
 * color with an "available" status dot, then a name, role/tagline, and short
 * bio. Below sits a compact set of headline (primary) link buttons — each with
 * a leading icon tile, a title + subtitle, and a trailing open-link arrow or a
 * 'New' pill — followed by a centered row of round social icon buttons. Every
 * link and social routes through useNavigate; the avatar photo uses the
 * alt-driven Image component. Use as the opening hero of a Linktree/Bento style
 * personal landing page, creator/influencer link hub, freelancer bio link, or
 * social-profile splash — the full big-link list lives in a companion
 * features section and featured content in a companion gallery section.
 * Renders fully with no props.
 */
export const LinkInBioHero = defineCapsule({
  name: 'LinkInBioHero',
  description:
    "Opening hero of a minimal LINK-IN-BIO / link-hub / bio-link page — a single centered narrow column with a calm, light, paper-toned aesthetic. Leads with a circular avatar headshot (ringed in the page color, with an online/available status dot), a name + role/tagline + short bio, then a compact set of headline (primary) link buttons (each with a leading icon tile, title + subtitle, and a trailing open-arrow or 'New' badge), and a centered row of round social icon buttons (Twitter/X, GitHub, Dribbble, LinkedIn). Use as the opening hero / profile head of a Linktree / Bento style personal landing page, creator or influencer link hub, freelancer/portfolio bio link, or social-profile splash; the full big-link button list belongs to a companion features section and featured content to a companion gallery section. Supply content only — brand/name, profile, primary links, socials; the section owns all layout and styling.",
  props: z.object({
    /** Brand / person name shown as the profile heading. */
    brand: z.string().optional(),
    /** Profile / identity block. */
    profile: z
      .object({
        avatarAlt: z.string().optional(),
        status: z.string().optional(),
        role: z.string().optional(),
        bio: z.string().optional(),
      })
      .optional(),
    /** Compact set of headline (primary) link buttons. */
    links: z
      .array(
        z.object({
          /** Icon key: globe | shop | mail | calendar. */
          icon: z.enum(['globe', 'shop', 'mail', 'calendar']),
          title: z.string(),
          subtitle: z.string(),
          /** Optional pill (e.g. "New") shown instead of the trailing arrow. */
          badge: z.string().optional(),
        }),
      )
      .optional(),
    /** Round social icon buttons. */
    socials: z
      .array(
        z.object({
          /** Icon key: twitter | github | dribbble | linkedin. */
          icon: z.enum(['twitter', 'github', 'dribbble', 'linkedin']),
          label: z.string(),
        }),
      )
      .optional(),
    /** Routing keys for the primary link buttons (falls back to each link title). */
    linkTargets: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'Sarah Chen'

    const avatarAlt =
      props.profile?.avatarAlt ??
      'professional headshot of a smiling woman with dark hair wearing a minimal cream sweater'
    const status = props.profile?.status ?? 'Available for work'
    const role = props.profile?.role ?? 'Design Engineer at Notion'
    const bio =
      props.profile?.bio ??
      'Crafting thoughtful interfaces. Writing about design systems, React, and the craft of digital products.'

    const links = props.links?.length
      ? props.links
      : [
          {
            icon: 'globe' as const,
            title: 'Portfolio',
            subtitle: 'sarahchen.design',
          },
          {
            icon: 'shop' as const,
            title: 'UI Kit Shop',
            subtitle: 'Figma templates & icons',
            badge: 'New',
          },
          {
            icon: 'mail' as const,
            title: 'Newsletter',
            subtitle: '12,400+ subscribers',
          },
          {
            icon: 'calendar' as const,
            title: 'Book a Call',
            subtitle: '30 min consultation — $150',
          },
        ]

    const linkTargets = props.linkTargets?.length
      ? props.linkTargets
      : ['Portfolio', 'UI Kit Shop', 'Newsletter', 'Book a Call']

    const socials = props.socials?.length
      ? props.socials
      : [
          { icon: 'twitter' as const, label: 'Twitter' },
          { icon: 'github' as const, label: 'GitHub' },
          { icon: 'dribbble' as const, label: 'Dribbble' },
          { icon: 'linkedin' as const, label: 'LinkedIn' },
        ]

    const linkIcons: Record<string, ReactNode> = {
      globe: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      ),
      shop: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
      mail: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      calendar: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    }

    const socialIcons: Record<string, ReactNode> = {
      twitter: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      github: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
          />
        </svg>
      ),
      dribbble: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c5.51 0 10-4.48 10-10S17.51 2 12 2zm6.605 4.61a8.502 8.502 0 011.93 5.314c-.281-.054-3.101-.629-5.943-.271-.065-.141-.12-.293-.184-.445a25.416 25.416 0 00-.564-1.236c3.145-1.28 4.577-3.124 4.761-3.362zM12 3.475c2.17 0 4.154.813 5.662 2.148-.152.216-1.443 1.941-4.48 3.08-1.399-2.57-2.95-4.675-3.189-5A8.687 8.687 0 0112 3.475zm-3.633.803a53.896 53.896 0 013.167 4.935c-3.992 1.063-7.517 1.04-7.896 1.04a8.581 8.581 0 014.729-5.975zM3.453 12.01v-.26c.37.01 4.512.065 8.775-1.215.245.477.477.965.694 1.453-.109.033-.228.065-.336.098-4.404 1.42-6.747 5.303-6.942 5.629a8.522 8.522 0 01-2.19-5.705zM12 20.547a8.482 8.482 0 01-5.239-1.8c.152-.315 1.888-3.656 6.703-5.337.022-.01.033-.01.054-.022a35.318 35.318 0 011.823 6.475 8.4 8.4 0 01-3.341.684zm4.761-1.465c-.086-.52-.542-3.015-1.659-6.084 2.679-.423 5.022.271 5.314.369a8.468 8.468 0 01-3.655 5.715z"
          />
        </svg>
      ),
      linkedin: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
          />
        </svg>
      ),
    }

    const ExternalArrow = () => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M7 17L17 7M17 7H7M17 7v10" />
      </svg>
    )

    return (
      <header
        className={cn(
          'mx-auto max-w-md px-6 py-16 sm:py-20 lg:py-24',
          props.className,
        )}
      >
        {/* Avatar & identity */}
        <div className="mb-10 text-center">
          <div className="relative mb-5 inline-block">
            <Image
              alt={avatarAlt}
              w={200}
              h={200}
              className="size-24 rounded-full object-cover shadow-sm ring-4 ring-background sm:size-28"
            />
            <span
              className="absolute bottom-1 right-1 size-4 rounded-full bg-primary ring-2 ring-background"
              aria-label={status}
            />
          </div>

          <h1 className="mb-2 text-2xl font-semibold text-foreground sm:text-3xl">
            {brand}
          </h1>
          <p className="text-sm font-light text-muted-foreground sm:text-base">
            {role}
          </p>
          <p className="mx-auto mt-3 max-w-xs text-base leading-relaxed text-foreground/80">
            {bio}
          </p>
        </div>

        {/* Primary links */}
        <nav aria-label="Primary links" className="mb-10 space-y-3">
          {links.map((link, i) => (
            <button
              key={link.title}
              type="button"
              onClick={() => go(linkTargets[i] ?? link.title)}
              className="group flex w-full items-center justify-between rounded-xl border border-border/60 bg-card px-5 py-4 text-left shadow-sm transition-all duration-200 hover:border-border hover:shadow-md"
            >
              <span className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-lg bg-muted text-muted-foreground">
                  {linkIcons[link.icon]}
                </span>
                <span className="text-left">
                  <span className="block font-medium text-card-foreground">
                    {link.title}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {link.subtitle}
                  </span>
                </span>
              </span>
              {link.badge ? (
                <span className="rounded-full bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
                  {link.badge}
                </span>
              ) : (
                <span className="text-muted-foreground transition-colors group-hover:text-foreground">
                  <ExternalArrow />
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Socials */}
        <div className="flex justify-center gap-3">
          {socials.map((social) => (
            <button
              key={social.label}
              type="button"
              aria-label={social.label}
              onClick={() => go(social.label)}
              className="grid size-12 place-items-center rounded-full border border-border/60 bg-card text-muted-foreground transition-all duration-200 hover:border-border hover:text-foreground hover:shadow-sm"
            >
              {socialIcons[social.icon]}
            </button>
          ))}
        </div>
      </header>
    )
  },
})
