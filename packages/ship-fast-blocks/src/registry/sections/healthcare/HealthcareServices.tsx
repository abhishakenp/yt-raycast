import type { ReactNode } from 'react'
import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

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
export const HealthcareServices = defineComponent({
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
  component: ({ props }) => {
    const go = useNavigate()
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

    const ChevronRight = () => (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 5l7 7-7 7" />
      </svg>
    )

    const serviceIcons: ReactNode[] = [
      <svg
        key="primary"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      <svg
        key="virtual"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>,
      <svg
        key="womens"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>,
      <svg
        key="pediatrics"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      <svg
        key="mental"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>,
      <svg
        key="labs"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>,
    ]

    return (
      <section
        className={cn('bg-muted py-20 lg:py-28', props.className)}
        aria-labelledby="services-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item, i) => (
              <article
                key={item.title}
                className="rounded-2xl border border-border bg-card p-8 transition-shadow hover:shadow-lg"
              >
                <div className="mb-6 grid size-14 place-items-center rounded-xl bg-accent text-primary">
                  {serviceIcons[i % serviceIcons.length]}
                </div>
                <h3 className="mb-3 text-xl font-bold text-card-foreground">
                  {item.title}
                </h3>
                <p className="mb-4 leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
                <button
                  type="button"
                  onClick={() => go(item.cta)}
                  className="inline-flex items-center font-semibold text-primary transition-colors hover:text-primary/80"
                >
                  {item.cta}
                  <span className="ml-1">
                    <ChevronRight />
                  </span>
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
