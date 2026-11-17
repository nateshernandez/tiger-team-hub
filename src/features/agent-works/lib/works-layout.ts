import { WORKS_DIAGRAM } from "@/features/agent-works/config/works-diagram"
import {
  type DiagramLayout,
  layoutDiagram,
} from "@/features/agent-works/lib/layout-diagram"

// Worked out once from the config: it only changes with a new build.
export const WORKS_LAYOUT: DiagramLayout = layoutDiagram(WORKS_DIAGRAM)
