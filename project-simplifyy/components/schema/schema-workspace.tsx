"use client"

import { useMemo, useState } from "react"
import { AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, Search, Sparkles, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { sourceFields, targetFields, type SchemaField } from "@/lib/mock-data"

type Side = "source" | "target"

function FieldCheckbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: () => void
  label: string
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={cn(
        "flex size-4 items-center justify-center rounded border transition-colors",
        checked ? "border-primary bg-primary text-primary-foreground" : "border-input bg-background",
      )}
    >
      {checked && (
        <svg viewBox="0 0 12 12" className="size-3" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M2.5 6.5l2.5 2.5 4.5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  )
}

export function SchemaWorkspace() {
  const [side, setSide] = useState<Side>("source")
  const [query, setQuery] = useState("")
  const [mappingGenerated, setMappingGenerated] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [rows, setRows] = useState<Record<Side, SchemaField[]>>({
    source: sourceFields,
    target: targetFields,
  })

  const sampleUploaded = side === "target"

  const visibleRows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return rows[side].filter((r) => !q || r.fieldName.toLowerCase().includes(q))
  }, [rows, side, query])

  const toggle = (id: string, key: "mandatory" | "nullable" | "custom") => {
    setRows((prev) => ({
      ...prev,
      [side]: prev[side].map((r) => (r.id === id ? { ...r, [key]: !r[key] } : r)),
    }))
  }

  const removeRow = (id: string) => {
    setRows((prev) => ({ ...prev, [side]: prev[side].filter((r) => r.id !== id) }))
  }

  const generateMappings = async () => {
    setGenerating(true)
    try {
      await fetch("/api/mappings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceFields: rows.source.map(({ fieldName, description, dataType }) => ({ fieldName, description, dataType })),
          targetFields: rows.target.map(({ fieldName, description, dataType }) => ({ fieldName, description, dataType })),
        }),
      })
      setMappingGenerated(true)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Source / Target tabs */}
        <div className="flex items-center rounded-lg border border-border bg-muted/50 p-1">
          {(["source", "target"] as Side[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSide(s)}
              className={cn(
                "rounded-md px-6 py-1.5 text-sm font-medium capitalize transition-colors",
                side === s
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Sample data status */}
        <div className="flex flex-col gap-1 text-sm">
          {sampleUploaded ? (
            <span className="flex items-center gap-2 text-foreground">
              <CheckCircle2 className="size-4 text-success" />
              Sample Data Uploaded
              <button className="font-medium text-primary hover:underline">view</button>
            </span>
          ) : (
            <span className="flex items-center gap-2 text-foreground">
              <AlertCircle className="size-4 text-destructive" />
              No Sample data
              <button className="font-medium text-primary hover:underline">upload now</button>
            </span>
          )}
        </div>

        {/* Search + Save */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Field Name"
              aria-label="Search field name"
              className="h-9 w-56 rounded-full border border-border bg-background pl-9 pr-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="lg" onClick={generateMappings} disabled={generating} className="gap-2">
              <Sparkles className="size-4" />
              {generating ? "Generating..." : mappingGenerated ? "Regenerate mapping" : "Generate Mappings"}
            </Button>
            <Button size="lg">Save Changes</Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/60 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="w-10 px-3 py-3" />
                <th className="px-4 py-3">Field Name</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Data Type</th>
                <th className="px-4 py-3 text-center">Length</th>
                <th className="px-4 py-3 text-center">Mandatory</th>
                <th className="px-4 py-3 text-center">Nullable</th>
                <th className="px-4 py-3 text-center">Custom</th>
                <th className="px-4 py-3">Notes</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-border last:border-0 transition-colors hover:bg-muted/40"
                >
                  <td className="px-3 py-3">
                    <button
                      type="button"
                      onClick={() => removeRow(row.id)}
                      className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      aria-label={`Remove ${row.fieldName}`}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">{row.fieldName}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row.description}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs text-foreground">
                      {row.dataType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center tabular-nums text-foreground">{row.length}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center">
                      <FieldCheckbox
                        checked={row.mandatory}
                        onChange={() => toggle(row.id, "mandatory")}
                        label={`${row.fieldName} mandatory`}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center">
                      <FieldCheckbox
                        checked={row.nullable}
                        onChange={() => toggle(row.id, "nullable")}
                        label={`${row.fieldName} nullable`}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center">
                      <FieldCheckbox
                        checked={row.custom}
                        onChange={() => toggle(row.id, "custom")}
                        label={`${row.fieldName} custom`}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{row.notes || "—"}</td>
                </tr>
              ))}
              {visibleRows.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-muted-foreground">
                    No fields match “{query}”.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between gap-4 border-t border-border px-4 py-3 text-sm">
          <div className="flex items-center gap-1">
            <button className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              <ChevronLeft className="size-4" />
              <span className="sr-only">Previous page</span>
            </button>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                className={cn(
                  "flex size-8 items-center justify-center rounded-md text-sm font-medium transition-colors",
                  n === 1
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {n}
              </button>
            ))}
            <button className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              <ChevronRight className="size-4" />
              <span className="sr-only">Next page</span>
            </button>
            <span className="ml-2 text-muted-foreground">25 items per page</span>
          </div>
          <span className="text-muted-foreground">1–25 of 100 items</span>
        </div>
      </div>
    </div>
  )
}
