import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { projects } from "@/lib/mock-data"

export function ProjectCards() {
  const featured = projects.slice(0, 3)

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {featured.map((project, i) => (
        <div
          key={project.id}
          className={cn(
            "flex flex-col rounded-xl border bg-card p-5 transition-shadow hover:shadow-sm",
            i === 0 ? "border-primary/50 ring-1 ring-primary/20" : "border-border",
          )}
        >
          <h3 className="text-base font-semibold text-foreground">{project.name}</h3>

          <div className="mt-3 flex items-center gap-2 text-sm font-medium text-foreground">
            <span>{project.source}</span>
            <span className="h-px flex-1 bg-foreground/30" aria-hidden />
            <ArrowRight className="size-3.5 text-foreground/50" />
            <span>{project.target}</span>
          </div>

          <p className="mt-2 text-xs text-muted-foreground">
            Data Domain: {project.dataDomain}
          </p>

          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${project.progress}%` }}
              role="progressbar"
              aria-valuenow={project.progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${project.name} progress`}
            />
          </div>

          <Link
            href={`/project/${project.id}/schema`}
            className="mt-4 flex items-center justify-between text-sm font-medium text-primary transition-opacity hover:opacity-80"
          >
            View More
            <ArrowRight className="size-4" />
          </Link>
        </div>
      ))}
    </div>
  )
}
