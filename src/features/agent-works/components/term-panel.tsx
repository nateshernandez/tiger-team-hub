import { X } from "lucide-react"
import { type ReactNode } from "react"

import { ROLE_STYLES } from "@/components/term/role-styles"
import { TermChip } from "@/components/term/term-chip"
import { TermText } from "@/components/term/term-text"
import { ToolTypeBadge } from "@/components/term/tool-type-badge"
import { Button } from "@/components/ui/button"
import { type DiagramSelection } from "@/features/agent-works/components/diagram-node"
import {
  type Diagram,
  type DiagramNode,
  type DiagramSection,
} from "@/features/agent-works/lib/diagram-schema"
import {
  findNode,
  nodeIdsForTerm,
} from "@/features/agent-works/lib/diagram-terms"
import { cn } from "@/lib/utils"
import { type TermId } from "@/lib/vocabulary/term-schema"
import { getTerm } from "@/lib/vocabulary/terms"

const NODE_KIND_LABELS: Record<Exclude<DiagramNode["kind"], "step">, string> = {
  input: "What starts a run",
  exit: "A way out of the loop",
  person: "A pause in the loop",
}

type TermPanelProps = {
  diagram: Diagram
  selection: DiagramSelection | undefined
  onSelect: (selection: DiagramSelection) => void
  onClose: () => void
}

// Sits beside the diagram, not below it, so an explanation is always next to
// the part it explains (spatial contiguity).
export function TermPanel({
  diagram,
  selection,
  onSelect,
  onClose,
}: TermPanelProps) {
  if (selection?.type === "term") {
    return (
      <TermDetails
        diagram={diagram}
        termId={selection.termId}
        onSelect={onSelect}
        onClose={onClose}
      />
    )
  }
  const node =
    selection?.type === "node" ? findNode(diagram, selection.nodeId) : undefined
  if (node) {
    return <NodeDetails node={node} onSelect={onSelect} onClose={onClose} />
  }
  return <DiagramOverview diagram={diagram} onSelect={onSelect} />
}

type DiagramOverviewProps = {
  diagram: Diagram
  onSelect: (selection: DiagramSelection) => void
}

