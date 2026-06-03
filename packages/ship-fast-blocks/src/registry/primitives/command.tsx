import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import {
  Command as UICommand,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "#/components/ui/command.tsx"

// Compound primitive: command palette / searchable menu. Flattened to
// groups:[{heading, items:[{label,shortcut}]}]. Rendered INLINE (not the
// dialog variant) so it is visible as a static preview.
export const Command = defineComponent({
  name: "Command",
  description:
    "Searchable command palette rendered inline. groups:[{heading, items:[{label,shortcut}]}]. Shows a search box + grouped, selectable items.",
  props: z.object({
    groups: z
      .array(
        z.object({
          heading: z.string().optional(),
          items: z.array(
            z.object({
              label: z.string(),
              shortcut: z.string().optional(),
              disabled: z.boolean().optional(),
            }),
          ),
        }),
      )
      .optional(),
    placeholder: z.string().optional(),
    emptyText: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const groups = props.groups ?? [
      {
        heading: "Suggestions",
        items: [
          { label: "Calendar" },
          { label: "Search Emoji" },
          { label: "Calculator" },
        ],
      },
      {
        heading: "Settings",
        items: [
          { label: "Profile", shortcut: "⌘P" },
          { label: "Billing", shortcut: "⌘B" },
          { label: "Settings", shortcut: "⌘S" },
        ],
      },
    ]
    return (
      <UICommand className={props.className}>
        <CommandInput placeholder={props.placeholder ?? "Type a command or search..."} />
        <CommandList>
          <CommandEmpty>{props.emptyText ?? "No results found."}</CommandEmpty>
          {groups.map((group, gi) => (
            <div key={gi}>
              {gi > 0 && <CommandSeparator />}
              <CommandGroup heading={group.heading}>
                {group.items.map((item, ii) => (
                  <CommandItem key={ii} disabled={item.disabled}>
                    <span>{item.label}</span>
                    {item.shortcut && <CommandShortcut>{item.shortcut}</CommandShortcut>}
                  </CommandItem>
                ))}
              </CommandGroup>
            </div>
          ))}
        </CommandList>
      </UICommand>
    )
  },
})
