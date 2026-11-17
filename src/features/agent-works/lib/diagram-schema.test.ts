import { describe, expect, it } from "vitest"

import { diagramSchema } from "@/features/agent-works/lib/diagram-schema"

const VALID_DIAGRAM = {
  title: "Loop",
  scope: "One agent",
  summary: "Test",
  loop: { title: "Agent loop", termId: "loop" },
  actorKey: { model: "The model decides", agent: "The agent acts" },
  nodes: [
    {
      id: "decide",
      kind: "step",
      step: 1,
      actor: "model",
      title: "Model decides",
      description: "The model picks the next step.",
      termIds: ["model"],
    },
    {
      id: "run",
      kind: "step",
      step: 2,
      actor: "agent",
      title: "Run tools",
      description: "The agent runs the tools.",
      termIds: ["tools"],
    },
  ],
  edges: [
    {
      id: "decide-run",
      from: "decide",
      to: "run",
      label: "asks for tools",
      kind: "flow",
    },
    {
      id: "run-decide",
      from: "run",
      to: "decide",
      label: "repeat",
      kind: "repeat",
    },
  ],
  details: {},
}

function issueMessages(input: unknown): string[] {
  const result = diagramSchema.safeParse(input)
  return result.error?.issues.map((issue) => issue.message) ?? []
}

describe("diagramSchema", () => {
  it("accepts a loop of numbered steps that repeats", () => {
    expect(diagramSchema.safeParse(VALID_DIAGRAM).success).toBe(true)
  })

  it("rejects an arrow labeled with a bare verb", () => {
    const [edge, repeat] = VALID_DIAGRAM.edges

    expect(
      issueMessages({
        ...VALID_DIAGRAM,
        edges: [{ ...edge, label: "uses" }, repeat],
      })
    ).toContain("Edge label must say what flows, not just 'uses' or 'calls'")
  })

  it("rejects an arrow that points at an unknown part", () => {
    const [edge, repeat] = VALID_DIAGRAM.edges

    expect(
      issueMessages({
        ...VALID_DIAGRAM,
        edges: [{ ...edge, to: "nowhere" }, repeat],
      })
    ).toContain('Edge "decide-run" points at unknown node "nowhere"')
  })

  it("rejects a loop with no arrow that repeats it", () => {
    const [edge] = VALID_DIAGRAM.edges

    expect(issueMessages({ ...VALID_DIAGRAM, edges: [edge] })).toContain(
      "The loop needs one arrow that repeats it"
    )
  })

  it("rejects steps numbered out of order", () => {
    const [first, second] = VALID_DIAGRAM.nodes

    expect(
      issueMessages({
        ...VALID_DIAGRAM,
        nodes: [first, { ...second, step: 3 }],
      })
    ).toContain("Steps must be numbered 1, 2, 3… in the order they're listed")
  })

  it("rejects a loop where the model decides nothing", () => {
    const [first, second] = VALID_DIAGRAM.nodes

    expect(
      issueMessages({
        ...VALID_DIAGRAM,
        nodes: [{ ...first, actor: "agent" }, second],
      })
    ).toContain("One step must be the model's: it's the only part that decides")
  })

  it("rejects details for a term the diagram doesn't draw", () => {
    expect(
      issueMessages({
        ...VALID_DIAGRAM,
        details: {
          memory: [
            { title: "Keeps", items: [{ name: "a", description: "b" }] },
          ],
        },
      })
    ).toContain('Details for "memory", which the diagram doesn\'t draw')
  })
})
