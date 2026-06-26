import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import {
  Combobox as UICombobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '#/components/ui/combobox.tsx'

// Compound overlay (Base UI): searchable input + filtered option list.
// Flattened into one node; `items` are the options. Rendered `defaultOpen`
// so the option list is statically visible.
export const Combobox = defineComponent({
  name: 'Combobox',
  description:
    'Searchable select: type to filter `items`. `placeholder` labels the empty input. Open by default for preview.',
  props: z.object({
    items: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    placeholder: z.string().optional(),
    emptyMessage: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const items = props.items ?? [
      { value: 'next', label: 'Next.js' },
      { value: 'remix', label: 'Remix' },
      { value: 'astro', label: 'Astro' },
      { value: 'nuxt', label: 'Nuxt' },
    ]
    return (
      <UICombobox items={items.map((it) => it.label)} defaultOpen>
        <ComboboxInput
          placeholder={props.placeholder ?? 'Search...'}
          className={props.className}
          showClear
        />
        <ComboboxContent>
          <ComboboxEmpty>
            {props.emptyMessage ?? 'No results found.'}
          </ComboboxEmpty>
          <ComboboxList>
            {items.map((it) => (
              <ComboboxItem key={it.value} value={it.label}>
                {it.label}
              </ComboboxItem>
            ))}
          </ComboboxList>
        </ComboboxContent>
      </UICombobox>
    )
  },
})