function DiagramOverview({ diagram, onSelect }: DiagramOverviewProps) {
  const steps = diagram.nodes.filter((node) => node.kind === "step")

  return (
    <div className="flex flex-col gap-6 p-5">
      <header className="flex flex-col gap-1.5">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {diagram.scope}
        </p>
        <h2 className="text-lg font-semibold tracking-tight">
          Select any step to learn more
        </h2>
        <p className="text-sm leading-relaxed text-pretty text-muted-foreground">
          {diagram.summary}
        </p>
      </header>

      <section
        aria-labelledby="steps-heading"
        className="flex flex-col gap-2.5"
      >
        <div className="flex flex-col gap-1.5">
          <h3 id="steps-heading" className="text-sm font-semibold">
            The loop, step by step
          </h3>
          {/* The step numbers are colored by who does the step, so the
              colors need their key here as well as in the diagram. */}
          <ul
            aria-label="Who does each step"
            className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground"
          >
            <li className="flex items-center gap-1.5 whitespace-nowrap">
              <span
                aria-hidden="true"
                className="size-2.5 rounded-full bg-role-decide"
              />
              {diagram.actorKey.model}
            </li>
            <li className="flex items-center gap-1.5 whitespace-nowrap">
              <span
                aria-hidden="true"
                className="size-2.5 rounded-full bg-foreground"
              />
              {diagram.actorKey.agent}
            </li>
          </ul>
        </div>
        <ol
          aria-labelledby="steps-heading"
          className="flex flex-col divide-y rounded-lg border bg-card"
        >
          {steps.map((step) => (
            <li key={step.id}>
              <button
                type="button"
                onClick={() => {
                  onSelect({ type: "node", nodeId: step.id })
                }}
                className="flex w-full items-start gap-3 px-3 py-2.5 text-left text-sm hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-inset"
              >
                <StepNumber node={step} />
                <span className="flex flex-col gap-0.5">
                  <span className="font-medium">{step.title}</span>
                  <span className="text-[13px] leading-relaxed text-pretty text-muted-foreground">
                    {step.description}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}

function StepNumber({
  node,
}: {
  node: Extract<DiagramNode, { kind: "step" }>
}) {
  return (
    <span
      className={cn(
        "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-background tabular-nums",
        node.actor === "model" ? "bg-role-decide" : "bg-foreground"
      )}
    >
      {node.step}
    </span>
  )
}

type NodeDetailsProps = {
  node: DiagramNode
  onSelect: (selection: DiagramSelection) => void
  onClose: () => void
}

function NodeDetails({ node, onSelect, onClose }: NodeDetailsProps) {
  return (
    <div className="flex flex-col gap-5 p-5">
      <PanelHeader onClose={onClose}>
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {node.kind === "step"
            ? `Step ${String(node.step)} of the agent loop`
            : NODE_KIND_LABELS[node.kind]}
        </p>
        <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          {node.kind === "step" ? <StepNumber node={node} /> : null}
          {node.title}
        </h2>
      </PanelHeader>

      <p className="text-[15px] leading-relaxed text-pretty">
        {node.description}
      </p>

      {node.kind === "step" ? (
        <p
          className={cn(
            "inline-flex items-center gap-2 self-start rounded-md border px-2 py-1 text-xs font-medium",
            node.actor === "model"
              ? "border-role-decide/40 bg-role-decide-surface text-role-decide-foreground"
              : "text-muted-foreground"
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              "size-2 rounded-full",
              node.actor === "model" ? "bg-role-decide" : "bg-foreground"
            )}
          />
          {node.actor === "model" ? "The model decides" : "The agent's code"}
        </p>
      ) : null}

      {node.example ? (
        <section className="flex flex-col gap-1.5">
          <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Example
          </h3>
          <p className="rounded-lg border bg-muted/50 px-3 py-2.5 font-mono text-[12.5px] leading-relaxed break-words">
            {node.example}
          </p>
        </section>
      ) : null}

      {node.termIds.length > 0 ? (
        <section className="flex flex-col gap-2">
          <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Terms here
          </h3>
          <ul className="flex flex-wrap gap-2">
            {node.termIds.map((termId) => (
              <li key={termId}>
                <button
                  type="button"
                  aria-label={`${getTerm(termId).label}: show what it is`}
                  onClick={() => {
                    onSelect({ type: "term", termId })
                  }}
                  className="rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  <TermChip termId={termId} size="sm" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}

type TermDetailsProps = {
  diagram: Diagram
  termId: TermId
  onSelect: (selection: DiagramSelection) => void
  onClose: () => void
}

function TermDetails({ diagram, termId, onSelect, onClose }: TermDetailsProps) {
  const term = getTerm(termId)
  const sections = diagram.details[termId] ?? []
  const homeNodes = nodeIdsForTerm(diagram, termId).flatMap((nodeId) => {
    const node = findNode(diagram, nodeId)
    return node ? [node] : []
  })

  return (
    <div className="flex flex-col gap-5 p-5">
      <PanelHeader onClose={onClose}>
        <TermChip termId={termId} className="self-start" />
        {homeNodes.length > 0 ? (
          <p className="flex flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground">
            In
            {homeNodes.map((node, index) => (
              <span key={node.id}>
                <button
                  type="button"
                  onClick={() => {
                    onSelect({ type: "node", nodeId: node.id })
                  }}
                  className="font-medium text-foreground underline underline-offset-2 hover:no-underline"
                >
                  {node.kind === "step"
                    ? `step ${String(node.step)}, ${node.title}`
                    : node.title}
                </button>
                {index < homeNodes.length - 1 ? "," : null}
              </span>
            ))}
          </p>
        ) : null}
      </PanelHeader>

      <p className="text-[15px] leading-relaxed text-pretty">
        <TermText text={term.definition} />
      </p>

      {term.why ? (
        <p
          className={cn(
            "rounded-lg border-l-[3px] bg-muted/50 py-2.5 pr-3 pl-3.5 text-sm leading-relaxed text-pretty",
            ROLE_STYLES[term.role].accentBorder
          )}
        >
          {term.why}
        </p>
      ) : null}

      {sections.map((section) => (
        <DetailSection key={section.title} section={section} />
      ))}
    </div>
  )
}

type PanelHeaderProps = {
  children: ReactNode
  onClose: () => void
}

function PanelHeader({ children, onClose }: PanelHeaderProps) {
  return (
    <header className="flex items-start justify-between gap-3">
      <div className="flex min-w-0 flex-col gap-2">{children}</div>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Close details"
        onClick={onClose}
      >
        <X />
      </Button>
    </header>
  )
}

function DetailSection({ section }: { section: DiagramSection }) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {section.title}
      </h3>
      {section.note ? (
        <p className="text-[13px] leading-relaxed text-pretty text-muted-foreground">
          {section.note}
        </p>
      ) : null}
      <ul className="divide-y rounded-lg border bg-card">
        {section.items.map((item) => (
          <li key={item.name} className="flex flex-col gap-1 px-3 py-2.5">
            <span className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "text-sm font-medium",
                  item.toolType && "font-mono text-[12.5px]"
                )}
              >
                {item.name}
              </span>
              {item.toolType ? (
                <ToolTypeBadge toolType={item.toolType} />
              ) : null}
            </span>
            <span className="text-[13px] leading-relaxed text-pretty text-muted-foreground">
              {item.description}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
