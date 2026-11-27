"use client"

import { useState } from "react"
import { Check, X, PencilLine } from "lucide-react"
import { cn } from "@/lib/utils"
import type { FieldMapping } from "@/lib/mock-data"
import { NO_MAPPING, type ReviewAction, type ReviewInput } from "@/lib/api"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

function formatDate(value?: string) {
  if (!value) return ""
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString()
}

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
  targetFields,
  pending,
  onClose,
  onReview,
}: {
  mapping: FieldMapping
  targetFields: string[]
  pending: boolean
  onClose: () => void
  onReview: (action: ReviewAction, input: ReviewInput) => Promise<boolean>
}) {
  const currentTarget = mapping.targetField || NO_MAPPING
  const [targetField, setTargetField] = useState(currentTarget)
  const [comment, setComment] = useState(mapping.notes)

  const targetOptions = Array.from(new Set([NO_MAPPING, currentTarget, ...targetFields]))
  const targetChanged = targetField !== currentTarget
  const canUpdate = targetChanged && comment.trim().length > 0 && !pending

  return (
    <section
      aria-label="Explanation panel"
      className="rounded-xl border border-border bg-card"
    >
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div>
          <h2 className="text-base font-semibold text-primary">Explanation Panel</h2>
          {(mapping.reviewedBy || mapping.updatedBy) && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {mapping.reviewedBy && (
                <>Reviewed by {mapping.reviewedBy} on {formatDate(mapping.reviewedDate)}</>
              )}
              {mapping.reviewedBy && mapping.updatedBy && " · "}
              {mapping.updatedBy && (
                <>Last updated by {mapping.updatedBy} on {formatDate(mapping.updatedDate)}</>
              )}
            </p>
          )}
        </div>
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
          <div className="border-b border-border bg-muted/50 px-4 py-2.5">
            <h3 className="text-sm font-semibold text-foreground">Update Mapping</h3>
          </div>
          <div className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center">
            <span className="text-sm text-muted-foreground">Target Field:</span>
            <Select
              value={targetField}
              onValueChange={(value) => value && setTargetField(value as string)}
              disabled={pending}
            >
              <SelectTrigger className="min-w-56" aria-label="Target field">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {targetOptions.map((field) => (
                  <SelectItem key={field} value={field}>
                    {field}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {targetChanged && (
              <button
                type="button"
                onClick={() => setTargetField(currentTarget)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-border">
          <div className="border-b border-border bg-muted/50 px-4 py-2.5">
            <h3 className="text-sm font-semibold text-foreground">Risks / Notes</h3>
          </div>
          <div className="space-y-1.5 p-4">
            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              disabled={pending}
              rows={3}
              aria-label="Review comment"
              className="w-full resize-y rounded-md border border-border bg-background p-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:opacity-60"
              placeholder="Add risks or notes about this mapping…"
            />
            <p className="text-xs text-muted-foreground">
              Saved with your decision. A comment is required when you change the target field.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          {targetChanged ? (
            <button
              type="button"
              disabled={!canUpdate}
              onClick={() => onReview("update", { targetField, comment })}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
            >
              <PencilLine className="size-4" />
              {pending ? "Saving…" : "Update Mapping"}
            </button>
          ) : (
            <>
              <button
                type="button"
                disabled={pending}
                onClick={() => onReview("reject", { comment })}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
              >
                <X className="size-4" />
                Reject
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => onReview("approve", { comment })}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
              >
                <Check className="size-4" />
                {pending ? "Saving…" : "Approve Mapping"}
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
