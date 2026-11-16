import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { ThemeProvider, useTheme } from "@/components/theme-provider"

function ThemeProbe() {
  const { theme, setTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={() => {
        setTheme("dark")
      }}
    >
      {theme}
    </button>
  )
}

function renderWithTheme() {
  return render(
    <ThemeProvider shouldDisableTransitionOnChange={false}>
      <ThemeProbe />
    </ThemeProvider>
  )
}

describe("ThemeProvider", () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.className = ""
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }))
    )
  })

  it("resolves the system theme on the root element", () => {
    renderWithTheme()

    expect(screen.getByRole("button")).toHaveTextContent("system")
    expect(document.documentElement).toHaveClass("light")
  })

  it("persists a theme chosen through setTheme", async () => {
    renderWithTheme()

    await userEvent.click(screen.getByRole("button"))

    expect(screen.getByRole("button")).toHaveTextContent("dark")
    expect(document.documentElement).toHaveClass("dark")
    expect(localStorage.getItem("theme")).toBe("dark")
  })

  it("toggles between light and dark with the d key", async () => {
    renderWithTheme()

    await userEvent.keyboard("d")

    expect(document.documentElement).toHaveClass("dark")
  })
})
