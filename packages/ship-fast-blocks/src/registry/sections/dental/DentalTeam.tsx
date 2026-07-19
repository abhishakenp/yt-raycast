import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'
import {
  PersonCard,
  PersonCardAvatar,
  PersonCardContent,
  PersonCardName,
  PersonCardRole,
  PersonCardBio,
} from '#/section-kit/PersonCard.tsx'

/**
 * DentalTeam — meet-the-team grid for a dental practice site. On a soft muted
 * band: a centered eyebrow + heading + lede above a responsive 1-to-4 column
 * grid of card-framed dentist profiles, each with a tall headshot photo, name,
 * primary-colored role, short bio, and a round LinkedIn icon button that
 * brightens to the primary color on hover. Links route through useNavigate;
 * headshots use the alt-driven Image component. Use to introduce
 * board-certified dentists, orthodontists, or oral surgeons for a clinic site.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { ResponsiveGrid } from '#/section-kit/ResponsiveGrid.tsx'
export const DentalTeam = defineCapsule({
  name: 'DentalTeam',
  description:
    'Meet-the-team grid for a dental practice site on a soft muted band: a centered eyebrow + heading + lede above a responsive 1-to-4 column grid of card-framed dentist profiles, each with a tall headshot photo, name, primary-colored role, short bio, and a round LinkedIn icon button that brightens to the primary color on hover. Links route through useNavigate; headshots use the Image component. Use to introduce board-certified dentists, orthodontists, or oral surgeons for a clinic site.',
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
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const teamEyebrow = props.eyebrow ?? 'Meet Our Team'
    const teamHeading = props.heading ?? 'Expert dentists who truly care'
    const teamDesc =
      props.description ??
      'Our board-certified dentists bring decades of combined experience and a genuine passion for helping patients achieve their healthiest, most confident smiles.'
    const teamMembers = props.members?.length
      ? props.members
      : [
          {
            name: 'Dr. Sarah Chen, DDS',
            role: 'Founder & Lead Dentist',
            bio: 'Harvard School of Dental Medicine graduate with 15+ years of experience in cosmetic and restorative dentistry.',
            imageAlt:
              'Professional headshot of Dr. Sarah Chen, female dentist in white coat with warm smile',
          },
          {
            name: 'Dr. Michael Torres, DMD',
            role: 'Orthodontist',
            bio: 'Board-certified orthodontist specializing in Invisalign and complex bite corrections for patients of all ages.',
            imageAlt:
              'Professional headshot of Dr. Michael Torres, male dentist with friendly confident expression',
          },
          {
            name: 'Dr. Emily Watson, DDS',
            role: 'Pediatric Specialist',
            bio: 'Certified pediatric dentist creating positive dental experiences for children from their first tooth through their teens.',
            imageAlt:
              'Professional headshot of Dr. Emily Watson, female dentist with warm approachable smile',
          },
          {
            name: 'Dr. James Park, MD',
            role: 'Oral Surgeon',
            bio: 'Oral and maxillofacial surgeon specializing in dental implants, wisdom teeth extraction, and reconstructive procedures.',
            imageAlt:
              'Professional headshot of Dr. James Park, male oral surgeon with confident professional demeanor',
          },
        ]
    return (
      <section className={cn('bg-muted py-24', props.className)}>
        <Container>
          <SectionHeading
            eyebrow={teamEyebrow}
            title={teamHeading}
            subtitle={teamDesc}
            className="mb-16 max-w-3xl gap-0"
            eyebrowClassName="mb-3 inline-block text-xs font-semibold tracking-wider text-primary"
            titleClassName="mb-4 text-3xl font-bold text-foreground sm:text-4xl"
            subtitleClassName="text-lg text-muted-foreground"
          />
          <ResponsiveGrid cols="1-2-4">
            {teamMembers.map((m) => (
              <PersonCard
                key={m.name}
                variant="elevated"

                className="transition-shadow hover:shadow-xl rounded-2xl"
              >
                <PersonCardAvatar className="aspect-[3/4]">
                  <Image
                    alt={m.imageAlt}
                    w={600}
                    h={800}
                    loading="lazy"
                    className="size-full object-cover"
                  />
                </PersonCardAvatar>
                <PersonCardContent className="p-6">
                  <PersonCardName className="mb-1 text-xl font-bold text-card-foreground">
                    {m.name}
                  </PersonCardName>
                  <PersonCardRole className="mb-3 text-base font-medium text-primary">
                    {m.role}
                  </PersonCardRole>
                  <PersonCardBio className="mb-4 leading-relaxed">
                    {m.bio}
                  </PersonCardBio>
                  <button
                    type="button"
                    aria-label={`LinkedIn profile of ${m.name}`}
                    onClick={() => go(`${m.name} on LinkedIn`)}
                    className="grid size-8 place-items-center rounded-full bg-secondary text-secondary-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="size-4"
                      aria-hidden="true"
                    >
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.14-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </button>
                </PersonCardContent>
              </PersonCard>
            ))}
          </ResponsiveGrid>
        </Container>
      </section>
    )
  },
})
