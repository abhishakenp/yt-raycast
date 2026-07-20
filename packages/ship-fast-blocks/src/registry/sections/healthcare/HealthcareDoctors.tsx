import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import {
  PersonCard,
  PersonCardAvatar,
  PersonCardName,
  PersonCardRole,
  PersonCardBio,
} from '#/section-kit/PersonCard.tsx'

/**
 * HealthcareDoctors — staggered physician-team grid for a medical-clinic page.
 * An asymmetric header (left-aligned mono eyebrow + heading + lede, mono
 * clinician-count meta right) above a responsive 1/2/4-column grid of bare
 * (surfaceless) profile cards where alternate cards step down on desktop for a
 * calm stagger. Each card pairs a tall 3:4 hairline-framed alt-driven headshot
 * that gently zooms on hover with a zero-padded mono index, the doctor's name,
 * a mono uppercase primary specialty line, and a short bio. Tokens-only, no
 * links. Use for a "meet our physicians" / care-team / provider-bios section of
 * a doctors' office, family-medicine practice, pediatric / women's-health
 * clinic, hospital or medical group. Renders fully with no props via baked-in
 * board-certified-physician defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import { ResponsiveGrid } from '#/section-kit/ResponsiveGrid.tsx'
export const HealthcareDoctors = defineCapsule({
  name: 'HealthcareDoctors',
  description:
    "Staggered physician-team grid for a medical-clinic page: an asymmetric header (left-aligned mono eyebrow + heading + lede, mono clinician-count meta right) above a responsive 1/2/4-column grid of bare (surfaceless) profile cards where alternate cards step down on desktop, each pairing a tall 3:4 hairline-framed alt-driven headshot that gently zooms on hover with a zero-padded mono index, the doctor's name, a mono uppercase primary specialty line, and a short bio. Tokens-only, no links. Use for a 'meet our physicians' / care-team / provider-bios section of a doctors' office, family-medicine practice, pediatric / women's-health clinic, hospital or medical group.",
  props: z.object({
    /** Eyebrow chip text above the heading. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    description: z.string().optional(),
    /** Physician profiles: name, specialty, bio, and headshot alt. */
    items: z
      .array(
        z.object({
          name: z.string(),
          specialty: z.string(),
          bio: z.string(),
          photoAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Our Team'
    const heading = props.heading ?? 'Meet our physicians'
    const description =
      props.description ??
      'Board-certified doctors with decades of combined experience, committed to building lasting relationships with every patient.'
    const items = props.items?.length
      ? props.items
      : [
          {
            name: 'Dr. Sarah Chen, MD',
            specialty: 'Internal Medicine',
            bio: 'Harvard Medical School. 15 years experience. Specializes in chronic disease management and preventive care.',
            photoAlt:
              'Professional headshot of Dr. Sarah Chen, a female physician with shoulder-length dark hair wearing a white coat',
          },
          {
            name: 'Dr. James Mitchell, MD',
            specialty: 'Family Medicine',
            bio: 'Stanford University. 12 years experience. Board certified in family medicine with focus on holistic care.',
            photoAlt:
              'Professional headshot of Dr. James Mitchell, a male physician in his 40s with short gray hair and glasses',
          },
          {
            name: 'Dr. Priya Patel, DO',
            specialty: "Women's Health",
            bio: 'Johns Hopkins University. 10 years experience. OB/GYN trained, specializing in reproductive health and wellness.',
            photoAlt:
              'Professional headshot of Dr. Priya Patel, a female physician with long dark hair wearing a white coat and stethoscope',
          },
          {
            name: 'Dr. Michael Torres, MD',
            specialty: 'Pediatrics',
            bio: 'UCSF School of Medicine. 8 years experience. Fellow of the American Academy of Pediatrics. Speaks English and Spanish.',
            photoAlt:
              'Professional headshot of Dr. Michael Torres, a male pediatrician in his 30s with a warm smile',
          },
        ]
    return (
      <section
        className={cn('bg-background py-20 sm:py-24 lg:py-28', props.className)}
        aria-labelledby="doctors-heading"
      >
        <Container>
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-16">
            <SectionHeading
              align="left"
              eyebrow={eyebrow}
              title={heading}
              subtitle={description}
              titleId="doctors-heading"
              className="max-w-2xl gap-0"
              eyebrowClassName="mb-4 inline-block font-mono text-[11px] font-normal uppercase tracking-[0.2em] text-muted-foreground"
              titleClassName="mb-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem] lg:leading-[1.05]"
              subtitleClassName="text-base text-muted-foreground sm:text-lg"
            />
            <MonoTag
              aria-hidden="true"
              tone="faint"
              className="shrink-0 md:pb-1"
            >
              {String(items.length).padStart(2, '0')} / clinicians
            </MonoTag>
          </div>

          <ResponsiveGrid cols="1-md-2-4" className="gap-6 lg:gap-8">
            {items.map((doc, i) => (
              <PersonCard
                key={doc.name}
                variant="bare"
                className={cn(
                  'group rounded-none',
                  i % 2 === 1 && 'lg:translate-y-8',
                )}
              >
                <PersonCardAvatar className="relative mb-6 aspect-[3/4] rounded-none border border-border bg-muted">
                  <Image
                    alt={doc.photoAlt}
                    w={600}
                    h={800}
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <MonoTag
                    aria-hidden="true"
                    tone="inverted"
                    className="absolute left-3 top-3 bg-foreground/70 px-2 py-1 tracking-[0.12em] backdrop-blur-sm"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </MonoTag>
                </PersonCardAvatar>
                <PersonCardName className="mb-2 text-lg font-bold tracking-tight">
                  {doc.name}
                </PersonCardName>
                <PersonCardRole className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
                  {doc.specialty}
                </PersonCardRole>
                <PersonCardBio className="text-sm leading-relaxed">
                  {doc.bio}
                </PersonCardBio>
              </PersonCard>
            ))}
          </ResponsiveGrid>
        </Container>
      </section>
    )
  },
})
