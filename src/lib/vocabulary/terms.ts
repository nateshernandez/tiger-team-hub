import {
  type Term,
  type TermId,
  type TermRole,
  vocabularySchema,
} from "@/lib/vocabulary/term-schema"

// The order here is the reading order: inputs, then deciding, then acting,
// then the safeguards around it. Views list terms in this order.
const TERM_ENTRIES: Term[] = [
  {
    id: "trigger",
    label: "Trigger",
    role: "input",
    definition:
      "What starts a {run}: a person's message, such as a receipt being attached, or something happening in the account.",
  },
  {
    id: "prompt",
    label: "Prompt",
    role: "input",
    definition:
      "Instructions the agent reads before every run, saying who it is and how it should work.",
  },
  {
    id: "rules",
    label: "Rules",
    role: "input",
    definition:
      "Policies in the {prompt} the agent must follow: some always, some only when it uses certain {tools}.",
  },
  {
    id: "skills",
    label: "Skills",
    role: "input",
    definition:
      "Step-by-step guides for one kind of task, which the agent picks and opens only when needed.",
    why: "Skills guide; they don't grant. Opening one adds instructions, never new tools.",
  },
  {
    id: "memory",
    label: "Memory",
    role: "input",
    definition:
      "What carries from step to step: every message, tool call and result so far, word for word.",
  },
  {
    id: "context",
    label: "Context",
    role: "decide",
    definition:
      "Everything the {model} can see at one moment: the {prompt}, the tool list and {memory}.",
  },
  {
    id: "model",
    label: "Model",
    role: "decide",
    definition:
      "The AI that reads the {context} and decides what to do next; the agent's code checks and carries it out.",
  },
  {
    id: "run",
    label: "Run",
    role: "decide",
    definition:
      "The agent's unit of work: from one {trigger}, around the {loop} until it replies or stops.",
  },
  {
    id: "loop",
    label: "Loop",
    role: "decide",
    definition:
      "The cycle a {run} repeats: build a request, the {model} decides, {tools} run, and the results are added.",
  },
  {
    id: "tools",
    label: "Tools",
    role: "act",
    definition:
      "The actions the agent can take: read tools look things up, and write tools change records.",
    why: "The agent looks things up instead of memorizing: facts come from read tools every time, never from a separate store.",
  },
  {
    id: "mcp-tools",
    label: "MCP tools",
    role: "act",
    definition:
      "{tools|Tools} that come straight from one of our services, each doing one small thing, like listing projects.",
  },
  {
    id: "agent-tools",
    label: "Agent tools",
    role: "act",
    definition:
      "{tools|Tools} we write that combine several {mcp-tools|MCP tools} with our own checks, so one step does the work.",
  },
  {
    id: "ask",
    label: "Ask",
    role: "act",
    definition:
      "The {tools|tool} the agent uses to pause and ask a person questions when something is unclear.",
  },
  {
    id: "approvals",
    label: "Approvals",
    role: "oversight",
    definition:
      "In a conversation, a write {tools|tool} waits for a person's yes; the {approval-modes|approval mode} decides which writes wait.",
    why: "A write waiting for approval pauses the run exactly the way Ask does.",
  },
  {
    id: "approval-modes",
    label: "Approval mode",
    role: "oversight",
    definition:
      "How often a person must say yes: before every write, only for risky ones, or once for a whole plan.",
  },
  {
    id: "guardrails",
    label: "Guardrails",
    role: "oversight",
    definition:
      "Automatic checks that block harmful content in or out, and stop runs that repeat or go on too long.",
  },
  {
    id: "steps",
    label: "Steps",
    role: "oversight",
    definition:
      "The visible log of what the agent did, one line for each {tools|tool} it used.",
  },
]

export const TERMS: readonly Term[] = vocabularySchema.parse(TERM_ENTRIES)

const TERM_BY_ID = new Map(TERMS.map((term) => [term.id, term]))

export function getTerm(termId: TermId): Term {
  const term = TERM_BY_ID.get(termId)
  if (!term) {
    throw new Error(`getTerm: no term with id "${termId}"`)
  }
  return term
}

export const ROLE_LABELS: Record<TermRole, string> = {
  input: "Inputs",
  decide: "Deciding",
  act: "Acting",
  oversight: "Safeguards",
}
