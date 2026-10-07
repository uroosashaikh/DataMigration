import { AppShell } from "@/components/app-shell"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ProjectCards } from "@/components/dashboard/project-cards"
import { ProjectsTable } from "@/components/dashboard/projects-table"

export default function DashboardPage() {
  return (
    <AppShell>
      <DashboardHeader />
      <main className="flex-1 space-y-8 p-6">
        <section aria-label="Featured projects">
          <ProjectCards />
        </section>
        <section aria-label="All projects" className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            All Projects
          </h2>
          <ProjectsTable />
        </section>
      </main>
    </AppShell>
  )
}
