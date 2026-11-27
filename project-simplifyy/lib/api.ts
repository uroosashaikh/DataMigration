import type { FieldMapping, MappingState } from "@/lib/mock-data"

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000"

export const NO_MAPPING = "NO MAPPING"

export type ApiProject = {
  project_id: string
  project_name: string
  source_system: string
  target_system: string
}

export type ApiMappingStatus = "Suggested" | "Approved" | "Rejected" | "Modified"

export type ApiMapping = {
  mapping_id: string
  project_id: string
  source_field: string
  target_field: string | null
  confidence: number | string | null
  reasoning: string | null
  status: ApiMappingStatus | string
  review_comment: string | null
  reviewed_by: string | null
  reviewed_date: string | null
  updated_by: string | null
  updated_date: string | null
}

export type ReviewAction = "approve" | "reject" | "update"

export type ReviewInput = { targetField?: string; comment?: string }

export type ReviewRequest = {
  action: ReviewAction
  target_field?: string
  comment?: string
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    cache: "no-store",
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  })
  if (!response.ok) {
    const body = await response.json().catch(() => null)
    const detail = typeof body?.detail === "string" ? body.detail : response.statusText
    throw new ApiError(detail || `Request failed with status ${response.status}`, response.status)
  }
  return response.json() as Promise<T>
}

export const getProject = (projectId: string) =>
  request<ApiProject>(`/projects/${encodeURIComponent(projectId)}`)

export const getMappings = (projectId: string) =>
  request<ApiMapping[]>(`/projects/${encodeURIComponent(projectId)}/mappings`)

export const getTargetFields = (projectId: string) =>
  request<string[]>(`/projects/${encodeURIComponent(projectId)}/target-fields`)

export const reviewMapping = (mappingId: string, review: ReviewRequest) =>
  request<ApiMapping>(`/mappings/${encodeURIComponent(mappingId)}`, {
    method: "PATCH",
    body: JSON.stringify(review),
  })

const STATUS_TO_STATE: Record<string, MappingState> = {
  Approved: "approved",
  Rejected: "rejected",
  Modified: "modified",
}

export function toFieldMapping(mapping: ApiMapping): FieldMapping {
  const hasTarget = Boolean(mapping.target_field) && mapping.target_field !== NO_MAPPING
  const state = STATUS_TO_STATE[mapping.status] ?? (hasTarget ? "suggested" : "unmapped")
  return {
    id: mapping.mapping_id,
    sourceField: mapping.source_field,
    targetField: hasTarget ? (mapping.target_field as string) : "",
    logic: mapping.reasoning ?? "",
    confidence: Number(mapping.confidence ?? 0),
    state,
    sourceMissing: !hasTarget,
    reasoning: mapping.reasoning ? [mapping.reasoning] : [],
    notes: mapping.review_comment ?? "",
    reviewedBy: mapping.reviewed_by ?? undefined,
    reviewedDate: mapping.reviewed_date ?? undefined,
    updatedBy: mapping.updated_by ?? undefined,
    updatedDate: mapping.updated_date ?? undefined,
  }
}
