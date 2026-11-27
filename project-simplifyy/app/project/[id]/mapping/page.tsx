import { Info } from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { ProjectNav } from "@/components/project-nav"
import { MappingWorkspace } from "@/components/mapping/mapping-workspace"
import { fieldMappings, getProject as getMockProject, targetFields as mockTargetFields } from "@/lib/mock-data"
import { ApiError, getMappings, getProject, getTargetFields, toFieldMapping } from "@/lib/api"

async function loadWorkspace(id: string) {
  try {
    const project = await getProject(id)
    const [mappings, targetFields] = await Promise.all([getMappings(id), getTargetFields(id)])
    return {
      persist: true,
      projectName: project.project_name,
      mappings: mappings.map(toFieldMapping),
      targetFields,
      notice: null,
    }
  } catch (error) {
    const reason =
      error instanceof ApiError
        ? error.status === 404
          ? "This project isn't in the database"
          : `The backend returned an error (${error.message})`
        : "The backend couldn't be reached"
    const notice = `${reason}, so demo data is shown and changes won't be saved.`
    return {
      persist: false,
      projectName: getMockProject(id).name,
      mappings: fieldMappings,
      targetFields: mockTargetFields.map((field) => field.fieldName),
      notice,
    }
  }
}

export default async function MappingPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const workspace = await loadWorkspace(id)

  return (
    <AppShell>
      <ProjectNav projectId={id} projectName={workspace.projectName} active="mapping" />
      <main className="flex-1 space-y-4 p-6">
        {workspace.notice && (
          <p className="flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/10 px-4 py-2.5 text-sm text-foreground">
            <Info className="size-4 shrink-0 text-warning" />
            {workspace.notice}
          </p>
        )}
        <MappingWorkspace
          initialMappings={workspace.mappings}
          targetFields={workspace.targetFields}
          persist={workspace.persist}
        />
      </main>
    </AppShell>
  )
}
