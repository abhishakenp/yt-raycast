import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import {
  localServiceItem,
  useSyncLocalServices,
} from '../local-service/local-service-interactions.tsx'
import { localServiceLakebed } from '../local-service/local-service-lakebed.ts'

/**
 * HealthcareServices — medical services grid for a clinic / primary-care page.
 * A centered eyebrow chip, heading and intro above a responsive 1/2/3-column
 * grid of bordered cards; each card has a soft accent-tinted icon tile, a
 * title, a description, and a chevron "book" link routing through useNavigate.
 * Cards lift on hover. A built-in set of medical icons (shield, video, heart,
 * smiley, chart, beaker) rotates across the cards. Use for a services / "what
 * we treat" section of a doctors' office, family-medicine, women's-health,
 * pediatric, mental-health or telehealth clinic. Renders fully with no props.
 */
import { Container } from '#/section-kit/Container.tsx'
import { FeatureGrid } from '#/section-kit/FeatureGrid.tsx'
export const HealthcareServices = defineCapsule({
  name: 'HealthcareServices',
  description:
    "Medical services grid for a clinic / primary-care page: a centered eyebrow chip, heading and intro above a responsive 1/2/3-column grid of bordered cards, each with a soft accent-tinted icon tile, title, description, and a chevron 'book' link routing through useNavigate. Cards lift on hover and a built-in set of medical icons (shield, video, heart, smiley, chart, beaker) rotates across them. Use for a services / 'what we treat' section of a doctors' office, family-medicine, women's-health, pediatric, mental-health or telehealth clinic.",
  props: z.object({
    /** Eyebrow chip text above the heading. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    description: z.string().optional(),
    /** Service cards: title, description, and book-link label. */
    items: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
          cta: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: localServiceLakebed,
  component: ({ props, lakebed }) => {
    const eyebrow = props.eyebrow ?? 'Our Services'
    const heading =
      props.heading ?? 'Comprehensive care for every stage of life'
    const description =
      props.description ??
      'From routine checkups to specialized treatments, our board-certified physicians provide personalized care tailored to your unique health needs.'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Primary Care',
            description:
              'Comprehensive annual physicals, chronic disease management, and preventive screenings. We manage diabetes, hypertension, asthma, and more.',
            cta: 'Book primary care',
          },
          {
            title: 'Virtual Visits',
            description:
              'Connect with your doctor from home for follow-ups, medication refills, and minor concerns. HIPAA-compliant video appointments available same-day.',
            cta: 'Schedule virtual visit',
          },
          {
            title: "Women's Health",
            description:
              'Annual well-woman exams, Pap smears, breast health screenings, family planning, menopause management, and hormone therapy consultations.',
            cta: "Book women's health visit",
          },
          {
            title: 'Pediatrics',
            description:
              'Complete care for infants, children, and adolescents. Well-child visits, immunizations, school physicals, and developmental screenings.',
            cta: 'Schedule pediatric visit',
          },
          {
            title: 'Mental Health',
            description:
              'Integrated behavioral health services including anxiety and depression screening, counseling referrals, and medication management.',
            cta: 'Book mental health visit',
          },
          {
            title: 'Lab & Diagnostics',
            description:
              'On-site blood work, urine testing, EKGs, and rapid strep/flu tests. Most results available within 24-48 hours through your patient portal.',
            cta: 'Learn about labs',
          },
        ]
    useSyncLocalServices(
      lakebed,
      items.map((item) =>
        localServiceItem({
          name: item.title,
          summary: item.description,
        }),
      ),
    )
    return (
      <section
        className={cn('bg-muted py-20 lg:py-28', props.className)}
        aria-labelledby="services-heading"
      >
        <Container>
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <span className="mb-4 inline-block rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-accent-foreground">
              {eyebrow}
            </span>
            <h2
              id="services-heading"
              className="mb-4 text-3xl font-bold text-foreground sm:text-4xl"
            >
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>

          <FeatureGrid features={items} columns={3} />
        </Container>
      </section>
    )
  },
})
