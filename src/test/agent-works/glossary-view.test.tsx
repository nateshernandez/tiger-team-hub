import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { toPlainText } from "@/lib/vocabulary/term-text"
import { TERMS } from "@/lib/vocabulary/terms"
import { renderRoute } from "@/test/render-route"

describe("Glossary view", () => {
  it("lists every term with the same definition the diagram uses", async () => {
    await renderRoute("/agent-works/glossary")

    await screen.findByRole("heading", { name: "Inputs" })
    for (const term of TERMS) {
      const definitions = screen.getAllByText(
        (_, element) =>
          element?.tagName === "P" &&
          element.textContent === toPlainText(term.definition)
      )
      expect(definitions.length, term.label).toBeGreaterThan(0)
    }
  })

  it("opens a linked term's definition in place", async () => {
    const user = userEvent.setup()
    await renderRoute("/agent-works/glossary")

    const [promptLink] = await screen.findAllByRole("button", {
      name: "prompt",
    })
    if (!promptLink) {
      throw new Error("Expected a linked mention of the prompt")
    }
    await user.click(promptLink)

    expect(await screen.findByRole("dialog")).toHaveTextContent(
      /Instructions the agent reads before every run/
    )
  })
})
