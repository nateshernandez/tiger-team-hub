import "./index.css"

import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import { Providers } from "@/app/providers"

const rootElement = document.querySelector("#root")

if (!rootElement) {
  throw new Error("Missing #root element in index.html")
}

createRoot(rootElement).render(
  <StrictMode>
    <Providers />
  </StrictMode>
)
