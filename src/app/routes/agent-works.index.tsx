import { createFileRoute } from "@tanstack/react-router"

import { WorksPage } from "@/features/agent-works/components/works-page"
import { worksSearchSchema } from "@/features/agent-works/lib/search-params"

export const Route = createFileRoute("/agent-works/")({
  validateSearch: worksSearchSchema,
  component: WorksPage,
})
