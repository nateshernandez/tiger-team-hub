import { getRouteApi } from "@tanstack/react-router"
import { useEffect } from "react"

import { AgentDiagram } from "@/features/agent-works/components/agent-diagram"
import { type DiagramSelection } from "@/features/agent-works/components/diagram-node"
import { TermPanel } from "@/features/agent-works/components/term-panel"
import { WORKS_DIAGRAM } from "@/features/agent-works/config/works-diagram"
import { WORKS_LAYOUT } from "@/features/agent-works/lib/works-layout"
import { type TermId } from "@/lib/vocabulary/term-schema"

const worksRoute = getRouteApi("/agent-works/")

export function WorksPage() {
  const { node: selectedNodeId, term: selectedTermId } = worksRoute.useSearch()
  const navigate = worksRoute.useNavigate()

  const selection = toSelection(selectedNodeId, selectedTermId)
  const highlightedNodeIds = new Set<string>(
    selection?.type === "node" ? [selection.nodeId] : []
  )
  const highlightedTermIds = new Set<TermId>(
    selection?.type === "term" ? [selection.termId] : []
  )

  function handleSelect(next: DiagramSelection) {
    const isSameSelection =
      (next.type === "node" && next.nodeId === selectedNodeId) ||
      (next.type === "term" && next.termId === selectedTermId)
    void navigate({
      search: isSameSelection ? {} : toSearch(next),
      replace: true,
    })
  }

  function handleClose() {
    void navigate({ search: {}, replace: true })
  }

  // Esc goes back to the start, the way it closes any panel.
  useEffect(() => {
    if (!selection) {
      return
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        void navigate({ search: {}, replace: true })
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [selection, navigate])

  return (
    <div className="grid gap-4 lg:min-h-[480px] lg:flex-[1_1_0px] lg:grid-cols-[minmax(0,1fr)_380px] lg:grid-rows-[minmax(0,1fr)]">
      <section
        aria-label="Diagram"
        className="h-[480px] overflow-hidden rounded-xl border sm:h-[560px] lg:h-full"
      >
        <AgentDiagram
          diagram={WORKS_DIAGRAM}
          layout={WORKS_LAYOUT}
          highlightedNodeIds={highlightedNodeIds}
          highlightedTermIds={highlightedTermIds}
          selection={selection}
          onSelect={handleSelect}
          onClearSelection={handleClose}
          label={`${WORKS_DIAGRAM.title}: ${WORKS_DIAGRAM.summary}`}
        />
      </section>
      <aside
        aria-label="Details"
        aria-live="polite"
        className="relative rounded-xl border bg-card lg:overflow-y-auto"
      >
        <TermPanel
          diagram={WORKS_DIAGRAM}
          selection={selection}
          onSelect={handleSelect}
          onClose={handleClose}
        />
      </aside>
    </div>
  )
}

function toSearch(
  selection: DiagramSelection
): { node: string } | { term: TermId } {
  switch (selection.type) {
    case "node": {
      return { node: selection.nodeId }
    }
    case "term": {
      return { term: selection.termId }
    }
  }
}

function toSelection(
  nodeId: string | undefined,
  termId: TermId | undefined
): DiagramSelection | undefined {
  if (nodeId) {
    return { type: "node", nodeId }
  }
  if (termId) {
    return { type: "term", termId }
  }
  return undefined
}
