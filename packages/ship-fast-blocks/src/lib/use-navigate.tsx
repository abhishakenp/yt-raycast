import { createContext, useContext } from "react"
import { useStateField } from "@openuidev/react-lang"

// PageSwitch provides the site's route labels via context; useNavigate resolves any
// link/button label to the best route and switches $page. Used by every block that
// renders an internal link or CTA so nothing is ever a dead "#".
export const RoutesContext = createContext<string[]>([])

export function useNavigate() {
  const routes = useContext(RoutesContext)
  const page = useStateField<string>("page")
  return (target?: string) => {
    const t = (target ?? "").trim().toLowerCase()
    if (!routes.length) return
    // exact (case-insensitive) route label match
    const exact = routes.find((r) => r.toLowerCase() === t)
    if (exact) return page.setValue(exact)
    // keyword → route (shop/pricing/contact/about/blog/features/home/work/menu/team/gallery)
    const find = (re: RegExp) => routes.find((r) => re.test(r.toLowerCase()))
    const byKw =
      (/shop|store|product|buy|cart|order|browse|collection/.test(t) && find(/shop|store|product|collection|menu|work|gallery/)) ||
      (/price|plan|pricing|subscribe|upgrade|tier/.test(t) && find(/pric|plan/)) ||
      (/contact|reach|get in touch|book|reserve|demo|quote|sign ?up|start|join|get started|register/.test(t) && find(/contact|book|reserve|demo|start|join/)) ||
      (/about|story|team|who we are|mission/.test(t) && find(/about|team|story/)) ||
      (/blog|news|post|article|read|stories|journal/.test(t) && find(/blog|news|post|article|stories/)) ||
      (/feature|service|how it works|learn|explore|tour/.test(t) && find(/feature|service|how/)) ||
      null
    page.setValue(byKw || routes[0]) // fall back to Home — never a no-op dead link
  }
}
