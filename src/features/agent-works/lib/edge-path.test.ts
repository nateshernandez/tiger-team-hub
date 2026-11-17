import { describe, expect, it } from "vitest"

import { roundedEdgePath } from "@/features/agent-works/lib/edge-path"

describe("roundedEdgePath", () => {
  it("draws a straight line between two points", () => {
    expect(
      roundedEdgePath([
        { x: 0, y: 0 },
        { x: 100, y: 0 },
      ])
    ).toBe("M 0 0 L 100 0")
  })

  it("rounds each corner of an orthogonal route", () => {
    expect(
      roundedEdgePath([
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 100 },
      ])
    ).toBe("M 0 0 L 90 0 Q 100 0 100 10 L 100 100")
  })

  it("draws nothing for a route with fewer than two points", () => {
    expect(roundedEdgePath([{ x: 5, y: 5 }])).toBe("")
  })
})
