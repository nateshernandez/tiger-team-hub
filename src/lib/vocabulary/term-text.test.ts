import { describe, expect, it } from "vitest"

import {
  countWords,
  parseTermText,
  referencedTermIds,
  toPlainText,
} from "@/lib/vocabulary/term-text"

describe("parseTermText", () => {
  it("returns plain text as one text segment", () => {
    expect(parseTermText("No links here.")).toEqual([
      { type: "text", text: "No links here." },
    ])
  })

  it("splits out a term reference shown by its id", () => {
    expect(parseTermText("Read the {prompt} first.")).toEqual([
      { type: "text", text: "Read the " },
      { type: "term", termId: "prompt", text: "prompt" },
      { type: "text", text: " first." },
    ])
  })

  it("shows a term reference with its own wording after a pipe", () => {
    expect(parseTermText("Use a {tools|tool}.")).toEqual([
      { type: "text", text: "Use a " },
      { type: "term", termId: "tools", text: "tool" },
      { type: "text", text: "." },
    ])
  })

  it("shows a hyphenated id as words when no wording is given", () => {
    expect(parseTermText("{mcp-tools}")).toEqual([
      { type: "term", termId: "mcp-tools", text: "mcp tools" },
    ])
  })
})

describe("toPlainText", () => {
  it("replaces each reference with the words a reader sees", () => {
    expect(
      toPlainText("Several {mcp-tools|MCP tools} in one {tools|tool}")
    ).toBe("Several MCP tools in one tool")
  })
})

describe("referencedTermIds", () => {
  it("lists each referenced term once, in order", () => {
    expect(referencedTermIds("{model} reads {context}, then {model}")).toEqual([
      "model",
      "context",
    ])
  })
})

describe("countWords", () => {
  it("counts the words a reader sees, not the markup", () => {
    expect(countWords("Use a {tools|tool}, then stop.")).toBe(5)
  })

  it("counts a hyphenated word once", () => {
    expect(countWords("Step-by-step guides")).toBe(2)
  })
})
