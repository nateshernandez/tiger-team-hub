import {
  type Diagram,
  type DiagramEdge,
  type DiagramNode,
} from "@/features/agent-works/lib/diagram-schema"

// The loop is drawn as a ring, so its shape says "this repeats" before any
// label does: the first steps run left to right along the top, the rest come
// back right to left along the bottom, and the last step sits under the
// first, so the repeat arrow closes the ring. What starts the loop sits above
// it, and the ways out hang below. Positions come from the config's order,
// the same way every time; nobody places a box by hand.

const STEP_WIDTH = 196
const OUTSIDE_WIDTH = 184
const NODE_HEADER_HEIGHT = 46
const CHIP_ROW_HEIGHT = 28
const CHIPS_PER_ROW = 2
const NODE_BOTTOM_PADDING = 12

const COLUMN_GAP = 72
const ROW_GAP = 84
const LOOP_PADDING = { top: 60, right: 32, bottom: 32, left: 32 }
// Space between the loop's edge and what sits outside it.
const OUTSIDE_GAP = 72
// How far an arrow detours to the right to get round a step in its way.
const LANE_OFFSET = 28

// Labels render at 12px.
const LABEL_CHARACTER_WIDTH = 6.4
const LABEL_PADDING_X = 20
const LABEL_HEIGHT = 26
const LABEL_BESIDE_LINE = 8

export type Point = { x: number; y: number }
export type Box = Point & { width: number; height: number }

export type DiagramLayout = {
  width: number
  height: number
  // The loop's box, and every node's box, in the diagram's own coordinates.
  loop: Box
  nodes: Record<string, Box>
  edges: Record<string, { points: Point[]; label: Box | undefined }>
}

function nodeHeight(node: DiagramNode): number {
  const chipRows = Math.ceil(node.termIds.length / CHIPS_PER_ROW)
  return NODE_HEADER_HEIGHT + chipRows * CHIP_ROW_HEIGHT + NODE_BOTTOM_PADDING
}

type RingSlot = { column: number; row: 0 | 1 }

// Which column of the ring each step sits in, and on which row. The first
// half run along the top; the rest come back along the bottom from the
// right, with the last step under the first so the repeat arrow is a
// straight line up.
function ringSlots(stepCount: number): RingSlot[] {
  const topCount = Math.ceil(stepCount / 2)
  const bottomCount = stepCount - topCount
  const slots: RingSlot[] = []
  for (let index = 0; index < topCount; index += 1) {
    slots.push({ column: index, row: 0 })
  }
  for (let index = 0; index < bottomCount; index += 1) {
    const isLast = index === bottomCount - 1
    slots.push({ column: isLast ? 0 : topCount - 1 - index, row: 1 })
  }
  return slots
}

const center = (box: Box): Point => ({
  x: box.x + box.width / 2,
  y: box.y + box.height / 2,
})
const right = (box: Box): number => box.x + box.width
const bottom = (box: Box): number => box.y + box.height

function overlapsHorizontally(first: Box, second: Box): boolean {
  return first.x < right(second) && second.x < right(first)
}

function overlapsVertically(first: Box, second: Box): boolean {
  return first.y < bottom(second) && second.y < bottom(first)
}

function isBoxInside(box: Box, container: Box): boolean {
  return (
    box.x >= container.x &&
    box.y >= container.y &&
    right(box) <= right(container) &&
    bottom(box) <= bottom(container)
  )
}

// An orthogonal route between two boxes: straight when they share a row or
// a column, round to the right when a box is in the way, and an elbow
// otherwise. An arrow leaving the loop takes its detour outside the loop's
// border, not along it.
function route(from: Box, to: Box, obstacles: Box[], loop: Box): Point[] {
  const start = center(from)
  const end = center(to)

  if (overlapsVertically(from, to)) {
    const y = start.y
    return end.x > start.x
      ? [
          { x: right(from), y },
          { x: to.x, y },
        ]
      : [
          { x: from.x, y },
          { x: right(to), y },
        ]
  }

  if (overlapsHorizontally(from, to)) {
    const top = Math.min(bottom(from), bottom(to))
    const lower = Math.max(from.y, to.y)
    const blockers = obstacles.filter(
      (box) =>
        box !== from &&
        box !== to &&
        overlapsHorizontally(box, from) &&
        box.y >= top &&
        bottom(box) <= lower
    )
    if (blockers.length > 0) {
      const isLeavingLoop = isBoxInside(from, loop) !== isBoxInside(to, loop)
      const laneX =
        Math.max(
          right(from),
          right(to),
          ...blockers.map(right),
          ...(isLeavingLoop ? [right(loop)] : [])
        ) + LANE_OFFSET
      return [
        { x: right(from), y: start.y },
        { x: laneX, y: start.y },
        { x: laneX, y: end.y },
        { x: right(to), y: end.y },
      ]
    }
    const x = start.x
    return end.y > start.y
      ? [
          { x, y: bottom(from) },
          { x, y: to.y },
        ]
      : [
          { x, y: from.y },
          { x, y: bottom(to) },
        ]
  }

  const isBelow = end.y > start.y
  const fromY = isBelow ? bottom(from) : from.y
  const toY = isBelow ? to.y : bottom(to)
  const middleY = (fromY + toY) / 2
  return [
    { x: start.x, y: fromY },
    { x: start.x, y: middleY },
    { x: end.x, y: middleY },
    { x: end.x, y: toY },
  ]
}

