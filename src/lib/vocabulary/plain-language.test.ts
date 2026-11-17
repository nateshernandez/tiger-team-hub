import { describe, expect, it } from "vitest"

import { findDefinitionProblems } from "@/lib/vocabulary/plain-language"

describe("findDefinitionProblems", () => {
  it("accepts one short plain sentence", () => {
    expect(
      findDefinitionProblems(
        "What starts the agent: a person's message, or something happening.",
        "Trigger"
      )
    ).toEqual([])
  })

  it("rejects a definition over 20 words", () => {
    const definition =
      "One two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty twentyone."

    expect(findDefinitionProblems(definition, "Count")).toContain(
      "has 21 words; keep it to 20 or fewer"
    )
  })

  it("rejects more than one sentence", () => {
    expect(
      findDefinitionProblems("Guides for a job. The agent opens one.", "Skills")
    ).toContain("has more than one sentence")
  })

  it("rejects a sentence without a full stop", () => {
    expect(findDefinitionProblems("Guides for a job", "Skills")).toContain(
      "must end with a full stop"
    )
  })

  it("rejects a definition that starts with its own term", () => {
    expect(
      findDefinitionProblems("Tools are things the agent uses.", "Tools")
    ).toContain("starts with its own term, so it explains nothing")
  })

  it("rejects jargon a non-technical reader would not know", () => {
    expect(
      findDefinitionProblems("Calls a service's API to fetch data.", "Fetch")
    ).toContain('uses jargon: "API"')
  })

  it("rejects analogies", () => {
    expect(
      findDefinitionProblems("Think of it as a new hire's handbook.", "Prompt")
    ).toContain('uses an analogy ("think of"); say what it is instead')
  })

  it("counts linked terms by the words a reader sees", () => {
    expect(
      findDefinitionProblems("Everything the {model} can see.", "Context")
    ).toEqual([])
  })
})
