"use client"

import { useRef, useState } from "react"
import { CheckCircle2, FileSpreadsheet, UploadCloud, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type SlotKey = "sourceSchema" | "targetSchema" | "sourceSample" | "targetSample"

type UploadedFile = { name: string; size: string }

const ACCEPTED = ".csv,.xlsx,.xls,.json"

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function UploadSlot({
  title,
  hint,
  required,
  file,
  onFile,
  onClear,
}: {
  title: string
  hint: string
  required: boolean
  file: UploadedFile | null
  onFile: (file: UploadedFile) => void
  onClear: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  const handleFiles = (files: FileList | null) => {
    const f = files?.[0]
    if (f) onFile({ name: f.name, size: formatSize(f.size) })
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {required ? (
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Required</span>
        ) : (
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">Optional</span>
        )}
      </div>

      {file ? (
        <div className="flex items-center gap-3 rounded-xl border border-success/40 bg-success/5 p-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-success/10 text-success">
            <FileSpreadsheet className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <CheckCircle2 className="size-3 text-success" />
              Uploaded · {file.size}
            </p>
          </div>
          <button
            type="button"
            onClick={onClear}
            aria-label={`Remove ${title}`}
            className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragOver(false)
            handleFiles(e.dataTransfer.files)
          }}
          className={cn(
            "flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition-colors",
            dragOver
              ? "border-primary bg-primary/5"
              : "border-border bg-muted/30 hover:border-primary/50 hover:bg-muted/50",
          )}
        >
          <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UploadCloud className="size-5" />
          </div>
          <p className="text-sm font-medium text-foreground">
            Drag &amp; drop or <span className="text-primary">browse</span>
          </p>
          <p className="text-xs text-muted-foreground">{hint}</p>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED}
            className="sr-only"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </button>
      )}
    </div>
  )
}

export function SchemaUpload({ onComplete }: { onComplete?: () => void }) {
  const [files, setFiles] = useState<Record<SlotKey, UploadedFile | null>>({
    sourceSchema: null,
    targetSchema: null,
    sourceSample: null,
    targetSample: null,
  })

  const setFile = (key: SlotKey, file: UploadedFile | null) =>
    setFiles((prev) => ({ ...prev, [key]: file }))

  const schemasReady = Boolean(files.sourceSchema && files.targetSchema)

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">Upload Your Schemas</h1>
        <p className="mt-1 text-pretty text-muted-foreground">
          Provide the source and target schemas to get started. Sample data is optional but improves mapping accuracy.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Source column */}
        <div className="space-y-4 rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-primary" />
            <h2 className="text-base font-semibold text-foreground">Source</h2>
          </div>
          <UploadSlot
            title="Schema Definition"
            hint="CSV, Excel or JSON · field names, types, lengths"
            required
            file={files.sourceSchema}
            onFile={(f) => setFile("sourceSchema", f)}
            onClear={() => setFile("sourceSchema", null)}
          />
          <UploadSlot
            title="Sample Data"
            hint="A few sample rows to boost match confidence"
            required={false}
            file={files.sourceSample}
            onFile={(f) => setFile("sourceSample", f)}
            onClear={() => setFile("sourceSample", null)}
          />
        </div>

        {/* Target column */}
        <div className="space-y-4 rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-chart-4" />
            <h2 className="text-base font-semibold text-foreground">Target</h2>
          </div>
          <UploadSlot
            title="Schema Definition"
            hint="CSV, Excel or JSON · field names, types, lengths"
            required
            file={files.targetSchema}
            onFile={(f) => setFile("targetSchema", f)}
            onClear={() => setFile("targetSchema", null)}
          />
          <UploadSlot
            title="Sample Data"
            hint="A few sample rows to boost match confidence"
            required={false}
            file={files.targetSample}
            onFile={(f) => setFile("targetSample", f)}
            onClear={() => setFile("targetSample", null)}
          />
        </div>
      </div>

      {/* Footer / action bar */}
      <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 sm:flex-row">
        <p className="text-sm text-muted-foreground">
          {schemasReady
            ? "Both schemas uploaded. You're ready to continue."
            : "Both source and target schemas are required to continue."}
        </p>
        <Button size="lg" disabled={!schemasReady} onClick={onComplete}>
          Save &amp; Continue
        </Button>
      </div>
    </div>
  )
}
