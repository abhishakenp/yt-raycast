import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import {
  PersonCard,
  PersonCardName,
  PersonCardRole,
  PersonCardBio,
} from '#/section-kit/PersonCard.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import { ResponsiveGrid } from '#/section-kit/ResponsiveGrid.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * MentalHealthTeam — a warm-editorial clinician gallery for a therapy practice.
 * An asymmetric header (left-aligned mono eyebrow + serif heading + lede, mono
 * clinician-count meta right) above a responsive 1/2/4-column grid of bare
 * cards where alternate cards drop a step on desktop for a calm stagger; each
 * card pairs a tall square headshot that zooms gently on hover with a serif
 * name, a mono uppercase primary role label, and a short bio, followed by a
 * soft muted "looking for a specific specialty?" band with a square
 * therapist-matching link. Calm, warm, sage-and-sand wellness aesthetic. The
 * specialty link routes through section-kit route links; headshots use the
 * alt-driven Image component. Use to introduce therapists, counselors,
 * psychologists or psychiatrists at a mental-health practice.
 */
export const MentalHealthTeam = defineCapsule({
  name: 'MentalHealthTeam',
  description:
    "Warm-editorial clinician gallery for a therapy practice: an asymmetric header (left-aligned mono eyebrow + serif heading + lede, mono clinician-count meta right) above a responsive 1/2/4-column grid of bare cards where alternate cards drop a step on desktop, each pairing a tall square headshot that zooms gently on hover with a serif name, a mono uppercase primary role label, and a short bio, then a soft muted 'looking for a specific specialty?' band with a square therapist-matching link. Calm, warm, sage-and-sand wellness aesthetic. The specialty link routes through section-kit route links; headshots use the Image component. Use to introduce therapists, counselors, psychologists or psychiatrists at a mental-health practice.",
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    description: z.string().optional(),
    members: z
      .array(
        z.object({
          name: z.string(),
          role: z.string(),
          bio: z.string(),
          imageAlt: z.string(),
        }),
      )
      .optional(),
    specialtyHeading: z.string().optional(),
    specialtyDescription: z.string().optional(),
    specialtyCta: z.string().optional(),
    /** Navigation target for the specialty / matching link (e.g. "Book Session"). */
    bookLabel: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Our Team'
    const heading = props.heading ?? 'Experienced, compassionate clinicians'
    const description =
      props.description ??
      'Our therapists are licensed professionals with advanced training in evidence-based approaches.'
    const members = props.members?.length
      ? props.members
      : [
          {
            name: 'Dr. Sarah Chen, PsyD',
            role: 'Clinical Director',
            bio: 'Specializes in anxiety disorders, trauma, and EMDR. 12+ years experience. Licensed in Oregon since 2015.',
            imageAlt:
              'Professional headshot of Dr. Sarah Chen, a licensed clinical psychologist with warm smile and professional attire',
          },
          {
            name: 'Marcus Williams, LMFT',
            role: 'Couples & Family Specialist',
            bio: 'Gottman-certified couples therapist. Expert in family systems, divorce mediation, and co-parenting support.',
            imageAlt:
              'Professional headshot of Marcus Williams, a licensed marriage and family therapist with kind expression',
          },
          {
            name: 'Dr. Elena Rodriguez, MD',
            role: 'Psychiatrist',
            bio: 'Board-certified psychiatrist. Medication management for depression, anxiety, bipolar, and ADHD. Available Thursdays.',
            imageAlt:
              'Professional headshot of Dr. Elena Rodriguez, a psychiatrist with compassionate demeanor',
          },
          {
            name: 'Jennifer Park, LCSW',
            role: 'Anxiety & Life Transitions',
            bio: "CBT and mindfulness-based therapy. Special focus on young adults, career transitions, and women's mental health.",
            imageAlt:
              'Professional headshot of Jennifer Park, a licensed clinical social worker with warm approachable presence',
          },
        ]
    const specialtyHeading =
      props.specialtyHeading ?? 'Looking for a specific specialty?'
    const specialtyDescription =
      props.specialtyDescription ??
      'We also have clinicians specializing in eating disorders, substance recovery, LGBTQ+ affirming care, and adolescent therapy.'
    const specialtyCta =
      props.specialtyCta ?? 'Contact us for therapist matching'
    const bookLabel = props.bookLabel ?? 'Book Session'

    return (
      <section
        className={cn('bg-muted/30 py-20 sm:py-24 lg:py-28', props.className)}
      >
        <Container size="lg">
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-16">
            <SectionHeading
              align="left"
              eyebrow={eyebrow}
              title={heading}
              subtitle={description}
              className="max-w-2xl gap-0"
              eyebrowClassName="mb-4 inline-block font-mono text-[11px] font-normal uppercase tracking-[0.2em] text-muted-foreground"
              titleClassName="mb-4 font-serif text-3xl font-medium tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem] lg:leading-[1.08]"
              subtitleClassName="text-base leading-relaxed text-muted-foreground sm:text-lg"
            />
            <MonoTag
              aria-hidden="true"
              tone="faint"
              className="shrink-0 md:pb-1"
            >
              {String(members.length).padStart(2, '0')} / clinicians
            </MonoTag>
          </div>

          <ResponsiveGrid cols="1-2-4" className="gap-6 lg:gap-8">
            {members.map((m, i) => (
              <PersonCard
                key={m.name}
                variant="bare"
                className={cn(
                  'group rounded-none',
                  i % 2 === 1 && 'lg:translate-y-8',
                )}
              >
                <div className="relative mb-4 overflow-hidden rounded-none border border-border">
                  <Image
                    alt={m.imageAlt}
                    w={400}
                    h={500}
                    loading="lazy"
                    className="h-80 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <PersonCardName className="font-serif text-lg font-medium tracking-tight">
                  {m.name}
                </PersonCardName>
                <PersonCardRole className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
                  {m.role}
                </PersonCardRole>
                <PersonCardBio className="leading-relaxed">
                  {m.bio}
                </PersonCardBio>
              </PersonCard>
            ))}
          </ResponsiveGrid>

          <div className="mt-14 flex flex-col gap-6 border border-border bg-background p-8 md:flex-row md:items-center md:justify-between lg:mt-16">
            <div className="max-w-2xl">
              <h3 className="mb-2 font-serif text-xl font-medium tracking-tight text-foreground">
                {specialtyHeading}
              </h3>
              <p className="leading-relaxed text-muted-foreground">
                {specialtyDescription}
              </p>
            </div>
            <NavbarRouteLink
              className="inline-flex w-fit shrink-0 items-center gap-2 rounded-none border border-foreground/25 bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted active:translate-y-px"
              href={bookLabel}
            >
              {specialtyCta}
              <svg
                className="size-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </NavbarRouteLink>
          </div>
        </Container>
      </section>
    )
  },
})
