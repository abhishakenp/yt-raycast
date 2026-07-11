import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'

import { Container } from '#/section-kit/Container.tsx'

/**
 * CybersecurityGallery — platform-screenshot gallery. A light section with a
 * centered heading + subheading above a responsive 2-to-3 column grid of
 * bordered, shadowed cards. Each card is a clickable tile with an alt-driven
 * screenshot image (zooms on hover) over a title + short caption, routing
 * through useNavigate. Use to showcase product surfaces / dashboards for
 * cybersecurity vendors, SOC/MDR providers, or any visual B2B security SaaS.
 * Renders fully with no props via baked-in platform-view defaults.
 */
export const CybersecurityGallery = defineCapsule({
  name: 'CybersecurityGallery',
  description:
    'Platform-screenshot gallery: a light section with a centered heading + subheading above a responsive 2-to-3 column grid of bordered, shadowed clickable cards, each with an alt-driven screenshot image (zooms on hover) over a title + short caption, routing through useNavigate. Use to showcase product surfaces / dashboards for cybersecurity vendors, SOC/MDR providers, or any visual B2B security SaaS.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting description under the heading. */
    description: z.string().optional(),
    /** Gallery cards (title doubles as image alt + nav target). */
    items: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heading = props.heading ?? 'Platform overview'
    const description =
      props.description ??
      'Unified security management from a single pane of glass'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Threat Intelligence Dashboard',
            description:
              'Real-time global threat map with attack vector analysis and severity scoring.',
          },
          {
            title: 'Vulnerability Management',
            description:
              'Continuous scanning with prioritized remediation recommendations.',
          },
          {
            title: 'Incident Response',
            description:
              'Automated playbooks with team collaboration and audit trails.',
          },
          {
            title: 'Cloud Security Posture',
            description:
              'Multi-cloud configuration monitoring with auto-remediation.',
          },
          {
            title: 'Zero Trust Network',
            description:
              'Micro-segmentation with identity-based access controls.',
          },
          {
            title: 'Compliance Reports',
            description:
              'Automated evidence collection for SOC 2, ISO 27001, and more.',
          },
        ]

    return (
      <section className={cn('bg-background py-24', props.className)}>
        <Container>
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">{heading}</h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <button
                key={item.title}
                type="button"
                onClick={() => go(item.title)}
                className="group overflow-hidden rounded-2xl border border-border text-left shadow-lg"
              >
                <Image
                  alt={item.title}
                  w={600}
                  h={400}
                  loading="lazy"
                  className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="p-6">
                  <h3 className="mb-2 text-lg font-bold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </Container>
      </section>
    )
  },
})
