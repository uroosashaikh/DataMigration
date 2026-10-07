"use client"

import { Check, X, SquarePen } from "lucide-react"
import { cn } from "@/lib/utils"
import type { FieldMapping } from "@/lib/mock-data"

function confidenceLabel(confidence: number) {
  if (confidence >= 85) return { text: `High (${confidence}%)`, className: "text-success" }
  if (confidence >= 60) return { text: `Medium (${confidence}%)`, className: "text-warning" }
  return { text: `Low (${confidence}%)`, className: "text-warning" }
}

function MappingSection({
  title,
  sourceField,
  targetField,
  confidence,
  reasoning,
}: {
  title: string
  sourceField: string
  targetField: string
  confidence: number
  reasoning: string[]
}) {
  const conf = confidenceLabel(confidence)
  return (
    <div className="rounded-lg border border-border">
      <div className="flex items-center justify-between border-b border-border bg-muted/50 px-4 py-2.5">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-success/10 hover:text-success"
            aria-label={`Accept ${title.toLowerCase()}`}
          >
            <Check className="size-4" strokeWidth={2.5} />
          </button>
          <button
            type="button"
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            aria-label={`Reject ${title.toLowerCase()}`}
          >
            <X className="size-4" strokeWidth={2.5} />
          </button>
        </div>
      </div>
      <div className="grid gap-4 p-4 md:grid-cols-2">
        <dl className="space-y-2 text-sm">
          <div className="flex gap-2">
            <dt className="text-muted-foreground">Source Field:</dt>
            <dd className="font-medium text-foreground">{sourceField}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-muted-foreground">Target Field:</dt>
            <dd className="font-medium text-foreground">{targetField}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-muted-foreground">Confidence Level:</dt>
            <dd className={cn("font-semibold", conf.className)}>{conf.text}</dd>
          </div>
        </dl>
        <div className="text-sm">
          <p className="text-muted-foreground">Reasoning:</p>
          <ul className="mt-1 space-y-1 text-foreground">
            {reasoning.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export function ExplanationPanel({
  mapping,
  onClose,
  onAccept,
  onReject,
}: {
  mapping: FieldMapping
  onClose: () => void
  onAccept: () => void
  onReject: () => void
}) {
  return (
    <section
      aria-label="Explanation panel"
      className="rounded-xl border border-border bg-card"
    >
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <h2 className="text-base font-semibold text-primary">Explanation Panel</h2>
        <button
          type="button"
          onClick={onClose}
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Close
        </button>
      </div>

      <div className="space-y-4 p-5">
        <MappingSection
          title="Suggested Mapping"
          sourceField={mapping.sourceField}
          targetField={mapping.targetField || "—"}
          confidence={mapping.confidence}
          reasoning={mapping.reasoning}
        />

        {mapping.alternate && (
          <MappingSection
            title="Alternate Mapping"
            sourceField={mapping.sourceField}
            targetField={mapping.alternate.targetField}
            confidence={mapping.alternate.confidence}
            reasoning={mapping.alternate.reasoning}
          />
        )}

        <div className="rounded-lg border border-border">
          <div className="flex items-center justify-between border-b border-border bg-muted/50 px-4 py-2.5">
            <h3 className="text-sm font-semibold text-foreground">Risks / Notes</h3>
            <button
              type="button"
              className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
              aria-label="Edit notes"
            >
              <SquarePen className="size-4" />
            </button>
          </div>
          <div className="p-4">
            <textarea
              defaultValue={mapping.notes}
              rows={3}
              className="w-full resize-y rounded-md border border-border bg-background p-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
              placeholder="Add risks or notes about this mapping…"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onReject}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <X className="size-4" />
            Reject
          </button>
          <button
            type="button"
            onClick={onAccept}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Check className="size-4" />
            Accept Mapping
          </button>
        </div>
      </div>
    </section>
  )
}
