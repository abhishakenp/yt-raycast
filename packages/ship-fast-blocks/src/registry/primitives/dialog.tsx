import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import {
  Dialog as UIDialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "#/components/ui/dialog.tsx"
import { Button } from "#/components/ui/button.tsx"

// Overlay: flatten Dialog/Trigger/Content/Header/Title/Description/Footer into
// one node. Rendered open by default (defaultOpen) so the content is visible.
export const Dialog = defineComponent({
  name: "Dialog",
  description:
    "Modal dialog. Shows a trigger button and opens centered content with title, description, body (children) and footer. Open by default in preview.",
  props: z.object({
    title: z.string(),
    description: z.string().optional(),
    children: z.array(z.any()).optional(),
    footer: z.array(z.any()).optional(),
    triggerLabel: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props, renderNode }) => (
    <UIDialog defaultOpen>
      <DialogTrigger asChild>
        <Button variant="outline">{props.triggerLabel ?? "Open"}</Button>
      </DialogTrigger>
      <DialogContent className={props.className}>
        <DialogHeader>
          <DialogTitle>{props.title}</DialogTitle>
          {props.description && (
            <DialogDescription>{props.description}</DialogDescription>
          )}
        </DialogHeader>
        {props.children && renderNode(props.children)}
        {props.footer && <DialogFooter>{renderNode(props.footer)}</DialogFooter>}
      </DialogContent>
    </UIDialog>
  ),
})
