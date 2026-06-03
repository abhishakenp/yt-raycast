import { z } from "zod/v4"
import { defineComponent, useStateField } from "@openuidev/react-lang"
import { RoutesContext } from "#/lib/use-navigate.tsx"

// System-owned multi-page switcher. The orchestrator emits exactly one of these as `root`.
// routes[i] is the nav label; pages[i] is the page node for that route. Renders only the
// active page (by $page state, default routes[0]). Never picked by the model.
export const PageSwitch = defineComponent({
  name: "PageSwitch",
  description:
    "INTERNAL site router — do not select this directly. Renders one page at a time, switched by the shared $page state.",
  props: z.object({
    routes: z.array(z.string()),
    pages: z.array(z.any()),
    className: z.string().optional(),
  }),
  component: ({ props, renderNode }) => {
    const routes = props.routes ?? []
    const page = useStateField<string>("page", routes[0])
    let idx = routes.indexOf(page.value)
    if (idx < 0) idx = 0
    const node = props.pages?.[idx]
    return (
      <RoutesContext.Provider value={routes}>
        <div className={props.className}>{node != null ? renderNode(node) : null}</div>
      </RoutesContext.Provider>
    )
  },
})
