import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import {
  AlertDialog as UIAlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '#/components/ui/alert-dialog.tsx'
import { Button } from '#/components/ui/button.tsx'

// Overlay: flatten the confirm-dialog parts into title/description + action /
// cancel labels. Rendered open by default so the content is visible.
export const AlertDialog = defineCapsule({
  name: 'AlertDialog',
  description:
    "Confirmation modal with a title, description, cancel and action buttons. Open by default in preview. size 'sm' for compact.",
  props: z.object({
    title: z.string(),
    description: z.string().optional(),
    actionLabel: z.string().optional(),
    cancelLabel: z.string().optional(),
    actionVariant: z
      .enum(['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'])
      .optional(),
    size: z.enum(['default', 'sm']).optional(),
    triggerLabel: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => (
    <UIAlertDialog defaultOpen>
      <AlertDialogTrigger asChild>
        <Button variant="outline">{props.triggerLabel ?? 'Open'}</Button>
      </AlertDialogTrigger>
      <AlertDialogContent size={props.size} className={props.className}>
        <AlertDialogHeader>
          <AlertDialogTitle>{props.title}</AlertDialogTitle>
          {props.description && (
            <AlertDialogDescription>{props.description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{props.cancelLabel ?? 'Cancel'}</AlertDialogCancel>
          <AlertDialogAction variant={props.actionVariant}>
            {props.actionLabel ?? 'Continue'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </UIAlertDialog>
  ),
})
