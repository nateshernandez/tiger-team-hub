import { ToolTypeIcon } from "@/components/term/term-icon"
import { cn } from "@/lib/utils"
import { TOOL_TYPE_LABELS, type ToolType } from "@/lib/vocabulary/tool-type"

// Same shapes as the MCP and agent tool chips: dashed for MCP, solid for ours.
const TOOL_TYPE_STYLES: Record<ToolType, string> = {
  mcp: "border-dashed border-role-act/60 text-role-act-foreground",
  agent: "border-role-act/35 bg-role-act-surface text-role-act-foreground",
  "built-in": "border-border bg-muted text-muted-foreground",
}

type ToolTypeBadgeProps = {
  toolType: ToolType
  className?: string
}

export function ToolTypeBadge({ toolType, className }: ToolTypeBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-5 shrink-0 items-center gap-1 rounded border px-1.5 text-[11px] font-medium whitespace-nowrap",
        TOOL_TYPE_STYLES[toolType],
        className
      )}
    >
      <ToolTypeIcon toolType={toolType} className="size-3" />
      {TOOL_TYPE_LABELS[toolType]}
    </span>
  )
}
