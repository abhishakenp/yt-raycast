import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import {
  PersonCard,
  PersonCardContent,
  PersonCardName,
  PersonCardRole,
  PersonCardBio,
} from '#/section-kit/PersonCard.tsx'

/**
 * LawFirmAttorneys — a staggered attorney / partner roster for a law firm. An
 * asymmetric header (mono eyebrow, giant serif heading and lead paragraph left,
 * tabular partner count right) sits above a responsive 3-up grid of plain
 * card-surface plates staggered in editorial rhythm; each has a tall hairline-
 * framed headshot that gently zooms on hover, a mono "No. 0x" index chip in its
 * corner, then a serif name, a mono tracked-uppercase role, a bio, and a row of
 * LinkedIn + email icon links. Authoritative, traditional-yet-modern newsprint
 * aesthetic with sharp binary corners. Imagery uses the alt-driven Image
 * component; the social links route through section-kit route links. Use to
 * introduce leadership, partners or team members on law-firm, attorney,
 * consulting or professional-services pages. Renders fully with no props via
 * baked-in defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { ResponsiveGrid } from '#/section-kit/ResponsiveGrid.tsx'
import { Watermark } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
export const LawFirmAttorneys = defineCapsule({
  name: 'LawFirmAttorneys',
  description:
    'Staggered attorney / partner roster for a law firm: an asymmetric header (mono eyebrow, giant serif heading and lead paragraph left, tabular partner count right) above a responsive 3-up grid of plain card-surface plates staggered in editorial rhythm, each with a tall hairline-framed headshot that gently zooms on hover, a mono "No. 0x" index chip in its corner, a serif name, a mono tracked-uppercase role, a bio and a row of LinkedIn + email icon links. Authoritative, traditional-yet-modern newsprint aesthetic with sharp binary corners; imagery uses the alt-driven Image component and the social links route through section-kit route links. Use to introduce leadership, partners, attorneys or team members on law-firm, attorney, consulting, accounting or professional-services pages.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    description: z.string().optional(),
    items: z
      .array(
        z.object({
          name: z.string(),
          title: z.string(),
          bio: z.string(),
          imageAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Our Team'
    const heading = props.heading ?? 'Leadership & Partners'
    const description =
      props.description ??
      'Our senior partners bring decades of experience from top law firms, government service, and judicial clerkships. Each is recognized by Chambers, Best Lawyers, and Super Lawyers.'
    const items = props.items?.length
      ? props.items
      : [
          {
            name: 'Margaret Chen',
            title: 'Managing Partner, Corporate',
            bio: 'Former SEC counsel with 24 years experience in M&A and securities law. Lead counsel on 47 public company transactions exceeding $8 billion in value.',
            imageAlt:
              'Professional headshot of Margaret Chen, senior partner with confident expression and pearl necklace',
          },
          {
            name: 'James P. Reinhart',
            title: 'Founding Partner, Litigation',
            bio: 'Founded the firm in 1987. Argued 23 cases before the Supreme Court. Former law clerk to Justice Scalia. Chambers Band 1 ranking since 2005.',
            imageAlt:
              'Professional headshot of James P. Reinhart, distinguished senior partner with silver hair and tailored suit',
          },
          {
            name: 'Sarah Mitchell',
            title: 'Partner, Employment & IP',
            bio: 'Dual expertise in employment law and intellectual property. Former General Counsel at two NASDAQ-listed technology companies. Registered patent attorney.',
            imageAlt:
              'Professional headshot of Sarah Mitchell, partner with warm confident smile and elegant professional attire',
          },
          {
            name: 'David Okonkwo',
            title: 'Partner, Real Estate & Tax',
            bio: 'Structured over $1.2 billion in commercial real estate transactions. LL.M. in Taxation from NYU. Former IRS Office of Chief Counsel attorney.',
            imageAlt:
              'Professional headshot of David Okonkwo, partner in dark suit with professional demeanor and subtle confident expression',
          },
          {
            name: 'Elena Vasquez',
            title: 'Partner, Commercial Litigation',
            bio: 'First chair trial attorney with 89 jury trials to verdict. Former federal prosecutor, Southern District of New York. Won precedent-setting securities fraud case in 2023.',
            imageAlt:
              'Professional headshot of Elena Vasquez, partner with sophisticated style and assured professional expression',
          },
          {
            name: 'Robert Thornton',
            title: 'Partner, Estate Planning',
            bio: 'Counsel to ultra-high-net-worth families on generational wealth transfer. Former Chair, New York State Bar Association Trusts and Estates Section. Author of 3 treatises.',
            imageAlt:
              'Professional headshot of Robert Thornton, partner with distinguished gray hair and professional business attire',
          },
        ]
    const LinkedInIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    )
    const MailIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    )
    return (
      <section
        className={cn(
          'relative overflow-hidden bg-background py-20 sm:py-24 lg:py-28',
          props.className,
        )}
      >
        <Watermark className="-left-4 top-10 font-serif text-[9rem] font-normal tracking-tight sm:text-[13rem] lg:text-[16rem]">
          Bar
        </Watermark>
        <Container className="relative">
          <div className="mb-12 flex flex-col gap-6 sm:mb-16 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              align="left"
              eyebrow={eyebrow}
              title={heading}
              subtitle={description}
              className="max-w-3xl gap-0"
              eyebrowClassName="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
              titleClassName="mb-6 font-serif text-4xl font-semibold tracking-tight text-foreground lg:text-5xl"
              subtitleClassName="text-lg leading-relaxed text-muted-foreground"
            />
            <span
              aria-hidden="true"
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] tabular-nums text-muted-foreground/60"
            >
              {String(items.length).padStart(2, '0')} partners
            </span>
          </div>
          <ResponsiveGrid cols="1-md-2-3" className="gap-x-8 gap-y-12">
            {items.map((person, i) => (
              <PersonCard
                key={person.name}
                variant="plain"
                className={cn(
                  'group rounded-none',
                  i % 3 === 1 && 'lg:translate-y-12',
                )}
              >
                <div className="relative overflow-hidden border border-foreground/15">
                  <Image
                    alt={person.imageAlt}
                    w={400}
                    h={500}
                    loading="lazy"
                    className="h-80 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-0 border-b border-r border-foreground/15 bg-card px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.2em] tabular-nums text-muted-foreground"
                  >
                    No. {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <PersonCardContent className="p-6">
                  <PersonCardName className="mb-2 font-serif text-xl font-normal">
                    {person.name}
                  </PersonCardName>
                  <PersonCardRole className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
                    {person.title}
                  </PersonCardRole>
                  <PersonCardBio className="mb-4 leading-relaxed">
                    {person.bio}
                  </PersonCardBio>
                  <div className="flex gap-3 border-t border-border pt-4">
                    <NavbarRouteLink
                      aria-label={`${person.name} on LinkedIn`}
                      className="text-muted-foreground transition-colors hover:text-foreground"
                      href={person.name}
                    >
                      <LinkedInIcon className="size-5" />
                    </NavbarRouteLink>
                    <NavbarRouteLink
                      aria-label={`Email ${person.name}`}
                      className="text-muted-foreground transition-colors hover:text-foreground"
                      href={person.name}
                    >
                      <MailIcon className="size-5" />
                    </NavbarRouteLink>
                  </div>
                </PersonCardContent>
              </PersonCard>
            ))}
          </ResponsiveGrid>
        </Container>
      </section>
    )
  },
})
