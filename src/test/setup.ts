import "@testing-library/jest-dom/vitest"

import { cleanup } from "@testing-library/react"
import { afterEach, vi } from "vitest"

afterEach(() => {
  cleanup()
  // The artifact list remembers its search per session; tests start fresh.
  sessionStorage.clear()
})

// React Flow measures its container; jsdom has no layout engine, so these
// stand in for the browser APIs it reads (reactflow.dev, "Testing").
class ResizeObserverStub {
  observe(): void {
    // jsdom never resizes, so there is nothing to report.
  }
  unobserve(): void {
    // Nothing is being observed.
  }
  disconnect(): void {
    // Nothing is being observed.
  }
}

// A partial stand-in: React Flow reads only the vertical scale, m22.
class DOMMatrixReadOnlyStub {
  m22: number
  constructor(transform?: string) {
    const scale = /scale\(([\d.]+)\)/.exec(transform ?? "")?.[1]
    this.m22 = scale === undefined ? 1 : Number(scale)
  }
}

vi.stubGlobal("ResizeObserver", ResizeObserverStub)
vi.stubGlobal("DOMMatrixReadOnly", DOMMatrixReadOnlyStub)

Object.defineProperties(HTMLElement.prototype, {
  offsetHeight: {
    configurable: true,
    get(this: HTMLElement) {
      return Number.parseFloat(this.style.height) || 1
    },
  },
  offsetWidth: {
    configurable: true,
    get(this: HTMLElement) {
      return Number.parseFloat(this.style.width) || 1
    },
  },
})

// The router restores scroll on navigation; jsdom can't scroll.
vi.stubGlobal("scrollTo", vi.fn())

Object.defineProperty(Element.prototype, "scrollIntoView", {
  configurable: true,
  value: () => {
    // jsdom doesn't scroll.
  },
})

// jsdom has no media queries; tests that care stub their own.
vi.stubGlobal(
  "matchMedia",
  vi.fn((query: string) => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }))
)
