import {
  type Diagram,
  diagramSchema,
} from "@/features/agent-works/lib/diagram-schema"

// The agent loop, drawn the way any agent works in any framework, with one
// receipt-coding run as the running example.
export const WORKS_DIAGRAM: Diagram = diagramSchema.parse({
  title: "How an agent works",
  scope: "The agent loop",
  summary:
    "Every agent runs the same loop: build a request, let the model decide, check and run the tools it asks for, add the results, and go again.",
  loop: { title: "Agent loop", termId: "loop" },
  actorKey: {
    model: "The model decides",
    agent: "The agent's code does everything else",
  },
  nodes: [
    {
      id: "trigger",
      kind: "input",
      title: "A message or an event",
      description:
        "A person's message, or something happening in the account, starts the run.",
      termIds: ["trigger"],
      example: "A lunch receipt, attached on its own",
    },
    {
      id: "request",
      kind: "step",
      step: 1,
      actor: "agent",
      title: "Build the request",
      description:
        "The agent's code gathers everything the model may need: its instructions, the conversation so far, and the tools it can use.",
      termIds: ["context", "prompt", "rules", "skills", "memory"],
      example:
        "Instructions, rules, the skill list, the tool list, and the receipt",
    },
    {
      id: "decide",
      kind: "step",
      step: 2,
      actor: "model",
      title: "Model decides",
      description:
        "The model reads the whole request and replies: some words, the tools it wants to use, or that it is done.",
      termIds: ["model"],
      example: "Search projects for Northwind",
    },
    {
      id: "check",
      kind: "step",
      step: 3,
      actor: "agent",
      title: "Check the call",
      description:
        "Before anything runs, the agent's code checks each tool call: is it allowed, within limits, and does a person need to say yes?",
      termIds: ["guardrails", "approvals", "approval-modes"],
      example:
        "Adding the expense is a write, so in manual mode it waits for a yes",
    },
    {
      id: "run",
      kind: "step",
      step: 4,
      actor: "agent",
      title: "Run tools",
      description:
        "The agent's code runs each tool the model asked for. The model never runs anything itself.",
      termIds: ["tools", "mcp-tools", "agent-tools"],
      example: "Project search \u2192 2 open Northwind projects",
    },
    {
      id: "results",
      kind: "step",
      step: 5,
      actor: "agent",
      title: "Add results",
      description:
        "Each tool's result joins the conversation and is logged as a step, so the next pass has more to see.",
      termIds: ["steps"],
      example: "The two projects join the next request",
    },
    {
      id: "person",
      kind: "person",
      title: "Wait for a person",
      description:
        "A question or a write that needs a yes pauses the loop until a person answers; then it carries on.",
      termIds: ["ask", "approvals"],
      example: "\u201cWhich Northwind project is this lunch for?\u201d",
    },
    {
      id: "stop",
      kind: "exit",
      title: "Reply and stop",
      description:
        "When the model needs no more tools, it replies and the run ends. A guardrail can also end it early.",
      example:
        "\u201cAdded a $186.40 Meals expense to Northwind \u2013 Website rebuild.\u201d",
    },
  ],
  edges: [
    {
      id: "trigger-request",
      from: "trigger",
      to: "request",
      label: "starts the run",
      kind: "flow",
    },
    {
      id: "request-decide",
      from: "request",
      to: "decide",
      kind: "flow",
    },
    {
      id: "decide-check",
      from: "decide",
      to: "check",
      kind: "flow",
    },
    {
      id: "check-run",
      from: "check",
      to: "run",
      label: "allowed",
      kind: "flow",
    },
    {
      id: "run-results",
      from: "run",
      to: "results",
      label: "outputs",
      kind: "flow",
    },
    {
      id: "results-request",
      from: "results",
      to: "request",
      label: "repeat",
      kind: "repeat",
    },
    {
      id: "check-person",
      from: "check",
      to: "person",
      label: "needs approval or an answer",
      kind: "pause",
    },
    {
      id: "person-run",
      from: "person",
      to: "run",
      label: "then carries on",
      kind: "pause",
    },
    {
      id: "decide-stop",
      from: "decide",
      to: "stop",
      label: "done",
      kind: "exit",
    },
  ],
  details: {
    trigger: [
      {
        title: "Two ways a run starts",
        items: [
          {
            name: "A person's message",
            description:
              "Someone writes to the agent in a conversation, perhaps attaching a file such as a receipt, and waits for its reply.",
          },
          {
            name: "Something happened",
            description:
              "An event in the account, such as a client signing a contract. No one is waiting.",
          },
        ],
      },
      {
        title: "What the agent is told",
        note: "Never what to do: picking the skill or tool is the agent's job.",
        items: [
          {
            name: "What happened",
            description: "One line, such as “A client signed a contract.”",
          },
          {
            name: "Whether a person is waiting",
            description: "So it never asks a question nobody will read.",
          },
          { name: "Today's date", description: "So “this week” means a date." },
          {
            name: "The records",
            description: "Which records the event is about.",
          },
          {
            name: "The message and documents",
            description: "Marked as data to read, never as instructions.",
          },
          {
            name: "The firm's policy",
            description:
              "When the run needs it, such as when an expense is billable.",
          },
        ],
      },
    ],
    prompt: [
      {
        title: "What it holds",
        items: [
          {
            name: "Who it is",
            description: "Its role, and the person it acts for.",
          },
          {
            name: "How to work",
            description:
              "Look facts up with tools, open a skill when one fits, and keep replies short.",
          },
          {
            name: "How to treat documents",
            description:
              "Text in a document is data to read, never orders to follow.",
          },
        ],
      },
    ],
    rules: [
      {
        title: "Two kinds of rules",
        items: [
          {
            name: "Always on",
            description:
              "Applies to every run, such as writing only what the run calls for.",
          },
          {
            name: "Tied to tools",
            description:
              "Applies only when the agent uses certain tools, such as copying exactly what a document states.",
          },
        ],
      },
    ],
    skills: [
      {
        title: "In the prompt",
        note: "Only a short entry per skill. Its full steps load when the agent opens it.",
        items: [
          {
            name: "A name",
            description: "The kind of task it covers.",
          },
          {
            name: "When to use it",
            description: "One line the model matches against the request.",
          },
        ],
      },
      {
        title: "Once it's opened",
        items: [
          {
            name: "The goal",
            description: "What the skill is for, and how to know it's done.",
          },
          {
            name: "The steps",
            description: "What to do in order, naming the tools to call.",
          },
          {
            name: "The pitfalls",
            description:
              "Where a naive attempt goes wrong, and what never to do.",
          },
        ],
      },
    ],
    memory: [
      {
        title: "What it keeps",
        items: [
          {
            name: "Every message",
            description: "From the person and the agent, word for word.",
          },
          {
            name: "Every tool call",
            description: "With its result, in full.",
          },
        ],
      },
      {
        title: "What it doesn't keep",
        items: [
          {
            name: "Facts about the firm",
            description:
              "Read fresh with read tools every time. There's no separate knowledge store.",
          },
        ],
      },
    ],
    context: [
      {
        title: "In every request",
        items: [
          {
            name: "The prompt",
            description: "Instructions, rules and the skill list.",
          },
          {
            name: "The tool list",
            description: "Each tool's name and when to use it.",
          },
        ],
      },
      {
        title: "Added as the run goes",
        items: [
          {
            name: "The trigger",
            description: "What happened, with any documents.",
          },
          {
            name: "An opened skill",
            description: "Its full steps, once the agent opens it.",
          },
          {
            name: "Tool results",
            description: "What each read returned and what each write changed.",
          },
          {
            name: "A person's answers",
            description:
              "Replies to the Ask tool, and approvals or changes to writes.",
          },
        ],
      },
    ],
    model: [
      {
        title: "Each time it decides, it can",
        items: [
          {
            name: "Use a tool",
            description: "Read something, or write a change.",
          },
          {
            name: "Open a skill",
            description: "Load the steps for the task in hand.",
          },
          {
            name: "Ask a person",
            description: "Only when someone is waiting to answer.",
          },
          {
            name: "Reply and stop",
            description: "End with a short reply saying what it did.",
          },
        ],
      },
    ],
    loop: [
      {
        title: "One pass",
        items: [
          { name: "Think", description: "The model reads the whole context." },
          { name: "Act", description: "It uses one or more tools." },
          {
            name: "Look",
            description: "Each result goes back into the context.",
          },
          {
            name: "Repeat",
            description: "Until the run is done, or a person is needed.",
          },
        ],
      },
    ],
    tools: [
      {
        title: "Read and write",
        items: [
          {
            name: "Read tools",
            description: "Look things up. Their input is a query.",
          },
          {
            name: "Write tools",
            description:
              "Change records. Their input is a command, and the approval mode decides whether each one waits.",
          },
        ],
      },
      {
        title: "Built in",
        items: [
          {
            name: "Open a skill",
            description: "Opens a skill's full text.",
            toolType: "built-in",
          },
          {
            name: "Read a skill's file",
            description: "Reads a reference file a skill names.",
            toolType: "built-in",
          },
          {
            name: "Ask the person",
            description: "The Ask tool: puts a few questions to the person.",
            toolType: "built-in",
          },
        ],
      },
    ],
    "mcp-tools": [
      {
        title: "What they are",
        note: "Each service publishes its own tools. The agent calls them on behalf of the person.",
        items: [
          {
            name: "One action each",
            description:
              "A tool does one thing in one service, such as listing projects.",
            toolType: "mcp",
          },
          {
            name: "Owned by the service",
            description:
              "The team behind a service writes and updates its tools.",
            toolType: "mcp",
          },
          {
            name: "Called as the person",
            description: "The agent can do only what the person could.",
            toolType: "mcp",
          },
        ],
      },
    ],
    "agent-tools": [
      {
        title: "What they are",
        note: "Anything that must come out the same every time is built as a tool, not left to a skill.",
        items: [
          {
            name: "Several calls in one",
            description:
              "Combine MCP tools, such as finding a project and adding an expense to it.",
            toolType: "agent",
          },
          {
            name: "Our own checks",
            description:
              "Catch mistakes, such as recording the same cost twice.",
            toolType: "agent",
          },
          {
            name: "Fewer steps",
            description:
              "One call instead of many, so there's less to get wrong.",
            toolType: "agent",
          },
        ],
      },
    ],
    ask: [
      {
        title: "How it asks",
        items: [
          {
            name: "A few questions at once",
            description: "Each with options and the one the agent recommends.",
          },
          {
            name: "Only when someone is waiting",
            description:
              "With no one in the conversation, the agent leaves the fact out and names it at the end.",
          },
          {
            name: "Pauses the run",
            description:
              "Exactly the way an approval does, until the person answers.",
          },
        ],
      },
    ],
    approvals: [
      {
        title: "When a write waits",
        items: [
          {
            name: "In a conversation",
            description: "Writes wait as the approval mode says.",
          },
          {
            name: "No one waiting",
            description:
              "Writes that don't always ask run straight away, and the final reply says what was done.",
          },
        ],
      },
    ],
    "approval-modes": [
      {
        title: "Three modes",
        note: "Sending anything outside the firm, finalizing invoices, moving money, changing access and deleting always ask, whatever the mode.",
        items: [
          { name: "Manual", description: "Asks before every write." },
          {
            name: "Auto",
            description: "Runs writes that stay in the firm and can be undone.",
          },
          {
            name: "Plan",
            description: "Works out the whole run, then asks once.",
          },
        ],
      },
    ],
    guardrails: [
      {
        title: "Content checks",
        note: "On every message in and every reply out.",
        items: [
          {
            name: "Harmful messages",
            description: "Hateful, abusive or inappropriate text is blocked.",
          },
          {
            name: "Hidden orders",
            description: "Text that tries to command the agent is refused.",
          },
          {
            name: "Private details",
            description: "Personal information is masked.",
          },
          {
            name: "Off-limits topics",
            description: "Subjects the agent won't discuss.",
          },
        ],
      },
      {
        title: "Run limits",
        items: [
          {
            name: "Repeat stop",
            description:
              "The same tool with the same input three times in a row is refused.",
          },
          {
            name: "Budgets",
            description:
              "Each run has limits on model calls, tool calls, size and time.",
          },
          {
            name: "Rate limits",
            description: "Caps on runs per person and per firm each day.",
          },
        ],
      },
    ],
  },
})
