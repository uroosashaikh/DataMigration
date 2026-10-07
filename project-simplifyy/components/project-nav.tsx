import Link from "next/link"
import { ChevronsRight, Bell } from "lucide-react"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"

type Step = "schema" | "mapping" | "review"

const steps: { key: Step; label: string; href: (id: string) => string }[] = [
  { key: "schema", label: "Schema", href: (id) => `/project/${id}/schema` },
  { key: "mapping", label: "Mapping Space", href: (id) => `/project/${id}/mapping` },
  { key: "review", label: "Review", href: (id) => `/project/${id}/mapping` },
]

export function ProjectNav({
  projectId,
  projectName,
  active,
}: {
  projectId: string
  projectName: string
  active: Step
}) {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-border bg-card px-6 py-4">
      <Link href="/" className="text-lg font-semibold tracking-tight text-primary">
        {projectName}
      </Link>

      <nav className="flex items-center gap-3" aria-label="Migration workflow">
        {steps.map((step, i) => (
          <div key={step.key} className="flex items-center gap-3">
            <Link
              href={step.href(projectId)}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                active === step.key ? "text-primary" : "text-muted-foreground",
              )}
              aria-current={active === step.key ? "step" : undefined}
            >
              {step.label}
            </Link>
            {i < steps.length - 1 && <ChevronsRight className="size-4 text-foreground/70" />}
          </div>
        ))}
        <div className="ml-2 flex items-center gap-1">
          <ThemeToggle />
          <button
            type="button"
            className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Bell className="size-5" />
            <span className="sr-only">Notifications</span>
          </button>
        </div>
      </nav>
    </header>
  )
}