type Segment = { start: Point; end: Point }

function segmentsOf(points: Point[]): Segment[] {
  return points.slice(1).map((end, index) => ({
    start: points[index] ?? end,
    end,
  }))
}

function segmentLength({ start, end }: Segment): number {
  return Math.hypot(end.x - start.x, end.y - start.y)
}

function boxesOverlap(first: Box, second: Box): boolean {
  return (
    overlapsHorizontally(first, second) && overlapsVertically(first, second)
  )
}

function segmentCrossesBox({ start, end }: Segment, box: Box): boolean {
  const left = Math.min(start.x, end.x)
  const top = Math.min(start.y, end.y)
  return boxesOverlap(
    {
      x: left,
      y: top,
      width: Math.abs(end.x - start.x) || 1,
      height: Math.abs(end.y - start.y) || 1,
    },
    box
  )
}

function isInside(point: Point, box: Box): boolean {
  return (
    point.x >= box.x &&
    point.x <= right(box) &&
    point.y >= box.y &&
    point.y <= bottom(box)
  )
}

// The parts of an arrow's vertical runs that lie above or below the loop.
function verticalRunsOutside(segments: Segment[], loop: Box): Segment[] {
  return segments.flatMap(({ start, end }) => {
    if (start.x !== end.x) {
      return []
    }
    const top = Math.min(start.y, end.y)
    const lower = Math.max(start.y, end.y)
    const runs: [number, number][] = [
      [Math.max(top, bottom(loop)), lower],
      [top, Math.min(lower, loop.y)],
    ]
    return runs
      .filter(([runTop, runBottom]) => runBottom > runTop)
      .map(([runTop, runBottom]) => ({
        start: { x: start.x, y: runTop },
        end: { x: start.x, y: runBottom },
      }))
  })
}

// A label sits on its arrow, centered on a horizontal run or beside a
// vertical one. An arrow that crosses the loop's border gets its label in
// the gap outside the loop; otherwise it tries the middle of its longest
// run, then either side, and takes the first spot that covers no box and no
// other arrow.
function placeLabel(
  points: Point[],
  text: string,
  loop: Box,
  boxes: Box[],
  otherSegments: Segment[]
): Box {
  const width = Math.ceil(text.length * LABEL_CHARACTER_WIDTH + LABEL_PADDING_X)
  const labelAt = (segment: Segment, fraction: number): Box => {
    const x = segment.start.x + (segment.end.x - segment.start.x) * fraction
    const y = segment.start.y + (segment.end.y - segment.start.y) * fraction
    const isVertical = segment.start.x === segment.end.x
    return {
      x: isVertical ? x + LABEL_BESIDE_LINE : x - width / 2,
      y: y - LABEL_HEIGHT / 2,
      width,
      height: LABEL_HEIGHT,
    }
  }

  const segments = segmentsOf(points)
  const candidates: Box[] = []
  const first = points[0]
  const last = points.at(-1)
  const isCrossingLoop =
    first !== undefined &&
    last !== undefined &&
    isInside(first, loop) !== isInside(last, loop)
  if (isCrossingLoop) {
    for (const outsideRun of verticalRunsOutside(segments, loop)) {
      candidates.push(labelAt(outsideRun, 0.5))
    }
  }
  const longest = segments.toSorted(
    (firstSegment, secondSegment) =>
      segmentLength(secondSegment) - segmentLength(firstSegment)
  )[0]
  if (longest) {
    candidates.push(
      ...[0.5, 0.3, 0.7, 0.2, 0.8].map((fraction) => labelAt(longest, fraction))
    )
  }

  const isClear = (label: Box): boolean =>
    !boxes.some((box) => boxesOverlap(label, box)) &&
    !otherSegments.some((segment) => segmentCrossesBox(segment, label))
  return (
    candidates.find(isClear) ??
    candidates[0] ?? { x: 0, y: 0, width, height: LABEL_HEIGHT }
  )
}

