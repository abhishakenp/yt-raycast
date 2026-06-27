import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { SignInButton } from '#/section-kit/SignInButton.tsx'

export const SignIn = defineCapsule({
  name: 'SignIn',
  description:
    "A REAL working sign-in button wired to the site's Shoo/lakebed auth — shows 'Sign in' for guests and an account menu with Sign out when authenticated. Use anywhere a site needs real login (nav CTA, hero, account area). NOT a dummy/page-switch button.",
  props: z.object({
    label: z.string().optional(),
    variant: z.enum(['primary', 'outline', 'ghost']).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => (
    <SignInButton
      label={props.label}
      variant={props.variant}
      className={props.className}
    />
  ),
})
