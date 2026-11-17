import { describe, expect, it } from "vitest"

import { WORKS_DIAGRAM } from "@/features/agent-works/config/works-diagram"
import {
  type Box,
  layoutDiagram,
} from "@/features/agent-works/lib/layout-diagram"

function overlaps(first: Box, second: Box): boolean {
  return (
    first.x < second.x + second.width &&
    second.x < first.x + first.width &&
    first.y < second.y + second.height &&
    second.y < first.y + first.height
  )
}

function contains(outer: Box, inner: Box): boolean {
  return (
    inner.x >= outer.x &&
    inner.y >= outer.y &&
    inner.x + inner.width <= outer.x + outer.width &&
    inner.y + inner.height <= outer.y + outer.height
  )
}

describe("layoutDiagram", () => {
  it("places every part without any two overlapping", () => {
    const layout = layoutDiagram(WORKS_DIAGRAM)
    const boxes = WORKS_DIAGRAM.nodes.map((node) => layout.nodes[node.id])

    expect(boxes.every(Boolean)).toBe(true)
    const placed = boxes.filter((box) => box !== undefined)
    for (const [index, box] of placed.entries()) {
      for (const other of placed.slice(index + 1)) {
        expect(overlaps(box, other)).toBe(false)
      }
    }
  })

  it("draws the steps inside the loop, and everything else outside it", () => {
    const layout = layoutDiagram(WORKS_DIAGRAM)

    for (const node of WORKS_DIAGRAM.nodes) {
      const box = layout.nodes[node.id]
      if (!box) {
        throw new Error(`No box for ${node.id}`)
      }
      expect(contains(layout.loop, box), node.id).toBe(node.kind === "step")
    }
  })

  it("goes round the ring clockwise: along the top, then back along the bottom", () => {
    const { nodes } = layoutDiagram(WORKS_DIAGRAM)
    const box = (id: string) => nodes[id] ?? { x: Number.NaN, y: Number.NaN }

    expect(box("request").y).toBe(box("decide").y)
    expect(box("decide").y).toBe(box("check").y)
    expect(box("request").x).toBeLessThan(box("decide").x)
    expect(box("decide").x).toBeLessThan(box("check").x)
    expect(box("run").x).toBe(box("check").x)
    expect(box("run").y).toBeGreaterThan(box("check").y)
    expect(box("results").x).toBe(box("request").x)
    expect(box("results").y).toBe(box("run").y)
  })

  it("draws the repeat arrow straight up, closing the ring", () => {
    const { edges } = layoutDiagram(WORKS_DIAGRAM)
    const [start, end] = edges["results-request"]?.points ?? []

    expect(start?.x).toBe(end?.x)
    expect(end?.y).toBeLessThan(start?.y ?? Number.NaN)
  })

  it("puts what starts the loop above it and the ways out below it", () => {
    const { loop, nodes } = layoutDiagram(WORKS_DIAGRAM)
    const loopBottom = loop.y + loop.height

    const box = (id: string) =>
      nodes[id] ?? { x: Number.NaN, y: Number.NaN, width: 0, height: 0 }

    expect(box("trigger").y + box("trigger").height).toBeLessThan(loop.y)
    expect(box("stop").y).toBeGreaterThan(loopBottom)
    expect(box("person").y).toBeGreaterThan(loopBottom)
  })

  it("routes every arrow, and labels every one that has a label", () => {
    const layout = layoutDiagram(WORKS_DIAGRAM)

    for (const edge of WORKS_DIAGRAM.edges) {
      expect(layout.edges[edge.id]?.points.length).toBeGreaterThanOrEqual(2)
      expect(layout.edges[edge.id]?.label !== undefined).toBe(
        edge.label !== undefined
      )
    }
  })

  it("keeps every label clear of every box", () => {
    const layout = layoutDiagram(WORKS_DIAGRAM)
    const boxes = Object.values(layout.nodes)

    for (const [id, edge] of Object.entries(layout.edges)) {
      if (!edge.label) {
        continue
      }
      for (const box of boxes) {
        expect(overlaps(edge.label, box), id).toBe(false)
      }
    }
  })

  it("takes an arrow that leaves the loop round outside its border", () => {
    const { loop, edges } = layoutDiagram(WORKS_DIAGRAM)
    const laneX = Math.max(
      ...(edges["check-person"]?.points ?? []).map((point) => point.x)
    )

    expect(laneX).toBeGreaterThanOrEqual(loop.x + loop.width + 24)
  })

  it("lays the diagram out the same way every time", () => {
    expect(layoutDiagram(WORKS_DIAGRAM)).toEqual(layoutDiagram(WORKS_DIAGRAM))
  })
})
