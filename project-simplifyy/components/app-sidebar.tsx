"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { PieChart, FolderClosed, CalendarDays, BookText, MessageSquare, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

const navItems = [
  { icon: PieChart, label: "Dashboard", href: "/" },
  { icon: FolderClosed, label: "Projects", href: "/#projects" },
  { icon: CalendarDays, label: "Schedule", href: "/#schedule" },
  { icon: BookText, label: "Documentation", href: "/#docs" },
  { icon: MessageSquare, label: "Messages", href: "/#messages" },
  { icon: Settings, label: "Settings", href: "/#settings" },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex w-16 shrink-0 flex-col items-center gap-1 border-r border-sidebar-border bg-sidebar py-5">
      <div className="relative mb-6 flex size-10 items-center justify-center">
        <span className="size-9 rounded-full bg-muted" aria-hidden />
        <span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-sidebar bg-primary" aria-hidden />
        <span className="sr-only">User avatar</span>
      </div>

      <nav className="flex flex-col items-center gap-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/" ? pathname === "/" || pathname.startsWith("/project") : false
          return (
            <Tooltip key={item.label}>
              <TooltipTrigger
                render={
                  <Link
                    href={item.href}
                    className={cn(
                      "flex size-10 items-center justify-center rounded-lg text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      isActive && "bg-sidebar-accent text-sidebar-primary",
                    )}
                  >
                    <item.icon className="size-5" strokeWidth={2} />
                    <span className="sr-only">{item.label}</span>
                  </Link>
                }
              />
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          )
        })}
      </nav>
    </aside>
  )
}
