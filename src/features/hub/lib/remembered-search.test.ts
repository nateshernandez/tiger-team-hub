import { beforeEach, describe, expect, it } from "vitest"

import {
  recallSearch,
  rememberSearch,
} from "@/features/hub/lib/remembered-search"

describe("remembered search", () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it("recalls the search and filter the reader left", () => {
    rememberSearch({ q: "agent", status: "draft" })

    expect(recallSearch()).toEqual({ q: "agent", status: "draft" })
  })

  it("forgets the search once it is cleared back to the default", () => {
    rememberSearch({ q: "agent", status: "draft" })
    rememberSearch({ status: "all" })

    expect(recallSearch()).toBeUndefined()
  })

  it("ignores a stored value it can't read", () => {
    sessionStorage.setItem("hub:last-search", "{not json")

    expect(recallSearch()).toBeUndefined()
  })
})
