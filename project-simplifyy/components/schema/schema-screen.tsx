"use client"

import { useState } from "react"
import { SchemaUpload } from "@/components/schema/schema-upload"
import { SchemaWorkspace } from "@/components/schema/schema-workspace"

export function SchemaScreen({ ingested }: { ingested: boolean }) {
  const [uploaded, setUploaded] = useState(ingested)

  if (!uploaded) {
    return <SchemaUpload onComplete={() => setUploaded(true)} />
  }

  return <SchemaWorkspace />
}
