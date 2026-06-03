import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import {
  Breadcrumb as UIBreadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "#/components/ui/breadcrumb.tsx"

// Compound primitive: flatten Breadcrumb/BreadcrumbList/BreadcrumbItem/... into
// a single `items` array. The last item renders as the current page (non-link);
// earlier items render as links with separators between them.
export const Breadcrumb = defineComponent({
  name: "Breadcrumb",
  description:
    "Hierarchical breadcrumb trail. `items` is ordered root -> current; the last item is the current page.",
  props: z.object({
    items: z
      .array(z.object({ label: z.string(), href: z.string().optional() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const items = props.items?.length
      ? props.items
      : [
          { label: "Home", href: "#" },
          { label: "Components", href: "#" },
          { label: "Breadcrumb" },
        ]
    const lastIndex = items.length - 1
    return (
      <UIBreadcrumb className={props.className}>
        <BreadcrumbList>
          {items.map((item, i) => (
            <BreadcrumbItem key={i}>
              {i === lastIndex ? (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              ) : (
                <>
                  <BreadcrumbLink href={item.href ?? "#"}>
                    {item.label}
                  </BreadcrumbLink>
                  <BreadcrumbSeparator />
                </>
              )}
            </BreadcrumbItem>
          ))}
        </BreadcrumbList>
      </UIBreadcrumb>
    )
  },
})
