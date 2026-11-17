import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import {
  createMemoryHistory,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router"
import { render, type RenderResult } from "@testing-library/react"

import { routeTree } from "@/app/route-tree.gen"
import { ThemeProvider } from "@/components/theme-provider"

// Renders the real app at a URL, the way a reader arrives at it.
export async function renderRoute(url: string): Promise<RenderResult> {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  const router = createRouter({
    routeTree,
    context: { queryClient },
    history: createMemoryHistory({ initialEntries: [url] }),
  })
  await router.load()

  return render(
    <ThemeProvider shouldDisableTransitionOnChange={false}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ThemeProvider>
  )
}
