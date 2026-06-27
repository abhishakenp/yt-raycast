import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import {
  InputOTP as UIInputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from '#/components/ui/input-otp.tsx'

// Compound: flatten OTP input into one node. `length` slots, optional split
// into two groups around a separator. Renders a static preview with a default
// value so the slots show characters.
export const InputOTP = defineCapsule({
  name: 'InputOTP',
  description:
    'One-time-passcode input with `length` slots. Set `separated` to split into two groups with a divider. Mirrors shadcn InputOTP.',
  props: z.object({
    length: z.number().optional(),
    defaultValue: z.string().optional(),
    separated: z.boolean().optional(),
    disabled: z.boolean().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const length = props.length ?? 6
    if (props.separated) {
      const half = Math.ceil(length / 2)
      return (
        <UIInputOTP
          maxLength={length}
          defaultValue={props.defaultValue}
          disabled={props.disabled}
          className={props.className}
        >
          <InputOTPGroup>
            {Array.from({ length: half }, (_, i) => (
              <InputOTPSlot key={i} index={i} />
            ))}
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            {Array.from({ length: length - half }, (_, i) => (
              <InputOTPSlot key={half + i} index={half + i} />
            ))}
          </InputOTPGroup>
        </UIInputOTP>
      )
    }
    return (
      <UIInputOTP
        maxLength={length}
        defaultValue={props.defaultValue}
        disabled={props.disabled}
        className={props.className}
      >
        <InputOTPGroup>
          {Array.from({ length }, (_, i) => (
            <InputOTPSlot key={i} index={i} />
          ))}
        </InputOTPGroup>
      </UIInputOTP>
    )
  },
})
