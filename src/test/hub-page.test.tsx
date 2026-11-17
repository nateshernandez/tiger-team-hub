import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { renderRoute } from "@/test/render-route"

describe("Artifacts page", () => {
  it("links each artifact to where it lives, with its status and date", async () => {
    await renderRoute("/")

    const link = await screen.findByRole("link", {
      name: /How an agent works/,
    })
    expect(link).toHaveAttribute("href", "/agent-works")
    expect(link).toHaveTextContent("Ready")
    expect(link).toHaveTextContent("Updated 16 Nov 2026")
  })

  it("narrows the list as the reader types a search", async () => {
    const user = userEvent.setup()
    await renderRoute("/")

    await user.type(
      await screen.findByRole("searchbox", { name: "Search artifacts" }),
      "nothing like this"
    )

    expect(screen.getByText("No artifacts match")).toBeInTheDocument()
    expect(screen.getByText("0 artifacts")).toBeInTheDocument()
  })

  it("filters by status and clears back to everything", async () => {
    const user = userEvent.setup()
    await renderRoute("/")

    await user.click(await screen.findByRole("button", { name: "Draft" }))
    expect(screen.getByText("No artifacts match")).toBeInTheDocument()

    await user.click(
      screen.getByRole("button", { name: "Clear search and filters" })
    )
    expect(
      screen.getByRole("link", { name: /How an agent works/ })
    ).toBeInTheDocument()
  })
})