// What sits outside the loop lines up with the steps it connects to.
function outsideColumn(
  node: DiagramNode,
  edges: DiagramEdge[],
  columnByStepId: Map<string, number>
): number {
  const connectedIds = edges.flatMap((edge) => {
    if (edge.from === node.id) {
      return [edge.to]
    }
    if (edge.to === node.id) {
      return [edge.from]
    }
    return []
  })
  const columns = connectedIds.flatMap((id) => {
    const column = columnByStepId.get(id)
    return column === undefined ? [] : [column]
  })
  if (columns.length === 0) {
    return 0
  }
  const total = columns.reduce((sum, column) => sum + column, 0)
  return Math.round(total / columns.length)
}

export function layoutDiagram(diagram: Diagram): DiagramLayout {
  const steps = diagram.nodes.filter((node) => node.kind === "step")
  const slots = ringSlots(steps.length)
  const columnCount = Math.max(1, ...slots.map((slot) => slot.column + 1))
  const stepHeight = Math.max(...steps.map(nodeHeight))

  const loopWidth =
    LOOP_PADDING.left +
    columnCount * STEP_WIDTH +
    (columnCount - 1) * COLUMN_GAP +
    LOOP_PADDING.right
  const loopHeight =
    LOOP_PADDING.top + 2 * stepHeight + ROW_GAP + LOOP_PADDING.bottom
  const columnX = (column: number): number =>
    LOOP_PADDING.left + column * (STEP_WIDTH + COLUMN_GAP)

  const nodes: Record<string, Box> = {}
  const columnByStepId = new Map<string, number>()
  for (const [index, step] of steps.entries()) {
    const slot = slots[index] ?? { column: 0, row: 0 }
    columnByStepId.set(step.id, slot.column)
    nodes[step.id] = {
      x: columnX(slot.column),
      y: LOOP_PADDING.top + slot.row * (stepHeight + ROW_GAP),
      width: STEP_WIDTH,
      height: stepHeight,
    }
  }

  for (const node of diagram.nodes) {
    if (node.kind === "step") {
      continue
    }
    const column = outsideColumn(node, diagram.edges, columnByStepId)
    const height = nodeHeight(node)
    nodes[node.id] = {
      x: columnX(column) + (STEP_WIDTH - OUTSIDE_WIDTH) / 2,
      y:
        node.kind === "input"
          ? -OUTSIDE_GAP - height
          : loopHeight + OUTSIDE_GAP,
      width: OUTSIDE_WIDTH,
      height,
    }
  }

  const loop: Box = { x: 0, y: 0, width: loopWidth, height: loopHeight }
  const obstacles = Object.values(nodes)
  const routes = new Map<string, Point[]>()
  for (const edge of diagram.edges) {
    const from = nodes[edge.from]
    const to = nodes[edge.to]
    if (from && to) {
      routes.set(edge.id, route(from, to, obstacles, loop))
    }
  }

  const edges: DiagramLayout["edges"] = {}
  for (const edge of diagram.edges) {
    const points = routes.get(edge.id)
    if (!points) {
      continue
    }
    const otherSegments = [...routes.entries()]
      .filter(([id]) => id !== edge.id)
      .flatMap(([, otherPoints]) => segmentsOf(otherPoints))
    edges[edge.id] = {
      points,
      label: edge.label
        ? placeLabel(points, edge.label, loop, obstacles, otherSegments)
        : undefined,
    }
  }

  return normalize({ loop, nodes, edges })
}

// Shift everything so the top-left corner is at 0,0, and measure the whole.
function normalize({
  loop,
  nodes,
  edges,
}: Omit<DiagramLayout, "width" | "height">): DiagramLayout {
  const boxes = [
    loop,
    ...Object.values(nodes),
    ...Object.values(edges).flatMap((edge) => (edge.label ? [edge.label] : [])),
  ]
  const points = Object.values(edges).flatMap((edge) => edge.points)
  const minX = Math.min(
    ...boxes.map((box) => box.x),
    ...points.map((point) => point.x)
  )
  const minY = Math.min(
    ...boxes.map((box) => box.y),
    ...points.map((point) => point.y)
  )
  const maxX = Math.max(...boxes.map(right), ...points.map((point) => point.x))
  const maxY = Math.max(...boxes.map(bottom), ...points.map((point) => point.y))
  const shift = <Shape extends Point>(shape: Shape): Shape => ({
    ...shape,
    x: shape.x - minX,
    y: shape.y - minY,
  })

  return {
    width: maxX - minX,
    height: maxY - minY,
    loop: shift(loop),
    nodes: Object.fromEntries(
      Object.entries(nodes).map(([id, box]) => [id, shift(box)])
    ),
    edges: Object.fromEntries(
      Object.entries(edges).map(([id, edge]) => [
        id,
        {
          points: edge.points.map(shift),
          label: edge.label ? shift(edge.label) : undefined,
        },
      ])
    ),
  }
}
