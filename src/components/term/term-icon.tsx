import {
  BookOpen,
  Brain,
  Cog,
  Eye,
  History,
  Layers,
  ListOrdered,
  type LucideIcon,
  MessageCircleQuestion,
  Play,
  Plug,
  Repeat,
  Scale,
  ScrollText,
  ShieldAlert,
  SlidersHorizontal,
  UserCheck,
  Wrench,
  Zap,
} from "lucide-react"

import { type TermId } from "@/lib/vocabulary/term-schema"
import { type ToolType } from "@/lib/vocabulary/tool-type"

const TERM_ICONS: Record<TermId, LucideIcon> = {
  trigger: Zap,
  prompt: ScrollText,
  rules: Scale,
  skills: BookOpen,
  memory: History,
  context: Eye,
  model: Brain,
  run: Play,
  loop: Repeat,
  tools: Wrench,
  "mcp-tools": Plug,
  "agent-tools": Layers,
  ask: MessageCircleQuestion,
  approvals: UserCheck,
  "approval-modes": SlidersHorizontal,
  guardrails: ShieldAlert,
  steps: ListOrdered,
}

const TOOL_TYPE_ICONS: Record<ToolType, LucideIcon> = {
  mcp: Plug,
  agent: Layers,
  "built-in": Cog,
}

type TermIconProps = {
  termId: TermId
  className?: string
}

export function TermIcon({ termId, className }: TermIconProps) {
  const Icon = TERM_ICONS[termId]
  return <Icon aria-hidden="true" className={className} />
}

type ToolTypeIconProps = {
  toolType: ToolType
  className?: string
}

export function ToolTypeIcon({ toolType, className }: ToolTypeIconProps) {
  const Icon = TOOL_TYPE_ICONS[toolType]
  return <Icon aria-hidden="true" className={className} />
}
