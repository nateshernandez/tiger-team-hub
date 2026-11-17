import { createFileRoute } from "@tanstack/react-router"

import { AgentWorksLayout } from "@/features/agent-works/components/agent-works-layout"

export const Route = createFileRoute("/agent-works")({
  component: AgentWorksLayout,
})
