import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { Kbd as UIKbd, KbdGroup } from '#/components/ui/kbd.tsx'

// Leaf primitive: a single keyboard key cap.
export const Kbd = defineCapsule({
  name: 'Kbd',
  description: "Keyboard key cap, e.g. label '⌘' or 'Esc'.",
  props: z.object({
    label: z.string(),
    className: z.string().optional(),
  }),
  component: ({ props }) => (
    <UIKbd className={props.className}>{props.label}</UIKbd>
  ),
})

// Flatten KbdGroup: a row of key caps for a shortcut combo, e.g. keys ['⌘','K'].
export const KbdCombo = defineCapsule({
  name: 'KbdCombo',
  description:
    "Row of keyboard key caps forming a shortcut, e.g. keys ['⌘','K'].",
  props: z.object({
    keys: z.array(z.string()),
    className: z.string().optional(),
  }),
  component: ({ props }) => (
    <KbdGroup className={props.className}>
      {props.keys.map((key, i) => (
        <UIKbd key={i}>{key}</UIKbd>
      ))}
    </KbdGroup>
  ),
})
