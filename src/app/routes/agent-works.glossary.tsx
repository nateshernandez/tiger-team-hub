import { createFileRoute } from "@tanstack/react-router"

import { AgentWorksGlossaryPage } from "@/features/agent-works/components/agent-works-glossary-page"

export const Route = createFileRoute("/agent-works/glossary")({
  component: AgentWorksGlossaryPage,
})
