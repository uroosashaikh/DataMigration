"use client"

import { useState } from "react"
import { Check, X, SquarePen, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { fieldMappings, type FieldMapping, type MappingState } from "@/lib/mock-data"
import { ExplanationPanel } from "@/components/mapping/explanation-panel"

function StatusBadge({ state }: { state: MappingState }) {
  const map: Record<MappingState, { label: string; className: string }> = {
    suggested: { label: "Suggested", className: "bg-primary/10 text-primary" },
    accepted: { label: "Accepted", className: "bg-success/10 text-success" },
    rejected: { label: "Rejected", className: "bg-destructive/10 text-destructive" },
    unmapped: { label: "—", className: "text-muted-foreground" },
  }
  const { label, className } = map[state]
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium", className)}>
      {label}
    </span>
  )
}

function confidenceColor(state: MappingState, confidence: number) {
  if (state === "rejected") return "text-destructive"
  if (confidence >= 85) return "text-success"
  if (confidence >= 60) return "text-warning"
  return "text-warning"
}

export function MappingWorkspace() {
  const [mappings, setMappings] = useState<FieldMapping[]>(fieldMappings)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  const selected = mappings.find((m) => m.id === selectedId) ?? null

  const setState = (id: string, state: MappingState) => {
    setMappings((prev) => prev.map((m) => (m.id === id ? { ...m, state } : m)))
  }

  const toggleChecked = (id: string) =>
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }))

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-primary">Mapping Workspace</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Let&apos;s review the schemas and map the fields
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead>
              <tr className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="w-40 border-b border-r border-border bg-muted/60 px-4 py-3 text-center">
                  Source
                </th>
                <th
                  colSpan={4}
                  className="border-b border-border bg-muted/40 px-4 py-3 text-center"
                >
                  Mapping Logic
                </th>
                <th className="border-b border-border bg-muted/40 px-2 py-3 text-center">
                  <Check className="mx-auto size-4 text-foreground/70" />
                </th>
                <th className="border-b border-border bg-muted/40 px-2 py-3 text-center">
                  <X className="mx-auto size-4 text-foreground/70" />
                </th>
                <th className="border-b border-border bg-muted/40 px-4 py-3" />
                <th className="w-40 border-b border-l border-border bg-muted/60 px-4 py-3 text-center">
                  Target
                </th>
              </tr>
            </thead>
            <tbody>
              {mappings.map((m) => (
                <tr
                  key={m.id}
                  className={cn(
                    "border-b border-border transition-colors",
                    selectedId === m.id ? "bg-primary/5" : "hover:bg-muted/30",
                  )}
                >
                  {/* Source */}
                  <td className="border-r border-border bg-muted/20 px-4 py-4 text-center">
                    <span
                      className={cn(
                        "font-medium",
                        m.sourceMissing ? "text-destructive" : "text-foreground",
                      )}
                    >
                      {m.sourceField}
                    </span>
                  </td>

                  {/* checkbox */}
                  <td className="w-10 px-3 py-4">
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={!!checked[m.id]}
                      aria-label={`Select ${m.sourceField} mapping`}
                      onClick={() => toggleChecked(m.id)}
                      className={cn(
                        "flex size-4 items-center justify-center rounded border transition-colors",
                        checked[m.id]
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-input bg-background",
                      )}
                    >
                      {checked[m.id] && (
                        <svg viewBox="0 0 12 12" className="size-3" fill="none" stroke="currentColor" strokeWidth={2}>
                          <path d="M2.5 6.5l2.5 2.5 4.5-5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                  </td>

                  {/* logic */}
                  <td className="px-2 py-4 text-foreground">{m.logic}</td>

                  {/* edit / explain */}
                  <td className="w-10 px-2 py-4">
                    <button
                      type="button"
                      onClick={() => setSelectedId(m.id)}
                      className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                      aria-label={`Explain mapping for ${m.sourceField}`}
                    >
                      <SquarePen className="size-4" />
                    </button>
                  </td>

                  {/* confidence */}
                  <td className="w-16 px-2 py-4 text-center">
                    {m.state !== "unmapped" ? (
                      <span className={cn("font-semibold tabular-nums", confidenceColor(m.state, m.confidence))}>
                        {m.confidence}%
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>

                  {/* accept */}
                  <td className="w-10 px-2 py-4 text-center">
                    {m.state !== "unmapped" && (
                      <button
                        type="button"
                        onClick={() => setState(m.id, "accepted")}
                        aria-label={`Accept mapping for ${m.sourceField}`}
                        className={cn(
                          "mx-auto flex size-7 items-center justify-center rounded-md transition-colors",
                          m.state === "accepted"
                            ? "bg-success/15 text-success"
                            : "text-muted-foreground hover:bg-success/10 hover:text-success",
                        )}
                      >
                        <Check className="size-4" strokeWidth={2.5} />
                      </button>
                    )}
                  </td>

                  {/* reject */}
                  <td className="w-10 px-2 py-4 text-center">
                    {m.state !== "unmapped" && (
                      <button
                        type="button"
                        onClick={() => setState(m.id, "rejected")}
                        aria-label={`Reject mapping for ${m.sourceField}`}
                        className={cn(
                          "mx-auto flex size-7 items-center justify-center rounded-md transition-colors",
                          m.state === "rejected"
                            ? "bg-destructive/15 text-destructive"
                            : "text-muted-foreground hover:bg-destructive/10 hover:text-destructive",
                        )}
                      >
                        <X className="size-4" strokeWidth={2.5} />
                      </button>
                    )}
                  </td>

                  {/* status */}
                  <td className="w-28 px-4 py-4 text-center">
                    <StatusBadge state={m.state} />
                  </td>

                  {/* Target */}
                  <td className="border-l border-border bg-muted/20 px-4 py-4 text-center">
                    {m.targetField ? (
                      <span
                        className={cn(
                          "font-medium",
                          m.targetMissing ? "text-destructive" : "text-foreground",
                        )}
                      >
                        {m.targetMissing && "*"}
                        {m.targetField}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}

              {/* Unmapped mandatory target */}
              <tr>
                <td className="border-r border-border bg-muted/20 px-4 py-4" />
                <td colSpan={7} className="px-4 py-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <Info className="size-4" />
                    1 mandatory target field is still unmapped
                  </span>
                </td>
                <td className="border-l border-border bg-muted/20 px-4 py-4 text-center">
                  <span className="font-medium text-destructive">*ExternalId</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <ExplanationPanel
          mapping={selected}
          onClose={() => setSelectedId(null)}
          onAccept={() => setState(selected.id, "accepted")}
          onReject={() => setState(selected.id, "rejected")}
        />
      )}
    </div>
  )
}
