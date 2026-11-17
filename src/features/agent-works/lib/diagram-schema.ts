import { z } from "zod"

import { termIdSchema } from "@/lib/vocabulary/term-schema"
import { countWords } from "@/lib/vocabulary/term-text"
import { toolTypeSchema } from "@/lib/vocabulary/tool-type"

// The diagram is the agent loop, the way any agent works in any framework:
// numbered steps inside one loop, what starts it on the way in, and the ways
// out. The guide's terms attach to the steps they belong to.

// Arrows say what flows along them (C4 notation checklist), so a bare verb
// tells the reader nothing and is refused.
const VAGUE_EDGE_LABELS = new Set(["uses", "calls", "connects", "sends", "to"])
const MAX_EDGE_LABEL_WORDS = 5
const MAX_DESCRIPTION_WORDS = 30

const diagramItemSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  toolType: toolTypeSchema.optional(),
})

const diagramSectionSchema = z.object({
  title: z.string().min(1),
  note: z.string().min(1).optional(),
  items: z.array(diagramItemSchema).min(1),
})

const nodeBaseSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  // One plain sentence: what happens here.
  description: z
    .string()
    .min(1)
    .refine((text) => countWords(text) <= MAX_DESCRIPTION_WORDS, {
      message: `Node description must be ${String(MAX_DESCRIPTION_WORDS)} words or fewer`,
    }),
  // The terms that belong here, drawn as chips; the first is the main one.
  termIds: z.array(termIdSchema).default([]),
  // One real line from the receipt example, so the general step has a
  // concrete case beside it.
  example: z.string().min(1).optional(),
})

const diagramNodeSchema = z.discriminatedUnion("kind", [
  nodeBaseSchema.extend({
    kind: z.literal("step"),
    step: z.number().int().positive(),
    // Only the model decides; every other step is the agent's own code.
    actor: z.enum(["model", "agent"]),
  }),
  // What starts the loop, how it ends, and who it waits for.
  nodeBaseSchema.extend({ kind: z.enum(["input", "exit", "person"]) }),
])

const edgeLabelSchema = z
  .string()
  .min(1)
  .refine((label) => !VAGUE_EDGE_LABELS.has(label.toLowerCase()), {
    message: "Edge label must say what flows, not just 'uses' or 'calls'",
  })
  .refine((label) => label.split(/\s+/).length <= MAX_EDGE_LABEL_WORDS, {
    message: `Edge label must be ${String(MAX_EDGE_LABEL_WORDS)} words or fewer`,
  })

const diagramEdgeSchema = z
  .object({
    id: z.string().min(1),
    from: z.string().min(1),
    to: z.string().min(1),
    // Step to step, the numbers say enough; every other arrow says what it
    // carries.
    label: edgeLabelSchema.optional(),
    // "repeat" closes the loop; "exit" leaves it; "pause" waits on a person.
    kind: z.enum(["flow", "repeat", "exit", "pause"]),
  })
  .refine((edge) => edge.kind === "flow" || edge.label !== undefined, {
    message: "Only a step-to-step arrow may go without a label",
  })

export const diagramSchema = z
  .object({
    title: z.string().min(1),
    scope: z.string().min(1),
    summary: z.string().min(1),
    // The box the steps sit in, named for the term it stands for.
    loop: z.object({ title: z.string().min(1), termId: termIdSchema }),
    // A one-line key: who does what.
    actorKey: z.object({ model: z.string().min(1), agent: z.string().min(1) }),
    nodes: z.array(diagramNodeSchema).min(1),
    edges: z.array(diagramEdgeSchema),
    // What the side panel lists for a term, beyond its definition.
    details: z.partialRecord(termIdSchema, z.array(diagramSectionSchema)),
  })
  .superRefine((diagram, context) => {
    const nodeIds = new Set(diagram.nodes.map((node) => node.id))
    if (nodeIds.size !== diagram.nodes.length) {
      context.addIssue({ code: "custom", message: "Two nodes share an id" })
    }

    // Steps are numbered 1, 2, 3… in the order they're listed.
    const stepNumbers = diagram.nodes.flatMap((node) =>
      node.kind === "step" ? [node.step] : []
    )
    if (!stepNumbers.every((step, index) => step === index + 1)) {
      context.addIssue({
        code: "custom",
        message: "Steps must be numbered 1, 2, 3… in the order they're listed",
      })
    }
    const hasModelStep = diagram.nodes.some(
      (node) => node.kind === "step" && node.actor === "model"
    )
    if (!hasModelStep) {
      context.addIssue({
        code: "custom",
        message:
          "One step must be the model's: it's the only part that decides",
      })
    }

    const connectedNodeIds = new Set<string>()
    for (const edge of diagram.edges) {
      for (const endpoint of [edge.from, edge.to]) {
        if (!nodeIds.has(endpoint)) {
          context.addIssue({
            code: "custom",
            message: `Edge "${edge.id}" points at unknown node "${endpoint}"`,
          })
        }
        connectedNodeIds.add(endpoint)
      }
    }
    for (const node of diagram.nodes) {
      if (!connectedNodeIds.has(node.id)) {
        context.addIssue({
          code: "custom",
          message: `Node "${node.id}" has no arrows; every part connects to another`,
        })
      }
    }
    if (!diagram.edges.some((edge) => edge.kind === "repeat")) {
      context.addIssue({
        code: "custom",
        message: "The loop needs one arrow that repeats it",
      })
    }

    const drawn = new Set<string>([
      diagram.loop.termId,
      ...diagram.nodes.flatMap((node) => node.termIds),
    ])
    for (const termId of Object.keys(diagram.details)) {
      if (!drawn.has(termId)) {
        context.addIssue({
          code: "custom",
          message: `Details for "${termId}", which the diagram doesn't draw`,
        })
      }
    }
  })

export type Diagram = z.infer<typeof diagramSchema>
export type DiagramNode = Diagram["nodes"][number]
export type DiagramEdge = Diagram["edges"][number]
export type DiagramSection = z.infer<typeof diagramSectionSchema>
