import { ROLE_STYLES } from "@/components/term/role-styles"
import { TermIcon } from "@/components/term/term-icon"
import { cn } from "@/lib/utils"
import { type TermId } from "@/lib/vocabulary/term-schema"
import { getTerm } from "@/lib/vocabulary/terms"

// MCP tools are drawn with a dashed outline and agent tools with a solid
// fill, so the two never look alike, even without color.
const TOOL_TERM_SHAPES: Partial<Record<TermId, string>> = {
  "mcp-tools": "border-dashed bg-transparent",
  "agent-tools": "border-solid",
}

type TermChipProps = {
  termId: TermId
  size?: "sm" | "md"
  className?: string
}

export function TermChip({ termId, size = "md", className }: TermChipProps) {
  const term = getTerm(termId)
  const style = ROLE_STYLES[term.role]

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-md border font-medium whitespace-nowrap",
        size === "sm" ? "h-6 px-1.5 text-xs" : "h-7 px-2 text-[13px]",
        style.surface,
        style.foreground,
        style.border,
        TOOL_TERM_SHAPES[termId],
        className
      )}
    >
      <TermIcon
        termId={termId}
        className={cn(size === "sm" ? "size-3.5" : "size-4", style.icon)}
      />
      {term.label}
    </span>
  )
}
