import { createRouter } from "@tanstack/react-router"

import { queryClient } from "@/app/query-client"
import { routeTree } from "@/app/route-tree.gen"

export const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: "intent",
})

declare module "@tanstack/react-router" {
  // Module augmentation requires an interface.
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Register {
    router: typeof router
  }
}
