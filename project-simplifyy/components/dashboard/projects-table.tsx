import Link from "next/link"
import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { projects } from "@/lib/mock-data"

function StatusIcon({ ok }: { ok: boolean }) {
  return ok ? (
    <span className="inline-flex size-6 items-center justify-center rounded-full bg-success/10">
      <Check className="size-4 text-success" strokeWidth={2.5} />
      <span className="sr-only">Yes</span>
    </span>
  ) : (
    <span className="inline-flex size-6 items-center justify-center rounded-full bg-destructive/10">
      <X className="size-4 text-destructive" strokeWidth={2.5} />
      <span className="sr-only">No</span>
    </span>
  )
}

export function ProjectsTable() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/60 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <th className="px-5 py-3">Project</th>
              <th className="px-5 py-3 text-center">Source Ingested</th>
              <th className="px-5 py-3 text-center">Source Fields</th>
              <th className="px-5 py-3 text-center">Target Ingested</th>
              <th className="px-5 py-3 text-center">Target Fields</th>
              <th className="px-5 py-3 text-center">Fields Mapped</th>
              <th className="px-5 py-3 text-center">Mapping</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => {
              const pct =
                project.targetFields > 0
                  ? Math.round((project.fieldsMapped / project.targetFields) * 100)
                  : 0
              const complete = pct >= 100
              return (
                <tr
                  key={project.id}
                  className="border-b border-border last:border-0 transition-colors hover:bg-muted/40"
                >
                  <td className="px-5 py-4 font-medium text-foreground">{project.name}</td>
                  <td className="px-5 py-4">
                    <div className="flex justify-center">
                      <StatusIcon ok={project.sourceIngested} />
                    </div>
                  </td>
                  <td className="px-5 py-4 text-center tabular-nums text-foreground">
                    {project.sourceFields}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-center">
                      <StatusIcon ok={project.targetIngested} />
                    </div>
                  </td>
                  <td className="px-5 py-4 text-center tabular-nums text-foreground">
                    {project.targetFields}
                  </td>
                  <td className="px-5 py-4 text-center">
                    {project.fieldsMapped > 0 ? (
                      <span
                        className={cn(
                          "font-semibold tabular-nums",
                          complete ? "text-success" : "text-warning",
                        )}
                      >
                        {project.fieldsMapped}/{project.targetFields} ({pct}%)
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-center">
                      {project.mappingStatus === "review" ? (
                        <Link
                          href={`/project/${project.id}/mapping`}
                          className="rounded-md px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
                        >
                          Review
                        </Link>
                      ) : (
                        <Link
                          href={`/project/${project.id}/schema`}
                          className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                          Generate
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
