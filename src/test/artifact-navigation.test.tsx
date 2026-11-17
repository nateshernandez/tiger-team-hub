import { screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it } from "vitest"

import { renderRoute } from "@/test/render-route"

describe("navigating between artifacts", () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it("leads back to the list from an artifact's breadcrumb", async () => {
    await renderRoute("/agent-works")

    const breadcrumb = await screen.findByRole("navigation", {
      name: "breadcrumb",
    })
    expect(
      within(breadcrumb).getByRole("link", { name: "Artifacts" })
    ).toHaveAttribute("href", "/")
  })

  it("marks the page the reader is on among the artifact's tabs", async () => {
    await renderRoute("/agent-works/glossary")

    const tabs = await screen.findByRole("navigation", {
      name: "How an agent works pages",
    })
    expect(
      within(tabs).getByRole("link", { name: "Glossary" })
    ).toHaveAttribute("aria-current", "page")
    expect(
      within(tabs).getByRole("link", { name: "Works" })
    ).not.toHaveAttribute("aria-current")
  })

  it("returns to the list with the search the reader left it with", async () => {
    const user = userEvent.setup()
    await renderRoute("/?q=agent")

    await user.click(
      await screen.findByRole("link", { name: /How an agent works/ })
    )
    await user.click(await screen.findByRole("link", { name: "Artifacts" }))

    expect(
      await screen.findByRole("searchbox", { name: "Search artifacts" })
    ).toHaveValue("agent")
  })
})
