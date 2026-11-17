import { describe, expect, it } from "vitest"

import { type Artifact } from "@/features/hub/config/artifacts"
import { filterArtifacts } from "@/features/hub/lib/filter-artifacts"

const ARTIFACTS: Artifact[] = [
  {
    title: "How an agent works",
    summary: "The parts of the agent and what it sees.",
    status: "ready",
    to: "/agent-works",
    updatedOn: "2026-11-16",
  },
  {
    title: "Approval modes",
    summary: "When a write waits for a person.",
    status: "draft",
    to: "/approval-modes",
    updatedOn: "2026-11-20",
  },
  {
    title: "Tool catalog",
    summary: "Every MCP tool and agent tool the agent holds.",
    status: "ready",
    to: "/tool-catalog",
    updatedOn: "2026-10-02",
  },
]

function titles(artifacts: Artifact[]): string[] {
  return artifacts.map((artifact) => artifact.title)
}

describe("filterArtifacts", () => {
  it("lists everything, newest first, with no query or filter", () => {
    expect(
      titles(filterArtifacts(ARTIFACTS, { query: "", status: "all" }))
    ).toEqual(["Approval modes", "How an agent works", "Tool catalog"])
  })

  it("matches the query against the summary as well as the title", () => {
    expect(
      titles(filterArtifacts(ARTIFACTS, { query: "person", status: "all" }))
    ).toEqual(["Approval modes"])
  })

  it("needs every word of the query, in any order and any case", () => {
    expect(
      titles(filterArtifacts(ARTIFACTS, { query: "TOOL mcp", status: "all" }))
    ).toEqual(["Tool catalog"])
    expect(
      filterArtifacts(ARTIFACTS, { query: "tool person", status: "all" })
    ).toEqual([])
  })

  it("keeps only artifacts with the chosen status", () => {
    expect(
      titles(filterArtifacts(ARTIFACTS, { query: "", status: "ready" }))
    ).toEqual(["How an agent works", "Tool catalog"])
  })

  it("applies the query and the status together", () => {
    expect(
      titles(filterArtifacts(ARTIFACTS, { query: "agent", status: "draft" }))
    ).toEqual([])
  })
})
