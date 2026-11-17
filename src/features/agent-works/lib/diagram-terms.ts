import {
  type Diagram,
  type DiagramNode,
} from "@/features/agent-works/lib/diagram-schema"
import { type TermId } from "@/lib/vocabulary/term-schema"

// Every term the diagram draws: on a node, or as the loop itself.
export function drawnTermIds(diagram: Diagram): Set<TermId> {
  return new Set([
    diagram.loop.termId,
    ...diagram.nodes.flatMap((node) => node.termIds),
  ])
}

// The nodes a term is drawn on, so highlighting Memory lights up the step
// it belongs to. A term can belong to more than one step.
export function nodeIdsForTerm(diagram: Diagram, termId: TermId): string[] {
  return diagram.nodes
    .filter((node) => node.termIds.includes(termId))
    .map((node) => node.id)
}

export function findNode(
  diagram: Diagram,
  nodeId: string
): DiagramNode | undefined {
  return diagram.nodes.find((node) => node.id === nodeId)
}
