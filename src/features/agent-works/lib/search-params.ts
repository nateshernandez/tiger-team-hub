import { z } from "zod"

import { WORKS_DIAGRAM } from "@/features/agent-works/config/works-diagram"
import { termIdSchema } from "@/lib/vocabulary/term-schema"

// URL state, so any view can be shared and picked up where it was left.
// Bad values fall back to a sensible default instead of an error page.

const NODE_IDS = new Set(WORKS_DIAGRAM.nodes.map((node) => node.id))

// What's selected in the diagram: a part of the loop, or a term on it.
export const worksSearchSchema = z.object({
  node: z
    .string()
    .refine((nodeId) => NODE_IDS.has(nodeId))
    .optional()
    .catch(undefined),
  term: termIdSchema.optional().catch(undefined),
})
