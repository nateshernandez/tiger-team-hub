import { Outlet } from "@tanstack/react-router"

import { ArtifactLayout } from "@/components/artifact-layout"
import { GUIDE } from "@/features/agent-works/config/guide"

export function AgentWorksLayout() {
  return (
    <ArtifactLayout
      title={GUIDE.title}
      summary={GUIDE.summary}
      pages={GUIDE.pages}
    >
      <Outlet />
    </ArtifactLayout>
  )
}
