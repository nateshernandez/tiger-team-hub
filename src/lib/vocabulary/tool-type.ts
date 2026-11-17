import { z } from "zod"

// MCP tools and agent tools must look different everywhere they appear, so
// every view reads a tool's type from this one list.
const TOOL_TYPES = ["mcp", "agent", "built-in"] as const
export const toolTypeSchema = z.enum(TOOL_TYPES)
export type ToolType = z.infer<typeof toolTypeSchema>

export const TOOL_TYPE_LABELS: Record<ToolType, string> = {
  mcp: "MCP tool",
  agent: "Agent tool",
  "built-in": "Built-in tool",
}
