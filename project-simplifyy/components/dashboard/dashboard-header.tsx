"use client"

import { useState } from "react"
import { Bell, Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { CreateProjectDialog } from "@/components/dashboard/create-project-dialog"

export function DashboardHeader() {
  const [dialogOpen, setDialogOpen] = useState(false)
  return (
    <header className="flex flex-col gap-4 border-b border-border bg-card px-6 py-5 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground text-balance">
          Welcome, Farisha Shaikh!
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Here&apos;s an overview of your data migration projects.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button size="lg" className="gap-1.5" onClick={() => setDialogOpen(true)}>
          <Plus className="size-4" />
          Create Project
        </Button>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search here..."
            aria-label="Search projects"
            className="h-9 w-56 rounded-full border border-border bg-background pl-9 pr-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
          />
        </div>

        <ThemeToggle />

        <button
          type="button"
          className="relative flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Bell className="size-5" />
          <span className="absolute right-2 top-2 size-1.5 rounded-full bg-primary" />
          <span className="sr-only">Notifications</span>
        </button>
      </div>
      <CreateProjectDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </header>
  )
}
