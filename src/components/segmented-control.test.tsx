import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { describe, expect, it } from "vitest"

import { SegmentedControl } from "@/components/segmented-control"

const OPTIONS = [
  { value: "all", label: "All" },
  { value: "ready", label: "Ready" },
] as const

function StatusPicker() {
  const [status, setStatus] = useState<"all" | "ready">("all")
  return (
    <SegmentedControl
      label="Status"
      value={status}
      options={OPTIONS}
      onValueChange={setStatus}
    />
  )
}

describe("SegmentedControl", () => {
  it("selects the option a person presses", async () => {
    const user = userEvent.setup()
    render(<StatusPicker />)

    await user.click(screen.getByRole("button", { name: "Ready" }))

    expect(screen.getByRole("button", { name: "Ready" })).toHaveAttribute(
      "aria-pressed",
      "true"
    )
    expect(screen.getByRole("button", { name: "All" })).toHaveAttribute(
      "aria-pressed",
      "false"
    )
  })

  it("keeps the selected option when it is pressed again", async () => {
    const user = userEvent.setup()
    render(<StatusPicker />)

    await user.click(screen.getByRole("button", { name: "All" }))

    expect(screen.getByRole("button", { name: "All" })).toHaveAttribute(
      "aria-pressed",
      "true"
    )
  })
})
