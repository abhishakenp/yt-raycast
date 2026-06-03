import { Calendar } from "#/components/ui/calendar.tsx"
import {
  SidebarGroup,
  SidebarGroupContent,
} from "#/components/ui/sidebar.tsx"

export function DatePicker() {
  return (
    <SidebarGroup className="px-0">
      <SidebarGroupContent>
        <Calendar className="[&_[role=gridcell]]:w-[33px] [&_[role=gridcell].bg-accent]:bg-sidebar-primary [&_[role=gridcell].bg-accent]:text-sidebar-primary-foreground" />
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
