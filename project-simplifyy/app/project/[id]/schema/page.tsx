import { AppShell } from "@/components/app-shell"
import { ProjectNav } from "@/components/project-nav"
import { SchemaWorkspace } from "@/components/schema/schema-workspace"
import { getProject } from "@/lib/mock-data"

export default async function SchemaPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ name?: string; source?: string; target?: string; sourceSchema?: string; targetSchema?: string }>
}) {
  const { id } = await params
  const query = await searchParams
  const baseProject = getProject(id)
  const project = {
    ...baseProject,
    name: query.name || baseProject.name,
    source: query.source || baseProject.source,
    target: query.target || baseProject.target,
  }

  return (
    <AppShell>
      <ProjectNav projectId={project.id} projectName={project.name} active="schema" />
      <main className="flex-1 p-6">
        <SchemaWorkspace />
      </main>
    </AppShell>
  )
}
