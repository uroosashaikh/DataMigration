"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, FileUp, FolderPlus, UploadCloud, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type UploadKey = "sourceSchema" | "targetSchema" | "sourceSample" | "targetSample"
type UploadedFile = {
  file: File
  name: string
  size: string
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function UploadField({
  title,
  description,
  required,
  file,
  onFile,
  onClear,
}: {
  title: string
  description: string
  required: boolean
  file: UploadedFile | null
  onFile: (file: UploadedFile) => void
  onClear: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const acceptFile = (file?: File) => {
    if (file) onFile({file, name: file.name, size: formatSize(file.size) })
  }

  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="text-xs leading-5 text-muted-foreground">{description}</p>
        </div>
        <span className={cn(
          "shrink-0 rounded-full px-2 py-1 text-[11px] font-medium",
          required ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
        )}>
          {required ? "Required" : "Optional"}
        </span>
      </div>

      {file ? (
        <div className="flex items-center gap-3 rounded-xl border border-success/40 bg-success/5 p-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-success/10 text-success">
            <CheckCircle2 className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
            <p className="text-xs text-muted-foreground">Uploaded · {file.size}</p>
          </div>
          <button type="button" onClick={onClear} aria-label={`Remove ${title}`} className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => { event.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => { event.preventDefault(); setDragging(false); acceptFile(event.dataTransfer.files[0]) }}
          className={cn(
            "flex min-h-24 w-full items-center gap-3 rounded-xl border border-dashed px-4 py-3 text-left transition-colors",
            dragging ? "border-primary bg-primary/10" : "border-border bg-muted/30 hover:border-primary/50 hover:bg-primary/5",
          )}
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <UploadCloud className="size-4" />
          </span>
          <span>
            <span className="block text-sm font-medium text-foreground">Upload file</span>
            <span className="block text-xs text-muted-foreground">Drag and drop or <span className="text-primary">browse</span></span>
          </span>
          <input ref={inputRef} type="file" accept=".csv,.xlsx,.xls,.json" className="sr-only" onChange={(event) => acceptFile(event.target.files?.[0])} />
        </button>
      )}
    </div>
  )
}

export function CreateProjectDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter()
  const [projectName, setProjectName] = useState("")
  const [sourceSystem, setSourceSystem] = useState("")
  const [targetSystem, setTargetSystem] = useState("")
  const [files, setFiles] = useState<Record<UploadKey, UploadedFile | null>>({ sourceSchema: null, targetSchema: null, sourceSample: null, targetSample: null })

  if (!open) return null

  const setFile = (key: UploadKey, file: UploadedFile | null) => setFiles((current) => ({ ...current, [key]: file }))
  const canCreate = Boolean(projectName.trim() && sourceSystem.trim() && targetSystem.trim() && files.sourceSchema && files.targetSchema)

  const close = () => onOpenChange(false)
  const createProject = () => {
    if (!canCreate) return
    const id = projectName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "new-project"
    const params = new URLSearchParams({ name: projectName.trim(), source: sourceSystem.trim(), target: targetSystem.trim(), sourceSchema: files.sourceSchema?.name ?? "", targetSchema: files.targetSchema?.name ?? "" })
    router.push(`/project/${id}/schema?${params.toString()}`)
    onOpenChange(false)
  }

 const handleCreateProject = async () => {
  if (!canCreate) return

  try {
    const formData = new FormData()

    formData.append("project_name", projectName.trim())
    formData.append("source", sourceSystem.trim())
    formData.append("target", targetSystem.trim())
    console.log(formData)
    console.log(files.sourceSchema)
    if (files.sourceSchema) {
      formData.append("source_schema", files.sourceSchema.file)
    }
    console.log(formData)
    if (files.targetSchema) {
      formData.append("target_schema", files.targetSchema.file)
    }

    const response = await fetch(
      "http://localhost:8000/createProject",
      {
        method: "POST",
        body: formData,
      }
    )
    const responseText = await response.text()
    if (!response.ok) {
      throw new Error(
        `Failed to create project: ${response.status} ${responseText}`
      )
    }

    console.log("Project created:", responseText)

    const id =
      projectName
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") || "new-project"

    const params = new URLSearchParams({
      name: projectName.trim(),
      source: sourceSystem.trim(),
      target: targetSystem.trim(),
      sourceSchema: files.sourceSchema?.name ?? "",
      targetSchema: files.targetSchema?.name ?? "",
    })

    router.push(
      `/project/${id}/schema`
    )

    onOpenChange(false)

  } catch (error) {
    console.error("Error creating project:", error)
  }
}
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="create-project-title">
      <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">
        <div className="flex items-start justify-between border-b border-border bg-card px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><FolderPlus className="size-5" /></div>
            <div>
              <h2 id="create-project-title" className="text-xl font-semibold text-foreground">Create a new project</h2>
              <p className="mt-1 text-sm text-muted-foreground">Set up your migration by adding both schemas.</p>
            </div>
          </div>
          <button type="button" onClick={close} aria-label="Close create project dialog" className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"><X className="size-5" /></button>
        </div>

        <div className="overflow-y-auto px-6 py-5">
          <div className="grid gap-4 md:grid-cols-3">
            <label className="space-y-2"><span className="text-sm font-semibold text-foreground">Project name <span className="text-primary">*</span></span><Input value={projectName} onChange={(event) => setProjectName(event.target.value)} placeholder="e.g. Customer migration" /></label>
            <label className="space-y-2"><span className="text-sm font-semibold text-foreground">Source system <span className="text-primary">*</span></span><Input value={sourceSystem} onChange={(event) => setSourceSystem(event.target.value)} placeholder="e.g. SAP S/4HANA" /></label>
            <label className="space-y-2"><span className="text-sm font-semibold text-foreground">Target system <span className="text-primary">*</span></span><Input value={targetSystem} onChange={(event) => setTargetSystem(event.target.value)} placeholder="e.g. Salesforce" /></label>
          </div>

          <div className="my-6 flex items-center gap-3"><div className="h-px flex-1 bg-border" /><span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Project files</span><div className="h-px flex-1 bg-border" /></div>

          <div className="grid gap-6 md:grid-cols-2">
            <section className="space-y-5 rounded-2xl border border-primary/20 bg-primary/[0.03] p-4"><div className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-primary" /><h3 className="font-semibold text-foreground">Source</h3><span className="text-xs text-muted-foreground">Where data starts</span></div><UploadField title="Source schema" description="Field names, types, lengths and rules" required file={files.sourceSchema} onFile={(file) => setFile("sourceSchema", file)} onClear={() => setFile("sourceSchema", null)} /><UploadField title="Source sample data" description="A few rows to improve matching" required={false} file={files.sourceSample} onFile={(file) => setFile("sourceSample", file)} onClear={() => setFile("sourceSample", null)} /></section>
            <section className="space-y-5 rounded-2xl border border-chart-4/20 bg-chart-4/[0.03] p-4"><div className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-chart-4" /><h3 className="font-semibold text-foreground">Target</h3><span className="text-xs text-muted-foreground">Where data goes</span></div><UploadField title="Target schema" description="Field names, types, lengths and rules" required file={files.targetSchema} onFile={(file) => setFile("targetSchema", file)} onClear={() => setFile("targetSchema", null)} /><UploadField title="Target sample data" description="A few rows to improve matching" required={false} file={files.targetSample} onFile={(file) => setFile("targetSample", file)} onClear={() => setFile("targetSample", null)} /></section>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-border bg-card px-6 py-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs text-muted-foreground"><FileUp className="mr-1 inline size-3.5" />Schemas are required; sample data is optional.</p><div className="flex gap-3"><Button type="button" variant="outline" onClick={close}>Cancel</Button><Button type="button" disabled={!canCreate} onClick={handleCreateProject}>Create Project</Button></div></div>
      </div>
    </div>
  )
}
