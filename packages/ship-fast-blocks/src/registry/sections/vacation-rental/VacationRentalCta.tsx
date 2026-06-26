import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { CtaBand } from '#/section-kit/CtaBand.tsx'

/**
 * VacationRentalCta — a closing call-to-action band for a vacation-rental listing
 * page. Thin configuration over the shared `CtaBand` composite on a primary-tone
 * surface: an optional eyebrow, an inviting "Book your stay" title, a supporting
 * subtitle, and a row of routable pill actions (a primary "Book Now" and an
 * outline "Contact host"). Centered layout; actions route through useNavigate.
 * Theme-token only. Use as the booking nudge near the end of a vacation rental,
 * beach house, cabin, villa, or boutique short-stay page. Renders fully with no
 * props via baked-in defaults.
 */
export const VacationRentalCta = defineComponent({
  name: 'VacationRentalCta',
  description:
    'Closing call-to-action band for a vacation-rental listing page built on the shared CtaBand composite on a primary-tone surface: an optional eyebrow, an inviting Book your stay title, a supporting subtitle, and a row of routable pill actions (a primary Book Now and an outline Contact host). Centered layout; actions route through useNavigate. Theme-token only. Use as the booking nudge near the end of a vacation rental, beach house, cabin, villa, or boutique short-stay page.',
  props: z.object({
    /** Small eyebrow label above the title. */
    eyebrow: z.string().optional(),
    /** Band title. */
    title: z.string().optional(),
    /** Supporting subtitle under the title. */
    subtitle: z.string().optional(),
    /** Primary action label. */
    primaryLabel: z.string().optional(),
    /** Primary action navigation target. */
    primaryTarget: z.string().optional(),
    /** Outline action label. */
    secondaryLabel: z.string().optional(),
    /** Outline action navigation target. */
    secondaryTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    return (
      <CtaBand
        tone="primary"
        align="center"
        eyebrow={props.eyebrow ?? 'Dates fill up fast'}
        title={props.title ?? 'Book your stay'}
        subtitle={
          props.subtitle ??
          'Reserve your dates today and start counting down to slow mornings, salt air, and golden-hour swims.'
        }
        actions={[
          {
            label: props.primaryLabel ?? 'Book Now',
            target: props.primaryTarget ?? 'Book Now',
            variant: 'primary',
          },
          {
            label: props.secondaryLabel ?? 'Contact host',
            target: props.secondaryTarget ?? 'Contact',
            variant: 'outline',
          },
        ]}
        className={props.className}
      />
    )
  },
})
