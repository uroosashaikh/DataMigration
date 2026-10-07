import { AppShell } from "@/components/app-shell"
import { ProjectNav } from "@/components/project-nav"
import { MappingWorkspace } from "@/components/mapping/mapping-workspace"
import { getProject } from "@/lib/mock-data"

export default async function MappingPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const project = getProject(id)

  return (
    <AppShell>
      <ProjectNav projectId={project.id} projectName={project.name} active="mapping" />
      <main className="flex-1 p-6">
        <MappingWorkspace />
      </main>
    </AppShell>
  )
}
