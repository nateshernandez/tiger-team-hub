import { type Point } from "@/features/agent-works/lib/layout-diagram"

const CORNER_RADIUS = 10

// An SVG path through ELK's orthogonal route, with each corner rounded.
export function roundedEdgePath(points: Point[]): string {
  const [start, ...rest] = points
  if (!start || rest.length === 0) {
    return ""
  }

  const commands = [`M ${String(start.x)} ${String(start.y)}`]
  for (const [index, corner] of rest.entries()) {
    const previous = points[index] ?? start
    const next = rest[index + 1]
    if (!next) {
      commands.push(`L ${String(corner.x)} ${String(corner.y)}`)
      continue
    }
    const radius = Math.min(
      CORNER_RADIUS,
      distance(previous, corner) / 2,
      distance(corner, next) / 2
    )
    const before = toward(corner, previous, radius)
    const after = toward(corner, next, radius)
    commands.push(
      `L ${String(before.x)} ${String(before.y)}`,
      `Q ${String(corner.x)} ${String(corner.y)} ${String(after.x)} ${String(after.y)}`
    )
  }
  return commands.join(" ")
}

function distance(from: Point, to: Point): number {
  return Math.hypot(to.x - from.x, to.y - from.y)
}

function toward(from: Point, to: Point, length: number): Point {
  const total = distance(from, to)
  if (total === 0) {
    return from
  }
  return {
    x: from.x + ((to.x - from.x) / total) * length,
    y: from.y + ((to.y - from.y) / total) * length,
  }
}
