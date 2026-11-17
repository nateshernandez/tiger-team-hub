import { screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { renderRoute } from "@/test/render-route"

function details() {
  return screen.getByRole("complementary", { name: "Details" })
}

describe("Works view", () => {
  it("keys the step colors by who does each step", async () => {
    await renderRoute("/agent-works")

    const key = await screen.findByRole("list", { name: "Who does each step" })
    expect(key).toHaveTextContent("The model decides")
    expect(key).toHaveTextContent("The agent's code")
  })

  it("lists the loop's steps in order before anything is selected", async () => {
    await renderRoute("/agent-works")

    const stepList = await within(details()).findByRole("list", {
      name: "The loop, step by step",
    })
    const steps = within(stepList).getAllByRole("listitem")
    expect(steps[0]).toHaveTextContent("Build the request")
    expect(steps[1]).toHaveTextContent("Model decides")
  })

  it("explains a step, and who does it, when it is selected", async () => {
    const user = userEvent.setup()
    await renderRoute("/agent-works")

    await user.click(
      await screen.findByRole("button", {
        name: "Step 2, Model decides: show what happens",
      })
    )

    expect(
      within(details()).getByText("Step 2 of the agent loop")
    ).toBeInTheDocument()
    expect(within(details()).getByText("The model decides")).toBeInTheDocument()
    expect(within(details()).getByText("Example")).toBeInTheDocument()
  })

  it("shows a term's definition and the step it belongs to", async () => {
    const user = userEvent.setup()
    await renderRoute("/agent-works")

    await user.click(
      await screen.findByRole("button", { name: "Memory: show what it is" })
    )

    expect(
      within(details()).getByText(/every message, tool call and result so far/)
    ).toBeInTheDocument()
    expect(
      within(details()).getByRole("button", {
        name: "step 1, Build the request",
      })
    ).toBeInTheDocument()
  })

  it("marks MCP tools and agent tools differently in the tool details", async () => {
    const user = userEvent.setup()
    await renderRoute("/agent-works?term=agent-tools")

    await screen.findByRole("complementary", { name: "Details" })
    expect(within(details()).getAllByText("Agent tool").length).toBeGreaterThan(
      0
    )
    expect(within(details()).queryByText("MCP tool")).not.toBeInTheDocument()

    await user.click(
      screen.getByRole("button", { name: "MCP tools: show what it is" })
    )
    expect(within(details()).getAllByText("MCP tool").length).toBeGreaterThan(0)
  })

  it("goes back to the start with Reset view", async () => {
    const user = userEvent.setup()
    await renderRoute("/agent-works?node=check")

    await screen.findByText("Step 3 of the agent loop")
    await user.click(screen.getByRole("button", { name: "Reset view" }))

    expect(
      await screen.findByRole("heading", { name: "The loop, step by step" })
    ).toBeInTheDocument()
  })

  it("goes back to the start with Escape", async () => {
    const user = userEvent.setup()
    await renderRoute("/agent-works?term=memory")

    await screen.findByText(/every message, tool call and result so far/)
    await user.keyboard("{Escape}")

    expect(
      await screen.findByRole("heading", { name: "The loop, step by step" })
    ).toBeInTheDocument()
  })

  it("shows the key inside the diagram", async () => {
    await renderRoute("/agent-works")

    const diagram = await screen.findByRole("figure", {
      name: /How an agent works/,
    })
    expect(
      within(diagram).getByText("The loop goes around again")
    ).toBeInTheDocument()
  })
})
