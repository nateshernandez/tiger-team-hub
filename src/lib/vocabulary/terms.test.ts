import { describe, expect, it } from "vitest"

import { TERM_IDS, vocabularySchema } from "@/lib/vocabulary/term-schema"
import { getTerm, TERMS } from "@/lib/vocabulary/terms"

const VALID_TERM = {
  id: "trigger",
  label: "Trigger",
  role: "input",
  definition: "What starts the agent.",
} as const

describe("TERMS", () => {
  it("defines every term id exactly once", () => {
    expect(TERMS.map((term) => term.id).toSorted()).toEqual(
      [...TERM_IDS].toSorted()
    )
  })

  it("keeps MCP tools and agent tools as separate terms", () => {
    expect(getTerm("mcp-tools").label).toBe("MCP tools")
    expect(getTerm("agent-tools").label).toBe("Agent tools")
  })

  it("calls the pause-and-ask tool Ask", () => {
    expect(getTerm("ask").label).toBe("Ask")
  })
})

describe("vocabularySchema", () => {
  it("rejects a vocabulary that leaves a term undefined", () => {
    const result = vocabularySchema.safeParse([VALID_TERM])

    expect(result.success).toBe(false)
    expect(result.error?.issues.map((issue) => issue.message)).toContain(
      'Term "prompt" has no definition'
    )
  })

  it("rejects a definition that links to an unknown term", () => {
    const entries = TERMS.map((term) =>
      term.id === "trigger"
        ? { ...term, definition: "What wakes the {robot}." }
        : term
    )

    const messages = vocabularySchema
      .safeParse(entries)
      .error?.issues.map((issue) => issue.message)

    expect(messages).toContain(
      'Trigger: definition links to unknown term "robot"'
    )
  })

  it("rejects a definition that breaks the plain-language rules", () => {
    const entries = TERMS.map((term) =>
      term.id === "model"
        ? { ...term, definition: "The LLM. It decides." }
        : term
    )

    const messages = vocabularySchema
      .safeParse(entries)
      .error?.issues.map((issue) => issue.message)

    expect(messages).toEqual(
      expect.arrayContaining([
        "Model: definition has more than one sentence",
        'Model: definition uses jargon: "LLM"',
      ])
    )
  })
})
